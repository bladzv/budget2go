/**
 * events.js — Wire up all event listeners.
 * Depends on: state.js, render.js, io.js, ui.js
 * Call App.events.init() from app.js after DOM and App are ready.
 */
(function () {
  'use strict';

  function init() {
    if (!window.App || !App.state || !App.render || !App.ui || !App.io) {
      console.error('[BudgetOS] App not ready — cannot bind events.');
      return;
    }
    var S = App.state;
    var R = App.render;
    var UI = App.ui;
    function editable() { return !S.isReadOnly(); }
    function deleteWithUndo(kind, id, action, message) {
      if (!editable()) return;
      const undoMonth = S.viewedMonth();
      const current = S.get();
      const index = current[kind].findIndex((item) => item.id === id);
      if (index < 0) return;
      const item = structuredClone(current[kind][index]);
      const linkedBudget = kind === 'loans' && item.budgetEntryId
        ? current.budget.find((entry) => entry.id === item.budgetEntryId) : null;
      const linkedIndex = linkedBudget ? current.budget.indexOf(linkedBudget) : -1;
      const savedLinked = linkedBudget ? structuredClone(linkedBudget) : null;
      action();
      R.all();
      const owner = kind === 'salary' || kind === 'savings' ? 'accounts' : kind === 'loans' ? 'loans' : 'budget';
      const next = document.querySelector('#view-' + owner + ' [data-edit]') || document.querySelector('#view-' + owner + ' [data-add]');
      if (next) next.focus();
      UI.showUndo(message, () => {
        if (S.viewedMonth() !== undoMonth || S.isReadOnly()) return;
        const target = S.get();
        if (target[kind].some((entry) => entry.id === id)) return;
        target[kind].splice(index, 0, item);
        if (savedLinked && !target.budget.some((entry) => entry.id === savedLinked.id)) {
          target.budget.splice(linkedIndex, 0, savedLinked);
        }
        if (kind === 'budget' && item.loanId) {
          const loan = target.loans.find((entry) => entry.id === item.loanId);
          if (loan) loan.budgetEntryId = item.id;
        }
        R.all();
        const restored = document.querySelector('#view-' + owner + ' [data-edit][data-id="' + CSS.escape(id) + '"]');
        if (restored) restored.focus();
      });
    }

  function handleSetPaid(id, checked) {
    if (!editable()) return;
    const undoMonth = S.viewedMonth();
    const before = S.get().budget.find((item) => item.id === id);
    const prior = before ? structuredClone(before) : null;
    const loan = before && before.loanId ? S.get().loans.find((item) => item.id === before.loanId) : null;
    const priorPayment = loan && prior.lastPaymentId ? loan.payments.find((entry) => entry.id === prior.lastPaymentId) : null;
    const result = S.setBudgetPaid(id, checked);
    if (!result) return;
    const containerId = document.activeElement.closest('#overview-unpaid') ? 'overview-unpaid' : 'budget-body';
    R.all();
    const replacement = document.getElementById(containerId).querySelector('[data-id="' + CSS.escape(id) + '"][data-action="toggle-paid"]');
    (replacement || (containerId === 'overview-unpaid' ? document.querySelector('#view-overview [data-view="budget"]') : document.querySelector('[data-filter][aria-pressed="true"]'))).focus();
    UI.showUndo(result.paymentId ? 'Loan payment recorded.' : 'Paid state updated.', () => {
      if (S.viewedMonth() !== undoMonth || S.isReadOnly()) return;
      const current = S.get().budget.find((item) => item.id === id);
      if (!current || current.paid !== checked) return;
      if (checked) S.setBudgetPaid(id, false);
      else {
        current.paid = true;
        current.lastPaymentId = prior.lastPaymentId;
        const currentLoan = current.loanId ? S.get().loans.find((item) => item.id === current.loanId) : null;
        if (currentLoan && priorPayment && !currentLoan.payments.some((item) => item.id === priorPayment.id)) {
          currentLoan.payments.push(structuredClone(priorPayment));
        }
      }
      R.all();
    });
  }

  // Amounts are staged in the field until blur/Enter. Escape cancels the edit.
  const configs = {
    'salary-body': ['salary', S.updateSalaryField, S.deleteSalary],
    'savings-body': ['savings', S.updateSavingsField, S.deleteSavings],
    'budget-body': ['budget', S.updateBudgetField, S.deleteBudget],
    'loans-body': ['loans', S.updateLoanField, S.deleteLoan],
  };
  Object.entries(configs).forEach(([bodyId, [kind, update, remove]]) => {
    const body = document.getElementById(bodyId);
    function commit(input) {
      if (!editable() || !input.matches('input[data-field]')) return;
      const row = input.closest('[data-id]');
      const record = S.get()[kind].find(entry => entry.id === row.dataset.id);
      if (!record) return;
      const field = input.dataset.field;
      const number = App.utils.parseAmount(input.value);
      if (number == null || !input.checkValidity()) {
        input.value = App.utils.formatAmount(record[field]);
        UI.toast('Enter a valid, non-negative amount.', 'error');
        return;
      }
      input.value = App.utils.formatAmount(number);
      if (number === record[field]) return;
      update(record.id, field, number);
      input.dataset.original = input.value;
      R.summary();
      if (kind === 'salary') {
        document.getElementById('salary-total').textContent = App.utils.fmt(S.salaryTotal()) + ' per month';
        row.querySelector('[data-monthly-equiv]').textContent = App.utils.fmt(record.amount * (S.FREQ_TO_MONTHLY[record.frequency] || 1));
      }
      if (kind === 'savings') document.getElementById('savings-total').textContent = App.utils.fmt(S.savingsTotal());
      if (kind === 'budget') {
        document.getElementById('budget-total').textContent = App.utils.fmt(S.budgetTotal());
        R.loans();
      }
    }
    body.addEventListener('focusin', e => {
      if (e.target.matches('input[data-field]')) e.target.dataset.original = e.target.value;
    });
    body.addEventListener('blur', e => commit(e.target), true);
    body.addEventListener('change', e => {
      if (e.target.matches('[data-action="toggle-paid"]')) handleSetPaid(e.target.dataset.id, e.target.checked);
      else commit(e.target);
    });
    body.addEventListener('keydown', e => {
      if (!e.target.matches('input[data-field]')) return;
      if (e.key === 'Enter') { e.preventDefault(); commit(e.target); e.target.blur(); }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.target.value = e.target.dataset.original;
        e.target.blur();
      }
    });
    body.addEventListener('click', e => {
      const button = e.target.closest('[data-action]');
      if (!button) return;
      if (button.dataset.action === 'delete-' + (kind === 'loans' ? 'loan' : kind)) {
        deleteWithUndo(kind, button.dataset.id, () => remove(button.dataset.id), 'Entry removed.');
      }
      if (button.dataset.action === 'loan-to-budget' && editable() && S.addLoanToBudget(button.dataset.id)) {
        R.all();
        UI.toast('Loan payment added to your budget.', 'success');
        document.querySelector('#loans-body [data-id="' + CSS.escape(button.dataset.id) + '"] [data-edit]').focus();
      }
    });
  });
  document.getElementById('overview-unpaid').addEventListener('change', e => {
    if (e.target.matches('[data-action="toggle-paid"]')) handleSetPaid(e.target.dataset.id, e.target.checked);
  });
  var importBtn = document.getElementById('btn-toggle-import');
  if (importBtn) importBtn.addEventListener('click', UI.openImportModal);

  var finalizeBtn = document.getElementById('btn-finalize');
  if (finalizeBtn) finalizeBtn.addEventListener('click', UI.openModal);

  var btnClose = document.getElementById('btn-modal-close');
  var btnCancel = document.getElementById('btn-modal-cancel');
  if (btnClose) btnClose.addEventListener('click', UI.closeModal);
  if (btnCancel) btnCancel.addEventListener('click', UI.closeModal);

  var importClose = document.getElementById('btn-import-close');
  var importCancel = document.getElementById('btn-import-cancel');
  var importSubmit = document.getElementById('btn-import-submit');
  var privacyOpen = document.getElementById('btn-open-privacy');
  var privacyClose = document.getElementById('btn-privacy-close');
  var privacyRefresh = document.getElementById('btn-privacy-refresh');
  var privacyDone = document.getElementById('btn-privacy-ok');
  var wipeBtn = document.getElementById('btn-wipe-data');
  if (importClose) importClose.addEventListener('click', UI.closeImportModal);
  if (importCancel) importCancel.addEventListener('click', UI.closeImportModal);
  if (importSubmit) importSubmit.addEventListener('click', UI.submitImport);
  if (privacyOpen) {
    privacyOpen.addEventListener('click', function () {
      UI.openPrivacyModal();
    });
  }
  if (privacyClose) privacyClose.addEventListener('click', UI.closePrivacyModal);
  if (privacyRefresh) {
    privacyRefresh.addEventListener('click', function () {
      UI.refreshPrivacyDashboard();
    });
  }
  if (privacyDone) privacyDone.addEventListener('click', UI.closePrivacyModal);
  if (wipeBtn) {
    wipeBtn.addEventListener('click', function () {
      UI.wipeAllData();
    });
  }

  document.getElementById('btn-export-json').addEventListener('click', () => UI.exportFromDialog('json'));
  document.getElementById('btn-export-csv').addEventListener('click', () => UI.exportFromDialog('csv'));
  document.getElementById('export-filename').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); UI.exportFromDialog('json'); }
  });
  document.getElementById('btn-export-wipe-confirm').addEventListener('click', UI.confirmExportWipe);
  document.getElementById('btn-export-keep').addEventListener('click', UI.closeModal);

  const themeSelect = document.getElementById('theme-select');
  themeSelect.addEventListener('change', () => UI.setTheme(themeSelect.value));

  /* ──────────────────────────────────────────────────────
     CURRENCY SELECTOR
  ────────────────────────────────────────────────────── */
  var currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    currencySelect.addEventListener('change', function () {
      var val = this.value;
      var parts = val.split('|');
      if (parts.length === 2) {
        const previous = S.getCurrency();
        const hasAmounts = S.listMonths().some((month) => {
          const original = S.viewedMonth();
          S.viewMonth(month);
          const st = S.get();
          const any = st.salary.length || st.savings.length || st.budget.length || st.loans.length;
          S.viewMonth(original);
          return any;
        });
        if (hasAmounts && !window.confirm('Changing currency only changes labels; amounts are not converted. Continue?')) {
          this.value = previous;
          return;
        }
        S.setCurrency(val);
        App.utils.setCurrency(parts[0], parts[1]);
        try { localStorage.setItem('b2g-currency', val); } catch (_) {}
        R.all();
        App.persistence.flush();
      }
    });
  }
  }

  window.App = window.App || {};
  App.events = { init: init };
})();
