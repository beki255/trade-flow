import { Router } from 'express';
import {
  initiatePayment,
  settlePayment,
  fileDisputeTicket,
  getPaymentLedger,
  getDisputeTickets,
  arbitrateDispute,
  checkPendingConfirmationReminders,
} from '../controllers/payment.controller';

const router = Router();

// 1. Initiate TeleBirr payment with 5.0% commission calculation
router.post('/initiate', initiatePayment);

// 2. Automated settlement to transporter mobile money
router.post('/settle', settlePayment);

// 3. File payment/damage dispute ticket
router.post('/dispute', fileDisputeTicket);

// 4. Get all dispute mediation cases
router.get('/disputes', getDisputeTickets);

// 5. Arbitrate dispute ticket (Admin verdict & escrow execution)
router.post('/disputes/:paymentId/arbitrate', arbitrateDispute);

// 6. Get financial payment ledger
router.get('/ledger', getPaymentLedger);

// 7. Check & dispatch automated 24-hour pending confirmation reminders (Boundary Condition 6.6)
router.get('/pending-reminders', checkPendingConfirmationReminders);

export default router;
