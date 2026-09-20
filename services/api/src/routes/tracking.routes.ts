import { Router } from 'express';
import {
  ingestTelemetry,
  getLiveTracking,
  getCorridorMetadata,
} from '../controllers/tracking.controller';

const router = Router();

// 1. Post real-time / offline batch GPS telemetry updates
router.post('/telemetry', ingestTelemetry);

// 2. Fetch live tracking telemetry, route lines, dynamic ETA, and milestones
router.get('/live', getLiveTracking);
router.get('/live/:shipmentId', getLiveTracking);

// 3. Fetch corridor metadata (waypoints, fuel stations stock, risk zones)
router.get('/corridor', getCorridorMetadata);

export default router;
