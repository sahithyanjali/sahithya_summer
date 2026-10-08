# ARCHITECTURE.md — System Architecture, Decoupled Topology & Scaling Strategy

## 1. System Topology & Decoupled Separation

**Admin is NOT inside the normal volunteer mobile UI.** The system enforces a strict physical and architectural decoupling between the volunteer client and the coordinator operations desk:

```
                Backend
                   │
          ┌────────┴────────┐
          │                 │
     Flutter App       Admin Web App
          │                 │
      Volunteer           Admin
```

### Why this separation is mandatory:
- **Cleanliness & Simplicity**: The Volunteer Flutter app remains ultra-light, distraction-free, and focused solely on the volunteer user journey without carrying bulky administrative tables, review forms, or approval controllers.
- **Security Hardening**: Prevents accidental leakage of coordinator credentials, unapproved volunteer identity documents, or privileged endpoints in mobile client bundles.
- **Tailored Experience**: Volunteers get a native, touch-first mobile experience on iOS/Android; Coordinators get a dense, desktop-first web workstation with keyboard shortcuts, filtering tables, and multi-record actions.

---

## 2. Production MVP Scope (Strictly Scoped)

To avoid premature bloat and unnecessary features, the initial production MVP is locked strictly around the core operational loops:

### Volunteer Workflow Loop
```
LOGIN
  ↓
PROFILE
  ↓
SKILLS + AVAILABILITY
  ↓
VERIFICATION
  ↓
OPPORTUNITY FEED
  ↓
OPPORTUNITY DETAILS
  ↓
APPLY
  ↓
MATCH
  ↓
SCHEDULE
  ↓
NOTIFICATION
  ↓
COMPLETION
```

### Admin Workflow Loop
```
ADMIN LOGIN
  ↓
DASHBOARD
  ↓
VOLUNTEERS
  ↓
VERIFY
  ↓
OPPORTUNITIES
  ↓
APPROVE
  ↓
ASSIGN
  ↓
SCHEDULE
  ↓
REPORT
```

*Note on AI Scope*: AI is strictly confined to the backend as an explainable recommendation utility (generating match rationale summaries and profile summaries). It never replaces deterministic business logic, quota enforcement, or coordinator approvals.

---

## 3. Prudent 3-Stage Scaling Strategy

Scale should be added incrementally as actual load dictates—never introducing complex infrastructure prematurely.

```
Stage 1: 0–1,000 Users
└── Firebase + Flutter is more than enough.
    • Firebase Authentication (Phone OTP)
    • Cloud Firestore with offline cache
    • Firebase Storage (Encrypted ID uploads)
    • Direct REST / Cloud Functions for backend logic

Stage 2: 1,000–10,000 Users
└── Add targeted optimization layers:
    • Cursor-based query pagination (`startAfterDocument`)
    • Compound & single-field indexes across all query filters
    • In-memory client caching & Firestore query cache
    • Optimized read-denormalization on card summaries (eliminates N+1 reads)
    • Cloud Functions with atomic transactions (`runTransaction`) for quota reservations
    • Performance monitoring & crash reporting
    • IP & UID rate limiting on auth and apply endpoints
    • Asynchronous background jobs for batch notification fan-out

Stage 3: 10,000+ Users (ONLY if actual traffic demands it)
└── Modernize backend services on demand:
    Firestore
        ↓
    Cloud Run
        ↓
    PostgreSQL / specialized search (e.g. Algolia/Typesense)
        ↓
    Redis / cache
        ↓
    Task Queue (Cloud Tasks / PubSub)

    *Rule: Do not introduce these technologies merely because they sound scalable.*
```

---

## 4. 20-Step Development Sequence

This canonical 20-step sequence governs the iterative engineering of the platform:

```
STEP 01: Repository audit
STEP 02: Architecture
STEP 03: Flutter foundation
STEP 04: Firebase setup
STEP 05: Authentication
STEP 06: Role management
STEP 07: Volunteer onboarding
STEP 08: Opportunity management
STEP 09: Opportunity discovery
STEP 10: Applications
STEP 11: Matching
STEP 12: Scheduling
STEP 13: Notifications
STEP 14: Admin dashboard
STEP 15: AI features
STEP 16: Security hardening
STEP 17: Testing
STEP 18: Performance testing
STEP 19: Production deployment
STEP 20: Play Store release
```

---

## 5. Pega GenAI Blueprint Mapping

The Pega Blueprint establishes two primary workflows: **Volunteer Onboarding** and **Opportunity Management**. These map directly into our native application modules as follows:

### Workflow A: Volunteer Onboarding
| Pega Stage / Case Step | Architecture Component | Implementation Details |
| :--- | :--- | :--- |
| **Registration & Intake** | Mobile Auth Module | Phone OTP via Firebase Auth; provisions `users` record. |
| **Profile & Demographics** | Profile Service | Captures name, address, contact info, DOB in `volunteer_profiles`. |
| **Skills & Capabilities** | Taxonomy & Tags Engine | Hierarchical taxonomy (Education, Healthcare, Relief, Logistics, IT). |
| **Availability Matrix** | Scheduling Engine | Weekly recurring blocks + ad-hoc availability. |
| **Identity Verification** | Secure Storage Service | Encrypted ID document upload (Aadhaar/Passport/Govt ID). |
| **Background Check** | Coordinator Workflow | Status tracking (`PENDING`, `IN_REVIEW`, `VERIFIED`, `FLAGGED`). |
| **Terms & Conduct** | Legal Audit Ledger | Cryptographic SHA-256 signature and timestamp recording. |
| **Onboarding Approval** | Admin Web Portal | Coordinator approval queue before volunteer is unlocked for assignments. |

