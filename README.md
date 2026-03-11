# TuxScan

A Progressive Web App (PWA) for conference lead capture. Scan QR codes on attendee badges to extract contact info (name, title, email), build a list of scanned contacts, and export that list as a CSV via email.

Works seamlessly on iPhone (Safari) and Android (Chrome). Fully offline-capable — no backend required.

**Live:** https://tuxscan.netlify.app

---

## Features

- **Automatic QR scanning** — full-screen camera overlay, rear camera by default, continuous capture with no button press needed
- **Contact storage** — PouchDB (IndexedDB) + localStorage mirror, offline-first, duplicate prevention by email
- **CSV export** — generates Name/Title/Email/Scanned At CSV and emails it via EmailJS, with local download fallback
- **PWA installable** — add to home screen on iOS and Android, service worker caches all assets

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React 18 + Vite |
| PWA | vite-plugin-pwa + Workbox |
| QR Scanning | @zxing/library (ZXing engine) |
| Database | PouchDB + localStorage |
| CSV | papaparse |
| Email | @emailjs/browser |
| Styling | Tailwind CSS |

---

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env` file (never committed) with your [EmailJS](https://www.emailjs.com/) credentials:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

EmailJS is required only for the email-send feature. CSV download fallback works without it.

---

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build locally
```

---

## Project Structure

```
tuxscan/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512, maskable)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/
│   │   ├── QRScanner.jsx       # Camera scanning overlay (ZXing)
│   │   ├── ContactList.jsx     # Scanned contacts list
│   │   ├── ContactCard.jsx     # Individual contact row
│   │   ├── ScanButton.jsx      # Primary CTA button
│   │   ├── ExportModal.jsx     # Email + CSV export modal
│   │   └── EmptyState.jsx      # Empty list UI
│   ├── hooks/
│   │   ├── useScanner.js       # Scan orchestration + QR parsing
│   │   ├── useContacts.js      # PouchDB CRUD
│   │   └── useExport.js        # CSV generation + EmailJS
│   ├── db/pouchdb.js           # PouchDB instance
│   ├── utils/parseQR.js        # QR string → { name, title, email }
│   └── App.jsx                 # Root component
├── vite.config.js
└── tailwind.config.js
```

---

## Browser Targets

- **iOS:** Safari 16+ (iPhone X and newer)
- **Android:** Chrome 110+

Camera access requires HTTPS (provided automatically by Netlify and the Vite dev server).
