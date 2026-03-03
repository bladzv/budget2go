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
    modal.removeAttribute('hidden');
    if (preview) preview.textContent = defaultFilename() + '.json';
    if (fnInput) fnInput.value = '';
    if (encChk) encChk.checked = false;
    if (exportPwdEl()) exportPwdEl().value = '';
    syncExportEncryptionUI();
    syncExportTargetHints();
    if (fnInput) setTimeout(() => fnInput.focus(), 60);

    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function closeModal() {
    const modal = exportModalEl();
    if (modal) modal.setAttribute('hidden', '');
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
  let pendingImportFile = null;

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
    modal.removeAttribute('hidden');
    setPendingImportFile(null);
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  function closeImportModal() {
    const modal = importModalEl();
    if (modal) modal.setAttribute('hidden', '');
  }

  function getImportOptions() {
    const encrypted = !!(importEncryptedEl() && importEncryptedEl().checked);
    return {
      encrypted: encrypted,
      password: encrypted ? ((importPwdEl() || {}).value || '') : '',
    };
  }

  function submitImport() {
    if (!pendingImportFile) return;
    App.io.processFile(
      pendingImportFile,
      () => {
        App.render.all();
        closeImportModal();
        setPendingImportFile(null);
      },
      getImportOptions()
    );
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (exportModalEl() && !exportModalEl().hasAttribute('hidden')) closeModal();
    if (importModalEl() && !importModalEl().hasAttribute('hidden')) closeImportModal();
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (exportModalEl() && !exportModalEl().hasAttribute('hidden') && e.target === exportModalEl()) {
      closeModal();
      return;
    }
    if (importModalEl() && !importModalEl().hasAttribute('hidden') && e.target === importModalEl()) {
      closeImportModal();
    }
  });

  /* ──────────────────────────────────────────────────────
     RESPONSIVE MODE
  ────────────────────────────────────────────────────── */
  function syncScreenMode() {
    const isCompact = window.matchMedia('(max-width: 860px)').matches;
    document.body.classList.toggle('stack-layout', isCompact);
  }

  /* ──────────────────────────────────────────────────────
     DROP ZONE
  ────────────────────────────────────────────────────── */
  function initDropZone() {
    const zone      = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
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
    openModal,
    closeModal,
    getModalFilename,
    getExportOptions,
    openImportModal,
    closeImportModal,
    getImportOptions,
    submitImport,
    initDropZone,
  };
})();
