<h1 align="center">Budget2Go</h1>
<p align="center">Personal Finance Manager</p>

<p align="center">
  <a href="https://bladzv.github.io/budget2go/"><img alt="Live Demo | GitHub Pages" src="https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2EA44F"></a>
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg">
  <img alt="HTML" src="https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white">
  <img alt="CSS" src="https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black">
  <img alt="Open Source" src="https://img.shields.io/badge/Open%20Source-Yes-blue">
</p>

## Overview

Budget2Go is a browser-based personal finance app for planning a monthly budget, tracking paid expenses, keeping savings balances in view, and recording loan repayments. It calculates how much income remains unallocated and saves your records locally as you work.

The app runs entirely on the client, with no backend or account required. It supports desktop and mobile layouts, portable backups, and offline use through an installable Progressive Web App (PWA).

[Open the live demo on GitHub Pages](https://bladzv.github.io/budget2go/).

## What You Can Do

| View | Capabilities |
| --- | --- |
| **Overview** | See monthly income, planned commitments, unallocated income, paid/unpaid totals, payment progress, savings, and outstanding loans. Mark unpaid items complete. |
| **Budget** | Add and edit expenses, flag recurring items, include linked loan payments, and filter by All, Unpaid, or Paid. |
| **Accounts** | Track multiple income sources with monthly, bi-weekly, or weekly pay frequencies and record savings balances by institution or wallet. |
| **Loans** | Track loan totals, repayment frequency, amount per payment, starting repayment progress, remaining balances, and dated payment history. Add a loan payment to the budget. |
| **Settings** | Manage backups, currency, number formatting, appearance, the privacy dashboard, and local data deletion. |

Across the app, you can:

- Plan past, current, and future months using a shared month/year picker, with up to 120 saved months per document.
- Start an empty monthly plan or copy recurring items from another saved month.
- Add and edit entries in forms that save only when you choose **Save entry**. Quick amount edits commit on Enter or blur; Escape cancels them.
- Use calculators beside amount fields to apply a valid, non-negative result to that field, or use the floating calculator independently.
- Undo recent deletions and paid-state changes within six seconds.
- Choose PHP, USD, EUR, GBP, JPY, or SGD, localized amount formatting, and optional thousands separators.
- Follow the device theme or choose light or dark appearance.
- Use sidebar navigation and tables on desktop, or bottom navigation, compact rows, and entry sheets on mobile.

## Monthly Workflow

1. Choose a month and add income sources in **Accounts**, including the amount per pay period and frequency. Add savings balances separately.
2. Add planned expenses in **Budget** and flag expenses you want to copy into another month as recurring.
3. Add loans in **Loans**, enter any starting repayment progress, and use **To budget** to create linked payment items.
4. Check **Overview** to see how much income remains to allocate. Mark budget items paid as you complete them; paying a linked loan item records a dated payment and updates loan progress. Unmarking it removes that linked payment.
5. For an empty month, use **Copy recurring items** to copy income, savings, loans, recurring expenses, and linked loan items from another month. Paid checkboxes reset; loan starting progress and payment history carry over.
6. Export a backup from **Settings** to keep a portable copy of all months.

### How the Figures Work

- **Monthly income:** monthly amounts count once; bi-weekly amounts use `26 / 12`; weekly amounts use `52 / 12`. These are monthly averages.
- **Planned commitments:** expenses plus linked loan budget allocations. Adding a loan alone does not allocate a budget payment.
- **Unallocated income:** monthly income minus all planned commitments, including items already marked paid. Savings balances are shown separately. This figure is a planning total, not a bank balance.
- **Loan progress:** starting repayment periods and any preserved legacy partial-period credit, plus recorded payments. Remaining balances and progress use the entered loan total; the app does not calculate interest or amortization schedules.

Each month is an independent snapshot. Editing an account, expense, or loan, or recording a payment in one month, does not update another month. Copying recurring items is an explicit action available for an empty plan.

Currency is a display preference for the whole document. Switching currency relabels amounts without converting their values.

## Data, Backups, and Privacy

Edits autosave to this browser profile's local storage. Financial data and imported files are processed locally and are not uploaded to a backend. There is no login, bank integration, or cloud synchronization; use backups to move records between browsers or devices.

The local draft is stored **unencrypted**. Anyone with access to that browser profile can read it, and clearing browser storage can remove it. Export backups regularly. A visible save failure means you should export a backup to preserve your work.

### Backup Formats

| Format | Purpose |
| --- | --- |
| **JSON** | A complete Budget2Go document containing all months, the selected month, and currency. |
| **CSV** | A complete document plus spreadsheet-friendly section tables with a month column and loan payment history. |
| **Encrypted `.bgo`** | A password-protected JSON or CSV backup, encrypted locally with the Web Crypto API. |

Version 3 exports preserve all months. Older Budget2Go JSON, CSV, and encrypted backups remain importable. Imports use Budget2Go's document formats; CSV import is not a general-purpose bank statement importer.

Importing shows a preview and requires confirmation before replacing the entire local draft. It does not merge records. Import limits are 5 MB per file, 120 months, 2,000 entries per category per month, and 5,000 payments per loan.

The header offers **Import** when the document is empty and **Export** when any month contains financial data. Both controls are also available in **Settings**. Exports support custom filenames and an optional timestamp.

### Local Cleanup

The privacy dashboard shows local storage usage, cache count, last export time, whether the last export was encrypted, and observed outbound requests. Core app flows are designed to run without third-party network requests.

**Wipe all local data** requires confirmation and clears financial records, preferences, export metadata, offline caches, and pending actions. The welcome introduction's dismissal marker is retained and is excluded from financial backups.

Exports also offer **Wipe local data after export**. Once the download starts, a separate **I saved my backup — wipe data** confirmation lets you clear the browser's records after saving the file. Keeping data, closing the dialog, or an export error retains the draft. Failed cleanup is reported; if the saved draft cannot be deleted, records are kept for recovery.

### Security Details

- Encrypted exports use AES-GCM-256 with PBKDF2-SHA256, 600,000 iterations, and a random salt and IV per file. Encryption protects the exported file; it does not encrypt the autosaved draft.
- Use a strong password for encrypted backups. Encryption and decryption require browser support for the Web Crypto API.
- Exported CSV values are hardened against formula injection.
- The page includes a meta Content Security Policy for supported directives. The GitHub Pages setup does not supply project-specific response headers, so this policy does not provide framing protection.

## Run Locally

Use Node.js **20.19+ on the 20.x line, or 22.12+** and npm, matching the Vite and Rolldown engine requirements.

```bash
npm install
npm run dev
```

Open the URL Vite prints in the terminal.

### Open Directly from Disk

You can also open the checked-in `index.html` directly in a browser that supports local file pages. `file-loader.js` loads the included `standalone.js` bundle for `file://` use, so this path does not require a development server.

After changing runtime modules, refresh that bundle with `npm run build` or `npm run build:standalone`. Local file pages cannot install the PWA. Use the deployed HTTPS production site for installation and offline caching after the first load.

### Build and Preview

```bash
npm run build
npm run preview
```

The build creates the production site in `dist/` and refreshes the checked-in `standalone.js` bundle. Preview serves the production output locally.

### Browser Tests

```bash
npm run test:install
npm run test
```

The install command downloads Playwright's Chromium browser and is needed when it is not already available. Tests run against desktop Chrome and mobile Chrome (Pixel 5), with Vite started automatically by the test configuration.

The suites exercise direct `file://` loading, monthly planning, loan progress and payments, JSON/CSV/encrypted backup round trips, import previews, autosave failures, calculator destinations, welcome dismissal, export/wipe safeguards, privacy controls, and responsive layouts.

## Architecture

Budget2Go uses HTML, CSS, and vanilla JavaScript. Runtime modules are IIFEs exposing their APIs through the shared `window.App` namespace.

| File | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | App shell, views, dialogs, and responsive styling. |
| `main.js`, `lucide-setup.js` | Vite entry point and bundled Lucide icons. Lucide setup loads before the app modules. |
| `utils.js` | Formatting, currency handling, input sanitization, IDs, and filenames. |
| `state.js` | Monthly documents, financial records, calculations, and mutations. |
| `persistence.js` | Local draft restore, autosave, and storage status. |
| `render.js` | Tables, loan cards, summaries, and month labels. |
| `io.js` | Backup import/export, validation, CSV handling, and encryption. |
| `ui.js`, `events.js` | Navigation, forms, dialogs, calculator, privacy controls, and user interactions. |
| `app.js` | Initialization after the DOM is ready. |
| `file-loader.js`, `public/file-loader.js`, `standalone.js` | Direct-file loading and the generated browser bundle. |
| `vite.config.mjs`, `public/` | Static build configuration, PWA manifest/service worker generation, and assets. |
| `tests/`, `playwright.config.js` | Browser regression tests and desktop/mobile configuration. |
| `.github/workflows/deploy-pages.yml` | Build, validation, and GitHub Pages deployment. |

Vite builds the static site, Rolldown generates the standalone bundle, and `vite-plugin-pwa` generates the manifest and offline service worker. Keep application behavior client-side and regenerate `standalone.js` after source changes that affect direct-file use.

## Deployment

The GitHub Pages workflow runs on pushes to `main` and manual dispatch. It:

1. Installs dependencies with `npm ci` and checks dependency advisories with `npm audit --audit-level=high`.
2. Installs Playwright Chromium and builds the production and standalone bundles.
3. Checks that `standalone.js` matches the checked-in bundle and runs browser tests.
4. Uploads `dist/` and deploys to GitHub Pages when the checks pass.

To enable deployment, set the repository's **Settings > Pages > Source** to **GitHub Actions**.

For other static hosts, run `npm run build` and publish the contents of `dist/`. Asset paths use Vite's relative base (`./`), supporting project subpaths such as `/budget2go/`. No application server is required.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
