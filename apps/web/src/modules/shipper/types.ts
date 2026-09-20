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
}

export interface BidItem {
  id: string;
  loadId: string;
  loadTitle: string;
  route: string;
  transporterName: string;
  transporterPhone: string;
  rating: number;
  bidAmount: number;
  estimatedHours: string;
  notes: string;
  status: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  fromUser?: {
    companyName?: string;
    fullName?: string;
  };
  toUser?: {
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
