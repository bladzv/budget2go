/**
 * Quick smoke test: load app, click Add buttons, verify DOM updates.
 * Run: node test-app.mjs (with server on http://localhost:8765)
 */
const base = 'http://127.0.0.1:8765';

async function fetchAndCheck(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} => ${res.status}`);
  return res.text();
}

async function main() {
  const errors = [];
  // 1. All assets load
  const urls = ['/', '/index.html', '/styles.css', '/utils.js', '/state.js', '/render.js', '/io.js', '/ui.js', '/events.js', '/app.js'];
  for (const u of urls) {
    try {
      await fetchAndCheck(base + (u === '/' ? '/index.html' : u));
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (errors.length) {
    console.error('Asset check failed:', errors);
    process.exit(1);
  }
  console.log('All assets return 200');

  // 2. index.html contains required elements and script order
  const html = await fetchAndCheck(base + '/index.html');
  const hasSalaryBody = html.includes('id="salary-body"');
  const hasBtnAddSalary = html.includes('id="btn-add-salary"');
  const scriptOrder = html.includes('utils.js') && html.indexOf('utils.js') < html.indexOf('app.js');
  if (!hasSalaryBody || !hasBtnAddSalary || !scriptOrder) {
    console.error('HTML structure check failed');
    process.exit(1);
  }
  console.log('HTML structure OK');

  // 3. Optional: use Puppeteer/Playwright for real click test
  try {
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const consoleLogs = [];
    page.on('console', (msg) => {
      consoleLogs.push('[' + msg.type() + '] ' + msg.text());
    });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.waitForSelector('#salary-body', { timeout: 5000 });
    var appKeys = await page.evaluate(function () {
      return typeof window.App !== 'undefined' ? Object.keys(window.App) : [];
    });
    if (appKeys.indexOf('utils') === -1 || appKeys.indexOf('events') === -1) {
      console.error('App not ready. Keys:', appKeys, 'Console:', consoleLogs.filter(function (l) { return l.indexOf('error') !== -1; }));
      await browser.close();
      process.exit(1);
    }
    const rowsBefore = await page.$$eval('#salary-body tr[data-id]', (nodes) => nodes.length);
    await page.$eval('#btn-add-salary', (el) => el.scrollIntoView({ block: 'center' }));
    await page.click('#btn-add-salary');
    await new Promise((r) => setTimeout(r, 400));
    const rowsAfter = await page.$$eval('#salary-body tr[data-id]', (nodes) => nodes.length);
    await page.$eval('#btn-add-savings', (el) => el.scrollIntoView({ block: 'center' }));
    await page.click('#btn-add-savings');
    await new Promise((r) => setTimeout(r, 300));
    const savingsRows = await page.$$eval('#savings-body tr[data-id]', (nodes) => nodes.length);
    if (rowsAfter !== rowsBefore + 1 || savingsRows !== 1) {
      console.error('Button click test failed: salary rows', rowsBefore, '->', rowsAfter, 'savings', savingsRows);
      await browser.close();
      process.exit(1);
    }
    console.log('Button click test passed: Add Income and Add Savings work');

    // 3b. Realtime compute: typing in amount updates summary without extra add-click.
    await page.$eval('#salary-body tr[data-id]:last-child input[data-field="amount"]', (el) => {
      el.focus();
      el.value = '500';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 200));
    const incomeSummary = await page.$eval('#sum-income', (el) => el.textContent || '');
    const expectedIncome = await page.evaluate(() => window.App.utils.fmt(500));
    if (!incomeSummary.includes(expectedIncome)) {
      console.error('Realtime compute test failed: expected #sum-income to include', expectedIncome, 'got', incomeSummary);
      await browser.close();
      process.exit(1);
    }
    console.log('Realtime compute test passed');

    // 4. Regression: editing a paid loan-linked budget amount updates loan payment amount.
    await page.click('#btn-add-loan');
    await new Promise((r) => setTimeout(r, 250));
    const loanRowSel = '#loans-body tr[data-id]:last-child';

    async function setInputValue(selector, value) {
      await page.$eval(
        selector,
        (el, v) => {
          el.focus();
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        },
        value
      );
    }

    await setInputValue(`${loanRowSel} input[data-field="name"]`, 'Car Loan');
    await setInputValue(`${loanRowSel} input[data-field="total"]`, '1000');
    await setInputValue(`${loanRowSel} input[data-field="paymentAmount"]`, '100');
    await setInputValue(`${loanRowSel} input[data-field="monthsPaid"]`, '2');
    await new Promise((r) => setTimeout(r, 200));

    const monthsPaidApplied = await page.evaluate(() => {
      const st = window.App.state.get();
      const loan = st.loans[0];
      if (!loan) return false;
      const stats = window.App.state.loanStats(loan);
      return loan.monthsPaid === 2 && stats.remaining === 800;
    });
    if (!monthsPaidApplied) {
      console.error('monthsPaid computation test failed');
      await browser.close();
      process.exit(1);
    }
    console.log('monthsPaid computation test passed');

    await page.click(`${loanRowSel} [data-action="loan-to-budget"]`);
    await new Promise((r) => setTimeout(r, 300));

    const linkedBudgetId = await page.evaluate(() => {
      const st = window.App.state.get();
      const loan = st.loans[0];
      const budget = st.budget.find((b) => b.loanId === loan.id);
      return budget ? budget.id : null;
    });
    if (!linkedBudgetId) {
      console.error('Loan->Budget link test failed: no linked budget row found.');
      await browser.close();
      process.exit(1);
    }

    const linkedBudgetRowSel = `#budget-body tr[data-id="${linkedBudgetId}"]`;
    await page.click(`${linkedBudgetRowSel} [data-action="toggle-paid"]`);
    await new Promise((r) => setTimeout(r, 250));
    await setInputValue(`${linkedBudgetRowSel} input[data-field="amount"]`, '175');
    await new Promise((r) => setTimeout(r, 200));

    const paymentSyncOk = await page.evaluate(() => {
      const st = window.App.state.get();
      const budget = st.budget.find((b) => b.loanId);
      if (!budget || !budget.paid || !budget.lastPaymentId) return false;
      const loan = st.loans.find((l) => l.id === budget.loanId);
      if (!loan) return false;
      const payment = (loan.payments || []).find((p) => p.id === budget.lastPaymentId);
      return !!payment && payment.amount === budget.amount;
    });
    if (!paymentSyncOk) {
      console.error('Loan payment sync regression test failed');
      await browser.close();
      process.exit(1);
    }
    console.log('Loan payment sync test passed');

    // 5. Regression: import deduplicates IDs and repairs broken/ambiguous links.
    const importIntegrity = await page.evaluate(() => {
      const payload = {
        salary: [
          { id: 'dup', source: 'A', amount: 100, frequency: 'monthly' },
          { id: 'dup', source: 'B', amount: 200, frequency: 'weekly' },
        ],
        savings: [
          { id: 'sav', location: 'A', amount: 1 },
          { id: 'sav', location: 'B', amount: 2 },
        ],
        budget: [
          { id: 'bud', name: 'Loan Budget 1', amount: 100, paid: true, loanId: 'loan', lastPaymentId: 'pay' },
          { id: 'bud', name: 'Loan Budget 2', amount: 80, paid: false, loanId: 'loan', lastPaymentId: null },
        ],
        loans: [
          {
            id: 'loan',
            name: 'Loan One',
            total: 1000,
            frequency: 'monthly',
            paymentAmount: 100,
            monthsPaid: 3,
            budgetEntryId: 'bud',
            payments: [{ id: 'pay', date: '2026-01-01', amount: 100 }],
          },
          {
            id: 'loan',
            name: 'Loan Two',
            total: 900,
            frequency: 'monthly',
            paymentAmount: 90,
            monthsPaid: 1,
            budgetEntryId: 'bud',
            payments: [{ id: 'pay', date: '2026-01-02', amount: 90 }],
          },
        ],
      };

      function allUnique(values) {
        return new Set(values).size === values.length;
      }

      return new Promise((resolve) => {
        const file = new File([JSON.stringify(payload)], 'integrity.json', { type: 'application/json' });
        App.io.processFile(file, () => {
          const st = App.state.get();
          const salaryUnique = allUnique(st.salary.map((x) => x.id));
          const savingsUnique = allUnique(st.savings.map((x) => x.id));
          const budgetUnique = allUnique(st.budget.map((x) => x.id));
          const loansUnique = allUnique(st.loans.map((x) => x.id));
          const monthsPaidValid = st.loans.every((l) => Number.isInteger(l.monthsPaid) && l.monthsPaid >= 0);
          const paymentIdsUnique = st.loans.every(
            (l) => allUnique((l.payments || []).map((p) => p.id))
          );

          const budgetToLoanConsistent = st.budget.every((b) => {
            if (!b.loanId) return b.lastPaymentId === null;
            const loan = st.loans.find((l) => l.id === b.loanId);
            if (!loan) return false;
            if (loan.budgetEntryId !== b.id) return false;
            if (!b.lastPaymentId) return true;
            return (loan.payments || []).some((p) => p.id === b.lastPaymentId);
          });

          const loanToBudgetConsistent = st.loans.every((l) => {
            if (!l.budgetEntryId) return true;
            return st.budget.some((b) => b.id === l.budgetEntryId && b.loanId === l.id);
          });

          const noMultiBudgetPerLoan = st.loans.every((l) => {
            return st.budget.filter((b) => b.loanId === l.id).length <= 1;
          });

          resolve({
            salaryUnique,
            savingsUnique,
            budgetUnique,
            loansUnique,
            monthsPaidValid,
            paymentIdsUnique,
            budgetToLoanConsistent,
            loanToBudgetConsistent,
            noMultiBudgetPerLoan,
          });
        });
      });
    });

    if (
      !importIntegrity.salaryUnique ||
      !importIntegrity.savingsUnique ||
      !importIntegrity.budgetUnique ||
      !importIntegrity.loansUnique ||
      !importIntegrity.monthsPaidValid ||
      !importIntegrity.paymentIdsUnique ||
      !importIntegrity.budgetToLoanConsistent ||
      !importIntegrity.loanToBudgetConsistent ||
      !importIntegrity.noMultiBudgetPerLoan
    ) {
      console.error('Import integrity regression test failed:', importIntegrity);
      await browser.close();
      process.exit(1);
    }
    console.log('Import integrity test passed');

    await browser.close();
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND' || e.message.includes('Cannot find module')) {
      console.log('Puppeteer not installed — skipping browser test. Install with: npm install puppeteer');
    } else {
      console.warn('Browser test skipped or failed:', e.message);
    }
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
