import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Compass,
  Navigation,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Fuel,
  TrendingDown,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  X,
  FileText,
  PhoneCall,
  User,
  Shield,
  Layers,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskZoneItem {
  id: string;
  name: string;
  description: string;
  rawDescription?: string;
  source: string;
  severity: RiskSeverity;
  badgeLabel: string;
  colorCode: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  isActive: boolean;
  createdAt: string;
}

export interface GeofenceAlertItem {
  id: string;
  shipmentId: string;
  shipmentCode: string;
  cargoTitle: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  riskZoneId: string;
  riskZoneName: string;
  severity: RiskSeverity;
  source: string;
  description: string;
  verifiedTimestamp: string;
  currentCoordinates: { lat: number; lng: number };
  zoneCenterCoordinates: { lat: number; lng: number };
  distanceToPerimeterKm: number;
  distanceToCenterKm: number;
  geofenceStatus: 'INSIDE_PERIMETER' | 'APPROACHING_25KM' | 'EARLY_WARNING_50KM';
  recommendedDetour: string;
  isAcknowledged?: boolean;
}

export interface RouteDetail {
  id: string;
  name: string;
  corridorPath: string;
  distanceKm: number;
  estimatedTransitHours: number;
  fuelConsumptionLiters: number;
  fuelCostEtb: number;
  safetyScore: number;
  riskLevel: string;
  conflictZonesEnRoute: string[];
  estimatedStandstillDelayHours: number;
  status: string;
  waypointsPolyline: { lat: number; lng: number; name: string }[];
}

export interface ComparisonMatrixData {
  primaryRouteId: string;
  bypassRouteId: string;
  distanceDeltaKm: number;
  distanceDeltaLabel: string;
  delayAvoidedHours: number;
  delayAvoidedLabel: string;
  netTimeSavingMinutes: number;
  netTimeSavingLabel: string;
  fuelDeltaLiters: number;
  fuelCostDeltaEtb: number;
  fuelDeltaLabel: string;
  safetyRating: {
    primaryScore: number;
    bypassScore: number;
    safetyRatingDelta: string;
    primaryRatingLabel: string;
    bypassRatingLabel: string;
  };
  recommendationSummary: string;
}

interface ConflictZoneAlertsReroutingCardProps {
  selectedShipmentId?: string;
  onDetourActivated?: (bypassRouteName: string) => void;
  onRefreshParent?: () => void;
}

