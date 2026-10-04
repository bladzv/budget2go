import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const titles = { overview:'Overview', budget:'Budget', accounts:'Accounts', loans:'Loans', settings:'Settings' };
async function navigate(page, view) {
  await page.locator('.nav-item[data-view="' + view + '"]').click();
  await expect(page.locator('#view-title')).toHaveText(titles[view]);
  await expect(page.locator('#view-' + view)).toBeVisible();
}
async function add(page, kind, values = {}) {
  const owner = kind === 'salary' || kind === 'savings' ? 'accounts' : kind === 'loans' ? 'loans' : 'budget';
  await navigate(page, owner);
  const buttons = {salary:'btn-add-salary', savings:'btn-add-savings', budget:'btn-add-budget', loans:'btn-add-loan'};
  await page.click('#' + buttons[kind]);
  const name = kind === 'salary' ? 'source' : kind === 'savings' ? 'location' : 'name';
  await page.fill('#entry-' + name, values[name] || 'Test entry');
  for (const [field, value] of Object.entries(values)) {
    const input = page.locator('#entry-' + field);
    if (field === 'frequency') await input.selectOption(value);
    else if (field === 'recurring') await input.setChecked(value);
    else await input.fill(String(value));
  }
  await page.click('#entry-submit');
  await expect(page.locator('#entry-modal')).toBeHidden();
}
async function selectMonth(page, key) {
  await page.click('#month-picker-button');
  await page.fill('#picker-year', String(Number(key.slice(0,4))));
  await page.locator('#picker-year').press('Tab');
  await page.locator(`[data-pick-month="${key}"]`).click();
  await expect(page.locator('#month-picker-button')).toHaveAttribute('data-month', key);
}
async function nextMonth(page) {
  return page.evaluate(() => {
    const S = window.App.state;
    const original = S.activeMonth();
    const next = new Date(original + '-01T12:00:00');
    next.setMonth(next.getMonth() + 1);
    S.rollover(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    window.App.render.all();
    return original;
  });
}

test('checked-in page works directly from disk and retains its draft', async ({ page }) => {
  await page.goto(pathToFileURL(resolve(process.cwd(), 'index.html')).href);
  await page.click('#btn-welcome-start');
  await expect(page.locator('.brand-icon img')).toBeVisible();
  await expect.poll(() => page.locator('.brand-icon img').evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('i[data-lucide]')).toHaveCount(0);
  await add(page, 'salary', {source:'Local file', amount:1234});
  await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'saved');
  await page.reload();
  await expect(page.locator('#salary-body .entry-name')).toContainText('Local file');
  await expect(page.locator('#salary-body [data-field="amount"]')).toHaveValue('1,234');
  await page.locator('#salary-body [data-open-calculator]').click();
  await page.keyboard.type('1000+235');
  await expect(page.locator('#btn-calc-apply')).toHaveText('Use ₱ 1,235.00');
  await page.click('#btn-calc-apply');
  await expect(page.locator('#salary-body [data-field="amount"]')).toHaveValue('1,235');
  await page.click('#btn-header-import'); await page.check('#export-wipe');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export-json')]);
  const doc = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(doc.months[doc.viewedMonth].salary[0].amount).toBe(1235);
  await page.click('#btn-export-wipe-confirm');
  await expect(page.locator('#export-modal')).toBeHidden();
  await expect(page.locator('.toast-success .toast-msg')).toContainText('All local data wiped');
  await page.reload(); await expect(page.locator('#welcome-modal')).toBeHidden();
  expect(await page.evaluate(() => App.state.hasData())).toBe(false);
});

