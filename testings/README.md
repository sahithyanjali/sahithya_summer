# Sphoorthi Seva Trust — Automated Testing & QA Suite (`testings/`)

Comprehensive Automated Quality Assurance (QA), Unit, Integration, End-to-End (E2E), and 10,000-User Scale Load Testing Suite for **Sphoorthi Seva Trust (Reg: 402/2021)**.

---

## 1. Directory Structure

```text
testings/
├── package.json                          # Testing scripts and metadata
├── tsconfig.json                         # TypeScript compiler setup for tests
├── README.md                             # Complete testing suite documentation
├── runner.ts                             # Master test execution engine & CLI reporter
├── mocks/
│   └── testFixtures.ts                   # Realistic test datasets & assertion helpers
├── unit/
│   ├── validators.test.ts                # Phone (+91 E.164), PAN, Pincode & Blood Group tests
│   ├── volunteer_service.test.ts         # Clearance levels, badge numbers & QR hash tests
│   ├── matching_engine.test.ts           # Deterministic matching algorithm & scoring tests
│   └── donation_80g.test.ts              # Section 80G tax deductions & ledger checksums
├── integration/
│   ├── api_contracts.test.ts             # Cloud Run health probes & REST API contracts
│   ├── auth_rbac.test.ts                 # Role-Based Access Control security matrix
│   └── offline_sync.test.ts              # Offline FIFO action queue & idempotency tests
├── e2e/
│   ├── onboarding_journey.test.ts        # Full volunteer onboarding & digital badge issuance
│   └── shift_roster_flow.test.ts         # Shift claiming, field check-in & duty ledger log
└── load/
    └── scale_10k_benchmark.test.ts       # 10,000 synthetic concurrent user load benchmark
```

---

## 2. Test Execution Commands

From the workspace root or inside `testings/`:

```bash
# Run the entire test suite (Unit + Integration + E2E + 10k Benchmark)
npx tsx testings/runner.ts

# Or using npm inside the testings directory
cd testings
npm test
```

---

## 3. Test Coverage Matrix

### 3.1. Unit Testing Tier
- **Input Validators (`unit/validators.test.ts`)**:
  - Normalizes Indian standard numbers into `+91XXXXXXXXXX` E.164 format.
  - Rejects short, alphabetic, or non-Indian phone strings.
  - Verifies 10-character PAN card syntax (`[A-Z]{5}[0-9]{4}[A-Z]`).
  - Verifies 6-digit Indian postal pincodes.
  - Validates all 8 clinical blood group denominations (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
  - Enforces minimum INR 100 threshold for Section 80G tax exemption certificates.

- **Volunteer Service (`unit/volunteer_service.test.ts`)**:
  - Validates promotion criteria: Level 1 (General Seva), Level 2 (25+ hours), Level 3 (100+ hours with First Aid certification).
  - Formats unique volunteer badge serials (`SST-{CITY}-{SEQUENCE}`).
  - Generates tamper-evident cryptographic QR verification signatures (`SHA256`).
  - Accurately tracks accumulated duty hours and prevents negative numbers.

- **Matching Engine (`unit/matching_engine.test.ts`)**:
  - Deterministic skill scoring: Skill match ratio (50%), geographic city proximity (30%), verification status (20%).
  - Enforces strict clearance limits (volunteers cannot claim missions requiring higher clearance).
  - Enforces shift capacity limits (blocks over-subscription when filled).

- **80G Tax Exemption & Financial Ledger (`unit/donation_80g.test.ts`)**:
  - 50% rebate calculations under Indian Income Tax Act Section 80G.
  - 5-digit zero-padded receipt numbering (`SST-80G-{YEAR}-{SERIAL}`).
  - Cryptographic block chaining checksums detecting tampering attempts.

### 3.2. Integration Testing Tier
- **API Contracts (`integration/api_contracts.test.ts`)**:
  - Verifies Cloud Run container liveness probe (`GET /health`) and REST health probe (`GET /api/health`).
  - Validates schema and types for opportunities (`/api/v1/opportunities`) and donations (`/api/v1/donations`).
  - Validates error codes for invalid chat payloads.

- **RBAC Security Policies (`integration/auth_rbac.test.ts`)**:
  - Validates access barriers across Super Admin, Camp Coordinator, Volunteer, Donor, and Anonymous roles.
  - Restricts 80G trust ledger exports to Super Admin.
  - Restricts duty verification to Camp Coordinators and Super Admins.

- **Offline Sync & Idempotency (`integration/offline_sync.test.ts`)**:
  - Queues volunteer check-ins and shift claims when field internet is down.
  - Deduplicates identical action IDs to prevent double-claiming or multiple hour logs.
  - Flushes actions to remote endpoints upon network restoration.

### 3.3. End-to-End (E2E) Testing Tier
- **Volunteer Onboarding Pipeline (`e2e/onboarding_journey.test.ts`)**:
  - Validates end-to-end user journey: Registration -> Validation -> Level 1 clearance assignment -> QR Pass generation.
  - Rejects incomplete submissions or invalid emergency contact data.

- **Duty Shift Roster Flow (`e2e/shift_roster_flow.test.ts`)**:
  - Validates entire duty shift cycle: Slot claim -> Capacity increment -> Check-in -> Check-out -> Duty hours verified in ledger -> Slot release.

### 3.4. 10,000-User Scale Load Testing Tier
- **Load Benchmark (`load/scale_10k_benchmark.test.ts`)**:
  - Runs 10,000 synthetic concurrent matching and scoring operations.
  - Benchmarks P50, P95, and P99 latency against the official SLAs specified in `TESTING.md`.
  - **SLA Benchmark Target**:
    - P95 Latency: `< 120 ms`
    - P99 Latency: `< 150 ms`
    - Error Rate: `< 0.05%`
    - Throughput: `> 1,000 ops/sec`
