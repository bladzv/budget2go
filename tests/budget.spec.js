import { test, expect } from '@playwright/test';

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
    await page.selectOption('#currency-select', 'USD|en-US');
    const incomeText = await page.locator('#sum-income').textContent();
    expect(incomeText).toContain('$');
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
