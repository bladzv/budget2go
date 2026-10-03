/**
 * app.js — Application entry point.
 * All dependencies are already loaded.
 * Depends on: utils.js, state.js, render.js, io.js, ui.js, events.js
 */
(function () {
  'use strict';

  function init() {
    if (!window.App || !App.render || !App.ui) return;

    // 0. Restore user preferences (theme & currency) before first render
    App.ui.initShell();

    var restored = App.persistence.restore();
    var savedCurrency = restored ? App.state.getCurrency() : 'PHP|en-PH';
    try { if (!restored) savedCurrency = localStorage.getItem('b2g-currency') || 'PHP|en-PH'; } catch (_) {}
    App.state.setCurrency(savedCurrency);
    var cparts = savedCurrency.split('|');
    if (cparts.length === 2 && App.utils && App.utils.setCurrency) {
      App.utils.setCurrency(cparts[0], cparts[1]);
      var sel = document.getElementById('currency-select');
      if (sel) sel.value = savedCurrency;
    }

    // 1. Wire up the drop zone for file import
    App.ui.initDropZone();
    App.ui.initCalculator();
    App.ui.initUndo();

    // 2. Initial render (empty state)
    App.render.all();

    // 3. Bind all button and table events (after DOM and App are ready)
    if (App.events && typeof App.events.init === 'function') {
      App.events.init();
    }

    // 4. Render Lucide icons for the static HTML elements
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    } else {
      console.warn('[BudgetOS] Lucide icons CDN not loaded — icons will be missing.');
    }

    App.ui.showWelcome();
  }

  // Wait for full DOM before initialising
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
