export interface UserProfile {
  id?: string;
  email?: string;
  fullName?: string;
  companyName?: string;
  role?: string;
  phone?: string;
  tin?: string;
  tradeLicenseNo?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  isVerified?: boolean;
}

export interface TruckItem {
  id: string;
  plate: string;
  type: string;
  fuelType?: string;
  capacity: string;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE';
  insuranceStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED';
  driver: string;
  gpsEnabled: boolean;
  rawId?: string;
}

export interface DriverItem {
  id: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  experienceYears: string;
  status: 'ACTIVE' | 'ON_TRIP' | 'OFF_DUTY';
  assignedTruckPlate?: string;
  rawId?: string;
}

export interface LoadItem {
  id: string;
  rawId?: string;
  title: string;
  origin: string;
  destination: string;
  route: string;
  cargoType: string;
  weight: string;
  budget: string;
  status: string;
  isDispatched?: boolean;
  dispatchedTruck?: string;
  dispatchedDriver?: string;
}

export interface BidItem {
  id: string;
  rawId?: string;
  loadId: string;
  loadTitle: string;
  route: string;
  weight?: string;
  price: string;
  hours: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  submittedAt: string;
  dispatchedTruck?: string;
  dispatchedDriver?: string;
  isDispatched?: boolean;
}

export type TransporterTabType = 'overview' | 'fleet' | 'loads' | 'bidding' | 'earnings';
