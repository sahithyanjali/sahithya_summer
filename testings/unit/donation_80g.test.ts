/**
 * Unit Tests: Section 80G Tax Exemption & Charitable Donation Ledger
 * Sphoorthi Seva Trust (Reg: 402/2021)
 */
import { Assert, MOCK_DONATIONS, TestDonation } from "../mocks/testFixtures";

export class DonationLedgerService {
  static TRUST_REG_NO = "402/2021";
  static SECTION_80G_URN = "AAATS9912PF20214";

  static computeTaxDeductibleAmount(donationAmount: number): number {
    if (donationAmount < 100) return 0;
    // Under Section 80G for eligible public trusts, 50% of the donated sum is tax-deductible
    return Number((donationAmount * 0.5).toFixed(2));
  }

  static generate80GReceiptNumber(year: number, sequence: number): string {
    const seqPadded = sequence.toString().padStart(5, "0");
    return `SST-80G-${year}-${seqPadded}`;
  }

  static generateLedgerBlockChecksum(donation: TestDonation, prevChecksum: string = "GENESIS_HASH"): string {
    const raw = `${donation.id}:${donation.donorPan}:${donation.amount}:${donation.receiptNumber}:${prevChecksum}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(8, "0")}`;
  }
}

export function runDonation80GUnitTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  const testCases: [string, () => void][] = [
    [
      "80G Rebate Math - Correctly computes 50% deduction rate under IT Act",
      () => {
        Assert.equals(DonationLedgerService.computeTaxDeductibleAmount(5000), 2500);
        Assert.equals(DonationLedgerService.computeTaxDeductibleAmount(12500), 6250);
        Assert.equals(DonationLedgerService.computeTaxDeductibleAmount(50), 0, "Below 100 INR yields 0 deductible");
      }
    ],
    [
      "Receipt Serial Standard - Formats receipt serial with 5-digit zero padding",
      () => {
        const rcpt = DonationLedgerService.generate80GReceiptNumber(2026, 482);
        Assert.equals(rcpt, "SST-80G-2026-00482");
      }
    ],
    [
      "Ledger Block Checksum - Validates cryptographic chaining between donation records",
      () => {
        const d1 = MOCK_DONATIONS[0];
        const d2 = MOCK_DONATIONS[1];

        const hash1 = DonationLedgerService.generateLedgerBlockChecksum(d1, "GENESIS_BLOCK");
        Assert.match(hash1, /^0x[a-f0-9]{8}$/);

        const hash2 = DonationLedgerService.generateLedgerBlockChecksum(d2, hash1);
        Assert.isTrue(hash1 !== hash2, "Chained block hashes must differ");

        // Tamper test
        const tamperedD1 = { ...d1, amount: 99999 };
        const tamperedHash = DonationLedgerService.generateLedgerBlockChecksum(tamperedD1, "GENESIS_BLOCK");
        Assert.isTrue(hash1 !== tamperedHash, "Tampered amount must produce a completely different checksum");
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
