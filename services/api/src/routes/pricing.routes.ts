import { Router } from 'express';
import {
  calculateSpotRate,
  checkContractDivergence,
  getPricingAuditLogs,
} from '../controllers/pricing.controller';

const router = Router();

// 1. Calculate dynamic spot rate with itemized breakdown
router.post('/spot-rate', calculateSpotRate);

// 2. Check contract rate divergence (> 20%) & renegotiation trigger
router.post('/contract-rate/check', checkContractDivergence);

// 3. Get pricing audit trail
router.get('/audit-logs', getPricingAuditLogs);

export default router;
