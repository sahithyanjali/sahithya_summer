/**
 * Master Automated Test Runner for Sphoorthi Seva Trust (Reg: 402/2021)
 * Executes:
 * 1. Unit Tests (Validators, Volunteer Service, Matching Engine, 80G Tax Deductions)
 * 2. Integration Tests (API Contracts, Auth RBAC, Offline Sync Reconciliation)
 * 3. End-to-End Tests (Volunteer Onboarding Journey, Duty Shift Roster Flow)
 * 4. Load & Scalability Benchmarks (10,000 Synthetic User Matching SLA)
 */

import { runValidatorUnitTests } from "./unit/validators.test";
import { runVolunteerServiceUnitTests } from "./unit/volunteer_service.test";
import { runMatchingEngineUnitTests } from "./unit/matching_engine.test";
import { runDonation80GUnitTests } from "./unit/donation_80g.test";
import { runApiContractIntegrationTests } from "./integration/api_contracts.test";
import { runAuthRbacIntegrationTests } from "./integration/auth_rbac.test";
import { runOfflineSyncIntegrationTests } from "./integration/offline_sync.test";
import { runOnboardingJourneyE2ETests } from "./e2e/onboarding_journey.test";
import { runShiftRosterFlowE2ETests } from "./e2e/shift_roster_flow.test";
import { runScaleBenchmarkTests, run10kScaleBenchmark } from "./load/scale_10k_benchmark.test";

interface SuiteResult {
  suiteName: string;
  category: "Unit" | "Integration" | "E2E" | "Load";
  passed: number;
  failed: number;
  durationMs: number;
  errors: string[];
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 SPHOORTHI SEVA TRUST (REG: 402/2021) - AUTOMATED QA & INTEGRITY TEST RUNNER");
  console.log("================================================================================\n");

  const suites: SuiteResult[] = [];
  const globalStart = performance.now();

  async function recordSuite(
    name: string,
    category: "Unit" | "Integration" | "E2E" | "Load",
    fn: () => Promise<{ passed: number; failed: number; errors: string[] }> | { passed: number; failed: number; errors: string[] }
  ) {
    const t0 = performance.now();
    try {
      const res = await fn();
      const durationMs = Number((performance.now() - t0).toFixed(1));
      suites.push({
        suiteName: name,
        category,
        passed: res.passed,
        failed: res.failed,
        durationMs,
        errors: res.errors
      });

      const icon = res.failed === 0 ? "✅" : "❌";
      console.log(`${icon} [${category}] ${name}: ${res.passed} passed, ${res.failed} failed (${durationMs}ms)`);
      if (res.errors.length > 0) {
        res.errors.forEach(e => console.log(`    ⚠️  ${e}`));
      }
    } catch (err: any) {
      const durationMs = Number((performance.now() - t0).toFixed(1));
      suites.push({
        suiteName: name,
        category,
        passed: 0,
        failed: 1,
        durationMs,
        errors: [err?.message || String(err)]
      });
      console.log(`❌ [${category}] ${name} CRASHED: ${err?.message || err} (${durationMs}ms)`);
    }
  }

  console.log("📦 1. EXECUTING UNIT TESTS");
  await recordSuite("Input Validators & E.164 Normalizers", "Unit", runValidatorUnitTests);
  await recordSuite("Volunteer Service & Badge Hash Generation", "Unit", runVolunteerServiceUnitTests);
  await recordSuite("Deterministic Matching Engine (Skills, Proximity, Clearance)", "Unit", runMatchingEngineUnitTests);
  await recordSuite("Section 80G Tax Exemption & Ledger Checksums", "Unit", runDonation80GUnitTests);

  console.log("\n🌐 2. EXECUTING INTEGRATION TESTS");
  await recordSuite("Backend API Contracts & Cloud Run Probes", "Integration", runApiContractIntegrationTests);
  await recordSuite("Role-Based Access Control (RBAC) Security Policies", "Integration", runAuthRbacIntegrationTests);
  await recordSuite("Offline-First Action Queue & Sync Reconciliation", "Integration", runOfflineSyncIntegrationTests);

  console.log("\n🔄 3. EXECUTING END-TO-END (E2E) TESTS");
  await recordSuite("Volunteer Onboarding & Digital Pass Pipeline", "E2E", runOnboardingJourneyE2ETests);
  await recordSuite("Shift Claiming, Reporting & Attendance Ledger Flow", "E2E", runShiftRosterFlowE2ETests);

  console.log("\n⚡ 4. EXECUTING 10,000 SYNTHETIC USER LOAD BENCHMARK");
  await recordSuite("10,000 Concurrent User Matching SLA Benchmark", "Load", runScaleBenchmarkTests);

  // Detailed Benchmark Metrics Output
  const benchmark = run10kScaleBenchmark(10000);
  console.log("\n📊 10,000 USER SCALE BENCHMARK TELEMETRY:");
  console.log(`   • Total Operations: ${benchmark.totalOperations.toLocaleString()}`);
  console.log(`   • Total Duration:   ${benchmark.durationMs} ms`);
  console.log(`   • Throughput:       ${benchmark.opsPerSecond.toLocaleString()} ops/second`);
  console.log(`   • P50 Latency:      ${benchmark.p50Ms} ms`);
  console.log(`   • P95 Latency:      ${benchmark.p95Ms} ms (Target: < 120ms SLA)`);
  console.log(`   • P99 Latency:      ${benchmark.p99Ms} ms (Target: < 150ms SLA)`);
  console.log(`   • Error Rate:       ${benchmark.errorRatePercent}% (Target: < 0.05%)`);

  // Final Summary Table
  const totalPassed = suites.reduce((acc, s) => acc + s.passed, 0);
  const totalFailed = suites.reduce((acc, s) => acc + s.failed, 0);
  const totalDuration = Number((performance.now() - globalStart).toFixed(1));

  console.log("\n================================================================================");
  console.log("🏁 TEST EXECUTION SUMMARY");
  console.log("================================================================================");
  console.log(`Suites Evaluated:  ${suites.length}`);
  console.log(`Assertions Passed: ${totalPassed}`);
  console.log(`Assertions Failed: ${totalFailed}`);
  console.log(`Total Elapsed:     ${totalDuration} ms`);

  if (totalFailed > 0) {
    console.log("\n❌ TEST SUITE FAILED WITH DISCREPANCIES");
    process.exit(1);
  } else {
    console.log("\n✨ ALL TESTS PASSED - 100% QUALITY & COMPLIANCE VERIFIED");
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
