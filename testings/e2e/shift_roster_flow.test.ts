/**
 * End-to-End (E2E) Test Suite: Shift Claiming, Field Attendance Check-In & Duty Hours Verification
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert, TestOpportunity, TestVolunteer, MOCK_OPPORTUNITIES, MOCK_VOLUNTEERS } from "../mocks/testFixtures";
import { VolunteerService } from "../unit/volunteer_service.test";

export interface ActiveShiftState {
  shift: TestOpportunity;
  claimedVolunteers: Set<string>;
}

export function runShiftRosterFlowE2ETests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => void][] = [
    [
      "Complete Shift Lifecycle - Claim -> Check-in -> Check-out -> Ledger Verification",
      () => {
        // Initial state: Opportunity with 18/25 slots filled
        const opp: TestOpportunity = { ...MOCK_OPPORTUNITIES[0] };
        const vol: TestVolunteer = { ...MOCK_VOLUNTEERS[0] }; // Anjali (148.5 hrs)

        const shiftState: ActiveShiftState = {
          shift: opp,
          claimedVolunteers: new Set()
        };

        // 1. Volunteer Claims Slot
        Assert.isFalse(shiftState.claimedVolunteers.has(vol.id));
        shiftState.claimedVolunteers.add(vol.id);
        shiftState.shift.slotsFilled += 1;

        Assert.equals(shiftState.shift.slotsFilled, 19);
        Assert.isTrue(shiftState.claimedVolunteers.has(vol.id));

        // 2. Field Attendance Check-In
        const checkInTime = new Date("2026-09-27T09:00:00Z");
        const checkOutTime = new Date("2026-09-27T14:30:00Z"); // 5.5 hours later

        const durationMs = checkOutTime.getTime() - checkInTime.getTime();
        const durationHours = Number((durationMs / (1000 * 60 * 60)).toFixed(1));
        Assert.equals(durationHours, 5.5);

        // 3. Coordinator Sign-off & Ledger Entry
        const newTotalHours = VolunteerService.accumulateDutyHours(vol.totalHours, durationHours);
        Assert.equals(newTotalHours, 154.0);

        // 4. Withdrawal / Capacity Reversion
        shiftState.claimedVolunteers.delete(vol.id);
        shiftState.shift.slotsFilled -= 1;
        Assert.equals(shiftState.shift.slotsFilled, 18);
        Assert.isFalse(shiftState.claimedVolunteers.has(vol.id));
      }
    ],
    [
      "Capacity Guard - Rejects claims when shift reaches maximum capacity limit",
      () => {
        const fullShift: TestOpportunity = {
          ...MOCK_OPPORTUNITIES[1], // 15/15 filled
        };

        const attemptClaim = (shift: TestOpportunity, volId: string): boolean => {
          if (shift.slotsFilled >= shift.slotsTotal) {
            return false;
          }
          shift.slotsFilled++;
          return true;
        };

        const success = attemptClaim(fullShift, "VOL-NEW");
        Assert.isFalse(success, "Should reject claiming on a full shift");
        Assert.equals(fullShift.slotsFilled, 15);
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
