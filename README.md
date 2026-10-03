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
- GitHub Pages: https://bladzv.github.io/budget2go/

## Overview
Budget2Go is a lightweight, browser-based personal finance app for tracking:
- Income and salary, including frequency-aware monthly equivalents
- Savings balances
- Budget and expense items
- Loan balances, payment progress, and payment history

It supports JSON/CSV import and export, password-protected encrypted `.bgo` files, offline use through a PWA service worker, and user-selectable display currency and theme.

## Features
- Realtime totals and summary stats while editing fields
- Versioned monthly plans, local autosave, and read-only history
- New-month rollover that copies income, recurring expenses, and linked loan payments
- Paid loan budget items record dated payments and update loan progress; recent actions can be undone
- Loan tracking with `Months Paid` support and progress calculations
- Budget item paid state for visual tracking of completed expenses
- Single budget currency with common presets: PHP, USD, EUR, GBP, JPY, SGD. Switching the label never converts amounts.
- Light/dark theme toggle with saved preference
- Privacy dashboard with local storage/cache/export/network visibility
- One-click local data wipe (state, preferences, and offline caches)
- Calculator "Use Result" action to apply computed values into focused amount fields
- Installable PWA with offline caching
- Export options:
  - Plain JSON
  - Plain CSV
  - Encrypted `.bgo` using AES-GCM + PBKDF2
- Import options:
  - JSON / CSV
  - Encrypted `.bgo` with password
  - Preview and explicit confirmation before replacing the local draft
- Responsive layout:
  - Desktop: card-based dashboard
  - Mobile: stacked card rows for each table

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript with IIFE modules and a shared `window.App` namespace
- Vite for development and production builds
- `vite-plugin-pwa` for offline support and app manifest generation
- `lucide` icons from npm
- Playwright for smoke/regression testing
- Web Crypto API for encryption and decryption

## Getting Started
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

## Deploy to GitHub Pages
This repository now includes an automated GitHub Pages workflow at `.github/workflows/deploy-pages.yml`.

How it works:
1. Trigger: runs on every push to `main` and on manual `workflow_dispatch`.
2. Quality gate: installs dependencies, installs Playwright Chromium, and runs `npm run test`.
3. Build: runs `npm run build`.
4. Publish: uploads `dist/` and deploys it with GitHub Pages actions.

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
├── app.js
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── events.js
├── index.html
├── io.js
├── lucide-setup.js
├── main.js
├── playwright.config.js
├── public/
│   └── icon.svg
├── render.js
├── state.js
├── styles.css
├── tests/
│   └── budget.spec.js
├── ui.js
├── utils.js
├── vite.config.mjs
├── package.json
├── package-lock.json
└── LICENSE
```

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

The latest month is editable. Earlier months remain available as read-only snapshots. When the calendar advances, **Start New Month** copies income, recurring budget items, and linked loan items into the new month with paid states reset. Savings and loans carry forward. Mark a linked loan budget item paid to record a payment; **Undo** reverses that action for six seconds.

The app saves edits locally and shows the save state in the header. JSON and CSV exports include all months; CSV also includes spreadsheet-friendly tables for the latest viewed month. Importing either format previews its contents before replacing the current draft. A storage failure is shown in the header; export a backup if that happens.

## Privacy Disclaimer
- Budget2Go is a static client-side web application.
- Import and export processing happens locally in your browser.
- Local drafts are stored unencrypted in this browser profile until wiped.
- The app does not upload your files or financial data to a backend server.
- Core app flows are designed to run without third-party network requests.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE).
