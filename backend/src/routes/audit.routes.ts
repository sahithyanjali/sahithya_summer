import { Router } from 'express';
import { mockAuditLedger } from '../db/mockDb.js';

export const auditRouter = Router();

// GET entire cryptographic audit trail
auditRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: mockAuditLedger.length,
    blockchainLedger: mockAuditLedger
  });
});

// GET verify cryptographic block hash
auditRouter.get('/verify/:hash', (req, res) => {
  const block = mockAuditLedger.find(b => b.blockHash === req.params.hash);
  if (!block) {
    return res.status(404).json({ success: false, verified: false, error: 'Hash not found in ledger' });
  }

  res.json({
    success: true,
    verified: true,
    block
  });
});
