import React from 'react';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { VerificationUser, AdminStats } from '../types';
import { AdminKpiCards } from '../components/AdminKpiCards';
import { CommissionCustomsModal } from '../components/CommissionCustomsModal';
import { VerificationFilterBar } from '../components/VerificationFilterBar';
import { VerificationTable } from '../components/VerificationTable';
import { useLanguage } from '../../../context/LanguageContext';

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
  const { t } = useLanguage();
  const [isProvisionOpen, setIsProvisionOpen] = React.useState(false);
  const [provisionNotice, setProvisionNotice] = React.useState('');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {t('admin.verificationsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('admin.verificationsSubtitle')}
          </p>
        </div>
        <div className="relative z-10 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Compliance Engine</span>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <AdminKpiCards stats={stats} />

      {/* Action Feedback Banner */}
      {(actionSuccess || provisionNotice) && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess || provisionNotice}</span>
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
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsProvisionOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Commission Customs Inspector</span>
            </button>
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Refresh Queue
            </button>
          </div>
        </div>

        {/* Modular Filter Bar (Status Pills, Role Selector & Search) */}
        <VerificationFilterBar
          totalUsersCount={totalUsersCount}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          pendingCount={pendingCount}
          verifiedCount={verifiedCount}
          suspendedCount={suspendedCount}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Modular Live Verification Table */}
        <VerificationTable
          loading={loading}
          filteredUsers={filteredUsers}
          onInspectUser={onInspectUser}
          onUpdateStatus={onUpdateStatus}
        />
      </div>

      {/* Modular Official Customs Inspector Commissioning Modal */}
      <CommissionCustomsModal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        onSuccess={(notice) => {
          setProvisionNotice(notice);
          setTimeout(() => setProvisionNotice(''), 5000);
          onRefresh();
        }}
      />
    </div>
  );
};
