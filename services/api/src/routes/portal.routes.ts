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
  createBid,
  getBids,
  respondToBid,
  dispatchShipment,
  getDriverActiveTrip,
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

// Bidding & RFQ Management
router.get('/bids', getBids);
router.post('/bids', createBid);
router.post('/bids/respond', respondToBid);

// Fleet Dispatch & Driver Telematics
router.post('/dispatch', dispatchShipment);
router.get('/driver/active-trip', getDriverActiveTrip);

export default router;
