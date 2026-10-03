/** DOM rendering. Financial records stay in App.state; navigation stays in App.ui. */
(function () {
  'use strict';
  const { esc, fmt, fmtDate } = App.utils;
  const S = App.state;
  function icons() { if (window.lucide) lucide.createIcons(); }
  function text(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
  function disabled() { return S.isReadOnly() ? 'disabled' : ''; }
  function editName(kind, entry, name, subtitle = '') {
    return `<button class="entry-name" data-edit="${kind}" data-id="${esc(entry.id)}" ${kind === 'loans' ? '' : disabled()} aria-label="${kind === 'loans' ? 'View' : 'Edit'} ${esc(name || 'entry')}">${esc(name || 'Unnamed entry')}${subtitle ? `<small class="entry-subtitle">${esc(subtitle)}</small>` : ''}</button>`;
  }
  function staticName(name, subtitle = '') {
    return `<span class="entry-name">${esc(name || 'Unnamed entry')}${subtitle ? `<small class="entry-subtitle">${esc(subtitle)}</small>` : ''}</span>`;
  }
  function editButton(kind, entry, name) {
    return `<button class="btn-icon" data-edit="${kind}" data-id="${esc(entry.id)}" aria-label="Edit ${esc(name || 'entry')}" title="Edit entry" ${disabled()}><i data-lucide="pencil"></i></button>`;
  }
  function calculatorButton(entry, field, label) {
    const name = entry.name || entry.source || entry.location || 'Unnamed entry';
    return `<button type="button" class="btn-icon" data-open-calculator data-calc-field="${esc(field)}" aria-label="Calculate ${esc(label.toLowerCase())} for ${esc(name)}" title="Calculate ${esc(label.toLowerCase())}" aria-haspopup="dialog" aria-controls="calculator-panel" ${disabled()}><i data-lucide="calculator" aria-hidden="true"></i></button>`;
  }
  function amount(entry, field, label) {
    return `<span class="amount-field"><span class="currency-prefix" aria-hidden="true">${esc(App.utils.getCurrencySymbol())}</span><input class="input-inline amount-input" type="text" inputmode="decimal" data-money data-field="${field}" value="${esc(App.utils.formatAmount(entry[field]))}" aria-label="${esc(label)}" aria-description="Amount in ${esc(App.utils.getCurrencyCode())}" ${disabled()}></span>`;
  }
  function remove(kind, id, label) {
    return `<button class="btn-icon" data-action="delete-${kind}" data-id="${esc(id)}" aria-label="${label}" ${disabled()}><i data-lucide="trash-2"></i></button>`;
  }
  function paid(entry) {
    return `<label class="paid-control"><input type="checkbox" class="paid-check" data-action="toggle-paid" data-id="${esc(entry.id)}" ${entry.paid ? 'checked' : ''} aria-label="Mark ${esc(entry.name || 'item')} as paid" ${disabled()}><span class="paid-visual" aria-hidden="true">✓</span></label>`;
  }
  function empty(cols, message) { return `<tr class="empty-row"><td colspan="${cols}">${message}</td></tr>`; }
  function renderSalary() {
    const entries = S.get().salary;
    document.getElementById('salary-body').innerHTML = entries.length ? entries.map(e => `<tr data-id="${esc(e.id)}">
      <td class="account-name">${staticName(e.source, S.FREQ_LABELS[e.frequency])}</td>
      <td class="account-amount" data-label="Amount">${amount(e, 'amount', 'Income amount')}</td>
      <td class="account-equivalent" data-label="Monthly equivalent"><span class="numeric" data-monthly-equiv>${esc(fmt(e.amount * (S.FREQ_TO_MONTHLY[e.frequency] || 1)))}</span><small class="entry-subtitle">per month</small></td>
      <td class="row-actions account-actions"><div class="entry-actions">${calculatorButton(e, 'amount', 'Income amount')}${editButton('salary', e, e.source)}${remove('salary', e.id, 'Remove income entry')}</div></td></tr>`).join('') : empty(4, 'No income sources yet. Add your income to begin planning.');
    text('salary-total', fmt(S.salaryTotal()) + ' per month'); icons();
  }
  function renderSavings() {
    const entries = S.get().savings;
    document.getElementById('savings-body').innerHTML = entries.length ? entries.map(e => `<tr data-id="${esc(e.id)}"><td class="account-name">${staticName(e.location)}</td><td class="account-amount" data-label="Balance">${amount(e, 'amount', 'Balance amount')}</td><td class="row-actions account-actions"><div class="entry-actions">${calculatorButton(e, 'amount', 'Balance amount')}${editButton('savings', e, e.location)}${remove('savings', e.id, 'Remove savings entry')}</div></td></tr>`).join('') : empty(3, 'No savings balances yet. Add an account or wallet to track your savings.');
    text('savings-total', fmt(S.savingsTotal())); icons();
  }
  function renderBudget() {
    const all = S.get().budget;
    const filter = App.ui ? App.ui.getBudgetFilter() : 'all';
    const entries = all.filter(e => filter === 'all' || (filter === 'paid' ? e.paid : !e.paid));
    document.getElementById('budget-body').innerHTML = entries.length ? entries.map(b => `<tr data-id="${esc(b.id)}" class="${b.paid ? 'row-paid' : ''}">
      <td class="paid-cell" data-label="Paid">${paid(b)}<span class="paid-label">${b.paid ? 'Paid' : 'Unpaid'}</span></td>
      <td class="budget-name"><span class="entry-name" title="${esc(b.name || 'Unnamed entry')}">${esc(b.name || 'Unnamed entry')}</span></td>
      <td class="budget-amount" data-label="Allocated">${amount(b, 'amount', 'Budget amount')}</td>
      <td class="budget-repeat" data-label="Repeat"><small class="entry-subtitle">${b.loanId ? 'Linked loan payment' : 'Expense'}<span class="budget-mobile-repeat"> · ${b.recurring || b.loanId ? 'Monthly' : 'One-off'}</span></small><span class="badge">${b.recurring || b.loanId ? 'Monthly' : 'One-off'}</span></td>
      <td class="row-actions budget-actions"><div class="entry-actions">${calculatorButton(b, 'amount', 'Budget amount')}<button class="btn-icon" data-edit="budget" data-id="${esc(b.id)}" aria-label="Edit ${esc(b.name || 'budget item')}" title="Edit expense" ${disabled()}><i data-lucide="pencil"></i></button>${remove('budget', b.id, 'Remove budget item')}</div></td></tr>`).join('') : empty(5, all.length ? `No ${filter} items. Choose another filter to see your budget.` : 'No expenses yet. Add an expense or link a payment from Loans.');
    text('budget-total', fmt(S.budgetTotal()));
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    icons();
  }
  function renderLoans() {
    const loans = S.get().loans;
    document.getElementById('loans-body').innerHTML = loans.length ? loans.map(loan => {
      const stats = S.loanStats(loan);
      return `<article class="card loan-card" data-id="${esc(loan.id)}"><div class="loan-heading"><div>${editName('loans', loan, loan.name, `${S.FREQ_LABELS[loan.frequency]} · ${fmt(loan.paymentAmount)} / payment`)}</div><div class="loan-amount"><span class="eyebrow">Outstanding</span><strong class="loan-balance" data-loan-remaining>${esc(fmt(stats.remaining))}</strong></div></div>
      <progress value="${Math.min(100, stats.progress)}" max="100" aria-label="${esc(loan.name || 'Loan')} repayment progress"></progress><div class="progress-labels"><span data-loan-progress-pct>${stats.progress.toFixed(1)}%</span><span>${stats.isDone ? 'Fully paid' : `${stats.paymentsLeft} payments left`}</span></div>
      <div class="loan-footer"><div class="loan-starting"><span class="entry-subtitle">Months already paid</span>${App.ui.stepper(loan.monthsPaid, loan.id)}</div><div class="loan-actions"><button class="btn btn-ghost" data-action="loan-to-budget" data-id="${esc(loan.id)}" aria-label="${loan.budgetEntryId ? 'In budget' : 'Add to budget'}" ${loan.budgetEntryId ? 'disabled' : disabled()}>${loan.budgetEntryId ? 'In budget' : 'To budget'}</button><button class="btn-icon" data-edit="loans" data-id="${esc(loan.id)}" aria-label="View loan details" title="View details"><i data-lucide="pencil"></i></button>${remove('loan', loan.id, 'Remove loan')}</div></div></article>`;
    }).join('') : '<section class="card empty-state"><i data-lucide="credit-card"></i><h3>No loans to track</h3><p>Add a loan to see repayment progress and link its payments to your budget.</p><button class="btn btn-primary" data-add="loans">Add your first loan</button></section>';
    text('loans-total', 'Outstanding total ' + fmt(S.loansRemainingTotal())); icons();
  }
  function renderSummary() {
    const header = document.getElementById('btn-header-import');
    const hasData = S.hasData();
    header.dataset.headerAction = hasData ? 'export' : 'import';
    header.setAttribute('aria-controls', hasData ? 'export-modal' : 'import-modal');
    header.innerHTML = `<i data-lucide="${hasData ? 'download' : 'upload'}"></i>${hasData ? 'Export' : 'Import'}`;
    const s = S.computeSummary();
    Object.entries({ 'sum-income':s.monthlySalary, 'sum-savings':s.totalSavings, 'sum-expenses':s.budgetExpenses, 'sum-loan-pmts':s.loanPayments, 'sum-deductions':s.totalDeductions, 'sum-remaining':s.remaining, 'sum-paid':s.paid, 'sum-pending':s.pending, 'overview-planned':s.totalDeductions, 'overview-loans':S.loansRemainingTotal(), 'budget-remaining':s.remaining, 'budget-paid':s.paid, 'budget-pending':s.pending }).forEach(([id, value]) => text(id, fmt(value)));
    ['sum-remaining', 'budget-remaining'].forEach(id => document.getElementById(id).classList.toggle('color-danger', s.remaining < 0));
    text('allocation-note', s.remaining < 0 ? 'Your plan exceeds your income. Review your allocations.' : '');
    const percent = s.totalDeductions > 0 ? Math.min(100, s.paid / s.totalDeductions * 100) : 0;
    document.getElementById('payment-progress').value = percent;
    text('payment-percent', Math.round(percent) + '%');
    const unpaid = S.get().budget.filter(b => !b.paid);
    document.getElementById('overview-unpaid').innerHTML = unpaid.length ? unpaid.slice(0, 5).map(b => `<div class="unpaid-item">${paid(b)}<div><span>${esc(b.name || 'Unnamed item')}</span><small>${b.loanId ? 'Linked loan' : 'Expense'}${b.recurring || b.loanId ? ' · Monthly' : ''}</small></div><strong>${esc(fmt(b.amount))}</strong></div>`).join('') + (unpaid.length > 5 ? `<p class="list-footnote">${unpaid.length - 5} more unpaid items in your budget</p>` : '') : `<div class="empty-state compact"><p>${S.get().budget.length ? 'All planned items are paid.' : 'Your unpaid expenses will appear here.'}</p></div>`;
    document.getElementById('overview-welcome').hidden = Object.values(S.get()).some(entries => entries.length);
    icons();
    if (App.persistence) App.persistence.requestSave();
  }
  function renderMonths() {
    const key = S.viewedMonth();
    text('selected-month-label', App.ui.monthLabel(key));
    document.getElementById('month-picker-button').dataset.month = key;
    text('month-mode-label', key === S.currentMonth() ? 'This month' : key < S.currentMonth() ? 'Past month' : 'Planned month');
    document.getElementById('btn-copy-month').hidden = Object.values(S.get()).some(entries => entries.length) || S.listMonths().length < 2;
    document.querySelector('[data-month-shift="-1"]').disabled = key === '0001-01';
    document.querySelector('[data-month-shift="1"]').disabled = key === '9999-12';
  }

  function renderAll() {
    renderMonths(); renderSalary(); renderSavings(); renderBudget(); renderLoans(); renderSummary();
  }
  App.render = { salary:renderSalary, savings:renderSavings, budget:renderBudget, loans:renderLoans, summary:renderSummary, months:renderMonths, all:renderAll };
})();
