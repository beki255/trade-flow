export interface VerificationUser {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string;
  role: string;
  tin: string | null;
  tradeLicenseNo: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  verificationNotes: string | null;
  createdAt: string;
  vehicles?: any[];
}

export interface DocumentPreviewData {
  title: string;
  docType: string;
  docNumber: string;
  issuer: string;
  fileName: string;
  status: string;
  issuedDate: string;
  ownerName: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  targetName: string;
  previousStatus?: string;
  newStatus?: string;
  performedByAdminId: string;
  notes: string;
}

export interface AdminStats {
  pendingVerifications: number;
  verifiedUsers: number;
  systemHealth: string;
  fraudAlerts: number;
}

export interface DisputeTicketItem {
  id: string;
  paymentId: string;
  shipmentId: string;
  ticketNumber: string;
  loadCode: string;
  title: string;
  cargoType: string;
  weightTons: number;
  route: string;
  grossAmountEtb: number;
  platformCommissionEtb: number;
  netTransporterPayoutEtb: number;
  claimedAmountEtb: number;
  status: 'PENDING' | 'HELD_IN_ESCROW' | 'CONFIRMED' | 'DISPUTED' | 'SETTLED' | 'REFUNDED';
  disputeReason: string;
  disputeNotes: string | null;
  shipperName: string;
  shipperCompany: string;
  shipperPhone: string;
  shipperTin: string;
  transporterName: string;
  transporterPhone: string;
  driverName: string;
  truckPlate: string;
  filedAt: string;
  settledAt: string | null;
}

export interface DisputeStats {
  totalDisputes: number;
  openCases: number;
  resolvedCases: number;
  refundedCases: number;
  totalFrozenAmountEtb: number;
  mediationSuccessRatePct: number;
  averageResolutionHours: number;
}
