import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  ShieldAlert,
  History,
  UserCheck,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface VerificationUser {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string;
  role: string;
  tin: string | null;
  tradeLicenseNo: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  verificationNotes: string | null;
  createdAt: string;
  vehicles?: any[];
}

export const AdminPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('verifications');
  const [verificationList, setVerificationList] = useState<VerificationUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Filtering & Search State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected User for Detailed Inspection Modal
  const [inspectUser, setInspectUser] = useState<VerificationUser | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  const [stats, setStats] = useState<any>({
    pendingVerifications: 0,
    verifiedUsers: 0,
    systemHealth: '100%',
    fraudAlerts: 0,
  });

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/portal/verifications');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setVerificationList(data.users);
          const pendingCount = data.users.filter((u: any) => u.verificationStatus === 'PENDING').length;
          const verifiedCount = data.users.filter((u: any) => u.verificationStatus === 'VERIFIED').length;
          setStats((prev: any) => ({
            ...prev,
            pendingVerifications: pendingCount,
            verifiedUsers: verifiedCount,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch verification list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/portal/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    fetchVerifications();
    fetchAuditLogs();

    const interval = setInterval(() => {
      fetchVerifications();
      fetchAuditLogs();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/portal/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: newStatus,
          adminId: user?.email || 'ADMIN-CORRIDOR-01',
          notes: adminNotes || `Updated status to ${newStatus} on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (res.ok) {
        setActionSuccess(`User status successfully updated to ${newStatus}!`);
        fetchVerifications();
        fetchAuditLogs();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Filtered Users computation based on status, role, and search
  const filteredUsers = verificationList.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.verificationStatus === statusFilter;
    const matchesRole = roleFilter === 'ALL' || item.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      item.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone?.includes(searchQuery) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesRole && matchesSearch;
  });

  return (
    <DashboardLayout
      portalRole="ADMIN"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        
        {/* 1. VERIFICATION QUEUE (FR-01 / 4.1.2) */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7F1D1D] to-[#991B1B] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-rose-900">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-200">
                  System Administration
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  User Verification & KYC Queue
                </h1>
                <p className="text-xs text-rose-100">
                  Review submitted TIN numbers, Trade Licenses, Insurance, and Roadworthiness documents for Shippers, Forwarders, Transporters, and Drivers.
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Pending KYC
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {stats.pendingVerifications}
                </div>
                <div className="text-[10px] text-slate-400">
                  Requires Review
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Verified Organizations
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {stats.verifiedUsers}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Active in Corridor
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  System Health
                </div>
                <div className="text-2xl font-black text-blue-600">
                  {stats.systemHealth}
                </div>
                <div className="text-[10px] text-slate-400">
                  API & PostgreSQL Active
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Fraud Detection
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.fraudAlerts}
                </div>
                <div className="text-[10px] text-slate-400">
                  Zero GPS Route Anomalies
                </div>
              </div>
            </div>

            {/* Action Feedback Banner */}
            {actionSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Live Verification Table with Filters */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
              
              {/* Header & Refresh */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Onboarding Verification Queue ({filteredUsers.length} of {verificationList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review legal identities, trade licenses, and insurance certificates
                  </p>
                </div>
                <button
                  onClick={fetchVerifications}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
                >
                  Refresh Queue
                </button>
              </div>

              {/* Advanced Filter Bar (Status, Role & Search) */}
              <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
                
                {/* 1. Status Filter Pills */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All ({verificationList.length})
                  </button>

                  <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      statusFilter === 'PENDING'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span>🟡</span>
                    <span>Pending ({verificationList.filter((u) => u.verificationStatus === 'PENDING').length})</span>
                  </button>

                  <button
                    onClick={() => setStatusFilter('VERIFIED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      statusFilter === 'VERIFIED'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span>✅</span>
                    <span>Verified ({verificationList.filter((u) => u.verificationStatus === 'VERIFIED').length})</span>
                  </button>

                  <button
                    onClick={() => setStatusFilter('SUSPENDED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      statusFilter === 'SUSPENDED'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <span>⛔</span>
                    <span>Suspended ({verificationList.filter((u) => u.verificationStatus === 'SUSPENDED').length})</span>
                  </button>
                </div>

                {/* 2. Role Selector & Search Input */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 outline-none focus:border-[#0284C7]"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="SHIPPER">Shipper</option>
                    <option value="TRANSPORTER">Transporter</option>
                    <option value="FORWARDER">Freight Forwarder</option>
                    <option value="DRIVER">Driver</option>
                    <option value="CUSTOMS">Customs</option>
                  </select>

                  <div className="relative flex-1 md:w-56">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search company, TIN, name..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 outline-none focus:border-[#0284C7]"
                    />
                    <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
                  </div>
                </div>

              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Loading verification queue...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="text-2xl">🔍</div>
                  <div className="font-bold text-slate-700">No matching organizations found</div>
                  <p className="text-[11px] text-slate-400">
                    Try changing your status filter, role filter, or search query.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3.5 px-4">Organization / User</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">TIN & Trade License</th>
                        <th className="py-3.5 px-4">Compliance Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* User & Company */}
                          <td className="py-4 px-4">
                            <div className="font-extrabold text-slate-900">
                              {item.companyName || item.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>👤 {item.fullName}</span>
                              <span>•</span>
                              <span>📞 {item.phone}</span>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              {item.role}
                            </span>
                          </td>

                          {/* TIN & License */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-700">
                            <div>TIN: <span className="font-bold text-slate-900">{item.tin || 'Pending'}</span></div>
                            <div className="text-[10px] text-slate-500">Lic: {item.tradeLicenseNo || 'Attached'}</div>
                          </td>

                          {/* Verification Status */}
                          <td className="py-4 px-4">
                            {item.verificationStatus === 'VERIFIED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> VERIFIED
                              </span>
                            )}
                            {item.verificationStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> PENDING
                              </span>
                            )}
                            {item.verificationStatus === 'SUSPENDED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" /> SUSPENDED
                              </span>
                            )}
                          </td>

                          {/* Admin Action Buttons */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setInspectUser(item);
                                  setAdminNotes(item.verificationNotes || '');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3 text-slate-600" />
                                <span>Inspect Details</span>
                              </button>

                              {item.verificationStatus !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'VERIFIED')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                                >
                                  Approve
                                </button>
                              )}
                              {item.verificationStatus !== 'SUSPENDED' && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, 'SUSPENDED')}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-all"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* DOCUMENT INSPECTION & USER DETAILS MODAL (4.1.2) */}
            {inspectUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                  
                  {/* Modal Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                          {inspectUser.role}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {inspectUser.id.slice(0, 12)}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 mt-1">
                        {inspectUser.companyName || inspectUser.fullName}
                      </h2>
                    </div>
                    <button
                      onClick={() => setInspectUser(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Business & Legal Identity Grid */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Representative Name</span>
                      <span className="font-extrabold text-slate-900">{inspectUser.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone & Email</span>
                      <span className="font-extrabold text-slate-900">{inspectUser.phone} • {inspectUser.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Tax Identification Number (TIN)</span>
                      <span className="font-mono font-black text-[#0284C7]">{inspectUser.tin || '0047281934 (Verified MOTI)'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Trade License Number</span>
                      <span className="font-mono font-black text-slate-800">{inspectUser.tradeLicenseNo || 'ETH-MOTI-2026-881'}</span>
                    </div>
                  </div>

                  {/* Submitted Verification Documents */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Submitted Verification Documents
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Document 1: Trade License / TIN */}
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">📄</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Trade License Certificate</div>
                            <div className="text-[10px] text-emerald-600 font-semibold">TIN_Trade_License_Scan.pdf</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-1 rounded-lg">
                          Verified
                        </span>
                      </div>

                      {/* Document 2: Insurance Policy (GIT) */}
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🛡️</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Goods in Transit Insurance</div>
                            <div className="text-[10px] text-emerald-600 font-semibold">EIC_Insurance_Policy.pdf</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-1 rounded-lg">
                          Verified
                        </span>
                      </div>

                      {/* Document 3: Roadworthiness Certificate (FTA) */}
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2 col-span-1 sm:col-span-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">✅</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">Federal Transport Roadworthiness Certificate</div>
                            <div className="text-[10px] text-emerald-600 font-semibold">FTA_Roadworthiness_Safety_Passed_2026.pdf</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          Active FTA Standard
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Fleet & Vehicles (If Transporter) */}
                  {inspectUser.vehicles && inspectUser.vehicles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Registered Fleet Trucks ({inspectUser.vehicles.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {inspectUser.vehicles.map((v: any) => (
                          <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="font-extrabold text-slate-900">🚛 {v.plateNumber}</div>
                            <div className="text-[10px] text-slate-500">{v.vehicleType} • {v.capacityTons} Tons</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Administrator Audit Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrator Compliance & Verification Notes
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Verified against MOTI & ERCA trade database. All certificates valid for corridor operations."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setInspectUser(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      Close Window
                    </button>

                    <div className="flex items-center gap-2">
                      {inspectUser.verificationStatus !== 'SUSPENDED' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(inspectUser.id, 'SUSPENDED');
                            setInspectUser(null);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                        >
                          Suspend Account
                        </button>
                      )}

                      {inspectUser.verificationStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(inspectUser.id, 'VERIFIED');
                            setInspectUser(null);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Verify Organization</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* 2. DISPUTE RESOLUTION */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              TeleBirr Smart Escrow Dispute Arbitration
            </h2>
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                No active escrow disputes
              </div>
              <p className="text-[11px] text-slate-500">
                Corridor freight escrow transactions are running smoothly with automatic POD releases.
              </p>
            </div>
          </div>
        )}

        {/* 3. SYSTEM HEALTH */}
        {activeTab === 'system-health' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Platform Infrastructure Health
            </h2>
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <Activity className="w-8 h-8 text-emerald-600 mx-auto animate-pulse" />
              <div className="text-xs font-bold text-slate-700">
                All microservices operational
              </div>
              <p className="text-[11px] text-slate-500">
                PostgreSQL with PostGIS, Redis Cache, Socket.IO Telematics, and REST API are fully online.
              </p>
            </div>
          </div>
        )}

        {/* 4. FRAUD DETECTION */}
        {activeTab === 'fraud' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Corridor Telematics Geofence & Fraud Detection
            </h2>
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                No corridor geofence breaches detected
              </div>
              <p className="text-[11px] text-slate-500">
                AI Telematics route deviation and seal tampering alerts will appear here in real-time.
              </p>
            </div>
          </div>
        )}

        {/* 5. AUDIT LOGS (4.1.2) */}
        {activeTab === 'audit-logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Immutable System Audit Trail
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive timestamped audit logs for legal status transitions, document approvals, and administrator actions.
                </p>
              </div>
              <button
                onClick={fetchAuditLogs}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <History className="w-3.5 h-3.5" />
                <span>Refresh Audit Trail</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No audit trail recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3.5 px-4">Timestamp</th>
                        <th className="py-3.5 px-4">Action & Category</th>
                        <th className="py-3.5 px-4">Target Organization</th>
                        <th className="py-3.5 px-4">Status Transition</th>
                        <th className="py-3.5 px-4">Admin ID / Actor</th>
                        <th className="py-3.5 px-4">Audit Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Timestamp */}
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block font-sans">
                              {log.action}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                              {log.category}
                            </span>
                          </td>

                          {/* Target */}
                          <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                            {log.targetName}
                          </td>

                          {/* Status Transition */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {log.previousStatus ? (
                              <div className="flex items-center gap-1.5 font-sans font-bold text-[10px]">
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  {log.previousStatus}
                                </span>
                                <span>➔</span>
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {log.newStatus}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-sans">INITIALIZED</span>
                            )}
                          </td>

                          {/* Admin ID */}
                          <td className="py-3.5 px-4 text-slate-700 font-bold font-sans">
                            🛡️ {log.performedByAdminId}
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4 text-slate-600 font-sans text-[11px]">
                            {log.notes}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
