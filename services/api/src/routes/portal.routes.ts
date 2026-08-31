import { Router } from 'express';
import {
  getPortalStats,
  getLoads,
  createLoad,
  getVerifications,
  verifyUser,
  getAuditLogs,
  submitRating,
  getRatings,
  getVehicles,
  createVehicle,
  getDrivers,
  createDriver,
} from '../controllers/portal.controller';

const router = Router();

// Portal & Stats routes
router.get('/stats', getPortalStats);
router.get('/loads', getLoads);
router.post('/loads', createLoad);

// Verification Queue & Admin Actions
router.get('/verifications', getVerifications);
router.post('/verify-user', verifyUser);
router.get('/audit-logs', getAuditLogs);

// Ratings & Reviews
router.post('/ratings', submitRating);
router.get('/ratings', getRatings);
router.get('/ratings/:userId', getRatings);

// Vehicles & Fleet Management
router.get('/vehicles', getVehicles);
router.post('/vehicles', createVehicle);

// Drivers Management
router.get('/drivers', getDrivers);
router.post('/drivers', createDriver);

export default router;
