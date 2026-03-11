# TuxScan — CLAUDE.md

## Project Overview
TuxScan is a Progressive Web App (PWA) built for conference lead capture.
Users scan QR codes on attendee badges to extract contact info (name, title, email),
build a list of scanned contacts, and export/email that list as a CSV to any
specified email address. Must work seamlessly on iPhone (Safari) and Android (Chrome).

---

## Tech Stack
- **Framework:** React 18 + Vite
- **PWA:** vite-plugin-pwa (service worker, offline support, installable)
- **QR Scanning:** jsQR — pure JavaScript QR decoder, no WASM, no CDN dependency. Camera access via `getUserMedia`, frames drawn to a hidden canvas and decoded on each `requestAnimationFrame` tick. Replaced `@yudiel/react-qr-scanner` which silently failed because its `barcode-detector` polyfill fetched ZXing WASM from a remote CDN at runtime.
- **Database:** PouchDB (offline-first document database, persists to IndexedDB) + localStorage mirror as fallback
- **CSV Export:** papaparse (parse/unparse CSV data)
- **Email:** EmailJS (client-side email with CSV attachment — no backend needed)
- **Styling:** Tailwind CSS (mobile-first, utility-based)
- **No router needed** — single page, view-based state only

---

## Folder Structure
```
tuxscan/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512, maskable)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ScanButton.jsx      # "Scan Code" CTA button
│   │   ├── QRScanner.jsx       # Camera QR scanning modal/overlay
│   │   ├── ContactList.jsx     # List of scanned contacts
│   │   ├── ContactCard.jsx     # Individual contact row
│   │   ├── ExportModal.jsx     # Email input + send CSV modal
│   │   └── EmptyState.jsx      # UI when no contacts scanned yet
│   ├── hooks/
│   │   ├── useScanner.js       # QR scan logic + parsing
│   │   ├── useContacts.js      # PouchDB CRUD for contacts
│   │   └── useExport.js        # CSV generation + EmailJS send
│   ├── db/
│   │   └── pouchdb.js          # PouchDB instance and helpers
│   ├── utils/
│   │   └── parseQR.js          # QR string → { name, title, email }
│   ├── App.jsx                 # Root component, view state manager
│   ├── main.jsx                # Vite entry point
│   └── index.css               # Tailwind directives
├── CLAUDE.md
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Core Features

### 1. QR Code Scanning
- Large "Scan Code" button is the primary UI element
- Tapping opens a full-screen camera overlay
- Uses rear camera by default on mobile (`facingMode: 'environment'`)
- Auto-captures continuously — no button press needed once camera is open
- On successful scan, shows "Badge Scanned!" green checkmark overlay for 1.5s then auto-closes
- Debounced: same QR code ignored within 3 seconds to prevent duplicate fires
- Parses QR payload via `parseQR`: vCard → MECARD → JSON → plain-text email extraction → raw fallback (any QR code is captured)
- Prevents duplicate contacts (checked by email before inserting)
- Camera stream properly torn down on close via `getTracks().stop()`

### 2. Contact List
- Displays all scanned contacts in reverse chronological order
- Each card shows: name, title, email, and scan timestamp
- Swipe-to-delete or delete button per contact
- Shows empty state UI when list is empty
- Contact count shown in header

### 3. CSV Export & Email
- Export button opens a modal prompting for recipient email address
- Generates CSV with columns: Name, Title, Email, Scanned At
- Sends CSV as attachment via EmailJS (no backend)
- Confirmation message on successful send
- Falls back to CSV download if email send fails

### 4. Offline Support
- Full offline functionality — PouchDB persists all data locally
- PWA installable to home screen on iOS and Android
- Service worker caches all assets for offline use
- No network required for scanning or storing contacts

---

## Coding Conventions
- **Functional components only** — no class components
- **Named exports** for all components and hooks
- **Default export** only in App.jsx and main.jsx
- **Tailwind for all styling** — no inline styles, no CSS modules, no styled-components
- **Mobile-first** — design for 375px width upward, then scale up
- **No router** — manage views with simple React state (e.g. `currentView`)
- **Async/await** for all async operations, always with try/catch
- **PouchDB** is the single source of truth for contact data
- Component files use PascalCase, hooks/utils use camelCase

---

## PWA Requirements
- Fully installable on iOS Safari and Android Chrome
- Offline-first — all features work without network
- Manifest includes: name, short_name, icons, theme_color, display: standalone
- Service worker strategy: cache-first for assets, network-first for nothing (fully local)
- Camera permissions handled gracefully with fallback messaging
- Target icon sizes: 192x192, 512x512, maskable variant

---

## Device & Browser Targets
- **iOS:** Safari 16+ (iPhone X and newer)
- **Android:** Chrome 110+
- **Camera API:** getUserMedia with `{ video: { facingMode: 'environment' } }`
- Touch targets minimum 44x44px per Apple HIG
- No hover-dependent interactions — touch only

---

## Environment & Credentials
- EmailJS credentials stored in `.env`:
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`
- `.env` is gitignored — never commit credentials
- PouchDB requires no credentials — fully local

---

## Current Build Status
- [x] Project scaffolded (Vite + React)
- [x] vite-plugin-pwa configured
- [x] Tailwind CSS configured
- [x] PouchDB instance set up + localStorage mirror
- [x] QR scanner component built (jsQR + getUserMedia)
- [x] Contact list + PouchDB CRUD working
- [x] CSV export working
- [x] EmailJS integration working (requires .env credentials)
- [ ] PWA manifest + icons added (icons directory empty — needs PNG files)
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [x] Production build verified
- [x] Deployed to Netlify (https://tuxscan.netlify.app)

---

## Key Commands
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build locally
```
