import { Router } from 'express';
import {
  getForwarderClients,
  getLtlLoads,
  consolidateLtlLoads,
  getMultimodalTracking,
  getForwarderTenders,
  awardForwarderTender,
  getForwarderCustomsBatch,
  transmitForwarderCustomsBatch,
} from '../controllers/forwarder.controller';

const router = Router();

// 1. Multi-Shipper Client Portfolio & Overview
router.get('/clients', getForwarderClients);

// 2. Less-than-Truckload (LTL) Cargo Queue
router.get('/ltl-loads', getLtlLoads);

// 3. Consolidate LTL Loads into High-Cube Container
router.post('/consolidate', consolidateLtlLoads);

// 4. Multi-Modal Corridor Progress Tracking
router.get('/multimodal', getMultimodalTracking);

// 5. Master Transporter Corridor Tenders
router.get('/tenders', getForwarderTenders);
router.post('/tenders/award', awardForwarderTender);

// 6. Forwarder Customs Batch Pipeline & Single Window Submission
router.get('/customs-batch', getForwarderCustomsBatch);
router.post('/customs-batch/transmit', transmitForwarderCustomsBatch);

export default router;
