/* Browsers cannot load local ES modules from file://. Use the bundled classic
   build for that case; HTTP(S) uses the normal Vite module entry. */
if (location.protocol === 'file:') {
  var script = document.createElement('script');
  script.src = './standalone.js';
  script.defer = true;
  script.onerror = function () {
    var notice = document.createElement('p');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'Budget2Go could not load its local app bundle. Run npm run build:standalone in this folder, then reopen this file.';
    document.body.prepend(notice);
  };
  document.head.appendChild(script);
}
