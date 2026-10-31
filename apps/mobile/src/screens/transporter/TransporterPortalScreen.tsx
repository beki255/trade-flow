import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabIcon } from '../../components/TabIcon';
import { useLanguage } from '../../context/LanguageContext';
import { transporterStyles as styles } from './transporterStyles';
import { UserProfile, TruckItem, DriverItem, LoadItem, BidItem, TransporterTabType } from './types';
import { getApiBaseUrl, apiFetch } from '../../utils/api';
import { validateEthiopianPhone } from '../../utils/validation';

// Modular Tabs
import { OverviewTab } from './tabs/OverviewTab';
import { FleetTab } from './tabs/FleetTab';
import { LoadsTab } from './tabs/LoadsTab';
import { BiddingTab } from './tabs/BiddingTab';
import { EarningsTab } from './tabs/EarningsTab';

// Modular Modals
import { AddTruckModal } from './modals/AddTruckModal';
import { AddDriverModal } from './modals/AddDriverModal';
import { DispatchModal } from './modals/DispatchModal';
import { ProfileModal } from './modals/ProfileModal';
import { RatingModal } from './modals/RatingModal';
import { NotificationsModal } from './modals/NotificationsModal';

// Modular Screen Components
import { TransporterHeader } from './components/TransporterHeader';
import { TransporterBottomNavBar } from './components/TransporterBottomNavBar';
import { CompleteProfileGate } from './components/CompleteProfileGate';
import { useTheme } from '../../context/ThemeContext';
import { storage } from '../../utils/storage';

interface TransporterPortalScreenProps {
  onLogout: () => void;
  user?: UserProfile;
}

