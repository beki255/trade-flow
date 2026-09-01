import React from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  FileText,
} from 'lucide-react';
import { VerificationUser, AdminStats } from '../types';
import { AdminKpiCards } from '../components/AdminKpiCards';

interface VerificationQueueTabProps {
  stats: AdminStats;
  actionSuccess: string;
  filteredUsers: VerificationUser[];
  totalUsersCount: number;
  statusFilter: 'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  setStatusFilter: (val: 'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED') => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
  onInspectUser: (user: VerificationUser) => void;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => void;
  pendingCount: number;
  verifiedCount: number;
  suspendedCount: number;
}

export const VerificationQueueTab: React.FC<VerificationQueueTabProps> = ({
  stats,
  actionSuccess,
  filteredUsers,
  totalUsersCount,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  searchQuery,
  setSearchQuery,
  loading,
  onRefresh,
  onInspectUser,
  onUpdateStatus,
  pendingCount,
  verifiedCount,
  suspendedCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            System Administration
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            User Verification & KYC Queue
          </h1>
          <p className="text-xs text-slate-400">
            Review submitted TIN numbers, Trade Licenses, Insurance, and Roadworthiness documents for Shippers, Forwarders, Transporters, and Drivers.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>TradeFlow Compliance Engine</span>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <AdminKpiCards stats={stats} />

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
              Onboarding Verification Queue ({filteredUsers.length} of {totalUsersCount})
            </h2>
            <p className="text-xs text-slate-400">
              Review legal identities, trade licenses, and insurance certificates
            </p>
          </div>
          <button
            onClick={onRefresh}
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
              All ({totalUsersCount})
            </button>

            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('VERIFIED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'VERIFIED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified ({verifiedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'SUSPENDED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Suspended ({suspendedCount})</span>
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
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
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
                      <div>
                        TIN: <span className="font-bold text-slate-900">{item.tin || 'Pending'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Lic: {item.tradeLicenseNo || 'Attached'}
                      </div>
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
                          onClick={() => onInspectUser(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span>Inspect Details</span>
                        </button>

                        {item.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => onUpdateStatus(item.id, 'VERIFIED')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            Approve
                          </button>
                        )}
                        {item.verificationStatus !== 'SUSPENDED' && (
                          <button
                            onClick={() => onUpdateStatus(item.id, 'SUSPENDED')}
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
    </div>
  );
};
