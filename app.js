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
    var savedTheme = 'dark';
    try { savedTheme = localStorage.getItem('b2g-theme') || 'dark'; } catch (_) {}
    document.documentElement.setAttribute('data-theme', savedTheme);
    var themeIcon = document.querySelector('#btn-theme-toggle i[data-lucide]');
    if (themeIcon) themeIcon.setAttribute('data-lucide', savedTheme === 'light' ? 'moon' : 'sun');

    var savedCurrency = 'PHP|en-PH';
    try { savedCurrency = localStorage.getItem('b2g-currency') || 'PHP|en-PH'; } catch (_) {}
    var cparts = savedCurrency.split('|');
    if (cparts.length === 2 && App.utils && App.utils.setCurrency) {
      App.utils.setCurrency(cparts[0], cparts[1]);
      var sel = document.getElementById('currency-select');
      if (sel) sel.value = savedCurrency;
    }

    // 1. Wire up the drop zone for file import
    App.ui.initDropZone();
    App.ui.initCalculator();

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

    // 5. Brief welcome notification
    App.ui.toast('BudgetOS loaded — start adding entries or import a file.', 'info');
  }

  // Wait for full DOM before initialising
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
