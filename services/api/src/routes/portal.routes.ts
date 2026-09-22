import { Router } from 'express';
import {
  getPortalStats,
  getLoads,
  createLoad,
  deleteLoad,
  getVerifications,
  verifyUser,
  getUserStatus,
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
  deleteBid,
  dispatchShipment,
  getDriverActiveTrip,
  startDriverTrip,
  toggleDriverDrivingState,
  arriveDestinationTrip,
  provisionCustomsOfficer,
} from '../controllers/portal.controller';

const router = Router();

// Portal & Stats routes
router.get('/stats', getPortalStats);
router.get('/loads', getLoads);
router.post('/loads', createLoad);
router.delete('/loads/:id', deleteLoad);

// Verification Queue & Admin Actions
router.get('/verifications', getVerifications);
router.post('/verify-user', verifyUser);
router.get('/user-status', getUserStatus);
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
router.delete('/bids/:id', deleteBid);

// Fleet Dispatch & Driver Telematics
router.post('/dispatch', dispatchShipment);
router.get('/driver/active-trip', getDriverActiveTrip);
router.post('/driver/start-trip', startDriverTrip);
router.post('/driver/toggle-driving', toggleDriverDrivingState);
router.post('/driver/arrive-destination', arriveDestinationTrip);

// Institutional Customs Officer Provisioning (Admin only)
router.post('/provision-customs', provisionCustomsOfficer);

export default router;
