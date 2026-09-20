export interface CustomsDocItem {
  id: string;
  docType: string;
  docNumber: string;
  fileName: string;
  fileUrl?: string;
  fileSizeKb: number;
  declaredValueEtb?: number;
  issuingAuthority: string;
  issueDate: string;
  validationPassed: boolean;
  clearanceStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'CLEARED' | 'REJECTED' | 'REVISION_REQUESTED';
  officerNotes?: string;
  reviewedByOfficerId?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

export interface CustomsDossierItem {
  id: string;
  shipmentId: string;
  loadId: string;
  loadCode: string;
  title: string;
  cargoType: string;
  weightTons: number;
  volumeCbm: number;
  origin: string;
  destination: string;
  declaredValueEtb: number;
  shipperName: string;
  shipperCompany: string;
  shipperTin: string;
  shipperPhone: string;
  driverName: string;
  driverPhone: string;
  truckPlate: string;
  customsStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'CLEARED' | 'REJECTED' | 'REVISION_REQUESTED';
  customsClearedAt?: string;
  documents: CustomsDocItem[];
  completenessPct: number;
  recommendation: 'FAST_TRACK_GREEN' | 'MANUAL_INSPECTION_YELLOW' | 'HOLD_RED';
  hasInvoice: boolean;
  hasPackingList: boolean;
  hasBOL: boolean;
  hasOrigin: boolean;
  uploadedAt: string;
}

export interface CustomsStats {
  totalDossiers: number;
  pendingReviews: number;
  greenLineCleared: number;
  revisionsRequested: number;
  inspectionRate: string;
  averageProcessingMins: number;
}

export interface ClearanceLedgerItem {
  id: string;
  certificateNo: string;
  shipmentId: string;
  loadCode: string;
  cargoTitle: string;
  weightTons: number;
  route: string;
  shipperCompany: string;
  shipperTin: string;
  carrierPlate: string;
  driverName: string;
  clearingStation: string;
  clearingOfficer: string;
  digitalSeal: string;
  clearedAt: string;
  documentsCount: number;
}
