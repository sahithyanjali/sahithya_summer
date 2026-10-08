# CLAUDE.md — Agent & Developer Operating Manual

## Project Overview
**Seva Sphoorthi Volunteer Portal** is a production-grade native mobile application (Android & iOS) with an administrative web portal, built to support **~10,000 registered users** with concurrent read/write scalability.

The system is derived from the **Pega GenAI Blueprint for the Volunteer Portal**, orchestrating two primary operational workflows:
1. **Volunteer Onboarding**: Identity verification, background check status, skills inventory, availability scheduling, terms acceptance, matching recommendations, and administrative review/approvals.
2. **Opportunity Management**: Opportunity drafting, criteria definition (skills, location, duration, impact), administrative approvals, volunteer assignment, rosters, attendance/engagement tracking, and reporting.

---

## Technology Stack & Architecture Boundaries

```
                    ┌─────────────────────────┐
                    │       Flutter App       │
                    │      Android + iOS      │
                    │   (Volunteer Focused)   │
                    └────────────┬────────────┘
                                 │ HTTPS / REST
                    ┌────────────▼────────────┐
                    │    Backend API Layer    │
                    │  Cloud Run / Functions  │
                    │      (Node/Express)     │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │  Firebase   │        │    Cloud    │        │  Firebase   │
   │    Auth     │        │  Firestore  │        │   Storage   │
   └─────────────┘        └─────────────┘        └─────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   AI / Matching Layer   │
                    │      Gemini / LLM       │
                    │ (Deterministic Scoring) │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Notifications (FCM/SMS) │
                    └─────────────────────────┘
```

---

## Core Engineering Rules for AI / Developers

1. **Controlled Phasing**: Never generate the entire application in one shot. Follow the phased development plan in `ARCHITECTURE.md`.
2. **Strict Client-Server Boundary**:
   - Never embed Firebase Admin credentials, secret API keys, or LLM keys in the Flutter client.
   - All privileged operations (status changes, approvals, background check updates, batch notifications) must execute through the secure backend API.
3. **Firestore Scale Discipline (10,000 Users)**:
   - Always paginate collection queries (limit 20–50 items).
   - Never perform unbounded `.get()` queries on `users`, `opportunities`, or `applications`.
   - Never put everything inside a single document. Keep `users`, `volunteer_profiles`, `opportunities`, `applications`, `assignments`, `notifications`, and `engagements` in distinct collections.
   - Use server timestamps (`FieldValue.serverTimestamp()`) for all audit and temporal records.
   - Design composite indexes for compound filters (e.g. status + scheduledDate).
4. **Deterministic AI Matching**:
   - Do NOT pass raw database dumps to the LLM to choose volunteers.
   - Calculate deterministic matching scores (Skill 40%, Availability 20%, Location 15%, Experience 10%, Preferences 10%, Past Engagements 5%).
   - The AI layer is solely used to explain match rationale, summarize profiles, and suggest personalized opportunities.
5. **Separate Admin from Volunteer Mobile**:
   - The Flutter mobile app is exclusively for Volunteers and Field Coordinators.
   - Administrative oversight (approvals, background audits, reporting) is hosted on the secure Web Admin Portal.
6. **Error & State Handling**:
   - All network/data operations must provide Loading, Success, Empty, Error, and Offline Fallback states.

---

## Standard Development Commands

### Web & Simulator Workspace
```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Run type check / linter
npm run lint

# Build full distribution (Vite + Server bundle)
npm run build

# Start production server
npm start
```

### Flutter Mobile App (`mobile/`)
```bash
# Get dependencies
flutter pub get

# Run static analysis
flutter analyze

# Run unit and widget tests
flutter test

# Build Android App Bundle (Production)
flutter build appbundle --release

# Build iOS Archive (Production)
flutter build ipa --release
```

---

## File & Directory Structure

```
project/
├── CLAUDE.md               # Developer and Agent instructions (this file)
├── README.md               # High-level documentation and quick start
├── ARCHITECTURE.md         # System architecture, scaling model, and Pega Blueprint mapping
├── API_SPEC.md             # REST API specifications and contracts
├── DATABASE_SCHEMA.md      # Firestore schema, indexes, and entity models
├── SECURITY.md             # Security rules, RBAC, and data privacy policies
├── TESTING.md              # Quality assurance, unit testing, and 10k load testing
│
├── mobile/                 # Flutter native app (Android + iOS)
│   ├── lib/
│   │   ├── core/           # Constants, themes, network clients, routing
│   │   ├── features/       # Feature-driven modules (auth, onboarding, opportunities, etc.)
│   │   └── main.dart
│   └── test/               # Flutter unit & widget test suites
│
├── backend/                # Cloud Run / Express backend service
│   ├── src/
│   │   ├── routes/         # Express API route controllers
│   │   ├── services/       # Firebase, Matching, Notification, AI services
│   │   └── middleware/     # Auth verification, rate limiting, error handling
│   └── server.ts           # Server bootstrap
│
└── admin/                  # Administrative Web Dashboard
    └── src/                # Admin portal modules (approvals, verifications, reports)
```
