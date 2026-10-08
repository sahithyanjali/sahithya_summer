# Sphoorthi Seva Trust — Tablet & iPad Application

Official iPad & Android Tablet split-screen application for **Sphoorthi Seva Trust (Reg: 402/2021)**.

## Highlights
- **Master-Detail Layout**: High-density 2-pane navigation designed specifically for iPad Air, iPad Pro, and 10"-12" Android tablets.
- **Side-by-Side Live Feeds**: Live 80G donation stream alongside real-time civic disaster & food relief dispatches.
- **Relief Camp Operations Matrix**: Multi-card progress trackers for rural Annadana field stations with target vs served metrics.
- **Full Cryptographic Audit Table**: Complete desktop-grade spreadsheet-style ledger for instant verification of tax-exempt receipts.

## Project Structure
```text
tablet/
├── package.json                          # Package dependencies & scripts
├── README.md                             # Documentation
└── src/
    ├── types.ts                          # TypeScript interfaces for Tablet
    ├── TabletApp.tsx                     # Master-Detail root component
    └── components/
        ├── TabletMasterNav.tsx           # Persistent left navigation drawer with live totals
        ├── TabletLiveFeeds.tsx           # Split 2-column real-time feed stream
        ├── TabletCampDashboard.tsx       # Relief camp radial progress grids
        └── TabletAuditLedger.tsx         # Full-width 80G tax compliance verification table
```

## Running the Tablet App
```bash
cd tablet
npm install
npm run dev
```
