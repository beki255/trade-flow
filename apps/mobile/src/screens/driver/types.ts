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
  route?: string;
  status?: string;
  assignedTruckPlate?: string;
  driverName?: string;
  shipperName?: string;
  transporterName?: string;
  agreedRate?: string | number;
  speedKmh?: number;
  remainingKm?: number;
  estimatedEta?: string;
  progressPercentage?: number;
  dispatchedAt?: string;
}

export type DriverTabType = 'trip' | 'nav' | 'checkin' | 'incident' | 'pod';
