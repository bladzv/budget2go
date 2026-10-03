import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('checked-in page works when opened directly from disk', async ({ page }) => {
  await page.goto(pathToFileURL(resolve(process.cwd(), 'index.html')).href);
  await expect(page.locator('.brand-icon svg.lucide')).toBeVisible();
  await expect(page.locator('i[data-lucide]')).toHaveCount(0);
  await page.click('#btn-add-salary');
  await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(1);
  await page.locator('#salary-body [data-field="source"]').fill('Local file');
  await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'saved');
  await page.reload();
  await expect(page.locator('#salary-body [data-field="source"]')).toHaveValue('Local file');
});

test.describe('Budget2Go — smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#salary-body');
  });

  test('page loads with all key sections', async ({ page }) => {
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('#salary-body')).toBeVisible();
    await expect(page.locator('#savings-body')).toBeVisible();
    await expect(page.locator('#budget-body')).toBeVisible();
    await expect(page.locator('#loans-body')).toBeVisible();
    await expect(page.locator('.summary-bar')).toBeVisible();
  });

  test('App namespace is fully initialized', async ({ page }) => {
    const keys = await page.evaluate(() => Object.keys(window.App || {}));
    expect(keys).toContain('utils');
    expect(keys).toContain('state');
    expect(keys).toContain('render');
    expect(keys).toContain('events');
  });

  test('Add Income Source inserts a row', async ({ page }) => {
    const before = await page.locator('#salary-body tr[data-id]').count();
    await page.click('#btn-add-salary');
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(before + 1);
  });

  test('typing income amount updates summary bar', async ({ page }) => {
    await page.click('#btn-add-salary');
    const input = page.locator('#salary-body tr[data-id]:last-child input[data-field="amount"]');
    await input.fill('5000');
    await expect(input).toHaveValue('5000');
    await expect.poll(async () => (await page.locator('#sum-income').textContent()) || '').toContain('5');
  });

  test('Add Savings Account inserts a row', async ({ page }) => {
    await page.click('#btn-add-savings');
    await expect(page.locator('#savings-body tr[data-id]')).toHaveCount(1);
  });

  test('Add Budget Item inserts a row', async ({ page }) => {
    await page.click('#btn-add-budget');
    await expect(page.locator('#budget-body tr[data-id]')).toHaveCount(1);
  });

  test('Add Loan inserts a row', async ({ page }) => {
    await page.click('#btn-add-loan');
    await expect(page.locator('#loans-body tr[data-id]')).toHaveCount(1);
  });

  test('delete salary row removes it', async ({ page }) => {
    await page.click('#btn-add-salary');
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(1);
    await page.click('#salary-body [data-action="delete-salary"]');
    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(0);
  });

  test('marking budget item as paid applies row-paid style', async ({ page }) => {
    await page.click('#btn-add-budget');
    const checkbox = page.locator('#budget-body .paid-check').first();
    await checkbox.check();
    await expect(page.locator('#budget-body tr.row-paid')).toHaveCount(1);
  });

  test('theme toggle switches between dark and light', async ({ page }) => {
    const html = page.locator('html');
    await page.click('#btn-theme-toggle');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.click('#btn-theme-toggle');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('currency selector changes displayed currency', async ({ page }) => {
    await page.click('#btn-add-salary');
    const input = page.locator('#salary-body tr[data-id]:last-child input[data-field="amount"]');
    await input.fill('1000');
    await input.dispatchEvent('input');

    // Switch to USD
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('not converted');
      dialog.accept();
    });
    await page.selectOption('#currency-select', 'USD|en-US');
    const incomeText = await page.locator('#sum-income').textContent();
    expect(incomeText).toContain('$');
  });

  test('draft survives refresh and shows saved status', async ({ page }) => {
    await page.click('#btn-add-salary');
    await page.locator('#salary-body [data-field="source"]').fill('Contract work');
    await page.locator('#salary-body [data-field="amount"]').fill('2500');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'saved');
    await page.reload();
    await expect(page.locator('#salary-body [data-field="source"]')).toHaveValue('Contract work');
    await expect(page.locator('#salary-body [data-field="amount"]')).toHaveValue('2500');
  });

  test('rollover keeps recurring budget items and resets paid', async ({ page }) => {
    await page.click('#btn-add-budget');
    await page.locator('#budget-body [data-field="name"]').first().fill('Rent');
    await page.locator('#budget-body [data-field="recurring"]').first().check();
    await page.locator('#budget-body .paid-check').first().check();
    await page.click('#btn-add-budget');
    await page.locator('#budget-body [data-field="name"]').last().fill('One-off');
    const result = await page.evaluate(() => {
      const current = window.App.state.currentMonth();
      const next = new Date(current + '-01T12:00:00');
      next.setMonth(next.getMonth() + 1);
      const key = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
      window.App.state.rollover(key);
      window.App.render.all();
      return window.App.state.getDocument();
    });
    expect(result.months[result.activeMonth].budget).toHaveLength(1);
    expect(result.months[result.activeMonth].budget[0].name).toBe('Rent');
    expect(result.months[result.activeMonth].budget[0].paid).toBe(false);
    expect(Object.keys(result.months)).toHaveLength(2);
  });

  test('linked paid item records loan payment and undo reverses it', async ({ page }) => {
    await page.click('#btn-add-loan');
    const details = page.locator('#loans-body [data-action="toggle-loan-details"]');
    if (await details.isVisible()) await details.click();
    await page.locator('#loans-body [data-field="name"]').fill('Car');
    await page.locator('#loans-body [data-field="total"]').fill('1000');
    await page.locator('#loans-body [data-field="paymentAmount"]').fill('100');
    await page.click('#loans-body [data-action="loan-to-budget"]');
    await page.locator('#budget-body .paid-check').check();
    await expect.poll(() => page.evaluate(() => window.App.state.get().loans[0].payments.length)).toBe(1);
    await expect(page.locator('#loans-body [data-loan-progress-pct]')).toHaveText('10.0%');
    await page.click('#btn-undo');
    await expect.poll(() => page.evaluate(() => window.App.state.get().loans[0].payments.length)).toBe(0);
    await expect(page.locator('#budget-body .paid-check')).not.toBeChecked();
  });

  test('editing a paid loan allocation updates its recorded payment', async ({ page }) => {
    await page.click('#btn-add-loan');
    const details = page.locator('#loans-body [data-action="toggle-loan-details"]');
    if (await details.isVisible()) await details.click();
    await page.locator('#loans-body [data-field="total"]').fill('1000');
    await page.locator('#loans-body [data-field="paymentAmount"]').fill('100');
    await page.click('#loans-body [data-action="loan-to-budget"]');
    await page.locator('#budget-body .paid-check').check();
    await page.locator('#budget-body [data-field="amount"]').fill('150');
    expect(await page.evaluate(() => window.App.state.get().loans[0].payments[0].amount)).toBe(150);
    await expect(page.locator('#loans-body [data-loan-progress-pct]')).toHaveText('15.0%');
  });

  test('past months are read only', async ({ page }) => {
    await page.click('#btn-add-salary');
    await page.evaluate(() => {
      const current = window.App.state.currentMonth();
      const next = new Date(current + '-01T12:00:00');
      next.setMonth(next.getMonth() + 1);
      window.App.state.rollover(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
      window.App.render.all();
    });
    await page.locator('#month-tabs .month-tab').first().click();
    await expect(page.locator('#salary-body [data-field="source"]')).toBeDisabled();
    await expect(page.locator('#btn-add-salary')).toBeDisabled();
    await expect(page.locator('#month-mode-label')).toContainText('read only');
  });

  test('import previews replacement before changing draft', async ({ page }) => {
    await page.click('#btn-add-salary');
    await page.locator('#salary-body [data-field="source"]').fill('Existing');
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({
      name: 'budget.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ salary: [{ source: 'Imported', amount: 50 }], savings: [], budget: [], loans: [] })),
    });
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toBeVisible();
    await expect(page.locator('#salary-body [data-field="source"]')).toHaveValue('Existing');
    await page.click('#btn-import-submit');
    await expect(page.locator('#salary-body [data-field="source"]')).toHaveValue('Imported');
  });

  test('invalid import leaves the draft intact', async ({ page }) => {
    await page.click('#btn-add-salary');
    await page.locator('#salary-body [data-field="source"]').fill('Keep me');
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toBeHidden();
    await expect(page.locator('#salary-body [data-field="source"]')).toHaveValue('Keep me');
  });

  test('dialogs trap focus and restore it on Escape', async ({ page }) => {
    await page.click('#btn-finalize');
    await expect(page.locator('#export-filename')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#btn-finalize')).toBeFocused();
  });

  test('reduced motion removes active animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const duration = await page.locator('.card').first().evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.01);
  });

  test('JSON and CSV backups carry all months and CSV can be reimported', async ({ page }) => {
    await page.click('#btn-add-salary');
    await page.locator('#salary-body [data-field="source"]').fill('Salary');
    await page.evaluate(() => {
      const current = window.App.state.currentMonth();
      const next = new Date(current + '-01T12:00:00');
      next.setMonth(next.getMonth() + 1);
      window.App.state.rollover(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
      window.App.render.all();
    });
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.evaluate(() => window.App.io.exportJSON('all-months')),
    ]);
    const json = JSON.parse(await readFile(await jsonDownload.path(), 'utf8'));
    expect(Object.keys(json.months)).toHaveLength(2);
    const [csvDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.evaluate(() => window.App.io.exportCSV('all-months')),
    ]);
    const csv = await readFile(await csvDownload.path(), 'utf8');
    expect(csv).toContain('## DOCUMENT_JSON');
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({ name: 'all-months.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await page.click('#btn-import-submit');
    await expect(page.locator('#import-preview')).toContainText('2 months');
    await page.click('#btn-import-submit');
    expect(await page.evaluate(() => Object.keys(window.App.state.getDocument().months).length)).toBe(2);
  });

  test('local save failure is visible', async ({ page }) => {
    await page.evaluate(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'b2g-document-v2') throw new DOMException('Quota exceeded', 'QuotaExceededError');
        return original.call(this, key, value);
      };
    });
    await page.click('#btn-add-budget');
    await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#save-status')).toContainText('Not saved');
  });

  test('unreadable saved draft is preserved for recovery', async ({ page }) => {
    await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'saved');
    await page.evaluate(() => localStorage.setItem('b2g-document-v2', '{broken'));
    await page.reload();
    await expect(page.locator('#save-status')).toHaveAttribute('data-state', 'error');
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => localStorage.getItem('b2g-document-v2'))).toBe('{broken');
  });

  test('mobile summary expands and toast stays clear of header', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile layout only');
    await page.evaluate(() => window.App.ui.toast('Layout check', 'info'));
    const header = await page.locator('.app-header').boundingBox();
    const toast = await page.locator('.toast').last().boundingBox();
    expect(toast.y).toBeGreaterThanOrEqual(header.y + header.height);
    await page.click('#btn-summary-toggle');
    await expect(page.locator('#btn-summary-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.summary-inner .sum-stat:nth-child(2)')).toBeVisible();
    await page.click('#btn-add-loan');
    const detailToggle = page.locator('#loans-body [data-action="toggle-loan-details"]');
    await expect(page.locator('#loans-body .loan-detail').first()).toHaveAttribute('inert', '');
    await detailToggle.click();
    await expect(detailToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#loans-body .loan-row')).toHaveClass(/details-open/);
    await expect(page.locator('#loans-body .loan-detail').first()).not.toHaveAttribute('inert');
  });

  test('Import modal opens and closes', async ({ page }) => {
    await page.click('#btn-toggle-import');
    await expect(page.locator('#import-modal')).not.toHaveAttribute('hidden');
    await page.click('#btn-import-cancel');
    await expect(page.locator('#import-modal')).toHaveAttribute('hidden', '');
  });

  test('calculator FAB opens and closes panel', async ({ page }) => {
    await page.click('#btn-calc-fab');
    await expect(page.locator('#calculator-panel')).not.toHaveAttribute('hidden');
    await page.click('#btn-calc-close');
    await expect(page.locator('#calculator-panel')).toHaveAttribute('hidden', '');
  });

  test('calculator result can be applied to focused amount field', async ({ page }) => {
    await page.click('#btn-add-salary');
    const amountInput = page.locator('#salary-body tr[data-id]:last-child input[data-field="amount"]');
    await amountInput.click();

    await page.click('#btn-calc-fab');
    await page.click('[data-calc="2"]');
    await page.click('[data-calc="+"]');
    await page.click('[data-calc="3"]');
    await page.click('[data-calc="="]');
    await page.click('#btn-calc-apply');

    await expect(amountInput).toHaveValue('5');
  });

  test('privacy dashboard opens with local metrics', async ({ page }) => {
    await page.click('#btn-open-privacy');
    await expect(page.locator('#privacy-modal')).not.toHaveAttribute('hidden');
    await expect(page.locator('#privacy-storage')).not.toHaveText('');
    await expect(page.locator('#privacy-caches')).not.toHaveText('');
    await expect(page.locator('#privacy-outbound-count')).toHaveText('0');
    await page.click('#btn-privacy-ok');
    await expect(page.locator('#privacy-modal')).toHaveAttribute('hidden', '');
  });

  test('wipe button clears rows and resets defaults', async ({ page }) => {
    await page.click('#btn-add-salary');
    await page.selectOption('#currency-select', 'USD|en-US');
    await page.click('#btn-theme-toggle');

    page.once('dialog', (d) => d.accept());
    await page.click('#btn-wipe-data');

    await expect(page.locator('#salary-body tr[data-id]')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#currency-select')).toHaveValue('PHP|en-PH');
  });

  test('core flows make no outbound network requests', async ({ page, baseURL }) => {
    const allowedOrigin = new URL(baseURL).origin;
    const outbound = [];

    page.on('request', (req) => {
      const url = req.url();
      if (!/^https?:\/\//i.test(url)) return;
      const origin = new URL(url).origin;
      if (origin !== allowedOrigin) {
        outbound.push(url);
      }
    });

    await page.goto('/');
    await page.waitForSelector('#salary-body');
    await page.click('#btn-add-salary');
    await page.click('#btn-add-budget');
    await page.click('#btn-calc-fab');
    await page.click('#btn-calc-close');
    await page.click('#btn-toggle-import');
    await page.click('#btn-import-cancel');

    expect(outbound).toEqual([]);
  });
});
