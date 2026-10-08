# TESTING.md — Quality Assurance, Test Automation & 10,000-User Load Testing

## 1. Quality Assurance Strategy

To ensure high reliability across Android, iOS, and the Web Admin Portal, the project enforces a multi-tier testing pyramid:

```
                  ┌─────────────────┐
                  │    E2E Tests    │  (10%)
                  │ (Live Simulator)│
                  ├─────────────────┤
                  │Integration Tests│  (30%)
                  │  (APIs & Flows) │
                  ├─────────────────┤
                  │   Unit Tests    │  (60%)
                  │ (Services/Logic)│
                  └─────────────────┘
```

---

## 2. Automated Test Categories

### 2.1. Unit Tests
- **Business Logic & Scoring**: Validates the deterministic matching algorithm with weighted edge cases (exact skill matches, partial availability, zero matches).
- **Formatters & Validators**: Phone number E.164 normalization, date-time timezone offsets, and Pincode validations.
- **State Management**: Verifies Bloc/Provider states during transitions (Loading -> Success -> Error).

### 2.2. Flutter Widget Tests (`mobile/test/`)
- **Onboarding Flow**: Verifies step-by-step form progression and validation errors on missing fields.
- **Opportunity Card**: Verifies badge display, status styling, and slot remaining counters.
- **Roster & Schedule**: Verifies list rendering and pull-to-refresh interactions.

### 2.3. Integration & API Tests
- **Endpoint Contracts**: Validates `GET /api/v1/opportunities`, `POST /api/v1/opportunities/:id/apply`, and health probe endpoints.
- **Authorization Guard**: Ensures unauthenticated requests return `401 Unauthorized` and volunteers cannot access admin endpoints (`403 Forbidden`).

---

## 3. 10,000-User Scale & Load Testing Plan

To guarantee system stability at the target 10,000 registered user scale, the following benchmarks must be met under synthetic load:

| Metric | Target SLA | Failure Threshold |
| :--- | :---: | :---: |
| **P95 Latency (Opportunity Feed)** | < 120 ms | > 350 ms |
| **P99 Latency (Cached Reads)** | < 50 ms | > 150 ms |
| **Concurrent Active Users** | 1,500 simultaneous | Error rate > 0.5% |
| **Application Submission Throughput** | 250 writes/sec | Connection queue timeouts |
| **Error Rate (HTTP 5xx)** | < 0.05% | > 0.2% |

### Executing Synthetic Load Tests
The test runner executes via `scripts/test-runner.js` or via the interactive **Build Telemetry & Scalability Modal** in the development workspace:
```bash
# Execute command-line integration and load test runner
node scripts/test-runner.js
```

---

## 4. Test Matrix & Regression Checklist

- [ ] **Onboarding & Verification**:
  - [ ] OTP invalid format rejection.
  - [ ] Duplicate phone number handling.
  - [ ] Identity document upload size limit (< 5 MB).
  - [ ] Terms and conditions cryptographic signature verification.
- [ ] **Opportunity Management**:
  - [ ] Draft opportunity cannot be viewed by standard volunteers.
  - [ ] Capacity limit prevents over-subscription when slots reach 0.
  - [ ] Application submission fires asynchronous FCM trigger.
- [ ] **Data Security & Authorization**:
  - [ ] Volunteer token cannot mutate `identityVerified` status directly.
  - [ ] Firestore rules reject unindexed compound query execution.
