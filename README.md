# Seva Sphoorthi Volunteer Portal

[![Architecture](https://img.shields.io/badge/Architecture-Pega%20GenAI%20Blueprint-orange.svg)](#architecture)
[![Target Scale](https://img.shields.io/badge/Scale-10%2C000%20Users-blue.svg)](#scale-design)
[![Platforms](https://img.shields.io/badge/Platforms-Flutter%20%7C%20Web%20Admin-green.svg)](#platforms)

A production-ready volunteer management platform built to scale to **10,000+ registered volunteers and coordinators**. Designed in accordance with the **Pega GenAI Blueprint for the Volunteer Portal**, supporting end-to-end **Volunteer Onboarding** and **Opportunity Management**.

---

## 🌟 Key Workflows

### 1. Volunteer Onboarding Workflow
- **Registration & Authentication**: Mobile phone OTP & Email magic link authentication.
- **Volunteer Profile**: Demographics, emergency contacts, language proficiencies.
- **Skills & Availability**: Granular capability tagging and recurring availability matrix.
- **Identity & Background Checks**: Document upload (Aadhaar/Govt ID), criminal background verification status, automated reference checks.
- **Terms & Code of Conduct**: Cryptographically hashed timestamp acceptance.
- **Coordinator Approval**: Review queue with administrative sign-off before assignment.

### 2. Opportunity Management Workflow
- **Opportunity Lifecycle**: Draft -> Under Review -> Approved -> Published -> Filled -> Completed.
- **Matching Engine**: Deterministic rule scoring (40% Skills, 20% Availability, 15% Location, 10% Experience, 10% Preferences, 5% Past History) paired with AI natural-language match rationale.
- **Roster & Scheduling**: Capacity-limited volunteer slots, confirmations, waitlists, and attendance logging.
- **Impact & Engagement**: Service hours tracking, digital certificates, and volunteer impact reporting.

---

## 🏗️ System Components

1. **Native Mobile App (`mobile/`)**:
   - Flutter for Android & iOS.
   - Clean Architecture + Feature-First structure.
   - Offline-capable cache with optimistic local updates.
2. **Backend API Layer (`backend/` / `server.ts`)**:
   - Express on Cloud Run / Cloud Functions.
   - Centralized RBAC enforcement and Firebase Admin integration.
   - Push notification dispatch via Firebase Cloud Messaging (FCM).
3. **Web Admin Dashboard (`admin/` / `src/components/AdminDashboard.tsx`)**:
   - High-throughput desktop workspace for coordinators and super-admins.
   - Background verification approvals, schedule master-views, and real-time operational analytics.

---

## 🚀 Quick Start

### Running the Full Development Environment
```bash
# Clone and install dependencies
git clone <repo-url>
npm install

# Start development server with live Phone Simulator & Admin Dashboard
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive development simulator.

### Running Test Suites
```bash
# Run backend & integration test runner
npm test
# Or open the in-app Test Runner Modal for full visual test execution
```

---

## 📚 Documentation Index
- [CLAUDE.md](./CLAUDE.md) — Agent operating rules and architectural constraints.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Detailed architecture, 10k-user scaling strategy, and Pega Blueprint mappings.
- [API_SPEC.md](./API_SPEC.md) — Complete REST API contract and endpoint specifications.
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Cloud Firestore entity schemas, subcollections, and composite indexes.
- [SECURITY.md](./SECURITY.md) — Role-based access control (RBAC), Firestore security rules, and data handling policies.
- [TESTING.md](./TESTING.md) — Automated testing matrix, load test specifications, and CI/CD criteria.
