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

  let activeDialog = null;
  let dialogReturnFocus = null;
  function openDialog(modal, focusTarget) {
    dialogReturnFocus = document.activeElement;
    activeDialog = modal;
    modal.removeAttribute('hidden');
    requestAnimationFrame(() => (focusTarget || modal.querySelector('button, input, select')).focus());
  }
  function closeDialog(modal) {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    if (activeDialog === modal) {
      activeDialog = null;
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
    if (previewEl()) previewEl().textContent = expectedExportFilename('.json', encrypted);
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

  function openModal() {
    const modal    = exportModalEl();
    const fnInput  = filenameEl();
    const preview  = previewEl();
    const encChk   = exportEncryptEl();

    if (!modal) return;
    openDialog(modal, fnInput);
    if (preview) preview.textContent = defaultFilename() + '.json';
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
    const modal = exportModalEl();
    closeDialog(modal);
  }

  function getModalFilename() {
    const raw = (filenameEl() || {}).value || '';
    return App.utils.sanitizeFilename(raw) || defaultFilename();
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
    const hasFile = !!pendingImportFile;
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
        zoneTitle.innerHTML = 'Drop your file here or <strong>click to browse</strong>';
      }
    }
    if (zoneSub) {
      if (hasFile) {
        zoneSub.textContent = fmtFileSize(pendingImportFile.size) + ' • Click or drop another file to replace';
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
    pendingImportFile = file || null;
    previewDocument = null;
    const preview = document.getElementById('import-preview');
    if (preview) preview.hidden = true;
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
    if (button) { button.disabled = true; button.textContent = 'Reading…'; }
    try {
      const doc = await App.io.processFile(pendingImportFile, null, getImportOptions());
      previewDocument = doc;
      const preview = document.getElementById('import-preview');
      const count = Object.keys(doc.months).length;
      const current = doc.months[doc.activeMonth];
      if (preview) {
        preview.textContent = `${count} month${count === 1 ? '' : 's'} · latest ${doc.activeMonth} · ${doc.currency.split('|')[0]} · ${current.salary.length} income · ${current.budget.length} budget items · ${current.loans.length} loans. Import will replace this device's current draft.`;
        preview.hidden = false;
      }
      if (button) button.textContent = 'Replace Draft and Import';
    } catch (err) {
      toast('Import failed: ' + String(err.message || err), 'error');
      if (button) button.textContent = 'Preview Import';
    } finally {
      if (button) button.disabled = false;
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

  async function wipeAllData() {
    const confirmed = window.confirm('This will wipe all local Budget2Go data, preferences, and offline caches. Continue?');
    if (!confirmed) return false;

    App.state.resetDocument();
    App.persistence.clear();

    try {
      localStorage.removeItem('b2g-theme');
      localStorage.removeItem('b2g-currency');
      localStorage.removeItem('b2g-last-export');
    } catch (_) {}

    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith('workbox-')).map((k) => caches.delete(k)));
      }
    } catch (_) {}

    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        const ownScope = new URL('./', window.location.href).href;
        await Promise.all(regs.filter((r) => r.scope === ownScope).map((r) => r.unregister()));
      }
    } catch (_) {}

    document.documentElement.setAttribute('data-theme', 'dark');
    if (App.utils && App.utils.setCurrency) {
      App.utils.setCurrency('PHP', 'en-PH');
      const sel = document.getElementById('currency-select');
      if (sel) sel.value = 'PHP|en-PH';
    }
    privacyStats.outboundRequests = 0;
    App.render.all();
    App.persistence.clear();
    toast('All local data wiped from this browser.', 'success');
    return true;
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
  let calcExpr = '';
  let calcLastExpr = '';
  let calcJustEvaluated = false;

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
  }

  function calcToggle(open) {
    const panel = calcPanelEl();
    const fab = calcFabEl();
    if (!panel || !fab) return;
    const isOpen = typeof open === 'boolean' ? open : panel.hasAttribute('hidden');
    if (isOpen) {
      panel.removeAttribute('hidden');
      fab.setAttribute('aria-expanded', 'true');
    } else {
      panel.setAttribute('hidden', '');
      fab.setAttribute('aria-expanded', 'false');
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
        setTimeout(() => calcRender(), 700);
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

  function calcCurrentNumber() {
    if (!calcExpr) return null;
    const n = Number(calcExpr);
    return Number.isFinite(n) ? n : null;
  }

  function calcApplyResultToTarget() {
    if (!calcLastTargetInput || !document.contains(calcLastTargetInput)) {
      toast('Select an amount field first, then use calculator result.', 'info');
      return;
    }
    let value = calcCurrentNumber();
    if (value == null && calcExpr) {
      try {
        value = calcEvaluate(calcExpr);
      } catch (_) {
        value = null;
      }
    }
    if (value == null) {
      toast('Calculator result is not a valid number.', 'error');
      return;
    }
    calcLastTargetInput.focus();
    calcLastTargetInput.value = String(value);
    calcLastTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
    calcLastTargetInput.dispatchEvent(new Event('change', { bubbles: true }));
    toast('Calculator result applied to selected field.', 'success');
  }

  function initCalculator() {
    const fab = calcFabEl();
    const panel = calcPanelEl();
    const closeBtn = calcCloseEl();
    const applyBtn = calcApplyEl();
    const grid = calcGridEl();
    if (!fab || !panel || !grid) return;

    fab.addEventListener('click', () => calcToggle());
    if (closeBtn) closeBtn.addEventListener('click', () => calcToggle(false));
    if (applyBtn) applyBtn.addEventListener('click', calcApplyResultToTarget);

    document.addEventListener('focusin', (e) => {
      const t = e.target;
      if (!t || !(t instanceof HTMLInputElement)) return;
      if (t.type !== 'number') return;
      calcLastTargetInput = t;
    });

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-calc]');
      if (!btn) return;
      calcHandleInput(btn.dataset.calc);
    });

    document.addEventListener('keydown', (e) => {
      if (panel.hasAttribute('hidden')) return;
      if (e.key === 'Escape') {
        calcToggle(false);
        return;
      }
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
      if (panel.contains(e.target)) return;
      calcToggle(false);
    });

    calcRender();
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && activeDialog) {
      const focusable = [...activeDialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]')].filter((node) => !node.closest('[hidden]'));
      if (focusable.length) {
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key !== 'Escape') return;
    if (exportModalEl() && !exportModalEl().hasAttribute('hidden')) closeModal();
    if (importModalEl() && !importModalEl().hasAttribute('hidden')) closeImportModal();
    if (privacyModalEl() && !privacyModalEl().hasAttribute('hidden')) closePrivacyModal();
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
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
     RESPONSIVE MODE
  ────────────────────────────────────────────────────── */
  function syncScreenMode() {
    const isCompact = window.matchMedia('(max-width: 860px)').matches;
    document.body.classList.toggle('stack-layout', isCompact);
    const mobileCards = window.matchMedia('(max-width: 639px)').matches;
    document.querySelectorAll('.loan-row').forEach((row) => {
      row.querySelectorAll('.loan-detail').forEach((cell) => { cell.inert = mobileCards && !row.classList.contains('details-open'); });
    });
  }

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
    if (exportEncryptEl()) {
      exportEncryptEl().addEventListener('change', syncExportEncryptionUI);
    }

    syncImportControls();
    syncScreenMode();
    window.addEventListener('resize', syncScreenMode, { passive: true });
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.ui = {
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
