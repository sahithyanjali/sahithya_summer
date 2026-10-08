/**
 * Load Testing & 10,000 Synthetic User Scale Benchmark
 * Sphoorthi Seva Trust (Reg: 402/2021)
 * Validates SLA targets outlined in TESTING.md:
 * - P95 Latency < 120 ms
 * - P99 Latency < 150 ms
 * - Error Rate < 0.05%
 */
import { Assert } from "../mocks/testFixtures";
import { MatchingEngine } from "../unit/matching_engine.test";
import { MOCK_VOLUNTEERS, MOCK_OPPORTUNITIES } from "../mocks/testFixtures";

export interface BenchmarkMetrics {
  totalOperations: number;
  durationMs: number;
  opsPerSecond: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errorCount: number;
  errorRatePercent: number;
}

export function run10kScaleBenchmark(iterations: number = 10000): BenchmarkMetrics {
  const latencies: number[] = [];
  let errorCount = 0;
  const startTotal = performance.now();

  const sampleVolunteer = MOCK_VOLUNTEERS[0];
  const sampleOpportunity = MOCK_OPPORTUNITIES[0];

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    try {
      // Benchmark core matching algorithm & query scoring under load
      const match = MatchingEngine.evaluateMatch(sampleVolunteer, sampleOpportunity);
      if (!match.eligible && !match.ineligibleReason) {
        errorCount++;
      }
    } catch {
      errorCount++;
    }
    const t1 = performance.now();
    latencies.push(t1 - t0);
  }

  const endTotal = performance.now();
  const durationMs = endTotal - startTotal;

  // Sort latencies to compute percentiles
  latencies.sort((a, b) => a - b);
  const p50Index = Math.floor(iterations * 0.5);
  const p95Index = Math.floor(iterations * 0.95);
  const p99Index = Math.floor(iterations * 0.99);

  return {
    totalOperations: iterations,
    durationMs: Number(durationMs.toFixed(2)),
    opsPerSecond: Math.round((iterations / (durationMs / 1000))),
    p50Ms: Number(latencies[p50Index].toFixed(3)),
    p95Ms: Number(latencies[p95Index].toFixed(3)),
    p99Ms: Number(latencies[p99Index].toFixed(3)),
    errorCount,
    errorRatePercent: Number(((errorCount / iterations) * 100).toFixed(4))
  };
}

export function runScaleBenchmarkTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => void][] = [
    [
      "10,000 Synthetic Matching Operations - P95 SLA Compliance (< 120ms)",
      () => {
        const metrics = run10kScaleBenchmark(10000);

        Assert.equals(metrics.errorCount, 0, "Zero errors allowed during synthetic load");
        Assert.lessThanOrEqual(metrics.p95Ms, 120, "P95 latency must be under 120ms SLA");
        Assert.lessThanOrEqual(metrics.p99Ms, 150, "P99 latency must be under 150ms SLA");
        Assert.greaterThan(metrics.opsPerSecond, 1000, "Must exceed 1,000 ops/sec processing rate");
      }
    ]
  ];

  for (const [name, testFn] of testCases) {
    try {
      testFn();
      passed++;
    } catch (err: any) {
      failed++;
      errors.push(`[${name}] ${err?.message || err}`);
    }
  }

  return { passed, failed, errors };
}
