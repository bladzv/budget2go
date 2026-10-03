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

## Live Demo

- [GitHub Pages](https://bladzv.github.io/budget2go/)

## Overview
Budget2Go is a lightweight, browser-based personal finance app for tracking:
- Income and salary, including frequency-aware monthly equivalents
- Savings balances
- Budget and expense items
- Loan balances, payment progress, and payment history

It supports JSON/CSV import and export, password-protected encrypted `.bgo` files, offline use through a PWA service worker, and user-selectable display currency and theme.

## Current Project Status

Updated October 4, 2026. The repository currently implements a client-side monthly planning app with five views: **Overview**, **Budget**, **Accounts**, **Loans**, and **Settings**. Desktop uses sidebar navigation and tables; mobile uses bottom navigation, compact rows, and entry sheets. The app includes refreshed branding and a welcome introduction whose dismissal is remembered in this browser.

- **Monthly planning:** independently editable months, a month/year picker, optional recurring-item copying into an empty month, paid/unpaid filters, and totals for planned commitments and unallocated income.
- **Accounts and loans:** frequency-aware income, savings balances, loan starting progress in repayment periods, dated payment history, payoff limits, and undo for recent changes.
- **Editing tools:** staged entry forms, explicit edit controls, quick amount edits, calculators beside amount fields, localized number formatting, and system/light/dark appearance.
- **Data and backups:** local autosave, version 3 JSON/CSV backups covering all months, legacy backup imports, encrypted `.bgo` exports, import previews, and optional wiping after export with a separate confirmation.
- **Delivery and coverage:** Vite production builds, a generated bundle for opening `index.html` directly, offline PWA support, and Playwright suites configured for desktop and mobile Chrome. GitHub Pages CI checks dependency advisories, bundle freshness, and browser tests before deployment.

Financial data is stored in this browser profile; there is no backend, account login, bank integration, or cloud synchronization. Monthly accounts and loans are independent snapshots, so edits and payments in one month do not update another month. Currency changes relabel amounts without converting them. Backups are the way to move records between browsers or devices.

## Features

- Realtime totals and summary stats while editing fields
- Independently editable monthly plans, a month/year picker, and local autosave
- Empty new months with optional copying of recurring items from another month
- Paid loan budget items record dated payments and update loan progress; recent actions can be undone
- Loan tracking with frequency-aware starting repayment periods, payoff limits, and progress calculations
- Budget item paid state for visual tracking of completed expenses
- Single budget currency with common presets: PHP, USD, EUR, GBP, JPY, SGD. Switching the label never converts amounts.
- System, light, and dark appearance with saved preference
- Privacy dashboard with local storage/cache/export/network visibility
- Confirmed local data wipe (state, preferences, and offline caches), preserving the welcome dismissal preference
- Calculator controls beside amount fields, with an explicit destination and a valid, non-negative result before applying; the floating calculator also works independently
- Installable PWA with offline caching
- Export options:
  - Plain JSON
  - Plain CSV
  - Encrypted `.bgo` using AES-GCM + PBKDF2
- Import options:
  - JSON / CSV
  - Encrypted `.bgo` with password
  - Preview and explicit confirmation before replacing the local draft
- Five focused views: Overview, Budget, Accounts, Loans, and Settings
- Overview with unallocated income, planned/unpaid commitments, and payment progress
- Staged entry forms; quick amount edits commit on Enter or blur, and Escape cancels
- All, Unpaid, and Paid budget filters; full loan payment history in paginated details
- Responsive layout:
  - Desktop: sidebar navigation, tables, and loan progress cards
  - Mobile: bottom navigation, stacked rows, and entry sheets

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript with IIFE modules and a shared `window.App` namespace
- Vite for development and production builds
- Rolldown for the standalone browser bundle
- `vite-plugin-pwa` for offline support and app manifest generation
- `lucide` icons from npm
- Playwright for smoke/regression testing
- Web Crypto API for encryption and decryption

## Getting Started

GitHub Pages CI uses Node.js 20. Install Node.js and npm before running the commands below.

On macOS, you can also open `index.html` directly in Brave. The repository
includes a standalone browser bundle for this case; `npm run build` refreshes it
after source changes. A local `file://` page cannot install the offline PWA, so
use the dev server or deployed site for that feature.

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```
Open the URL Vite prints in the terminal.

### 3. Build for production
```bash
npm run build
```

This builds the production site in `dist/` and refreshes the checked-in `standalone.js`. When only the direct-file bundle needs refreshing, run `npm run build:standalone`.

### 4. Preview the production build
```bash
npm run preview
```

### 5. Run the browser tests
```bash
npm run test
```

If Playwright browsers are not installed yet:
```bash
npm run test:install
```

The suites cover desktop Chrome and mobile Chrome (Pixel 5), including direct `file://` loading, monthly planning, loan progress, backup round trips, calculator destinations, welcome dismissal, export/wipe safeguards, and responsive layouts. Coverage is defined in the test files; run the suite to obtain current pass/fail results.

## Deploy to GitHub Pages

The automated GitHub Pages workflow is defined in `.github/workflows/deploy-pages.yml`.

How it works:
1. Trigger: runs on every push to `main` and on manual `workflow_dispatch`.
2. Dependencies: installs with `npm ci`, checks `npm audit --audit-level=high`, and installs Playwright Chromium.
3. Build: runs `npm run build`, then checks that the generated `standalone.js` matches the checked-in bundle.
4. Browser tests: runs `npm run test` on desktop and mobile Chrome.
5. Publish: uploads `dist/` and deploys it with GitHub Pages actions after those checks pass.

One-time repository setup:
1. In GitHub, go to **Settings > Pages**.
2. Set **Source** to **GitHub Actions**.
3. Ensure pushes to `main` are permitted for your release flow.

Manual fallback deploy (if needed):
1. Run `npm run build`.
2. Publish the contents of `dist/` to your static host.

Notes:
- `.nojekyll` is included to avoid Jekyll processing issues.
- Static asset URLs are configured for project-site deployments such as `/budget2go/`.

## Project Structure

```text
budget2go/
├── AGENTS.md
├── .agents/
│   └── skills/
│       ├── generate-logs/SKILL.md
│       └── generate-pr-description/SKILL.md
├── app.js
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── events.js
├── file-loader.js
├── icon.png
├── icon.svg
├── index.html
├── io.js
├── lucide-setup.js
├── main.js
├── playwright.config.js
├── persistence.js
├── public/
│   ├── file-loader.js
│   ├── icon.png
│   └── icon.svg
├── output/
│   └── logo-concepts/
├── render.js
├── standalone.js
├── state.js
├── styles.css
├── tests/
│   ├── budget.spec.js
│   ├── calculator.spec.js
│   └── welcome-export.spec.js
├── ui.js
├── utils.js
├── vite.config.mjs
├── package.json
├── package-lock.json
└── LICENSE
```

`main.js` imports Lucide setup first, then the application modules. Runtime modules expose their APIs through `window.App`; `app.js` initializes them after the DOM is ready. `persistence.js` handles local draft storage, while `file-loader.js` selects the generated standalone bundle for direct-file use.

## Security Notes

- Encrypted exports use:
  - AES-GCM for authenticated encryption
  - PBKDF2-SHA256 with a per-file random salt and a high iteration count
  - A per-file random IV
- Exported CSV values are hardened against formula injection.
- The app uses a meta Content Security Policy for supported directives. GitHub Pages does not supply project-specific response headers here, so this policy does not provide framing protection.
- Use strong passwords for encrypted exports.
- The autosaved draft is plain data in this browser's local storage. Anyone with access to this browser profile can read it; use encrypted exports for portable backups.
- Import limits are 5 MB, 120 months, 2,000 entries per category per month, and 5,000 payments per loan.

## Monthly Workflow

Open **Overview** for the monthly plan, **Budget** to add expenses or mark items paid, **Accounts** for income and savings, and **Loans** for repayments. Choose a month with the shared month picker. **Unallocated income** means monthly income minus planned commitments; it is not a bank balance. Backups, currency, appearance, and privacy controls are in **Settings**. The header offers **Export** when a document has data, and **Import** when it is empty.

Add entries through a form and save when ready; closing the form discards unfinished changes. Use the pencil buttons to edit income, savings, or expense details; select a loan name to open its details and payment history. Quick amount edits save on Enter or when leaving the field; Escape restores the prior amount.

The month picker supports every month from year 1 to 9999, with up to 120 saved months in a document. Past and future months are independently editable. Opening a new month starts an empty plan. **Copy recurring items** optionally copies income, savings, loans (including starting progress and payment history), recurring expenses and linked loan items from a chosen month, with paid checkboxes reset. Changes remain confined to the selected month. Mark a linked loan budget item paid to record a payment; **Undo** reverses that action for six seconds.

The app saves edits locally. The header offers Import for an empty document and Export when financial data exists in any month. Version 3 JSON and CSV backups preserve all months, the selected month and currency; CSV also includes spreadsheet-friendly tables with a month column. Older JSON, CSV and encrypted backups remain importable. Importing either format previews its contents before replacing the current draft. A storage failure is shown above the page heading; export a backup if that happens.

Thousands separators are enabled by default for monetary values, with a saved toggle in Settings. Currency-specific separators are supported in amount fields; backup amounts remain numbers. Loan steppers adjust starting repayment periods before tracking, separately from recorded payments. The label follows the repayment frequency, and starting progress is capped at the number of payments needed to repay the loan. Legacy month-based loan progress retains its credited amount when imported.

### Welcome and Backup Cleanup

First visits show a welcome introduction explaining monthly planning, savings, loans, and local backups. Its dismissal is remembered in this browser, including after a wipe. This preference is excluded from exported financial backups.

Exports offer an optional **Wipe local data after export** checkbox. After the download starts, choose **I saved my backup — wipe data** only once your file is saved. **Keep data**, closing the dialog, or an export error retains your records. A confirmed wipe clears all months, preferences, export metadata, offline caches, Undo, and pending imports, while keeping the welcome dismissal marker. Failed deletion is reported; an undeleted saved draft is kept for recovery.

## Privacy Disclaimer

- Budget2Go is a static client-side web application.
- Import and export processing happens locally in your browser.
- Local drafts are stored unencrypted in this browser profile until wiped.
- The app does not upload your files or financial data to a backend server.
- Core app flows are designed to run without third-party network requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
