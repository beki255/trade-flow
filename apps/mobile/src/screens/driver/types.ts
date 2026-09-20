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
  notes: string;
  time: string;
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
