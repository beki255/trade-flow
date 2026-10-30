import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Truck,
  Building,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Scale,
  Zap,
  UserX,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { FraudAlertItem, FraudStats } from '../types';

export const FraudDetectionTab: React.FC = () => {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<FraudAlertItem[]>([]);
  const [stats, setStats] = useState<FraudStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    investigatingCases: 0,
    resolvedCases: 0,
    suspendedAccounts: 0,
    preventedExposureEtb: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchAlerts = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch('/api/portal/fraud-alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch fraud alerts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'INVESTIGATING' | 'RESOLVED' | 'SUSPENDED' | 'DISMISSED',
    actionNotes: string
  ) => {
    try {
      const res = await fetch(`/api/portal/fraud-alerts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actionNotes,
          adminId: 'Super-Admin Console',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackMsg(`✓ ${data.message || `Alert ${id} updated to ${newStatus}`}`);
        await fetchAlerts(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update fraud alert status');
      }
    } catch (err: any) {
      alert(err.message || 'Network error updating fraud alert');
    }
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const filtered = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const targetStr = (a.targetUser?.companyName || a.targetUser?.fullName || a.targetUser?.email || '').toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        targetStr.includes(q)
      );
    }
    return true;
  });

  const openCount = alerts.filter((a) => a.status === 'OPEN').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;
  const maxRisk = alerts.length > 0 ? Math.max(...alerts.map((a) => a.riskScore || 0)) : 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>{t('admin.fraudTitle') || 'AI Fraud & Corridor Anomaly Detection'}</span>
          </h2>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'AM' ? 'ንቁ ጥቆማዎች' : language === 'OM' ? 'Akeekkachiisota Hojiirra Jiran' : 'Active Alerts'}
            </span>
            {openCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">{openCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {criticalCount} {language === 'AM' ? 'አስጊ ክብደት' : language === 'OM' ? 'Sadarkaa Cimaa' : 'Critical Severity'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'AM' ? 'ከፍተኛ የአደጋ ውጤት' : language === 'OM' ? 'Qabxii Balaa Ol\'aanaa' : 'Peak Risk Score'}
            </span>
            <Zap className={`w-4 h-4 ${maxRisk > 70 ? 'text-rose-500' : maxRisk > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{maxRisk}/100</div>
          <div className={`text-[10px] font-bold mt-0.5 ${maxRisk > 70 ? 'text-rose-600' : maxRisk > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {maxRisk > 70
              ? (language === 'AM' ? 'ከፍተኛ የአደጋ ልዩነት' : language === 'OM' ? 'Garaagarummaa Balaa Ol\'aanaa' : 'High Risk Discrepancy')
              : maxRisk > 0
              ? (language === 'AM' ? 'መካከለኛ ጥቆማ' : language === 'OM' ? 'Akeekkachiisa Giddu-galeessaa' : 'Moderate Alert')
              : (language === 'AM' ? 'ምንም ንቁ ስጋት የለም' : language === 'OM' ? 'Sodaan Tokkollee Hin Jiru' : 'Zero Active Threats')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'AM' ? 'ምርመራዎችና ዕግዶች' : language === 'OM' ? 'Qorannoowwan & Qabamuuf' : 'Investigations & Holds'}
            </span>
            <Scale className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600 mt-1">{stats.investigatingCases}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {stats.resolvedCases} {language === 'AM' ? 'የተፈቱ' : language === 'OM' ? 'Furmaata Kan Argatan' : 'Resolved'} • {stats.suspendedAccounts} {language === 'AM' ? 'የታገዱ' : language === 'OM' ? 'Haggame' : 'Suspended'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'AM' ? 'የተጠበቀ የተጋላጭነት መጠን' : language === 'OM' ? 'Balaa Ittisaame' : 'Prevented Exposure'}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ETB {stats.preventedExposureEtb.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {language === 'AM' ? 'የቀጥታ ስሌት ልዩነት' : language === 'OM' ? 'Garaagarummaa Shallagame' : 'Real Live Calculated Variance'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'AM' ? 'አጠራጣሪ ጉዳዮችን በስም፣ መለያ ወይም መግለጫ ይፈልጉ...' : language === 'OM' ? 'Balaawwan qaamaan, ID ykn ibsaan barbaadaa...' : 'Search anomalies by entity, ID, or description...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev === 'ALL'
                  ? (language === 'AM' ? 'ሁሉም' : language === 'OM' ? 'Hunda' : 'ALL')
                  : sev === 'CRITICAL'
                  ? (language === 'AM' ? 'አስጊ' : language === 'OM' ? 'Cimaa' : 'CRITICAL')
                  : sev === 'HIGH'
                  ? (language === 'AM' ? 'ከፍተኛ' : language === 'OM' ? 'Ol\'aanaa' : 'HIGH')
                  : (language === 'AM' ? 'መካከለኛ' : language === 'OM' ? 'Giddu-galeessa' : 'MEDIUM')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-2">
            <RefreshCw className="w-7 h-7 text-slate-400 mx-auto animate-spin" />
            <p className="text-xs font-bold text-slate-700">
              {language === 'AM' ? 'የማጭበርበር ሁኔታዎችን ለመለየት ዳታቤዝ እየተቃኘ ነው...' : language === 'OM' ? 'Balaawwan daldalaa adda baasuuf kuusaan daataa sakatta\'amaa jira...' : 'Scanning live PostgreSQL database for fraud anomalies...'}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">
                {language === 'AM' ? 'ምንም አይነት የማጭበርበር ሁኔታ አልተገኘም' : language === 'OM' ? 'Balaan Ykn Gochi Seeraan Alaa Tokkollee Hin Argamne' : 'No Active Fraud Anomalies Detected'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {language === 'AM'
                  ? 'በተመዘገቡ ተጠቃሚዎች፣ ጨረታዎች፣ የጉምሩክ ሰነዶች እና ክፍያዎች ላይ የተደረገው ቅኝት ተጠናቋል። ሁሉም መረጃዎች ከህግ ጋር የተጣጣሙ ናቸው።'
                  : language === 'OM'
                  ? 'Sakatta\'aan fayyadamtoota, dorgommii, sanadoota gumruukaa fi kaffaltii irratti xumurameera. Hundi seera qabeessa.'
                  : 'Live database scan completed across registered users (TIN/Licenses), marketplace bids, customs documents, shipments, and escrow settlements. All active records are compliant.'}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((item) => {
            const isResolved = item.status === 'RESOLVED' || item.status === 'DISMISSED';
            const targetName =
              item.targetUser?.companyName ||
              item.targetUser?.fullName ||
              item.targetUser?.email ||
              item.relatedEntityId ||
              'Corridor Participant';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  isResolved
                    ? 'border-slate-200 opacity-60'
                    : item.severity === 'CRITICAL'
                    ? 'border-rose-200 shadow-xs bg-rose-50/10'
                    : 'border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="font-mono text-xs font-black text-slate-800">{item.id}</span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400">Risk Score:</span>
                      <span className="text-xs font-black text-rose-600">{item.riskScore}/100</span>
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${item.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        item.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'INVESTIGATING'
                          ? 'bg-sky-100 text-sky-800'
                          : item.status === 'SUSPENDED'
                          ? 'bg-purple-100 text-purple-800'
                          : item.status === 'DISMISSED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-2">
                  <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {language === 'AM' ? 'ኢላማ የተደረገው አካል' : language === 'OM' ? 'Qaama Xiyyeeffatame' : 'Target Entity'}
                    </span>
                    <span className="font-bold text-slate-800 text-[11px] truncate block">
                      {targetName} {item.targetUser?.role ? `(${item.targetUser.role})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {language === 'AM' ? 'የተጠበቀው መነሻ' : language === 'OM' ? 'Madaallii Eeggamu' : 'Expected Baseline'}
                    </span>
                    <span className="font-bold text-emerald-700 text-[11px]">
                      {item.deviationDetails?.expected != null ? String(item.deviationDetails.expected) : (language === 'AM' ? 'የህግ መስፈርት' : language === 'OM' ? 'Ulaagaa Seeraa' : 'Regulatory Standard')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {language === 'AM' ? 'በተጨባጭ የተገኘው' : language === 'OM' ? 'Qabatamaan Kan Argame' : 'Actual Detected'}
                    </span>
                    <span className="font-bold text-rose-700 text-[11px]">
                      {item.deviationDetails?.actual != null ? String(item.deviationDetails.actual) : (language === 'AM' ? 'የተመዘገበ ልዩነት' : language === 'OM' ? 'Garaagarummaa Galmaa\'e' : 'Flagged Discrepancy')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {item.relatedEntityType === 'CUSTOMS_DOC'
                        ? (language === 'AM' ? 'ሞጆ ደረቅ ወደብ / ጋላፊ የድንበር ተርሚናል' : 'Modjo Dry Port / Galafi Border Terminal')
                        : item.relatedEntityType === 'BID'
                        ? (language === 'AM' ? 'ዲጂታል የጭነት ገበያ ቦታ' : 'Digital Freight Marketplace')
                        : item.relatedEntityType === 'SHIPMENT'
                        ? (language === 'AM' ? 'ጅቡቲ - ሞጆ የትራንዚት ኮሪደር' : 'Djibouti - Modjo Transit Highway')
                        : (language === 'AM' ? 'ብሔራዊ የንግድ ምዝገባ (ንግድና ቀጣናዊ ትስስር ሚኒስቴር)' : 'National Commercial Registry (MoTI / MoR)')}
                    </span>
                  </div>

                  {!isResolved && (
                    <div className="flex items-center gap-2">
                      {item.status !== 'INVESTIGATING' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              item.id,
                              'INVESTIGATING',
                              'Investigation ticket opened by Super-Admin'
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          {language === 'AM' ? 'መርምር' : language === 'OM' ? 'Qoradhu' : 'Investigate'}
                        </button>
                      )}

                      {item.targetUser?.id && item.status !== 'SUSPENDED' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              item.id,
                              'SUSPENDED',
                              'Account suspended by Admin due to verified commercial violation'
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          <span>{language === 'AM' ? 'መለያውን እገድ' : language === 'OM' ? 'Herrega Cufi' : 'Suspend Account'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            item.id,
                            'RESOLVED',
                            'Discrepancy verified and marked resolved by Admin'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                      >
                        {language === 'AM' ? 'ፍታ' : language === 'OM' ? 'Furi' : 'Resolve'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            item.id,
                            'DISMISSED',
                            'Alert dismissed by Admin as verified false positive'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-[11px] transition cursor-pointer"
                      >
                        {language === 'AM' ? 'አሰናብት' : language === 'OM' ? 'Dhiisi' : 'Dismiss'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
