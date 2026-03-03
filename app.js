/**
 * app.js — Application entry point.
 * All dependencies are already loaded.
 * Depends on: utils.js, state.js, render.js, io.js, ui.js, events.js
 */
(function () {
  'use strict';

  function init() {
    if (!window.App || !App.render || !App.ui) return;
    // 1. Wire up the drop zone for file import
    App.ui.initDropZone();

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
