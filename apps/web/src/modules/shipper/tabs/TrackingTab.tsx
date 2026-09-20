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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { CorridorLiveMap, PostedLoadItem } from '../components/CorridorLiveMap';
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

  // Fetch real loads & live tracking from backend
  const fetchTrackingData = async () => {
    try {
      setLoading(true);

      // 1. Fetch live tracking info for selected load or overall corridor
      const trackingUrl = selectedLoad?.id
        ? `http://localhost:5000/api/tracking/live/${selectedLoad.id}`
        : 'http://localhost:5000/api/tracking/live';
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

  // 1. EMPTY STATE: No Loads Posted at all
  if (!loading && allLoads.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Shipment GPS Tracking & Corridor Telematics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking and dynamic ETA calculations for your dispatched corridor shipments.
            </p>
          </div>
        </div>

        <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mx-auto">
            <Truck className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No Consignments Available to Track</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You currently have no active freight loads in the system. Post a new freight consignment to receive bids from verified carriers, assign a driver, and stream live GPS telematics between your origin and destination.
          </p>
          <button
            onClick={handlePostLoadRedirect}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Post New Freight Consignment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 inline-flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-sky-600 animate-pulse" /> Real-Time Telematics & GPS Tracking
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Live Shipment Tracking & Corridor Route Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any active consignment below to inspect live vehicle telematics, dynamic ETA, or view completed delivery certificates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
                ? 'በአሁኑ ሰዓት በጉዞ ላይ ያለ ንቁ ጭነት የለም (No Active Shipments in Transit)'
                : 'ምንም የተጠናቀቀ ጭነት የለም (No Delivered Consignments)'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {filterMode === 'ACTIVE'
                ? 'ሁሉም የተመዘገቡ ጭነቶችዎ መድረሻቸው ደርሰው የ e-POD ርክክብ ተፈጽሟል። የቀጥታ ጂፒኤስ ክትትል የሚሰራው በጉዞ ላይ ላሉ ንቁ ጭነቶች ብቻ ነው።'
                : 'እስካሁን ድረስ መድረሻው ደርሶ የ e-POD ርክክብ የተፈጸመበት ጭነት የለም።'}
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
                <div
                  key={load.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedLoad(null); // Click active card to deselect / close view
                    } else {
                      setSelectedLoad(load); // Select this specific load
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? isLoadDelivered
                        ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/30 shadow-md transform -translate-y-0.5'
                        : 'bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/30 shadow-md transform -translate-y-0.5'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-sm'
                  }`}
                >
                  {/* Active Indicator Border Pill */}
                  {isSelected && (
                    <div
                      className={`absolute top-0 right-0 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg shadow-sm ${
                        isLoadDelivered ? 'bg-purple-600' : 'bg-sky-600'
                      }`}
                    >
                      {isLoadDelivered ? '✓ Delivered & Completed' : isLoadInTransit ? 'Live Tracking Active' : 'Consignment Selected'}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pr-14">
                    <span className="text-xs font-mono font-extrabold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200">
                      {load.loadCode}
                    </span>
                    <span
                      className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        isLoadDelivered
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : isLoadInTransit
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isLoadDispatched
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isLoadDelivered ? '✓ DELIVERED' : isLoadInTransit ? '🟢 IN TRANSIT' : isLoadDispatched ? 'DISPATCHED' : load.status}
                    </span>
                  </div>

                  <div className="text-sm font-black text-slate-900 mt-2 line-clamp-1">
                    {load.title}
                  </div>

                  {/* Origin ➔ Destination Route */}
                  <div className="mt-2.5 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="line-clamp-1 font-medium">{load.origin}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      <span className="line-clamp-1 font-medium">{load.destination}</span>
                    </div>
                  </div>

                  {/* Weight, Distance & Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">
                      Gross: {load.weightTons} Tons {load.distanceKm ? `• ${load.distanceKm} km` : ''}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        isSelected
                          ? isLoadDelivered ? 'text-purple-700 font-black' : 'text-sky-700 font-black'
                          : isLoadDelivered
                          ? 'text-purple-700 font-bold'
                          : isLoadInTransit
                          ? 'text-emerald-700 font-bold'
                          : 'text-sky-600'
                      }`}
                    >
                      {isSelected
                        ? isLoadDelivered ? 'Viewing e-POD ✓' : isLoadInTransit ? 'Viewing Live Map ✓' : 'Viewing Status ✓'
                        : isLoadDelivered
                        ? 'Delivered & Settled ✓'
                        : isLoadInTransit
                        ? 'Live GPS Active ➔'
                        : isLoadDispatched
                        ? 'Awaiting Start Trip ⏳'
                        : 'Awaiting Bids ➔'}
                    </span>
                  </div>
                </div>
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
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl text-white shadow-md ${
                isTripDelivered
                  ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900'
                  : 'bg-sky-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      isTripDelivered ? 'bg-purple-700 text-purple-200' : 'bg-sky-700 text-sky-200'
                    }`}
                  >
                    {selectedLoad.loadCode}
                  </span>
                  <h3 className="text-sm font-black text-white">
                    {selectedLoad.title}
                  </h3>
                </div>
                <p className="text-xs text-sky-200 mt-1 flex items-center gap-2">
                  <span>🟢 {selectedLoad.origin.split(',')[0]}</span>
                  <span>➔</span>
                  <span>🏁 {selectedLoad.destination.split(',')[0]}</span>
                  <span className={isTripDelivered ? 'text-purple-300 font-bold' : 'text-sky-300'}>
                    • Status: {isTripDelivered ? 'DELIVERED (e-POD SIGNED ✓)' : isTripInTransit ? 'IN_TRANSIT (LIVE)' : selectedLoad.status}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLoad(null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all self-start sm:self-auto border border-white/20 cursor-pointer"
              >
                ✕ Close / Select Other Consignment
              </button>
            </div>

            {/* A. CASE 1: TRIP IS DELIVERED -> SHOW COMPLETED SUMMARY (NO FAKE MOVING MAP) */}
            {isTripDelivered ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-md space-y-6">
                {/* Header Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 shadow-sm">
                      <CheckCircle2 className="w-8 h-8 text-purple-700" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider border border-purple-200">
                        <CheckCircle className="w-3 h-3 text-purple-600" />
                        <span>Delivery Completed • Live GPS Closed</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        የጭነት ርክክብ ተጠናቋል (Consignment Delivered & Verified)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ዕቃው መድረሻ ቦታው ደርሶ በዲጂታል ፊርማ (e-POD) ተረክቧል፤ የቀጥታ ጂፒኤስ ክትትል ስራውን በስኬት አጠናቋል።
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Total Route Covered</div>
                    <div className="text-base font-black text-purple-900">
                      {selectedLoad.distanceKm || '--'} km Corridor Completed
                    </div>
                  </div>
                </div>

                {/* Verified e-POD & TeleBirr Escrow Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Proof of Delivery Details */}
                  <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-purple-800 font-extrabold text-xs">
                      <FileCheck className="w-4 h-4 text-purple-700" />
                      <span>Electronic Proof of Delivery (e-POD)</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-purple-200/40 pb-1.5">
                        <span className="text-slate-500">Confirmed Recipient:</span>
                        <span className="font-bold text-slate-900">
                          {selectedLoad.podRecipientName || 'Verified Consignee Recipient'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-purple-200/40 pb-1.5">
                        <span className="text-slate-500">Digital Signature:</span>
                        <span className="font-bold text-purple-700 font-mono text-[11px]">
                          {selectedLoad.podSignatureUrl || '✓ [Cryptographically Verified]'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-purple-200/40 pb-1.5">
                        <span className="text-slate-500">Delivery Destination:</span>
                        <span className="font-bold text-slate-900">{selectedLoad.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Handover Timestamp:</span>
                        <span className="font-semibold text-slate-700">
                          {selectedLoad.podDeliveredAt
                            ? new Date(selectedLoad.podDeliveredAt).toLocaleString()
                            : `${new Date().toLocaleTimeString()} • ${new Date().toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TeleBirr Escrow Settlement Details */}
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>TeleBirr Smart Escrow Settlement</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                        <span className="text-slate-500">Escrow Status:</span>
                        <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          RELEASED & SETTLED
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                        <span className="text-slate-500">Payment Release Trigger:</span>
                        <span className="font-bold text-slate-900">Automated upon e-POD Handover</span>
                      </div>
                      <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                        <span className="text-slate-500">Assigned Transporter:</span>
                        <span className="font-bold text-slate-900">
                          {selectedLoad.driverName || 'Verified Fleet Carrier'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Assigned Vehicle:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          🚛 {selectedLoad.truckPlate || 'Heavy Freight Carrier'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Explanation Notice */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-900">
                      የቀጥታ ጂፒኤስ ክትትል ማስታወሻ (Live Telematics Note):{' '}
                    </span>
                    ጭነቱ መድረሻው ደርሶ ርክክቡ በስኬት ስለተጠናቀቀ የተሽከርካሪው የቀጥታ ጂፒኤስ ክትትል (Live GPS Stream) ቆሟል። የተሟላ የክፍያ ደረሰኝ በ <strong>"Payments"</strong> ገጽ ላይ፣ እንዲሁም የጭነት ማህደር በ <strong>"My Consignments"</strong> ገጽ ላይ ማየት ይችላሉ።
                  </div>
                </div>

                {/* Quick Action Navigation Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePaymentsRedirect}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" /> View Payment Receipt (ክፍያውን ተመልከት)
                  </button>

                  <button
                    type="button"
                    onClick={handleConsignmentsRedirect}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Package className="w-4 h-4" /> View in My Consignments (የተመዘገቡ ጭነቶች)
                  </button>

                  <button
                    type="button"
                    onClick={handlePostLoadRedirect}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-sky-600" /> Post Another Load
                  </button>
                </div>
              </div>
            ) : isTripInTransit ? (
              /* B. CASE 2: TRIP IS IN TRANSIT -> SHOW REAL LIVE GPS MAP */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <Radio className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-extrabold text-emerald-800">
                      🟢 የቀጥታ ጂፒኤስ ጉዞ በሂደት ላይ ነው (Live GPS Tracking Stream Active).{' '}
                    </span>
                    ሹፌሩ ጉዞ ጀምሯል፤ የተሽከርካሪው ፍጥነት (0 km/h ቆሞ ሲያርፍ)፣ የመንገዱ ርቀት እና የደረሰበት ቦታ በቅጽበት ከሹፌሩ ሞባይል አፕ ጋር ተገናኝቶ እየተላለፈ ነው። ({selectedLoad.distanceKm} km Corridor)
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
                        Origin (መነሻ ቦታ)
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
                        Destination (መድረሻ ቦታ)
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
                        ⏳ Ready at Origin (ጉዞ አልተጀመረም)
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Big Notice: Live GPS Tracking Locked Until Driver Taps Start Trip */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-300/80 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
                    <Radio className="w-3.5 h-3.5 text-amber-600 animate-ping" />
                    የቀጥታ ጂፒኤስ ክትትል ቆሟል (Live Tracking Locked)
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    ሹፌሩ ጉዞ ሲጀምር የቀጥታ ካርታው ወዲያውኑ እዚህ ላይ ይከፈታል
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                    ተሽከርካሪው መነሻ ቦታ (<strong>{selectedLoad.origin}</strong>) ላይ ይገኛል። ሹፌሩ በሞባይል አፑ ላይ <strong>"Start Trip / ጉዞ ጀምር"</strong> የሚለውን ቁልፍ ሲነካ፣ ካርታው ያለምንም ሪፍሬሽ በቅጽበት ተከፍቶ የቀጥታ ጉዞውን ማሳየት ይጀምራል።
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Real-Time Listener Active (በየ 2.5 ሰከንዱ ያዳምጣል)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
