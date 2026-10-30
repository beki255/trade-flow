import { LocationData } from '../../components/map/InteractiveCorridorMapPicker';

export type { LocationData };

export interface ShipmentItem {
  id: string;
  rawId: string;
  title: string;
  type: string;
  weight: string;
  weightTons?: number;
  route: string;
  originName?: string;
  destName?: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  distanceKm?: number;
  budget: string;
  targetBudgetEtb?: number | null;
  status: string;
  createdAt: string;
  bidsCount?: number;
  cargoDescription?: string;
  bookingMethod?: 'INSTANT_MATCH' | 'COMPETITIVE_BIDDING' | string;
}

export interface BidItem {
  id: string;
  loadId: string;
  rawLoadId?: string;
  loadTitle: string;
  route: string;
  transporterName: string;
  transporterPhone: string;
  rating: number;
  bidAmount: number;
  estimatedHours: string;
  validityHours?: number;
  expiresAt?: string;
  transporterVerificationStatus?: string;
  notes: string;
  status: string;
  createdAt: string;
  isEscrowPaid?: boolean;
  paymentStatus?: string;
  paymentMethod?: string;
}

export interface ReviewItem {
  id: string;
  fromUserId?: string;
  toUserId?: string;
  fromUser?: {
    id?: string;
    companyName?: string;
    fullName?: string;
  };
  toUser?: {
    id?: string;
    companyName?: string;
    fullName?: string;
  };
  scoreStars: number;
  reviewText: string;
  createdAt: string;
}

export interface AIMatchCarrier {
  carrierId?: string;
  companyName: string;
  ratingStars: number;
  totalCompletedTrips: number;
  totalMatchScorePct: number;
  calculatedSpotRateEtb: number;
  assignedTruckPlate: string;
  payloadCapacityTons?: number;
  capacityMatched?: boolean;
  estimatedTransitHours: string;
  breakdownScores: {
    costOptimization: string | number;
    historicalReliability: string | number;
    fuelEfficiency: string | number;
    proximityAndAvailability: string | number;
  };
}

export interface MatchingSLA {
  actualExecutionTimeMs: string;
  target: string;
}

export interface SpotPricingBreakdown {
  baseFreightEtb: number;
  baseRatePerKm: number;
  demandIndexFactor: number;
  demandAdjustmentEtb: number;
  dieselPricePerLiter: number;
  baselineDieselPrice: number;
  fuelCostIndex: number;
  fuelSurchargeEtb: number;
  congestionSurchargeEtb: number;
  specialHandlingEtb: number;
  vat15PctEtb: number;
  totalWithVatEtb: number;
}

export interface SpotPricingResult {
  totalSpotRateEtb: number;
  floorBoundEtb: number;
  ceilingBoundEtb: number;
  currency: string;
  distanceKm: number;
  originName?: string;
  destName?: string;
  itemizedBreakdown: SpotPricingBreakdown;
  auditLogId: string;
  requesterId?: string;
  refreshedAt: string;
  validUntil: string;
}

export interface LockedContractItem {
  id: string;
  contractCode: string;
  shipperId: string;
  shipperName: string;
  shipperEmail: string;
  transporterId: string;
  transporterName: string;
  corridorName: string;
  originName: string;
  destName: string;
  lockedRateEtb: number;
  currentSpotBenchmarkEtb: number;
  divergencePercentage: number;
  isMateriallyDivergent: boolean;
  periodDurationWeeks: number;
  startDate: string;
  endDate: string;
  committedWeeklyLoads: number;
  status: 'ACTIVE_LOCKED' | 'FLAGGED_FOR_RENEGOTIATION' | 'UNDER_RENEGOTIATION' | 'RENEGOTIATED_RENEWED' | 'PENDING_ADMIN_APPROVAL';
  adminApprovalRequired?: boolean;
  renegotiationNotes?: string;
  proposedNewRateEtb?: number;
  lastEvaluatedAt: string;
}

