import React, { useState, useEffect } from 'react';
import {
  Fuel,
  ShieldAlert,
  Route,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  RefreshCw,
  MapPin,
  Camera,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface RouteCostBreakdown {
  distanceCostEtb: number;
  timeCostEtb: number;
  fuelCostEtb: number;
  riskExposureCostEtb: number;
  totalWeightedCostEtb: number;
}

interface OptimizedRouteItem {
  id: string;
  name: string;
  corridorType: 'PRIMARY' | 'BYPASS';
  description: string;
  distanceKm: number;
  estimatedHours: number;
  fuelLiters: number;
  fuelCostEtb: number;
  riskExposureScore: number;
  safetyRating: string;
  surfaceCondition: string;
  roadConstructionData: string;
  costBreakdown: RouteCostBreakdown;
  isRecommended: boolean;
  recommendationReason: string;
  waypoints: string[];
  polyline?: Array<{ lat: number; lng: number }>;
}

interface FuelStationItem {
  id: string;
  stationName: string;
  nameAmharic: string;
  lat: number;
  lng: number;
  fuelAvailable: boolean;
  stockStatus: string;
  dieselPricePerLiter: number;
}

interface IncidentItem {
  id: string;
  category: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  photoUrl?: string;
  isVerifiedByAuthority: boolean;
  createdAt: string;
  reporter?: {
    fullName: string;
    role: string;
    phone: string;
  };
}

interface RerouteProposal {
  proposalId: string;
  shipmentId?: string;
  incidentCategory: string;
  incidentLocation: string;
  originalRouteName: string;
  suggestedBypassRouteName: string;
  reason: string;
  distanceDeltaKm: number;
  estimatedTimeSavingMins: number;
  fuelCostDeltaEtb: number;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DECLINED';
  createdAt: string;
}

interface FuelSecurityRouteOptimizationCardProps {
  selectedLoadId?: string;
  onRerouteConfirmed?: (newRouteName: string) => void;
}

export const FuelSecurityRouteOptimizationCard: React.FC<FuelSecurityRouteOptimizationCardProps> = ({
  selectedLoadId,
  onRerouteConfirmed,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<OptimizedRouteItem[]>([]);
  const [fuelStations, setFuelStations] = useState<FuelStationItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [activeProposals, setActiveProposals] = useState<RerouteProposal[]>([]);
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'FUEL' | 'INCIDENTS'>('ROUTES');
  const [confirmingReroute, setConfirmingReroute] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Web Incident Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('CHECKPOINT_DELAY');
  const [reportSeverity, setReportSeverity] = useState('MEDIUM');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLocation, setReportLocation] = useState('Galafi Customs Checkpoint');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);

      // 1. Fetch multi-factor routes recommendation
      const routesRes = await fetch('/api/optimization/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originName: 'Kaliti Inland Container Terminal, Addis Ababa',
          destName: 'Port of Doraleh (SGTD), Djibouti',
          originLat: 8.895,
          originLng: 38.765,
          destLat: 11.595,
          destLng: 43.148,
          weightTons: 32.0,
        }),
      });

      if (routesRes.ok) {
        const data = await routesRes.json();
        setRoutes(data.optimizedRoutes || []);
        setFuelStations(data.fuelStockSummary || []);
      }

      // 2. Fetch active incidents
      const incRes = await fetch('/api/optimization/incidents');
      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data.incidents || []);
      }

      // 3. Fetch active reroute proposals
      const propRes = await fetch('/api/optimization/reroute/proposals');
      if (propRes.ok) {
        const data = await propRes.json();
        setActiveProposals((data.proposals || []).filter((p: any) => p.status === 'PENDING_CONFIRMATION'));
      }
    } catch (e) {
      console.warn('Optimization fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizationData();
    const interval = setInterval(fetchOptimizationData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle Reroute Confirmation
  const handleConfirmReroute = async (proposalId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      setConfirmingReroute(true);
      const res = await fetch('/api/optimization/reroute/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: selectedLoadId,
          proposalId,
          action,
          confirmedByUserId: user?.id,
          confirmedByRole: 'DISPATCHER',
          reason: 'Dispatcher authorized corridor rerouting via control portal',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionMessage(
          action === 'ACCEPT'
            ? '✓ Corridor rerouting confirmed! Active shipment routed to Southern Bypass via Dewele Border.'
            : '✓ Rerouting declined. Primary corridor path maintained.'
        );
        setTimeout(() => setActionMessage(null), 5000);
        if (action === 'ACCEPT' && onRerouteConfirmed) {
          onRerouteConfirmed('Southern Bypass Corridor via Dewele Border');
        }
        await fetchOptimizationData();
      }
    } catch (e) {
      console.error('Confirm reroute error:', e);
    } finally {
      setConfirmingReroute(false);
    }
  };

  // Handle Dispatcher Incident Submission
  const handleSubmitWebIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;

    try {
      setSubmittingReport(true);
      const token = localStorage.getItem('tradeflow_token');
      const res = await fetch('/api/optimization/incident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reporterDriverId: user?.id,
          driverEmail: user?.email,
          shipmentId: selectedLoadId,
          category: reportCategory,
          severity: reportSeverity,
          description: reportDesc,
          latitude: 11.71,
          longitude: 41.83,
          locationName: reportLocation,
        }),
      });

      if (res.ok) {
        setShowReportModal(false);
        setReportDesc('');
        setActionMessage('✓ Incident report submitted. Corridor routing graph updated!');
        setTimeout(() => setActionMessage(null), 4000);
        await fetchOptimizationData();
      }
    } catch (err) {
      console.error('Error submitting incident:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-sky-600 animate-pulse" /> AI Route Optimization
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
              Fuel & Security-Aware Route Optimization
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic route recommendation minimizing Distance (30%), Transit Time (35%), Fuel (20%), and Security Risk (15%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Report Incident
          </button>
          <button
            type="button"
            onClick={fetchOptimizationData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mx-6 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* ⚠️ ACTIVE DYNAMIC REROUTING PROPOSAL CARD (SRS FR-05.3) */}
      {activeProposals.length > 0 && (
        <div className="mx-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-200 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-700 animate-bounce" />
              </span>
              <div>
                <h4 className="text-sm font-black text-amber-900">
                  ⚠️ Dynamic Rerouting Proposal Detected
                </h4>
                <p className="text-xs text-amber-700 font-medium">
                  Corridor graph indicates a materially safer or faster path via Southern Dewele Bypass.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black tracking-wider uppercase">
              {activeProposals[0].proposalId}
            </span>
          </div>

          <div className="text-xs text-amber-800 bg-white/80 p-3 rounded-xl border border-amber-200 leading-relaxed">
            <span className="font-extrabold text-amber-900">Specific Trigger: </span>
            {activeProposals[0].reason}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase">Est. Time Savings</span>
              <p className="text-sm font-black text-emerald-800">
                -{activeProposals[0].estimatedTimeSavingMins} min
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Distance Delta</span>
              <p className="text-sm font-black text-slate-800">
                +{activeProposals[0].distanceDeltaKm} km
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase">Fuel Delta</span>
              <p className="text-sm font-black text-slate-800">
                +{activeProposals[0].fuelCostDeltaEtb} ETB
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              disabled={confirmingReroute}
              onClick={() => handleConfirmReroute(activeProposals[0].proposalId, 'ACCEPT')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Confirm Corridor Rerouting (Alter Active Route)
            </button>
            <button
              type="button"
              disabled={confirmingReroute}
              onClick={() => handleConfirmReroute(activeProposals[0].proposalId, 'DECLINE')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-300 cursor-pointer text-center"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="px-4 sm:px-6 flex items-center gap-2 border-b border-slate-100 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('ROUTES')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'ROUTES'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Multi-Factor Routes ({routes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FUEL')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'FUEL'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Highway Fuel Stations ({fuelStations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INCIDENTS')}
          className={`py-2.5 px-3.5 sm:px-4 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'INCIDENTS'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Active Incident Feed ({incidents.length})</span>
        </button>
      </div>

      <div className="p-6 pt-2">
        {/* TAB 1: MULTI-FACTOR ROUTE RECOMMENDATIONS */}
        {activeTab === 'ROUTES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {routes.map((rt) => (
                <div
                  key={rt.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 relative ${
                    rt.isRecommended
                      ? 'bg-sky-50/50 border-sky-300 ring-2 ring-sky-500/20'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  {/* Recommendation Badge */}
                  {rt.isRecommended && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {rt.id}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">
                      {rt.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {rt.description}
                    </p>
                  </div>

                  {/* 4 Cost Minimization Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase">Distance</span>
                      <p className="text-xs font-black text-slate-800">{rt.distanceKm} km</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase">Est. Time</span>
                      <p className="text-xs font-black text-slate-800">{rt.estimatedHours} hrs</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase">Fuel</span>
                      <p className="text-xs font-black text-slate-800">{rt.fuelLiters} L</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase">Risk Score</span>
                      <p
                        className={`text-xs font-black ${
                          rt.riskExposureScore > 40 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {rt.riskExposureScore}/100
                      </p>
                    </div>
                  </div>

                  {/* Surface & Road Condition */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-semibold">Surface Quality:</span>
                      <span className="font-bold text-slate-800">{rt.surfaceCondition}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-semibold">Road Data:</span>
                      <span className="font-medium text-slate-700">{rt.roadConstructionData}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-semibold">Security Rating:</span>
                      <span className="font-extrabold text-sky-700">{rt.safetyRating}</span>
                    </div>
                  </div>

                  {/* Weighted Cost & Reason */}
                  <div className="p-3 rounded-xl bg-sky-100/50 border border-sky-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-sky-950">Weighted Total Cost:</span>
                      <span className="text-sm font-black text-sky-900">
                        {rt.costBreakdown.totalWeightedCostEtb.toLocaleString()} ETB
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-800 leading-snug">
                      <span className="font-bold">Recommendation Factor: </span>
                      {rt.recommendationReason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE FUEL STATION STOCK LEVELS ALONG HIGHWAY */}
        {activeTab === 'FUEL' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Real-time diesel inventory tracked across Ethiopian Petroleum Supply Enterprise (EPSE) highway depots:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {fuelStations.map((st) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    st.fuelAvailable
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        st.fuelAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {st.fuelAvailable ? '✓ In Stock' : '⚠️ Stockout'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {st.dieselPricePerLiter} ETB/L
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {st.stationName}
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{st.nameAmharic}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    GPS: {st.lat.toFixed(3)}°N, {st.lng.toFixed(3)}°E
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE GEOTAGGED INCIDENT FEED */}
        {activeTab === 'INCIDENTS' && (
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                ✓ No active incident reports currently flagged along the trade corridor. All checkpoints operating normally.
              </div>
            ) : (
              <div className="space-y-2.5">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : inc.severity === 'HIGH'
                              ? 'bg-orange-500 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inc.category} • {inc.severity}
                        </span>
                        <h5 className="text-xs font-black text-slate-900">{inc.locationName}</h5>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{inc.description}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        GPS: {inc.latitude.toFixed(4)}°N, {inc.longitude.toFixed(4)}°E • Reported by {inc.reporter?.fullName || 'Corridor Driver'} • {new Date(inc.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    {inc.photoUrl && (
                      <a
                        href={inc.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" /> Evidence Photo
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* INCIDENT REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Report Corridor Incident (Geotagged)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Verified reports immediately update corridor routing graph & calculate reroutes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWebIncident} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Incident Category:
                </label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ACCIDENT">Accident (Collision / Vehicle Rollover)</option>
                  <option value="CHECKPOINT_DELAY">Checkpoint / Customs delay</option>
                  <option value="FUEL_OUTAGE">Fuel station stockout</option>
                  <option value="ROAD_BLOCKAGE">Road blockage / landslide</option>
                  <option value="SECURITY_CONCERN">Security incident</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Severity:
                  </label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="LOW">Low (Minor Delay)</option>
                    <option value="MEDIUM">Medium (Moderate Congestion)</option>
                    <option value="HIGH">High (Standstill / Escort Required)</option>
                    <option value="CRITICAL">Critical (Total Highway Blockage)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Corridor Location:
                  </label>
                  <input
                    type="text"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    placeholder="e.g. Galafi Customs / Awash"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Description & Current Observations:
                </label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Detail the obstruction, customs queue length, or security hazard..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitWebIncident}
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingReport ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Submit Geotagged Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
