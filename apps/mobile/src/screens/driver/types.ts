export interface WaypointItem {
  id: string;
  name: string;
  status: 'COMPLETED' | 'ACTIVE_NOW' | 'PENDING';
  time: string;
}

export interface CheckinRecord {
  id: string;
  time: string;
  coords: string;
}

export interface IncidentRecord {
  id: string;
  type: string;
  category?: string;
  severity?: string;
  notes: string;
  coords?: string;
  photoUrl?: string;
  time: string;
  isVerified?: boolean;
}

export interface DynamicRerouteProposal {
  proposalId: string;
  shipmentId?: string;
  incidentId?: string;
  incidentCategory: string;
  incidentLocation: string;
  originalRouteName: string;
  suggestedBypassRouteName: string;
  reason: string;
  distanceDeltaKm: number;
  estimatedTimeSavingMins: number;
  fuelCostDeltaEtb: number;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DECLINED';
  createdAt?: string;
  bypassPolyline?: Array<{ lat: number; lng: number }>;
}

export interface ActiveTripDetails {
  id?: string;
  loadId?: string;
  title?: string;
  cargo: string;
  container?: string;
  weight?: string;
  origin?: string;
  destination?: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  route?: string;
  status?: string;
  assignedTruckPlate?: string;
  driverName?: string;
  shipperName?: string;
  transporterName?: string;
  agreedRate?: string | number;
  speedKmh?: number;
  heading?: number;
  fuelLevelPct?: number;
  totalDistanceKm?: number;
  remainingKm?: number;
  isDriving?: boolean;
  estimatedEta?: string;
  etaConfidenceText?: string;
  progressPercentage?: number;
  dispatchedAt?: string;
  weatherNote?: string;
  waypoints?: WaypointItem[];
}

export type DriverTabType = 'trip' | 'nav' | 'checkin' | 'incident' | 'pod';
