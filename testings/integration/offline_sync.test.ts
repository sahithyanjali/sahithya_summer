/**
 * Integration Tests: Offline-First Queue, Idempotency & Reconciliation Sync
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert } from "../mocks/testFixtures";

export interface QueuedAction {
  id: string;
  type: "LOG_DUTY_HOURS" | "CLAIM_SHIFT" | "SUBMIT_REGISTRATION";
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

export class OfflineSyncManager {
  private queue: QueuedAction[] = [];
  private processedIds: Set<string> = new Set();

  enqueue(action: Omit<QueuedAction, "timestamp" | "retryCount">): void {
    // Idempotency: Ignore if already queued or processed
    if (this.queue.some(q => q.id === action.id) || this.processedIds.has(action.id)) {
      return;
    }
    this.queue.push({
      ...action,
      timestamp: Date.now(),
      retryCount: 0
    });
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  async flush(
    executor: (action: QueuedAction) => Promise<boolean>
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;
    const remaining: QueuedAction[] = [];

    for (const item of this.queue) {
      try {
        const success = await executor(item);
        if (success) {
          this.processedIds.add(item.id);
          processed++;
        } else {
          item.retryCount++;
          remaining.push(item);
          failed++;
        }
      } catch {
        item.retryCount++;
        remaining.push(item);
        failed++;
      }
    }

    this.queue = remaining;
    return { processed, failed };
  }
}

export function runOfflineSyncIntegrationTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => Promise<void> | void][] = [
    [
      "Offline Queue - Stores actions in FIFO sequence while offline",
      () => {
        const sync = new OfflineSyncManager();
        sync.enqueue({ id: "ACT-01", type: "LOG_DUTY_HOURS", payload: { hours: 4 } });
        sync.enqueue({ id: "ACT-02", type: "CLAIM_SHIFT", payload: { shiftId: "SHIFT-201" } });
        Assert.equals(sync.getPendingCount(), 2);
      }
    ],
    [
      "Idempotency Guard - Drops duplicate actions with identical IDs",
      () => {
        const sync = new OfflineSyncManager();
        sync.enqueue({ id: "ACT-01", type: "LOG_DUTY_HOURS", payload: { hours: 4 } });
        sync.enqueue({ id: "ACT-01", type: "LOG_DUTY_HOURS", payload: { hours: 4 } }); // duplicate
        Assert.equals(sync.getPendingCount(), 1);
      }
    ],
    [
      "Reconciliation Flush - Successfully flushes queue and tracks processed state",
      async () => {
        const sync = new OfflineSyncManager();
        sync.enqueue({ id: "ACT-10", type: "CLAIM_SHIFT", payload: { shiftId: "SHIFT-101" } });
        sync.enqueue({ id: "ACT-11", type: "LOG_DUTY_HOURS", payload: { hours: 5 } });

        const result = await sync.flush(async (action) => {
          return true; // Simulate successful remote write
        });

        Assert.equals(result.processed, 2);
        Assert.equals(result.failed, 0);
        Assert.equals(sync.getPendingCount(), 0);

        // Re-adding processed ID should be ignored
        sync.enqueue({ id: "ACT-10", type: "CLAIM_SHIFT", payload: { shiftId: "SHIFT-101" } });
        Assert.equals(sync.getPendingCount(), 0);
      }
    ]
  ];

  for (const [name, testFn] of testCases) {
    try {
      const p = testFn();
      if (p instanceof Promise) {
        // Run sync if needed or wait
        p.catch(err => {
          failed++;
          errors.push(`[${name}] ${err?.message || err}`);
        });
      }
      passed++;
    } catch (err: any) {
      failed++;
      errors.push(`[${name}] ${err?.message || err}`);
    }
  }

  return { passed, failed, errors };
}
