import { Router } from 'express';
import {
  getRiskZones,
  createRiskZone,
  updateRiskZone,
  getProactiveGeofenceAlerts,
  calculateAlternateRoutes,
  applyAlternateRoute,
} from '../controllers/security.controller';

const router = Router();

// 1. Risk Zone Database (FR-08.1)
router.get('/risk-zones', getRiskZones);
router.post('/risk-zones', createRiskZone);
router.patch('/risk-zones/:id', updateRiskZone);

// 2. Proactive Geofence Alerts (FR-08.2)
router.get('/geofence-alerts', getProactiveGeofenceAlerts);

// 3. Alternate Routing & Comparison Matrix (FR-08.3)
router.post('/alternate-routes', calculateAlternateRoutes);
router.post('/alternate-routes/apply', applyAlternateRoute);

export default router;
