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
  ratingAvg?: number;
  totalRatingsCount?: number;
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
  status: 'PENDING' | 'ACTIVE' | 'ON_TRIP' | 'OFF_DUTY';
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  assignedTruckPlate?: string;
  photoUrl?: string;
  licenseDocUrl?: string;
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
  weightTons?: number;
  pickupDate?: string;
  budget: string;
  status: string;
  isDispatched?: boolean;
  dispatchedTruck?: string;
  dispatchedDriver?: string;
  shipperName?: string;
  shipperCompany?: string;
  shipperPhone?: string;
  shipperEmail?: string;
  shipperTin?: string;
  shipperRating?: number;
  shipperVerified?: boolean;
}

export interface BidItem {
  id: string;
  rawId?: string;
  loadId: string;
  rawLoadId?: string;
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
  loadStatus?: string;
  shipperId?: string;
  shipmentId?: string;
  isRatedByTransporter?: boolean;
  hasRatedShipper?: boolean;
  shipperRatingScore?: number | null;
  hasRatedDriver?: boolean;
  driverRatingScore?: number | null;
  driverUserId?: string | null;
  shipperName?: string;
  shipperCompany?: string;
  shipperPhone?: string;
  shipperEmail?: string;
  shipperTin?: string;
  shipperRating?: number;
  shipperVerified?: boolean;
  isEscrowLocked?: boolean;
  escrowPaymentStatus?: string;
}

export type TransporterTabType = 'overview' | 'fleet' | 'loads' | 'bidding' | 'earnings';
