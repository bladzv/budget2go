import {test, expect} from '@playwright/test';

async function seed(page, kind = 'budget') {
  await page.evaluate(kind => {
    const S = App.state;
    if (kind === 'budget') S.addBudget('Bahay', 10, null, false);
    if (kind === 'salary') S.addSalary({source:'Work', amount:10});
    if (kind === 'savings') S.addSavings({location:'Bank', amount:10});
    App.render.all();
  }, kind);
  await page.click(`.nav-item[data-view="${kind === 'budget' ? 'budget' : 'accounts'}"]`);
  return page.locator(`#${kind}-body [data-money]`);
}

async function calculate(page, expression) {
  await page.click('[data-calc="clear"]');
  await page.keyboard.type(expression);
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await page.click('#btn-welcome-start');
});

test('floating calculator never offers to apply, even after focusing an amount', async ({page}) => {
  await page.click('#btn-calc-fab');
  await calculate(page, '9*6');
  await page.keyboard.press('Enter');
  await expect(page.locator('#calc-display-result')).toHaveText('54');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
  await page.click('#btn-calc-close');
  const input = await seed(page, 'salary');
  await input.focus();
  await page.click('#btn-calc-fab');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
  // Even a programmatic click cannot apply a standalone calculation.
  await page.locator('#btn-calc-apply').evaluate(button => button.click());
  await expect(input).toHaveValue('10');
  await expect(page.locator('.toast-error')).toHaveCount(0);
});

for (const [kind, destination] of [['budget','Bahay · Allocated amount'], ['salary','Work · Income amount'], ['savings','Bank · Balance amount']]) {
  test(`calculator applies directly to the explicit ${kind} destination and persists`, async ({page}) => {
    const input = await seed(page, kind);
    await page.locator(`#${kind}-body [data-open-calculator]`).click();
    await expect(page.locator('#calc-destination')).toHaveText(destination);
    await expect(page.locator('#btn-calc-apply')).toBeDisabled();
    await calculate(page, '1000+234.5');
    await expect(page.locator('#btn-calc-apply')).toHaveText('Use ₱ 1,234.50');
    await page.click('#btn-calc-apply'); // Equals is optional for a complete expression.
    await expect(page.locator('#calculator-panel')).toBeHidden();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('1,234.5');
    expect(await page.evaluate(kind => App.state.get()[kind][0].amount, kind)).toBe(1234.5);
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','saved');
    await page.reload();
    await expect(input).toHaveValue('1,234.5');
  });
}

test('invalid and negative expressions disable applying, while valid zero is allowed', async ({page}) => {
  const input = await seed(page);
  await page.locator('#budget-body [data-open-calculator]').click();
  const button = page.locator('#btn-calc-apply');
  const hint = page.locator('#calc-apply-hint');
  await expect(button).toBeVisible();
  await expect(button).toBeDisabled();
  await expect(hint).toContainText('Enter a calculation');
  for (const expression of ['2+', '(2+3', '1/0', '1-2']) {
    await calculate(page, expression);
    await expect(button).toBeDisabled();
    await expect(hint).not.toBeEmpty();
    await page.keyboard.press('Enter');
    await expect(button).toBeDisabled();
    await expect(input).toHaveValue('10');
  }
  await calculate(page,'1-2');
  await page.keyboard.press('Enter');
  await expect(page.locator('#calc-display-result')).toHaveText('-1');
  await expect(hint).toHaveText('Amounts must be zero or greater.');
  await calculate(page,'0');
  await expect(button).toHaveText('Use ₱ 0.00');
  await expect(button).toBeEnabled();
  await page.click('#btn-calc-apply');
  await expect(input).toHaveValue('0');
  expect(await page.evaluate(() => App.state.get().budget[0].amount)).toBe(0);
  await expect(page.locator('.toast-error')).toHaveCount(0);
});

test('loan fields have distinct destinations, round visibly, and remain staged until Save entry', async ({page}) => {
  await page.click('.nav-item[data-view="loans"]');
  await page.click('#btn-add-loan');
  await page.fill('#entry-name','Laptop');
  await expect(page.locator('#entry-fields [data-open-calculator]')).toHaveCount(2);
  await page.click('[data-calc-target="entry-total"]');
  await expect(page.locator('#calc-destination')).toHaveText('Laptop · Total loan amount');
  await calculate(page,'50*2');
  await page.click('#btn-calc-apply');
  await expect(page.locator('#entry-total')).toHaveValue('100');
  await expect(page.locator('#entry-total')).toBeFocused();
  await expect(page.locator('#entry-paymentAmount')).toHaveValue('0');
  await page.click('[data-calc-target="entry-paymentAmount"]');
  await expect(page.locator('#calc-destination')).toHaveText('Laptop · Amount per payment');
  await calculate(page,'10/3');
  await expect(page.locator('#btn-calc-apply')).toHaveText('Use ₱ 3.33');
  await expect(page.locator('#calc-apply-hint')).toHaveText('Rounded to two decimal places.');
  await page.click('#btn-calc-apply');
  await expect(page.locator('#entry-paymentAmount')).toHaveValue('3.33');
  expect(await page.evaluate(() => App.state.get().loans.length)).toBe(0);
  await page.click('#entry-submit');
  expect(await page.evaluate(() => ({total:App.state.get().loans[0].total, payment:App.state.get().loans[0].paymentAmount}))).toEqual({total:100,payment:3.33});
});