test.describe('Budget2Go redesign', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-welcome-start');
    await expect(page.locator('#view-overview')).toBeVisible();
  });

  test('opens to overview and exposes five focused views', async ({ page }) => {
    await expect(page.locator('#overview-welcome')).toBeVisible();
    await expect(page.locator('.nav-item')).toHaveCount(5);
    await expect(page.locator('#view-budget')).toBeHidden();
    for (const view of ['budget', 'accounts', 'loans', 'settings', 'overview']) {
      await navigate(page, view);
      await expect(page.locator('.nav-item[aria-current="page"]')).toHaveAttribute('data-view', view);
    }
    const keys = await page.evaluate(() => Object.keys(window.App));
    expect(keys).toEqual(expect.arrayContaining(['state', 'ui', 'render', 'events', 'io', 'persistence']));
  });

  test('header offers Import and hides routine save messages', async ({ page }) => {
    await expect(page.locator('#save-status')).toBeHidden();
    await expect(page.locator('.app-header')).not.toContainText('Saved on this device');
    await page.getByRole('button', {name:'Import', exact:true}).click();
    await expect(page.locator('#import-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#btn-header-import')).toBeFocused();
  });

  test('mobile budget rows are compact and use explicit edit controls', async ({ page }) => {
    await page.setViewportSize({width:430,height:932});
    await add(page, 'budget', {name:'Bahay', amount:9200});
    const row = page.locator('#budget-body tr[data-id]');
    expect((await row.boundingBox()).height).toBeLessThanOrEqual(114); // Previously 190px at this viewport.
    await expect(row.locator('.entry-name')).not.toHaveAttribute('data-edit');
    await row.locator('.entry-name').click();
    await expect(page.locator('#entry-modal')).toBeHidden();
    await expect(row.locator('.currency-prefix')).toHaveText('₱');
    expect(await row.locator('.amount-input').evaluate(el => getComputedStyle(el).textAlign)).toBe('right');
    const edit = row.getByRole('button', {name:'Edit Bahay', exact:true});
    const trash = row.getByRole('button', {name:'Remove budget item', exact:true});
    const editBox = await edit.boundingBox(), trashBox = await trash.boundingBox();
    expect(editBox.y).toBe(trashBox.y);
    expect(editBox.x + editBox.width).toBeLessThanOrEqual(trashBox.x);
    await edit.click();
    await expect(page.locator('#entry-name')).toHaveValue('Bahay');
    await page.fill('#entry-name','Home');
    await page.click('#entry-submit');
    await expect(row.locator('.entry-name')).toHaveText('Home');
    await navigate(page, 'settings');
    page.once('dialog', d => d.accept());
    await page.selectOption('#currency-select','USD|en-US');
    await navigate(page,'budget');
    await expect(row.locator('.currency-prefix')).toHaveText('$');
    const historical = await nextMonth(page);
    await selectMonth(page, historical);
    await expect(row.getByRole('button',{name:'Edit Home',exact:true})).toBeEnabled();
  });

  test('header switches to Export when data exists in any month and back after wipe', async ({ page }) => {
    await add(page,'budget',{name:'Data', amount:1000});
    await expect(page.locator('#btn-header-import')).toHaveText('Export');
    await page.click('#btn-header-import');
    await expect(page.locator('#export-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.click('[data-month-shift="1"]');
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(0);
    await expect(page.locator('#btn-header-import')).toHaveText('Export');
    await navigate(page,'settings');
    page.once('dialog', d => d.accept());
    await page.click('#btn-wipe-data');
    await expect(page.locator('#btn-header-import')).toHaveText('Import');
  });

  test('grouping applies to amounts and summaries and the setting persists', async ({ page }) => {
    await add(page,'salary',{source:'Work',amount:115000.5});
    await expect(page.locator('#salary-body .amount-input')).toHaveValue('115,000.5');
    await expect(page.locator('#sum-income')).toContainText('115,000.50');
    await navigate(page,'settings');
    await page.uncheck('#grouping-toggle');
    await expect(page.locator('#sum-income')).toContainText('115000.50');
    await expect(page.locator('#salary-body .amount-input')).toHaveValue('115000.5');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.reload();
    await expect(page.locator('#grouping-toggle')).not.toBeChecked();
    await expect(page.locator('#salary-body .amount-input')).toHaveValue('115000.5');
    await page.check('#grouping-toggle');
    await navigate(page,'accounts');
    await page.locator('#salary-body .amount-input').fill('120,000.25');
    await page.locator('#salary-body .amount-input').press('Enter');
    expect(await page.evaluate(() => App.state.get().salary[0].amount)).toBe(120000.25);
  });

  test('localized decimal and group separators remain editable without changing numeric backups', async ({ page }) => {
    await navigate(page,'settings');
    await page.selectOption('#currency-select','EUR|de-DE');
    await add(page,'savings',{location:'Account',amount:'12.345,67'});
    const input = page.locator('#savings-body .amount-input');
    await expect(input).toHaveValue('12.345,67');
    await input.fill('1.234,5'); await input.press('Enter');
    expect(await page.evaluate(() => App.state.getDocument().months[App.state.viewedMonth()].savings[0].amount)).toBe(1234.5);
    await navigate(page,'settings');
    await page.uncheck('#grouping-toggle');
    await expect(input).toHaveValue('1234,5');
  });

  test('loan steppers stage form edits and update only starting progress on cards', async ({ page }) => {
    await add(page,'loans',{name:'Loan',total:10000,paymentAmount:1000,monthsPaid:2});
    await page.click('[data-action="loan-to-budget"]');
    await navigate(page,'budget'); await page.locator('#budget-body .paid-check').check();
    await navigate(page,'loans');
    const group = page.locator('[data-loan-stepper]');
    await group.locator('[data-step="1"]').click();
    await expect(group.locator('.step-val')).toHaveValue('3');
    await expect(group.locator('.step-val')).toHaveClass(/bump/);
    await expect(page.locator('[data-loan-remaining]')).toContainText('6,000');
    expect(await page.evaluate(() => App.state.get().loans[0].payments.length)).toBe(1);
    await page.click('#loans-body .loan-actions [data-edit]');
    await page.locator('#entry-fields [data-step="1"]').click();
    await expect(page.locator('#entry-monthsPaid')).toHaveValue('4');
    await page.keyboard.press('Escape');
    await expect(group.locator('.step-val')).toHaveValue('3');
    await group.locator('.step-val').fill('0'); await group.locator('.step-val').press('Tab');
    await expect(group.locator('[data-step="-1"]')).toBeDisabled();
    await expect(page.locator('[data-loan-remaining]')).toContainText('9,000');
    await group.locator('[data-step="1"]').click();
    await expect(group.locator('.step-val')).toHaveValue('1');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.reload();
    await expect(group.locator('.step-val')).toHaveValue('1');
  });

  test('budget column positions remain stable across paid, unpaid and empty filters', async ({ page }) => {
    await page.setViewportSize({width:1293,height:977});
    await add(page,'budget',{name:'A very long paid item name that should not resize the amount column',amount:12345,recurring:true});
    await page.locator('#budget-body .paid-check').check();
    await add(page,'budget',{name:'Short',amount:10});
    const headers = page.locator('.table-budget th');
    const geometry = () => headers.evaluateAll(elements => elements.map(el => {
      const {x,width} = el.getBoundingClientRect();
      return {x,width};
    }));
    const original = await geometry();
    for (const filter of ['unpaid','paid','all']) {
      await page.locator(`[data-filter="${filter}"]`).click();
      expect(await geometry()).toEqual(original);
      const input = page.locator('#budget-body .amount-input').first();
      expect((await input.boundingBox()).x).toBeCloseTo(original[2].x + 20);
    }
    await page.locator('[data-filter="unpaid"]').click();
    await page.locator('#budget-body .paid-check').click();
    await expect(page.locator('#budget-body .empty-row')).toBeVisible();
    expect(await geometry()).toEqual(original);
  });

  test('loan cards cap typed and stepped months at the payoff duration and persist the cap', async ({ page }) => {
    await add(page,'loans',{name:'GGives',total:102600,paymentAmount:5700,monthsPaid:17});
    const group = page.locator('[data-loan-stepper]');
    const input = group.locator('.step-val');
    const increase = group.getByRole('button',{name:'Increase months paid'});
    await expect(input).toHaveAttribute('max','18');
    await increase.click();
    await expect(input).toHaveValue('18');
    await expect(increase).toBeDisabled();
    await expect(page.locator('[data-loan-remaining]')).toContainText('0.00');
    await group.getByRole('button',{name:'Decrease months paid'}).click();
    await expect(increase).toBeEnabled();
    await input.fill('999'); await input.press('Tab');
    await expect(input).toHaveValue('18');
    await expect(increase).toBeDisabled();
    expect(await page.evaluate(() => App.state.get().loans[0].paidPeriods)).toBe(18);
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.reload();
    await expect(input).toHaveValue('18');
    await expect(increase).toBeDisabled();
  });

  test('loan form caps starting months and recalculates the limit when terms change', async ({ page }) => {
    await navigate(page,'loans'); await page.click('#btn-add-loan');
    const input = page.locator('#entry-monthsPaid');
    const increase = page.locator('#entry-fields [data-step="1"]');
    await expect(input).toHaveAttribute('max','0');
    await expect(increase).toBeDisabled();
    await page.fill('#entry-name','New loan');
    await page.fill('#entry-total','10000');
    await page.fill('#entry-paymentAmount','3000');
    await expect(input).toHaveAttribute('max','4');
    await input.fill('50');
    await expect(input).toHaveValue('4');
    await expect(increase).toBeDisabled();
    await page.fill('#entry-paymentAmount','2000');
    await expect(input).toHaveAttribute('max','5');
    await expect(increase).toBeEnabled();
    await increase.click();
    await expect(input).toHaveValue('5');
    await page.selectOption('#entry-frequency','weekly');
    await expect(input).toHaveAccessibleName('Weeks paid');
    await expect(input).toHaveAttribute('max','5');
    await expect(input).toHaveValue('5');
    await page.fill('#entry-paymentAmount','6000');
    await expect(input).toHaveAttribute('max','2');
    await expect(input).toHaveValue('2');
    await page.click('#entry-submit');
    await expect(page.locator('[data-loan-stepper] .step-val')).toHaveValue('2');
    await page.click('#loans-body .loan-actions [data-edit]');
    await page.selectOption('#entry-frequency','monthly');
    await page.fill('#entry-paymentAmount','2000');
    await input.fill('5');
    await page.fill('#entry-total','2000');
    await expect(input).toHaveAttribute('max','1');
    await expect(input).toHaveValue('1');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-loan-stepper] .step-val')).toHaveValue('2');
    await page.click('#loans-body .loan-actions [data-edit]');
    await page.fill('#entry-paymentAmount','0');
    await expect(input).toHaveAttribute('max','0');
    await expect(input).toHaveValue('0');
    await expect(increase).toBeDisabled();
    await page.click('#entry-submit');
    await expect(page.locator('[data-loan-stepper] .step-val')).toHaveValue('0');
  });

  test('loan payoff caps count repayment periods and allow a final partial period', async ({ page }) => {
    for (const [name,total,paymentAmount,frequency,max] of [
      ['Monthly',102600,5700,'monthly',18],
      ['Bi-weekly',102600,5700,'bi-weekly',18],
      ['Weekly',102600,5700,'weekly',18],
      ['Partial final month',10000,3000,'monthly',4],
      ['Exact decimal payoff',300.3,100.1,'monthly',3],
      ['Zero principal',0,100,'monthly',0],
    ]) {
      await add(page,'loans',{name,total,paymentAmount,frequency,monthsPaid:999});
      const card = page.locator('.loan-card').filter({hasText:name}).last();
      await expect(card.locator('.step-val')).toHaveAttribute('max',String(max));
      await expect(card.locator('.step-val')).toHaveValue(String(max));
      await expect(card.locator('[data-step="1"]')).toBeDisabled();
    }
  });

  test('loan labels and starting payments follow the repayment frequency', async ({ page }) => {
    for (const [frequency,label] of [['monthly','Months paid'],['bi-weekly','Biweekly periods paid'],['weekly','Weeks paid']]) {
      await add(page,'loans',{name:frequency,total:10000,paymentAmount:1000,frequency,monthsPaid:1});
      const card = page.locator('.loan-card').last();
      await expect(card.locator('.loan-starting > .entry-subtitle')).toHaveText(label);
      await expect(card.locator('.step-val')).toHaveAccessibleName(label);
      await expect(card.locator('[data-loan-remaining]')).toContainText('9,000');
      await card.getByRole('button',{name:'Increase '+label.toLowerCase()}).click();
      await expect(card.locator('[data-loan-remaining]')).toContainText('8,000');
      await card.locator('.loan-actions [data-edit]').click();
      await expect(page.locator('label[for="entry-monthsPaid"]')).toHaveText(label);
      await page.selectOption('#entry-frequency',frequency === 'weekly' ? 'bi-weekly' : 'weekly');
      await expect(page.locator('#entry-monthsPaid')).toHaveAccessibleName(frequency === 'weekly' ? 'Biweekly periods paid' : 'Weeks paid');
      await page.click('#entry-submit');
      await expect(card.locator('[data-loan-remaining]')).toContainText('8,000');
    }
  });

  test('legacy month-based loan progress retains balances and partial-period credit through backups', async ({ page }) => {
    const result = await page.evaluate(() => {
      const S = App.state, doc = S.getDocument();
      doc.months[doc.viewedMonth].loans = ['weekly','bi-weekly'].map((frequency,index) => ({
        id:'legacy-'+index,name:'Legacy '+frequency,total:10000,frequency,paymentAmount:100,monthsPaid:1,
        budgetEntryId:null,payments:[{id:'history-'+index,date:'2026-01-01',amount:50}],
      }));
      S.loadDocument(doc); App.render.all(); App.ui.goToView('loans');
      return S.get().loans.map(loan => ({periods:loan.paidPeriods,credit:loan.startingCredit,remaining:S.loanStats(loan).remaining}));
    });
    expect(result).toEqual([{periods:4,credit:33.33,remaining:9516.67},{periods:2,credit:16.67,remaining:9733.33}]);
    await page.locator('.loan-card').first().getByRole('button',{name:'Increase weeks paid'}).click();
    await expect(page.locator('.loan-card').first().locator('[data-loan-remaining]')).toContainText('9,416.67');
    await page.locator('.loan-card').first().locator('.loan-actions [data-edit]').click();
    await expect(page.locator('#entry-fields .form-hint').first()).toContainText('33.33');
    await page.keyboard.press('Escape');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.reload();
    await expect(page.locator('.loan-card').first().locator('.step-val')).toHaveValue('5');
    const json = await page.evaluate(async () => {
      const doc = App.state.getDocument();
      return App.io.processFile(new File([JSON.stringify(doc)],'periods.json',{type:'application/json'}));
    });
    const loans = json.months[json.viewedMonth].loans;
    expect(loans[0]).toMatchObject({paidPeriods:5,startingCredit:33.33,monthsPaid:1});
    await page.click('#btn-header-import');
    const [download] = await Promise.all([page.waitForEvent('download'),page.click('#btn-export-csv')]);
    const csv = await readFile(await download.path(),'utf8');
    expect(csv).toContain('paidPeriods,startingCredit');
    const imported = await page.evaluate(async csv => {
      const tables = csv.slice(csv.indexOf('## SALARY'));
      const doc = await App.io.processFile(new File([tables],'periods.csv',{type:'text/csv'}));
      return doc.months[doc.viewedMonth].loans;
    },csv);
    expect(imported[0]).toMatchObject({paidPeriods:5,startingCredit:33.33});
  });

  test('mobile account and loan cards meet the requested height reductions', async ({ page }) => {
    await page.setViewportSize({width:430,height:932});
    await add(page,'salary',{source:'Primary Job',amount:115000});
    await add(page,'savings',{location:'From Jeth',amount:4600});
    expect((await page.locator('#salary-body tr[data-id]').boundingBox()).height).toBeLessThanOrEqual(133);
    expect((await page.locator('#savings-body tr[data-id]').boundingBox()).height).toBeLessThanOrEqual(120);
    await expect(page.locator('#salary-body [data-label="Source"]')).toHaveCount(0);
    await expect(page.locator('#savings-body [data-label="Institution"]')).toHaveCount(0);
    await add(page,'loans',{name:'GGives',total:102600,paymentAmount:5700,monthsPaid:7});
    expect((await page.locator('.loan-card').boundingBox()).height).toBeLessThanOrEqual(194);
    await page.locator('.loan-card .loan-actions [data-edit]').click();
    const inset = await page.locator('#entry-frequency').evaluate(el => {
      const select = el.getBoundingClientRect(), arrow = el.parentElement.querySelector('svg').getBoundingClientRect();
      return select.right - arrow.right;
    });
    expect(inset).toBeGreaterThanOrEqual(13);
  });

  test('import copy describes choosing a file on mobile and dropping on desktop', async ({ page }) => {
    await page.setViewportSize({width:430,height:932});
    await page.click('#btn-header-import');
    await expect(page.locator('#drop-zone-title')).toHaveText('Tap to choose a file');
    await expect(page.locator('#drop-zone')).toHaveAttribute('aria-label','Choose a file to import');
    await page.locator('#file-input').setInputFiles({name:'budget.json',mimeType:'application/json',buffer:Buffer.from('{}')});
    await expect(page.locator('#drop-zone-sub')).not.toContainText('drop');
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:1280,height:900});
    await page.click('#btn-header-import');
    const touch = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    await expect(page.locator('#drop-zone-title')).toContainText(touch ? 'Tap to choose' : 'Drop your file');
  });

  test('navigation supports browser back and direct view links', async ({ page }) => {
    await navigate(page, 'budget');
    await navigate(page, 'accounts');
    await page.goBack();
    await expect(page.locator('#view-budget')).toBeVisible();
    await page.reload();
    await expect(page.locator('#view-budget')).toBeVisible();
  });

  test('cancel and Escape never create unfinished financial entries', async ({ page }) => {
    await page.click('#view-overview [data-add="budget"]');
    await page.fill('#entry-name', 'Unfinished');
    await page.fill('#entry-amount', '100');
    await page.keyboard.press('Escape');
    await expect(page.locator('#entry-modal')).toBeHidden();
    expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
    await expect(page.locator('#view-overview [data-add="budget"]')).toBeFocused();
    await page.click('#view-overview [data-add="budget"]');
    await expect(page.locator('#entry-name')).toHaveValue('');
    await page.click('#entry-form [data-close-entry]');
    expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
  });

  test('forms reject blank names and negative amounts', async ({ page }) => {
    await page.click('#view-overview [data-add="budget"]');
    await page.fill('#entry-name', '   ');
    await page.click('#entry-submit');
    await expect(page.locator('#entry-modal')).toBeVisible();
    await page.fill('#entry-name', 'Rent');
    await page.fill('#entry-amount', '-20');
    await page.click('#entry-submit');
    expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
    await page.fill('#entry-amount', '1200');
    await page.click('#entry-submit');
    await expect(page.locator('#sum-pending')).toContainText('1,200');
    await expect(page.locator('#view-overview')).toBeVisible();
  });

  test('creates income, savings, budget and loan entries through forms', async ({ page }) => {
    await add(page, 'salary', {source:'Salary', amount:5000});
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(1);
    await add(page, 'savings', {location:'Wallet', amount:800});
    await expect(page.locator('#savings-body tr[data-id]')).toHaveCount(1);
    await add(page, 'budget', {name:'Rent', amount:1000});
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(1);
    await add(page, 'loans', {name:'Car', total:10000, paymentAmount:200});
    await expect(page.locator('#loans-body .loan-card')).toHaveCount(1);
    await navigate(page, 'overview');
    await expect(page.locator('#sum-income')).toContainText('5,000');
    await expect(page.locator('#sum-remaining')).toContainText('4,000');
    await expect(page.locator('#sum-savings')).toContainText('800');
    await expect(page.locator('#overview-loans')).toContainText('10,000');
    await expect(page.locator('#overview-welcome')).toBeHidden();
  });

  test('shows frequency-aware monthly income and edits details without data loss', async ({ page }) => {
    await add(page, 'salary', {source:'Weekly work', amount:120, frequency:'weekly'});
    await expect(page.locator('#salary-body [data-monthly-equiv]')).toContainText('520');
    await page.click('#salary-body [data-edit]');
    await page.selectOption('#entry-frequency', 'monthly');
    await page.fill('#entry-source', 'Monthly work');
    await page.click('#entry-submit');
    await expect(page.locator('#salary-body .entry-name')).toContainText('Monthly work');
    await expect(page.locator('#salary-body [data-monthly-equiv]')).toContainText('120');
  });

  test('amount edits commit on Enter or blur and Escape reverts', async ({ page }) => {
    await add(page, 'salary', {amount:1000});
    const input = page.locator('#salary-body [data-field="amount"]');
    await input.fill('5000');
    expect(await page.evaluate(() => App.state.get().salary[0].amount)).toBe(1000);
    await input.press('Escape');
    await expect(input).toHaveValue('1,000');
    await input.fill('5000');
    await input.press('Enter');
    await expect(page.locator('#sum-income')).toContainText('5,000');
    await input.fill('6000');
    await input.blur();
    await expect(page.locator('#sum-income')).toContainText('6,000');
    await input.fill('-1');
    await input.blur();
    await expect(input).toHaveValue('6,000');
    await input.fill('12,34');
    await input.blur();
    await expect(input).toHaveValue('6,000');
    await input.fill('1e3');
    await input.press('Enter');
    expect(await page.evaluate(() => App.state.get().salary[0].amount)).toBe(1000);
  });

  test('draft survives refresh and remains separate from UI state', async ({ page }) => {
    await add(page, 'salary', {source:'Contract work', amount:2500});
    await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'saved');
    await navigate(page, 'budget');
    await page.click('[data-filter="paid"]');
    await page.reload();
    await expect(page.locator('#salary-body .entry-name')).toContainText('Contract work');
    await expect(page.locator('[data-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    const doc = await page.evaluate(() => App.state.getDocument());
    expect(doc.version).toBe(3);
    expect(doc).not.toHaveProperty('view');
    expect(doc).not.toHaveProperty('budgetFilter');
  });

  test('paid filters, overview totals and progress stay consistent', async ({ page }) => {
    await add(page, 'budget', {name:'Rent', amount:100});
    await add(page, 'budget', {name:'Food', amount:200});
    await page.click('[data-filter="unpaid"]');
    await page.locator('#budget-body').getByRole('checkbox', {name:'Mark Rent as paid', exact:true}).click();
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(1);
    await expect(page.locator('[data-filter="unpaid"]')).toBeFocused();
    await page.click('[data-filter="paid"]');
    await expect(page.locator('#budget-body .entry-name')).toHaveText('Rent');
    await navigate(page, 'overview');
    await expect(page.locator('#sum-paid')).toContainText('100');
    await expect(page.locator('#sum-pending')).toContainText('200');
    await expect(page.locator('#payment-progress')).toHaveAttribute('value', /33/);
    await page.locator('#overview-unpaid').getByRole('checkbox', {name:'Mark Food as paid', exact:true}).click();
    await expect(page.locator('#overview-unpaid')).toContainText('All planned items are paid');
    await expect(page.locator('#view-overview [data-view="budget"]')).toBeFocused();
    await page.click('#btn-undo');
    await expect(page.locator('#overview-unpaid .paid-check')).toHaveCount(1);
  });

  test('overview caps unpaid previews at five and shows an overallocated warning', async ({ page }) => {
    await page.evaluate(() => {
      for (let n=0;n<8;n++) App.state.addBudget('Item ' + n, 100);
      App.render.all();
    });
    await expect(page.locator('#overview-unpaid .unpaid-item')).toHaveCount(5);
    await expect(page.locator('#overview-unpaid')).toContainText('3 more unpaid items');
    await expect(page.locator('#allocation-note')).toContainText('exceeds your income');
  });

  test('deletion undo restores an entry', async ({ page }) => {
    await add(page, 'salary', {source:'Restore me', amount:500});
    await page.click('#salary-body [data-action="delete-salary"]');
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(0);
    await page.click('#btn-undo');
    await expect(page.locator('#salary-body .entry-name')).toContainText('Restore me');
  });

  test('linked paid item records a loan payment and undo reverses it', async ({ page }) => {
    await add(page, 'loans', {name:'Car', total:1000, paymentAmount:100});
    await page.click('#loans-body [data-action="loan-to-budget"]');
    await navigate(page, 'budget');
    await page.locator('#budget-body .paid-check').check();
    await expect(page.locator('#loans-body [data-loan-progress-pct]')).toHaveText('10.0%');
    await page.click('#btn-undo');
    await expect(page.locator('#budget-body .paid-check')).not.toBeChecked();
    expect(await page.evaluate(() => App.state.get().loans[0].payments)).toHaveLength(0);
  });

  test('editing a paid linked allocation updates payment history', async ({ page }) => {
    await add(page, 'loans', {name:'Car', total:1000, paymentAmount:100});
    await page.click('#loans-body [data-action="loan-to-budget"]');
    await navigate(page, 'budget');
    await page.locator('#budget-body .paid-check').check();
    const input = page.locator('#budget-body [data-field="amount"]');
    await input.fill('150');
    await input.press('Enter');
    await expect(page.locator('#loans-body [data-loan-progress-pct]')).toHaveText('15.0%');
    await navigate(page, 'loans');
    await page.click('#loans-body .loan-actions [data-edit]');
    await expect(page.locator('#entry-history-list')).toContainText('150');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => App.state.get().loans[0].payments[0].amount)).toBe(150);
  });

  test('loan details paginate all recorded payments', async ({ page }) => {
    await add(page, 'loans', {total:10000, paymentAmount:100, monthsPaid:2});
    await page.evaluate(() => {
      App.state.get().loans[0].payments = Array.from({length:25}, (_,n) => ({id:'payment'+n, date:'2026-09-01T12:00:00Z', amount:100}));
      App.render.all();
    });
    await page.click('#loans-body .loan-actions [data-edit]');
    await expect(page.locator('.history-item')).toHaveCount(20);
    await page.click('#history-more');
    await expect(page.locator('.history-item')).toHaveCount(25);
    await expect(page.locator('#history-more')).toBeHidden();
    await expect(page.locator('#entry-monthsPaid')).toHaveValue('2');
  });

  test('deleting a linked loan and undo restores its budget link', async ({ page }) => {
    await add(page, 'loans', {name:'Car', total:1000, paymentAmount:100});
    await page.click('[data-action="loan-to-budget"]');
    await page.click('[data-action="delete-loan"]');
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(0);
    await page.click('#btn-undo');
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(1);
    await expect(page.locator('[data-action="loan-to-budget"]')).toBeDisabled();
  });

  test('rollover copies recurring expenses and resets paid states', async ({ page }) => {
    await add(page, 'budget', {name:'Rent', amount:1000, recurring:true});
    await page.locator('#budget-body .paid-check').check();
    await add(page, 'budget', {name:'One-off', amount:50});
    await nextMonth(page);
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(1);
    await expect(page.locator('#budget-body .entry-name')).toHaveText('Rent');
    await expect(page.locator('#budget-body .paid-check')).not.toBeChecked();
  });

  test('past months are editable and stay independent across views and refresh', async ({ page }) => {
    await add(page, 'salary', {source:'History', amount:1000});
    const original = await nextMonth(page);
    const future = await page.evaluate(() => App.state.viewedMonth());
    await selectMonth(page, original);
    await expect(page.locator('#month-mode-label')).toContainText('month');
    await navigate(page, 'accounts');
    await expect(page.locator('#salary-body [data-field="amount"]')).toBeEnabled();
    await page.locator('#salary-body [data-field="amount"]').fill('2500');
    await page.locator('#salary-body [data-field="amount"]').press('Enter');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.reload();
    await expect(page.locator('#month-picker-button')).toHaveAttribute('data-month', original);
    await expect(page.locator('#salary-body [data-field="amount"]')).toHaveValue('2,500');
    await selectMonth(page, future);
    await expect(page.locator('#salary-body [data-field="amount"]')).toHaveValue('1,000');
  });

  for (const width of [320, 430, 768, 1280]) {
    test(`month navigation keeps the layout stable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({width, height:932});
      await add(page, 'salary', {source:'Work', amount:1000});
      await navigate(page, 'overview');
      const source = await page.evaluate(() => App.state.viewedMonth());
      await expect(page.locator('#btn-copy-month')).toBeHidden();
      const geometry = () => page.evaluate(() => {
        const rect = selector => {
          const {x,y,width,height} = document.querySelector(selector).getBoundingClientRect();
          return {x:x + window.scrollX, y:y + window.scrollY, width,height};
        };
        return {
          context:rect('#month-context'), controls:rect('.month-controls'),
          action:rect('.overview-actions'), heroTop:rect('.hero').y,
          statusTop:rect('#month-mode-label').y,
        };
      });
      const initial = await geometry();
      const expectStable = async () => {
        expect(await geometry()).toEqual(initial);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      };
      await page.getByRole('button', {name:'Next month', exact:true}).click();
      await expect(page.locator('#btn-copy-month')).toBeVisible();
      await expectStable();
      await page.click('#btn-copy-month');
      await page.selectOption('#copy-month-source',source);
      await page.click('#btn-confirm-copy');
      await expect(page.locator('#btn-copy-month')).toBeHidden();
      await expectStable();
      await page.getByRole('button', {name:'Previous month', exact:true}).click();
      await page.getByRole('button', {name:'Previous month', exact:true}).click();
      await expect(page.locator('#btn-copy-month')).toBeVisible();
      await expectStable();
      await selectMonth(page,'2099-09');
      await expect(page.locator('#selected-month-label')).toHaveText('September 2099');
      await expectStable();
    });
  }

  test('month picker crosses years, starts empty and copies only on request', async ({ page }) => {
    await selectMonth(page, '2026-12');
    await add(page, 'salary', {source:'Work', amount:1000});
    await add(page, 'budget', {name:'Rent', amount:100, recurring:true});
    await page.locator('#budget-body .paid-check').check();
    await add(page, 'budget', {name:'One-off', amount:50});
    await page.click('[data-month-shift="1"]');
    await expect(page.locator('#month-picker-button')).toHaveAttribute('data-month','2027-01');
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(0);
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(0);
    await expect(page.locator('#btn-header-import')).toHaveText('Export');
    await page.click('#btn-copy-month');
    await page.selectOption('#copy-month-source','2026-12');
    await page.click('#btn-confirm-copy');
    await expect(page.locator('#budget-body .entry-name')).toHaveText('Rent');
    await expect(page.locator('#budget-body .paid-check')).not.toBeChecked();
    await expect(page.locator('#btn-copy-month')).toBeHidden();
    await page.click('[data-month-shift="-1"]');
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(2);
    await expect(page.locator('#budget-body .paid-check').first()).toBeChecked();
  });

  test('copying linked loans preserves independent payment history and does not overwrite populated months', async ({ page }) => {
    await add(page,'loans',{name:'Linked',total:10000,paymentAmount:1000,monthsPaid:2});
    await page.click('[data-action="loan-to-budget"]');
    await navigate(page,'budget'); await page.locator('#budget-body .paid-check').check();
    const source = await page.evaluate(() => App.state.viewedMonth());
    await page.click('[data-month-shift="1"]');
    await page.click('#btn-copy-month'); await page.selectOption('#copy-month-source',source); await page.click('#btn-confirm-copy');
    await page.locator('#budget-body .paid-check').check();
    const result = await page.evaluate((source) => {
      const S=App.state, target=S.viewedMonth(), loan=S.get().loans[0];
      const linked=S.get().budget[0].loanId===loan.id && loan.budgetEntryId===S.get().budget[0].id;
      const overwritten=S.copyRecurring(source);
      const count=loan.payments.length; S.viewMonth(source);
      const old=S.get().loans[0]; S.viewMonth(target);
      return {linked,overwritten,count,oldCount:old.payments.length,differentId:old.id!==loan.id};
    },source);
    expect(result).toEqual({linked:true,overwritten:false,count:2,oldCount:1,differentId:true});
  });

  test('version 2 saved drafts migrate while invalid month documents preserve existing records', async ({ page }) => {
    await add(page,'salary',{source:'Migrated',amount:1000});
    await page.evaluate(() => {
      const doc=App.state.getDocument(); doc.version=2; delete doc.viewedMonth;
      localStorage.setItem('b2g-document-v2',JSON.stringify(doc));
    });
    await page.reload(); await expect(page.locator('#salary-body .entry-name')).toContainText('Migrated');
    expect(await page.evaluate(() => App.state.getDocument().version)).toBe(3);
    const checks=await page.evaluate(async () => {
      const S=App.state, doc=S.getDocument();
      const invalid=structuredClone(doc); invalid.viewedMonth='9999-12';
      const invalidKey=structuredClone(doc); invalidKey.months['0000-01']=S.getExport();
      const statuses=[S.loadDocument(invalid),S.loadDocument(invalidKey)];
      const legacy=structuredClone(doc); legacy.version=2; delete legacy.viewedMonth;
      const migrated=await App.io.processFile(new File([JSON.stringify(legacy)],'old.json',{type:'application/json'}));
      statuses.push(migrated.version === 3 && migrated.viewedMonth === legacy.activeMonth);
      try { await App.io.processFile(new File([JSON.stringify(invalid)],'invalid.json',{type:'application/json'})); statuses.push(true); } catch {statuses.push(false);}
      return {statuses,source:S.get().salary[0].source};
    });
    expect(checks).toEqual({statuses:[false,false,true,false],source:'Migrated'});
  });

  test('month picker enforces document limits without replacing the selected month', async ({ page }) => {
    const key = await page.evaluate(() => {
      const S=App.state;
      for(let n=0;n<119;n++) S.createMonth(`${2000+Math.floor(n/12)}-${String(n%12+1).padStart(2,'0')}`);
      App.render.all(); return S.viewedMonth();
    });
    await page.click('#month-picker-button'); await page.fill('#picker-year','2099'); await page.locator('#picker-year').press('Tab');
    await page.click('[data-pick-month="2099-12"]');
    await expect(page.locator('.toast-msg')).toContainText('120 months');
    expect(await page.evaluate(() => App.state.viewedMonth())).toBe(key);
    expect(await page.evaluate(() => App.state.listMonths().length)).toBe(120);
  });

  test('new users follow the device theme and can override it', async ({ page }) => {
    await page.emulateMedia({colorScheme:'dark'});
    await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
    await navigate(page, 'settings');
    await page.selectOption('#theme-select', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.selectOption('#theme-select', 'system');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({colorScheme:'light'});
    await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  });

  test('retains an existing explicit theme preference', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('b2g-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await navigate(page, 'settings');
    await expect(page.locator('#theme-select')).toHaveValue('dark');
  });

  test('currency changes relabel amounts without converting them', async ({ page }) => {
    await add(page, 'salary', {amount:1000});
    await navigate(page, 'settings');
    page.once('dialog', d => { expect(d.message()).toContain('not converted'); d.accept(); });
    await page.selectOption('#currency-select', 'USD|en-US');
    await expect(page.locator('#sum-income')).toContainText('$ 1,000');
    expect(await page.evaluate(() => App.state.get().salary[0].amount)).toBe(1000);
  });

  test('import previews replacement before changing the draft', async ({ page }) => {
    await add(page, 'salary', {source:'Existing'});
    await navigate(page, 'settings');
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({name:'budget.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify({salary:[{source:'Imported', amount:50}], savings:[], budget:[], loans:[]}))});
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toBeVisible();
    await expect(page.locator('#salary-body .entry-name')).toContainText('Existing');
    await page.click('#btn-import-submit');
    await expect(page.locator('#salary-body .entry-name')).toContainText('Imported');
  });

  test('invalid imports preserve the draft', async ({ page }) => {
    await add(page, 'salary', {source:'Keep me'});
    await navigate(page, 'settings');
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({name:'bad.json', mimeType:'application/json', buffer:Buffer.from('{bad')});
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toBeHidden();
    await expect(page.locator('#salary-body .entry-name')).toContainText('Keep me');
  });

  test('dialogs trap keyboard focus and restore it on Escape', async ({ page }) => {
    await navigate(page, 'settings');
    await page.click('#btn-finalize');
    await expect(page.locator('#export-filename')).toBeFocused();
    await page.locator('#btn-modal-cancel').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#btn-modal-close')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#btn-modal-cancel')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#btn-finalize')).toBeFocused();
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert');
  });

  test('JSON and CSV backups preserve all months and CSV can be reimported', async ({ page }) => {
    await add(page, 'salary', {source:'Salary', amount:1000});
    await nextMonth(page);
    await navigate(page, 'settings');
    await page.click('#btn-finalize');
    const [jsonDownload] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export-json')]);
    const json = JSON.parse(await readFile(await jsonDownload.path(), 'utf8'));
    expect(Object.keys(json.months)).toHaveLength(2);
    await page.click('#btn-finalize');
    const [csvDownload] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export-csv')]);
    const csv = await readFile(await csvDownload.path(), 'utf8');
    expect(csv).toContain('## DOCUMENT_JSON');
    expect(csv).toContain('month,id,source,amount,frequency');
    expect(csv).toContain(json.viewedMonth);
    expect(json.version).toBe(3);
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({name:'all-months.csv', mimeType:'text/csv', buffer:Buffer.from(csv)});
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toContainText('2 months');
    await page.click('#btn-import-submit');
    expect(await page.evaluate(() => Object.keys(App.state.getDocument().months))).toHaveLength(2);
  });

  test('encrypted backup export and import round-trip through settings', async ({ page }) => {
    await add(page, 'salary', {source:'Encrypted salary', amount:123});
    await navigate(page, 'settings');
    await page.click('#btn-finalize');
    await page.check('#export-encrypt');
    await page.fill('#export-password', 'test-password-123');
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export-json')]);
    expect(download.suggestedFilename()).toMatch(/\.bgo$/);
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({name:'backup.bgo', mimeType:'application/json', buffer:await readFile(await download.path())});
    await page.fill('#import-password','test-password-123');
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toBeVisible();
    await page.click('#btn-import-submit');
    await expect(page.locator('#salary-body .entry-name')).toContainText('Encrypted salary');
  });

  test('save failures remain visible across views', async ({ page }) => {
    await page.evaluate(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === 'b2g-document-v2') throw new DOMException('Quota exceeded', 'QuotaExceededError');
        return original.call(this,key,value);
      };
    });
    await add(page, 'budget', {amount:200});
    await expect(page.locator('#save-status')).toBeVisible();
    await expect(page.locator('#save-status')).toContainText('Not saved');
    await navigate(page, 'settings');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','error');
  });

  test('unreadable saved drafts remain available for recovery', async ({ page }) => {
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.evaluate(() => localStorage.setItem('b2g-document-v2','{broken'));
    await page.reload();
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','error');
    await navigate(page, 'budget');
    expect(await page.evaluate(() => localStorage.getItem('b2g-document-v2'))).toBe('{broken');
  });

  test('calculator applies results to quick amount fields', async ({ page }) => {
    await add(page, 'salary', {amount:10});
    const input = page.locator('#salary-body [data-field="amount"]');
    await page.locator('#salary-body [data-open-calculator]').click();
    for (const key of ['2','+','3','=']) await page.click('[data-calc="' + key + '"]');
    await page.click('#btn-calc-apply');
    await expect(page.locator('#calculator-panel')).toBeHidden();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('5');
    expect(await page.evaluate(() => App.state.get().salary[0].amount)).toBe(5);
  });

  test('calculator accepts keyboard input and restores focus when dismissed', async ({ page }) => {
    await page.click('#btn-calc-fab');
    await expect(page.locator('#calculator-grid button').first()).toBeFocused();
    await page.keyboard.type('8/2');
    await page.keyboard.press('Enter');
    await expect(page.locator('#calc-display-result')).toHaveText('4');
    await page.keyboard.press('Escape');
    await expect(page.locator('#btn-calc-fab')).toBeFocused();
    await expect(page.locator('#calculator-panel')).toBeHidden();
  });

  test('calculator works inside a staged form without creating data', async ({ page }) => {
    await page.click('#view-overview [data-add="budget"]');
    await page.fill('#entry-name','Food');
    await page.click('[data-calc-target="entry-amount"]');
    await expect(page.locator('#calculator-grid button').first()).toBeFocused();
    await page.keyboard.type('2+3');
    await page.keyboard.press('Enter');
    await page.click('#btn-calc-apply');
    await expect(page.locator('#calculator-panel')).toBeHidden();
    await expect(page.locator('#entry-amount')).toBeFocused();
    await expect(page.locator('#entry-amount')).toHaveValue('5');
    expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
    await page.click('#entry-submit');
    await expect(page.locator('#sum-pending')).toContainText('5');
  });

  test('privacy dashboard shows local metrics', async ({ page }) => {
    await navigate(page,'settings');
    await page.click('#btn-open-privacy');
    await expect(page.locator('#privacy-storage')).not.toHaveText('');
    await expect(page.locator('#privacy-outbound-count')).toHaveText('0');
    await page.click('#btn-privacy-ok');
    await expect(page.locator('#privacy-modal')).toBeHidden();
  });

  test('wipe clears financial records and resets preferences to device defaults', async ({ page }) => {
    await add(page, 'salary', {amount:100});
    await navigate(page, 'settings');
    await page.selectOption('#theme-select','dark');
    page.once('dialog', d => d.accept());
    await page.click('#btn-wipe-data');
    await expect(page.locator('#view-overview')).toBeVisible();
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(0);
    await expect(page.locator('#theme-select')).toHaveValue('system');
    await expect(page.locator('#currency-select')).toHaveValue('PHP|en-PH');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','idle');
  });

  test('core flows make no outbound requests', async ({ page, baseURL }) => {
    const outbound = [];
    page.on('request', request => {
      if (/^https?:/i.test(request.url()) && new URL(request.url()).origin !== new URL(baseURL).origin) outbound.push(request.url());
    });
    await page.reload();
    await add(page, 'salary', {source:'Local'});
    await add(page, 'budget', {name:'Food'});
    await navigate(page, 'settings');
    await page.click('#btn-toggle-import');
    await page.click('#btn-import-cancel');
    expect(outbound).toEqual([]);
  });

  test('responsive views avoid page overflow and controls stay above navigation', async ({ page }) => {
    await page.evaluate(() => {
      App.state.addSalary({source:'Salary', amount:50000});
      App.state.addSavings({location:'Savings', amount:85000});
      const loanId = App.state.addLoan({name:'Long loan name '.repeat(5), total:42000, paymentAmount:3000});
      App.state.addLoanToBudget(loanId);
      for (let n=0;n<30;n++) App.state.addBudget('Long expense name '.repeat(4)+n, 1000);
      App.render.all();
    });
    for (const width of [360,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      for (const view of ['overview','budget','accounts','loans','settings']) {
        await navigate(page,view);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      if (width < 1024) {
        const fab = await page.locator('#btn-calc-fab').boundingBox();
        const nav = await page.locator('.app-nav').boundingBox();
        expect(fab.y + fab.height).toBeLessThan(nav.y);
      }
    }
  });

  test('reduced motion suppresses feedback animation and toasts clear the header', async ({ page }) => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await add(page,'budget',{amount:100});
    await page.locator('#budget-body .paid-check').check();
    expect(await page.locator('.undo-timer').evaluate(el => parseFloat(getComputedStyle(el).animationDuration))).toBeLessThan(.01);
    await page.evaluate(() => App.ui.toast('Layout check','info'));
    const header = await page.locator('.app-header').boundingBox();
    const toast = await page.locator('.toast').last().boundingBox();
    expect(toast.y).toBeGreaterThanOrEqual(header.y + header.height);
  });
});
