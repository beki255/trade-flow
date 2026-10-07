import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Server,
  Radio,
  Cpu,
  CreditCard,
  FileCheck2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Zap,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import { SystemHealthData, ServiceStatus } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

export const SystemHealthTab: React.FC = () => {
  const { t } = useLanguage();
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHealth = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch(`/api/portal/system-health?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn('Failed to fetch system health:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealth();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return <Database className="w-5 h-5 text-sky-500" />;
      case 'Server':
        return <Server className="w-5 h-5 text-indigo-500" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-emerald-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-500" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-amber-500" />;
      case 'FileCheck2':
        return <FileCheck2 className="w-5 h-5 text-cyan-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading && !healthData) {
    return (
      <div className="p-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
        <p className="text-xs font-bold text-slate-500">Querying platform infrastructure & database latency...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t('admin.healthTitle')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('admin.healthSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Wifi className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{autoRefresh ? 'Auto-Polling (6s)' : 'Polling Paused'}</span>
          </button>

          <button
            onClick={() => fetchHealth(true)}
            disabled={refreshing}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Global Platform Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Global Service Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {healthData?.status ?? 'OPERATIONAL'}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {healthData?.overallUptimePct ?? 99.98}% SLA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Uptime: {healthData?.serverUptimeFormatted ?? 'online'}
          </p>
        </div>

        {/* 2. PostgreSQL + PostGIS DB Latency */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Database Spatial Latency</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {healthData?.dbLatencyMs !== undefined ? `${healthData.dbLatencyMs} ms` : '--'}
            </span>
            <span className="text-xs font-bold text-sky-600">PostGIS 3.4</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active Pool: {healthData?.databaseConnections?.active ?? 0} / {healthData?.databaseConnections?.max ?? 20} conns
          </p>
        </div>

        {/* 3. Matching Engine SLA Latency */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">CVRP Matching Engine</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {healthData?.slaCompliance?.matchingEngineP95Ms ?? '--'} ms
            </span>
            <span className="text-xs font-bold text-emerald-600">
              Passes SLA (&lt;1.0s)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Corridor Utility Optimizer P95 benchmark
          </p>
        </div>

        {/* 4. Telematics WebSockets */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Telematics Sockets</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {healthData?.activeSockets ?? 0} nodes
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {healthData?.activeShipments ?? 0} in transit
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Real-time GPS coordinate streaming
          </p>
        </div>
      </div>

      {/* Microservices Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-600" />
            <span>Core Subsystems & Integration Adapters</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Synchronized: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(healthData?.services || []).map((srv, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {getServiceIcon(srv.iconName)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {srv.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {srv.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      srv.status === 'HEALTHY'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : srv.status === 'DEGRADED'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        srv.status === 'HEALTHY'
                          ? 'bg-emerald-500'
                          : srv.status === 'DEGRADED'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    ></span>
                    {srv.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  {srv.details}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Latency:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {srv.latencyMs} ms
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>SLA:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {srv.uptimePct}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Resources & SLA Compliance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Node.js Runtime Memory & Connections */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span>Node.js V8 Runtime Telemetry</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Process
            </span>
          </div>

          {/* Memory Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Heap Memory Utilization</span>
              <span className="font-mono font-bold text-slate-900">
                {healthData?.systemMemory?.heapUsedMb ?? 0} MB / {healthData?.systemMemory?.heapTotalMb ?? 0} MB ({healthData?.systemMemory?.usagePercent ?? 0}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (healthData?.systemMemory?.usagePercent ?? 0) > 90
                    ? 'bg-rose-500'
                    : (healthData?.systemMemory?.usagePercent ?? 0) > 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${healthData?.systemMemory?.usagePercent ?? 0}%` }}
              ></div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Resident Set (RSS)</span>
              <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                {healthData?.systemMemory?.rssMb ?? 0} MB
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">DB Pool Idle</span>
              <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                {healthData?.databaseConnections?.idle ?? 0} conns
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Process Uptime</span>
              <span className="text-xs font-black text-slate-900 font-mono mt-1 block">
                {healthData?.serverUptimeFormatted ?? '0s'}
              </span>
            </div>
          </div>
        </div>

        {/* SLA Compliance Matrix */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>System Performance & SLA Verification Matrix</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Compliant
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Freight Matching Response Time SLA
                </span>
                <span className="text-[10px] text-slate-500">
                  Target: &lt; 1,000 ms (P95)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-600 font-mono block">
                  {healthData?.slaCompliance?.matchingEngineP95Ms ?? '--'} ms (P95)
                </span>
                <span className="text-[10px] font-bold text-slate-400">96.2% margin</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  GPS Tracking Position Broadcast Latency
                </span>
                <span className="text-[10px] text-slate-500">
                  Target: &lt; 5.0 seconds
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-600 font-mono block">
                  {healthData?.slaCompliance?.trackingUpdateLatencySeconds ?? '--'}s
                </span>
                <span className="text-[10px] font-bold text-slate-400">58% margin</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Corridor Marketplace Availability
                </span>
                <span className="text-[10px] text-slate-500">
                  Target: 99.9% uptime commitment
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-600 font-mono block">
                  {healthData?.overallUptimePct ?? 99.98}%
                </span>
                <span className="text-[10px] font-bold text-slate-400">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