test('calculator cancellation restores its opener and cancelling an applied form keeps records unchanged', async ({page}) => {
  await page.click('#view-overview [data-add="budget"]');
  await page.fill('#entry-name','Food');
  const opener = page.locator('[data-calc-target="entry-amount"]');
  for (const dismiss of ['close','escape']) {
    await opener.click();
    await calculate(page,'9*6');
    if (dismiss === 'close') await page.click('#btn-calc-close');
    else await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    await expect(page.locator('#entry-modal')).toBeVisible();
    await expect(page.locator('#entry-amount')).toHaveValue('0');
  }
  await opener.click();
  await page.click('#btn-calc-apply');
  await expect(page.locator('#entry-amount')).toHaveValue('54');
  await page.locator('#entry-modal [data-close-entry]').last().click();
  expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
  await page.click('#btn-calc-fab');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
});

test('navigation and month changes clear the calculator destination', async ({page}) => {
  const input = await seed(page);
  const original = await page.evaluate(() => App.state.viewedMonth());
  await page.locator('#budget-body [data-open-calculator]').click();
  await calculate(page,'9*6');
  await page.click('.nav-item[data-view="overview"]');
  await expect(page.locator('#calculator-panel')).toBeHidden();
  await page.click('#btn-calc-fab');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
  await page.click('#btn-calc-close');
  await page.click('.nav-item[data-view="budget"]');
  await expect(input).toHaveValue('10');
  await page.locator('#budget-body [data-open-calculator]').click();
  await page.getByRole('button',{name:'Next month',exact:true}).click();
  await expect(page.locator('#calculator-panel')).toBeHidden();
  await page.click('#btn-calc-fab');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
  expect(await page.evaluate(month => App.state.getDocument().months[month].budget[0].amount, original)).toBe(10);
  expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
});

test('rerendering or deleting a destination closes the calculator instead of using stale elements', async ({page}) => {
  await seed(page);
  await page.locator('#budget-body [data-open-calculator]').click();
  await calculate(page,'9*6');
  await page.evaluate(() => App.render.budget());
  await expect(page.locator('#calculator-panel')).toBeHidden();
  await page.click('#btn-calc-fab');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
  await page.click('#btn-calc-close');
  await page.locator('#budget-body [data-open-calculator]').click();
  await page.evaluate(() => {
    App.state.deleteBudget(App.state.get().budget[0].id);
    App.render.budget();
  });
  await expect(page.locator('#calculator-panel')).toBeHidden();
  await page.click('#btn-calc-fab');
  await expect(page.locator('#btn-calc-apply')).toBeHidden();
  expect(await page.evaluate(() => App.state.get().budget.length)).toBe(0);
});

test('disabled or read-only destinations cannot accept calculator values', async ({page}) => {
  const input = await seed(page);
  for (const property of ['disabled','readOnly']) {
    await page.locator('#budget-body [data-open-calculator]').click();
    await calculate(page,'9*6');
    await input.evaluate((input, property) => input[property] = true, property);
    await expect(page.locator('#calculator-panel')).toBeHidden();
    await page.locator('#btn-calc-apply').evaluate(button => button.click());
    await expect(input).toHaveValue('10');
    await input.evaluate((input, property) => input[property] = false, property);
  }
});

test('localized calculator results apply with grouping disabled', async ({page}) => {
  await page.click('.nav-item[data-view="settings"]');
  page.once('dialog', dialog => dialog.accept());
  await page.selectOption('#currency-select','EUR|de-DE');
  await page.uncheck('#grouping-toggle');
  const input = await seed(page,'savings');
  await page.locator('#savings-body [data-open-calculator]').click();
  await calculate(page,'1000+12.5');
  await expect(page.locator('#btn-calc-apply')).toContainText('1012,50');
  await page.click('#btn-calc-apply');
  await expect(input).toHaveValue('1012,5');
  expect(await page.evaluate(() => App.state.get().savings[0].amount)).toBe(1012.5);
});

test('apply label shows the exact decimal amount even when currency summaries round it', async ({page}) => {
  await page.click('.nav-item[data-view="settings"]');
  page.once('dialog', dialog => dialog.accept());
  await page.selectOption('#currency-select','JPY|ja-JP');
  const input = await seed(page,'savings');
  await page.locator('#savings-body [data-open-calculator]').click();
  await calculate(page,'15.5');
  await expect(page.locator('#btn-calc-apply')).toContainText('15.50');
  await page.click('#btn-calc-apply');
  await expect(input).toHaveValue('15.5');
  expect(await page.evaluate(() => App.state.get().savings[0].amount)).toBe(15.5);
});
