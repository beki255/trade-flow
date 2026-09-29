export interface VerificationUser {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string;
  role: string;
  tin: string | null;
  tradeLicenseNo: string | null;
  tradeLicenseDoc?: string | null;
  insuranceDoc?: string | null;
  roadworthinessDoc?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  verificationNotes: string | null;
  flaggedForSuspension?: boolean;
  performanceReviewRequired?: boolean;
  duplicateAccountDetected?: boolean;
  createdAt: string;
  vehicles?: any[];
  driverProfile?: {
    id: string;
    driverLicenseNo: string;
    licenseClass: string;
    experienceYears: number;
    assignedVehicle?: {
      id?: string;
      plateNumber?: string;
      vehicleType?: string;
    } | null;
  } | null;
}

export interface DocumentPreviewData {
  title: string;
  docType: string;
  docNumber: string;
  issuer: string;
  fileName: string;
  fileUrl?: string;
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

export interface ServiceStatus {
  name: string;
  category: 'DATABASE' | 'CACHE' | 'SOCKET' | 'ENGINE' | 'GATEWAY' | 'GOV_LINK' | string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  uptimePct: number;
  details: string;
  iconName: string;
}

export interface SystemHealthData {
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  overallUptimePct: number;
  dbLatencyMs: number;
  apiP95LatencyMs: number;
  activeSockets: number;
  activeUsers: number;
  activeShipments: number;
  openLoads: number;
  totalBids: number;
  systemMemory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    usagePercent: number;
  };
  serverUptimeSeconds: number;
  serverUptimeFormatted: string;
  databaseConnections: {
    active: number;
    idle: number;
    max: number;
  };
  slaCompliance: {
    matchingEngineSlaTargetMs: number;
    matchingEngineP95Ms: number;
    trackingUpdateLatencySeconds: number;
    uptimeTargetPct: number;
  };
  services: ServiceStatus[];
  timestamp: string;
}

export interface FraudAlertItem {
  id: string;
  type: 'DUPLICATE_TIN' | 'DUPLICATE_LICENSE' | 'SUSPICIOUS_BID_DEVIATION' | 'CUSTOMS_WEIGHT_MISMATCH' | 'GEOFENCE_ROUTE_BREACH' | 'REPEATED_DISPUTES';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  detectedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'SUSPENDED';
  riskScore: number;
  targetUser?: {
    id: string;
    fullName: string;
    companyName: string | null;
    email: string;
    role: string;
    tin?: string | null;
    tradeLicenseNo?: string | null;
    verificationStatus: string;
  } | null;
  relatedEntityId?: string;
  relatedEntityType?: 'BID' | 'LOAD' | 'CUSTOMS_DOC' | 'USER' | 'SHIPMENT';
  deviationDetails?: {
    field: string;
    expected: string | number;
    actual: string | number;
    differencePct?: number;
  };
  adminNotes?: string;
}

export interface FraudStats {
  totalAlerts: number;
  criticalAlerts: number;
  investigatingCases: number;
  resolvedCases: number;
  suspendedAccounts: number;
  preventedExposureEtb: number;
}

