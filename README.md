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
Budget2Go is a lightweight, browser-based budgeting app for tracking:
- Income and salary (with frequency-aware monthly equivalent)
- Savings balances
- Budget/expense items
- Loan balances, payments, and progress

It supports JSON/CSV import/export and password-protected encrypted exports/imports.
Default currency formatting is Philippine Peso (`PHP`, `₱`).

## Features
- Realtime computation of totals and summary stats while editing fields
- Loan tracking with payment history and `Months Paid` support
- Budget/expense fulfillment checkbox for tracking paid/done items (visual state only)
- Export options:
  - Plain JSON
  - Plain CSV
  - Encrypted `.bgo` (AES-GCM + PBKDF2)
- Import options:
  - JSON / CSV
  - Encrypted `.bgo` with password
- Responsive layout:
  - Desktop: 2x2 card grid
  - Tablet/Mobile: vertically stacked cards

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript (IIFE modules, no frontend framework)
- Web Crypto API for encryption/decryption
- Puppeteer-based smoke/regression script (`test-app.mjs`)

## Getting Started
### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
Serve the project root with any static file server, for example:
```bash
python3 -m http.server 8765
```
Then open:
`http://127.0.0.1:8765/index.html`

### 3. Run smoke/regression script
```bash
node test-app.mjs
```

## Deploy to GitHub Pages
This app is static (HTML/CSS/JS), so it works directly on GitHub Pages.

1. Push this repository to GitHub.
2. Go to `Settings` → `Pages`.
3. Set `Build and deployment` to:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (or your default branch)
   - `Folder`: `/ (root)`
4. Save and wait for Pages deployment.

Notes:
- `.nojekyll` is included to avoid Jekyll processing issues.
- All asset/script references are relative, so project-site deployments (for example `/your-repo/`) work correctly.

## Project Structure
```text
budget-n-go/
├── app.js
├── events.js
├── index.html
├── io.js
├── render.js
├── state.js
├── styles.css
├── test-app.mjs
├── ui.js
├── utils.js
├── package.json
├── package-lock.json
├── LICENSE
└── node_modules/
```

## Security Notes
- Encrypted exports use:
  - `AES-GCM (256-bit)` for authenticated encryption
  - `PBKDF2-SHA256` with per-file random salt and high iteration count
  - Per-file random IV
- Exported CSV values are hardened against formula injection.
- App includes a restrictive `Content-Security-Policy` meta policy for static hosting.
- Use strong passwords for encrypted exports.

## Privacy Disclaimer
- Budget2Go is a static client-side web application.
- Import/export processing happens locally in your browser.
- This app does not upload your files or financial data to a backend server.

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE).
