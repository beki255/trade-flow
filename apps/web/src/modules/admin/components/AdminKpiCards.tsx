import React from 'react';
import { AdminStats } from '../types';

interface AdminKpiCardsProps {
  stats: AdminStats;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ stats }) => {
  return (
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
  );
};
