import { Router } from 'express';
import {
  calculateSpotRate,
  checkContractDivergence,
  getPricingAuditLogs,
  getContracts,
  lockContractRate,
  approveContractRate,
  submitContractRenegotiation,
  deleteContract,
  clearContracts,
} from '../controllers/pricing.controller';

const router = Router();

// 1. Calculate dynamic spot rate with itemized breakdown (4.4.1)
router.post('/spot-rate', calculateSpotRate);

// 2. Contract rate management & renegotiation review workflow (4.4.2)
router.get('/contracts', getContracts);
router.post('/contracts/lock', lockContractRate);
router.post('/contracts/:id/approve', approveContractRate);
router.post('/contracts/:id/renegotiate', submitContractRenegotiation);
router.delete('/contracts/:id', deleteContract);
router.delete('/contracts', clearContracts);
router.post('/contract-rate/check', checkContractDivergence);

// 3. Get pricing audit trail (4.4.3)
router.get('/audit-logs', getPricingAuditLogs);

export default router;

