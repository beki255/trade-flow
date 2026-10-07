import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Building,
  User,
  Scale,
  MapPin,
  TrendingDown,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FraudAlertItem, FraudStats } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

export const FraudDetectionTab: React.FC = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<FraudAlertItem[]>([]);
  const [stats, setStats] = useState<FraudStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    investigatingCases: 0,
    resolvedCases: 0,
    suspendedAccounts: 0,
    preventedExposureEtb: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Action State (for modal / quick remediation)
  const [selectedAlert, setSelectedAlert] = useState<FraudAlertItem | null>(null);
  const [actionType, setActionType] = useState<'INVESTIGATING' | 'RESOLVED' | 'SUSPENDED' | null>(null);
  const [remediationNotes, setRemediationNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchAlerts = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch('/api/portal/fraud-alerts');
      if (res.ok) {
        const data = await res.json();
        if (data.alerts) setAlerts(data.alerts);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch fraud alerts:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleExecuteRemediation = async () => {
    if (!selectedAlert || !actionType) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/portal/fraud-alerts/${selectedAlert.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          actionNotes: remediationNotes.trim() || undefined,
          adminId: 'ADMIN-SUPERVISOR',
        }),
      });

      if (res.ok) {
        const actionLabel =
          actionType === 'SUSPENDED'
            ? 'Account Suspended & Flagged in System'
            : actionType === 'RESOLVED'
            ? 'Alert Resolved & Cleared'
            : 'Alert Moved to Active Investigation';
        setActionSuccess(`Success: ${selectedAlert.id} - ${actionLabel}!`);
        setSelectedAlert(null);
        setActionType(null);
        setRemediationNotes('');
        fetchAlerts();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error executing fraud remediation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List
  const filteredAlerts = alerts.filter((item) => {
    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'SUSPICIOUS_BIDDING' && item.type === 'SUSPICIOUS_BID_DEVIATION') ||
      (typeFilter === 'DUPLICATE_IDENTITY' && (item.type === 'DUPLICATE_TIN' || item.type === 'DUPLICATE_LICENSE')) ||
      (typeFilter === 'CUSTOMS_DISCREPANCY' && item.type === 'CUSTOMS_WEIGHT_MISMATCH') ||
      (typeFilter === 'GEOFENCE_BREACH' && item.type === 'GEOFENCE_ROUTE_BREACH');

    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetUser?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetUser?.tin?.includes(searchQuery);

    return matchesSeverity && matchesStatus && matchesType && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            OPEN
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            INVESTIGATING
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Ban className="w-2.5 h-2.5 text-purple-600" />
            ACCOUNT SUSPENDED
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            RESOLVED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t('admin.fraudTitle')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Heuristic Guard Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('admin.fraudSubtitle')}
          </p>
        </div>

        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Security Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {stats.totalAlerts}
            </span>
            <span className="text-xs font-bold text-slate-500">corridor flags</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Continuous multi-actor audit checks
          </p>
        </div>

        {/* Critical Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Priority Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">
              {stats.criticalAlerts}
            </span>
            <span className="text-xs font-bold text-rose-600">requiring immediate action</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            High risk score (&gt;85/100)
          </p>
        </div>

        {/* Under Investigation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Active Investigation</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">
              {stats.investigatingCases}
            </span>
            <span className="text-xs font-bold text-indigo-600">cases open</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Assigned to enforcement officers
          </p>
        </div>

        {/* Prevented Exposure */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prevented Exposure</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              ETB {(stats.preventedExposureEtb / 1000).toFixed(0)}k
            </span>
            <span className="text-xs font-bold text-emerald-600">protected</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Mitigated freight loss & tax variance
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, TIN, or incident ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-800 bg-transparent border-none focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="ALL">All Detection Categories</option>
            <option value="SUSPICIOUS_BIDDING">Predatory Bidding</option>
            <option value="DUPLICATE_IDENTITY">Duplicate TIN/Identity</option>
            <option value="CUSTOMS_DISCREPANCY">Customs Weight Variance</option>
            <option value="GEOFENCE_BREACH">Geofence Route Breach</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="ALL">All Case Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="SUSPENDED">Suspended Account</option>
            <option value="RESOLVED">Resolved / Safe</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              No matching fraud or security alerts found
            </h4>
            <p className="text-xs text-slate-500">
              All active corridor transactions, TIN identities, and bids are currently within regular parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl bg-white border transition-all shadow-xs space-y-4 ${
                alert.severity === 'CRITICAL'
                  ? 'border-rose-200 hover:border-rose-400'
                  : alert.severity === 'HIGH'
                  ? 'border-amber-200 hover:border-amber-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    {alert.id}
                  </span>
                  {getSeverityBadge(alert.severity)}
                  {getStatusBadge(alert.status)}
                </div>

                <div className="flex items-center gap-3">
                  {/* Risk Score Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Risk Score</span>
                    <span
                      className={`font-black font-mono ${
                        alert.riskScore >= 80
                          ? 'text-rose-600'
                          : alert.riskScore >= 60
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {alert.riskScore}/100
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(alert.detectedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              {/* Target Entity & Deviation Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Target Entity Card */}
                {alert.targetUser && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                      {alert.targetUser.companyName ? (
                        <Building className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {alert.targetUser.companyName || alert.targetUser.fullName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {alert.targetUser.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 space-x-2">
                        <span>{alert.targetUser.email}</span>
                        {alert.targetUser.tin && <span>• TIN: {alert.targetUser.tin}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400 font-medium">Status:</span>
                        <span
                          className={`font-bold ${
                            alert.targetUser.verificationStatus === 'VERIFIED'
                              ? 'text-emerald-600'
                              : alert.targetUser.verificationStatus === 'SUSPENDED'
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {alert.targetUser.verificationStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deviation Box */}
                {alert.deviationDetails && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">
                        {alert.deviationDetails.field}
                      </span>
                      {alert.deviationDetails.differencePct !== undefined && (
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[10px]">
                          {alert.deviationDetails.differencePct > 0 ? '+' : ''}
                          {alert.deviationDetails.differencePct}% Variance
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Expected / Benchmark
                        </span>
                        <span className="font-mono font-bold text-slate-700 text-[11px] block mt-0.5">
                          {alert.deviationDetails.expected}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-rose-100">
                        <span className="text-[10px] font-bold text-rose-500 block uppercase">
                          Detected Value
                        </span>
                        <span className="font-mono font-bold text-rose-700 text-[11px] block mt-0.5">
                          {alert.deviationDetails.actual}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Notes if recorded */}
              {alert.adminNotes && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                  <span className="font-bold text-[11px] text-indigo-700 uppercase flex-shrink-0">
                    Admin Note:
                  </span>
                  <span className="text-[11px] text-indigo-800 leading-relaxed">
                    {alert.adminNotes}
                  </span>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Select administrative action to remediate this alert:
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 1. Flag for Investigation */}
                  {alert.status !== 'INVESTIGATING' && (
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setActionType('INVESTIGATING');
                        setRemediationNotes(alert.adminNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Investigate</span>
                    </button>
                  )}

                  {/* 2. Suspend Account */}
                  {alert.status !== 'SUSPENDED' && alert.targetUser && (
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setActionType('SUSPENDED');
                        setRemediationNotes('Account suspended due to confirmed regulatory/fraud violation.');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Suspend Entity</span>
                    </button>
                  )}

                  {/* 3. Mark as Resolved / Safe */}
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setActionType('RESOLVED');
                        setRemediationNotes('Audited and verified compliant by Platform Administrator.');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resolve Safe</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Execution Modal */}
      {selectedAlert && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    actionType === 'SUSPENDED'
                      ? 'bg-rose-100 text-rose-600'
                      : actionType === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {actionType === 'SUSPENDED' ? (
                    <Ban className="w-5 h-5" />
                  ) : actionType === 'RESOLVED' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {actionType === 'SUSPENDED'
                      ? 'Confirm Account Suspension'
                      : actionType === 'RESOLVED'
                      ? 'Mark Alert as Resolved / Safe'
                      : 'Move Alert to Investigation Queue'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Case ID: {selectedAlert.id} ({selectedAlert.type})
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {actionType === 'SUSPENDED'
                ? `This will officially suspend ${selectedAlert.targetUser?.companyName || selectedAlert.targetUser?.fullName || 'the user'}, revoke their marketplace bidding and load-booking access, and append an immutable entry to the regulatory audit log.`
                : actionType === 'RESOLVED'
                ? 'This marks the discrepancy as reviewed and verified safe. The alert will be archived in the audit logs.'
                : 'This flags the alert for targeted inquiry by corridor customs and logistics auditing staff.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Official Administrative Notes (Required for Audit Trail)
              </label>
              <textarea
                rows={3}
                value={remediationNotes}
                onChange={(e) => setRemediationNotes(e.target.value)}
                placeholder="Enter justification, inspector findings, or reference documentation..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-slate-400 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedAlert(null);
                  setActionType(null);
                  setRemediationNotes('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteRemediation}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 ${
                  actionType === 'SUSPENDED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : actionType === 'RESOLVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {actionType === 'SUSPENDED'
                    ? 'Confirm Suspension'
                    : actionType === 'RESOLVED'
                    ? 'Mark Resolved'
                    : 'Save & Investigate'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
