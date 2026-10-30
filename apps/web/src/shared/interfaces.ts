import {
  UserRole,
  VerificationStatus,
  VehicleType,
  FuelType,
  LoadStatus,
  CargoType,
  BidStatus,
  ShipmentStatus,
  CustomsDocType,
  CustomsClearanceStatus,
  PaymentMethod,
  PaymentStatus,
  IncidentCategory,
  RiskLevel
} from './enums';

/**
 * 1. User Entity
 */
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  tin?: string;               // Tax ID (የግብር ከፋይ መለያ ቁጥር)
  tradeLicenseNo?: string;    // Trade License (የንግድ ፈቃድ ቁጥር)
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  ratingAvg: number;
  totalRatingsCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 2. Transporter Vehicle Entity
 */
export interface Vehicle {
  id: string;
  transporterId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  capacityTons: number;
  capacityVolumeCbm: number;
  fuelType: FuelType;
  fuelEfficiencyBenchmarkKmL: number;
  insurancePolicyNo?: string;
  insuranceDocUrl?: string;
  roadworthinessCertUrl?: string;
  telematicsDeviceId?: string;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  createdAt: string;
}

/**
 * 3. Driver Profile Entity
 */
export interface Driver {
  id: string;
  userId: string;
  transporterId: string;
  assignedVehicleId?: string;
  driverLicenseNo: string;
  licenseClass: string;
  experienceYears: number;
  safetyScore: number;
  activeShipmentId?: string;
  isOnline: boolean;
  createdAt: string;
}

/**
 * 4. Load Posting Entity (FR-02)
 */
export interface Load {
  id: string;
  shipperId: string;
  title: string;
  cargoType: CargoType;
  cargoDescription: string;
  weightTons: number;
  volumeCbm: number;
  
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryDeadline?: string;
  
  specialHandling?: string[];
  spotEstimatedPriceEtb: number;
  targetBudgetEtb?: number;
  
  status: LoadStatus;
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 5. Transporter Bid Entity (FR-02)
 */
export interface Bid {
  id: string;
  loadId: string;
  transporterId: string;
  transporterName: string;
  transporterRating: number;
  vehicleId: string;
  driverId?: string;
  
  proposedRateEtb: number;
  pickupEstimatedTime: string;
  deliveryEstimatedTime: string;
  validityHours: number;
  proposalNotes?: string;
  
  status: BidStatus;
  createdAt: string;
  expiresAt: string;
}

/**
 * 6. Live Shipment Entity (FR-03)
 */
export interface Shipment {
  id: string;
  loadId: string;
  shipperId: string;
  transporterId: string;
  driverId: string;
  vehicleId: string;
  
  agreedRateEtb: number;
  status: ShipmentStatus;
  customsStatus: CustomsClearanceStatus;
  
  currentLat: number;
  currentLng: number;
  currentSpeedKmh: number;
  currentHeading: number;
  fuelLevelPct: number;
  lastGpsUpdateTimestamp: string;
  
  initialEtaTimestamp: string;
  currentPredictedEta: string;
  etaConfidenceMarginMins: number;
  progressPercentage: number;
  
  departedOriginAt?: string;
  arrivedModjoAt?: string;
  customsClearedAt?: string;
  arrivedDestinationAt?: string;
  
  podSignatureUrl?: string;
  podPhotoUrl?: string;
  podRecipientName?: string;
  podDeliveredAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

/**
 * 7. GPS Tracking Event (FR-03)
 */
export interface TrackingEvent {
  id: string;
  shipmentId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  fuelLevelPct: number;
  timestamp: string;
  source: 'DRIVER_APP' | 'OBD_TELEMATICS' | 'OFFLINE_SYNC';
}

/**
 * 8. Corridor Route Waypoint (FR-05)
 */
export interface RouteWaypoint {
  id: string;
  name: string;
  nameAmharic: string;
  lat: number;
  lng: number;
  sequenceOrder: number;
  isCustomsCheckpoint: boolean;
  isDryPort: boolean;
  isFuelStation: boolean;
  fuelAvailable?: boolean;
  dieselPricePerLiter?: number;
  congestionDelayMinutes?: number;
}

/**
 * 9. Digital Customs Document (FR-06)
 */
export interface CustomsDocument {
  id: string;
  shipmentId: string;
  docType: CustomsDocType;
  docNumber: string;
  fileUrl: string;
  fileName: string;
  fileSizeKb: number;
  declaredValueEtb?: number;
  issuingAuthority?: string;
  issueDate?: string;
  
  validationPassed: boolean;
  validationErrors?: string[];
  
  clearanceStatus: CustomsClearanceStatus;
  officerNotes?: string;
  reviewedByOfficerId?: string;
  reviewedAt?: string;
  
  uploadedAt: string;
}

/**
 * 10. Payment & TeleBirr Settlement (FR-10)
 */
export interface Payment {
  id: string;
  shipmentId: string;
  shipperId: string;
  transporterId: string;
  grossAmountEtb: number;
  platformCommissionRatePct: number;
  platformCommissionEtb: number;
  netTransporterPayoutEtb: number;
  
  paymentMethod: PaymentMethod;
  telebirrTransactionNo?: string;
  telebirrPhone?: string;
  
  status: PaymentStatus;
  disputeId?: string;
  paidAt?: string;
  settledAt?: string;
  createdAt: string;
}

/**
 * 11. Incident Report (FR-05, FR-08)
 */
export interface IncidentReport {
  id: string;
  reporterDriverId: string;
  shipmentId?: string;
  category: IncidentCategory;
  severity: RiskLevel;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  isVerifiedByAuthority: boolean;
  createdAt: string;
}

/**
 * 12. User Rating (FR-01)
 */
export interface Rating {
  id: string;
  shipmentId: string;
  fromUserId: string;
  toUserId: string;
  scoreStars: number;
  reviewText?: string;
  createdAt: string;
}

/**
 * 13. Dynamic Pricing Calculation Log (FR-04)
 */
export interface PricingCalculationLog {
  id: string;
  corridorName: string;
  baseDistanceKm: number;
  baseCorridorRateEtb: number;
  demandRatio: number;
  fuelCostIndex: number;
  congestionSurchargeEtb: number;
  calculatedSpotRateEtb: number;
  floorBoundEtb: number;
  ceilingBoundEtb: number;
  finalRateEtb: number;
  timestamp: string;
}

/**
 * 14. AI Matching Result (FR-02)
 */
export interface TransporterMatchResult {
  transporterId: string;
  transporterName: string;
  vehicleId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  capacityTons: number;
  
  compositeScore: number;
  costScore: number;
  reliabilityScore: number;
  fuelEfficiencyScore: number;
  proximityScore: number;
  
  estimatedRateEtb: number;
  distanceFromOriginKm: number;
  onTimeDeliveryRatePct: number;
  averageRating: number;
}
