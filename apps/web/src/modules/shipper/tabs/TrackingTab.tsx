import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  RefreshCw,
  Clock,
  ShieldCheck,
  Truck,
  MapPin,
  Package,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  CreditCard,
  FileCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { CorridorLiveMap, PostedLoadItem } from '../components/CorridorLiveMap';
import { DeliveredHandoverCard } from '../components/DeliveredHandoverCard';
import { TrackingConsignmentCard } from '../components/TrackingConsignmentCard';
import { calculateCorridorRoadDistanceKm, resolveCorridorCoordinates } from '@tradeflow/shared';

const cleanText = (str?: string) => (str ? String(str).replace(/^`+|`+$/g, '').trim() : '');

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
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [liveData, setLiveData] = useState<any>(null);
  const [allLoads, setAllLoads] = useState<PostedLoadItem[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<PostedLoadItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ACTIVE' | 'DELIVERED'>('ACTIVE');
  const selectedLoadRef = React.useRef<PostedLoadItem | null>(null);
  selectedLoadRef.current = selectedLoad;

  // Fetch real loads & live tracking from backend
  const fetchTrackingData = async () => {
    try {
      setLoading(true);

      // 1. Fetch live tracking info for selected load or overall corridor
      const loadId = selectedLoadRef.current?.id;
      const trackingUrl = loadId
        ? `/api/tracking/live/${loadId}`
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
            loadCode: cleanText(l.title) || 'Freight Consignment',
            title: cleanText(l.title) || 'Freight Consignment',
            origin: cleanText(l.originName) || '',
            originLat: oC.lat,
            originLng: oC.lng,
            destination: cleanText(l.destName) || '',
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

        // Keep current selection if valid and matches current filterMode, or auto-select active in-transit load
        if (selectedLoad) {
          const stillExists = formatted.find((l) => l.id === selectedLoad.id);
          if (stillExists) {
            const isDelivered = stillExists.status === 'DELIVERED';
            if ((filterMode === 'DELIVERED' && isDelivered) || (filterMode === 'ACTIVE' && !isDelivered)) {
              setSelectedLoad(stillExists);
            } else {
              setSelectedLoad(null);
            }
          } else {
            setSelectedLoad(null);
          }
        } else if (formatted.length > 0) {
          const activeInTransit = formatted.find((l) => l.status === 'IN_TRANSIT') || (filterMode === 'ACTIVE' ? formatted[0] : null);
          if (activeInTransit && filterMode === 'ACTIVE') {
            setSelectedLoad(activeInTransit);
          }
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
      return filterMode === 'DELIVERED' ? isDelivered : !isDelivered;
    });
  }, [allLoads, liveData, filterMode]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'AM'
              ? 'የጭነት እና ኮሪደር ቀጥታ መከታተያ'
              : language === 'OM'
              ? 'Hordoffii Fe\'isaa fi Daandii Koriidaraa'
              : 'Live Freight Tracking & Corridor Telematics'}
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastRefreshed && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {language === 'AM' ? 'የመጨረሻ ዝመና' : language === 'OM' ? 'Yeroo Haareffame' : 'Updated'}: {lastRefreshed}
              </span>
            </div>
          )}
        </div>
      </div>

      {!loading && allLoads.length === 0 ? (
        <div className="space-y-6">
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 mx-auto">
              <Truck className="w-8 h-8 text-sky-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {language === 'AM'
                ? 'ለመከታተል የሚገኝ ጭነት የለም'
                : language === 'OM'
                ? 'Fe\'isni Hordofamu Hin Jiru'
                : 'No Consignments Available to Track'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {language === 'AM'
                ? 'በአሁኑ ጊዜ በሲስተሙ ውስጥ ምንም ንቁ ጭነት የለም። ከአጓጓዦች ዋጋ ለመቀበል፣ ሹፌር ለመመደብ እና የጂፒኤስ ጉዞን በቀጥታ ለመከታተል አዲስ ጭነት ይለጥፉ።'
                : language === 'OM'
                ? 'Yeroo ammaa kana sirna keessa fe\'isni hojiirra jiru hin jiru. Fe\'isa haaraa maxxansuun konkolaachisaa ramadaa hordoffii GPS eegalaa.'
                : 'You currently have no active freight loads in the system. Post a new freight consignment to receive bids from verified carriers, assign a driver, and stream live GPS telematics between your origin and destination.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handlePostLoadRedirect}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {language === 'AM'
                    ? 'አዲስ ጭነት መዝግብ'
                    : language === 'OM'
                    ? 'Fe\'isa Haaraa Galchi'
                    : 'Post New Freight Consignment'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>

      {/* FILTER TABS: Active vs Delivered */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterMode('ACTIVE');
              setSelectedLoad(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterMode === 'ACTIVE'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${filterMode === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            <span>
              {language === 'AM'
                ? `በጉዞ ላይ ያሉ ጭነቶች (${counts.active})`
                : language === 'OM'
                ? `Fe'isa Imala Irra Jiru (${counts.active})`
                : `Active Consignments (${counts.active})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterMode('DELIVERED');
              setSelectedLoad(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterMode === 'DELIVERED'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {language === 'AM'
                ? `የደረሱ እና የተጠናቀቁ (${counts.delivered})`
                : language === 'OM'
                ? `Kan Gahaniifi Xumuraman (${counts.delivered})`
                : `Delivered & Completed (${counts.delivered})`}
            </span>
          </button>
        </div>
      </div>

      {/* 2. CONSIGNMENT SELECTOR CARDS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            {filterMode === 'ACTIVE'
              ? (language === 'AM'
                  ? `በጉዞ ላይ ያሉ ጭነቶች (${displayedLoads.length}) — ለመከታተል አንዱን ይምረጡ:`
                  : language === 'OM'
                  ? `Fe'isa Imala Irra Jiru (${displayedLoads.length}) — Hordofuuf Filadhaa:`
                  : `Active Corridor Consignments (${displayedLoads.length}) — Select to Track:`)
              : (language === 'AM'
                  ? `የደረሱ ጭነቶች (${displayedLoads.length}) — የርክክብ ማረጋገጫ ለማየት ይምረጡ:`
                  : language === 'OM'
                  ? `Fe'isa Gahe (${displayedLoads.length}) — e-POD Ilaaluuf Filadhaa:`
                  : `Completed Deliveries (${displayedLoads.length}) — Select to View e-POD:`)}
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            {selectedLoad
              ? (language === 'AM'
                  ? 'ካርታውን ለመዝጋት እንደገና ይጫኑ'
                  : language === 'OM'
                  ? 'Kaartaa cufuuf irra deebi\'aa tuqaa'
                  : 'Click card again to close map')
              : (language === 'AM'
                  ? 'ዝርዝር ለማየት ከታች ያለውን ጭነት ይጫኑ'
                  : language === 'OM'
                  ? 'Ilaaluuf fe\'isa armaan gadii tuqaa'
                  : 'Click any card below to view details')}
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
                ? (language === 'AM'
                    ? 'በጉዞ ላይ ያለ ንቁ ጭነት የለም'
                    : language === 'OM'
                    ? 'Fe\'isni Imala Irra Jiru Hin Jiru'
                    : 'No Active Shipments in Transit')
                : (language === 'AM'
                    ? 'እስካሁን የደረሰ ጭነት የለም'
                    : language === 'OM'
                    ? 'Fe\'isni Gahe Hin Jiru'
                    : 'No Delivered Consignments')}
            </h4>
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


      {/* 4. CONSIGNMENT SECTION FOR THE SELECTED LOAD */}
      {selectedLoad && (() => {
        const isTripDelivered =
          selectedLoad.status === 'DELIVERED' ||
          (liveData?.status === 'DELIVERED' && (liveData?.shipment?.rawLoadId === selectedLoad.id || liveData?.shipment?.id === selectedLoad.id));
        const isTripInTransit =
          !isTripDelivered &&
          (selectedLoad.status === 'IN_TRANSIT' ||
          (liveData?.isInTransit && (liveData?.shipment?.rawLoadId === selectedLoad.id || liveData?.shipment?.id === selectedLoad.id)));

        // Strict guard: In DELIVERED mode, NEVER display active/in-transit tracking!
        if (filterMode === 'DELIVERED' && !isTripDelivered) {
          return null;
        }

        // Strict guard: In ACTIVE mode, NEVER display completed/delivered handover card!
        if (filterMode === 'ACTIVE' && isTripDelivered) {
          return null;
        }

        return (
          <div className="space-y-4 pt-2">
            {/* Active Selection Banner with Close Option (Only for In-Transit Live Map) */}
            {isTripInTransit && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-sky-200 bg-sky-50/80 text-slate-800 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 capitalize">
                      {selectedLoad.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      IN TRANSIT (LIVE)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 font-medium">
                    <span className="text-slate-700">🟢 {selectedLoad.origin.split(',')[0]}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-slate-700">🏁 {selectedLoad.destination.split(',')[0]}</span>
                    <span className="text-sky-800 font-bold">
                      • {selectedLoad.distanceKm ? `${selectedLoad.distanceKm} km Corridor` : 'Active Corridor'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedLoad(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto border border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer"
                >
                  {language === 'AM'
                    ? '✕ ዝጋ / ሌላ ጭነት ምረጥ'
                    : language === 'OM'
                    ? '✕ Cufi / Kan Biroo Filadhu'
                    : '✕ Close / Select Other Consignment'}
                </button>
              </div>
            )}

            {/* A. CASE 1: TRIP IS DELIVERED -> MODULAR COMPLETED SUMMARY */}
            {isTripDelivered ? (
              <DeliveredHandoverCard
                selectedLoad={selectedLoad}
                onPaymentsRedirect={handlePaymentsRedirect}
                onConsignmentsRedirect={handleConsignmentsRedirect}
                onPostLoadRedirect={handlePostLoadRedirect}
                onClose={() => setSelectedLoad(null)}
              />
            ) : isTripInTransit ? (
              /* B. CASE 2: TRIP IS IN TRANSIT -> SHOW REAL LIVE GPS MAP */
              <div className="space-y-4">
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
              /* C. CASE 3: TRIP NOT YET IN TRANSIT -> SHOW AWAITING DEPARTURE STATE (Single Unified Card, No Duplication) */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {selectedLoad.status === 'DISPATCHED' || selectedLoad.status === 'BOOKED'
                            ? (language === 'AM' ? 'ተልኳል • በመነሻ ቦታ ዝግጁ ነው' : language === 'OM' ? 'Ergameera • Bakka Ka\'umsaatti Qophii' : 'Dispatched • Ready at Origin')
                            : selectedLoad.status === 'BIDDING'
                            ? (language === 'AM' ? 'ጨረታ በሂደት ላይ • አጓጓዥ ይጠበቃል' : language === 'OM' ? 'Caalbaasiin Hojiirra Jira' : 'Bidding in Progress • Awaiting Carrier')
                            : (language === 'AM' ? 'ክፍት • አጓጓዥ ማዛመድ ይጠበቃል' : language === 'OM' ? 'Banaa • Geessisaa Eegaa Jira' : 'Open • Awaiting Carrier Match')}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-1 capitalize">
                        {selectedLoad.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        {language === 'AM' ? 'ጠቅላላ የመንገድ ርቀት' : language === 'OM' ? 'Waliigala Fageenya Daandii' : 'Total Route Distance'}
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        {selectedLoad.distanceKm || '--'} km Corridor
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLoad(null)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer shrink-0"
                    >
                      {language === 'AM'
                        ? '✕ ሌላ ጭነት ምረጥ'
                        : language === 'OM'
                        ? '✕ Kan Biroo Filadhu'
                        : '✕ Change Consignment'}
                    </button>
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
                        {language === 'AM' ? 'መነሻ' : language === 'OM' ? 'Ka\'umsa' : 'Origin'}
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
                        {language === 'AM' ? 'መድረሻ' : language === 'OM' ? 'Ga\'umsa' : 'Destination'}
                      </div>
                      <div className="text-xs font-bold text-slate-900">{selectedLoad.destination}</div>
                    </div>
                  </div>
                </div>

                {/* Assigned Driver & Vehicle Details (if dispatched) */}
                {(liveData?.shipment?.driverName || selectedLoad.driverName || selectedLoad.status === 'DISPATCHED' || selectedLoad.status === 'BOOKED') ? (
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase">
                        {language === 'AM' ? 'የተመደበ አሽከርካሪ' : language === 'OM' ? 'Konkolaachisaa Ramadame' : 'Assigned Driver'}
                      </span>
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
                      <span className="text-[10px] font-bold text-sky-700 uppercase">
                        {language === 'AM' ? 'የተመደበ ተሽከርካሪ' : language === 'OM' ? 'Konkolaataa Ramadame' : 'Assigned Vehicle'}
                      </span>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        🚛 {selectedLoad.truckPlate || liveData?.shipment?.truckPlate || 'Heavy Freight Carrier'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 uppercase">
                        {language === 'AM' ? 'የመነሻ ሁኔታ' : language === 'OM' ? 'Haala Ka\'umsaa' : 'Departure Status'}
                      </span>
                      <div className="text-xs font-black text-amber-700 mt-0.5">
                        {language === 'AM'
                          ? '⏳ በመነሻ ቦታ ዝግጁ (ጉዞ ገና አልተጀመረም)'
                          : language === 'OM'
                          ? '⏳ Ka\'umsa Irratti Qophii (Imalli Hin Jalqabamne)'
                          : '⏳ Ready at Origin (Trip Not Started)'}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Big Notice: Live GPS Tracking Locked Until Driver Taps Start Trip */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border border-amber-300/80 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
                    <Radio className="w-3.5 h-3.5 text-amber-600 animate-ping" />
                    {language === 'AM'
                      ? 'የቀጥታ መከታተያ ተቆልፏል (ጉዞ እስኪጀመር)'
                      : language === 'OM'
                      ? 'Hordoffiin Cufameera (Imala Eegaa)'
                      : 'Live Tracking Locked (Awaiting Departure)'}
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    {language === 'AM'
                      ? 'ሹፌሩ ጉዞውን እንደጀመረ የቀጥታ የጂፒኤስ ካርታ ወዲያውኑ ይከፈታል።'
                      : language === 'OM'
                      ? 'Akkuma konkolaachisaan imala jalqabeen kaartaan GPS kallattii battalumatti banama.'
                      : 'Live GPS map will open as soon as the driver starts the trip'}
                  </h4>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </>
  )}
</div>
  );
};
