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
        S.deleteSalary(btn.dataset.id);
        R.salary();
        R.summary();
      }
    },
  });

  /* ──────────────────────────────────────────────────────
     SAVINGS TABLE
  ────────────────────────────────────────────────────── */
  delegate('savings-body', {
    input: function (e) {
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
        S.deleteSavings(btn.dataset.id);
        R.savings();
        R.summary();
      }
    },
  });

  /* ──────────────────────────────────────────────────────
     BUDGET TABLE
  ────────────────────────────────────────────────────── */
  function handleSetPaid(id, checked) {
    S.setBudgetPaid(id, checked);
    R.budget();
    R.summary();
  }

  delegate('budget-body', {
    input: function (e) {
      var field = e.target.dataset.field;
      if (field === 'name' || field === 'amount') {
        S.updateBudgetField(rowId(e.target), field, e.target.value);
        var tot = document.getElementById('budget-total');
        if (tot) tot.textContent = App.utils.fmt(S.budgetTotal());
        R.summary();
      }
    },
    change: function (e) {
      var checkEl = e.target.closest('[data-action="toggle-paid"]');
      if (checkEl) {
        handleSetPaid(checkEl.dataset.id, !!checkEl.checked);
      }
    },
    click: function (e) {
      var delBtn = e.target.closest('[data-action="delete-budget"]');
      if (delBtn) {
        S.deleteBudget(delBtn.dataset.id);
        R.budget();
        R.summary();
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
      var field = e.target.dataset.field;
      if (field === 'frequency') {
        S.updateLoanField(rowId(e.target), field, e.target.value);
        rerenderTablePreserveFocus('loans-body', R.loans);
        R.summary();
      }
    },
    click: function (e) {
      var toBudget = e.target.closest('[data-action="loan-to-budget"]');
      if (toBudget) {
        var added = S.addLoanToBudget(toBudget.dataset.id);
        if (added) {
          R.all();
          UI.toast('Loan payment added to Budget — you can edit the amount there.', 'info');
        }
        return;
      }
      var delBtn = e.target.closest('[data-action="delete-loan"]');
      if (delBtn) {
        S.deleteLoan(delBtn.dataset.id);
        R.all();
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
      mutation();
      renderFn();
      R.summary();
      setTimeout(function () {
        var tbody = document.getElementById(tbodyId);
        if (tbody) {
          var lastRow = tbody.querySelector('tr[data-id]:last-child');
          if (lastRow) {
            var firstInput = lastRow.querySelector('input');
            if (firstInput) firstInput.focus();
          }
        }
      }, 50);
    });
  }

  bindAdd('btn-add-salary',  'salary-body',  S.addSalary,         R.salary);
  bindAdd('btn-add-savings', 'savings-body', S.addSavings,        R.savings);
  bindAdd('btn-add-budget',  'budget-body',  function () { S.addBudget(); }, R.budget);
  bindAdd('btn-add-loan',    'loans-body',   S.addLoan,           R.loans);

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
  if (importClose) importClose.addEventListener('click', UI.closeImportModal);
  if (importCancel) importCancel.addEventListener('click', UI.closeImportModal);
  if (importSubmit) importSubmit.addEventListener('click', UI.submitImport);

  var btnJson = document.getElementById('btn-export-json');
  if (btnJson) {
    btnJson.addEventListener('click', async function () {
      try {
        await App.io.exportJSON(UI.getModalFilename(), UI.getExportOptions());
        UI.closeModal();
      } catch (err) {
        UI.toast((err && err.message) ? err.message : 'Export failed.', 'error');
      }
    });
  }

  var btnCsv = document.getElementById('btn-export-csv');
  if (btnCsv) {
    btnCsv.addEventListener('click', async function () {
      try {
        await App.io.exportCSV(UI.getModalFilename(), UI.getExportOptions());
        UI.closeModal();
      } catch (err) {
        UI.toast((err && err.message) ? err.message : 'Export failed.', 'error');
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
  }

  window.App = window.App || {};
  App.events = { init: init };
})();