### Workflow B: Opportunity Management
| Pega Stage / Case Step | Architecture Component | Implementation Details |
| :--- | :--- | :--- |
| **Opportunity Creation** | Admin Web App | Define title, category, required skills, impact metrics, capacity. |
| **Opportunity Approval** | Multi-tier Review | Draft -> Internal Review -> Supervisor Sign-off -> Published. |
| **Discovery & Search** | Indexed Feed Service | Compound Firestore queries, geo-filtered and category-filtered. |
| **Application & Matching** | Hybrid Matching Engine | Deterministic weighted scoring + AI match explanation. |
| **Roster & Scheduling** | Assignment Service | Atomic transaction slot claiming with concurrency checks. |
| **Notifications** | FCM Dispatch Queue | Real-time push for schedule shifts, reminders, and confirmations. |
| **Engagement & Hours** | Ledger Service | Check-in QR verification, logged volunteer hours, digital certificates. |
| **Reporting & Analytics** | Metrics Engine | Aggregates impact hours, volunteer retention, and unfilled slots. |

---

## 3. Scale Engineering for 10,000 Registered Users

To comfortably serve 10,000 users with zero downtime, optimal latency (<50ms for cached reads), and minimal cloud costs, the system enforces the following constraints:

### 3.1. Read vs. Write Traffic Profiling
- **Read Heavy (85%)**: Opportunity browsing, feed queries, profile views.
- **Write Moderate (15%)**: Opportunity applications, schedule sign-ups, check-in logs.

### 3.2. Firestore Cost & Performance Safeguards
1. **No Unbounded Queries**: Every list query enforces strict limit pagination (20 items per page) with cursor-based pagination (`startAfter`).
2. **Denormalization of Read-Heavy Summaries**: Opportunity card previews store author name and volunteer counts directly to avoid N+1 queries.
3. **No Heavy Document Nesting**: Complex sub-entities (e.g., assignments, audit logs) reside in isolated root collections or subcollections rather than sprawling nested arrays.
4. **Client-Side Persistence**: Offline cache enabled in Flutter via `PersistenceSettings(cacheSizeBytes: 104857600)` (100 MB local cache).

### 3.3. AI Layer Isolation
- The mobile client **never** calls the LLM directly.
- The LLM never writes directly to the database.
- Matching logic uses a fast deterministic scoring formula:
  $$\text{Score} = (0.40 \times S) + (0.20 \times A) + (0.15 \times L) + (0.10 \times E) + (0.10 \times P) + (0.05 \times H)$$
- The AI layer is invoked on-demand to generate personalized volunteer summaries and contextual match rationales.

---

## 4. Separation of Concerns: Mobile vs. Admin

```
                             ┌───────────────────┐
                             │  Identity & RBAC  │
                             └─────────┬─────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌─────────────────────┐                       ┌─────────────────────┐
     │  Flutter Native App │                       │   Web Admin Portal  │
     │   (Android + iOS)   │                       │    (Next/React)     │
     ├─────────────────────┤                       ├─────────────────────┤
     │ • Volunteer Auth    │                       │ • User Management   │
     │ • Profile & Skills  │                       │ • Background Audits │
     │ • Opportunity Feed  │                       │ • Opportunity Mgmt  │
     │ • Slot Scheduling   │                       │ • Slot Allocations  │
     │ • Push Alerts       │                       │ • Impact Analytics  │
     │ • Digital Badge     │                       │ • Broadcast Center  │
     └─────────────────────┘                       └─────────────────────┘
```

---

## 5. Controlled Phased Implementation Roadmap (Phases 1–20)

1. **Phase 1: Foundation** — Flutter template, clean architecture, responsive theme, router.
2. **Phase 2: Authentication & RBAC** — Phone OTP, session tokens, user role claims.
3. **Phase 3: Volunteer Profile** — Demographic records, contact verification, emergency contacts.
4. **Phase 4: Skills & Availability** — Tag matrix, recurring scheduling, blackout calendar.
5. **Phase 5: Identity & Verification** — Encrypted document vault, background check audit pipeline.
6. **Phase 6: Terms & Governance** — Conduct agreements, cryptographic consent ledger.
7. **Phase 7: Opportunity Creation** — Opportunity builder, criteria definitions, capacity limits.
8. **Phase 8: Opportunity Review & Approval** — Multi-stage administrative sign-off workflow.
9. **Phase 9: Opportunity Discovery & Feed** — Compound-indexed search, geo-proximity filtering.
10. **Phase 10: Applications & Express Interest** — Application submissions, status tracking.
11. **Phase 11: Hybrid Matching Engine** — Deterministic scoring + AI recommendation summaries.
12. **Phase 12: Scheduling & Roster Management** — Atomic slot assignment, waitlists, calendar sync.
13. **Phase 13: Push Notifications (FCM)** — Asynchronous event-triggered alerts & reminders.
14. **Phase 14: Check-in & Engagement Hours** — QR verification, attendance logs, service hours.
15. **Phase 15: Admin Dashboard** — Verification queues, roster master, analytics reporting.
16. **Phase 16: Security Hardening** — Firestore security rules, rate limiters, token expiration.
17. **Phase 17: Comprehensive Testing** — Unit tests, widget tests, API integration suites.
18. **Phase 18: Performance & Load Testing** — 10,000 user simulation, latency benchmark verification.
19. **Phase 19: CI/CD & Build Telemetry** — Automated builds, Fastlane scripts, code signing.
20. **Phase 20: Production Deployment & Store Release** — Play Store AAB & iOS TestFlight distribution.
