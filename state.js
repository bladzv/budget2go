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
   * @property {boolean}     recurring — copied into the next monthly plan
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
  const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  let activeMonth = monthKey();
  let viewedMonth = activeMonth;
  let months = { [activeMonth]: state };
  let currency = 'PHP|en-PH';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const visibleState = () => state;
  const validMonth = (key) => typeof key === 'string' && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(key);
  const emptyState = () => ({ salary: [], savings: [], budget: [], loans: [] });
  const hasEntries = (value) => Object.values(value).some(entries => entries.length);
  function hasData() { return Object.values(months).some(hasEntries); }

  /** Replace the entire state (used by import). Returns the new state. */
  function setState(newState) {
    state = newState;
    months[viewedMonth] = state;
    return state;
  }
  function resetDocument() {
    state = { salary: [], savings: [], budget: [], loans: [] };
    activeMonth = monthKey();
    viewedMonth = activeMonth;
    months = { [activeMonth]: state };
    currency = 'PHP|en-PH';
  }

  /** Returns a deep copy of the current state (for export). */
  function getState() {
    return clone(visibleState());
  }

  function getDocument() {
    return { version: 3, activeMonth, viewedMonth, currency, months: clone(months) };
  }

  function loadDocument(doc) {
    if (!doc || ![2, 3].includes(doc.version) || !validMonth(doc.activeMonth) ||
        !doc.months || Array.isArray(doc.months) || !doc.months[doc.activeMonth]) return false;
    const keys = Object.keys(doc.months);
    const validState = (value) => value && ['salary', 'savings', 'budget', 'loans'].every((key) => Array.isArray(value[key]));
    if (keys.length > 120 || keys.some((key) => !validMonth(key)) ||
        !Object.values(doc.months).every(validState)) return false;
    if (doc.version === 3 && (!validMonth(doc.viewedMonth) || !doc.months[doc.viewedMonth])) return false;
    months = clone(doc.months);
    activeMonth = keys.sort().at(-1);
    viewedMonth = doc.version === 3 ? doc.viewedMonth : doc.activeMonth;
    state = months[viewedMonth];
    currency = typeof doc.currency === 'string' ? doc.currency : 'PHP|en-PH';
    return true;
  }

  function listMonths() { return Object.keys(months).sort(); }
  function viewMonth(key) {
    if (!validMonth(key) || !months[key]) return false;
    viewedMonth = key;
    state = months[key];
    return true;
  }
  function isReadOnly() { return false; }
  function createMonth(key) {
    if (!validMonth(key)) return false;
    if (!months[key]) {
      if (listMonths().length >= 120) return false;
      months[key] = emptyState();
      if (key > activeMonth) activeMonth = key;
    }
    return viewMonth(key);
  }
  function copyRecurring(source) {
    if (source === viewedMonth || !months[source] || hasEntries(state)) return false;
    const next = clone(months[source]);
    next.salary = next.salary.map((item) => ({ ...item, id: uid() }));
    next.savings = next.savings.map((item) => ({ ...item, id: uid() }));
    // Loans are independent snapshots, including their existing payment history.
    const loanIds = new Map(next.loans.map(loan => [loan.id, uid()]));
    const linkedIds = new Map();
    next.budget = next.budget.filter((item) => item.recurring || item.loanId).map((item) => {
      const id = uid();
      const loanId = loanIds.get(item.loanId) || null;
      if (loanId) linkedIds.set(loanId, id);
      return { ...item, id, loanId, paid: false, lastPaymentId: null };
    });
    next.loans.forEach((loan) => {
      loan.id = loanIds.get(loan.id);
      loan.budgetEntryId = linkedIds.get(loan.id) || null;
    });
    state = next;
    months[viewedMonth] = state;
    return true;
  }
  // Retained for callers that explicitly request a recurring rollover.
  function rollover(target = monthKey()) {
    if (!validMonth(target) || target <= activeMonth || months[target]) return false;
    const source = viewedMonth;
    if (!createMonth(target)) return false;
    return copyRecurring(source);
  }
  function getCurrency() { return currency; }
  function setCurrency(value) { currency = value; }

  /* ──────────────────────────────────────────────────────
     COMPUTED VALUES
  ────────────────────────────────────────────────────── */
  function computeSummary() {
    const current = visibleState();
    const monthlySalary = current.salary.reduce(
      (sum, s) => sum + safeNum(s.amount) * (FREQ_TO_MONTHLY[s.frequency] || 1),
      0
    );
    const totalSavings = current.savings.reduce((sum, s) => sum + safeNum(s.amount), 0);
    const budgetExpenses = current.budget
      .filter((b) => !b.loanId)
      .reduce((sum, b) => sum + safeNum(b.amount), 0);
    const loanPayments = current.budget
      .filter((b) => !!b.loanId)
      .reduce((sum, b) => sum + safeNum(b.amount), 0);
    const totalDeductions = budgetExpenses + loanPayments;
    const remaining = monthlySalary - totalDeductions;
    const paid = current.budget.filter((b) => b.paid).reduce((sum, b) => sum + safeNum(b.amount), 0);
    return { monthlySalary, totalSavings, budgetExpenses, loanPayments, totalDeductions, remaining, paid, pending: totalDeductions - paid };
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
    return visibleState().salary.reduce(
      (s, e) => s + safeNum(e.amount) * (FREQ_TO_MONTHLY[e.frequency] || 1),
      0
    );
  }

  function savingsTotal() {
    return visibleState().savings.reduce((s, e) => s + safeNum(e.amount), 0);
  }

  function budgetTotal() {
    return visibleState().budget.reduce((s, e) => s + safeNum(e.amount), 0);
  }

  function loansRemainingTotal() {
    return visibleState().loans.reduce((s, l) => s + loanStats(l).remaining, 0);
  }

  /* ──────────────────────────────────────────────────────
     MUTATIONS — SALARY
  ────────────────────────────────────────────────────── */
  function addSalary(values = {}) {
    const entry = { id: uid(), source: safeStr(values.source || '', 100), amount: safeNum(values.amount), frequency: VALID_FREQS.has(values.frequency) ? values.frequency : 'monthly' };
    state.salary.push(entry);
    return entry.id;
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
  function addSavings(values = {}) {
    const entry = { id: uid(), location: safeStr(values.location || '', 100), amount: safeNum(values.amount) };
    state.savings.push(entry);
    return entry.id;
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
  function addBudget(name, amount, loanId, recurring = false) {
    const entry = {
      id: uid(),
      name: safeStr(name || '', 100),
      amount: safeNum(amount),
      paid: false,
      loanId: loanId || null,
      lastPaymentId: null,
      recurring: !!recurring,
    };
    state.budget.push(entry);
    return entry.id;
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
    if (field === 'amount') {
      item.amount = safeNum(value);
      if (item.paid && item.loanId && item.lastPaymentId) {
        const loan = state.loans.find((entry) => entry.id === item.loanId);
        const payment = loan && loan.payments.find((entry) => entry.id === item.lastPaymentId);
        if (payment) payment.amount = item.amount;
      }
    }
    if (field === 'recurring') item.recurring = !!value;
  }

  function toggleBudgetPaid(id) {
    const item = state.budget.find((b) => b.id === id);
    if (!item) return null;
    return setBudgetPaid(id, !item.paid);
  }

  function setBudgetPaid(id, paid) {
    const item = state.budget.find((b) => b.id === id);
    if (!item || item.paid === !!paid) return null;
    item.paid = !!paid;
    if (!item.loanId) return { itemId: id, paymentId: null };
    const loan = state.loans.find((entry) => entry.id === item.loanId);
    if (!loan) return { itemId: id, paymentId: null };
    if (paid) {
      const payment = { id: uid(), date: new Date().toISOString(), amount: safeNum(item.amount) };
      loan.payments.push(payment);
      item.lastPaymentId = payment.id;
      return { itemId: id, paymentId: payment.id };
    }
    const paymentId = item.lastPaymentId;
    if (paymentId) loan.payments = loan.payments.filter((entry) => entry.id !== paymentId);
    item.lastPaymentId = null;
    return { itemId: id, paymentId };
  }

  /* ──────────────────────────────────────────────────────
     MUTATIONS — LOANS
  ────────────────────────────────────────────────────── */
  function addLoan(values = {}) {
    const entry = {
      id: uid(),
      name: safeStr(values.name || '', 100),
      total: safeNum(values.total),
      frequency: VALID_FREQS.has(values.frequency) ? values.frequency : 'monthly',
      paymentAmount: safeNum(values.paymentAmount),
      monthsPaid: Math.max(0, Math.floor(safeNum(values.monthsPaid))),
      budgetEntryId: null,
      payments: [],
    };
    state.loans.push(entry);
    return entry.id;
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
      recurring: true,
    });
    loan.budgetEntryId = budgetId;
    return true;
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.state = {
    // State access
    get: visibleState,
    getExport: getState,
    getDocument,
    loadDocument,
    listMonths,
    viewMonth,
    createMonth,
    copyRecurring,
    hasData,
    validMonth,
    rollover,
    activeMonth: () => activeMonth,
    viewedMonth: () => viewedMonth,
    currentMonth: monthKey,
    isReadOnly,
    getCurrency,
    setCurrency,
    set: setState,
    resetDocument,

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
