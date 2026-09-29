import { Router } from 'express';
import {
  recommendOptimizedRoutes,
  reportDriverIncident,
  getActiveIncidents,
  getPendingRerouteProposals,
  confirmDynamicRerouting,
  updateFuelStationStock,
} from '../controllers/optimization.controller';

const router = Router();

// 1. Route optimization recommendation (distance, time, fuel, risk weighted model)
router.post('/routes', recommendOptimizedRoutes);

// 2. Report driver incident with GPS coordinates & dynamic rerouting trigger
router.post('/incident', reportDriverIncident);

// 3. Get all active corridor incidents & hazard alerts
router.get('/incidents', getActiveIncidents);

// 4. Pending dynamic rerouting proposals
router.get('/reroute/proposals', getPendingRerouteProposals);

// 5. Confirm or decline dynamic rerouting
router.post('/reroute/confirm', confirmDynamicRerouting);

// 6. Update fuel station stockout status (Boundary Condition 6.8)
router.post('/fuel-stock', updateFuelStationStock);

export default router;

