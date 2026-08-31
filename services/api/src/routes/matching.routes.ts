import { Router } from 'express';
import {
  calculateAIMatches,
  postLoadWithBookingOption,
  submitTransporterBid,
} from '../controllers/matching.controller';

const router = Router();

// AI Weighted Utility Matching Engine (4.2.2)
router.post('/find-matches', calculateAIMatches);

// Load Posting with Option A & Option B (4.2.1, 4.2.3)
router.post('/post-load', postLoadWithBookingOption);

// Transporter Bidding (4.2.4)
router.post('/submit-bid', submitTransporterBid);

export default router;
