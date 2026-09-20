import { Router } from 'express';
import {
  recommendOptimizedRoutes,
  reportDriverIncident,
  getActiveIncidents,
} from '../controllers/optimization.controller';

const router = Router();

// 1. Route optimization recommendation (distance, time, fuel, risk weighted model)
router.post('/routes', recommendOptimizedRoutes);

// 2. Report driver incident with GPS coordinates & dynamic rerouting trigger
router.post('/incident', reportDriverIncident);

// 3. Get all active corridor incidents & hazard alerts
router.get('/incidents', getActiveIncidents);

export default router;