export const TransporterPortalScreen: React.FC<TransporterPortalScreenProps> = ({
  onLogout,
  user,
}) => {
  const { language, toggleLanguage } = useLanguage();
  const { colors } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(user);

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  const [activeTab, setActiveTab] = useState<TransporterTabType>('overview');

  useEffect(() => {
    storage.getItem('tradeflow_transporter_tab').then((saved) => {
      if (saved && ['overview', 'fleet', 'loads', 'bidding', 'earnings'].includes(saved)) {
        setActiveTab(saved as TransporterTabType);
      }
    });
  }, []);

  useEffect(() => {
    storage.setItem('tradeflow_transporter_tab', activeTab).catch(() => {});
  }, [activeTab]);
  const [fleetSubTab, setFleetSubTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [refreshing, setRefreshing] = useState(false);

  // Verification Status (Live Reactive State)
  const [carrierStatus, setCarrierStatus] = useState<'PENDING' | 'VERIFIED' | 'SUSPENDED'>(
    user?.isVerified || user?.verificationStatus === 'VERIFIED'
      ? 'VERIFIED'
      : user?.verificationStatus === 'SUSPENDED'
      ? 'SUSPENDED'
      : 'PENDING'
  );

  // Check if compliance credentials & documents are complete
  const isProfileComplete = Boolean(
    (currentUser?.tin || user?.tin) &&
    (
      (currentUser?.insuranceDoc || user?.insuranceDoc) ||
      (currentUser?.roadworthinessDoc || user?.roadworthinessDoc) ||
      (currentUser?.tradeLicenseDoc || user?.tradeLicenseDoc)
    )
  );

  // Data Collections
  const [fleetList, setFleetList] = useState<TruckItem[]>([]);
  const [driversList, setDriversList] = useState<DriverItem[]>([]);
  const [loadsList, setLoadsList] = useState<LoadItem[]>([]);
  const [submittedBids, setSubmittedBids] = useState<BidItem[]>([]);

  // Modals Visibility
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedAcceptedBid, setSelectedAcceptedBid] = useState<BidItem | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRatingBid, setSelectedRatingBid] = useState<BidItem | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Add / Edit Truck Form State
  const [editingTruck, setEditingTruck] = useState<TruckItem | null>(null);
  const [truckPlate, setTruckPlate] = useState('');
  const [truckType, setTruckType] = useState('Flatbed');
  const [truckFuelType, setTruckFuelType] = useState('Diesel');
  const [truckCapacity, setTruckCapacity] = useState('28.0');
  const [truckDriver, setTruckDriver] = useState('');
  const [insuranceDoc, setInsuranceDoc] = useState(false);
  const [roadworthinessDoc, setRoadworthinessDoc] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  // Add / Edit Driver Form State
  const [editingDriver, setEditingDriver] = useState<DriverItem | null>(null);
  const [driverFullName, setDriverFullName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverCategory, setDriverCategory] = useState('Grade 5 Heavy');
  const [driverExperience, setDriverExperience] = useState('5');
  const [driverAssignedPlate, setDriverAssignedPlate] = useState('');
  const [driverPhoto, setDriverPhoto] = useState('');
  const [driverLicenseDoc, setDriverLicenseDoc] = useState('');
  const [licenseDocName, setLicenseDocName] = useState('');
  const generateRandomPassword = () => `TF-${Math.floor(1000 + Math.random() * 9000)}`;
  const [driverTemporaryPassword, setDriverTemporaryPassword] = useState(generateRandomPassword());
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);

  // Bidding State
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [transitHours, setTransitHours] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidValidityHours, setBidValidityHours] = useState(24);
  const [bidSuccess, setBidSuccess] = useState('');
  const [biddingSubTab, setBiddingSubTab] = useState<'create' | 'history'>('create');

  // Load Search & Filter State (4.2.4)
  const [loadSearchQuery, setLoadSearchQuery] = useState('');
  const [selectedCargoFilter, setSelectedCargoFilter] = useState('ALL');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('ALL');
  const [selectedTonnageFilter, setSelectedTonnageFilter] = useState('ALL');

  // Real-time Bid Acceptance/Rejection Status Ref
  const prevBidStatusesRef = useRef<Record<string, string>>({});

  // Dispatch Assignment State
  const [dispatchTruck, setDispatchTruck] = useState('');
  const [dispatchDriver, setDispatchDriver] = useState('');

  // Fetch real corridor loads, vehicles, and drivers concurrently
  const refreshAllData = async () => {
    try {
      await Promise.allSettled([
        // 1. Fetch Loads
        (async () => {
          try {
            const loadsRes = await apiFetch('/api/portal/loads');
            if (loadsRes.ok) {
              const data = await loadsRes.json();
              if (data.loads) {
                const cleanText = (str?: any) => (str ? String(str).replace(/^`+|`+$/g, '').trim() : '');
                setLoadsList(
                  data.loads.map((l: any) => ({
                    id: l.id ? `LD-${l.id.slice(-4).toUpperCase()}` : 'LD-9901',
                    rawId: l.id,
                    title: cleanText(l.title) || 'Corridor Consignment',
                    origin: cleanText(l.originAddress || l.originName) || 'Addis Ababa',
                    destination: cleanText(l.destinationAddress || l.destName) || 'Djibouti Port',
                    route: `${cleanText(l.originAddress || l.originName) || 'Addis Ababa'} ➔ ${cleanText(l.destinationAddress || l.destName) || 'Djibouti Port'}`,
                    cargoType: cleanText(l.cargoType) || 'General Freight',
                    weight: `${l.weightTons || 28.0} Tons`,
                    weightTons: parseFloat(l.weightTons) || 28.0,
                    pickupDate: l.pickupWindowStart ? new Date(l.pickupWindowStart).toLocaleDateString() : '',
                    budget: l.targetBudgetEtb ? `${Number(l.targetBudgetEtb).toLocaleString()} ETB` : '',
                    status: l.status || 'OPEN',
                    isDispatched:
                      Boolean(
                        l.shipment &&
                        l.shipment.status !== 'ASSIGNED' &&
                        (l.shipment.status === 'DISPATCHED' || l.shipment.status === 'IN_TRANSIT' || l.status === 'IN_TRANSIT' || l.status === 'COMPLETED') &&
                        l.shipment.vehicle?.plateNumber &&
                        l.shipment.driver?.user?.fullName
                      ),
                    dispatchedTruck:
                      l.shipment && l.shipment.status !== 'ASSIGNED' ? (l.shipment.vehicle?.plateNumber || '') : '',
                    dispatchedDriver:
                      l.shipment && l.shipment.status !== 'ASSIGNED' ? (l.shipment.driver?.user?.fullName || '') : '',
                    shipperName: l.shipper?.companyName || l.shipper?.fullName || 'Verified Shipper',
                    shipperCompany: l.shipper?.companyName || '',
                    shipperPhone: l.shipper?.phone || '',
                    shipperEmail: l.shipper?.email || '',
                    shipperTin: l.shipper?.tin || '',
                    shipperRating: (l.shipper?.totalRatingsCount && l.shipper.totalRatingsCount > 0) ? l.shipper.ratingAvg : 0.0,
                    shipperVerified: l.shipper?.verificationStatus === 'VERIFIED',
                  }))
                );
              }
            }
          } catch (e) {
            console.warn('Loads fetch error:', e);
          }
        })(),

        // 2. Fetch Fleet Vehicles (Strictly Scoped to this Transporter)
        (async () => {
          try {
            const fleetRes = await apiFetch(
              `/api/portal/vehicles?transporterId=${user?.id || ''}&transporterEmail=${encodeURIComponent(user?.email || '')}`
            );
            if (fleetRes.ok) {
              const data = await fleetRes.json();
              if (data.vehicles && data.vehicles.length > 0) {
                const mappedVehicles = data.vehicles.map((v: any) => ({
                  id: v.id,
                  rawId: v.id,
                  plate: v.plateNumber || 'No Plate',
                  type: v.model || v.type || v.vehicleType || 'Commercial Freight',
                  fuelType: v.fuelType || 'DIESEL',
                  capacity: v.capacityTons ? `${v.capacityTons} Tons` : '',
                  status: v.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'AVAILABLE',
                  insuranceStatus: v.insurancePolicyNo ? 'VERIFIED' : 'PENDING',
                  driver: v.drivers?.[0]?.user?.fullName || v.driver?.fullName || 'Unassigned',
                  gpsEnabled: true,
                }));
                setFleetList(mappedVehicles);
              } else {
                setFleetList([]);
              }
            }
          } catch (e) {
            console.warn('Fleet fetch error:', e);
          }
        })(),

        // 3. Fetch Authorized Drivers (Strictly Scoped to this Transporter)
        (async () => {
          try {
            const driversRes = await apiFetch(
              `/api/portal/drivers?transporterId=${user?.id || ''}&transporterEmail=${encodeURIComponent(user?.email || '')}`
            );
            if (driversRes.ok) {
              const data = await driversRes.json();
              if (data.drivers && data.drivers.length > 0) {
                const mappedDrivers = data.drivers.map((d: any) => {
                  const isPending =
                    d.status === 'PENDING' ||
                    d.verificationStatus === 'PENDING' ||
                    d.user?.verificationStatus === 'PENDING';
                  return {
                    id: d.id || d.rawId || `DRV-${Date.now()}`,
                    rawId: d.id || d.profileId || d.userId,
                    fullName: d.fullName || d.user?.fullName || 'Authorized Driver',
                    phone: d.phone || d.user?.phone || '',
                    licenseNumber: d.licenseNumber || d.driverLicenseNo || d.driverProfile?.driverLicenseNo || 'Unspecified',
                    licenseCategory: d.licenseCategory || d.licenseClass || d.driverProfile?.licenseClass || 'Grade 5 Heavy',
                    experienceYears: `${d.experienceYears || d.driverProfile?.experienceYears || 4}`,
                    status: isPending ? 'PENDING' : (d.status === 'ON_TRIP' ? 'ON_TRIP' : 'ACTIVE'),
                    verificationStatus: isPending ? 'PENDING' : (d.verificationStatus || d.user?.verificationStatus || 'VERIFIED'),
                    assignedTruckPlate: d.assignedTruckPlate || d.assignedVehicle?.plateNumber || d.driverProfile?.assignedVehicle?.plateNumber || '',
                    photoUrl: d.photoUrl || d.user?.roadworthinessDoc || d.user?.insuranceDoc || '',
                    licenseDocUrl: d.licenseDocUrl || d.user?.tradeLicenseDoc || '',
                  };
                });
                setDriversList(mappedDrivers);
              } else {
                setDriversList([]);
              }
            }
          } catch (e) {
            console.warn('Drivers fetch error:', e);
          }
        })(),

        // 4. Fetch Quotes
        (async () => {
          try {
            const bidsRes = await apiFetch(
              `/api/portal/bids?transporterId=${user?.id || ''}&transporterEmail=${encodeURIComponent(user?.email || '')}`
            );
            if (bidsRes.ok) {
              const data = await bidsRes.json();
              if (data.bids && data.bids.length > 0) {
                const mappedBids = data.bids.map((b: any) => {
                  const isActualDispatched = Boolean(
                    b.isDispatched ||
                    (b.proposalNotes && b.proposalNotes.startsWith('Dispatched')) ||
                    (b.load?.shipment &&
                      b.load.shipment.status !== 'ASSIGNED' &&
                      (b.load.shipment.status === 'DISPATCHED' || b.load.shipment.status === 'IN_TRANSIT'))
                  );

                  const truck = isActualDispatched
                    ? (b.dispatchedTruck || (b.proposalNotes?.match(/Vehicle:\s*([^\s•]+)/)?.[1]) || '')
                    : '';

                  const driver = isActualDispatched
                    ? (b.dispatchedDriver || (b.proposalNotes?.match(/Driver:\s*([^•\n]+)/)?.[1]?.trim()) || '')
                    : '';

                  const isDispatched = Boolean(truck && driver && isActualDispatched);

                  // Silent Bid Acceptance / Rejection Status Detection
                  const prev = prevBidStatusesRef.current[b.id];
                  if (prev && prev === 'PENDING' && b.status === 'ACCEPTED') {
                    // Sync unread notification count for the header bell icon
                    apiFetch(`/api/notifications?role=TRANSPORTER&userId=${user?.id || ''}`)
                      .then((r) => r.json())
                      .then((data) => {
                        if (typeof data.unreadCount === 'number') {
                          setUnreadNotifCount(data.unreadCount);
                        }
                      })
                      .catch(() => {});
                  }
                  prevBidStatusesRef.current[b.id] = b.status;

                  return {
                    id: `BID-${b.id.slice(-4).toUpperCase()}`,
                    rawId: b.id,
                    loadId: b.loadId ? `LD-${b.loadId.slice(-4).toUpperCase()}` : 'LD-9901',
                    rawLoadId: b.loadId || b.load?.id,
                    loadTitle: b.load?.title || 'Corridor Freight Consignment',
                    route: (b.load?.originAddress && b.load?.destinationAddress)
                      ? `${b.load.originAddress} ➔ ${b.load.destinationAddress}`
                      : b.load?.originName
                      ? `${b.load.originName} ➔ ${b.load.destName}`
                      : 'Addis Ababa ➔ Djibouti Port',
                    weight: `${b.load?.weightTons || 28.0} Tons`,
                    price: `${Number(b.proposedRateEtb).toLocaleString()} ETB`,
                    hours: `${b.pickupEstimatedHours || 18}h`,
                    notes: b.proposalNotes || '',
                    status: b.status || 'PENDING',
                    submittedAt: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    dispatchedTruck: truck,
                    dispatchedDriver: driver,
                    isDispatched,
                    loadStatus: b.load?.status || (b.load?.shipment?.status === 'DELIVERED' ? 'DELIVERED' : ''),
                    shipperId: b.load?.shipperId || b.load?.shipper?.id,
                    shipmentId: b.load?.shipment?.id,
                    hasRatedShipper: b.hasRatedShipper,
                    shipperRatingScore: b.shipperRatingScore,
                    hasRatedDriver: b.hasRatedDriver,
                    driverRatingScore: b.driverRatingScore,
                    driverUserId: b.driverUserId,
                    shipperName: b.load?.shipper?.companyName || b.load?.shipper?.fullName || 'Verified Shipper',
                    shipperCompany: b.load?.shipper?.companyName || '',
                    shipperPhone: b.load?.shipper?.phone || '',
                    shipperEmail: b.load?.shipper?.email || '',
                    shipperTin: b.load?.shipper?.tin || '',
                    shipperRating: (b.load?.shipper?.totalRatingsCount && b.load.shipper.totalRatingsCount > 0) ? b.load.shipper.ratingAvg : 0.0,
                    shipperVerified: b.load?.shipper?.verificationStatus === 'VERIFIED',
                    isEscrowLocked: Boolean(
                      b.load?.shipment?.payment?.status === 'HELD_IN_ESCROW' ||
                      b.load?.shipment?.payment?.status === 'CONFIRMED' ||
                      b.load?.shipment?.payment?.status === 'SETTLED'
                    ),
                    escrowPaymentStatus: b.load?.shipment?.payment?.status || 'PENDING',
                  };
                });
                setSubmittedBids(mappedBids);
              } else {
                setSubmittedBids([]);
              }
            }
          } catch (e) {
            console.warn('Bids fetch error:', e);
          }
        })(),

        // 5. Fetch Real-Time Notifications Unread Count
        (async () => {
          try {
            const notifRes = await apiFetch(
              `/api/notifications?role=TRANSPORTER&userId=${user?.id || ''}`
            );
            if (notifRes.ok) {
              const data = await notifRes.json();
              if (typeof data.unreadCount === 'number') {
                setUnreadNotifCount(data.unreadCount);
              }
            }
          } catch (e) {
            // silent ignore
          }
        })(),
      ]);
    } catch (err) {
      console.warn('API sync error:', err);
    }
  };

  // Real-Time Live Carrier Verification Sync
  const checkLiveVerificationStatus = async () => {
    if (!user?.id && !user?.email) return;
    try {
      const q = user?.id ? `userId=${encodeURIComponent(user.id)}` : `email=${encodeURIComponent(user?.email || '')}`;
      const res = await apiFetch(`/api/portal/user-status?${q}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verificationStatus && data.verificationStatus !== carrierStatus) {
          setCarrierStatus(data.verificationStatus);
          if (user) {
            user.verificationStatus = data.verificationStatus;
            user.isVerified = data.verificationStatus === 'VERIFIED';
          }
        }
      }
    } catch (e) {
      // ignore transient network hiccup
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 2500);
    return () => clearInterval(interval);
  }, [user?.id]);

  // High-Frequency Real-Time Poller while account is PENDING
  useEffect(() => {
    checkLiveVerificationStatus();
    if (carrierStatus === 'PENDING') {
      const liveTimer = setInterval(checkLiveVerificationStatus, 1500);
      return () => clearInterval(liveTimer);
    }
  }, [carrierStatus, user?.id, user?.email]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([checkLiveVerificationStatus(), refreshAllData()]);
    } catch (err) {
      console.warn('Pull-to-refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Real-time Text Keyword Search across all load fields (typing only)
  const filteredLoads = loadsList.filter((load) => {
    const q = loadSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      load.title?.toLowerCase().includes(q) ||
      load.route?.toLowerCase().includes(q) ||
      load.id?.toLowerCase().includes(q) ||
      load.origin?.toLowerCase().includes(q) ||
      load.destination?.toLowerCase().includes(q) ||
      load.cargoType?.toLowerCase().includes(q) ||
      load.weight?.toLowerCase().includes(q) ||
      String(load.weightTons || '').includes(q) ||
      load.shipperName?.toLowerCase().includes(q) ||
      load.status?.toLowerCase().includes(q)
    );
  });

  // Direct AI Instant Match Requests (Option A from Shipper)
  const directMatchRequests = submittedBids.filter(
    (b) =>
      (b.notes?.includes('DIRECT AI INSTANT MATCH') || b.notes?.includes('Option A')) &&
      b.status === 'PENDING'
  );

  // Open Create Truck Modal (reset form)
  const handleOpenCreateTruck = () => {
    setEditingTruck(null);
    setTruckPlate('');
    setTruckType('Flatbed');
    setTruckFuelType('Diesel');
    setTruckCapacity('28.0');
    setTruckDriver('');
    setInsuranceDoc(false);
    setRoadworthinessDoc(false);
    setShowAddTruck(true);
  };

  // Open Edit Truck Modal (populate form)
  const handleOpenEditTruck = (truck: TruckItem) => {
    setEditingTruck(truck);
    setTruckPlate(truck.plate || (truck as any).plateNumber || '');
    setTruckType(truck.type || 'Flatbed');
    setTruckFuelType(truck.fuelType || 'Diesel');
    setTruckCapacity(truck.capacity ? truck.capacity.replace(/[^0-9.]/g, '') : '28.0');
    setTruckDriver(truck.driver && truck.driver !== 'Unassigned' ? truck.driver : '');
    setInsuranceDoc(true);
    setRoadworthinessDoc(true);
    setShowAddTruck(true);
  };

  // Delete Truck Handler
  const handleDeleteTruck = async (truckId: string) => {
    try {
      const res = await apiFetch(`/api/portal/vehicles/${truckId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        Alert.alert('Vehicle Deleted', 'Vehicle was successfully removed from your fleet.');
        await refreshAllData();
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert('Cannot Delete Vehicle', errData.error || 'Failed to delete vehicle.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to delete vehicle');
    }
  };

  // Add or Update Truck Handler
  const handleAddTruck = async () => {
    if (!truckPlate) {
      Alert.alert('Missing Field', 'Please enter the vehicle license plate number.');
      return;
    }

    // Branch for Editing Existing Truck
    if (editingTruck) {
      const truckId = editingTruck.id || (editingTruck as any).rawId;
      try {
        const res = await apiFetch(`/api/portal/vehicles/${truckId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plateNumber: truckPlate.trim().toUpperCase(),
            vehicleType: truckType,
            fuelType: truckFuelType,
            capacityTons: parseFloat(truckCapacity) || 30.0,
            driverName: truckDriver,
          }),
        });
        if (res.ok) {
          Alert.alert('Success', `Vehicle ${truckPlate.trim().toUpperCase()} updated successfully!`);
          await refreshAllData();
        } else {
          const errData = await res.json().catch(() => ({}));
          Alert.alert('Update Failed', errData.error || 'Could not update vehicle.');
        }
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update vehicle');
      }
      setEditingTruck(null);
      setTruckPlate('');
      setTruckType('Flatbed');
      setTruckFuelType('Diesel');
      setTruckDriver('');
      setInsuranceDoc(false);
      setRoadworthinessDoc(false);
      setShowAddTruck(false);
      return;
    }

    const apiUrl = getApiBaseUrl();
    const newTruck: TruckItem = {
      id: `TRK-${Date.now().toString().slice(-4)}`,
      plate: truckPlate.trim().toUpperCase(),
      type: truckType,
      fuelType: truckFuelType,
      capacity: `${truckCapacity} Tons`,
      status: 'AVAILABLE',
      insuranceStatus: 'VERIFIED',
      driver: truckDriver || 'Unassigned',
      gpsEnabled: true,
    };
    setFleetList((prev) => [newTruck, ...prev]);

    if (truckDriver) {
      setDriversList((prev) =>
        prev.map((d) => (d.fullName === truckDriver ? { ...d, assignedTruckPlate: newTruck.plate } : d))
      );
    }

    try {
      const res = await apiFetch('/api/portal/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user?.id,
          transporterEmail: user?.email,
          plateNumber: newTruck.plate,
          vehicleType: newTruck.type,
          fuelType: truckFuelType,
          capacityTons: parseFloat(truckCapacity) || 30.0,
          driverName: truckDriver,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.vehicle) {
          const v = result.vehicle;
          const mappedSaved: TruckItem = {
            id: v.id,
            rawId: v.id,
            plate: v.plateNumber || newTruck.plate,
            type: v.vehicleType || newTruck.type,
            fuelType: v.fuelType || newTruck.fuelType || 'DIESEL',
            capacity: v.capacityTons ? `${v.capacityTons} Tons` : newTruck.capacity,
            status: 'AVAILABLE',
            insuranceStatus: 'VERIFIED',
            driver: truckDriver || 'Unassigned',
            gpsEnabled: true,
          };
          setFleetList((prev) => [mappedSaved, ...prev.filter((trk) => trk.plate !== newTruck.plate && trk.id !== mappedSaved.id)]);
        }
        await refreshAllData();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('Vehicle save warning:', errData);
      }
    } catch (err) {
      console.warn('Vehicle save error:', err);
    }

    setTruckPlate('');
    setTruckType('Flatbed');
    setTruckFuelType('Diesel');
    setTruckDriver('');
    setInsuranceDoc(false);
    setRoadworthinessDoc(false);
    setShowAddTruck(false);
    setActiveTab('fleet');
    setFleetSubTab('vehicles');
    Alert.alert('Success', `Vehicle ${newTruck.plate} registered successfully!`);
  };

  // Open Create Driver Modal (reset form)
  const handleOpenCreateDriver = () => {
    setEditingDriver(null);
    setDriverFullName('');
    setDriverPhone('');
    setDriverEmail('');
    setDriverLicense('');
    setDriverCategory('Grade 5 Heavy');
    setDriverExperience('5');
    setDriverAssignedPlate('');
    setDriverPhoto('');
    setDriverLicenseDoc('');
    setLicenseDocName('');
    setDriverTemporaryPassword(generateRandomPassword());
    setShowAddDriver(true);
  };

  // Open Edit Driver Modal (populate form)
  const handleOpenEditDriver = (driver: DriverItem) => {
    setEditingDriver(driver);
    setDriverFullName(driver.fullName || '');
    setDriverPhone(driver.phone || '');
    setDriverEmail((driver as any).email || (driver as any).user?.email || '');
    setDriverLicense(driver.licenseNumber || '');
    setDriverCategory(driver.licenseCategory || 'Grade 5 Heavy');
    setDriverExperience(driver.experienceYears ? String(driver.experienceYears).replace(/[^0-9]/g, '') : '5');
    setDriverAssignedPlate(driver.assignedTruckPlate && driver.assignedTruckPlate !== 'Unassigned' ? driver.assignedTruckPlate : '');
    setDriverPhoto(driver.photoUrl || '');
    setDriverLicenseDoc(driver.licenseDocUrl || '');
    setLicenseDocName(driver.licenseDocUrl ? 'Driver_License_File' : '');
    setDriverTemporaryPassword('');
    setShowAddDriver(true);
  };

  // Delete Driver Handler
  const handleDeleteDriver = async (driverId: string) => {
    try {
      const res = await apiFetch(`/api/portal/drivers/${driverId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        Alert.alert('Driver Removed', 'Driver was successfully removed.');
        await refreshAllData();
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert('Cannot Remove Driver', errData.error || 'Failed to remove driver.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to remove driver');
    }
  };

  // Add or Update Driver Handler (Scoped to Logged-in Transporter)
  const handleAddDriver = async () => {
    if (!driverFullName || !driverPhone) {
      Alert.alert('Missing Fields', 'Please enter the driver legal name and phone number.');
      return;
    }

    const phoneRes = validateEthiopianPhone(driverPhone);
    if (!phoneRes.isValid) {
      Alert.alert('Invalid Phone', phoneRes.error || 'Please enter a valid Ethiopian phone number (+251 9... / 09... or +251 7... / 07...).');
      return;
    }

    const normalizedDriverPhone = phoneRes.normalized || driverPhone.trim();

    // Branch for Editing Existing Driver
    if (editingDriver) {
      const driverId = editingDriver.id || (editingDriver as any).rawId;
      try {
        const res = await apiFetch(`/api/portal/drivers/${driverId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: driverFullName.trim(),
            phone: normalizedDriverPhone,
            email: driverEmail.trim() ? driverEmail.trim().toLowerCase() : undefined,
            licenseNo: driverLicense.trim() || undefined,
            licenseClass: driverCategory,
            experienceYears: parseInt(driverExperience) || 5,
            assignedVehiclePlate: driverAssignedPlate || '',
            password: driverTemporaryPassword.trim() ? driverTemporaryPassword.trim() : undefined,
          }),
        });
        if (res.ok) {
          Alert.alert('Success', `Driver ${driverFullName.trim()} profile updated successfully!`);
          await refreshAllData();
        } else {
          const errData = await res.json().catch(() => ({}));
          Alert.alert('Update Failed', errData.error || 'Could not update driver.');
        }
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update driver');
      }
      setEditingDriver(null);
      setDriverFullName('');
      setDriverPhone('');
      setDriverEmail('');
      setDriverLicense('');
      setDriverAssignedPlate('');
      setDriverPhoto('');
      setDriverLicenseDoc('');
      setLicenseDocName('');
      setDriverTemporaryPassword(generateRandomPassword());
      setShowAddDriver(false);
      return;
    }

    const newDriver: DriverItem = {
      id: `DRV-${Date.now().toString().slice(-4)}`,
      fullName: driverFullName.trim(),
      phone: normalizedDriverPhone,
      licenseNumber: driverLicense.trim() || `ETH-DL-${Math.floor(100000 + Math.random() * 900000)}`,
      licenseCategory: driverCategory,
      experienceYears: driverExperience || '5',
      status: 'PENDING',
      verificationStatus: 'PENDING',
      assignedTruckPlate: driverAssignedPlate,
      photoUrl: driverPhoto,
      licenseDocUrl: driverLicenseDoc,
    };
    setDriversList((prev) => [newDriver, ...prev]);

    try {
      const res = await apiFetch('/api/portal/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user?.id,
          transporterEmail: user?.email,
          fullName: newDriver.fullName,
          phone: newDriver.phone,
          email: driverEmail.trim() ? driverEmail.trim().toLowerCase() : undefined,
          licenseNo: newDriver.licenseNumber,
          licenseClass: newDriver.licenseCategory,
          experienceYears: parseInt(driverExperience) || 5,
          assignedVehiclePlate: driverAssignedPlate,
          password: driverTemporaryPassword.trim(),
          driverPhoto: undefined,
          licenseDoc: driverLicenseDoc
            ? (driverLicenseDoc.startsWith('{')
                ? driverLicenseDoc
                : JSON.stringify({ name: licenseDocName || 'Commercial_Driver_License.jpg', data: driverLicenseDoc }))
            : undefined,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.driver) {
          const saved = result.driver;
          const isPending =
            saved.status === 'PENDING' ||
            saved.verificationStatus === 'PENDING' ||
            saved.user?.verificationStatus === 'PENDING';
          const mappedSaved: DriverItem = {
            id: saved.id || saved.rawId,
            rawId: saved.id || saved.rawId,
            fullName: saved.fullName || saved.user?.fullName || newDriver.fullName,
            phone: saved.phone || saved.user?.phone || newDriver.phone,
            licenseNumber: saved.licenseNumber || saved.driverLicenseNo || newDriver.licenseNumber,
            licenseCategory: saved.licenseCategory || saved.licenseClass || newDriver.licenseCategory,
            experienceYears: `${saved.experienceYears || newDriver.experienceYears}`,
            status: isPending ? 'PENDING' : 'ACTIVE',
            verificationStatus: isPending ? 'PENDING' : 'VERIFIED',
            assignedTruckPlate: saved.assignedTruckPlate || saved.assignedVehicle?.plateNumber || newDriver.assignedTruckPlate || '',
            photoUrl: saved.photoUrl || saved.user?.roadworthinessDoc || newDriver.photoUrl,
            licenseDocUrl: saved.licenseDocUrl || saved.user?.tradeLicenseDoc || newDriver.licenseDocUrl,
          };
          setDriversList((prev) => [mappedSaved, ...prev.filter((d) => d.id !== newDriver.id && d.id !== mappedSaved.id)]);
        }
        await refreshAllData();
      }
    } catch (err) {
      console.warn('Driver save error:', err);
    }

    const oneTimePass = driverTemporaryPassword;
    const registeredEmail = driverEmail.trim().toLowerCase();
    setDriverFullName('');
    setDriverPhone('');
    setDriverEmail('');
    setDriverLicense('');
    setDriverAssignedPlate('');
    setDriverPhoto('');
    setDriverLicenseDoc('');
    setLicenseDocName('');
    setDriverTemporaryPassword(generateRandomPassword());
    setShowAddDriver(false);
    setActiveTab('fleet');
    setFleetSubTab('drivers');
    Alert.alert(
      'Driver Registered Successfully',
      `Driver: ${newDriver.fullName}\nPhone: ${newDriver.phone}${registeredEmail ? `\nEmail: ${registeredEmail}` : ''}\nOne-Time Password: ${oneTimePass}\n\nPlease share this temporary password with the driver. They can sign in on the TradeFlow Driver app and update it in their Profile.`
    );
  };

  // Submit Bid Handler
  const handleSubmitBid = async () => {
    if (carrierStatus === 'PENDING') {
      Alert.alert(
        'Verification Required',
        'Your carrier account is currently PENDING verification. You cannot submit bids until Platform Administrators approve your Trade License.'
      );
      return;
    }

    if (carrierStatus === 'SUSPENDED') {
      Alert.alert(
        'Account Suspended',
        'Your carrier account has been suspended by platform administration. Access to submit bids or accept consignments is revoked.'
      );
      return;
    }

    if (!selectedLoadId || !bidPrice) {
      Alert.alert('Incomplete Quote', 'Please select a corridor load and enter your proposed price.');
      return;
    }

    const selectedLoadObj = loadsList.find((l) => l.id === selectedLoadId || l.rawId === selectedLoadId);

    // Guard: Prevent bidding if consignment is already booked or dispatched
    if (selectedLoadObj?.isDispatched || selectedLoadObj?.status === 'BOOKED' || selectedLoadObj?.status === 'IN_TRANSIT') {
      Alert.alert(
        'Consignment Already Booked',
        'This consignment has already been assigned and dispatched. A load cannot accept duplicate bids or duplicate assignments.'
      );
      return;
    }

    // Prevent duplicate bid submissions on the same load
    const isAlreadyBid = submittedBids.some(
      (b) =>
        (b.loadId === selectedLoadId ||
          b.rawId === selectedLoadId ||
          (selectedLoadObj?.title && b.loadTitle === selectedLoadObj.title)) &&
        b.status !== 'REJECTED'
    );
    if (isAlreadyBid) {
      Alert.alert(
        'Quote Already Placed',
        'You have already submitted an active bid for this corridor load. Shipper will review your quote.'
      );
      return;
    }

    const apiUrl = getApiBaseUrl();

    const newBid: BidItem = {
      id: `BID-${Date.now().toString().slice(-4)}`,
      rawId: `temp-${Date.now()}`,
      loadId: selectedLoadId,
      loadTitle: selectedLoadObj?.title || 'Corridor Freight Consignment',
      route: selectedLoadObj?.route || 'Addis Ababa ➔ Djibouti Port',
      weight: selectedLoadObj?.weight || '28.0 Tons',
      price: `${Number(bidPrice.replace(/[^0-9.]/g, '')).toLocaleString()} ETB`,
      hours: `${transitHours ? parseInt(transitHours) || 18 : 18}h`,
      notes: bidNotes || 'GPS live tracking enabled. Ready for immediate corridor dispatch.',
      status: 'PENDING',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSubmittedBids((prev) => [newBid, ...prev.filter((b) => b.id !== newBid.id)]);
    setBidSuccess('Bid submitted successfully! Shipper will review your quote.');
    setTimeout(() => setBidSuccess(''), 4000);

    try {
      const res = await apiFetch('/api/portal/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: selectedLoadObj?.rawId || selectedLoadId,
          transporterId: user?.id,
          transporterEmail: user?.email,
          proposedRateEtb: parseFloat(bidPrice.replace(/[^0-9.]/g, '')) || 175000,
          pickupEstimatedHours: parseInt(transitHours) || 18,
          proposalNotes: bidNotes || 'Ready for corridor pickup.',
          validityHours: bidValidityHours || 24,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bid) {
          setSubmittedBids((prev) =>
            prev.map((b) => (b.id === newBid.id ? { ...b, rawId: data.bid.id } : b))
          );
        }
      }
    } catch (err) {
      console.warn('Could not post bid to database:', err);
    }

    setBidPrice('');
    setTransitHours('');
    setBidNotes('');
    setSelectedLoadId('');
  };

  // Respond to Direct Match Offer
  const handleRespondDirectOffer = async (bidId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await apiFetch('/api/portal/bids/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId, action }),
      });
      if (res.ok) {
        setSubmittedBids((prev) =>
          prev.map((b) =>
            b.rawId === bidId || b.id === bidId
              ? { ...b, status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' }
              : b
          )
        );
        Alert.alert(
          action === 'ACCEPT' ? 'Match Confirmed' : 'Offer Declined',
          action === 'ACCEPT'
            ? 'You have officially accepted the AI Instant Match! Smart Escrow deposit is locked.'
            : 'You declined the instant match request.'
        );
      }
    } catch (err) {
      console.warn('Could not respond to direct offer:', err);
    }
  };

  // Delete / Withdraw Bid
  const handleDeleteBid = (bid: BidItem) => {
    const executeWithdraw = async () => {
      const targetId = bid.rawId || bid.id;
      // 1. Optimistically update local state immediately
      setSubmittedBids((prev) =>
        prev.filter((b) => b.id !== bid.id && b.rawId !== targetId)
      );

      try {
        const queryParams = bid.loadId ? `?loadId=${encodeURIComponent(bid.loadId)}` : '';
        const res = await apiFetch(`/api/portal/bids/${targetId}${queryParams}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            console.log('Quotation successfully withdrawn.');
          } else {
            Alert.alert('Bid Withdrawn', 'Your quotation has been successfully removed from the consignment.');
          }
          await refreshAllData();
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('Withdraw error response:', errData);
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.alert(errData.error || 'Failed to withdraw bid.');
          } else {
            Alert.alert('Cannot Withdraw Bid', errData.error || 'Failed to withdraw bid.');
          }
          await refreshAllData();
        }
      } catch (err) {
        console.warn('Network error while withdrawing bid:', err);
        await refreshAllData();
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm(
        `Withdraw Quotation?\n\nAre you sure you want to withdraw your quote of ${bid.price} for "${bid.loadTitle}"? You can re-submit another quote before the bidding window closes.`
      );
      if (confirmed) {
        executeWithdraw();
      }
    } else {
      Alert.alert(
        'Withdraw Quotation?',
        `Are you sure you want to withdraw your quote of ${bid.price} for "${bid.loadTitle}"? You can re-submit another quote before the bidding window closes.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Withdraw Bid',
            style: 'destructive',
            onPress: executeWithdraw,
          },
        ]
      );
    }
  };

  // Post-Acceptance Dispatch Assignment
  const handleConfirmDispatch = async () => {
    if (!dispatchTruck || !dispatchDriver) {
      Alert.alert('Incomplete Assignment', 'Please select both an available vehicle and an authorized driver.');
      return;
    }

    // Strict Guard: 1 load cannot be dispatched more than once
    if (selectedAcceptedBid?.dispatchedTruck && selectedAcceptedBid?.dispatchedDriver) {
      Alert.alert(
        'Already Dispatched',
        'This consignment has already been assigned and dispatched. A load cannot be assigned or dispatched multiple times.'
      );
      setShowDispatchModal(false);
      return;
    }

    // Strict Guard: Vehicle must not be on another active trip
    const vehicleObj = fleetList.find((t) => t.plate === dispatchTruck);
    if (vehicleObj && vehicleObj.status === 'IN_TRANSIT') {
      Alert.alert(
        'Vehicle Busy',
        `Vehicle ${dispatchTruck} is currently on an active corridor shipment and cannot be double-booked.`
      );
      return;
    }

    // Strict Guard: Vehicle Weight Capacity Match (FTA Corridor Weight Limit Regulations)
    const cargoWeightTons = parseFloat((selectedAcceptedBid?.weight || '').replace(/[^0-9.]/g, '')) || 0;
    if (vehicleObj) {
      const truckCap = parseFloat((vehicleObj.capacity || '').replace(/[^0-9.]/g, '')) || 0;
      if (cargoWeightTons > 0 && truckCap > 0 && truckCap < cargoWeightTons) {
        Alert.alert(
          'Weight Capacity Mismatch',
          `This consignment weighs ${cargoWeightTons} Tons, but truck ${dispatchTruck} only has a maximum registered payload capacity of ${truckCap} Tons.\n\nFTA and Corridor safety regulations prohibit overloading. Please select a truck capable of carrying at least ${cargoWeightTons} Tons.`
        );
        return;
      }
    }

    // Strict Guard: Driver must be verified by Platform Admin
    const driverObj = driversList.find((d) => d.fullName === dispatchDriver);
    if (driverObj && driverObj.status === 'PENDING') {
      Alert.alert(
        '⏳ Driver Not Verified',
        `Driver ${dispatchDriver} is pending administrator verification and cannot be dispatched on corridor shipments until verified.`
      );
      return;
    }

    // Strict Guard: Driver must not be on another active trip
    if (driverObj && (driverObj.status === 'IN_TRANSIT' || driverObj.status === 'ON_TRIP')) {
      Alert.alert(
        'Driver Busy',
        `Driver ${dispatchDriver} is currently on an active corridor shipment and cannot be double-booked.`
      );
      return;
    }

    setSubmittedBids((prev) =>
      prev.map((b) =>
        b.id === selectedAcceptedBid?.id || b.rawId === selectedAcceptedBid?.rawId
          ? { ...b, dispatchedTruck: dispatchTruck, dispatchedDriver: dispatchDriver, isDispatched: true }
          : b
      )
    );

    // Also update load state immediately to lock it
    setLoadsList((prev) =>
      prev.map((l) =>
        l.id === selectedAcceptedBid?.loadId || l.title === selectedAcceptedBid?.loadTitle
          ? {
              ...l,
              status: 'BOOKED',
              isDispatched: true,
              dispatchedTruck: dispatchTruck,
              dispatchedDriver: dispatchDriver,
            }
          : l
      )
    );

    // Update fleet truck and driver active trip status
    setFleetList((prev) =>
      prev.map((t) =>
        t.plate === dispatchTruck ? { ...t, status: 'IN_TRANSIT', driver: dispatchDriver } : t
      )
    );
    setDriversList((prev) =>
      prev.map((d) =>
        d.fullName === dispatchDriver
          ? { ...d, status: 'IN_TRANSIT', assignedTruckPlate: dispatchTruck }
          : d
      )
    );

    const targetLoadId = selectedAcceptedBid?.loadId || '';

    try {
      const res = await apiFetch('/api/portal/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: selectedAcceptedBid?.rawId || selectedAcceptedBid?.id,
          loadId: selectedAcceptedBid?.loadId,
          transporterId: user?.id,
          transporterEmail: user?.email,
          truckPlate: dispatchTruck,
          driverName: dispatchDriver,
          driverPhone: driverObj?.phone,
          driverId: driverObj?.rawId || driverObj?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('Dispatch API returned error:', errData);
        Alert.alert('Dispatch Error', errData.error || 'Failed to dispatch shipment. Please try again.');
        await refreshAllData();
        return;
      }

      setShowDispatchModal(false);
      setDispatchTruck('');
      setDispatchDriver('');

      Alert.alert(
        'Fleet Dispatched',
        `Vehicle ${dispatchTruck} and Driver ${dispatchDriver} have been officially assigned and dispatched for shipment ${targetLoadId}. Smart escrow is locked and live GPS tracking is now streaming!`
      );

      // Refresh data so database values sync
      await refreshAllData();
    } catch (err: any) {
      console.warn('Dispatch sync error:', err);
      Alert.alert('Dispatch Network Error', err?.message || 'Unable to connect to server. Please check your network.');
      await refreshAllData();
    }
  };

  const availableTrucksForDriver = fleetList.filter((t) => !t.driver || t.driver === 'Unassigned');

  // Dedicated Gate for Incomplete Profile and Admin Verification Pending ("wedeitm sayehid coplite profile yemile metolt ahun yekeruten formoch molto sicherse admin verfi siyadergwe endigeba")
  if (!isProfileComplete || carrierStatus !== 'VERIFIED') {
    return (
      <CompleteProfileGate
        user={currentUser}
        carrierStatus={carrierStatus}
        onProfileCompleted={(updatedUser) => {
          setCurrentUser(updatedUser);
          setCarrierStatus('PENDING');
          if (user) {
            user.tin = updatedUser.tin;
            user.companyName = updatedUser.companyName;
            user.tradeLicenseNo = updatedUser.tradeLicenseNo;
            user.insuranceDoc = updatedUser.insuranceDoc;
            user.roadworthinessDoc = updatedUser.roadworthinessDoc;
            user.verificationStatus = 'PENDING';
          }
        }}
        onLogout={onLogout}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Modular Top Header */}
      <TransporterHeader
        user={currentUser}
        carrierStatus={carrierStatus}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        unreadCount={unreadNotifCount}
        onLogout={onLogout}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284C7']} />}
      >

        {/* Verification Alert Banner */}
        {carrierStatus === 'PENDING' && (
          <View style={styles.verificationBanner}>
            <Ionicons name="time" size={24} color="#D97706" style={{ marginRight: 6 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.verificationTitle}>Carrier Verification Pending (Live Sync)</Text>
              <Text style={styles.verificationSub}>
                Your compliance credentials (GIT Insurance and FTA Roadworthiness) are currently under review. This page updates automatically in real time the moment an Administrator approves your account.
              </Text>
            </View>
          </View>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewTab
            fleetList={fleetList}
            driversList={driversList}
            loadsList={loadsList}
            submittedBids={submittedBids}
            setActiveTab={setActiveTab}
            setFleetSubTab={setFleetSubTab}
            openAddTruckModal={handleOpenCreateTruck}
            openAddDriverModal={handleOpenCreateDriver}
          />
        )}

        {/* 2. FLEET & DRIVERS TAB */}
        {activeTab === 'fleet' && (
          <FleetTab
            fleetList={fleetList}
            driversList={driversList}
            fleetSubTab={fleetSubTab}
            setFleetSubTab={setFleetSubTab}
            openAddTruckModal={handleOpenCreateTruck}
            openAddDriverModal={handleOpenCreateDriver}
            onEditTruck={handleOpenEditTruck}
            onDeleteTruck={handleDeleteTruck}
            onEditDriver={handleOpenEditDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        )}

        {/* 3. CORRIDOR LOAD BOARD TAB */}
        {activeTab === 'loads' && (
          <LoadsTab
            loadsList={loadsList}
            filteredLoads={filteredLoads}
            directMatchRequests={directMatchRequests}
            submittedBids={submittedBids}
            loadSearchQuery={loadSearchQuery}
            setLoadSearchQuery={setLoadSearchQuery}
            selectedRouteFilter={selectedRouteFilter}
            setSelectedRouteFilter={setSelectedRouteFilter}
            selectedCargoFilter={selectedCargoFilter}
            setSelectedCargoFilter={setSelectedCargoFilter}
            selectedTonnageFilter={selectedTonnageFilter}
            setSelectedTonnageFilter={setSelectedTonnageFilter}
            onSelectLoadForQuote={(item) => {
              setSelectedLoadId(item.id);
              setBidPrice(item.budget ? item.budget.replace(/[^0-9]/g, '') : '');
              setActiveTab('bidding');
            }}
            onRespondDirectOffer={handleRespondDirectOffer}
            onDeleteBid={handleDeleteBid}
            onViewBidInMyBids={(bid) => {
              setSelectedLoadId('');
              setActiveTab('bidding');
            }}
            onRefresh={onRefresh}
            isRefreshing={refreshing}
          />
        )}

        {/* 4. MY BIDS TAB */}
        {activeTab === 'bidding' && (
          <BiddingTab
            loadsList={loadsList}
            selectedLoadId={selectedLoadId}
            setSelectedLoadId={setSelectedLoadId}
            bidPrice={bidPrice}
            setBidPrice={setBidPrice}
            transitHours={transitHours}
            setTransitHours={setTransitHours}
            bidNotes={bidNotes}
            setBidNotes={setBidNotes}
            bidValidityHours={bidValidityHours}
            setBidValidityHours={setBidValidityHours}
            bidSuccess={bidSuccess}
            submittedBids={submittedBids}
            onSubmitBid={handleSubmitBid}
            onOpenDispatchModal={(bid) => {
              if (bid.dispatchedTruck && bid.dispatchedDriver) {
                Alert.alert(
                  'Consignment Dispatched',
                  'This consignment has already been assigned and dispatched. A load cannot be dispatched multiple times.'
                );
                return;
              }
              setSelectedAcceptedBid(bid);
              setShowDispatchModal(true);
            }}
            onOpenRatingModal={(bid) => {
              setSelectedRatingBid(bid);
              setShowRatingModal(true);
            }}
            onDeleteBid={handleDeleteBid}
            onNavigateToLoads={() => {
              setSelectedLoadId('');
              setActiveTab('loads');
            }}
          />
        )}

        {/* 5. EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <EarningsTab user={currentUser || user} submittedBids={submittedBids} />
        )}
      </ScrollView>

      {/* Modular Bottom Tab Navigation Bar */}
      <TransporterBottomNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        submittedBids={submittedBids}
        language={language}
        onSelectBidsTab={() => {
          setSelectedLoadId('');
          setActiveTab('bidding');
        }}
      />

      {/* MODAL 1: Add Vehicle Modal */}
      <AddTruckModal
        visible={showAddTruck}
        onClose={() => {
          setShowAddTruck(false);
          setEditingTruck(null);
        }}
        isEditing={Boolean(editingTruck)}
        truckPlate={truckPlate}
        setTruckPlate={setTruckPlate}
        truckType={truckType}
        setTruckType={setTruckType}
        truckFuelType={truckFuelType}
        setTruckFuelType={setTruckFuelType}
        truckCapacity={truckCapacity}
        setTruckCapacity={setTruckCapacity}
        truckDriver={truckDriver}
        setTruckDriver={setTruckDriver}
        insuranceDoc={insuranceDoc}
        setInsuranceDoc={setInsuranceDoc}
        roadworthinessDoc={roadworthinessDoc}
        setRoadworthinessDoc={setRoadworthinessDoc}
        driversList={driversList}
        showDriverDropdown={showDriverDropdown}
        setShowDriverDropdown={setShowDriverDropdown}
        onSubmit={handleAddTruck}
      />

      {/* MODAL 2: Add Driver Modal */}
      <AddDriverModal
        visible={showAddDriver}
        onClose={() => {
          setShowAddDriver(false);
          setEditingDriver(null);
        }}
        isEditing={Boolean(editingDriver)}
        driverFullName={driverFullName}
        setDriverFullName={setDriverFullName}
        driverPhone={driverPhone}
        setDriverPhone={setDriverPhone}
        driverEmail={driverEmail}
        setDriverEmail={setDriverEmail}
        driverLicense={driverLicense}
        setDriverLicense={setDriverLicense}
        driverCategory={driverCategory}
        setDriverCategory={setDriverCategory}
        driverExperience={driverExperience}
        setDriverExperience={setDriverExperience}
        driverAssignedPlate={driverAssignedPlate}
        setDriverAssignedPlate={setDriverAssignedPlate}
        availableTrucksForDriver={availableTrucksForDriver}
        showTruckDropdown={showTruckDropdown}
        setShowTruckDropdown={setShowTruckDropdown}
        driverPhoto={driverPhoto}
        setDriverPhoto={setDriverPhoto}
        driverLicenseDoc={driverLicenseDoc}
        setDriverLicenseDoc={setDriverLicenseDoc}
        licenseDocName={licenseDocName}
        setLicenseDocName={setLicenseDocName}
        driverTemporaryPassword={driverTemporaryPassword}
        setDriverTemporaryPassword={setDriverTemporaryPassword}
        onGenerateNewPassword={() => setDriverTemporaryPassword(generateRandomPassword())}
        onSubmit={handleAddDriver}
      />

      {/* MODAL 3: Post-Acceptance Dispatch Modal */}
      <DispatchModal
        visible={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        selectedBid={selectedAcceptedBid}
        fleetList={fleetList}
        driversList={driversList}
        dispatchTruck={dispatchTruck}
        setDispatchTruck={setDispatchTruck}
        dispatchDriver={dispatchDriver}
        setDispatchDriver={setDispatchDriver}
        onConfirmDispatch={handleConfirmDispatch}
      />

      {/* MODAL 4: Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        carrierStatus={carrierStatus}
        language={language}
        toggleLanguage={toggleLanguage}
        onLogout={onLogout}
      />

      {/* MODAL 5: Post-Delivery Rating Modal (Bidirectional Reviews) */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        selectedBid={selectedRatingBid}
        currentUser={currentUser}
        onRatingSubmitted={async () => {
          await refreshAllData();
        }}
      />

      {/* MODAL 6: Notifications Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onUnreadChange={(count) => setUnreadNotifCount(count)}
      />
    </SafeAreaView>
  );
};
