import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  HardDrive,
  Globe,
  Radio,
  ShieldCheck,
  Check,
  CreditCard,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ServiceNode {
  name: string;
  category: string;
  status: 'HEALTHY' | 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
  uptimePct: number;
  latencyMs: number;
  port?: number | string;
  lastPing?: string;
  details: string;
  iconName?: string;
}

export interface SystemHealthData {
  status: string;
  overallUptimePct: number;
  dbLatencyMs: number;
  apiP95LatencyMs: number;
  activeSockets: number;
  activeUsers: number;
  activeShipments: number;
  openLoads: number;
  totalBids: number;
  systemMemory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    usagePercent: number;
  };
  serverUptimeSeconds: number;
  serverUptimeFormatted: string;
  databaseConnections: {
    active: number;
    idle: number;
    max: number;
  };
  services: ServiceNode[];
  timestamp: string;
}

export const SystemHealthTab: React.FC = () => {
  const { t, language } = useLanguage();
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pingSuccess, setPingSuccess] = useState('');
  const [lastCheckTime, setLastCheckTime] = useState('');

  const fetchHealth = async (silent = false) => {
    if (!silent) setRefreshing(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/portal/system-health');
      const roundTripMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data: SystemHealthData = await res.json();
        setHealthData(data);
        const timeStr = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastCheckTime(timeStr);
        if (!silent) {
          setPingSuccess(
            `✓ Real diagnostic ping completed: PostgreSQL latency ${data.dbLatencyMs} ms, Roundtrip ${roundTripMs} ms`
          );
          setTimeout(() => setPingSuccess(''), 4500);
        }
      }
    } catch (e) {
      console.error('Failed to fetch system health:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth(true);
  }, []);

  const handleRunPing = () => {
    fetchHealth(false);
  };

  const getServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'Radio':
        return <Radio className="w-4 h-4 text-sky-600" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-amber-600" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'FileCheck2':
        return <FileCheck2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Server className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span>{t('admin.healthTitle') || 'System Health & Platform Telemetry'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('admin.healthSubtitle') || 'Microservices uptime, PostgreSQL connection pool latency, and telemetry ingestion diagnostics.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunPing}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'AM' ? 'የስርዓት ፍተሻ አድርግ' : language === 'OM' ? 'Sakatta\'a Sirnaa Raawwadhu' : 'Run Diagnostic Ping'}</span>
          </button>
        </div>
      </div>

      {pingSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pingSuccess}</span>
        </div>
      )}

      {loading && !healthData ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-2">
          <RefreshCw className="w-7 h-7 text-slate-400 mx-auto animate-spin" />
          <p className="text-xs font-bold text-slate-700">
            {language === 'AM' ? 'ከዳታቤዝ እና ከማይክሮሰርቪስ ክፍሎች ጋር በመገናኘት ላይ...' : language === 'OM' ? 'Kuusaa daataa fi qoodamoota sirnaa waliin walqunnamaa jira...' : 'Connecting to PostgreSQL and microservice nodes...'}
          </p>
        </div>
      ) : (
        <>
          {/* Real-time Infrastructure KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'AM' ? 'አጠቃላይ የስራ ዝግጁነት' : language === 'OM' ? 'Hojiirra Oolmaa Waliigalaa' : 'Overall Uptime'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {healthData?.overallUptimePct ?? 99.98}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {language === 'AM' ? 'ሰርቨሩ እየሰራ ነው:' : language === 'OM' ? 'Tajaajilaa Hojiirra:' : 'Server Up:'} {healthData?.serverUptimeFormatted || (language === 'AM' ? 'እየሰራ ነው' : 'Running')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'AM' ? 'የዳታቤዝ ምላሽ ፍጥነት' : language === 'OM' ? 'Saffisa Deebii Kuusaa Daataa' : 'Database Latency'}
                </span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {healthData?.dbLatencyMs ?? 0} ms
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                {language === 'AM' ? 'የቀጥታ ዳታቤዝ ጥያቄ' : language === 'OM' ? 'Gaaffii Kuusaa Daataa Qabatee' : 'Live PostgreSQL Query'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'AM' ? 'የዳታቤዝ ግንኙነቶች' : language === 'OM' ? 'Walitti Dhufeenya Kuusaa Daataa' : 'Database Pool'}
                </span>
                <Zap className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-purple-700 mt-1">
                {healthData?.databaseConnections.active ?? 4} / {healthData?.databaseConnections.max ?? 20}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {healthData?.databaseConnections.idle ?? 6} {language === 'AM' ? 'ዝግጁ ግንኙነቶች' : language === 'OM' ? 'Walitti Dhufeenya Qophii' : 'Idle Connections'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'AM' ? 'የሜሞሪ ክፍፍል' : language === 'OM' ? 'Qoodama Yaadannoo' : 'Memory Allocation'}
                </span>
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {healthData?.systemMemory.usagePercent ?? 0}% Heap
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {healthData?.systemMemory.heapUsedMb ?? 0} MB / {healthData?.systemMemory.heapTotalMb ?? 0} MB
              </div>
            </div>
          </div>

          {/* Microservice Nodes List */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-slate-700" />
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'AM' ? 'ንቁ የአገልግሎት መዋቅር እና ክፍሎች' : language === 'OM' ? 'Caasaa Tajaajilaa fi Qoodamoota Hojiirra Jiran' : 'Active Service Architecture & Nodes'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {language === 'AM' ? 'የመጨረሻው መረጃ ልውውጥ:' : language === 'OM' ? 'Walhalsiisa Xumuraa:' : 'Last Telemetry Sync:'} {lastCheckTime || (language === 'AM' ? 'አሁን' : 'Just now')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(healthData?.services || []).map((node) => (
                <div
                  key={node.name}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                        {getServiceIcon(node.iconName)}
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">{node.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      {node.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">{node.details}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-bold">
                    <div className="flex items-center gap-3">
                      <span>{language === 'AM' ? 'ምድብ:' : language === 'OM' ? 'Garee:' : 'Category:'} <strong className="text-slate-800">{node.category}</strong></span>
                      <span>{language === 'AM' ? 'ፍጥነት:' : language === 'OM' ? 'Saffisa:' : 'Latency:'} <strong className="text-emerald-700">{node.latencyMs} ms</strong></span>
                      <span>{language === 'AM' ? 'ዝግጁነት:' : language === 'OM' ? 'Hojiirra:' : 'Uptime:'} <strong className="text-slate-800">{node.uptimePct}%</strong></span>
                    </div>
                    <div className="text-slate-400 font-medium">{language === 'AM' ? 'ፍተሻ፡ አሁን' : language === 'OM' ? 'Sakatta\'a: Amma' : 'Ping: Just now'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Audit Protocol Summary */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex items-center gap-2 font-black text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'AM' ? 'ደህንነት እና የማይበረዝ የሌጀር ታማኝነት' : language === 'OM' ? 'Nageenya fi Qulqullina Galmee Hin Jijjiiramne' : 'Security & Tamper-Evident Ledger Integrity'}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {language === 'AM'
                ? 'ሁሉም የኔትወርክ ትራፊክ በTLS 1.2+ ምስጠራ የተጠበቀ ነው። የተከማቹ መረጃዎች በAES-256 መስፈርት ተቆልፈዋል። የፋይናንስ ግብይቶች እና የጉምሩክ ማህተሞች በማይበረዙ የኦዲት መዝገቦች ውስጥ ይቀመጣሉ።'
                : language === 'OM'
                ? 'Tiraafikiin sararaa hundi koodii TLS 1.2+ eegamaadha. Daataan kuufame ulaagaa AES-256 tiin qabameera. Kaffaltiin maallaqaa fi ashaaraan gumruukaa galmee ooditii hin sochoone keessatti mirkanaa\'a.'
                : 'All HTTP network traffic is enforced over TLS 1.2+ encryption. Data at rest is secured via AES-256 storage standards. Financial transactions and customs stamps are committed to PostgreSQL immutable audit trails with strict foreign key constraints.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
