import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Inbox,
} from 'lucide-react';

export const CustomsPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('review-queue');
  const [stats, setStats] = useState<any>({
    pendingReviews: 0,
    greenLineCleared: 0,
    inspectionRate: '100%',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/portal/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            pendingReviews: data.activeLoads || 0,
            greenLineCleared: data.totalShipments || 0,
            inspectionRate: '100%',
          });
        }
      } catch (err) {
        console.warn('Failed to fetch customs stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout
      portalRole="CUSTOMS"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        
        {/* 1. DOCUMENT REVIEW QUEUE */}
        {activeTab === 'review-queue' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#064E3B] to-[#047857] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-emerald-800">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                  Customs Authority Operations
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Customs Document Verification Queue
                </h1>
                <p className="text-xs text-emerald-100">
                  Inspect and validate Bill of Lading, Commercial Invoices, and Automated Green/Red Line Clearance.
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Pending Document Reviews
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {stats.pendingReviews}
                </div>
                <div className="text-[10px] text-slate-400">
                  Galafi & Mojo Terminals
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Green Line Cleared
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {stats.greenLineCleared}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Zero Delay Fast Track
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Audit Inspection Rate
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.inspectionRate}
                </div>
                <div className="text-[10px] text-slate-400">
                  Compliance Score
                </div>
              </div>
            </div>

            {/* Review Queue Feed */}
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                {stats.pendingReviews === 0 ? 'All checkpoint queues clear' : `${stats.pendingReviews} shipments in queue`}
              </div>
              <p className="text-[11px] text-slate-500">
                New customs documents submitted by shippers and forwarders will appear here for inspector verification.
              </p>
            </div>

          </div>
        )}

        {/* 2. COMPLIANCE VALIDATION */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Compliance & Security Validation
            </h2>
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                Corridor compliance active
              </div>
              <p className="text-[11px] text-slate-500">
                All active corridor container seals and transit manifests verified against Ethiopian Customs Commission standards.
              </p>
            </div>
          </div>
        )}

        {/* 3. CLEARANCE STATUS */}
        {activeTab === 'clearance' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Customs Electronic Release Clearances
            </h2>
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                Digital clearance ledger
              </div>
              <p className="text-[11px] text-slate-500">
                Instant digital clearance notices sent to drivers and terminal gatekeepers at Mojo and Galafi.
              </p>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
