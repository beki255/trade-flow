import { Router } from 'express';
import {
  validateCustomsDocuments,
  uploadCustomsDocument,
  submitCustomsDocument,
  resubmitCustomsDocument,
  requestShipmentCustomsReview,
  getCustomsQueue,
  updateShipmentCustomsClearance,
  updateClearanceStatus,
  getClearanceLedger,
  getCustomsDocuments,
} from '../controllers/customs.controller';

const router = Router();

// 1. Automated pre-submission consistency validator (weight cross-check & format compliance)
router.post('/validate', validateCustomsDocuments);

// 2. Upload customs document (Draft or Submitted)
router.post('/documents', uploadCustomsDocument);

// 2.1 Submit draft customs document to official queue
router.post('/documents/:id/submit', submitCustomsDocument);

// 2.2 Resubmit corrected customs document after rejection
router.post('/documents/:id/resubmit', resubmitCustomsDocument);

// 2.3 Request full dossier customs review (all 4 required documents check)
router.post('/shipments/:shipmentId/request-review', requestShipmentCustomsReview);

// 3. Customs Officer Review Queue (Grouped Dossiers)
router.get('/queue', getCustomsQueue);

// 4. Update entire shipment customs clearance status (Approve / Reject / Revision)
router.patch('/shipments/:shipmentId/clearance', updateShipmentCustomsClearance);

// 5. Update single document clearance status
router.patch('/documents/:id/status', updateClearanceStatus);

// 6. Clearance Ledger & Certificates
router.get('/ledger', getClearanceLedger);

// 7. Get all raw customs documents
router.get('/documents', getCustomsDocuments);

export default router;
