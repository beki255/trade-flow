import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Radio,
  RefreshCw,
  Clock,
  ShieldCheck,
  Truck,
  MapPin,
  Compass,
  Fuel,
  Package,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Layers,
  CreditCard,
  FileCheck,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { CorridorLiveMap, PostedLoadItem } from '../components/CorridorLiveMap';
import { DeliveredHandoverCard } from '../components/DeliveredHandoverCard';
import { TrackingConsignmentCard } from '../components/TrackingConsignmentCard';
import { FuelSecurityRouteOptimizationCard } from '../components/FuelSecurityRouteOptimizationCard';
import { FuelConsumptionAnalyticsCard } from '../components/FuelConsumptionAnalyticsCard';
import { ConflictZoneAlertsReroutingCard } from '../components/ConflictZoneAlertsReroutingCard';
import { calculateCorridorRoadDistanceKm, resolveCorridorCoordinates } from '@tradeflow/shared';

interface TrackingTabProps {
  onNavigatePostLoad?: () => void;
  onNavigateConsignments?: () => void;
  onNavigatePayments?: () => void;
}

export const TrackingTab: React.FC<TrackingTabProps> = ({
  onNavigatePostLoad,
  onNavigateConsignments,
  onNavigatePayments,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liveData, setLiveData] = useState<any>(null);
  const [allLoads, setAllLoads] = useState<PostedLoadItem[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<PostedLoadItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ACTIVE' | 'DELIVERED' | 'ALL'>('ACTIVE');
  const [trackingSubView, setTrackingSubView] = useState<'MAP' | 'FUEL_ANALYTICS' | 'CONFLICT_ALERTS'>('MAP');

  // Fetch real loads & live tracking from backend
  const fetchTrackingData = async () => {
    try {
      setLoading(true);

      // 1. Fetch live tracking info for selected load or overall corridor
      const trackingUrl = selectedLoad?.id
        ? `/api/tracking/live/${selectedLoad.id}`
        : '/api/tracking/live';
      const trackingRes = await fetch(trackingUrl);
      let liveJson: any = null;
      if (trackingRes.ok) {
        liveJson = await trackingRes.json();
        setLiveData(liveJson);
      }

      // 2. Fetch loads list from portal (isolated by current shipper)
      const shipperQ = user?.id ? `?shipperId=${encodeURIComponent(user.id)}` : '';
      const loadsRes = await fetch(`/api/portal/loads${shipperQ}`);
      if (loadsRes.ok) {
        const loadsData = await loadsRes.json();
        const formatted: PostedLoadItem[] = (loadsData.loads || []).map((l: any) => {
          const oC = resolveCorridorCoordinates(l.originName, l.originLat, l.originLng);
          const dC = resolveCorridorCoordinates(l.destName, l.destLat, l.destLng);
          const distKm = calculateCorridorRoadDistanceKm(l.originName, l.destName, oC.lat, oC.lng, dC.lat, dC.lng);
          return {
            id: l.id,
            loadCode: `TF-SH-${l.id.slice(0, 6).toUpperCase()}`,
            title: l.title || 'Freight Consignment',
            origin: l.originName || '',
            originLat: oC.lat,
            originLng: oC.lng,
            destination: l.destName || '',
            destLat: dC.lat,
            destLng: dC.lng,
            distanceKm: distKm,
            status: l.status || 'OPEN',
            cargoType: l.cargoType || 'GENERAL_FREIGHT',
            weightTons: l.weightTons || 0,
            budgetEtb: l.targetBudgetEtb || 0,
            podRecipientName: l.shipment?.podRecipientName,
            podSignatureUrl: l.shipment?.podSignatureUrl,
            podDeliveredAt: l.shipment?.podDeliveredAt,
            driverName: l.shipment?.driver?.user?.fullName,
            truckPlate: l.shipment?.vehicle?.plateNumber,
          };
        });

        setAllLoads(formatted);

        // Keep current selection if valid, or clear if deleted from database
        if (selectedLoad) {
          const stillExists = formatted.find((l) => l.id === selectedLoad.id);
          if (stillExists) {
            setSelectedLoad(stillExists);
          } else {
            setSelectedLoad(null);
          }
        } else if (formatted.length === 0) {
          setSelectedLoad(null);
        }
      } else if (liveJson?.allLoads?.length > 0) {
        setAllLoads(liveJson.allLoads);
      }
    } catch (e) {
      console.warn('Tracking fetch error:', e);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handlePostLoadRedirect = () => {
    if (onNavigatePostLoad) {
      onNavigatePostLoad();
    } else {
      navigate('/shipper/post-load');
    }
  };

  const handleConsignmentsRedirect = () => {
    if (onNavigateConsignments) {
      onNavigateConsignments();
    } else {
      navigate('/shipper/consignments');
    }
  };

  const handlePaymentsRedirect = () => {
    if (onNavigatePayments) {
      onNavigatePayments();
    } else {
      navigate('/shipper/payments');
    }
  };

  // Counts & Filtered Loads
  const counts = useMemo(() => {
    const delivered = allLoads.filter(
      (l) =>
        l.status === 'DELIVERED' ||
        (liveData?.status === 'DELIVERED' && (liveData?.shipment?.rawLoadId === l.id || liveData?.shipment?.id === l.id))
    ).length;
    const active = allLoads.length - delivered;
    return {
      all: allLoads.length,
      active,
      delivered,
    };
  }, [allLoads, liveData]);

  const displayedLoads = useMemo(() => {
    return allLoads.filter((l) => {
      const isDelivered =
        l.status === 'DELIVERED' ||
        (liveData?.status === 'DELIVERED' && (liveData?.shipment?.rawLoadId === l.id || liveData?.shipment?.id === l.id));
      if (filterMode === 'ACTIVE') return !isDelivered;
      if (filterMode === 'DELIVERED') return isDelivered;
      return true;
    });
  }, [allLoads, liveData, filterMode]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 inline-flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-sky-600 animate-pulse" /> Real-Time Telematics & Fleet Intelligence
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            {trackingSubView === 'MAP'
              ? 'Live Shipment Tracking & Corridor Route Map'
              : trackingSubView === 'FUEL_ANALYTICS'
              ? 'Fleet Fuel Consumption Analytics & Telematics'
              : 'Conflict Zone Alerts & Dynamic Corridor Detours'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {trackingSubView === 'MAP'
              ? 'Select any active consignment below to inspect live vehicle telematics, dynamic ETA, or view completed delivery certificates.'
              : trackingSubView === 'FUEL_ANALYTICS'
              ? 'Trip-by-trip fuel tracking, vehicle and driver efficiency benchmarking, corridor elevation profiles, and data-driven savings.'
              : 'Proactive 25 km geofenced conflict warnings, live security zone database, and automated alternate bypass comparison matrices.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-view toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setTrackingSubView('MAP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                trackingSubView === 'MAP'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>Corridor Map</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackingSubView('FUEL_ANALYTICS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                trackingSubView === 'FUEL_ANALYTICS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              <span>Fuel Analytics</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackingSubView('CONFLICT_ALERTS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                trackingSubView === 'CONFLICT_ALERTS'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Conflict Alerts & Detours</span>
            </button>
          </div>

          {lastRefreshed && (
            <span className="text-[11px] font-semibold text-slate-400">
              Updated: {lastRefreshed}
            </span>
          )}
          <button
            onClick={fetchTrackingData}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Status
          </button>
        </div>
      </div>

      {trackingSubView === 'CONFLICT_ALERTS' ? (
        <ConflictZoneAlertsReroutingCard
          selectedShipmentId={selectedLoad?.id}
          onDetourActivated={() => {
            fetchTrackingData();
            setTrackingSubView('MAP');
          }}
          onRefreshParent={fetchTrackingData}
        />
      ) : trackingSubView === 'FUEL_ANALYTICS' ? (
        <FuelConsumptionAnalyticsCard onRefresh={fetchTrackingData} />
      ) : !loading && allLoads.length === 0 ? (
        <div className="space-y-6">
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mx-auto">
              <Truck className="w-8 h-8 text-sky-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Consignments Available to Track</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              You currently have no active freight loads in the system. Post a new freight consignment to receive bids from verified carriers, assign a driver, and stream live GPS telematics between your origin and destination.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handlePostLoadRedirect}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Post New Freight Consignment
              </button>
              <button
                onClick={() => setTrackingSubView('FUEL_ANALYTICS')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Fuel className="w-4 h-4 text-amber-400" /> Fuel Analytics
              </button>
              <button
                onClick={() => setTrackingSubView('CONFLICT_ALERTS')}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-white" /> Conflict Alerts & Detours
              </button>
            </div>
          </div>

          {/* Corridor Route Optimization & Fuel Telematics Engine */}
          <div className="pt-4">
            <FuelSecurityRouteOptimizationCard
              selectedLoadId={undefined}
              onRerouteConfirmed={() => fetchTrackingData()}
            />
          </div>
        </div>
      ) : (
        <>

      {/* FILTER TABS: Active vs Delivered vs All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterMode === 'ACTIVE'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${filterMode === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            <span>🟢 Active Shipments ({counts.active})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('DELIVERED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterMode === 'DELIVERED'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Delivered & Completed ({counts.delivered})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({counts.all})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          {filterMode === 'ACTIVE' && 'Live GPS stream active for consignments on the road'}
          {filterMode === 'DELIVERED' && 'Historical records with permanent e-POD & TeleBirr settlement'}
          {filterMode === 'ALL' && 'Viewing all active and delivered freight postings'}
        </div>
      </div>

      {/* 2. CONSIGNMENT SELECTOR CARDS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            {filterMode === 'ACTIVE' && `Active Corridor Consignments (${displayedLoads.length}) — Select to Track:`}
            {filterMode === 'DELIVERED' && `Completed Deliveries (${displayedLoads.length}) — Select to View e-POD:`}
            {filterMode === 'ALL' && `All Consignments (${displayedLoads.length}) — Select to Inspect:`}
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            {selectedLoad ? 'Click card again to close map' : 'Click any card below to view details'}
          </span>
        </div>

        {/* EMPTY STATE FOR CURRENT FILTER */}
        {displayedLoads.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-1">
              {filterMode === 'ACTIVE' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Package className="w-6 h-6 text-sky-600" />
              )}
            </div>
            <h4 className="text-sm font-black text-slate-800">
              {filterMode === 'ACTIVE'
                ? 'No Active Shipments in Transit'
                : 'No Delivered Consignments'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {filterMode === 'ACTIVE'
                ? 'All of your registered consignments have safely arrived at their destination and completed e-POD delivery confirmation. Live GPS tracking operates only for active in-transit shipments.'
                : 'No consignments have reached delivery confirmation yet.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {filterMode === 'ACTIVE' && counts.delivered > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterMode('DELIVERED')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> View Completed Deliveries ({counts.delivered})
                </button>
              )}
              <button
                type="button"
                onClick={handlePostLoadRedirect}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Post New Consignment
              </button>
              <button
                type="button"
                onClick={handleConsignmentsRedirect}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" /> My Consignments
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedLoads.map((load) => {
              const isSelected = selectedLoad?.id === load.id;
              const isLoadDelivered =
                load.status === 'DELIVERED' ||
                (liveData?.status === 'DELIVERED' && (liveData?.shipment?.rawLoadId === load.id || liveData?.shipment?.id === load.id));
              const isLoadInTransit =
                !isLoadDelivered &&
                (load.status === 'IN_TRANSIT' ||
                (liveData?.isInTransit && (liveData?.shipment?.rawLoadId === load.id || liveData?.shipment?.id === load.id)));
              const isLoadDispatched =
                !isLoadInTransit && !isLoadDelivered &&
                (load.status === 'DISPATCHED' || load.status === 'BOOKED' || load.status === 'ASSIGNED');

              return (
                <TrackingConsignmentCard
                  key={load.id}
                  load={load}
                  isSelected={isSelected}
                  isLoadDelivered={isLoadDelivered}
                  isLoadInTransit={isLoadInTransit}
                  isLoadDispatched={isLoadDispatched}
                  onSelect={() => {
                    if (isSelected) {
                      setSelectedLoad(null);
                    } else {
                      setSelectedLoad(load);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 3. GUIDANCE STATE WHEN NO LOAD IS CLICKED YET */}
      {!selectedLoad && displayedLoads.length > 0 && (
        <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-1">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <h4 className="text-sm font-black text-slate-800">
            Select a Consignment Above to Inspect
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click on any consignment card above to open live corridor GPS tracking or review completed delivery handover details.
          </p>
        </div>
      )}

      {/* 4. CONSIGNMENT SECTION FOR THE SELECTED LOAD */}
      {selectedLoad && (() => {
        const isTripDelivered =
          selectedLoad.status === 'DELIVERED' ||
          (liveData?.status === 'DELIVERED' && (liveData?.shipment?.rawLoadId === selectedLoad.id || liveData?.shipment?.id === selectedLoad.id));
        const isTripInTransit =
          !isTripDelivered &&
          (selectedLoad.status === 'IN_TRANSIT' ||
          (liveData?.isInTransit && (liveData?.shipment?.rawLoadId === selectedLoad.id || liveData?.shipment?.id === selectedLoad.id)));

        return (
          <div className="space-y-4 pt-2">
            {/* Active Selection Banner with Close Option */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-xs ${
                isTripDelivered
                  ? 'bg-purple-50/80 border-purple-200 text-slate-800'
                  : 'bg-sky-50/80 border-sky-200 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isTripDelivered ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}
                  >
                    {selectedLoad.loadCode}
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    {selectedLoad.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 font-medium">
                  <span className="text-slate-700">🟢 {selectedLoad.origin.split(',')[0]}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-slate-700">🏁 {selectedLoad.destination.split(',')[0]}</span>
                  <span className={isTripDelivered ? 'text-purple-800 font-bold' : 'text-sky-800 font-bold'}>
                    • Status: {isTripDelivered ? 'DELIVERED (e-POD SIGNED ✓)' : isTripInTransit ? 'IN_TRANSIT (LIVE)' : selectedLoad.status}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLoad(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer"
              >
                ✕ Close / Select Other Consignment
              </button>
            </div>

            {/* A. CASE 1: TRIP IS DELIVERED -> MODULAR COMPLETED SUMMARY */}
            {isTripDelivered ? (
              <DeliveredHandoverCard
                selectedLoad={selectedLoad}
                onPaymentsRedirect={handlePaymentsRedirect}
                onConsignmentsRedirect={handleConsignmentsRedirect}
                onPostLoadRedirect={handlePostLoadRedirect}
              />
            ) : isTripInTransit ? (
              /* B. CASE 2: TRIP IS IN TRANSIT -> SHOW REAL LIVE GPS MAP */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <Radio className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-extrabold text-emerald-800">
                      🟢 Live GPS Tracking Stream Active.{' '}
                    </span>
                    The assigned driver has commenced transit. Speed, corridor road distance, and real-time GPS telemetry are streaming directly from the driver mobile app ({selectedLoad.distanceKm} km Corridor).
                  </div>
                </div>

                {/* Real Leaflet Map Component (100% synchronized with Driver) */}
                <CorridorLiveMap
                  shipmentData={{
                    id: selectedLoad.id,
                    loadId: selectedLoad.loadCode,
                    title: selectedLoad.title,
                    origin: selectedLoad.origin,
                    originLat: selectedLoad.originLat,
                    originLng: selectedLoad.originLng,
                    destination: selectedLoad.destination,
                    destLat: selectedLoad.destLat,
                    destLng: selectedLoad.destLng,
                    cargoType: selectedLoad.cargoType,
                    weightTons: selectedLoad.weightTons,
                    status: 'IN_TRANSIT',
                  }}
                  allLoads={displayedLoads}
                  onRefresh={fetchTrackingData}
                />
              </div>
            ) : (
              /* C. CASE 3: TRIP NOT YET IN TRANSIT -> SHOW AWAITING DEPARTURE STATE */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {selectedLoad.status === 'DISPATCHED' || selectedLoad.status === 'BOOKED'
                            ? 'Dispatched • Ready at Origin'
                            : 'Awaiting Carrier Match'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {selectedLoad.loadCode}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {selectedLoad.title}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Total Route Distance</div>
                    <div className="text-sm font-black text-slate-900">
                      {selectedLoad.distanceKm || '--'} km Corridor
                    </div>
                  </div>
                </div>

                {/* Route Points Overview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      A
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Origin
                      </div>
                      <div className="text-xs font-bold text-slate-900">{selectedLoad.origin}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      B
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                        Destination
                      </div>
                      <div className="text-xs font-bold text-slate-900">{selectedLoad.destination}</div>
                    </div>
                  </div>
                </div>

                {/* Assigned Driver & Vehicle Details (if dispatched) */}
                {(liveData?.shipment?.driverName || selectedLoad.driverName || selectedLoad.status === 'DISPATCHED' || selectedLoad.status === 'BOOKED') ? (
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Assigned Driver</span>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        👤 {selectedLoad.driverName || liveData?.shipment?.driverName || 'Verified Fleet Driver'}
                      </div>
                      {liveData?.shipment?.driverPhone && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          📞 {liveData.shipment.driverPhone}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Assigned Vehicle</span>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        🚛 {selectedLoad.truckPlate || liveData?.shipment?.truckPlate || 'Heavy Freight Carrier'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Departure Status</span>
                      <div className="text-xs font-black text-amber-700 mt-0.5">
                        ⏳ Ready at Origin (Trip Not Started)
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Big Notice: Live GPS Tracking Locked Until Driver Taps Start Trip */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-300/80 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
                    <Radio className="w-3.5 h-3.5 text-amber-600 animate-ping" />
                    Live Tracking Locked (Awaiting Departure)
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    Live GPS map will open as soon as the driver starts the trip
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                    The vehicle is currently at origin (<strong>{selectedLoad.origin}</strong>). Once the driver taps <strong>"Start Trip"</strong> on their mobile app, this map will immediately update and stream live corridor telemetry.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Real-Time Telematics Listener Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. FUEL & SECURITY-AWARE ROUTE OPTIMIZATION ENGINE (SRS FR-05) */}
      <div className="pt-2">
        <FuelSecurityRouteOptimizationCard
          selectedLoadId={selectedLoad?.id}
          onRerouteConfirmed={() => fetchTrackingData()}
        />
      </div>
    </>
  )}
</div>
  );
};
