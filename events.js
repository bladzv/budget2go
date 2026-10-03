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
      const undoMonth = S.activeMonth();
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
      UI.showUndo(message, () => {
        if (S.activeMonth() !== undoMonth || S.isReadOnly()) return;
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
      });
    }

    /* ──────────────────────────────────────────────────────
       HELPER: delegate to a table body
       Binds input, change, blur, click, and keydown on a tbody.
    ────────────────────────────────────────────────────── */
    function delegate(tbodyId, handlers) {
      var el = document.getElementById(tbodyId);
      if (!el) return;

      el.addEventListener('input', function (e) {
        if (handlers.input) handlers.input(e);
      });
      el.addEventListener('change', function (e) {
        if (handlers.change) handlers.change(e);
      });
      if (handlers.blur) {
        el.addEventListener('blur', function (e) {
          handlers.blur(e);
        }, true);
      }
      el.addEventListener('click', function (e) {
        if (handlers.click) handlers.click(e);
      });
      el.addEventListener('keydown', function (e) {
        if (handlers.keydown) handlers.keydown(e);
      });
    }

    function rowId(target) {
      var row = target.closest('tr[data-id]');
      return row ? row.dataset.id : null;
    }

    function cssEscape(value) {
      if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(String(value));
      }
      return String(value).replace(/["\\]/g, '\\$&');
    }

    function rerenderTablePreserveFocus(tbodyId, renderFn) {
      var tbody = document.getElementById(tbodyId);
      var active = document.activeElement;
      var snapshot = null;

      if (tbody && active && tbody.contains(active)) {
        var rid = rowId(active);
        var field = active.dataset ? active.dataset.field : null;
        if (rid && field) {
          snapshot = {
            rid: rid,
            field: field,
            start: typeof active.selectionStart === 'number' ? active.selectionStart : null,
            end: typeof active.selectionEnd === 'number' ? active.selectionEnd : null,
          };
        }
      }

      renderFn();

      if (!snapshot) return;
      var nextTbody = document.getElementById(tbodyId);
      if (!nextTbody) return;
      var sel = 'tr[data-id="' + cssEscape(snapshot.rid) + '"] [data-field="' + cssEscape(snapshot.field) + '"]';
      var next = nextTbody.querySelector(sel);
      if (!next) return;
      next.focus();
      if (snapshot.start != null && snapshot.end != null && typeof next.setSelectionRange === 'function') {
        try {
          next.setSelectionRange(snapshot.start, snapshot.end);
        } catch (err) {
          // Ignore selection restore errors for non-text-like inputs.
        }
      }
    }

    function updateSalaryMonthlyCell(inputEl) {
      var rid = rowId(inputEl);
      if (!rid) return;
      var row = inputEl.closest('tr[data-id]');
      if (!row) return;
      var out = row.querySelector('[data-monthly-equiv]');
      if (!out) return;
      var salary = S.get().salary.find(function (s) { return s.id === rid; });
      if (!salary) return;
      var factor = S.FREQ_TO_MONTHLY[salary.frequency] || 1;
      out.textContent = App.utils.fmt((salary.amount || 0) * factor);
    }

    function updateLoanComputedCells(inputEl) {
      var rid = rowId(inputEl);
      if (!rid) return;
      var row = inputEl.closest('tr[data-id]');
      if (!row) return;
      var loan = S.get().loans.find(function (l) { return l.id === rid; });
      if (!loan) return;
      var stats = S.loanStats(loan);

      var fill = row.querySelector('[data-loan-progress-fill]');
      var pctEl = row.querySelector('[data-loan-progress-pct]');
      var leftEl = row.querySelector('[data-loan-payments-left]');
      var remEl = row.querySelector('[data-loan-remaining]');

      if (fill) {
        var pct = Math.min(100, stats.progress).toFixed(1);
        fill.style.width = pct + '%';
        fill.classList.toggle('done', !!stats.isDone);
      }
      if (pctEl) pctEl.textContent = stats.progress.toFixed(1) + '%';
      if (leftEl) leftEl.textContent = stats.paymentsLeft + ' left';
      if (remEl) {
        remEl.textContent = App.utils.fmt(stats.remaining);
        remEl.style.color = stats.isDone ? 'var(--success)' : 'var(--text-secondary)';
      }
    }

    /* ──────────────────────────────────────────────────────
       SALARY TABLE
    ────────────────────────────────────────────────────── */
    delegate('salary-body', {
    input: function (e) {
      if (!editable()) return;
      var field = e.target.dataset.field;
      if (field === 'source' || field === 'amount') {
        S.updateSalaryField(rowId(e.target), field, e.target.value);
        var tot = document.getElementById('salary-total');
        if (tot) tot.textContent = App.utils.fmt(S.salaryTotal()) + '/mo';
        if (field === 'amount') updateSalaryMonthlyCell(e.target);
        R.summary();
      }
    },
    change: function (e) {
      if (!editable()) return;
      var field = e.target.dataset.field;
      if (field === 'frequency') {
        S.updateSalaryField(rowId(e.target), field, e.target.value);
        rerenderTablePreserveFocus('salary-body', R.salary);
        R.summary();
      }
    },
    click: function (e) {
      var btn = e.target.closest('[data-action="delete-salary"]');
      if (btn) {
        deleteWithUndo('salary', btn.dataset.id, () => S.deleteSalary(btn.dataset.id), 'Income entry removed.');
      }
    },
  });

  /* ──────────────────────────────────────────────────────
     SAVINGS TABLE
  ────────────────────────────────────────────────────── */
  delegate('savings-body', {
    input: function (e) {
      if (!editable()) return;
      var field = e.target.dataset.field;
      if (field === 'location' || field === 'amount') {
        S.updateSavingsField(rowId(e.target), field, e.target.value);
        var tot = document.getElementById('savings-total');
        if (tot) tot.textContent = App.utils.fmt(S.savingsTotal());
        R.summary();
      }
    },
    click: function (e) {
      var btn = e.target.closest('[data-action="delete-savings"]');
      if (btn) {
        deleteWithUndo('savings', btn.dataset.id, () => S.deleteSavings(btn.dataset.id), 'Savings entry removed.');
      }
    },
  });

  /* ──────────────────────────────────────────────────────
     BUDGET TABLE
  ────────────────────────────────────────────────────── */
  function handleSetPaid(id, checked) {
    if (!editable()) return;
    const undoMonth = S.activeMonth();
    const before = S.get().budget.find((item) => item.id === id);
    const prior = before ? structuredClone(before) : null;
    const loan = before && before.loanId ? S.get().loans.find((item) => item.id === before.loanId) : null;
    const priorPayment = loan && prior.lastPaymentId ? loan.payments.find((entry) => entry.id === prior.lastPaymentId) : null;
    const result = S.setBudgetPaid(id, checked);
    if (!result) return;
    R.all();
    UI.showUndo(result.paymentId ? 'Loan payment recorded.' : 'Paid state updated.', () => {
      if (S.activeMonth() !== undoMonth || S.isReadOnly()) return;
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

  delegate('budget-body', {
    input: function (e) {
      if (!editable()) return;
      var field = e.target.dataset.field;
      if (field === 'name' || field === 'amount') {
        S.updateBudgetField(rowId(e.target), field, e.target.value);
        var tot = document.getElementById('budget-total');
        if (tot) tot.textContent = App.utils.fmt(S.budgetTotal());
        if (field === 'amount') R.loans();
        R.summary();
      }
    },
    change: function (e) {
      if (!editable()) return;
      if (e.target.dataset.field === 'recurring') {
        S.updateBudgetField(rowId(e.target), 'recurring', e.target.checked);
        R.summary();
        return;
      }
      var checkEl = e.target.closest('[data-action="toggle-paid"]');
      if (checkEl) {
        handleSetPaid(checkEl.dataset.id, !!checkEl.checked);
      }
    },
    click: function (e) {
      var delBtn = e.target.closest('[data-action="delete-budget"]');
      if (delBtn) {
        deleteWithUndo('budget', delBtn.dataset.id, () => S.deleteBudget(delBtn.dataset.id), 'Budget item removed.');
      }
    },
  });

  /* ──────────────────────────────────────────────────────
     LOANS TABLE
     Re-render on every input/change for realtime computations while
     preserving focus/cursor.
  ────────────────────────────────────────────────────── */
  delegate('loans-body', {
    input: function (e) {
      if (!editable()) return;
      var field = e.target.dataset.field;
      if (field === 'name' || field === 'total' || field === 'paymentAmount' || field === 'monthsPaid') {
        S.updateLoanField(rowId(e.target), field, e.target.value);
        var tot = document.getElementById('loans-total');
        if (tot) tot.textContent = 'Owed: ' + App.utils.fmt(S.loansRemainingTotal());
        if (field === 'total' || field === 'paymentAmount' || field === 'monthsPaid') {
          updateLoanComputedCells(e.target);
        }
        R.summary();
      }
    },
    change: function (e) {
      if (!editable()) return;
      var field = e.target.dataset.field;
      if (field === 'frequency') {
        S.updateLoanField(rowId(e.target), field, e.target.value);
        rerenderTablePreserveFocus('loans-body', R.loans);
        R.summary();
      }
    },
    click: function (e) {
      var details = e.target.closest('[data-action="toggle-loan-details"]');
      if (details) {
        var row = details.closest('tr[data-id]');
        var open = row.classList.toggle('details-open');
        row.querySelectorAll('.loan-detail').forEach((cell) => { cell.inert = !open; });
        details.setAttribute('aria-expanded', String(open));
        details.setAttribute('aria-label', open ? 'Hide loan details' : 'Show loan details');
        return;
      }
      var toBudget = e.target.closest('[data-action="loan-to-budget"]');
      if (toBudget) {
        if (!editable()) return;
        var added = S.addLoanToBudget(toBudget.dataset.id);
        if (added) {
          R.all();
          UI.toast('Loan payment added to Budget — you can edit the amount there.', 'info');
        }
        return;
      }
      var delBtn = e.target.closest('[data-action="delete-loan"]');
      if (delBtn) {
        deleteWithUndo('loans', delBtn.dataset.id, () => S.deleteLoan(delBtn.dataset.id), 'Loan removed.');
      }
    },
  });

  /* ──────────────────────────────────────────────────────
     ADD BUTTONS
  ────────────────────────────────────────────────────── */
  function bindAdd(btnId, tbodyId, mutation, renderFn) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!editable()) return;
      mutation();
      renderFn();
      R.summary();
      var tbody = document.getElementById(tbodyId);
      if (tbody) {
        var lastRow = tbody.querySelector('tr[data-id]:last-child');
        if (lastRow) {
          var firstInput = lastRow.querySelector('input:not([type="checkbox"])');
          if (firstInput) firstInput.focus();
        }
      }
    });
  }

  bindAdd('btn-add-salary',  'salary-body',  S.addSalary,         R.salary);
  bindAdd('btn-add-savings', 'savings-body', S.addSavings,        R.savings);
  bindAdd('btn-add-budget',  'budget-body',  function () { S.addBudget(); }, R.budget);
  bindAdd('btn-add-loan',    'loans-body',   S.addLoan,           R.loans);

  const monthTabs = document.getElementById('month-tabs');
  if (monthTabs) monthTabs.addEventListener('click', (e) => {
    const button = e.target.closest('[data-month]');
    if (button && S.viewMonth(button.dataset.month)) R.all();
  });
  const startMonth = document.getElementById('btn-start-month');
  if (startMonth) startMonth.addEventListener('click', () => {
    if (S.rollover()) {
      R.all();
      UI.toast('New month started. Recurring items copied and paid states reset.', 'success');
    }
  });
  const summaryToggle = document.getElementById('btn-summary-toggle');
  if (summaryToggle) summaryToggle.addEventListener('click', () => {
    const expanded = document.querySelector('.summary-bar').classList.toggle('expanded');
    summaryToggle.setAttribute('aria-expanded', String(expanded));
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

  var btnJson = document.getElementById('btn-export-json');
  if (btnJson) {
    btnJson.addEventListener('click', async function () {
      btnJson.disabled = true;
      const label = document.getElementById('export-json-label');
      const old = label.textContent;
      label.textContent = 'Preparing…';
      try {
        await App.io.exportJSON(UI.getModalFilename(), UI.getExportOptions());
        label.textContent = 'Download started';
        UI.closeModal();
      } catch (err) {
        UI.toast((err && err.message) ? err.message : 'Export failed.', 'error');
      } finally {
        btnJson.disabled = false;
        label.textContent = old;
      }
    });
  }

  var btnCsv = document.getElementById('btn-export-csv');
  if (btnCsv) {
    btnCsv.addEventListener('click', async function () {
      btnCsv.disabled = true;
      const label = document.getElementById('export-csv-label');
      const old = label.textContent;
      label.textContent = 'Preparing…';
      try {
        await App.io.exportCSV(UI.getModalFilename(), UI.getExportOptions());
        label.textContent = 'Download started';
        UI.closeModal();
      } catch (err) {
        UI.toast((err && err.message) ? err.message : 'Export failed.', 'error');
      } finally {
        btnCsv.disabled = false;
        label.textContent = old;
      }
    });
  }

  var filenameInput = document.getElementById('export-filename');
  if (filenameInput) {
    filenameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        App.io.exportJSON(UI.getModalFilename(), UI.getExportOptions())
          .then(function () {
            UI.closeModal();
          })
          .catch(function (err) {
            UI.toast((err && err.message) ? err.message : 'Export failed.', 'error');
          });
      }
    });
  }

  /* ──────────────────────────────────────────────────────
     THEME TOGGLE
  ────────────────────────────────────────────────────── */
  var themeBtn = document.getElementById('btn-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('b2g-theme', next); } catch (_) {}
      var icon = themeBtn.querySelector('i[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', next === 'light' ? 'moon' : 'sun');
      if (window.lucide) lucide.createIcons();
    });
  }

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
