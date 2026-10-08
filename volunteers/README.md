# Sphoorthi Seva Trust — Volunteer Portal (`volunteers/`)

Dedicated Volunteer Self-Service & Seva Operations Portal for **Sphoorthi Seva Trust (Reg: 402/2021)**.

## Core Capabilities
- **Digital Seva Identity Pass (QR Badge)**: Complete volunteer credentials including Photo ID, Trust Registration stamp (Reg: 402/2021), Blood Group, SOS Emergency Contact, and cryptographically verifiable QR Code for field check-in.
- **Duty Shifts & Capacity Roster**: Browse upcoming civic drives (Annadana Food Distribution, Pediatric ICU Blood Donation, Vidya School Kit Disbursals) with live volunteer capacity meters and slot claiming/withdrawal.
- **Real-Time Check-In & Seva Hours Tracker**: Live check-in/out station with duration calculations, coordinator verification signatures, and an immutable duty attendance ledger.
- **Verifiable Cryptographic Certificate**: Generates official Certificates of Exemplary Seva featuring Trust Section 12A/80G credentials, SHA-256 verification hashes, and print-ready layouts.
- **Volunteer Onboarding & Registration**: Integrated registration modal syncing directly with the backend microservice (`/api/v1/volunteers/register`).

## Project Structure
```text
volunteers/
├── package.json                          # Vite, React, Lucide-React configuration
├── tsconfig.json                         # TypeScript compiler options
├── index.html                            # Portal HTML entry point with Tailwind CDN
├── README.md                             # Documentation & architectural overview
└── src/
    ├── main.tsx                          # React DOM bootstrapping
    ├── types.ts                          # TypeScript types (Profile, Shift, Log, Certificate)
    ├── VolunteersApp.tsx                 # Main self-service volunteer dashboard
    ├── data/
    │   └── mockVolunteerData.ts          # Pre-seeded volunteer profile, shifts & logs
    └── components/
        ├── VolunteerBadgeCard.tsx        # Official ID Card with QR pass & SOS contacts
        ├── VolunteerDutyRoster.tsx       # Live shift claiming & capacity management
        ├── VolunteerHoursLogger.tsx      # Real-time check-in/out station & duty ledger
        ├── VolunteerCertificateView.tsx  # Accredited printable Seva certificate
        └── VolunteerRegistrationModal.tsx# Onboarding modal syncing to backend
```

## Running the Volunteer Portal
```bash
cd volunteers
npm install
npm run dev
```

The portal runs as a standalone application or can be served as a micro-frontend alongside the main Seva Sphoorthi ecosystem.
