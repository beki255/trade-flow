import { Router } from 'express';
import {
  getFuelAnalytics,
  getTransporterPerformance,
} from '../controllers/analytics.controller';

const router = Router();

// 1. Fuel consumption analytics & efficiency benchmarking
router.get('/fuel', getFuelAnalytics);
router.get('/fuel/:transporterId', getFuelAnalytics);

// 2. Transporter performance KPIs & corridor benchmarking
router.get('/transporter', getTransporterPerformance);
router.get('/transporter/:transporterId', getTransporterPerformance);

export default router;
