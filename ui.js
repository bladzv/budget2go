/**
 * ui.js — Toast notifications, export modal, and drop zone.
 * Depends on: utils.js (App.utils)
 */
(function () {
  'use strict';

  const { defaultFilename } = App.utils;

  /* ──────────────────────────────────────────────────────
     TOAST NOTIFICATIONS
  ────────────────────────────────────────────────────── */
  const TOAST_DURATION = 4200; // ms
  const TOAST_ICONS = {
    success: 'check-circle-2',
    error:   'alert-circle',
    info:    'info',
  };

  function toast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', 'alert');

    // Safe: we use textContent for user message, so no XSS
    const iconEl = document.createElement('span');
    iconEl.className = 'toast-icon';
    iconEl.innerHTML = `<i data-lucide="${TOAST_ICONS[type] || 'info'}" style="width:15px;height:15px;"></i>`;

    const msgEl = document.createElement('span');
    msgEl.className = 'toast-msg';
    msgEl.textContent = message; // textContent → XSS-safe

    el.appendChild(iconEl);
    el.appendChild(msgEl);
    container.appendChild(el);
    while (container.children.length > 3) container.firstElementChild.remove();

    // Render Lucide icon inside toast
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }

    // Auto-dismiss with fade-out
    const timer = setTimeout(() => dismissToast(el), TOAST_DURATION);
    el.addEventListener('click', () => {
      clearTimeout(timer);
      dismissToast(el);
    });
  }

  let undoTimer = null;
  let undoAction = null;
  function showUndo(message, action) {
    const bar = document.getElementById('undo-snackbar');
    const label = document.getElementById('undo-message');
    if (!bar || !label) return;
    if (undoTimer) clearTimeout(undoTimer);
    undoAction = action;
    label.textContent = message;
    bar.hidden = false;
    bar.classList.remove('closing');
    const progress = bar.querySelector('.undo-timer');
    if (progress) {
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = '';
    }
    undoTimer = setTimeout(() => { bar.hidden = true; undoAction = null; }, 6000);
  }

  function clearUndo() {
    clearTimeout(undoTimer);
    undoTimer = null;
    undoAction = null;
    document.getElementById('undo-snackbar').hidden = true;
    document.getElementById('undo-message').textContent = '';
  }

  function initUndo() {
    const button = document.getElementById('btn-undo');
    if (!button) return;
    button.addEventListener('click', () => {
      if (undoAction) undoAction();
      undoAction = null;
      clearTimeout(undoTimer);
      document.getElementById('undo-snackbar').hidden = true;
    });
  }

  // UI-only state never enters financial backups.
  const viewInfo = {
    overview: ['Overview', 'Your monthly plan at a glance.'],
    budget: ['Budget', 'Plan expenses and keep track of what is paid.'],
    accounts: ['Accounts', 'Your income sources and savings balances.'],
    loans: ['Loans', 'Keep your repayment progress in view.'],
    settings: ['Settings', 'Make it yours and keep your data safe.'],
  };
  let currentView = 'overview';
  let budgetFilter = 'all';
  let themePreference = 'system';
  let entryContext = null;
  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

  function setTheme(preference, persist = true) {
    themePreference = ['light', 'dark', 'system'].includes(preference) ? preference : 'system';
    const theme = themePreference === 'system' ? (themeMedia.matches ? 'dark' : 'light') : themePreference;
    document.documentElement.dataset.theme = theme;
    document.getElementById('theme-select').value = themePreference;
    document.getElementById('meta-theme-color').content = theme === 'dark' ? '#111318' : '#f7f8fa';
    if (persist) { try { localStorage.setItem('b2g-theme', themePreference); } catch (_) {} }
  }
  function navigate(view, focus = true) {
    if (!Object.keys(viewInfo).includes(view)) return;
    calcToggle(false);
    currentView = view;
    document.querySelectorAll('.app-view').forEach(section => section.hidden = section.id !== 'view-' + view);
    document.querySelectorAll('.nav-item').forEach(button => {
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('view-title').textContent = viewInfo[view][0];
    document.getElementById('view-description').textContent = viewInfo[view][1];
    document.getElementById('month-context').hidden = view === 'settings';
    if (focus) {
      document.getElementById('view-title').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  function goToView(view) {
    if (!Object.keys(viewInfo).includes(view)) return;
    if (location.hash === '#' + view) navigate(view);
    else { location.hash = view; navigate(view); }
  }
  function initShell() {
    let saved = 'system';
    try { saved = localStorage.getItem('b2g-theme') || 'system'; } catch (_) {}
    setTheme(saved, false);
    let grouping = true;
    try { grouping = localStorage.getItem('b2g-grouping') !== 'false'; } catch (_) {}
    App.utils.setGrouping(grouping);
    document.getElementById('grouping-toggle').checked = grouping;
    themeMedia.addEventListener('change', () => { if (themePreference === 'system') setTheme('system', false); });
    navigate(Object.keys(viewInfo).includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview', false);
    window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
    document.addEventListener('click', e => {
      const viewButton = e.target.closest('[data-view]');
      if (viewButton) goToView(viewButton.dataset.view);
      const add = e.target.closest('[data-add]');
      if (add && !add.disabled) openEntry(add.dataset.add);
      const edit = e.target.closest('[data-edit]');
      if (edit && !edit.disabled) openEntry(edit.dataset.edit, edit.dataset.id);
      if (e.target.closest('[data-close-welcome]')) closeWelcome();
      if (e.target.closest('[data-close-entry]') || e.target === document.getElementById('entry-modal')) closeEntry();
      if (e.target.closest('[data-open-import]')) openImportModal();
      const header = e.target.closest('[data-header-action]');
      if (header) header.dataset.headerAction === 'export' ? openModal() : openImportModal();
      const filter = e.target.closest('[data-filter]');
      if (filter) { budgetFilter = filter.dataset.filter; App.render.budget(); }
      if (e.target.closest('#history-more')) renderEntryHistory();
    });
    initMonthPicker();
    initSteppers();
    document.getElementById('entry-form').addEventListener('submit', submitEntry);
    document.getElementById('grouping-toggle').addEventListener('change', e => {
      App.utils.setGrouping(e.target.checked);
      try { localStorage.setItem('b2g-grouping', String(e.target.checked)); } catch (_) {}
      App.render.all();
    });
    document.addEventListener('input', e => {
      if (e.target.matches('input[data-money]')) e.target.setCustomValidity('');
    });
    document.addEventListener('blur', e => {
      if (!e.target.matches('input[data-money]')) return;
      const number = App.utils.parseAmount(e.target.value);
      if (number != null) e.target.value = App.utils.formatAmount(number);
    }, true);
  }
  function loanProgressLabel(frequency) {
    return { monthly: 'Months paid', 'bi-weekly': 'Biweekly periods paid', weekly: 'Weeks paid' }[frequency] || 'Months paid';
  }
  function stepper(value, loanId = null, max = 0, frequency = 'monthly') {
    const id = loanId ? 'loan-months-' + App.utils.esc(loanId) : 'entry-monthsPaid';
    const label = loanProgressLabel(frequency);
    value = Math.min(max, Math.max(0, Math.floor(value || 0)));
    return `<div class="stepper" ${loanId ? `data-loan-stepper="${App.utils.esc(loanId)}"` : ''}><button type="button" class="step-btn" data-step="-1" aria-label="Decrease ${label.toLowerCase()}" ${value <= 0 ? 'disabled' : ''}>−</button><input class="step-val" id="${id}" ${loanId ? '' : 'name="paidPeriods"'} type="number" min="0" max="${max}" step="1" value="${value}" aria-label="${label}" required><button type="button" class="step-btn" data-step="1" aria-label="Increase ${label.toLowerCase()}" ${value >= max ? 'disabled' : ''}>+</button></div>`;
  }
  function syncStepper(group, max = Number(group.querySelector('.step-val').max)) {
    const input = group.querySelector('.step-val');
    input.max = max;
    if (Number(input.value) > max) input.value = max;
    group.querySelector('[data-step="-1"]').disabled = Number(input.value) <= 0;
    group.querySelector('[data-step="1"]').disabled = Number(input.value) >= max;
  }
  function syncLoanFormStepper() {
    if (!entryContext || entryContext.kind !== 'loans') return;
    const frequency = document.getElementById('entry-frequency').value;
    const input = document.getElementById('entry-monthsPaid');
    const group = input.closest('.stepper');
    const label = loanProgressLabel(frequency);
    document.querySelector('label[for="entry-monthsPaid"]').textContent = label;
    input.setAttribute('aria-label', label);
    group.querySelector('[data-step="-1"]').setAttribute('aria-label', 'Decrease ' + label.toLowerCase());
    group.querySelector('[data-step="1"]').setAttribute('aria-label', 'Increase ' + label.toLowerCase());
    const total = App.utils.parseAmount(document.getElementById('entry-total').value);
    const paymentAmount = App.utils.parseAmount(document.getElementById('entry-paymentAmount').value);
    if (total == null || paymentAmount == null) return;
    syncStepper(group, App.state.loanPeriodsLimit({ total, paymentAmount, frequency }));
  }
  function initSteppers() {
    function commit(group, number) {
      const input = group.querySelector('.step-val');
      if (!Number.isSafeInteger(number) || number < 0) return;
      number = Math.min(number, Number(input.max));
      const id = group.dataset.loanStepper;
      if (id) {
        const loan = App.state.get().loans.find(item => item.id === id);
        if (!loan) return;
        if (number === App.state.loanProgress(loan).paidPeriods) { input.value = number; syncStepper(group); return; }
        App.state.updateLoanField(id, 'paidPeriods', number);
        input.value = number;
        const card = group.closest('.loan-card');
        const stats = App.state.loanStats(loan);
        card.querySelector('[data-loan-remaining]').textContent = App.utils.fmt(stats.remaining);
        card.querySelector('[data-loan-progress-pct]').textContent = stats.progress.toFixed(1) + '%';
        card.querySelector('progress').value = stats.progress;
        card.querySelector('.progress-labels span:last-child').textContent = stats.isDone ? 'Fully paid' : `${stats.paymentsLeft} payments left`;
        document.getElementById('loans-total').textContent = 'Outstanding total ' + App.utils.fmt(App.state.loansRemainingTotal());
        App.render.summary();
      } else input.value = number;
      const value = group.querySelector('.step-val');
      syncStepper(group);
      value.classList.remove('bump');
      void value.offsetWidth;
      value.classList.add('bump');
      setTimeout(() => value.classList.remove('bump'), 350);
    }
    document.addEventListener('click', e => {
      const button = e.target.closest('[data-step]');
      if (!button || button.disabled) return;
      const group = button.closest('.stepper');
      const input = group.querySelector('.step-val');
      const n = Number(input.value);
      if (!input.checkValidity()) { input.reportValidity(); return; }
      commit(group, Math.max(0, n + Number(button.dataset.step)));
    });
    document.addEventListener('input', e => {
      if (e.target.matches('#entry-total, #entry-paymentAmount')) syncLoanFormStepper();
      if (e.target.matches('.step-val')) syncStepper(e.target.closest('.stepper'));
    });
    document.addEventListener('change', e => {
      if (e.target.matches('#entry-frequency, #entry-total, #entry-paymentAmount')) syncLoanFormStepper();
      if (!e.target.matches('.step-val')) return;
      const group = e.target.closest('.stepper');
      const n = Number(e.target.value);
      if (!e.target.checkValidity() || !Number.isSafeInteger(n)) {
        const loan = group.dataset.loanStepper && App.state.get().loans.find(item => item.id === group.dataset.loanStepper);
        if (loan) { e.target.value = App.state.loanProgress(loan).paidPeriods; syncStepper(group); }
        else e.target.reportValidity();
        return;
      }
      commit(group, n);
    });
  }

  let pickerYear;
  function monthLabel(key, short = false) {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(2000, month - 1, 1); date.setFullYear(year);
    return date.toLocaleDateString(undefined, { month: short ? 'short' : 'long', year: 'numeric' });
  }
  function renderMonthPicker() {
    const S = App.state;
    document.getElementById('picker-year').value = pickerYear;
    document.querySelector('[data-year-shift="-1"]').disabled = pickerYear <= 1;
    document.querySelector('[data-year-shift="1"]').disabled = pickerYear >= 9999;
    const saved = S.listMonths();
    document.getElementById('month-grid').innerHTML = Array.from({length:12}, (_, n) => {
      const key = `${String(pickerYear).padStart(4, '0')}-${String(n + 1).padStart(2, '0')}`;
      const label = new Date(2000, n, 1).toLocaleDateString(undefined, {month:'short'});
      return `<button class="month-option" data-pick-month="${key}" aria-label="${monthLabel(key)}${saved.includes(key) ? ', saved' : ''}" aria-pressed="${key === S.viewedMonth()}"><span>${label}</span><span class="month-dot ${saved.includes(key) ? 'saved' : ''}" aria-hidden="true"></span></button>`;
    }).join('');
    const empty = !Object.values(S.get()).some(entries => entries.length);
    const sources = saved.filter(key => key !== S.viewedMonth());
    document.getElementById('copy-month-section').hidden = !empty || !sources.length;
    const select = document.getElementById('copy-month-source');
    const previous = select.value;
    select.innerHTML = sources.slice().reverse().map(key => `<option value="${key}">${monthLabel(key)}</option>`).join('');
    if (sources.includes(previous)) select.value = previous;
    else select.value = sources.filter(key => key < S.viewedMonth()).at(-1) || sources[0] || '';
  }
  function selectMonth(key) {
    if (!App.state.createMonth(key)) { toast('You can save up to 120 months. Export a backup before starting a separate document.', 'error'); return; }
    if (undoTimer) clearTimeout(undoTimer);
    undoAction = null; document.getElementById('undo-snackbar').hidden = true;
    calcToggle(false);
    closeDialog(document.getElementById('month-modal'));
    App.render.all();
    document.getElementById('month-picker-button').focus();
  }
  function initMonthPicker() {
    function open(copy = false) {
      pickerYear = Number(App.state.viewedMonth().slice(0, 4)); renderMonthPicker();
      openDialog(document.getElementById('month-modal'), document.getElementById(copy ? 'copy-month-source' : 'picker-year'));
    }
    document.getElementById('month-picker-button').addEventListener('click', () => open());
    document.getElementById('btn-copy-month').addEventListener('click', () => open(true));
    document.getElementById('picker-year').addEventListener('change', e => {
      if (!e.target.checkValidity()) { e.target.value = pickerYear; return; }
      pickerYear = Number(e.target.value); renderMonthPicker();
    });
    document.getElementById('btn-current-month').addEventListener('click', () => selectMonth(App.state.currentMonth()));
    document.getElementById('btn-confirm-copy').addEventListener('click', () => {
      if (!App.state.copyRecurring(document.getElementById('copy-month-source').value)) return;
      closeDialog(document.getElementById('month-modal')); App.render.all();
      document.getElementById('month-picker-button').focus();
      toast('Recurring items copied. Changes stay in this month.', 'success');
    });
    document.addEventListener('click', e => {
      const pick = e.target.closest('[data-pick-month]');
      if (pick) selectMonth(pick.dataset.pickMonth);
      const shift = e.target.closest('[data-month-shift]');
      if (shift && !shift.disabled) {
        const [year, month] = App.state.viewedMonth().split('-').map(Number);
        const index = (year - 1) * 12 + month - 1 + Number(shift.dataset.monthShift);
        if (index >= 0 && index < 9999 * 12) selectMonth(`${String(Math.floor(index / 12) + 1).padStart(4,'0')}-${String(index % 12 + 1).padStart(2,'0')}`);
      }
      const year = e.target.closest('[data-year-shift]');
      if (year && !year.disabled) { pickerYear += Number(year.dataset.yearShift); renderMonthPicker(); }
      if (e.target.closest('[data-close-month]') || e.target === document.getElementById('month-modal')) closeDialog(document.getElementById('month-modal'));
    });
  }

  function field(name, label, value, type = 'text', extra = '') {
    const e = App.utils.esc;
    const money = type === 'number' && name !== 'monthsPaid';
    const formatted = money ? App.utils.formatAmount(value || 0) : value == null ? '' : value;
    const input = `<input class="form-input" id="entry-${name}" name="${name}" type="${money ? 'text' : type}" value="${e(formatted)}" ${money ? 'data-money inputmode="decimal"' : type === 'text' ? 'maxlength="100"' : 'min="0" step="1"'} ${extra}>`;
    return `<label class="form-label" for="entry-${name}">${label}</label>` + (money ? `<div class="form-amount">${input}<button type="button" class="btn-icon" data-open-calculator data-calc-target="entry-${name}" aria-label="Calculate ${e(label.toLowerCase())}" title="Calculate ${e(label.toLowerCase())}" aria-haspopup="dialog" aria-controls="calculator-panel"><i data-lucide="calculator" aria-hidden="true"></i></button></div>` : input);
  }
  function frequency(value) {
    return `<label class="form-label" for="entry-frequency">Frequency</label><div class="select-control"><select class="form-input" name="frequency" id="entry-frequency">${Object.entries(App.state.FREQ_LABELS).map(([key, label]) => `<option value="${key}" ${key === value ? 'selected' : ''}>${label}</option>`).join('')}</select><i data-lucide="chevron-down" aria-hidden="true"></i></div>`;
  }
  function openEntry(kind, id = null) {
    const S = App.state;
    if (!['salary', 'savings', 'budget', 'loans'].includes(kind) || (S.isReadOnly() && (!id || kind !== 'loans'))) return;
    const record = id ? S.get()[kind].find(entry => entry.id === id) : {};
    if (!record) return;
    calcToggle(false);
    entryContext = { kind, id, month: S.viewedMonth(), historyCount: 0 };
    const titles = { salary:'income source', savings:'savings account', budget:'expense', loans:'loan' };
    document.getElementById('entry-heading').textContent = (S.isReadOnly() ? 'View ' : id ? 'Edit ' : 'Add ') + titles[kind];
    const nameField = kind === 'salary' ? 'source' : kind === 'savings' ? 'location' : 'name';
    const nameLabel = { salary:'Source / employer', savings:'Institution / wallet', budget:'Item / description', loans:'Lender / loan name' }[kind];
    let html = field(nameField, nameLabel, record[nameField], 'text', 'required');
    if (kind === 'loans') {
      html += field('total', 'Total loan amount', record.total || 0, 'number', 'required');
      html += field('paymentAmount', 'Amount per payment', record.paymentAmount || 0, 'number', 'required');
      html += frequency(record.frequency || 'monthly');
      const starting = S.loanProgress(record);
      html += `<label class="form-label" for="entry-monthsPaid">${loanProgressLabel(record.frequency)}</label>` + stepper(starting.paidPeriods, null, S.loanPeriodsLimit(record), record.frequency);
      html += `<p class="form-hint">This starting progress is added to recorded payments.${starting.startingCredit > 0 ? ' Includes ' + App.utils.esc(App.utils.fmt(starting.startingCredit)) + ' in prior partial-period credit.' : ''}</p>`;
      html += '<section class="entry-history"><h3>Payment history</h3><div id="entry-history-list"></div><button class="btn btn-ghost" id="history-more" type="button" hidden>Show more payments</button></section>';
    } else {
      html += field('amount', kind === 'savings' ? 'Balance' : kind === 'salary' ? 'Amount per pay period' : 'Allocated amount', record.amount || 0, 'number', 'required');
      if (kind === 'salary') html += frequency(record.frequency || 'monthly');
      if (kind === 'budget') html += `<label class="form-check"><input type="checkbox" name="recurring" id="entry-recurring" ${record.recurring || record.loanId ? 'checked' : ''} ${record.loanId ? 'disabled' : ''}>Repeat next month</label>${record.loanId ? '<p class="form-hint">Linked loan payments repeat monthly. Changing a paid allocation also updates its recorded payment.</p>' : ''}`;
    }
    document.getElementById('entry-fields').innerHTML = html;
    if (window.lucide) lucide.createIcons();
    if (kind === 'loans') {
      document.getElementById('entry-monthsPaid').step = '1';
      renderEntryHistory();
    }
    document.getElementById('entry-submit').hidden = S.isReadOnly();
    if (S.isReadOnly()) document.querySelectorAll('#entry-fields input, #entry-fields select, #entry-fields [data-open-calculator]').forEach(input => input.disabled = true);
    // Keep calculator controls within the form dialog's focus boundary.
    document.querySelector('#entry-modal .modal-box').appendChild(calcPanelEl());
    openDialog(document.getElementById('entry-modal'), S.isReadOnly() ? document.querySelector('[data-close-entry]') : document.getElementById('entry-' + nameField));
  }
  function renderEntryHistory() {
    if (!entryContext || entryContext.kind !== 'loans') return;
    const loan = App.state.get().loans.find(entry => entry.id === entryContext.id);
    const payments = loan ? loan.payments || [] : [];
    const { esc, fmt, fmtDate } = App.utils;
    const target = document.getElementById('entry-history-list');
    if (!payments.length) { target.innerHTML = '<p class="form-hint">No recorded payments yet. Mark a linked budget item paid to record one.</p>'; return; }
    const reversed = [...payments].reverse();
    const start = entryContext.historyCount;
    entryContext.historyCount = Math.min(start + 20, payments.length);
    target.insertAdjacentHTML('beforeend', reversed.slice(start, entryContext.historyCount).map(payment => `<div class="history-item"><time>${esc(fmtDate(payment.date))}</time><strong>${esc(fmt(payment.amount))}</strong></div>`).join(''));
    document.getElementById('history-more').hidden = entryContext.historyCount >= payments.length;
  }
  function closeEntry() {
    calcToggle(false);
    calcLastTargetInput = null;
    closeDialog(document.getElementById('entry-modal'));
    document.body.appendChild(calcPanelEl());
    entryContext = null;
    document.getElementById('entry-fields').textContent = '';
  }
  function submitEntry(e) {
    e.preventDefault();
    const S = App.state;
    if (!entryContext || S.isReadOnly() || S.viewedMonth() !== entryContext.month) { closeEntry(); return; }
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    for (const input of form.querySelectorAll('[data-money]')) {
      const number = App.utils.parseAmount(input.value);
      if (number == null) {
        input.setCustomValidity('Enter a valid, non-negative amount with at most two decimal places.');
        input.reportValidity(); return;
      }
      values[input.name] = number;
    }
    const nameField = entryContext.kind === 'salary' ? 'source' : entryContext.kind === 'savings' ? 'location' : 'name';
    if (!values[nameField].trim()) {
      const input = form.elements[nameField];
      input.setCustomValidity('Enter a name for this entry.'); input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), { once:true });
      return;
    }
    const { kind } = entryContext;
    let { id } = entryContext;
    const update = { salary:S.updateSalaryField, savings:S.updateSavingsField, budget:S.updateBudgetField, loans:S.updateLoanField }[kind];
    if (id) {
      Object.entries(values).forEach(([key, value]) => update(id, key, value));
      if (kind === 'budget') {
        const record = S.get().budget.find(entry => entry.id === id);
        update(id, 'recurring', !!record.loanId || form.elements.recurring.checked);
      }
    } else if (kind === 'salary') id = S.addSalary(values);
    else if (kind === 'savings') id = S.addSavings(values);
    else if (kind === 'loans') id = S.addLoan(values);
    else id = S.addBudget(values.name, values.amount, null, form.elements.recurring.checked);
    closeEntry();
    App.render.all();
    const owner = kind === 'salary' || kind === 'savings' ? 'accounts' : kind === 'loans' ? 'loans' : 'budget';
    if (currentView === owner) {
      const control = document.querySelector('#view-' + owner + ' [data-edit][data-id="' + CSS.escape(id) + '"]');
      if (control) control.focus();
    }
  }

  const WELCOME_KEY = 'b2g-welcome-seen';
  let welcomeDismissed = false;
  function showWelcome() {
    if (welcomeDismissed) return;
    try { if (localStorage.getItem(WELCOME_KEY) === 'true') { welcomeDismissed = true; return; } } catch (_) {}
    openDialog(document.getElementById('welcome-modal'), document.getElementById('btn-welcome-start'));
  }
  function closeWelcome() {
    welcomeDismissed = true;
    try { localStorage.setItem(WELCOME_KEY, 'true'); } catch (_) {}
    closeDialog(document.getElementById('welcome-modal'));
    document.getElementById('view-title').focus({ preventScroll: true });
  }

  let activeDialog = null;
  let dialogReturnFocus = null;
  let dialogInert = [];
  function openDialog(modal, focusTarget) {
    dialogReturnFocus = document.activeElement;
    dialogInert = [...document.body.children].filter(el => !el.contains(modal) && !['SCRIPT', 'STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
    dialogInert.forEach(([el]) => el.inert = true);
    activeDialog = modal;
    modal.removeAttribute('hidden');
    (focusTarget || modal.querySelector('button, input, select')).focus();
  }
  function closeDialog(modal) {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    if (activeDialog === modal) {
      activeDialog = null;
      dialogInert.forEach(([el, wasInert]) => el.inert = wasInert);
      dialogInert = [];
      if (dialogReturnFocus && document.contains(dialogReturnFocus)) dialogReturnFocus.focus();
    }
  }

  function dismissToast(el) {
    el.classList.add('out');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 320);
  }

  /* ──────────────────────────────────────────────────────
     EXPORT MODAL
  ────────────────────────────────────────────────────── */
  const exportModalEl     = () => document.getElementById('export-modal');
  const filenameEl        = () => document.getElementById('export-filename');
  const previewEl         = () => document.getElementById('filename-preview');
  const exportTimestampEl = () => document.getElementById('export-timestamp');
  let exportTimestampFilename = '';
  const exportEncryptEl   = () => document.getElementById('export-encrypt');
  const exportPwdWrapEl   = () => document.getElementById('export-password-wrap');
  const exportPwdEl       = () => document.getElementById('export-password');
  const exportJsonBtnEl   = () => document.getElementById('btn-export-json');
  const exportCsvBtnEl    = () => document.getElementById('btn-export-csv');
  const exportJsonLabelEl = () => document.getElementById('export-json-label');
  const exportCsvLabelEl  = () => document.getElementById('export-csv-label');
  const exportJsonHintEl  = () => document.getElementById('export-json-target');
  const exportCsvHintEl   = () => document.getElementById('export-csv-target');

  function renderHintWithCode(target, prefixText, codeText) {
    if (!target) return;
    target.textContent = '';
    target.appendChild(document.createTextNode(prefixText + ' '));
    const code = document.createElement('code');
    code.textContent = codeText;
    target.appendChild(code);
  }

  function expectedExportFilename(ext, encrypted) {
    var base = getModalFilename();
    return base + (encrypted ? '.bgo' : ext);
  }

  function syncExportTargetHints() {
    const encrypted = !!(exportEncryptEl() && exportEncryptEl().checked);
    const jsonBtn = exportJsonBtnEl();
    const csvBtn = exportCsvBtnEl();
    const jsonLabel = exportJsonLabelEl();
    const csvLabel = exportCsvLabelEl();
    const jsonHint = exportJsonHintEl();
    const csvHint = exportCsvHintEl();
    const jsonName = expectedExportFilename('.json', encrypted);
    const csvName = expectedExportFilename('.csv', encrypted);

    if (jsonBtn && jsonLabel) jsonLabel.textContent = encrypted ? 'Download Encrypted JSON' : 'Download JSON';
    if (csvBtn && csvLabel) csvLabel.textContent = encrypted ? 'Download Encrypted CSV' : 'Download CSV';
    renderHintWithCode(jsonHint, 'JSON will save as:', jsonName);
    renderHintWithCode(csvHint, 'CSV will save as:', csvName);
    if (previewEl()) previewEl().textContent = defaultExportFilename() + (encrypted ? '.bgo' : '.json');
  }

  function syncExportEncryptionUI() {
    const checked = !!(exportEncryptEl() && exportEncryptEl().checked);
    const wrap = exportPwdWrapEl();
    const input = exportPwdEl();
    if (wrap) wrap.hidden = !checked;
    if (input) {
      if (checked) input.focus();
      if (!checked) input.value = '';
    }
    syncExportTargetHints();
  }

  let exportBusy = false;
  let awaitingExportWipe = false;
  let wipeBusy = false;
  function setExportBusy(busy, message = 'Preparing backup…') {
    exportBusy = busy;
    const modal = exportModalEl();
    modal.setAttribute('aria-busy', String(busy));
    modal.querySelectorAll('button, input').forEach(control => control.disabled = busy);
    const status = document.getElementById('export-status');
    status.hidden = !busy;
    status.textContent = busy ? message : '';
    if (busy) status.focus();
  }
  function resetExportDialog() {
    awaitingExportWipe = false;
    document.getElementById('export-options').hidden = false;
    document.getElementById('export-actions').hidden = false;
    document.getElementById('export-wipe-confirmation').hidden = true;
    document.getElementById('export-backup-name').textContent = '';
    document.getElementById('export-heading-label').textContent = 'Export Data';
    document.getElementById('export-wipe').checked = false;
    exportPwdEl().value = '';
  }
  async function exportFromDialog(format) {
    if (exportBusy || awaitingExportWipe || exportModalEl().hidden || !['json', 'csv'].includes(format)) return;
    const wipeAfter = document.getElementById('export-wipe').checked;
    const filename = getModalFilename();
    const options = getExportOptions();
    setExportBusy(true);
    try {
      const result = await (format === 'json' ? App.io.exportJSON : App.io.exportCSV)(filename, options);
      setExportBusy(false);
      exportPwdEl().value = '';
      if (!wipeAfter) { closeModal(); return; }
      awaitingExportWipe = true;
      document.getElementById('export-options').hidden = true;
      document.getElementById('export-actions').hidden = true;
      document.getElementById('export-wipe-confirmation').hidden = false;
      document.getElementById('export-heading-label').textContent = 'Backup download started';
      document.getElementById('export-backup-name').textContent = result.filename;
      document.getElementById('btn-export-keep').focus();
    } catch (err) {
      setExportBusy(false);
      exportPwdEl().value = '';
      document.getElementById('export-status').hidden = false;
      document.getElementById('export-status').textContent = err.message || 'Export failed. Your data has been kept.';
      toast(err.message || 'Export failed. Your data has been kept.', 'error');
      document.getElementById('btn-export-' + format).focus();
    }
  }
  async function confirmExportWipe() {
    if (!awaitingExportWipe || exportBusy || wipeBusy) return;
    awaitingExportWipe = false;
    setExportBusy(true, 'Clearing local data…');
    try { await clearLocalData(); }
    finally {
      setExportBusy(false);
      closeModal();
      document.getElementById('view-title').focus({ preventScroll: true });
    }
  }

  function openModal() {
    const modal    = exportModalEl();
    const fnInput  = filenameEl();
    const encChk   = exportEncryptEl();

    if (!modal || exportBusy) return;
    // Freeze the default so the downloaded name matches the preview, even after waiting.
    exportTimestampFilename = defaultFilename();
    resetExportDialog();
    setExportBusy(false);
    openDialog(modal, fnInput);
    if (fnInput) fnInput.value = '';
    if (encChk) encChk.checked = false;
    if (exportPwdEl()) exportPwdEl().value = '';
    syncExportEncryptionUI();
    syncExportTargetHints();

    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function closeModal() {
    if (exportBusy) return;
    const modal = exportModalEl();
    closeDialog(modal);
    resetExportDialog();
  }

  function defaultExportFilename() {
    return exportTimestampEl().checked ? (exportTimestampFilename || defaultFilename()) : defaultFilename(false);
  }
  function getModalFilename() {
    const raw = (filenameEl() || {}).value || '';
    return App.utils.sanitizeFilename(raw) || defaultExportFilename();
  }

  function getExportOptions() {
    const encrypt = !!(exportEncryptEl() && exportEncryptEl().checked);
    return {
      encrypt: encrypt,
      password: encrypt ? ((exportPwdEl() || {}).value || '') : '',
    };
  }

  /* ──────────────────────────────────────────────────────
     IMPORT MODAL
  ────────────────────────────────────────────────────── */
  const importModalEl      = () => document.getElementById('import-modal');
  const importEncryptedEl  = () => document.getElementById('import-is-encrypted');
  const importPwdWrapEl    = () => document.getElementById('import-password-wrap');
  const importPwdEl        = () => document.getElementById('import-password');
  const importMetaEl       = () => document.getElementById('import-file-meta');
  const importSubmitEl     = () => document.getElementById('btn-import-submit');
  const importDropZoneEl   = () => document.getElementById('drop-zone');
  const importDropTitleEl  = () => document.getElementById('drop-zone-title');
  const importDropSubEl    = () => document.getElementById('drop-zone-sub');
  const privacyModalEl     = () => document.getElementById('privacy-modal');
  const privacyStorageEl   = () => document.getElementById('privacy-storage');
  const privacyCachesEl    = () => document.getElementById('privacy-caches');
  const privacyLastExportEl = () => document.getElementById('privacy-last-export');
  const privacyLastEncryptedEl = () => document.getElementById('privacy-last-encrypted');
  const privacyOutboundEl  = () => document.getElementById('privacy-outbound-count');
  let importGeneration = 0;
  let pendingImportFile = null;
  let previewDocument = null;
  let calcLastTargetInput = null;
  let privacyMonitorInstalled = false;
  const privacyStats = {
    outboundRequests: 0,
  };

  function selectedImportExt() {
    if (!pendingImportFile || !pendingImportFile.name) return '';
    const parts = String(pendingImportFile.name).toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
  }

  function fmtFileSize(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = n;
    let idx = 0;
    while (size >= 1024 && idx < units.length - 1) {
      size = size / 1024;
      idx += 1;
    }
    return (idx === 0 ? String(Math.round(size)) : size.toFixed(1)) + ' ' + units[idx];
  }

  function syncImportControls() {
    const chk = importEncryptedEl();
    const pwdInput = importPwdEl();
    const meta = importMetaEl();
    const submit = importSubmitEl();
    const zone = importDropZoneEl();
    const zoneTitle = importDropTitleEl();
    const zoneSub = importDropSubEl();
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    const hasFile = !!pendingImportFile;
    if (zone) zone.setAttribute('aria-label', mobile ? 'Choose a file to import' : 'Click or drag a file to import');
    const ext = selectedImportExt();
    const checked = !!(chk && chk.checked);
    const pwd = String((pwdInput || {}).value || '').trim();

    if (meta) {
      if (!hasFile) {
        meta.textContent = 'No file selected.';
      } else {
        meta.textContent = 'Selected: ' + pendingImportFile.name;
      }
    }

    if (zone) zone.classList.toggle('has-file', hasFile);
    if (zoneTitle) {
      if (hasFile) {
        zoneTitle.textContent = 'Selected: ' + pendingImportFile.name;
      } else {
        zoneTitle.innerHTML = mobile ? '<strong>Tap to choose a file</strong>' : 'Drop your file here or <strong>click to browse</strong>';
      }
    }
    if (zoneSub) {
      if (hasFile) {
        zoneSub.textContent = fmtFileSize(pendingImportFile.size) + (mobile ? ' · Tap to choose another file' : ' · Click or drop another file to replace');
      } else {
        zoneSub.textContent = 'Supports .json, .csv, and encrypted .bgo exports';
      }
    }

    if (chk) chk.disabled = false;

    const needsPwd = checked || ext === 'bgo';
    const showPwd = needsPwd;
    const pwdWrap = importPwdWrapEl();
    if (pwdWrap) pwdWrap.hidden = !showPwd;

    const canSubmit =
      hasFile &&
      (!needsPwd || pwd.length > 0);

    if (submit) submit.disabled = !canSubmit;
  }

  function setPendingImportFile(file) {
    importGeneration += 1;
    pendingImportFile = file || null;
    if (!pendingImportFile) document.getElementById('file-input').value = '';
    previewDocument = null;
    const preview = document.getElementById('import-preview');
    if (preview) { preview.hidden = true; preview.textContent = ''; }
    const submit = importSubmitEl();
    if (submit) submit.textContent = 'Preview Import';
    const chk = importEncryptedEl();
    if (!pendingImportFile && chk) chk.checked = false;
    if (importPwdEl()) importPwdEl().value = '';
    syncImportControls();
  }

  function syncImportEncryptionUI() {
    if (!(importEncryptedEl() && importEncryptedEl().checked) && importPwdEl()) {
      importPwdEl().value = '';
    }
    syncImportControls();
  }

  function openImportModal() {
    const modal = importModalEl();
    if (!modal) return;
    openDialog(modal, importDropZoneEl());
    setPendingImportFile(null);
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function closeImportModal() {
    const modal = importModalEl();
    closeDialog(modal);
    setPendingImportFile(null);
  }

  function getImportOptions() {
    const encrypted = selectedImportExt() === 'bgo' || !!(importEncryptedEl() && importEncryptedEl().checked);
    return {
      encrypted: encrypted,
      password: encrypted ? ((importPwdEl() || {}).value || '') : '',
    };
  }

  async function submitImport() {
    if (!pendingImportFile) return;
    const button = importSubmitEl();
    if (previewDocument) {
      try {
        App.io.applyImport(previewDocument);
        const saved = App.persistence.flush();
        closeImportModal();
        setPendingImportFile(null);
        toast(saved ? 'Import complete. Local draft saved.' : 'Import complete, but local saving failed. Export a backup.', saved ? 'success' : 'error');
      } catch (err) { toast('Import failed: ' + String(err.message || err), 'error'); }
      return;
    }
    const generation = importGeneration;
    if (button) { button.disabled = true; button.textContent = 'Reading…'; }
    try {
      const doc = await App.io.processFile(pendingImportFile, null, getImportOptions());
      if (generation !== importGeneration) return;
      previewDocument = doc;
      const preview = document.getElementById('import-preview');
      const count = Object.keys(doc.months).length;
      const current = doc.months[doc.viewedMonth || doc.activeMonth];
      if (preview) {
        preview.textContent = `${count} month${count === 1 ? '' : 's'} · selected ${doc.viewedMonth || doc.activeMonth} · ${doc.currency.split('|')[0]} · ${current.salary.length} income · ${current.budget.length} budget items · ${current.loans.length} loans. Import will replace this device's current draft.`;
        preview.hidden = false;
      }
      if (button) button.textContent = 'Replace Draft and Import';
    } catch (err) {
      if (generation !== importGeneration) return;
      toast('Import failed: ' + String(err.message || err), 'error');
      if (button) button.textContent = 'Preview Import';
    } finally {
      if (button && generation === importGeneration) button.disabled = false;
    }
  }

  function fmtBytes(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = n;
    let idx = 0;
    while (value >= 1024 && idx < units.length - 1) {
      value /= 1024;
      idx += 1;
    }
    return (idx === 0 ? String(Math.round(value)) : value.toFixed(1)) + ' ' + units[idx];
  }

  function readLocalStorageUsage() {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i) || '';
        const value = localStorage.getItem(key) || '';
        total += key.length + value.length;
      }
    } catch (_) {}
    return total * 2;
  }

  function readLastExportMeta() {
    try {
      const raw = localStorage.getItem('b2g-last-export');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function isOutboundUrl(rawUrl) {
    try {
      const u = new URL(String(rawUrl || ''), window.location.href);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      return u.origin !== window.location.origin;
    } catch (_) {
      return false;
    }
  }

  function installPrivacyMonitor() {
    if (privacyMonitorInstalled) return;
    privacyMonitorInstalled = true;

    if (typeof window.fetch === 'function') {
      const baseFetch = window.fetch.bind(window);
      window.fetch = function (...args) {
        const candidate = args[0] && args[0].url ? args[0].url : args[0];
        if (isOutboundUrl(candidate)) privacyStats.outboundRequests += 1;
        return baseFetch(...args);
      };
    }

    if (window.XMLHttpRequest && XMLHttpRequest.prototype && XMLHttpRequest.prototype.open) {
      const baseOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        if (isOutboundUrl(url)) privacyStats.outboundRequests += 1;
        return baseOpen.call(this, method, url, async, user, password);
      };
    }

    if (typeof window.WebSocket === 'function') {
      const BaseWebSocket = window.WebSocket;
      function WrappedWebSocket(url, protocols) {
        if (isOutboundUrl(url)) privacyStats.outboundRequests += 1;
        return protocols ? new BaseWebSocket(url, protocols) : new BaseWebSocket(url);
      }
      WrappedWebSocket.prototype = BaseWebSocket.prototype;
      window.WebSocket = WrappedWebSocket;
    }
  }

  async function refreshPrivacyDashboard() {
    if (privacyStorageEl()) {
      privacyStorageEl().textContent = fmtBytes(readLocalStorageUsage());
    }
    if (privacyCachesEl()) {
      let count = 0;
      try {
        if (window.caches && typeof caches.keys === 'function') {
          const keys = await caches.keys();
          count = keys.length;
        }
      } catch (_) {}
      privacyCachesEl().textContent = String(count);
    }
    const meta = readLastExportMeta();
    if (privacyLastExportEl()) {
      if (!meta || !meta.at) {
        privacyLastExportEl().textContent = 'Never';
      } else {
        const dt = new Date(meta.at);
        privacyLastExportEl().textContent = Number.isNaN(dt.getTime()) ? 'Unknown' : dt.toLocaleString();
      }
    }
    if (privacyLastEncryptedEl()) {
      privacyLastEncryptedEl().textContent = meta && meta.encrypted ? 'Yes' : 'No';
    }
    if (privacyOutboundEl()) {
      privacyOutboundEl().textContent = String(privacyStats.outboundRequests);
    }
  }

  function openPrivacyModal() {
    const modal = privacyModalEl();
    if (!modal) return;
    openDialog(modal, document.getElementById('btn-privacy-close'));
    refreshPrivacyDashboard();
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function closePrivacyModal() {
    const modal = privacyModalEl();
    closeDialog(modal);
  }

  async function clearLocalData() {
    if (wipeBusy) return false;
    wipeBusy = true;
    const frozen = [...document.body.children].filter(el => !el.contains(activeDialog) && !['SCRIPT', 'STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
    frozen.forEach(([el]) => el.inert = true);
    try {
      // Suspend autosave for the entire cleanup so no old or empty draft is written back.
      if (!App.persistence.clear({ resumeAfter: false })) {
        toast('Could not delete the saved draft. Your records have been kept; try wiping again.', 'error');
        return false;
      }
      clearUndo();
      setPendingImportFile(null);
      if (entryContext) closeEntry();
      calcToggle(false);
      calculatorReturnFocus = null;
      calcLastTargetInput = null;
      calcExpr = ''; calcLastExpr = ''; calcJustEvaluated = false;
      calcRender();
      exportPwdEl().value = '';
      importPwdEl().value = '';
      filenameEl().value = '';
      exportTimestampEl().checked = true;
      document.getElementById('entry-fields').textContent = '';
      document.getElementById('toast-container').textContent = '';
      App.state.resetDocument();
      const failures = [];
      for (const key of ['b2g-grouping', 'b2g-theme', 'b2g-currency', 'b2g-last-export']) {
        try {
          localStorage.removeItem(key);
          if (localStorage.getItem(key) !== null) throw new Error('Preference remains');
        } catch (_) { if (!failures.includes('preferences')) failures.push('preferences'); }
      }
      const cleanup = await Promise.allSettled([
        (async () => {
          if (location.protocol === 'file:' || !('caches' in window)) return;
          const keys = (await caches.keys()).filter(key => key.startsWith('workbox-'));
          await Promise.all(keys.map(key => caches.delete(key)));
          if ((await caches.keys()).some(key => keys.includes(key))) throw new Error('Caches remain');
        })(),
        (async () => {
          if (location.protocol === 'file:' || !('serviceWorker' in navigator)) return;
          const ownScope = new URL('./', window.location.href).href;
          const registrations = (await navigator.serviceWorker.getRegistrations()).filter(reg => reg.scope === ownScope);
          await Promise.all(registrations.map(reg => reg.unregister()));
          if ((await navigator.serviceWorker.getRegistrations()).some(reg => reg.scope === ownScope)) throw new Error('Registration remains');
        })(),
      ]);
      if (cleanup[0].status === 'rejected') failures.push('offline caches');
      if (cleanup[1].status === 'rejected') failures.push('offline registration');
      setTheme('system', false);
      App.utils.setGrouping(true);
      document.getElementById('grouping-toggle').checked = true;
      budgetFilter = 'all';
      App.utils.setCurrency('PHP', 'en-PH');
      document.getElementById('currency-select').value = 'PHP|en-PH';
      privacyStats.outboundRequests = 0;
      goToView('overview');
      App.render.all();
      App.persistence.resume();
      if (failures.length) toast('Financial records cleared, but cleanup is incomplete: ' + failures.join(', ') + '. Try wiping again.', 'error');
      else toast('All local data wiped from this browser.', 'success');
      return !failures.length;
    } finally {
      frozen.forEach(([el, previous]) => el.inert = previous);
      wipeBusy = false;
    }
  }
  async function wipeAllData() {
    if (wipeBusy || !window.confirm('This will wipe all local Budget2Go data, preferences, and offline caches. Continue?')) return false;
    return clearLocalData();
  }

  /* ──────────────────────────────────────────────────────
     CALCULATOR FAB
  ────────────────────────────────────────────────────── */
  const calcFabEl = () => document.getElementById('btn-calc-fab');
  const calcPanelEl = () => document.getElementById('calculator-panel');
  const calcCloseEl = () => document.getElementById('btn-calc-close');
  const calcApplyEl = () => document.getElementById('btn-calc-apply');
  const calcDisplayExprEl = () => document.getElementById('calc-display-expr');
  const calcDisplayResultEl = () => document.getElementById('calc-display-result');
  const calcGridEl = () => document.getElementById('calculator-grid');
  let calculatorReturnFocus = null;
  let calcExpr = '';
  let calcLastExpr = '';
  let calcJustEvaluated = false;
  let calcTargetMonth = null;

  function calcPrettyExpr(expr) {
    return String(expr || '')
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−');
  }

  function calcRender(resultValue, exprValue) {
    const exprEl = calcDisplayExprEl();
    const resultEl = calcDisplayResultEl();
    if (!exprEl || !resultEl) return;
    exprEl.textContent = exprValue != null ? calcPrettyExpr(exprValue) : '';
    resultEl.textContent = resultValue != null ? String(resultValue) : (calcExpr || '0');
    calcUpdateAction();
  }

  function calcTargetAvailable() {
    const input = calcLastTargetInput;
    return !!(input && input.isConnected && !input.disabled && !input.readOnly &&
      !input.closest('[hidden], [inert]') && input.getClientRects().length &&
      calcTargetMonth === App.state.viewedMonth() && !App.state.isReadOnly());
  }

  function calcDestination() {
    const input = calcLastTargetInput;
    if (!input) return '';
    if (input.closest('#entry-form')) {
      const name = document.querySelector('#entry-source, #entry-location, #entry-name').value.trim() || 'New entry';
      return name + ' · ' + input.labels[0].textContent;
    }
    const row = input.closest('[data-id]');
    const name = row.querySelector('.entry-name').firstChild.textContent.trim();
    return name + ' · ' + (input.closest('.budget-amount') ? 'Allocated amount' : input.getAttribute('aria-label'));
  }

  function calcResult() {
    if (!calcExpr) return { hint:'Enter a calculation to use its result.' };
    let value;
    try {
      value = calcJustEvaluated ? Number(calcExpr) : calcEvaluate(calcExpr);
      if (!Number.isFinite(value)) throw new Error('Result is too large');
    } catch (err) {
      return { hint:err.message === 'Cannot divide by zero' ? 'Cannot divide by zero.' : 'Finish or correct the calculation to use its result.' };
    }
    if (value < 0) return { hint:'Amounts must be zero or greater.' };
    const formatted = App.utils.formatAmount(value, false);
    const amount = App.utils.parseAmount(formatted);
    if (amount == null) return { hint:'This result cannot be used as an amount.' };
    return { value:amount, formatted, hint:Math.abs(value - amount) > 0.0000001 ? 'Rounded to two decimal places.' : '' };
  }

  function calcUpdateAction() {
    const available = calcTargetAvailable();
    const context = document.getElementById('calc-context');
    const button = calcApplyEl();
    context.hidden = !available;
    button.hidden = !available;
    const result = available ? calcResult() : {};
    const usable = available && result.value != null;
    button.disabled = !usable;
    button.textContent = usable ? 'Use ' + App.utils.fmt(result.value, 2) : 'Use result';
    document.getElementById('calc-destination').textContent = available ? calcDestination() : '';
    document.getElementById('calc-apply-hint').textContent = result.hint || '';
  }

  function calcOpenForInput(input) {
    calcLastTargetInput = input;
    calcTargetMonth = App.state.viewedMonth();
    if (!calcTargetAvailable()) { calcLastTargetInput = null; calcTargetMonth = null; return; }
    calcToggle(true);
  }

  function calcToggle(open) {
    const panel = calcPanelEl();
    const fab = calcFabEl();
    if (!panel || !fab) return;
    const isOpen = typeof open === 'boolean' ? open : panel.hasAttribute('hidden');
    if (isOpen) {
      calculatorReturnFocus = document.activeElement;
      calcUpdateAction();
      panel.removeAttribute('hidden');
      fab.setAttribute('aria-expanded', 'true');
      panel.querySelector('[data-calc]').focus();
    } else {
      const restore = panel.contains(document.activeElement);
      panel.setAttribute('hidden', '');
      fab.setAttribute('aria-expanded', 'false');
      calcLastTargetInput = null;
      calcTargetMonth = null;
      calcUpdateAction();
      if (restore) {
        const target = calculatorReturnFocus && document.contains(calculatorReturnFocus) && !calculatorReturnFocus.closest('[hidden]') ? calculatorReturnFocus : fab;
        target.focus();
      }
    }
  }

  function calcTokenize(expr) {
    const cleaned = String(expr || '').replace(/\s+/g, '');
    if (!cleaned) return [];
    const tokens = [];
    let i = 0;
    while (i < cleaned.length) {
      const ch = cleaned[i];
      if (/[0-9.]/.test(ch)) {
        let num = ch;
        i += 1;
        while (i < cleaned.length && /[0-9.]/.test(cleaned[i])) {
          num += cleaned[i];
          i += 1;
        }
        if ((num.match(/\./g) || []).length > 1) throw new Error('Invalid number');
        tokens.push(num);
        continue;
      }
      if (/[+\-*/()]/.test(ch)) {
        tokens.push(ch);
        i += 1;
        continue;
      }
      throw new Error('Invalid character');
    }
    return tokens;
  }

  function calcEvaluate(expr) {
    const tokens = calcTokenize(expr);
    if (!tokens.length) return 0;
    const out = [];
    const ops = [];
    const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };

    tokens.forEach((t, idx) => {
      const prev = idx > 0 ? tokens[idx - 1] : null;
      if (/^[0-9.]+$/.test(t)) {
        out.push(parseFloat(t));
        return;
      }
      if (t === '(') {
        ops.push(t);
        return;
      }
      if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop());
        if (!ops.length) throw new Error('Mismatched parentheses');
        ops.pop();
        return;
      }
      // Unary +/- support (e.g. -5 or (+3))
      if ((t === '+' || t === '-') && (idx === 0 || prev === '(' || /[+\-*/]/.test(prev))) {
        out.push(0);
      }
      while (ops.length && /[+\-*/]/.test(ops[ops.length - 1]) && prec[ops[ops.length - 1]] >= prec[t]) {
        out.push(ops.pop());
      }
      ops.push(t);
    });

    while (ops.length) {
      const op = ops.pop();
      if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
      out.push(op);
    }

    const stack = [];
    out.forEach((item) => {
      if (typeof item === 'number') {
        stack.push(item);
        return;
      }
      const b = stack.pop();
      const a = stack.pop();
      if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Invalid expression');
      if (item === '+') stack.push(a + b);
      if (item === '-') stack.push(a - b);
      if (item === '*') stack.push(a * b);
      if (item === '/') {
        if (b === 0) throw new Error('Cannot divide by zero');
        stack.push(a / b);
      }
    });

    if (stack.length !== 1 || !Number.isFinite(stack[0])) throw new Error('Invalid expression');
    return Math.round(stack[0] * 1000000) / 1000000;
  }

  function calcHandleInput(key) {
    if (key === 'clear') {
      calcExpr = '';
      calcLastExpr = '';
      calcJustEvaluated = false;
      calcRender();
      return;
    }
    if (key === 'back') {
      if (calcJustEvaluated) {
        calcExpr = '';
        calcLastExpr = '';
        calcJustEvaluated = false;
        calcRender();
        return;
      }
      calcExpr = calcExpr.slice(0, -1);
      calcLastExpr = '';
      calcRender();
      return;
    }
    if (key === '=') {
      try {
        const rawExpr = calcExpr || '0';
        const value = calcEvaluate(calcExpr);
        calcLastExpr = rawExpr;
        calcExpr = String(value);
        calcJustEvaluated = true;
        calcRender(calcExpr, calcLastExpr);
      } catch (err) {
        calcLastExpr = '';
        calcRender('Error');
      }
      return;
    }
    if (/^[0-9]$/.test(key)) {
      if (calcJustEvaluated) {
        calcExpr = key;
        calcLastExpr = '';
        calcJustEvaluated = false;
        calcRender();
        return;
      }
      calcExpr += key;
      calcLastExpr = '';
      calcRender();
      return;
    }
    if (key === '.') {
      if (calcJustEvaluated) {
        calcExpr = '0.';
        calcLastExpr = '';
        calcJustEvaluated = false;
        calcRender();
        return;
      }
      const chunk = (calcExpr.split(/[+\-*/()]/).pop() || '');
      if (chunk.indexOf('.') === -1) {
        calcExpr += chunk ? '.' : '0.';
      }
      calcLastExpr = '';
      calcRender();
      return;
    }
    if (/^[+\-*/()]$/.test(key)) {
      if (calcJustEvaluated) {
        calcJustEvaluated = false;
      }
      const last = calcExpr.slice(-1);
      if (/[+\-*/]/.test(last) && /[+\-*/]/.test(key)) {
        calcExpr = calcExpr.slice(0, -1) + key;
      } else {
        calcExpr += key;
      }
      calcLastExpr = '';
      calcRender();
    }
  }

  function calcApplyResultToTarget() {
    if (calcPanelEl().hidden || !calcTargetAvailable()) { calcUpdateAction(); return; }
    const result = calcResult();
    if (result.value == null) { calcUpdateAction(); return; }
    const input = calcLastTargetInput;
    input.value = result.formatted;
    input.dispatchEvent(new Event('input', { bubbles:true }));
    input.dispatchEvent(new Event('change', { bubbles:true }));
    calcToggle(false);
    input.focus();
    toast('Calculator result applied.', 'success');
  }

  function initCalculator() {
    const fab = calcFabEl();
    const panel = calcPanelEl();
    const closeBtn = calcCloseEl();
    const applyBtn = calcApplyEl();
    const grid = calcGridEl();
    if (!fab || !panel || !grid) return;

    fab.addEventListener('click', () => {
      calcLastTargetInput = null; calcTargetMonth = null;
      calcToggle();
    });
    if (closeBtn) closeBtn.addEventListener('click', () => calcToggle(false));
    if (applyBtn) applyBtn.addEventListener('click', calcApplyResultToTarget);

    document.addEventListener('click', e => {
      const button = e.target.closest('[data-open-calculator]');
      if (!button || button.disabled) return;
      const input = button.dataset.calcTarget ? document.getElementById(button.dataset.calcTarget) :
        button.dataset.calcField ? button.closest('tr[data-id]').querySelector(`[data-field="${CSS.escape(button.dataset.calcField)}"]`) :
        null;
      calcOpenForInput(input);
    });

    // Rendering, deletion, and route changes must never leave an obsolete destination active.
    const observer = new MutationObserver(() => {
      if (calcLastTargetInput && !calcTargetAvailable()) calcToggle(false);
    });
    for (const container of [document.getElementById('main-content'), document.getElementById('entry-modal')]) {
      observer.observe(container, {subtree:true, childList:true, attributes:true, attributeFilter:['hidden', 'disabled', 'readonly', 'inert']});
    }

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-calc]');
      if (!btn) return;
      calcHandleInput(btn.dataset.calc);
    });

    document.addEventListener('keydown', (e) => {
      if (panel.hasAttribute('hidden')) return;
      if (!panel.contains(e.target)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        calcHandleInput('=');
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        calcHandleInput('back');
        return;
      }
      if (/^[0-9+\-*/().]$/.test(e.key)) {
        calcHandleInput(e.key);
      }
    });

    document.addEventListener('click', (e) => {
      if (panel.hasAttribute('hidden')) return;
      if (e.target === fab || fab.contains(e.target)) return;
      if (panel.contains(e.target) || e.target.closest('[data-open-calculator]')) return;
      calcToggle(false);
    });

    calcRender();
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && activeDialog) {
      const focusable = [...activeDialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]')].filter((node) => !node.closest('[hidden]'));
      if (!focusable.length) e.preventDefault();
      if (focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key !== 'Escape') return;
    if (!calcPanelEl().hidden) {
      e.preventDefault();
      e.stopImmediatePropagation();
      calcToggle(false);
      return;
    }
    if (activeDialog === document.getElementById('welcome-modal')) { closeWelcome(); return; }
    if (activeDialog === document.getElementById('month-modal')) closeDialog(activeDialog);
    if (entryContext) closeEntry();
    if (exportModalEl() && !exportModalEl().hasAttribute('hidden')) closeModal();
    if (importModalEl() && !importModalEl().hasAttribute('hidden')) closeImportModal();
    if (privacyModalEl() && !privacyModalEl().hasAttribute('hidden')) closePrivacyModal();
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (e.target === document.getElementById('welcome-modal')) { closeWelcome(); return; }
    if (exportModalEl() && !exportModalEl().hasAttribute('hidden') && e.target === exportModalEl()) {
      closeModal();
      return;
    }
    if (importModalEl() && !importModalEl().hasAttribute('hidden') && e.target === importModalEl()) {
      closeImportModal();
      return;
    }
    if (privacyModalEl() && !privacyModalEl().hasAttribute('hidden') && e.target === privacyModalEl()) {
      closePrivacyModal();
    }
  });

  /* ──────────────────────────────────────────────────────
     DROP ZONE
  ────────────────────────────────────────────────────── */
  function initDropZone() {
    const zone      = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    installPrivacyMonitor();
    if (!zone || !fileInput) return;

    // Drag & drop events
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      // Only remove class when truly leaving the drop zone
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer && e.dataTransfer.files[0];
      if (file) setPendingImportFile(file);
    });

    // Keyboard accessibility for the drop zone
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    // File input change (click-to-browse)
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) setPendingImportFile(file);
      // Reset input so the same file can be re-imported
      fileInput.value = '';
    });

    if (importEncryptedEl()) {
      importEncryptedEl().addEventListener('change', syncImportEncryptionUI);
    }
    if (importPwdEl()) {
      importPwdEl().addEventListener('input', syncImportControls);
    }
    if (filenameEl()) {
      filenameEl().addEventListener('input', syncExportTargetHints);
    }
    if (exportTimestampEl()) {
      exportTimestampEl().addEventListener('change', syncExportTargetHints);
    }
    if (exportEncryptEl()) {
      exportEncryptEl().addEventListener('change', syncExportEncryptionUI);
    }

    syncImportControls();
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.ui = {
    initShell,
    showWelcome,
    closeWelcome,
    exportFromDialog,
    confirmExportWipe,
    monthLabel,
    stepper,
    loanProgressLabel,
    setTheme,
    goToView,
    openEntry,
    getBudgetFilter: () => budgetFilter,
    toast,
    showUndo,
    initUndo,
    openModal,
    closeModal,
    getModalFilename,
    getExportOptions,
    openImportModal,
    closeImportModal,
    openPrivacyModal,
    closePrivacyModal,
    refreshPrivacyDashboard,
    wipeAllData,
    getImportOptions,
    submitImport,
    initDropZone,
    initCalculator,
  };
})();