export const ConflictZoneAlertsReroutingCard: React.FC<ConflictZoneAlertsReroutingCardProps> = ({
  selectedShipmentId,
  onDetourActivated,
  onRefreshParent,
}) => {
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'ZONES_DB' | 'ALTERNATE_ROUTING'>('ALERTS');
  const [riskZones, setRiskZones] = useState<RiskZoneItem[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlertItem[]>([]);
  const [primaryRoute, setPrimaryRoute] = useState<RouteDetail | null>(null);
  const [bypassRoute, setBypassRoute] = useState<RouteDetail | null>(null);
  const [comparisonMatrix, setComparisonMatrix] = useState<ComparisonMatrixData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [zoneSeverityFilter, setZoneSeverityFilter] = useState<string>('ALL');
  const [zoneSearchQuery, setZoneSearchQuery] = useState<string>('');
  const [isApplyingDetour, setIsApplyingDetour] = useState<boolean>(false);

  // New Zone Modal
  const [showAddZoneModal, setShowAddZoneModal] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneSeverity, setNewZoneSeverity] = useState<RiskSeverity>('MEDIUM');
  const [newZoneSource, setNewZoneSource] = useState('Government Security Advisory');
  const [newZoneLat, setNewZoneLat] = useState('11.45');
  const [newZoneLng, setNewZoneLng] = useState('41.35');
  const [newZoneRadius, setNewZoneRadius] = useState('25');
  const [newZoneDescription, setNewZoneDescription] = useState('');
  const [submittingZone, setSubmittingZone] = useState(false);

  // 1. Fetch All Security Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Risk Zones
      const zonesRes = await fetch('/api/security/risk-zones');
      if (zonesRes.ok) {
        const data = await zonesRes.json();
        setRiskZones(data.riskZones || []);
      }

      // Fetch Geofence Alerts
      const alertsRes = await fetch('/api/security/geofence-alerts');
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }

      // Fetch Alternate Routes & Comparison Matrix
      const routesRes = await fetch('/api/security/alternate-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: selectedShipmentId,
          avoidCritical: true,
        }),
      });
      if (routesRes.ok) {
        const data = await routesRes.json();
        setPrimaryRoute(data.primaryRoute || null);
        setBypassRoute(data.bypassRoute || null);
        setComparisonMatrix(data.comparisonMatrix || null);
      }
    } catch (err: any) {
      console.error('Error fetching security and rerouting data:', err);
      setError(err.message || 'Unable to load conflict zone intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, [selectedShipmentId]);

  // Handle Create Risk Zone
  const handleCreateRiskZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZoneLat || !newZoneLng) return;

    try {
      setSubmittingZone(true);
      const res = await fetch('/api/security/risk-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newZoneName,
          description: newZoneDescription,
          source: newZoneSource,
          severity: newZoneSeverity,
          centerLat: parseFloat(newZoneLat),
          centerLng: parseFloat(newZoneLng),
          radiusKm: parseFloat(newZoneRadius) || 20,
        }),
      });

      if (res.ok) {
        setActionSuccessMsg('✓ Security zone registered and broadcasted across corridor network.');
        setShowAddZoneModal(false);
        setNewZoneName('');
        setNewZoneDescription('');
        await fetchData();
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Create risk zone error:', err);
    } finally {
      setSubmittingZone(false);
    }
  };

  // Handle Apply Detour
  const handleApplyBypassDetour = async () => {
    if (!selectedShipmentId && alerts.length > 0) {
      // Use the first active alert shipment
      const targetShipmentId = alerts[0].shipmentId;
      await executeDetour(targetShipmentId);
    } else if (selectedShipmentId) {
      await executeDetour(selectedShipmentId);
    } else {
      setActionSuccessMsg('✓ Alternate corridor bypass approved and published to all active drivers.');
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  const executeDetour = async (shipmentId: string) => {
    try {
      setIsApplyingDetour(true);
      const res = await fetch('/api/security/alternate-routes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId,
          bypassRouteId: 'ROUTE-BYPASS-SOUTH',
          notes: 'Authorized Southern Bypass via Dewele Border to avoid active corridor conflict zone.',
        }),
      });

      if (res.ok) {
        setActionSuccessMsg('✓ Southern Bypass via Dewele successfully activated! Navigation updated.');
        if (onDetourActivated) {
          onDetourActivated('Southern Bypass Corridor via Dewele Border');
        }
        if (onRefreshParent) {
          onRefreshParent();
        }
        setTimeout(() => setActionSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('Apply detour error:', err);
    } finally {
      setIsApplyingDetour(false);
    }
  };

  // Handle Delete Single Zone
  const handleDeleteZone = async (id: string) => {
    try {
      setRiskZones((prev) => prev.filter((z) => z.id !== id));
      await fetch(`/api/security/risk-zones/${id}`, { method: 'DELETE' });
      setActionSuccessMsg(
        language === 'am'
          ? '✓ የስጋት ቀጠናው በተሳካ ሁኔታ ተሰርዟል።'
          : language === 'om'
          ? '✓ Naannoon sodaa milkaa’inaan haqameera.'
          : '✓ Risk zone deleted successfully.'
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
      await fetchData();
    } catch (err) {
      console.error('Delete risk zone error:', err);
    }
  };

  // Handle Clear All Risk Zones
  const handleClearAllZones = async () => {
    try {
      setRiskZones([]);
      await fetch('/api/security/risk-zones', { method: 'DELETE' });
      setActionSuccessMsg(
        language === 'am'
          ? '✓ ሁሉም የስጋት ቀጠናዎች ተሰርዘዋል።'
          : language === 'om'
          ? '✓ Naannoowwan sodaa hundi haqamaniiru.'
          : '✓ All risk zones cleared.'
      );
      setTimeout(() => setActionSuccessMsg(null), 4000);
      await fetchData();
    } catch (err) {
      console.error('Clear all risk zones error:', err);
    }
  };

  // Filtered Risk Zones
  const filteredZones = useMemo(() => {
    return riskZones.filter((z) => {
      const matchSev = zoneSeverityFilter === 'ALL' || z.severity === zoneSeverityFilter;
      const q = zoneSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        z.name.toLowerCase().includes(q) ||
        z.description.toLowerCase().includes(q) ||
        z.source.toLowerCase().includes(q);
      return matchSev && matchSearch;
    });
  }, [riskZones, zoneSeverityFilter, zoneSearchQuery]);

  // Color helper for severity
  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-slate-950 text-white border-slate-800',
          dot: 'bg-rose-500 animate-ping',
          label: language === 'am' ? 'አስጊ / ወሳኝ (ጥቁር)' : language === 'om' ? 'Murteessaa (Gurraacha)' : 'Critical (Black)',
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-600 text-white border-rose-700',
          dot: 'bg-white',
          label: language === 'am' ? 'ከፍተኛ ስጋት (ቀይ)' : language === 'om' ? 'Sodaa Olaanaa (Diimaa)' : 'High (Red)',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500 text-slate-950 border-amber-600',
          dot: 'bg-slate-950',
          label: language === 'am' ? 'መካከለኛ ስጋት (ቢጫ)' : language === 'om' ? 'Giddu-galeessa (Burtukaana)' : 'Medium (Orange)',
        };
      case 'LOW':
        return {
          bg: 'bg-yellow-400 text-slate-900 border-yellow-500',
          dot: 'bg-slate-900',
          label: language === 'am' ? 'ዝቅተኛ ስጋት' : language === 'om' ? 'Sodaa Gadi-aanaa' : 'Low (Yellow)',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          label: severity,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {language === 'am'
                ? 'የደህንነት ስጋት ቀጠናዎች እና ተለዋዋጭ አማራጭ መንገዶች'
                : language === 'om'
                ? 'Akeekkachiisa Naannoo Nageenyaa fi Daandiiwwan Jijjiirraa'
                : 'Conflict Zone Alerts & Dynamic Detours'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {language === 'am'
                ? 'የደህንነት ስጋት ከተመዘገበባቸው የኮሪደሩ መስመሮች በ 25 ኪ.ሜ ርቀት ውስጥ የቀረበ የቀጥታ የጂኦፈንስ ማስጠንቀቂያ፣ ከአማራጭ የመተላለፊያ መንገዶች እና የደህንነት ንጽጽር ማትሪክስ ጋር።'
                : language === 'om'
                ? 'Akeekkachiisa geofence daandii nageenyaa irraa km 25 keessatti, daandii filatamaa fi madaallii nageenyaa waliin.'
                : 'Real-time geofenced warnings within 25 km of flagged security corridors, paired with automated alternate bypass routing and safety comparison matrices.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                {language === 'am' ? 'ንቁ የኮሪደር ማስጠንቀቂያዎች' : language === 'om' ? 'Akeekkachiisa Koriidarii Yeroo Ammaa' : 'Active Corridor Alerts'}
              </span>
              <span className="text-sm font-extrabold text-rose-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {alerts.length} {language === 'am' ? 'በጉዞ ላይ ያሉ ማስጠንቀቂያዎች' : language === 'om' ? 'Akeekkachiisa Imalaa' : 'In-Transit Warnings'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ALERTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>
              {language === 'am'
                ? `የቅድመ-ማስጠንቀቂያ ጂኦፈንስ ጥቆማዎች (${alerts.length})`
                : language === 'om'
                ? `Akeekkachiisa Geofence (${alerts.length})`
                : `Proactive Geofence Alerts (${alerts.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ZONES_DB')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ZONES_DB'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {language === 'am'
                ? `የስጋት ቀጠናዎች ማከማቻ (${riskZones.length})`
                : language === 'om'
                ? `Kuusaa Naannoo Sodaa (${riskZones.length})`
                : `Risk Zone Database (${riskZones.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ALTERNATE_ROUTING')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ALTERNATE_ROUTING'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-500" />
            <span>
              {language === 'am'
                ? 'አማራጭ መስመር እና የንጽጽር ማትሪክስ'
                : language === 'om'
                ? 'Daandii Filatamaa fi Madaallii'
                : 'Alternate Routing & Matrix'}
            </span>
          </button>
        </div>

        {activeTab === 'ZONES_DB' && (
          <button
            onClick={() => setShowAddZoneModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-red-400" />
            <span>{language === 'am' ? 'የደህንነት ቀጠና መዝግብ' : language === 'om' ? 'Naannoo Sodaa Galmeessi' : 'Flag Security Zone'}</span>
          </button>
        )}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: PROACTIVE GEOFENCE ALERTS */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>
                    {language === 'am'
                      ? 'የቀረቡ የኮሪደር ጂኦፈንስ ማስጠንቀቂያዎች (< 25 ኪ.ሜ)'
                      : language === 'om'
                      ? 'Akeekkachiisa Koriidarii Dhihaatu (< km 25)'
                      : 'Approaching Corridor Geofence Warnings (< 25 km)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'am'
                    ? 'በኮሪደሩ ላይ ወዳሉ የስጋት ቀጠናዎች ለሚቀርቡ አሽከርካሪዎች እና ላኪዎች የሚላኩ ንቁ የቅድመ-ጥንቃቄ ማስጠንቀቂያዎች።'
                    : language === 'om'
                    ? 'Akeekkachiisa konkolaachistootaa fi ergitoota gara naannoo sodaa dhihaataniif ergamu.'
                    : 'Proactive warnings pushed to drivers and dispatchers approaching conflict zones along the corridor.'}
                </p>
              </div>
              <span className="text-xs font-extrabold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-xl">
                {language === 'am'
                  ? '25 ኪ.ሜ ተለዋዋጭ ጂኦፈንስ በርቷል'
                  : language === 'om'
                  ? 'Geofence Jijjiiramaa km 25 Hojiirra Jira'
                  : '25 km Dynamic Geofence Active'}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800">
                    {language === 'am'
                      ? 'ኮሪደሩ ደህንነቱ የተጠበቀ ነው — ምንም የጂኦፈንስ ጥሰት አልተመዘገበም'
                      : language === 'om'
                      ? 'Koriidariin Nageenya Qaba — Sarbamiinsi Geofence Hin Jiru'
                      : 'Corridor Safe — No Imminent Geofence Breaches'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {language === 'am'
                      ? 'ሁሉም በመጓጓዝ ላይ ያሉ ጭነቶች ከስጋት ቀጠናዎች ከ 25 ኪ.ሜ ገደብ ውጪ በሰላም እየተጓዙ ይገኛሉ።'
                      : language === 'om'
                      ? 'Fe’iinsi hundi naannoo sodaa qaban irraa fageenya km 25 ol irratti imalaa jiru.'
                      : 'All active shipments are currently operating outside the 25 km proximity threshold of flagged security zones.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const sevStyle = getSeverityBadge(alert.severity);

                  return (
                    <div
                      key={alert.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-red-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${sevStyle.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sevStyle.dot}`} />
                            {sevStyle.label}
                          </span>
                          <span className="text-xs font-black text-slate-900">{alert.riskZoneName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-red-700 bg-red-100/80 px-2.5 py-1 rounded-lg">
                            ⚠️ {alert.distanceToPerimeterKm} {language === 'am' ? 'ኪ.ሜ ወደ ስጋት ቀጠናው ዙሪያ' : language === 'om' ? 'km gara daangaa sodaa' : 'km to Hazard Perimeter'}
                          </span>
                        </div>
                      </div>

                      {/* Warning Detail Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-black text-slate-400 uppercase block">
                            {language === 'am' ? 'በጉዞ ላይ ያለ ተሽከርካሪ እና አሽከርካሪ' : language === 'om' ? 'Konkolaataa fi Konkolaachisaa Imala Irra Jiru' : 'Vehicle & Driver In Transit'}
                          </span>
                          <div className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{alert.vehiclePlate}</span>
                            <span className="text-slate-400">•</span>
                            <span>{alert.shipmentCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{alert.driverName} ({alert.driverPhone})</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-black text-slate-400 uppercase block">
                            {language === 'am' ? 'የተረጋገጠ የስለላ / የመረጃ ምንጭ' : language === 'om' ? 'Madda Odeeffannoo Mirkanaa’e' : 'Verified Intelligence Source'}
                          </span>
                          <div className="font-bold text-slate-800 mt-0.5">{alert.source}</div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{language === 'am' ? 'የተረጋገጠበት:' : language === 'om' ? 'Mirkanaa’e:' : 'Verified:'} {new Date(alert.verifiedTimestamp).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                          <span className="text-[10px] font-black text-slate-400 uppercase block">
                            {language === 'am' ? 'የስጋቱ ዝርዝር መግለጫ' : language === 'om' ? 'Ibsa Balaa / Sodaa' : 'Hazard Description'}
                          </span>
                          <p className="text-slate-700 font-medium mt-0.5 line-clamp-2">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      {/* Recommended Detour Box */}
                      <div className="p-3.5 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Compass className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-red-900">
                              {language === 'am' ? 'የሚመከር አማራጭ መስመር:' : language === 'om' ? 'Daandii Jijjiirraa Filatame:' : 'Recommended Detour:'}
                            </span>{' '}
                            <span className="text-slate-800 font-medium">{alert.recommendedDetour}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('ALTERNATE_ROUTING')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{language === 'am' ? 'የአማራጭ መንገድ ማትሪክስን መርምር' : language === 'om' ? 'Madaallii Daandii Qoradhu' : 'Inspect Rerouting Matrix'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RISK ZONE DATABASE */}
      {activeTab === 'ZONES_DB' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'am'
                    ? 'የተሟላ የኮሪደር ስጋት ቀጠናዎች ማከማቻ'
                    : language === 'om'
                    ? 'Kuusaa Naannoo Sodaa Koriidarii Yeroo Hunda Qophaa’e'
                    : 'Continuously Maintained Corridor Risk Zone Database'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'am'
                    ? 'ከመንግስት የጸጥታ መረጃዎች፣ ከአሽከርካሪዎች ማህበራዊ ጥቆማዎች እና ከባለስልጣናት የክስተት ሪፖርቶች የተጠናቀረ።'
                    : language === 'om'
                    ? 'Gorsa mootummaa, odeeffannoo konkolaachistootaa fi gabaasa bulchiinsaa irraa kan walitti qabame.'
                    : 'Sourced from Government Security Advisories, Verified Driver Crowdsourcing, and Authority Incident Reports.'}
                </p>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={language === 'am' ? 'ቀጠና፣ ኮሪደር ፈልግ...' : language === 'om' ? 'Naannoo, koriidarii barbaadi...' : 'Search zone, corridor...'}
                    value={zoneSearchQuery}
                    onChange={(e) => setZoneSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 w-44"
                  />
                </div>

                <select
                  value={zoneSeverityFilter}
                  onChange={(e) => setZoneSeverityFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">{language === 'am' ? 'ሁሉም የስጋት ደረጃዎች' : language === 'om' ? 'Sadarkaa Sodaa Hunda' : 'All Severities'}</option>
                  <option value="CRITICAL">{language === 'am' ? 'አስጊ / ወሳኝ (ጥቁር)' : language === 'om' ? 'Murteessaa (Gurraacha)' : 'Critical (Black)'}</option>
                  <option value="HIGH">{language === 'am' ? 'ከፍተኛ (ቀይ)' : language === 'om' ? 'Olaanaa (Diimaa)' : 'High (Red)'}</option>
                  <option value="MEDIUM">{language === 'am' ? 'መካከለኛ (ቢጫ)' : language === 'om' ? 'Giddu-galeessa (Burtukaana)' : 'Medium (Orange)'}</option>
                  <option value="LOW">{language === 'am' ? 'ዝቅተኛ' : language === 'om' ? 'Gadi-aanaa' : 'Low (Yellow)'}</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'አዲስ ቀጠና መዝግብ' : language === 'om' ? 'Qophii Haaraa' : 'Add Risk Zone'}</span>
                </button>

                {riskZones.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllZones}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition flex items-center gap-1 border border-slate-200 hover:border-rose-200 cursor-pointer"
                    title={language === 'am' ? 'ሁሉንም የስጋት ቀጠናዎች አጥፋ' : language === 'om' ? 'Hunda Haqi' : 'Clear All Risk Zones'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'ሁሉንም አጥፋ' : language === 'om' ? 'Hunda Haqi' : 'Clear All'}</span>
                  </button>
                )}
              </div>
            </div>

            {filteredZones.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-black text-slate-900">
                    {language === 'am'
                      ? 'ምንም የተመዘገበ የስጋት ቀጠና የለም'
                      : language === 'om'
                      ? 'Naannoon sodaa galmaa\'e hin jiru'
                      : 'No Active Risk Zones in Database'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === 'am'
                      ? 'በኮሪደሩ ላይ ሁሉም መስመሮች ክፍት እና ደህንነታቸው የተጠበቁ ናቸው። አዲስ የጸጥታ ወይም የመንገድ ስጋት ካለ ከላይ ያለውን «አዲስ ቀጠና መዝግብ» የሚለውን አዝራር በመጫን መመዝገብ ይችላሉ።'
                      : language === 'om'
                      ? 'Daandiiwwan kooridoorii hundi banaa fi nageenyi isaanii kan eegameedha. Sodaa haaraa yoo qabaattan qabduu armaan olii fayyadamaa.'
                      : 'All corridor segments are currently verified clear. Use "Add Risk Zone" to register a verified security checkpoint or road hazard.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'አዲስ የስጋት ቀጠና መዝግብ' : language === 'om' ? 'Qophii Haaraa Galmeessi' : 'Register Security Zone'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredZones.map((zone) => {
                  const badge = getSeverityBadge(zone.severity);

                  return (
                    <div
                      key={zone.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {language === 'am' ? 'ስፋት' : language === 'om' ? 'Raadiyaasii' : 'Radius'}: {zone.radiusKm} {language === 'am' ? 'ኪ.ሜ' : 'km'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteZone(zone.id)}
                              title={language === 'am' ? 'ይህንን ቀጠና ሰርዝ' : language === 'om' ? 'Haqi' : 'Delete Zone'}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 leading-snug">{zone.name}</h4>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {zone.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span className="font-bold">{language === 'am' ? 'የመረጃ ምንጭ:' : language === 'om' ? 'Madda Odeeffannoo:' : 'Intelligence Source:'}</span>
                          <span className="font-extrabold text-slate-800">{zone.source}</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span>GPS: {zone.centerLat.toFixed(3)}, {zone.centerLng.toFixed(3)}</span>
                          <span className="text-emerald-700 font-bold">● {language === 'am' ? 'ንቁ ጂኦፈንስ ቁጥጥር' : language === 'om' ? 'Hordoffii Geofence Hojiirra Jira' : 'Active Geofence Monitor'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ALTERNATE ROUTING & COMPARISON MATRIX */}
      {activeTab === 'ALTERNATE_ROUTING' && comparisonMatrix && primaryRoute && bypassRoute && (
        <div className="space-y-6">
          {/* Comparison Matrix Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                {language === 'am' ? 'አውቶሜትድ የመንገድ ማስተካከያ ሞተር' : language === 'om' ? 'Mootora Jijjiirraa Daandii Ofta’aa' : 'Automated Corridor Rerouting Engine'}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {language === 'am'
                  ? 'የመንገድ ደህንነት እና የወጪ ንጽጽር ማትሪክስ'
                  : language === 'om'
                  ? 'Madaallii Nageenya Daandii fi Baasii'
                  : 'Route Safety & Cost Comparison Matrix'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'am'
                  ? 'የዋናውን ሰሜናዊ አውራ ጎዳና (A-1) ስጋት ያለበትን መስመር ከአማራጭ ደቡባዊ ማለፊያ መስመር ጋር ጎን ለጎን ያነጻጽራል።'
                  : language === 'om'
                  ? 'Daandii kaabaa isa duraa fi daandii filatamaa kibbaa sodaa malee jiru wal-bira qabee madaala.'
                  : 'Side-by-side evaluation of the primary northern corridor vs the calculated southern bypass avoiding high-risk conflict zones.'}
              </p>
            </div>

            {/* Matrix Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black">
                    <th className="py-3 px-4 w-1/4">
                      {language === 'am' ? 'መለኪያ መለኪያ' : language === 'om' ? 'Ulaagaa Madaallii' : 'Metric Parameter'}
                    </th>
                    <th className="py-3 px-4 w-3/8 bg-rose-50/50 rounded-t-xl text-rose-900">
                      {language === 'am' ? 'ዋና አውራ ጎዳና (A-1)' : language === 'om' ? 'Daandii Guddaa Duraa (A-1)' : 'Primary Highway Route (A-1)'}
                    </th>
                    <th className="py-3 px-4 w-3/8 bg-emerald-50/60 rounded-t-xl text-emerald-900">
                      {language === 'am' ? 'ደቡባዊ አማራጭ መስመር (በደወሌ በኩል)' : language === 'om' ? 'Daandii Filatamaa Kibbaa (Deweleen)' : 'Southern Bypass Detour (via Dewele)'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {/* Route Corridor Path */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'am' ? 'የኮሪደር ጉዞ መስመር' : language === 'om' ? 'Daandii Koriidarii' : 'Corridor Route Path'}
                    </td>
                    <td className="py-3.5 px-4 bg-rose-50/20 text-slate-800">
                      {primaryRoute.corridorPath}
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/30 font-bold text-slate-900">
                      {bypassRoute.corridorPath}
                    </td>
                  </tr>

                  {/* Distance */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'am' ? 'ርቀት (ኪ.ሜ)' : language === 'om' ? 'Fageenya (km)' : 'Distance (km)'}
                    </td>
                    <td className="py-3.5 px-4 bg-rose-50/20">
                      <span className="font-extrabold text-slate-900 text-sm">{primaryRoute.distanceKm} {language === 'am' ? 'ኪ.ሜ' : 'km'}</span>
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/30">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{bypassRoute.distanceKm} {language === 'am' ? 'ኪ.ሜ' : 'km'}</span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {comparisonMatrix.distanceDeltaLabel}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Estimated Standstill Delay */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'am' ? 'የስጋት / ፍተሻ መዘግየቶች' : language === 'om' ? 'Turtii Qorannoo fi Sodaa' : 'Conflict / Checkpoint Delays'}
                    </td>
                    <td className="py-3.5 px-4 bg-rose-50/20 text-rose-700 font-bold">
                      ⚠️ ~{primaryRoute.estimatedStandstillDelayHours} {language === 'am' ? 'ሰዓታት መቆሚያ መዘግየት' : language === 'om' ? 'sa’aatiiwwan turtii' : 'hrs standstill hold'}
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/30 text-emerald-700 font-black">
                      ✓ {isAm ? `${comparisonMatrix.delayAvoidedHours} ሰዓታት የግጭት መቆሚያ መዘግየት ዳነ` : isOm ? `sa’aatii ${comparisonMatrix.delayAvoidedHours} turtii balaa irraa oole` : comparisonMatrix.delayAvoidedLabel}
                    </td>
                  </tr>

                  {/* Net Time Saved */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'am' ? 'የተጣራ የጉዞ ጊዜ ልዩነት' : language === 'om' ? 'Garaagarummaa Yeroo Imalaa' : 'Net Transit Time Delta'}
                    </td>
                    <td className="py-3.5 px-4 bg-rose-50/20 text-slate-500">
                      ~{primaryRoute.estimatedTransitHours + primaryRoute.estimatedStandstillDelayHours} {language === 'am' ? 'ጠቅላላ ሰዓት ይፈጃል' : language === 'om' ? 'waliigala sa’aatii' : 'hrs total elapsed'}
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/30">
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        ⚡ {isAm ? `${comparisonMatrix.netTimeSavingMinutes} ደቂቃዎች የተጣራ ጊዜ ዳነ` : isOm ? `daqiiqaa ${comparisonMatrix.netTimeSavingMinutes} yeroo qusatame` : comparisonMatrix.netTimeSavingLabel}
                      </span>
                    </td>
                  </tr>

                  {/* Fuel Difference */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'am' ? 'የነዳጅ ፍጆታ እና ወጪ' : language === 'om' ? 'Baasii fi Fayyadama Boba’aa' : 'Fuel Burn & Expense'}
                    </td>
                    <td className="py-3.5 px-4 bg-rose-50/20">
                      {primaryRoute.fuelConsumptionLiters} L ({primaryRoute.fuelCostEtb.toLocaleString()} ETB)
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/30">
                      <div className="flex items-center gap-1.5">
                        <span>{bypassRoute.fuelConsumptionLiters} L ({bypassRoute.fuelCostEtb.toLocaleString()} ETB)</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          ({comparisonMatrix.fuelDeltaLabel})
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Safety Rating */}
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {language === 'am' ? 'የደህንነት ውጤት ነጥብ' : language === 'om' ? 'Qabxii Nageenyaa' : 'Safety Rating Score'}
                    </td>
                    <td className="py-3.5 px-4 bg-rose-50/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-rose-700 text-sm">{primaryRoute.safetyScore} / 100</span>
                          <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                            {language === 'am' ? 'ከፍተኛ የስጋት አደጋ' : language === 'om' ? 'Sodaa Balaa Olaanaa' : 'High Conflict Risk'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${primaryRoute.safetyScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 bg-emerald-50/30">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-700 text-sm">{bypassRoute.safetyScore} / 100</span>
                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {isAm ? `+${bypassRoute.safetyScore - primaryRoute.safetyScore}% የደህንነት ጭማሪ` : isOm ? `Daballii Nageenyaa +${bypassRoute.safetyScore - primaryRoute.safetyScore}%` : comparisonMatrix.safetyRating.safetyRatingDelta}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${bypassRoute.safetyScore}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation Box & Action Button */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1 max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                  {language === 'am' ? 'የውሳኔ የድጋፍ ምክረ-ሀሳብ' : language === 'om' ? 'Gorsa Murtee' : 'Decision Recommendation'}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {isAm
                    ? 'በደወሌ በኩል ደቡባዊ አማራጭ መስመርን መፍቀድ 65 ኪ.ሜ የአስፋልት ጉዞ የሚጨምር ቢሆንም፣ የሰሜኑን የስጋት ቀጠና በማስቀረት የሚገመተውን 4.5 ሰዓታት የኬላ መዘግየት ሙሉ ለሙሉ ያስቀራል፤ እንዲሁም የጭነቱን የደህንነት ውጤት ከ38 ወደ 96 ያሳድጋል።'
                    : isOm
                    ? 'Daandii Dawaaleetiin kooridoorii kibbaa hayyamuun fageenya km 65 kan dabalu ta\'us, sodaa kaabaa hambisuun turtii keellaa sa\'aatii 4.5 guutummaatti balleessa; qabxii nageenya fe\'isaas 38 irraa gara 96tti ol guddisa.'
                    : comparisonMatrix.recommendationSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyBypassDetour}
                disabled={isApplyingDetour}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Compass className="w-4 h-4 text-white" />
                <span>
                  {isApplyingDetour
                    ? (language === 'am' ? 'በማረጋገጥ ላይ...' : language === 'om' ? 'Mirkaneessaa jira...' : 'Authorizing...')
                    : (language === 'am' ? 'አጽድቅ እና የደቡባዊ አማራጭ መስመርን አስጀምር' : language === 'om' ? 'Mirkaneessi & Daandii Kibbaa Jalqabsiisi' : 'Authorize & Activate Southern Bypass')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: FLAG NEW SECURITY RISK ZONE */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900">
                  {language === 'am' ? 'የኮሪደር ደህንነት ስጋት መዝግብ' : language === 'om' ? 'Balaa Nageenya Koriidarii Galmeessi' : 'Flag Corridor Security Hazard'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRiskZone} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'am' ? 'የደህንነት ቀጠና ስም' : language === 'om' ? 'Maqaa Naannoo Sodaa' : 'Security Zone Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'am' ? 'ምሳሌ፡ አዋሽ-ሚሌ የደህንነት ማቋረጫ' : language === 'om' ? 'Fkn: Daangaa Nageenyaa Awaash-Millee' : 'e.g., Awash-Mille Corridor Security Buffer'}
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'የስጋት ደረጃ' : language === 'om' ? 'Sadarkaa Balaa / Sodaa' : 'Risk Severity Level'}
                  </label>
                  <select
                    value={newZoneSeverity}
                    onChange={(e) => setNewZoneSeverity(e.target.value as RiskSeverity)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="CRITICAL">{language === 'am' ? 'አስጊ / ወሳኝ (ጥቁር)' : language === 'om' ? 'Murteessaa (Gurraacha)' : 'Critical (Black)'}</option>
                    <option value="HIGH">{language === 'am' ? 'ከፍተኛ (ቀይ)' : language === 'om' ? 'Olaanaa (Diimaa)' : 'High (Red)'}</option>
                    <option value="MEDIUM">{language === 'am' ? 'መካከለኛ (ቢጫ)' : language === 'om' ? 'Giddu-galeessa (Burtukaana)' : 'Medium (Orange)'}</option>
                    <option value="LOW">{language === 'am' ? 'ዝቅተኛ' : language === 'om' ? 'Gadi-aanaa' : 'Low (Yellow)'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'የመረጃ ምንጭ' : language === 'om' ? 'Madda Odeeffannoo' : 'Intelligence Source'}
                  </label>
                  <select
                    value={newZoneSource}
                    onChange={(e) => setNewZoneSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  >
                    <option value="Government Security Advisory">
                      {language === 'am' ? 'የመንግስት የጸጥታ መረጃ' : language === 'om' ? 'Gorsa Nageenya Mootummaa' : 'Government Security Advisory'}
                    </option>
                    <option value="Verified Driver Crowdsourcing">
                      {language === 'am' ? 'የአሽከርካሪዎች ማህበራዊ ጥቆማ' : language === 'om' ? 'Odeeffannoo Konkolaachistootaa' : 'Verified Driver Crowdsourcing'}
                    </option>
                    <option value="Regional Authority Incident Report">
                      {language === 'am' ? 'የክልል ባለስልጣናት ሪፖርት' : language === 'om' ? 'Gabaasa Bulchiinsa Naannoo' : 'Regional Authority Incident Report'}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'ኬክሮስ (Lat)' : language === 'om' ? 'Laatituudii (Lat)' : 'Center Latitude'}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newZoneLat}
                    onChange={(e) => setNewZoneLat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'ኬንትሮስ (Lng)' : language === 'om' ? 'Loongituudii (Lng)' : 'Center Longitude'}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newZoneLng}
                    onChange={(e) => setNewZoneLng(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'ስፋት (ኪ.ሜ)' : language === 'om' ? 'Raadiyaasii (km)' : 'Radius (km)'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'am' ? 'የስጋቱ ዝርዝር መግለጫ / ምክር' : language === 'om' ? 'Ibsa Balaa fi Gorsa' : 'Hazard Advisory / Description'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={language === 'am' ? 'የስጋቱን አይነት፣ የሚመከሩ አማራጮችን ወይም የሰዓት ገደቦችን ይግለጹ...' : language === 'om' ? 'Gosa balaa, daandiiwwan filatamaa ykn sa’aatiiwwan dorkaa ibsaa...' : 'Detail the nature of the hazard, recommended detours, or transit curfews...'}
                  value={newZoneDescription}
                  onChange={(e) => setNewZoneDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  {language === 'am' ? 'ሰርዝ' : language === 'om' ? 'Haqi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingZone}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                >
                  {submittingZone
                    ? (language === 'am' ? 'በመመዝገብ ላይ...' : language === 'om' ? 'Galmeessaa jira...' : 'Registering...')
                    : (language === 'am' ? 'የደህንነት ቀጠና መዝግብ' : language === 'om' ? 'Naannoo Sodaa Galmeessi' : 'Register Security Zone')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
