/** Plain local draft. Exports remain the portable backup. */
(function () {
  'use strict';
  const KEY = 'b2g-document-v2';
  let timer = null;
  let suspended = false;

  function status(label, state) {
    const el = document.getElementById('save-status');
    if (!el) return;
    el.textContent = label;
    el.dataset.state = state;
  }

  function restore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const doc = JSON.parse(raw);
      if (!App.state.loadDocument(doc)) throw new Error('Invalid saved draft');
      status('Draft restored', 'saved');
      return true;
    } catch (_) {
      suspended = true;
      status('Draft unavailable — import a backup or wipe', 'error');
      return false;
    }
  }

  function flush() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (suspended) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(App.state.getDocument()));
      status('Saved on this device', 'saved');
      return true;
    } catch (_) {
      status('Not saved — export a backup', 'error');
      return false;
    }
  }

  function requestSave() {
    if (suspended || App.state.isReadOnly()) return;
    status('Saving…', 'saving');
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 300);
  }

  function clear() {
    if (timer) clearTimeout(timer);
    timer = null;
    suspended = true;
    try { localStorage.removeItem(KEY); } catch (_) {}
    status('No local draft', 'idle');
    setTimeout(() => { suspended = false; }, 0);
  }

  function resume() { suspended = false; }

  App.persistence = { restore, requestSave, flush, clear, resume };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && timer) flush();
  });
  window.addEventListener('pagehide', () => { if (timer) flush(); });
})();
