import { Router } from 'express';
import {
  validateCustomsDocuments,
  uploadCustomsDocument,
  getCustomsQueue,
  updateShipmentCustomsClearance,
  updateClearanceStatus,
  getClearanceLedger,
  getCustomsDocuments,
} from '../controllers/customs.controller';

const router = Router();

// 1. Automated pre-submission consistency validator (weight cross-check)
router.post('/validate', validateCustomsDocuments);

// 2. Upload customs document
router.post('/documents', uploadCustomsDocument);

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
