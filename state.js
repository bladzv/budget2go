/**
 * state.js — Application state, constants, and all mutations.
 * Depends on: utils.js (App.utils)
 */
(function () {
  'use strict';

  const { safeStr, safeNum, uid } = App.utils;

  /* ──────────────────────────────────────────────────────
     CONSTANTS
  ────────────────────────────────────────────────────── */
  const VALID_FREQS = new Set(['monthly', 'bi-weekly', 'weekly']);

  /** Monthly multiplier for each frequency */
  const FREQ_TO_MONTHLY = {
    'monthly':    1,
    'bi-weekly':  26 / 12,  // 26 pay periods / 12 months
    'weekly':     52 / 12,  // 52 weeks / 12 months
  };

  const FREQ_LABELS = {
    'monthly':   'Monthly',
    'bi-weekly': 'Bi-Weekly',
    'weekly':    'Weekly',
  };

  /* ──────────────────────────────────────────────────────
     STATE
  ────────────────────────────────────────────────────── */
  /**
   * @typedef {Object} SalaryEntry
   * @property {string} id
   * @property {string} source
   * @property {number} amount
   * @property {string} frequency  'monthly' | 'bi-weekly' | 'weekly'
   *
   * @typedef {Object} SavingsEntry
   * @property {string} id
   * @property {string} location
   * @property {number} amount
   *
   * @typedef {Object} BudgetEntry
   * @property {string}      id
   * @property {string}      name
   * @property {number}      amount
   * @property {boolean}     paid
   * @property {string|null} loanId         — links to Loans entry if created via "→ To Budget"
   * @property {string|null} lastPaymentId  — id of the payment recorded when marked paid
   *
   * @typedef {Object} Payment
   * @property {string} id
   * @property {string} date   — ISO string
   * @property {number} amount
   *
   * @typedef {Object} LoanEntry
   * @property {string}      id
   * @property {string}      name
   * @property {number}      total
   * @property {string}      frequency
   * @property {number}      paymentAmount
   * @property {number}      monthsPaid
   * @property {string|null} budgetEntryId  — id of linked BudgetEntry
   * @property {Payment[]}   payments
   */

  let state = {
    salary:  /** @type {SalaryEntry[]}  */ ([]),
    savings: /** @type {SavingsEntry[]} */ ([]),
    budget:  /** @type {BudgetEntry[]}  */ ([]),
    loans:   /** @type {LoanEntry[]}    */ ([]),
  };

  /** Replace the entire state (used by import). Returns the new state. */
  function setState(newState) {
    state = newState;
    return state;
  }

  /** Returns a deep copy of the current state (for export). */
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  /* ──────────────────────────────────────────────────────
     COMPUTED VALUES
  ────────────────────────────────────────────────────── */
  function computeSummary() {
    const monthlySalary = state.salary.reduce(
      (sum, s) => sum + safeNum(s.amount) * (FREQ_TO_MONTHLY[s.frequency] || 1),
      0
    );
    const totalSavings = state.savings.reduce((sum, s) => sum + safeNum(s.amount), 0);
    const budgetExpenses = state.budget
      .filter((b) => !b.loanId)
      .reduce((sum, b) => sum + safeNum(b.amount), 0);
    const loanPayments = state.budget
      .filter((b) => !!b.loanId)
      .reduce((sum, b) => sum + safeNum(b.amount), 0);
    const totalDeductions = budgetExpenses + loanPayments;
    const remaining = monthlySalary - totalDeductions;
    return { monthlySalary, totalSavings, budgetExpenses, loanPayments, totalDeductions, remaining };
  }

  function loanStats(loan) {
    const payments = loan.payments || [];
    const paymentHistoryPaid = payments.reduce((s, p) => s + safeNum(p.amount), 0);
    const total = safeNum(loan.total);
    const perPayment = safeNum(loan.paymentAmount);
    const monthlyPayment = perPayment * (FREQ_TO_MONTHLY[loan.frequency] || 1);
    const monthsPaid = Math.max(0, Math.floor(safeNum(loan.monthsPaid)));
    const seededPaid = monthlyPayment * monthsPaid;
    const totalPaid = paymentHistoryPaid + seededPaid;
    const remaining = Math.max(0, total - totalPaid);
    const progress = total > 0 ? Math.min(100, (totalPaid / total) * 100) : 0;
    const paymentsLeft = perPayment > 0 ? Math.ceil(remaining / perPayment) : 0;
    return { totalPaid, paymentHistoryPaid, seededPaid, remaining, progress, paymentsLeft, isDone: remaining <= 0 };
  }

  function salaryTotal() {
    return state.salary.reduce(
      (s, e) => s + safeNum(e.amount) * (FREQ_TO_MONTHLY[e.frequency] || 1),
      0
    );
  }

  function savingsTotal() {
    return state.savings.reduce((s, e) => s + safeNum(e.amount), 0);
  }

  function budgetTotal() {
    return state.budget.reduce((s, e) => s + safeNum(e.amount), 0);
  }

  function loansRemainingTotal() {
    return state.loans.reduce((s, l) => s + loanStats(l).remaining, 0);
  }

  /* ──────────────────────────────────────────────────────
     MUTATIONS — SALARY
  ────────────────────────────────────────────────────── */
  function addSalary() {
    state.salary.push({ id: uid(), source: '', amount: 0, frequency: 'monthly' });
  }

  function deleteSalary(id) {
    state.salary = state.salary.filter((s) => s.id !== id);
  }

  function updateSalaryField(id, field, value) {
    const item = state.salary.find((s) => s.id === id);
    if (!item) return;
    if (field === 'source')    item.source    = safeStr(value, 100);
    if (field === 'amount')    item.amount    = safeNum(value);
    if (field === 'frequency' && VALID_FREQS.has(value)) item.frequency = value;
  }

  /* ──────────────────────────────────────────────────────
     MUTATIONS — SAVINGS
  ────────────────────────────────────────────────────── */
  function addSavings() {
    state.savings.push({ id: uid(), location: '', amount: 0 });
  }

  function deleteSavings(id) {
    state.savings = state.savings.filter((s) => s.id !== id);
  }

  function updateSavingsField(id, field, value) {
    const item = state.savings.find((s) => s.id === id);
    if (!item) return;
    if (field === 'location') item.location = safeStr(value, 100);
    if (field === 'amount')   item.amount   = safeNum(value);
  }

  /* ──────────────────────────────────────────────────────
     MUTATIONS — BUDGET
  ────────────────────────────────────────────────────── */
  function addBudget(name, amount, loanId) {
    state.budget.push({
      id: uid(),
      name: safeStr(name || '', 100),
      amount: safeNum(amount),
      paid: false,
      loanId: loanId || null,
      lastPaymentId: null,
    });
  }

  function deleteBudget(id) {
    const item = state.budget.find((b) => b.id === id);
    // If linked to a loan, unlink budget entry reference.
    if (item && item.loanId) {
      const loan = state.loans.find((l) => l.id === item.loanId);
      if (loan) {
        loan.budgetEntryId = null;
      }
    }
    state.budget = state.budget.filter((b) => b.id !== id);
  }

  function updateBudgetField(id, field, value) {
    const item = state.budget.find((b) => b.id === id);
    if (!item) return;
    if (field === 'name')   item.name   = safeStr(value, 100);
    if (field === 'amount') item.amount = safeNum(value);
  }

  function toggleBudgetPaid(id) {
    const item = state.budget.find((b) => b.id === id);
    if (!item) return;
    item.paid = !item.paid;
  }

  function setBudgetPaid(id, paid) {
    const item = state.budget.find((b) => b.id === id);
    if (!item) return;
    item.paid = !!paid;
  }

  /* ──────────────────────────────────────────────────────
     MUTATIONS — LOANS
  ────────────────────────────────────────────────────── */
  function addLoan() {
    state.loans.push({
      id: uid(),
      name: '',
      total: 0,
      frequency: 'monthly',
      paymentAmount: 0,
      monthsPaid: 0,
      budgetEntryId: null,
      payments: [],
    });
  }

  function deleteLoan(id) {
    const loan = state.loans.find((l) => l.id === id);
    // Remove linked budget entry too
    if (loan && loan.budgetEntryId) {
      state.budget = state.budget.filter((b) => b.id !== loan.budgetEntryId);
    }
    state.loans = state.loans.filter((l) => l.id !== id);
  }

  function updateLoanField(id, field, value) {
    const item = state.loans.find((l) => l.id === id);
    if (!item) return;
    if (field === 'name')          item.name          = safeStr(value, 100);
    if (field === 'total')         item.total         = safeNum(value);
    if (field === 'paymentAmount') item.paymentAmount = safeNum(value);
    if (field === 'monthsPaid')    item.monthsPaid    = Math.max(0, Math.floor(safeNum(value)));
    if (field === 'frequency' && VALID_FREQS.has(value)) item.frequency = value;
  }

  function addLoanToBudget(loanId) {
    const loan = state.loans.find((l) => l.id === loanId);
    if (!loan || loan.budgetEntryId) return false;
    const budgetId = uid();
    state.budget.push({
      id: budgetId,
      name: (loan.name || 'Loan') + ' — Payment',
      amount: safeNum(loan.paymentAmount),
      paid: false,
      loanId: loanId,
      lastPaymentId: null,
    });
    loan.budgetEntryId = budgetId;
    return true;
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.state = {
    // State access
    get: () => state,
    getExport: getState,
    set: setState,

    // Constants
    VALID_FREQS,
    FREQ_TO_MONTHLY,
    FREQ_LABELS,

    // Computed
    computeSummary,
    loanStats,
    salaryTotal,
    savingsTotal,
    budgetTotal,
    loansRemainingTotal,

    // Mutations — Salary
    addSalary,
    deleteSalary,
    updateSalaryField,

    // Mutations — Savings
    addSavings,
    deleteSavings,
    updateSavingsField,

    // Mutations — Budget
    addBudget,
    deleteBudget,
    updateBudgetField,
    toggleBudgetPaid,
    setBudgetPaid,

    // Mutations — Loans
    addLoan,
    deleteLoan,
    updateLoanField,
    addLoanToBudget,
  };
})();
