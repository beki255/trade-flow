import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';
import { transporterStyles as styles } from './transporterStyles';
import { UserProfile, TruckItem, DriverItem, LoadItem, BidItem, TransporterTabType } from './types';
import { getApiBaseUrl, apiFetch } from '../../utils/api';

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

interface TransporterPortalScreenProps {
  onLogout: () => void;
  user?: UserProfile;
}

export const TransporterPortalScreen: React.FC<TransporterPortalScreenProps> = ({
  onLogout,
  user,
}) => {
  const { language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TransporterTabType>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Verification Status
  const [carrierStatus] = useState<'PENDING' | 'VERIFIED' | 'SUSPENDED'>(
    user?.isVerified
      ? 'VERIFIED'
      : user?.verificationStatus === 'PENDING'
      ? 'PENDING'
      : user?.verificationStatus === 'SUSPENDED'
      ? 'SUSPENDED'
      : 'VERIFIED'
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

  // Add Truck Form State
  const [truckPlate, setTruckPlate] = useState('');
  const [truckType, setTruckType] = useState('Flatbed');
  const [truckCapacity, setTruckCapacity] = useState('28.0');
  const [truckDriver, setTruckDriver] = useState('');
  const [insuranceDoc, setInsuranceDoc] = useState(true);
  const [roadworthinessDoc, setRoadworthinessDoc] = useState(true);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  // Add Driver Form State
  const [driverFullName, setDriverFullName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverCategory, setDriverCategory] = useState('Grade 5 Heavy');
  const [driverExperience, setDriverExperience] = useState('5');
  const [driverAssignedPlate, setDriverAssignedPlate] = useState('');
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);

  // Bidding State
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [transitHours, setTransitHours] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidValidityHours, setBidValidityHours] = useState(24);
  const [bidSuccess, setBidSuccess] = useState('');
  const [biddingSubTab, setBiddingSubTab] = useState<'create' | 'history'>('create');

  // Load Search State
  const [loadSearchQuery, setLoadSearchQuery] = useState('');

  // Dispatch Assignment State
  const [dispatchTruck, setDispatchTruck] = useState('');
  const [dispatchDriver, setDispatchDriver] = useState('');

  // Fetch real corridor loads, vehicles, and drivers
  const refreshAllData = async () => {
    try {
      // 1. Fetch Loads
      const loadsRes = await apiFetch('/api/portal/loads');
      if (loadsRes.ok) {
        const data = await loadsRes.json();
        if (data.loads) {
          setLoadsList(
            data.loads.map((l: any) => ({
              id: l.id ? `LD-${l.id.slice(-4).toUpperCase()}` : 'LD-9901',
              rawId: l.id,
              title: l.title || 'Corridor Consignment',
              origin: l.originName || 'Addis Ababa',
              destination: l.destName || 'Djibouti Port',
              route: `${l.originName || 'Addis Ababa'} ➔ ${l.destName || 'Djibouti Port'}`,
              cargoType: l.cargoType || 'General Freight',
              weight: `${l.weightTons || 28.0} Tons`,
              budget: l.targetBudgetEtb ? `${Number(l.targetBudgetEtb).toLocaleString()} ETB` : '',
              status: l.status || 'OPEN',
            }))
          );
        }
      }

      // 2. Fetch Fleet Vehicles (Strictly Scoped to this Transporter)
      const fleetRes = await apiFetch(
        `/api/portal/vehicles?transporterId=${user?.id || ''}&transporterEmail=${encodeURIComponent(user?.email || '')}`
      );
      if (fleetRes.ok) {
        const data = await fleetRes.json();
        if (data.vehicles && data.vehicles.length > 0) {
          const mappedVehicles = data.vehicles.map((v: any) => ({
            id: v.id,
            rawId: v.id,
            plate: v.plateNumber || 'ET-3-88412',
            type: v.model || 'Heavy Flatbed',
            capacity: `${v.capacityTons || 32.0} Tons`,
            status: v.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'AVAILABLE',
            insuranceStatus: 'VERIFIED',
            driver: v.driver?.fullName || 'Unassigned',
            gpsEnabled: true,
          }));
          setFleetList(mappedVehicles);
        } else {
          setFleetList([]);
        }
      }

      // 3. Fetch Authorized Drivers (Strictly Scoped to this Transporter)
      const driversRes = await apiFetch(
        `/api/portal/drivers?transporterId=${user?.id || ''}&transporterEmail=${encodeURIComponent(user?.email || '')}`
      );
      if (driversRes.ok) {
        const data = await driversRes.json();
        if (data.drivers && data.drivers.length > 0) {
          const mappedDrivers = data.drivers.map((d: any) => ({
            id: d.id,
            rawId: d.id,
            fullName: d.fullName || 'Dawit Hailemariam',
            phone: d.phone || '+251 91 123 4567',
            licenseNumber: d.driverProfile?.driverLicenseNo || d.licenseNumber || 'ETH-DL-984218',
            licenseCategory: d.driverProfile?.licenseClass || 'Grade 5 Heavy',
            experienceYears: `${d.driverProfile?.experienceYears || d.experienceYears || 8}`,
            status: 'ACTIVE',
            assignedTruckPlate: d.driverProfile?.assignedVehicle?.plateNumber || d.assignedVehiclePlate || '',
          }));
          setDriversList(mappedDrivers);
        } else {
          setDriversList([]);
        }
      }

      // 4. Fetch Quotes
      const bidsRes = await apiFetch(
        `/api/portal/bids?transporterId=${user?.id || ''}&transporterEmail=${encodeURIComponent(user?.email || '')}`
      );
      if (bidsRes.ok) {
        const data = await bidsRes.json();
        if (data.bids && data.bids.length > 0) {
          const mappedBids = data.bids.map((b: any) => ({
            id: `BID-${b.id.slice(-4).toUpperCase()}`,
            rawId: b.id,
            loadId: b.loadId ? `LD-${b.loadId.slice(-4).toUpperCase()}` : 'LD-9901',
            loadTitle: b.load?.title || 'Corridor Freight Consignment',
            route: b.load?.originName ? `${b.load.originName} ➔ ${b.load.destName}` : 'Addis Ababa ➔ Djibouti Port',
            weight: `${b.load?.weightTons || 28.0} Tons`,
            price: `${Number(b.proposedRateEtb).toLocaleString()} ETB`,
            hours: `${b.pickupEstimatedHours || 18} Hours Transit`,
            notes: b.proposalNotes || '',
            status: b.status || 'PENDING',
            submittedAt: new Date(b.createdAt).toLocaleTimeString(),
          }));
          setSubmittedBids(mappedBids);
        }
      }
    } catch (err) {
      console.warn('API sync error:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAllData();
    setRefreshing(false);
  };

  // Filtered Loads for Load Board
  const filteredLoads = loadsList.filter((load) => {
    const q = loadSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      load.title?.toLowerCase().includes(q) ||
      load.route?.toLowerCase().includes(q) ||
      load.id?.toLowerCase().includes(q) ||
      load.origin?.toLowerCase().includes(q) ||
      load.destination?.toLowerCase().includes(q) ||
      load.cargoType?.toLowerCase().includes(q)
    );
  });

  // Direct AI Instant Match Requests (Option A from Shipper)
  const directMatchRequests = submittedBids.filter(
    (b) =>
      (b.notes?.includes('DIRECT AI INSTANT MATCH') || b.notes?.includes('Option A')) &&
      b.status === 'PENDING'
  );

  // Add Truck Handler
  const handleAddTruck = async () => {
    if (!truckPlate) {
      Alert.alert('Missing Field', 'Please enter the vehicle license plate number.');
      return;
    }
    const apiUrl = getApiBaseUrl();
    const newTruck: TruckItem = {
      id: `TRK-${Date.now().toString().slice(-4)}`,
      plate: truckPlate.trim().toUpperCase(),
      type: truckType,
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
      await apiFetch('/api/portal/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user?.id,
          transporterEmail: user?.email,
          plateNumber: newTruck.plate,
          vehicleType: newTruck.type,
          capacityTons: parseFloat(truckCapacity) || 30.0,
          driverName: truckDriver,
        }),
      });
    } catch (err) {
      console.warn('Vehicle save error:', err);
    }

    setTruckPlate('');
    setTruckDriver('');
    setShowAddTruck(false);
    Alert.alert('Success', `Vehicle ${newTruck.plate} registered successfully!`);
  };

  // Add Driver Handler (Scoped to Logged-in Transporter)
  const handleAddDriver = async () => {
    if (!driverFullName || !driverPhone) {
      Alert.alert('Missing Fields', 'Please enter the driver legal name and phone number.');
      return;
    }
    const newDriver: DriverItem = {
      id: `DRV-${Date.now().toString().slice(-4)}`,
      fullName: driverFullName.trim(),
      phone: driverPhone.trim(),
      licenseNumber: driverLicense || `ETH-DL-${Math.floor(100000 + Math.random() * 900000)}`,
      licenseCategory: driverCategory,
      experienceYears: driverExperience || '5',
      status: 'ACTIVE',
      assignedTruckPlate: driverAssignedPlate,
    };
    setDriversList((prev) => [newDriver, ...prev]);

    if (driverAssignedPlate) {
      setFleetList((prev) =>
        prev.map((t) => (t.plate === driverAssignedPlate ? { ...t, driver: newDriver.fullName } : t))
      );
    }

    try {
      await apiFetch('/api/portal/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user?.id,
          transporterEmail: user?.email,
          fullName: newDriver.fullName,
          phone: newDriver.phone,
          licenseNo: newDriver.licenseNumber,
          experienceYears: parseInt(driverExperience) || 5,
          assignedVehiclePlate: driverAssignedPlate,
        }),
      });
    } catch (err) {
      console.warn('Driver save error:', err);
    }

    setDriverFullName('');
    setDriverPhone('');
    setDriverLicense('');
    setDriverAssignedPlate('');
    setShowAddDriver(false);
    Alert.alert('Success', `Driver ${newDriver.fullName} registered successfully!`);
  };

  // Submit Bid Handler
  const handleSubmitBid = async () => {
    if (carrierStatus === 'PENDING') {
      Alert.alert(
        '⚠️ Verification Required',
        'Your carrier account is currently PENDING verification. You cannot submit bids until Platform Administrators approve your Trade License.'
      );
      return;
    }

    if (!selectedLoadId || !bidPrice) {
      Alert.alert('Incomplete Quote', 'Please select a corridor load and enter your proposed price.');
      return;
    }

    const selectedLoadObj = loadsList.find((l) => l.id === selectedLoadId || l.rawId === selectedLoadId);

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
      hours: `${transitHours || '18'} Hours Transit`,
      notes: bidNotes || 'GPS live tracking enabled. Ready for immediate corridor dispatch.',
      status: 'PENDING',
      submittedAt: new Date().toLocaleTimeString(),
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
          action === 'ACCEPT' ? '🎉 Match Confirmed!' : 'Offer Declined',
          action === 'ACCEPT'
            ? 'You have officially accepted the AI Instant Match! TeleBirr Escrow is locked.'
            : 'You declined the instant match request.'
        );
      }
    } catch (err) {
      console.warn('Could not respond to direct offer:', err);
    }
  };

  // Post-Acceptance Dispatch Assignment
  const handleConfirmDispatch = async () => {
    if (!dispatchTruck || !dispatchDriver) {
      Alert.alert('Incomplete Assignment', 'Please select both an available vehicle and an authorized driver.');
      return;
    }

    setSubmittedBids((prev) =>
      prev.map((b) =>
        b.id === selectedAcceptedBid?.id
          ? { ...b, dispatchedTruck: dispatchTruck, dispatchedDriver: dispatchDriver }
          : b
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
      await apiFetch('/api/portal/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: selectedAcceptedBid?.rawId || selectedAcceptedBid?.id,
          loadId: selectedAcceptedBid?.loadId,
          transporterId: user?.id,
          transporterEmail: user?.email,
          truckPlate: dispatchTruck,
          driverName: dispatchDriver,
        }),
      });
    } catch (err) {
      console.warn('Dispatch sync error:', err);
    }

    setShowDispatchModal(false);
    setDispatchTruck('');
    setDispatchDriver('');

    Alert.alert(
      '🚀 Fleet Dispatched!',
      `Vehicle ${dispatchTruck} and Driver ${dispatchDriver} have been officially assigned and dispatched for shipment ${targetLoadId}. TeleBirr escrow is locked and live GPS tracking is now streaming!`
    );
  };

  const availableTrucksForDriver = fleetList.filter((t) => !t.driver || t.driver === 'Unassigned');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>TradeFlow Carrier</Text>
          <Text style={styles.companySub}>
            {user?.companyName || 'Mulugeta Cross-Border Freight'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={styles.profileHeaderContainer}
            onPress={() => setShowProfileModal(true)}
          >
            <View style={styles.profileAvatarBox}>
              <Text style={styles.profileAvatarLetter}>
                {user?.companyName ? user.companyName.charAt(0).toUpperCase() : 'T'}
              </Text>
              <View
                style={[
                  styles.avatarStatusDot,
                  carrierStatus === 'VERIFIED'
                    ? { backgroundColor: '#22C55E' }
                    : carrierStatus === 'PENDING'
                    ? { backgroundColor: '#F59E0B' }
                    : { backgroundColor: '#EF4444' },
                ]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerLogoutBtn} onPress={onLogout}>
            <Text style={styles.headerLogoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284C7']} />}
      >
        {/* Verification Alert Banner */}
        {carrierStatus === 'PENDING' && (
          <View style={styles.verificationBanner}>
            <Text style={styles.verificationIcon}>⏳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.verificationTitle}>Carrier Verification Pending</Text>
              <Text style={styles.verificationSub}>
                Your commercial transport license and GIT insurance are currently under review by Platform Compliance. You can browse corridor loads while review is underway.
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
            openAddTruckModal={() => setShowAddTruck(true)}
            openAddDriverModal={() => setShowAddDriver(true)}
          />
        )}

        {/* 2. FLEET & DRIVERS TAB */}
        {activeTab === 'fleet' && (
          <FleetTab
            fleetList={fleetList}
            driversList={driversList}
            openAddTruckModal={() => setShowAddTruck(true)}
            openAddDriverModal={() => setShowAddDriver(true)}
          />
        )}

        {/* 3. CORRIDOR LOAD BOARD TAB */}
        {activeTab === 'loads' && (
          <LoadsTab
            loadsList={loadsList}
            filteredLoads={filteredLoads}
            directMatchRequests={directMatchRequests}
            loadSearchQuery={loadSearchQuery}
            setLoadSearchQuery={setLoadSearchQuery}
            onSelectLoadForQuote={(item) => {
              setSelectedLoadId(item.id);
              setBidPrice(item.budget ? item.budget.replace(/[^0-9]/g, '') : '');
              setBiddingSubTab('create');
              setActiveTab('bidding');
            }}
            onRespondDirectOffer={handleRespondDirectOffer}
          />
        )}

        {/* 4. BIDDING TAB */}
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
            biddingSubTab={biddingSubTab}
            setBiddingSubTab={setBiddingSubTab}
            onSubmitBid={handleSubmitBid}
            onOpenDispatchModal={(bid) => {
              setSelectedAcceptedBid(bid);
              setShowDispatchModal(true);
            }}
          />
        )}

        {/* 5. EARNINGS TAB */}
        {activeTab === 'earnings' && <EarningsTab />}
      </ScrollView>

      {/* Bottom Tab Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name={activeTab === 'overview' ? 'grid' : 'grid-outline'}
            size={20}
            color={activeTab === 'overview' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'overview' && styles.navLabelActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('fleet')}
        >
          <Ionicons
            name={activeTab === 'fleet' ? 'car' : 'car-outline'}
            size={20}
            color={activeTab === 'fleet' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'fleet' && styles.navLabelActive]}>
            Fleet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('loads')}
        >
          <Ionicons
            name={activeTab === 'loads' ? 'cube' : 'cube-outline'}
            size={20}
            color={activeTab === 'loads' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'loads' && styles.navLabelActive]}>
            Loads
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('bidding')}
        >
          <Ionicons
            name={activeTab === 'bidding' ? 'pricetag' : 'pricetag-outline'}
            size={20}
            color={activeTab === 'bidding' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'bidding' && styles.navLabelActive]}>
            Bidding
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('earnings')}
        >
          <Ionicons
            name={activeTab === 'earnings' ? 'wallet' : 'wallet-outline'}
            size={20}
            color={activeTab === 'earnings' ? '#0284C7' : '#94A3B8'}
          />
          <Text style={[styles.navLabel, activeTab === 'earnings' && styles.navLabelActive]}>
            Earnings
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL 1: Add Vehicle Modal */}
      <AddTruckModal
        visible={showAddTruck}
        onClose={() => setShowAddTruck(false)}
        truckPlate={truckPlate}
        setTruckPlate={setTruckPlate}
        truckType={truckType}
        setTruckType={setTruckType}
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
        onClose={() => setShowAddDriver(false)}
        driverFullName={driverFullName}
        setDriverFullName={setDriverFullName}
        driverPhone={driverPhone}
        setDriverPhone={setDriverPhone}
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
        user={user}
        carrierStatus={carrierStatus}
        language={language}
        toggleLanguage={toggleLanguage}
        onLogout={onLogout}
      />
    </SafeAreaView>
  );
};
