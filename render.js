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
    const disabled = S.isReadOnly() ? 'disabled' : '';

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
              ${disabled}
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
              ${disabled}
            >
          </td>
          <td data-label="Frequency">
            <select class="select-inline" data-field="frequency" aria-label="Pay frequency" ${disabled}>
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
              ${disabled}
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
    const disabled = S.isReadOnly() ? 'disabled' : '';

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
              ${disabled}
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
              ${disabled}
            >
          </td>
          <td data-label="">
            <button
              class="btn-icon"
              data-action="delete-savings"
              data-id="${esc(e.id)}"
              aria-label="Remove savings entry"
              ${disabled}
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
    const disabled = S.isReadOnly() ? 'disabled' : '';

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
            <label class="paid-control"><input
              type="checkbox"
              class="paid-check"
              data-action="toggle-paid"
              data-id="${esc(b.id)}"
              ${b.paid ? 'checked' : ''}
              aria-label="Mark ${esc(b.name || 'item')} as fulfilled"
              ${disabled}
            ><svg class="paid-check-visual" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7" /></svg></label>
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
              ${disabled}
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
              ${disabled}
            >
          </td>
          <td class="col-hide-sm no-strike" data-label="Repeat">${typeTag}
            <label class="repeat-control"><input type="checkbox" data-field="recurring" ${b.recurring || isLoan ? 'checked' : ''} ${isLoan ? 'disabled' : disabled} aria-label="Repeat ${esc(b.name || 'item')} next month"> Monthly</label>
          </td>
          <td class="no-strike" data-label="">
            <button
              class="btn-icon"
              data-action="delete-budget"
              data-id="${esc(b.id)}"
              aria-label="Remove budget item"
              ${disabled}
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
    const disabled = S.isReadOnly() ? 'disabled' : '';
    const compact = window.matchMedia('(max-width: 639px)').matches;

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
        : `<button class="btn-to-budget" data-action="loan-to-budget" data-id="${esc(loan.id)}" aria-label="Add loan payment to budget" ${disabled}>
             <i data-lucide="plus" style="width:10px;height:10px;pointer-events:none;"></i>
             To Budget
           </button>`;

      // Remaining colour
      const remColor = stats.isDone ? 'color:var(--success)' : 'color:var(--text-secondary)';

      html += `
        <tr data-id="${esc(loan.id)}" class="loan-row">
          <td data-label="Lender / Loan">
            <input
              class="input-inline"
              type="text"
              data-field="name"
              value="${esc(loan.name)}"
              maxlength="100"
              placeholder="e.g. Car Loan"
              aria-label="Loan name"
              ${disabled}
            >
            <button class="loan-details-toggle" data-action="toggle-loan-details" type="button" aria-expanded="false" aria-label="Show loan details"><i data-lucide="chevron-down" style="width:15px;height:15px;pointer-events:none;"></i></button>
          </td>
          <td class="col-hide-sm loan-detail" data-label="Total" ${compact ? 'inert' : ''}>
            <input
              class="input-inline mono"
              type="number"
              data-field="total"
              value="${esc(loan.total)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Total loan amount"
              ${disabled}
            >
          </td>
          <td class="col-hide-sm loan-detail" data-label="Per Payment" ${compact ? 'inert' : ''}>
            <input
              class="input-inline mono"
              type="number"
              data-field="paymentAmount"
              value="${esc(loan.paymentAmount)}"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-label="Payment amount"
              ${disabled}
            >
          </td>
          <td class="col-hide-sm loan-detail" data-label="Months Paid" ${compact ? 'inert' : ''}>
            <input
              class="input-inline mono"
              type="number"
              data-field="monthsPaid"
              value="${esc(loan.monthsPaid || 0)}"
              min="0"
              step="1"
              placeholder="0"
              aria-label="Months already paid"
              ${disabled}
            >
          </td>
          <td class="col-hide-sm loan-detail" data-label="Frequency" ${compact ? 'inert' : ''}>
            <select class="select-inline" data-field="frequency" aria-label="Payment frequency" ${disabled}>
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
                ${disabled}
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
    setElText('sum-paid', fmt(s.paid));
    setElText('sum-pending', fmt(s.pending));

    const remEl = document.getElementById('sum-remaining');
    if (remEl) {
      remEl.className = 'sum-value ' + (s.remaining >= 0 ? 'color-success' : 'color-danger');
    }
    if (App.persistence) App.persistence.requestSave();
  }

  function renderMonths() {
    const tabs = document.getElementById('month-tabs');
    if (!tabs) return;
    const monthList = S.listMonths();
    if (tabs.dataset.months !== monthList.join(',')) {
      tabs.dataset.months = monthList.join(',');
      tabs.innerHTML = '<span class="month-indicator" aria-hidden="true"></span>' + monthList.map((month) => `<button class="month-tab" data-month="${esc(month)}">${esc(new Date(month + '-01T12:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' }))}</button>`).join('');
    }
    tabs.querySelectorAll('.month-tab').forEach((button) => {
      const active = button.dataset.month === S.viewedMonth();
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    requestAnimationFrame(() => {
      const active = tabs.querySelector('.month-tab.active');
      const indicator = tabs.querySelector('.month-indicator');
      if (active && indicator) {
        indicator.style.left = active.offsetLeft + 'px';
        indicator.style.top = active.offsetTop + 'px';
        indicator.style.width = active.offsetWidth + 'px';
        indicator.style.height = active.offsetHeight + 'px';
      }
    });
    const label = document.getElementById('month-mode-label');
    if (label) label.textContent = S.isReadOnly() ? '· Past month (read only)' : '· Current draft';
    const savingsHeading = document.getElementById('savings-heading');
    if (savingsHeading) savingsHeading.textContent = S.isReadOnly() ? 'Savings Snapshot' : 'Current Savings';
    const loansHeading = document.getElementById('loans-heading');
    if (loansHeading) loansHeading.textContent = S.isReadOnly() ? 'Loan Snapshot' : 'Active Loans';
    const currencyNote = document.getElementById('currency-note');
    if (currencyNote) currencyNote.textContent = `${S.getCurrency().split('|')[0]} budget · changing currency relabels amounts without conversion`;
    const start = document.getElementById('btn-start-month');
    if (start) start.hidden = S.currentMonth() <= S.activeMonth();
    document.querySelectorAll('.card-footer .btn-add').forEach((button) => { button.disabled = S.isReadOnly(); });
  }

  function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ──────────────────────────────────────────────────────
     RENDER ALL
  ────────────────────────────────────────────────────── */
  function renderAll() {
    renderMonths();
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
    months:  renderMonths,
    icons:   refreshIcons,
  };
})();
