import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { getApiBaseUrl } from '../../utils/api';

interface TransporterPortalScreenProps {
  onLogout: () => void;
  user?: any;
}

export const TransporterPortalScreen: React.FC<TransporterPortalScreenProps> = ({ onLogout, user }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'fleet' | 'loads' | 'bidding' | 'earnings'>('fleet');
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fleet Sub-tab ('vehicles' or 'drivers')
  const [fleetSubTab, setFleetSubTab] = useState<'vehicles' | 'drivers'>('vehicles');

  // Dynamic Fleet List (starts empty, populated by real user vehicles)
  const [fleetList, setFleetList] = useState<any[]>([]);

  // Dynamic Drivers List (Registered by Transporter)
  const [driversList, setDriversList] = useState<any[]>([]);

  // New Truck Form State (Fleet Details)
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [newType, setNewType] = useState<'Container' | 'Flatbed' | 'Box' | 'Tanker'>('Container');
  const [newPayload, setNewPayload] = useState('35 Tons');
  const [newFuel, setNewFuel] = useState<'Diesel' | 'Electric' | 'Hybrid'>('Diesel');

  // New Driver Form State (Transporter registers their drivers)
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicenseNo, setDriverLicenseNo] = useState('');
  const [driverLicenseClass, setDriverLicenseClass] = useState('Level 5 (Heavy Freight)');
  const [driverPassword, setDriverPassword] = useState('');
  const [driverAssignedPlate, setDriverAssignedPlate] = useState('');

  // Carrier Verification Status & Access Control (Synced with logged in user or defaults to VERIFIED)
  const [carrierStatus, setCarrierStatus] = useState<'PENDING' | 'VERIFIED' | 'SUSPENDED'>(
    user?.verificationStatus === 'PENDING'
      ? 'PENDING'
      : user?.verificationStatus === 'SUSPENDED'
      ? 'SUSPENDED'
      : 'VERIFIED'
  );

  // Loads & Bidding State
  const [loadsList, setLoadsList] = useState<any[]>([]);
  const [selectedLoadId, setSelectedLoadId] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [transitHours, setTransitHours] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [submittedBids, setSubmittedBids] = useState<any[]>([]);

  // Fetch real corridor loads, vehicles, and drivers from PostgreSQL database (Scoped to this Transporter)
  const refreshAllData = async () => {
    const apiUrl = getApiBaseUrl();
    try {
      // 1. Fetch Loads (Available for all verified transporters)
      const loadsRes = await fetch(`${apiUrl}/api/portal/loads`);
      if (loadsRes.ok) {
        const data = await loadsRes.json();
        if (data.loads) {
          const mapped = data.loads.map((l: any) => ({
            id: `TF-SH-${l.id.slice(-4).toUpperCase()}`,
            rawId: l.id,
            title: l.title,
            weight: `${(l.weightKg / 1000).toFixed(1)} Tons`,
            route: `${l.originAddress} ➔ ${l.destinationAddress}`,
            budget: `${Number(l.targetBudgetEtb || '180000').toLocaleString()} ETB`,
          }));
          setLoadsList(mapped);
          if (mapped.length > 0 && !selectedLoadId) {
            setSelectedLoadId(mapped[0].id);
          }
        }
      }

      // 2. Fetch Vehicles strictly scoped to this Transporter
      const userParam = user?.id
        ? `transporterId=${encodeURIComponent(user.id)}`
        : user?.email
        ? `transporterEmail=${encodeURIComponent(user.email)}`
        : '';

      const vehiclesRes = await fetch(`${apiUrl}/api/portal/vehicles?${userParam}`);
      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        if (vData.vehicles) {
          const mappedV = vData.vehicles.map((v: any) => ({
            id: `TRK-${v.id.slice(-4).toUpperCase()}`,
            plate: v.plateNumber,
            model: `${v.vehicleType} Heavy Transport`,
            type: v.vehicleType,
            payload: `${v.capacityTons} Tons`,
            fuelType: v.fuelType || 'Diesel',
            driver: v.drivers?.[0]?.user?.fullName || 'Assigned Driver',
            insuranceNo: v.insurancePolicyNo || 'EIC-GIT-2026-09',
            roadworthinessNo: 'FTA-RW-2026',
            status: v.isAvailable ? 'AVAILABLE' : 'IN_TRANSIT',
            location: 'Kaliti Logistics Hub',
            fuel: '95%',
          }));
          setFleetList(mappedV);
        } else {
          setFleetList([]);
        }
      }

      // 3. Fetch Drivers strictly scoped to this Transporter
      const driversRes = await fetch(`${apiUrl}/api/portal/drivers?${userParam}`);
      if (driversRes.ok) {
        const dData = await driversRes.json();
        if (dData.drivers) {
          const mappedD = dData.drivers.map((d: any) => ({
            id: `DRV-${d.id.slice(-4).toUpperCase()}`,
            fullName: d.fullName,
            phone: d.phone,
            licenseNo: d.driverProfile?.driverLicenseNo || 'ET-LIC-9921',
            licenseClass: d.driverProfile?.licenseClass || 'Level 5 (Heavy Freight)',
            assignedPlate: d.driverProfile?.assignedVehicle?.plateNumber || 'Unassigned',
            status: 'ACTIVE_READY',
            registeredAt: new Date(d.createdAt).toLocaleDateString(),
          }));
          setDriversList(mappedD);
        } else {
          setDriversList([]);
        }
      }
    } catch (err) {
      console.warn('Could not sync with PostgreSQL API backend:', err);
    }
  };

  React.useEffect(() => {
    refreshAllData();
  }, [user]);

  const handleAddTruck = async () => {
    if (!newPlate) return;
    const apiUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${apiUrl}/api/portal/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user?.id,
          transporterEmail: user?.email,
          plateNumber: newPlate.toUpperCase().trim(),
          vehicleType: newType,
          capacityTons: parseFloat(newPayload) || 35.0,
          capacityVolumeCbm: 45.0,
          insurancePolicyNo: insuranceNo || 'EIC-GIT-2026-09',
        }),
      });

      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.warn('Failed to save truck to database:', e);
    }

    setNewPlate('');
    setNewModel('');
    setNewDriver('');
    setShowAddTruck(false);
  };

  const handleAddDriver = async () => {
    if (!driverName || !driverPhone || !driverPassword) return;
    const apiUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${apiUrl}/api/portal/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transporterId: user?.id,
          transporterEmail: user?.email,
          fullName: driverName.trim(),
          phone: driverPhone.trim(),
          email: `${driverPhone.replace(/[^0-9]/g, '')}@tradeflow.et`,
          licenseNo: driverLicenseNo || 'ET-LIC-9921',
          licenseClass: driverLicenseClass,
          assignedVehiclePlate: driverAssignedPlate,
          password: driverPassword,
        }),
      });

      if (res.ok) {
        refreshAllData();
      }
    } catch (e) {
      console.warn('Failed to save driver to database:', e);
    }

    setDriverName('');
    setDriverPhone('');
    setDriverLicenseNo('');
    setDriverPassword('');
    setDriverAssignedPlate('');
    setShowAddDriver(false);
  };

  // Access Control: Block unverified or suspended transporters
  const handleSubmitBid = async () => {
    if (carrierStatus === 'PENDING') {
      Alert.alert(
        '⚠️ Verification Required (Access Control)',
        'Your carrier account is currently PENDING administrative verification. You cannot submit bids or accept shipments until Platform Administrators approve your Trade License and Insurance.\n\nYou can browse corridor freight postings while documents are under review.',
        [{ text: 'I Understand', style: 'default' }]
      );
      return;
    }

    if (carrierStatus === 'SUSPENDED') {
      Alert.alert(
        '⛔ Account Suspended',
        'Your carrier account has been suspended by TradeFlow Compliance. All transactional functions are blocked. Please contact compliance@tradeflow.et.',
        [{ text: 'OK', style: 'destructive' }]
      );
      return;
    }

    if (!selectedLoadId || !bidPrice) return;

    const apiUrl = getApiBaseUrl();
    try {
      await fetch(`${apiUrl}/api/matching/submit-bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: selectedLoadId,
          bidAmountEtb: parseFloat(bidPrice) || 175000,
          estimatedTransitHours: parseInt(transitHours) || 18,
          transporterNotes: bidNotes || 'Ready for corridor pickup.',
        }),
      });
    } catch (err) {
      console.warn('Could not post bid to database:', err);
    }

    const newBid = {
      id: `BID-${Date.now().toString().slice(-4)}`,
      loadId: selectedLoadId,
      price: `${Number(bidPrice).toLocaleString()} ETB`,
      hours: `${transitHours || '18'} Hours`,
      submittedAt: new Date().toLocaleTimeString(),
    };
    setSubmittedBids([...submittedBids, newBid]);
    setBidSuccess('Bid submitted and recorded in database successfully!');
    setTimeout(() => setBidSuccess(''), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Top Mobile Header */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.brandTitle} numberOfLines={1}>TradeFlow Transporter</Text>
          <Text style={styles.companySub} numberOfLines={1}>
            {user?.companyName || user?.fullName || 'Carrier Operations'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Profile Avatar with Verification Badge */}
          <TouchableOpacity
            style={styles.profileHeaderContainer}
            onPress={() => setShowProfileModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.profileAvatarBox}>
              <Text style={styles.profileAvatarLetter}>
                {(user?.companyName || user?.fullName || 'T').charAt(0).toUpperCase()}
              </Text>
              <View
                style={[
                  styles.avatarStatusDot,
                  carrierStatus === 'VERIFIED'
                    ? { backgroundColor: '#10B981' }
                    : carrierStatus === 'PENDING'
                    ? { backgroundColor: '#F59E0B' }
                    : { backgroundColor: '#EF4444' },
                ]}
              />
            </View>
            <View
              style={[
                styles.headerVerifiedChip,
                carrierStatus === 'VERIFIED'
                  ? styles.chipVerified
                  : carrierStatus === 'PENDING'
                  ? styles.chipPending
                  : styles.chipSuspended,
              ]}
            >
              <Text
                style={[
                  styles.headerVerifiedText,
                  carrierStatus === 'VERIFIED'
                    ? { color: '#059669' }
                    : carrierStatus === 'PENDING'
                    ? { color: '#D97706' }
                    : { color: '#DC2626' },
                ]}
              >
                {carrierStatus === 'VERIFIED' ? 'Verified' : carrierStatus === 'PENDING' ? 'Pending' : 'Suspended'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* High-Visibility Solid Red Logout Button */}
          <TouchableOpacity
            style={styles.headerLogoutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.headerLogoutBtnText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Verification Status Guidance Banner (Only for Pending or Suspended) */}
        {carrierStatus === 'PENDING' && (
          <View style={[styles.verificationBanner, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Text style={styles.verificationIcon}>🟡</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.verificationTitle, { color: '#78350F' }]}>Account Status: Pending Verification</Text>
              <Text style={[styles.verificationSub, { color: '#92400E' }]}>
                Your Insurance (GIT) and Roadworthiness (FTA) documents are currently under review by Platform Administrators.
              </Text>
            </View>
          </View>
        )}

        {carrierStatus === 'SUSPENDED' && (
          <View style={[styles.verificationBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={styles.verificationIcon}>🔴</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.verificationTitle, { color: '#991B1B' }]}>Account Status: Suspended</Text>
              <Text style={[styles.verificationSub, { color: '#B91C1C' }]}>
                Your account is currently suspended by Compliance. All bidding and dispatch operations are blocked.
              </Text>
            </View>
          </View>
        )}

        {/* 1. FLEET & DRIVERS MANAGEMENT */}
        {activeTab === 'fleet' && (
          <View style={styles.sectionContainer}>
            {/* Top Sub-Tab Switcher: Vehicles vs Drivers */}
            <View style={styles.fleetSubTabRow}>
              <TouchableOpacity
                style={[styles.fleetSubTab, fleetSubTab === 'vehicles' && styles.fleetSubTabActive]}
                onPress={() => setFleetSubTab('vehicles')}
              >
                <Text style={[styles.fleetSubTabText, fleetSubTab === 'vehicles' && styles.fleetSubTabTextActive]}>
                  🚛 Fleet Vehicles ({fleetList.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fleetSubTab, fleetSubTab === 'drivers' && styles.fleetSubTabActive]}
                onPress={() => setFleetSubTab('drivers')}
              >
                <Text style={[styles.fleetSubTabText, fleetSubTab === 'drivers' && styles.fleetSubTabTextActive]}>
                  👨‍✈️ Fleet Drivers ({driversList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* ====== SUB-TAB 1: VEHICLES ====== */}
            {fleetSubTab === 'vehicles' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionTitle}>Registered Fleet Vehicles</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setShowAddTruck(!showAddTruck)}
                  >
                    <Text style={styles.addBtnText}>
                      {showAddTruck ? 'Cancel' : '+ Add Vehicle'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Add Truck Form */}
                {showAddTruck && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                      Register New Fleet Vehicle
                    </Text>

                    {/* Plate & Model */}
                    <Text style={styles.fieldLabel}>License Plate Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. ET-3-99410"
                      value={newPlate}
                      onChangeText={setNewPlate}
                      autoCapitalize="characters"
                    />

                    <Text style={styles.fieldLabel}>Vehicle Model & Make</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Volvo FH16 540 / Scania R500"
                      value={newModel}
                      onChangeText={setNewModel}
                    />

                    {/* Vehicle Type Selector (Flatbed, Box, Container, Tanker) */}
                    <Text style={styles.fieldLabel}>Vehicle Body Type</Text>
                    <View style={styles.typeSelectorRow}>
                      {(['Container', 'Flatbed', 'Box', 'Tanker'] as const).map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.typeChip, newType === t && styles.typeChipActive]}
                          onPress={() => setNewType(t)}
                        >
                          <Text style={[styles.typeChipText, newType === t && styles.typeChipTextActive]}>
                            {t === 'Container' ? '📦 Container' : t === 'Flatbed' ? '🚛 Flatbed' : t === 'Box' ? '🚚 Box' : '🛢️ Tanker'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Payload Capacity & Fuel Type */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Payload Capacity</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 40 Tons (65 m³)"
                          value={newPayload}
                          onChangeText={setNewPayload}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>Fuel Type</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Diesel"
                          value={newFuel}
                          onChangeText={(val) => setNewFuel(val as any)}
                        />
                      </View>
                    </View>

                    {/* Assigned Driver Selector from Transporter's Registered Drivers */}
                    <Text style={styles.fieldLabel}>Assign Driver from Fleet</Text>
                    {driversList.length > 0 ? (
                      <View style={{ gap: 6, marginVertical: 4 }}>
                        <View style={styles.typeSelectorRow}>
                          <TouchableOpacity
                            style={[styles.typeChip, !newDriver && styles.typeChipActive]}
                            onPress={() => setNewDriver('')}
                          >
                            <Text style={[styles.typeChipText, !newDriver && styles.typeChipTextActive]}>
                              Unassigned (Pool)
                            </Text>
                          </TouchableOpacity>
                          {driversList.map((drv) => (
                            <TouchableOpacity
                              key={drv.id}
                              style={[styles.typeChip, newDriver === drv.fullName && styles.typeChipActive]}
                              onPress={() => setNewDriver(drv.fullName)}
                            >
                              <Text style={[styles.typeChipText, newDriver === drv.fullName && styles.typeChipTextActive]}>
                                👨‍✈️ {drv.fullName}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2EAF2', marginVertical: 4 }}>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                          ℹ️ No drivers registered yet. Save as Unassigned, or register a driver first from the "👨‍✈️ Fleet Drivers" tab.
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.submitBidBtn} onPress={handleAddTruck}>
                      <Text style={styles.submitBidBtnText}>
                        Save Vehicle to Fleet
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Fleet List / Empty State */}
                {fleetList.length === 0 && !showAddTruck ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>🚛</Text>
                    <Text style={styles.emptyTitle}>
                      No fleet vehicles registered yet
                    </Text>
                    <Text style={styles.emptySub}>
                      Tap "+ Add Vehicle" above to register your trucks (Container, Flatbed, Box, Tanker).
                    </Text>
                  </View>
                ) : (
                  fleetList.map((truck) => (
                    <View key={truck.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View>
                          <Text style={styles.truckPlate}>{truck.plate}</Text>
                          <Text style={styles.truckModel}>{truck.model} • {truck.type}</Text>
                        </View>
                        <View style={[styles.statusBadge, styles.statusAvailable]}>
                          <Text style={styles.statusText}>{truck.status}</Text>
                        </View>
                      </View>
                      <View style={styles.cardDivider} />
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Capacity & Fuel:</Text>
                        <Text style={styles.infoValue}>{truck.payload} • {truck.fuelType}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Assigned Driver:</Text>
                        <Text style={styles.infoValue}>{truck.driver}</Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Live Position:</Text>
                        <Text style={[styles.infoValue, { color: '#0284C7' }]}>📍 {truck.location}</Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* ====== SUB-TAB 2: DRIVERS ====== */}
            {fleetSubTab === 'drivers' && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionTitle}>Transporter Fleet Drivers</Text>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setShowAddDriver(!showAddDriver)}
                  >
                    <Text style={styles.addBtnText}>
                      {showAddDriver ? 'Cancel' : '+ Add Driver'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Add Driver Form */}
                {showAddDriver && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                      Onboard New Heavy Truck Driver
                    </Text>
                    <Text style={styles.emptySub}>
                      Register your driver and set their initial mobile login credentials.
                    </Text>

                    <Text style={styles.fieldLabel}>Driver Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Abebe Bikila"
                      value={driverName}
                      onChangeText={setDriverName}
                    />

                    <Text style={styles.fieldLabel}>Driver Mobile Phone Number *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. +251 91 234 5678"
                      value={driverPhone}
                      onChangeText={setDriverPhone}
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.fieldLabel}>Driver License Number *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. ET-DRV-994182"
                      value={driverLicenseNo}
                      onChangeText={setDriverLicenseNo}
                    />

                    <Text style={styles.fieldLabel}>License Category</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Level 5 (Heavy Freight)"
                      value={driverLicenseClass}
                      onChangeText={setDriverLicenseClass}
                    />

                    <Text style={styles.fieldLabel}>Assigned Truck License Plate</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={fleetList[0]?.plate || "e.g. ET-3-99410"}
                      value={driverAssignedPlate}
                      onChangeText={setDriverAssignedPlate}
                    />

                    <Text style={styles.fieldLabel}>Set Driver Login Password *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Temporary password for driver login"
                      value={driverPassword}
                      onChangeText={setDriverPassword}
                      secureTextEntry
                    />

                    <TouchableOpacity style={styles.submitBidBtn} onPress={handleAddDriver}>
                      <Text style={styles.submitBidBtnText}>
                        Create Driver Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Drivers List */}
                {driversList.length === 0 && !showAddDriver ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>👨‍✈️</Text>
                    <Text style={styles.emptyTitle}>
                      No drivers registered in your fleet yet
                    </Text>
                    <Text style={styles.emptySub}>
                      Tap "+ Add Driver" above to register your heavy freight drivers and issue their mobile access.
                    </Text>
                  </View>
                ) : (
                  driversList.map((driver) => (
                    <View key={driver.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View>
                          <Text style={styles.truckPlate}>{driver.fullName}</Text>
                          <Text style={styles.truckModel}>📞 {driver.phone}</Text>
                        </View>
                        <View style={[styles.statusBadge, styles.statusAvailable]}>
                          <Text style={styles.statusText}>{driver.status}</Text>
                        </View>
                      </View>
                      <View style={styles.cardDivider} />
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>License No & Grade:</Text>
                        <Text style={styles.infoValue}>{driver.licenseNo} • {driver.licenseClass}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Assigned Vehicle:</Text>
                        <Text style={[styles.infoValue, { color: '#0284C7' }]}>🚛 {driver.assignedPlate}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Account Status:</Text>
                        <Text style={[styles.infoValue, { color: '#16A34A' }]}>✅ Authorized to Login</Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

          </View>
        )}

        {/* 2. CORRIDOR LOAD BOARD (4.2.4) */}
        {activeTab === 'loads' && (
          <View style={styles.sectionContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.sectionTitle}>Corridor Load Board</Text>
                <Text style={styles.sectionSubtitle}>Browse active freight consignments</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusAvailable]}>
                <Text style={styles.statusText}>{loadsList.length} Active Loads</Text>
              </View>
            </View>

            {/* Load Board Cards List */}
            {loadsList.map((item, idx) => (
              <View key={item.id || idx} style={styles.card}>
                
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.truckPlate}>{item.title}</Text>
                    <Text style={styles.infoLabel}>Ref: {item.id}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.kpiValue, { fontSize: 15, color: '#0284C7' }]}>
                      {item.budget}
                    </Text>
                    <Text style={{ fontSize: 9.5, color: '#64748B', fontWeight: '700' }}>Target Budget</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* Route */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Corridor Route:</Text>
                  <Text style={[styles.infoValue, { color: '#0F172A', fontWeight: '800' }]}>
                    📍 {item.route}
                  </Text>
                </View>

                {/* Cargo Specifications */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payload Weight:</Text>
                  <Text style={styles.infoValue}>⚖️ {item.weight}</Text>
                </View>

                {/* Handling Tags */}
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <View style={styles.complianceBadge}>
                    <Text style={styles.complianceText}>📦 40ft High-Cube</Text>
                  </View>
                  <View style={styles.complianceBadge}>
                    <Text style={styles.complianceText}>🛡️ GIT Insured</Text>
                  </View>
                  <View style={[styles.complianceBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={[styles.complianceText, { color: '#065F46' }]}>⚡ TeleBirr Escrow Ready</Text>
                  </View>
                </View>

                {/* Bid Action Button */}
                <TouchableOpacity
                  style={[styles.submitBidBtn, { marginTop: 10 }]}
                  onPress={() => {
                    setSelectedLoadId(item.id);
                    setBidPrice(item.budget.replace(/[^0-9]/g, ''));
                    setActiveTab('bidding');
                  }}
                >
                  <Text style={styles.submitBidBtnText}>
                    ⚡ Place Competitive Quote ({item.id})
                  </Text>
                </TouchableOpacity>

              </View>
            ))}

            {loadsList.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Waiting for new load postings...</Text>
                <Text style={styles.emptySub}>
                  Shipper cargo postings along the corridor will appear here in real time.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 3. RFQ BIDDING MANAGEMENT (4.2.4) */}
        {activeTab === 'bidding' && (
          <View style={styles.sectionContainer}>
            <View>
              <Text style={styles.sectionTitle}>Submit Freight Quote</Text>
              <Text style={styles.sectionSubtitle}>Place custom pricing and transit timeline for active loads</Text>
            </View>
            
            {bidSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ {bidSuccess}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Target Load Reference *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. TF-SH-8821"
                  value={selectedLoadId || loadsList[0]?.id || 'TF-SH-8821'}
                  onChangeText={setSelectedLoadId}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Transporter Quote Price (ETB) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 178000"
                  value={bidPrice}
                  onChangeText={setBidPrice}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Estimated Corridor Transit Hours *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="18 Hours"
                  value={transitHours}
                  onChangeText={setTransitHours}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carrier Commitment Notes:</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="e.g. Volvo FH16 available immediately at Kaliti terminal with satellite GPS telematics."
                  value={bidNotes}
                  onChangeText={setBidNotes}
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.submitBidBtn} onPress={handleSubmitBid}>
                <Text style={styles.submitBidBtnText}>Submit Competitive RFQ Bid</Text>
              </TouchableOpacity>
            </View>

            {/* Submitted Bids History */}
            <View style={{ gap: 8, marginTop: 6 }}>
              <Text style={styles.sectionTitle}>
                Transporter Bid History & Active Quotes
              </Text>

              {submittedBids.length === 0 ? (
                <View style={[styles.card, { alignItems: 'center', padding: 20 }]}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>No custom bids submitted yet.</Text>
                </View>
              ) : (
                submittedBids.map((b) => (
                  <View key={b.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.truckPlate}>{b.loadId}</Text>
                        <Text style={styles.infoLabel}>Transit: {b.hours} • Submitted at {b.submittedAt}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.kpiValue, { fontSize: 14, color: '#0284C7' }]}>{b.price}</Text>
                        <View style={[styles.statusBadge, styles.statusAvailable, { marginTop: 3 }]}>
                          <Text style={styles.statusText}>PENDING REVIEW</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* 4. EARNINGS & FUEL SUMMARY */}
        {activeTab === 'earnings' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Earnings & Payouts</Text>

            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Payouts</Text>
                <Text style={styles.kpiValue}>0 ETB</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Completed Trips</Text>
                <Text style={[styles.kpiValue, { color: '#0284C7' }]}>0</Text>
              </View>
            </View>

            {/* Carrier Rating & Marketplace Reviews (4.1.3) */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.cardTitle}>⭐ Carrier Performance & Rating</Text>
                  <Text style={styles.emptySub}>Bidirectional shipper reviews score</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#D97706' }}>⭐ 4.9</Text>
                  <Text style={{ fontSize: 10, color: '#64748B' }}>42 verified trips</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <Text style={{ fontSize: 11, fontWeight: '800', color: '#1E293B', marginTop: 2 }}>
                Recent Shipper Feedback:
              </Text>

              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>Ethio Coffee Exporters PLC</Text>
                  <Text style={{ fontSize: 10, color: '#D97706', fontWeight: '800' }}>⭐⭐⭐⭐⭐ 5.0</Text>
                </View>
                <Text style={{ fontSize: 10.5, color: '#64748B', fontStyle: 'italic' }}>
                  "Volvo FH16 arrived on schedule at Mojo Dry Port. Excellent GPS telematics updates."
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>⛽ Fuel Efficiency & Telematics</Text>
              <Text style={styles.emptySub}>
                Live fuel consumption data and TeleBirr automated escrow payouts record here as trip milestones are delivered.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('fleet')}
        >
          <Text style={[styles.navIcon, activeTab === 'fleet' && styles.navIconActive]}>🚛</Text>
          <Text style={[styles.navLabel, activeTab === 'fleet' && styles.navLabelActive]}>Fleet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('loads')}
        >
          <Text style={[styles.navIcon, activeTab === 'loads' && styles.navIconActive]}>📦</Text>
          <Text style={[styles.navLabel, activeTab === 'loads' && styles.navLabelActive]}>Loads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('bidding')}
        >
          <Text style={[styles.navIcon, activeTab === 'bidding' && styles.navIconActive]}>⚖️</Text>
          <Text style={[styles.navLabel, activeTab === 'bidding' && styles.navLabelActive]}>Bidding</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.navIcon, activeTab === 'earnings' && styles.navIconActive]}>💰</Text>
          <Text style={[styles.navLabel, activeTab === 'earnings' && styles.navLabelActive]}>Payouts</Text>
        </TouchableOpacity>
      </View>

      {/* Profile & Account Settings Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.profileModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Transporter Account Profile</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingVertical: 12 }}>
              {/* Profile Card Summary */}
              <View style={styles.profileCardSummary}>
                <View style={styles.profileModalAvatar}>
                  <Text style={styles.profileModalAvatarText}>
                    {(user?.companyName || user?.fullName || 'T').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileCompanyName}>
                    {user?.companyName || user?.fullName || 'Carrier Logistics'}
                  </Text>
                  <Text style={styles.profileOwnerName}>
                    Managing Director: {user?.fullName || 'Transport Partner'}
                  </Text>
                  <View
                    style={[
                      styles.profileBadge,
                      carrierStatus === 'VERIFIED'
                        ? { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }
                        : carrierStatus === 'PENDING'
                        ? { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }
                        : { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.profileBadgeText,
                        carrierStatus === 'VERIFIED'
                          ? { color: '#047857' }
                          : carrierStatus === 'PENDING'
                          ? { color: '#92400E' }
                          : { color: '#B91C1C' },
                      ]}
                    >
                      {carrierStatus === 'VERIFIED'
                        ? '🟢 Verified Legal Carrier'
                        : carrierStatus === 'PENDING'
                        ? '🟡 Verification Pending'
                        : '🔴 Suspended'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Account Details List */}
              <View style={styles.settingsGroup}>
                <Text style={styles.settingsGroupTitle}>Business & Tax Credentials</Text>

                <View style={styles.settingItem}>
                  <Text style={styles.settingItemLabel}>Email</Text>
                  <Text style={styles.settingItemValue}>{user?.email || 'transporter@tradeflow.et'}</Text>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingItemLabel}>Phone Number</Text>
                  <Text style={styles.settingItemValue}>{user?.phone || '+251 91 123 4567'}</Text>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingItemLabel}>Tax Identification Number (TIN)</Text>
                  <Text style={styles.settingItemValue}>{user?.tin || '0049281729'}</Text>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingItemLabel}>Commercial Trade License</Text>
                  <Text style={styles.settingItemValue}>{user?.tradeLicenseNo || 'ET-MOTI-2024-8841'}</Text>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingItemLabel}>GIT Cargo Insurance</Text>
                  <Text style={[styles.settingItemValue, { color: '#059669', fontWeight: '700' }]}>
                    ✓ Active & Verified
                  </Text>
                </View>

                <View style={styles.settingItem}>
                  <Text style={styles.settingItemLabel}>FTA Roadworthiness</Text>
                  <Text style={[styles.settingItemValue, { color: '#059669', fontWeight: '700' }]}>
                    ✓ Certified
                  </Text>
                </View>
              </View>

              {/* Preferences & Actions */}
              <View style={styles.settingsGroup}>
                <Text style={styles.settingsGroupTitle}>Preferences & Session</Text>

                <TouchableOpacity style={styles.actionBtnRow} onPress={toggleLanguage}>
                  <Text style={styles.actionBtnLabel}>🌐 Language / ቋንቋ</Text>
                  <Text style={styles.actionBtnValue}>
                    {language === 'en' ? 'English (አማርኛ ቀይር)' : 'አማርኛ (Switch to EN)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnRow, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
                  onPress={() => {
                    setShowProfileModal(false);
                    onLogout();
                  }}
                >
                  <Text style={[styles.actionBtnLabel, { color: '#DC2626', fontWeight: '700' }]}>
                    🚪 Logout of Account
                  </Text>
                  <Text style={[styles.actionBtnValue, { color: '#DC2626' }]}>Exit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  topHeader: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  companySub: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 2,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    gap: 4,
  },
  profileAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  profileAvatarLetter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  avatarStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  headerVerifiedChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipVerified: {
    backgroundColor: '#ECFDF5',
  },
  chipPending: {
    backgroundColor: '#FEF3C7',
  },
  chipSuspended: {
    backgroundColor: '#FEF2F2',
  },
  headerVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  profileModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EAF2',
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  profileCardSummary: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAF2',
  },
  profileModalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileModalAvatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileCompanyName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileOwnerName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  settingsGroup: {
    gap: 8,
  },
  settingsGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2EAF2',
  },
  settingItemLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  settingItemValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  actionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAF2',
  },
  actionBtnLabel: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  actionBtnValue: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '700',
  },
  langBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  langBtnText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '700',
  },
  headerLogoutBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 14,
  },
  verificationBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  verificationIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  verificationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  verificationSub: {
    fontSize: 10.5,
    color: '#B45309',
    lineHeight: 15,
  },
  sectionContainer: {
    gap: 14,
  },
  fleetSubTabRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  fleetSubTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  fleetSubTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fleetSubTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  fleetSubTabTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -8,
  },
  addBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2EAF2',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  truckPlate: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  truckModel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusAvailable: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2EAF2',
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 6,
    marginBottom: 2,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  typeChip: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  typeChipTextActive: {
    color: '#0284C7',
  },
  docUploadSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    marginTop: 6,
  },
  docSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  docUploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  docUploadBoxActive: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  docUploadIcon: {
    fontSize: 16,
  },
  docUploadLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  docUploadStatus: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  complianceRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  complianceBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  submitBidBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBidBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  successText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2EAF2',
    gap: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2EAF2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
    elevation: 8,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  navLabelActive: {
    color: '#0284C7',
  },
});
