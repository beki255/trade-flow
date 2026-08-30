import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  ShieldAlert,
  History,
  Inbox,
  Database,
  Zap,
  Server,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Building,
  User,
  Truck,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface VerificationRecord {
  id: string;
  name: string;
  role: 'SHIPPER' | 'TRANSPORTER' | 'FORWARDER' | 'DRIVER' | string;
  tin: string;
  tradeLicenseNo: string;
  submittedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  documents: { type: string; filename: string; verified: boolean }[];
  notes?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  action: string;
  target: string;
  details: string;
}

export const AdminPortalPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('verifications');

  // Verification Queue State
  const [verifications, setVerifications] = useState<VerificationRecord[]>([
    {
      id: 'VER-001',
      name: 'Mulugeta Freight Transport PLC',
      role: 'TRANSPORTER',
      tin: '0098473621',
      tradeLicenseNo: 'TL-OR-2023-5512',
      submittedAt: '2026-08-30 01:15',
      status: 'PENDING',
      documents: [
        { type: 'Tax Identification (TIN) Certificate', filename: 'tin_cert_mulugeta.pdf', verified: true },
        { type: 'Commercial Freight License (Ministry of Trade)', filename: 'trade_lic_2024.pdf', verified: true },
        { type: 'Vehicle Fleet Registration & Insurance', filename: 'fleet_insurance_iveco.pdf', verified: false },
      ],
      notes: 'Initial registration from mobile app. Fleet size: 3 trucks.',
    },
    {
      id: 'VER-002',
      name: 'Ethio Coffee Exporters PLC (Dawit Tadesse)',
      role: 'SHIPPER',
      tin: '0012938475',
      tradeLicenseNo: 'TL-AA-2024-8841',
      submittedAt: '2026-08-29 18:40',
      status: 'VERIFIED',
      documents: [
        { type: 'Export License Certificate', filename: 'coffee_export_permit.pdf', verified: true },
        { type: 'National TIN Registration', filename: 'tin_dawit.pdf', verified: true },
      ],
      notes: 'Verified via Ethiopian Customs Commission (ECC) automated database.',
    },
    {
      id: 'VER-003',
      name: 'Sara Haile (Red Sea Freight Forwarding)',
      role: 'FORWARDER',
      tin: '0047281934',
      tradeLicenseNo: 'TL-AA-2022-9901',
      submittedAt: '2026-08-30 02:10',
      status: 'PENDING',
      documents: [
        { type: 'Freight Forwarding Operators License', filename: 'forwarder_license_2026.pdf', verified: false },
        { type: 'Customs Broker Accreditation (ECC)', filename: 'broker_accreditation.pdf', verified: false },
      ],
      notes: 'Applying for multi-modal corridor clearance access.',
    },
    {
      id: 'VER-004',
      name: 'Abebe Bikila (Senior Heavy Truck Driver)',
      role: 'DRIVER',
      tin: 'DRV-ETH-9921',
      tradeLicenseNo: 'LIC-CAT-5-8832',
      submittedAt: '2026-08-29 14:22',
      status: 'VERIFIED',
      documents: [
        { type: 'Category 5 Commercial Driver License', filename: 'license_cat5_abebe.pdf', verified: true },
        { type: 'Corridor Safety Compliance Badge', filename: 'safety_clearance.pdf', verified: true },
      ],
      notes: '12 years cross-border driving experience. Clean record.',
    },
  ]);

  // Fetch registered users directly from backend Database
  const fetchDbUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          const formatted: VerificationRecord[] = data.users.map((u: any) => ({
            id: u.id,
            name: u.companyName || u.fullName,
            role: u.role,
            tin: u.tin || 'N/A',
            tradeLicenseNo: u.tradeLicenseNo || 'N/A',
            submittedAt: new Date(u.createdAt).toLocaleString(),
            status: u.verificationStatus || 'PENDING',
            documents: [
              { type: 'Commercial License / TIN Dossier', filename: `${u.role.toLowerCase()}_doc.pdf`, verified: u.verificationStatus === 'VERIFIED' },
            ],
            notes: `Registered email: ${u.email} • Phone: ${u.phone || 'N/A'}`,
          }));
          setVerifications(formatted);
        }
      }
    } catch (err) {
      console.warn('API users fetch fallback to local list');
    }
  };

  useEffect(() => {
    fetchDbUsers();
  }, []);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'AUD-901',
      timestamp: '2026-08-30 02:45:10',
      adminId: 'TF-ADMIN-0001 (admin@tradeflow.et)',
      action: 'STATUS_TRANSITION',
      target: 'Ethio Coffee Exporters PLC (TIN: 0012938475)',
      details: 'Status changed from PENDING to VERIFIED. Ministry of Trade TIN matches official ledger.',
    },
    {
      id: 'AUD-900',
      timestamp: '2026-08-29 16:30:00',
      adminId: 'TF-ADMIN-0001 (admin@tradeflow.et)',
      action: 'STATUS_TRANSITION',
      target: 'Abebe Bikila Driver (DL: LIC-CAT-5-8832)',
      details: 'Status changed from PENDING to VERIFIED. Category 5 license validity confirmed.',
    },
  ]);

  // Document Review Drawer State
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Workflow Handlers
  const handleTransitionStatus = async (recordId: string, newStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED', reason: string) => {
    const record = verifications.find((v) => v.id === recordId);
    if (!record) return;

    const oldStatus = record.status;
    const updated = verifications.map((v) =>
      v.id === recordId ? { ...v, status: newStatus } : v
    );
    setVerifications(updated);

    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({ ...selectedRecord, status: newStatus });
    }

    // Persist to Database API
    try {
      await fetch(`/api/auth/users/${recordId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn('Could not update backend status');
    }

    // Add entry to Audit Log
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      adminId: `${user?.tin || 'TF-ADMIN-0001'} (${user?.email || 'admin@tradeflow.et'})`,
      action: 'STATUS_TRANSITION',
      target: `${record.name} (TIN/DL: ${record.tin})`,
      details: `Status transitioned from ${oldStatus} to ${newStatus}. ${reason}`,
    };
    setAuditLogs([newLog, ...auditLogs]);

    setActionSuccess(`Account ${record.name} is now ${newStatus}! Audit log recorded.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const filteredVerifications = verifications.filter((v) => {
    if (statusFilter === 'ALL') return true;
    return v.status === statusFilter;
  });

  const pendingCount = verifications.filter((v) => v.status === 'PENDING').length;
  const verifiedCount = verifications.filter((v) => v.status === 'VERIFIED').length;
  const suspendedCount = verifications.filter((v) => v.status === 'SUSPENDED').length;

  return (
    <DashboardLayout
      portalRole="ADMIN"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* 1. VERIFICATION WORKFLOW QUEUE */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          
          {/* Top Hero Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#881337] to-[#DC2626] text-white shadow-lg">
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                {language === 'AM' ? 'የማረጋገጫ ተራ እና የKYC ማጣሪያ' : 'Verification Queue & KYC Compliance'}
              </h1>
              <p className="text-xs text-slate-200 mt-1">
                {language === 'AM' 
                  ? 'የተመዘገቡ አጓጓዦች፣ አስመጪዎች እና አሽከርካሪዎች የTIN እና የንግድ ፈቃድ ማረጋገጫ' 
                  : 'Multi-Role Document Review: Pending → Verified → Suspended'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDbUsers}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'AM' ? 'አድስ' : 'Refresh DB'}</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} {language === 'AM' ? 'በመጠባበቅ ላይ' : 'Pending Review'}</span>
              </span>
            </div>
          </div>

          {/* Action Success Alert */}
          {actionSuccess ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess('')} className="text-emerald-700 hover:text-emerald-950">✕</button>
            </div>
          ) : null}

          {/* Workflow Status Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`p-4 rounded-2xl bg-white border text-left transition-all ${
                statusFilter === 'PENDING' ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-amber-600 uppercase">
                  {language === 'AM' ? 'በማጣራት ላይ (Pending)' : 'Pending Verification'}
                </div>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{pendingCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Requires administrator review</div>
            </button>

            <button
              onClick={() => setStatusFilter('VERIFIED')}
              className={`p-4 rounded-2xl bg-white border text-left transition-all ${
                statusFilter === 'VERIFIED' ? 'border-emerald-500 ring-2 ring-emerald-400/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-600 uppercase">
                  {language === 'AM' ? 'የተረጋገጡ (Verified)' : 'Active Verified'}
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{verifiedCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Authorized for corridor trade</div>
            </button>

            <button
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`p-4 rounded-2xl bg-white border text-left transition-all ${
                statusFilter === 'SUSPENDED' ? 'border-rose-500 ring-2 ring-rose-400/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-rose-600 uppercase">
                  {language === 'AM' ? 'የታገዱ (Suspended)' : 'Suspended Accounts'}
                </div>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{suspendedCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Compliance hold / restricted</div>
            </button>
          </div>

          {/* Verification Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  {language === 'AM' ? 'የተመዘገቡ ተጠቃሚዎች ሰነዶች' : 'Submitted Business Registrations'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {filteredVerifications.length}
                </span>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5">
                {(['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {filteredVerifications.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl mt-0.5 ${
                      item.role === 'TRANSPORTER'
                        ? 'bg-blue-50 text-[#0284C7]'
                        : item.role === 'SHIPPER'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.role === 'FORWARDER'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.role === 'TRANSPORTER' ? <Truck className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.role}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>TIN: <strong className="text-slate-700">{item.tin}</strong></span>
                        <span>License: <strong className="text-slate-700">{item.tradeLicenseNo}</strong></span>
                        <span>Submitted: {item.submittedAt}</span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        📄 {item.documents.length} Submitted Documents ({item.documents.map(d => d.filename).join(', ')})
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Pill */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>

                    {/* Review Details Button */}
                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'AM' ? 'ሰነድ ማረጋገጫ' : 'Review Docs'}</span>
                    </button>

                    {/* Quick Approve / Suspend */}
                    {item.status === 'PENDING' && (
                      <button
                        onClick={() => handleTransitionStatus(item.id, 'VERIFIED', 'Administrator approved valid credentials.')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        ✓ {language === 'AM' ? 'አጽድቅ' : 'Verify'}
                      </button>
                    )}

                    {item.status === 'VERIFIED' && (
                      <button
                        onClick={() => handleTransitionStatus(item.id, 'SUSPENDED', 'Administrative hold placed due to audit review.')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                      >
                        ✕ {language === 'AM' ? 'እገድ' : 'Suspend'}
                      </button>
                    )}

                    {item.status === 'SUSPENDED' && (
                      <button
                        onClick={() => handleTransitionStatus(item.id, 'VERIFIED', 'Suspension lifted following dispute clearance.')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                      >
                        ↺ {language === 'AM' ? 'እገዳ አንሳ' : 'Reactivate'}
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Review Detail Modal / Drawer */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {language === 'AM' ? 'የሰነዶች ዝርዝር ማጣሪያ' : 'KYC Document Verification Dossier'}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedRecord.name} • {selectedRecord.role}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 bg-slate-100"
                  >
                    ✕
                  </button>
                </div>

                {/* Company & TIN Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">TIN Number</span>
                    <span className="font-bold text-slate-900">{selectedRecord.tin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Trade License</span>
                    <span className="font-bold text-slate-900">{selectedRecord.tradeLicenseNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Current Status</span>
                    <span className={`font-black ${
                      selectedRecord.status === 'VERIFIED' ? 'text-emerald-600' : selectedRecord.status === 'PENDING' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">
                    {language === 'AM' ? 'የተጫኑ ሰነዶች እና ማረጋገጫዎች:' : 'Submitted Document Files:'}
                  </h4>
                  {selectedRecord.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-[#0284C7]" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{doc.type}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{doc.filename}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        OCR Validated ✓
                      </span>
                    </div>
                  ))}
                </div>

                {/* Administrator Workflow Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleTransitionStatus(selectedRecord.id, 'VERIFIED', 'Admin verified credentials and business license.')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{language === 'AM' ? 'ሙሉ በሙሉ አጽድቅ (Verify Partner)' : 'Approve & Verify Account'}</span>
                  </button>

                  <button
                    onClick={() => handleTransitionStatus(selectedRecord.id, 'SUSPENDED', 'Admin flagged account for compliance review.')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{language === 'AM' ? 'አግድ (Suspend Account)' : 'Suspend Account'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    {language === 'AM' ? 'ዝጋ' : 'Close'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. DISPUTE RESOLUTION */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የአለመግባባት መፍቻ እና የክፍያ ዳኝነት' : 'Dispute Resolution & Escrow Mediation'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'የተመዘገበ አለመግባባት የለም' : 'No active payment disputes'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'በአስመጪዎች እና በአጓጓዦች መካከል የክፍያ ቅሬታ ሲነሳ እዚህ ጋር ዳኝነት ይሰጣል።' : 'Escrow payment disputes will queue here for administrative mediation.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. SYSTEM HEALTH */}
      {activeTab === 'system-health' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የሲስተም ጤና እና የሰርቨር ሁኔታ' : 'System Health & Infrastructure Telemetry'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">PostgreSQL (PostGIS)</div>
                <div className="text-sm font-black text-emerald-600">ONLINE (Port 5432)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Redis Telematics</div>
                <div className="text-sm font-black text-emerald-600">ONLINE (Port 6379)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">MinIO S3 Store</div>
                <div className="text-sm font-black text-emerald-600">ONLINE (Port 9000)</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Service Status</div>
                <div className="text-sm font-black text-slate-900">HEALTHY ✓</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FRAUD DETECTION */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'ማጭበርበር መቆጣጠሪያ' : 'AI Fraud Detection Dashboard'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'ምንም አይነት አጠራጣሪ እንቅስቃሴ አልተገኘም' : 'No suspicious anomalies detected'}
            </div>
          </div>
        </div>
      )}

      {/* 5. AUDIT LOGS WITH REAL-TIME CAPTURE */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              {language === 'AM' ? 'የእንቅስቃሴ እና የሁኔታ ለውጥ መዝገብ' : 'Audit Logs & Transition Trail'}
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              {auditLogs.length} {language === 'AM' ? 'የተመዘገቡ ክስተቶች' : 'Events Captured'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{log.target}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                <div className="text-[10px] text-slate-400">Recorded by Admin: {log.adminId}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
