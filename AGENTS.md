# Repository Guidance

## Project shape

- Budget2Go is a browser-based personal finance app built with HTML, CSS, and vanilla JavaScript.
- Runtime modules are IIFEs that expose their APIs through the shared `window.App` namespace. Keep module boundaries and the existing namespace pattern when changing application code.
- `main.js` is the Vite entry point. It imports `lucide-setup.js` first, followed by the application modules; preserve that order because the modules depend on the shared browser globals.
- `app.js` initializes the app after the DOM is ready. `index.html` and `standalone.js` support opening the app directly from disk; `standalone.js` is generated from the source modules.

## Development and verification

- Install dependencies with `npm install`.
- Start the Vite development server with `npm run dev`.
- Build the production app and refresh the standalone bundle with `npm run build`.
- Run browser tests with `npm run test`. Playwright covers desktop and mobile Chrome; the first test also exercises the checked-in page through `file://`.
- If Playwright's Chromium browser is missing, install it with `npm run test:install`.

## Change conventions

- Keep the app client-side and compatible with static hosting and offline use. Do not introduce a server dependency for ordinary app behavior.
- Preserve local-only handling of financial data and the existing JSON, CSV, and encrypted `.bgo` import/export behavior.
- When changing source modules, update the generated standalone bundle through `npm run build` when the change affects direct `file://` use.
- Keep tests focused on observable browser behavior and use the existing Playwright setup.
