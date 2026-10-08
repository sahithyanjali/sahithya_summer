# Seva Sphoorthi — Backend Microservices & Cloud API (`backend/`)

Secure Node.js / Express backend service powering **Sphoorthi Seva Trust (Reg: 402/2021)** across all client platforms (iOS, Android, Tablet, KaiOS, PWA, and Admin Web).

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status & timestamp |
| `GET` | `/api/v1/donations` | Live ledger of 80G tax-exempt donations & totals |
| `POST` | `/api/v1/donations` | Submit verified donation with PAN & generate 80G receipt |
| `GET` | `/api/v1/donations/receipt/:id`| Download / retrieve official 80G tax receipt data |
| `GET` | `/api/v1/events` | Civic drives feed (Blood donation, Vidya kits, Food drives) |
| `POST` | `/api/v1/events/rsvp` | Volunteer RSVP and attendance registration |
| `GET` | `/api/v1/camps` | Rural Annadana relief camps meal targets & coordinates |
| `POST` | `/api/v1/camps/meal-update` | Field coordinator live meal dispatch updates |
| `GET` | `/api/v1/volunteers` | Volunteer roster and regional assignments |
| `POST` | `/api/v1/volunteers/register` | Volunteer onboarding & interest area dispatch |
| `GET` | `/api/v1/audit` | Cryptographic public ledger of all transactions |
| `GET` | `/api/v1/audit/verify/:hash` | Verify SHA-256 block hash integrity |

## Project Structure
```text
backend/
├── package.json                          # Dependencies (express, cors, dotenv, firebase-admin)
├── tsconfig.json                         # TypeScript configuration
├── firestore.rules                       # Firestore security rules
├── README.md                             # Documentation
└── src/
    ├── index.ts                          # Server launcher on port 8080 / process.env.PORT
    ├── app.ts                            # Express application setup & route mounting
    ├── db/
    │   └── mockDb.ts                     # Pre-seeded database with verified trust records
    ├── models/
    │   └── types.ts                      # Entity definitions (Donation, Camp, Event, Audit)
    ├── routes/
    │   ├── donations.routes.ts           # 80G ledger & contribution handlers
    │   ├── events.routes.ts              # Civic drive announcements & RSVPs
    │   ├── camps.routes.ts               # Field relief meal distribution tracking
    │   ├── volunteers.routes.ts          # Volunteer verification & onboarding
    │   └── audit.routes.ts               # Blockchain-style transparency verification
    └── services/
        └── matching.service.ts           # Volunteer-to-opportunity matching algorithm
```

## Running the Backend
```bash
cd backend
npm install
npm run dev     # Starts server via tsx on port 8080
```

