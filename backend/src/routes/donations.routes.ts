import { Router } from 'express';
import { mockDonations } from '../db/mockDb.js';
import { DonationEntity } from '../models/types.js';

export const donationsRouter = Router();

// GET all donations & summary statistics
donationsRouter.get('/', (req, res) => {
  const totalSum = mockDonations.reduce((acc, d) => acc + d.amount, 0);
  const count = mockDonations.length;
  const averageDonation = count > 0 ? Math.round(totalSum / count) : 0;

  res.json({
    success: true,
    totalSum,
    count,
    averageDonation,
    donations: mockDonations
  });
});

// GET specific 80G receipt data
donationsRouter.get('/receipt/:id', (req, res) => {
  const donation = mockDonations.find(d => d.id === req.params.id || d.receiptNumber === req.params.id);
  if (!donation) {
    return res.status(404).json({ success: false, error: 'Receipt not found' });
  }

  res.json({
    success: true,
    receipt: {
      ...donation,
      trustName: 'Sphoorthi Seva Trust',
      trustRegistrationNumber: '402/2021',
      panNumber: 'AAATS9841K',
      section80GApproval: 'CIT(E)/BLR/80G/2021-22/A/10042',
      financialYear: '2026-2027',
      taxExemptionPercent: 50
    }
  });
});

// POST submit a new donation
donationsRouter.post('/', (req, res) => {
  const { donorName, amount, purpose, pan } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Valid donation amount is required' });
  }

  const idNumber = mockDonations.length + 906;
  const newDonation: DonationEntity = {
    id: `SEVA-2026-${idNumber}`,
    donorName: donorName?.trim() || 'Anonymous Seva Karta',
    amount: Number(amount),
    purpose: purpose || 'General Annadana Seva',
    date: 'Just now',
    panMasked: pan ? `${pan.slice(0, 5)}****${pan.slice(-1)}` : 'PAN Not Provided',
    transactionRef: `UPI-APP-${Date.now().toString().slice(-7)}`,
    receiptNumber: `80G-2026-${idNumber}`,
    status: 'VERIFIED',
    is80GEligible: true,
    blockHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
  };

  mockDonations.unshift(newDonation);

  res.json({
    success: true,
    message: 'Donation recorded successfully with 80G tax certificate',
    donation: newDonation
  });
});
