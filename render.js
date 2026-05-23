/**
 * render.js — All DOM rendering functions.
 * Depends on: utils.js (App.utils), state.js (App.state)
 */
(function () {
  'use strict';

  const { esc, fmt, fmtDate } = App.utils;
  const S = App.state;

  /* ──────────────────────────────────────────────────────
     ICON HELPER
     Uses lucide.createIcons() after injecting HTML, so we
     just write <i data-lucide="name"> in templates.
  ────────────────────────────────────────────────────── */
  function refreshIcons() {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  /* ──────────────────────────────────────────────────────
     FREQUENCY SELECT OPTIONS
  ────────────────────────────────────────────────────── */
  function freqOptions(selected) {
    return Object.entries(S.FREQ_LABELS)
      .map(([val, label]) =>
        `<option value="${esc(val)}" ${val === selected ? 'selected' : ''}>${esc(label)}</option>`
      )
      .join('');
  }

  /* ──────────────────────────────────────────────────────
     RENDER: SALARY
  ────────────────────────────────────────────────────── */
  function renderSalary() {
    const tbody = document.getElementById('salary-body');
    const totalEl = document.getElementById('salary-total');
    const entries = S.get().salary;

    if (!entries.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No income entries yet — add your first source below.</td>
        </tr>`;
      totalEl.textContent = '—';
      return;
    }

    const monthlyTotal = S.salaryTotal();
    let html = '';

    entries.forEach((e) => {
      const monthly = (e.amount || 0) * (S.FREQ_TO_MONTHLY[e.frequency] || 1);
      html += `
        <tr data-id="${esc(e.id)}">
          <td data-label="Source / Employer">
            <input
              class="input-inline"
              type="text"
              data-field="source"
              value="${esc(e.source)}"
              maxlength="100"
              placeholder="e.g. Acme Corp"
              aria-label="Income source name"
            >
          </td>
          <td data-label="Amount">
            <input
              class="input-inline mono"
              type="number"
              data-field="amount"
              value="${esc(e.amount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Income amount"
            >
          </td>
          <td data-label="Frequency">
            <select class="select-inline" data-field="frequency" aria-label="Pay frequency">
              ${freqOptions(e.frequency)}
            </select>
          </td>
          <td class="col-hide-sm" data-label="Monthly">
            <span class="mono" data-monthly-equiv style="color:var(--cyan);font-size:12px;">${esc(fmt(monthly))}</span>
            <span style="font-size:10px;color:var(--muted);">/mo</span>
          </td>
          <td data-label="">
            <button
              class="btn-icon"
              data-action="delete-salary"
              data-id="${esc(e.id)}"
              aria-label="Remove income entry"
            >
              <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
            </button>
          </td>
        </tr>`;
    });

    tbody.innerHTML = html;
    totalEl.textContent = fmt(monthlyTotal) + '/mo';
    refreshIcons();
  }

  /* ──────────────────────────────────────────────────────
     RENDER: SAVINGS
  ────────────────────────────────────────────────────── */
  function renderSavings() {
    const tbody = document.getElementById('savings-body');
    const totalEl = document.getElementById('savings-total');
    const entries = S.get().savings;

    if (!entries.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="3">No savings entries yet — add an account below.</td>
        </tr>`;
      totalEl.textContent = '—';
      return;
    }

    let html = '';
    entries.forEach((e) => {
      html += `
        <tr data-id="${esc(e.id)}">
          <td data-label="Institution">
            <input
              class="input-inline"
              type="text"
              data-field="location"
              value="${esc(e.location)}"
              maxlength="100"
              placeholder="e.g. Chase Savings"
              aria-label="Savings institution name"
            >
          </td>
          <td data-label="Balance">
            <input
              class="input-inline mono"
              type="number"
              data-field="amount"
              value="${esc(e.amount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Balance amount"
            >
          </td>
          <td data-label="">
            <button
              class="btn-icon"
              data-action="delete-savings"
              data-id="${esc(e.id)}"
              aria-label="Remove savings entry"
            >
              <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
            </button>
          </td>
        </tr>`;
    });

    tbody.innerHTML = html;
    totalEl.textContent = fmt(S.savingsTotal());
    refreshIcons();
  }

  /* ──────────────────────────────────────────────────────
     RENDER: BUDGET
  ────────────────────────────────────────────────────── */
  function renderBudget() {
    const tbody = document.getElementById('budget-body');
    const totalEl = document.getElementById('budget-total');
    const entries = S.get().budget;

    if (!entries.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">No budget items yet — add an expense or use "→ To Budget" on a loan.</td>
        </tr>`;
      totalEl.textContent = '—';
      return;
    }

    let html = '';
    entries.forEach((b) => {
      const isLoan   = !!b.loanId;
      const paidCls  = b.paid ? 'row-paid' : '';
      const typeTag  = isLoan
        ? `<span class="badge badge-red" style="font-size:10px;">Loan</span>`
        : `<span class="badge badge-muted" style="font-size:10px;">Expense</span>`;

      html += `
        <tr class="${paidCls}" data-id="${esc(b.id)}">
          <td class="col-check no-strike" data-label="Paid" style="text-align:center;">
            <input
              type="checkbox"
              class="paid-check"
              data-action="toggle-paid"
              data-id="${esc(b.id)}"
              ${b.paid ? 'checked' : ''}
              aria-label="Mark ${esc(b.name || 'item')} as fulfilled"
            >
          </td>
          <td data-label="Item">
            <input
              class="input-inline"
              type="text"
              data-field="name"
              value="${esc(b.name)}"
              maxlength="100"
              placeholder="e.g. Rent, Groceries…"
              aria-label="Budget item name"
              ${isLoan ? 'style="color:var(--text-secondary);"' : ''}
            >
          </td>
          <td data-label="Allocated">
            <input
              class="input-inline mono"
              type="number"
              data-field="amount"
              value="${esc(b.amount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Budget amount"
            >
          </td>
          <td class="col-hide-sm no-strike" data-label="Type">${typeTag}</td>
          <td class="no-strike" data-label="">
            <button
              class="btn-icon"
              data-action="delete-budget"
              data-id="${esc(b.id)}"
              aria-label="Remove budget item"
            >
              <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
            </button>
          </td>
        </tr>`;
    });

    tbody.innerHTML = html;
    totalEl.textContent = fmt(S.budgetTotal());
    refreshIcons();
  }

  /* ──────────────────────────────────────────────────────
     RENDER: LOANS
  ────────────────────────────────────────────────────── */
  function renderLoans() {
    const tbody = document.getElementById('loans-body');
    const totalEl = document.getElementById('loans-total');
    const entries = S.get().loans;

    if (!entries.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="8">No active loans — add one below.</td>
        </tr>`;
      totalEl.textContent = '—';
      return;
    }

    let html = '';

    entries.forEach((loan) => {
      const stats = S.loanStats(loan);
      const pct   = stats.progress.toFixed(1);
      const fillClass = stats.isDone ? 'done' : '';

      // Budget button
      const inBudget = !!loan.budgetEntryId;
      const budgetBtn = inBudget
        ? `<button class="btn-to-budget added" disabled aria-label="Already added to budget">
             <i data-lucide="check" style="width:10px;height:10px;pointer-events:none;"></i>
             In Budget
           </button>`
        : `<button class="btn-to-budget" data-action="loan-to-budget" data-id="${esc(loan.id)}" aria-label="Add loan payment to budget">
             <i data-lucide="plus" style="width:10px;height:10px;pointer-events:none;"></i>
             To Budget
           </button>`;

      // Remaining colour
      const remColor = stats.isDone ? 'color:var(--success)' : 'color:var(--text-secondary)';

      html += `
        <tr data-id="${esc(loan.id)}">
          <td data-label="Lender / Loan">
            <input
              class="input-inline"
              type="text"
              data-field="name"
              value="${esc(loan.name)}"
              maxlength="100"
              placeholder="e.g. Car Loan"
              aria-label="Loan name"
            >
          </td>
          <td class="col-hide-sm" data-label="Total">
            <input
              class="input-inline mono"
              type="number"
              data-field="total"
              value="${esc(loan.total)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Total loan amount"
            >
          </td>
          <td class="col-hide-sm" data-label="Per Payment">
            <input
              class="input-inline mono"
              type="number"
              data-field="paymentAmount"
              value="${esc(loan.paymentAmount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Payment amount"
            >
          </td>
          <td class="col-hide-sm" data-label="Months Paid">
            <input
              class="input-inline mono"
              type="number"
              data-field="monthsPaid"
              value="${esc(loan.monthsPaid || 0)}"
              min="0"
              step="1"
              placeholder="0"
              aria-label="Months already paid"
            >
          </td>
          <td class="col-hide-sm" data-label="Frequency">
            <select class="select-inline" data-field="frequency" aria-label="Payment frequency">
              ${freqOptions(loan.frequency)}
            </select>
          </td>
          <td data-label="Progress">
            <div class="progress-wrap">
              <div class="progress-track">
                <div
                  class="progress-fill ${fillClass}"
                  data-loan-progress-fill
                  style="width:${Math.min(100, stats.progress).toFixed(1)}%"
                ></div>
              </div>
              <div class="progress-labels">
                <span data-loan-progress-pct>${pct}%</span>
                <span data-loan-payments-left>${stats.paymentsLeft} left</span>
              </div>
            </div>
          </td>
          <td class="col-hide-sm" data-label="Remaining">
            <span class="mono" data-loan-remaining style="font-size:12px;${remColor}">
              ${esc(fmt(stats.remaining))}
            </span>
          </td>
          <td class="no-strike" data-label="">
            <div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">
              ${budgetBtn}
              <button
                class="btn-icon"
                data-action="delete-loan"
                data-id="${esc(loan.id)}"
                aria-label="Remove loan"
              >
                <i data-lucide="trash-2" style="width:14px;height:14px;pointer-events:none;"></i>
              </button>
            </div>
          </td>
        </tr>`;

      // Payment history sub-row (show last 10 payments)
      const payments = loan.payments || [];
      if (payments.length > 0) {
        const chips = payments
          .slice(-10)
          .map(
            (p) => `
              <span class="payment-chip" title="${esc(fmtDate(p.date))}">
                ${esc(fmt(p.amount))}
                <span class="payment-chip-date">${esc(fmtDate(p.date))}</span>
              </span>`
          )
          .join('');
        const extra = payments.length > 10
          ? `<span style="font-size:10px;color:var(--muted);">+${payments.length - 10} more</span>`
          : '';
        html += `
          <tr class="payment-history-row">
            <td colspan="8">
              <div class="payment-chips">
                <span style="font-size:10px;color:var(--muted);margin-right:2px;">Payments:</span>
                ${chips}
                ${extra}
              </div>
            </td>
          </tr>`;
      }
    });

    tbody.innerHTML = html;
    totalEl.textContent = 'Owed: ' + fmt(S.loansRemainingTotal());
    refreshIcons();
  }

  /* ──────────────────────────────────────────────────────
     RENDER: SUMMARY BAR
  ────────────────────────────────────────────────────── */
  function renderSummary() {
    const s = S.computeSummary();

    setElText('sum-income',     fmt(s.monthlySalary));
    setElText('sum-savings',    fmt(s.totalSavings));
    setElText('sum-expenses',   fmt(s.budgetExpenses));
    setElText('sum-loan-pmts',  fmt(s.loanPayments));
    setElText('sum-deductions', fmt(s.totalDeductions));
    setElText('sum-remaining',  fmt(s.remaining));

    const remEl = document.getElementById('sum-remaining');
    if (remEl) {
      remEl.className = 'sum-value ' + (s.remaining >= 0 ? 'color-success' : 'color-danger');
    }
  }

  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ──────────────────────────────────────────────────────
     RENDER ALL
  ────────────────────────────────────────────────────── */
  function renderAll() {
    renderSalary();
    renderSavings();
    renderBudget();
    renderLoans();
    renderSummary();
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.render = {
    salary:  renderSalary,
    savings: renderSavings,
    budget:  renderBudget,
    loans:   renderLoans,
    summary: renderSummary,
    all:     renderAll,
    icons:   refreshIcons,
  };
})();
