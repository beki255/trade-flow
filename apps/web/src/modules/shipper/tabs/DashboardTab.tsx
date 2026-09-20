import {
  PlusCircle,
  Package,
  Inbox,
  Clock,
  ShieldCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { ShipmentItem, BidItem } from '../types';

interface DashboardTabProps {
  user: any;
  shipments: ShipmentItem[];
  bids: BidItem[];
  onNavigatePostLoad: () => void;
  onNavigateConsignments?: () => void;
  onNavigateBids?: () => void;
  onDeleteLoad?: (rawLoadId: string) => void;
  deleteLoadingId?: string | null;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  shipments,
  bids,
  onNavigatePostLoad,
  onNavigateConsignments,
  onNavigateBids,
  onDeleteLoad,
  deleteLoadingId,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Shipper Workspace
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome, {user?.fullName || 'Shipper'}
          </h1>
          <p className="text-xs text-slate-400">
            Manage freight postings, AI freight matching, live corridor tracking, and escrow payments.
          </p>
        </div>

        <button
          onClick={onNavigatePostLoad}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Load</span>
        </button>
      </div>

      {/* Verification Status Guidance Banner (4.1.2) */}
      {(!user?.verificationStatus || user?.verificationStatus === 'PENDING') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-950">
                Account Status: Pending Verification
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Your TIN and Trade License are currently under review by Platform Administrators. You have full access to explore corridor routes and prepare freight postings.
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold uppercase tracking-wide shrink-0">
            Pending Review
          </div>
        </div>
      )}

      {user?.verificationStatus === 'VERIFIED' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-950">
                Account Status: Verified Business Identity
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                Your legal entity is verified. All corridor logistics, live bidding, and TeleBirr smart escrow features are fully unlocked.
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide shrink-0">
            Verified
          </div>
        </div>
      )}

      {/* Quick Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Active Shipments
          </div>
          <div className="text-2xl font-black text-slate-900">
            {shipments.length}
          </div>
          <div className="text-[10px] text-sky-600 font-semibold">
            Djibouti–Addis Corridor
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Pending Quotes
          </div>
          <div className="text-2xl font-black text-slate-900">
            {bids.length}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">
            Transporter RFQ Bids
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Customs Status
          </div>
          <div className="text-2xl font-black text-emerald-600">
            Compliant
          </div>
          <div className="text-[10px] text-slate-400">
            Mojo & Galafi Checkpoints
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            Escrow Protected
          </div>
          <div className="text-2xl font-black text-sky-700">
            TeleBirr Smart
          </div>
          <div className="text-[10px] text-slate-400">
            Automated GPS POD Release
          </div>
        </div>
      </div>

      {/* Recent Shipments Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
            <Package className="w-4 h-4 text-sky-600" />
            <span>Shipment Register</span>
          </div>
          {onNavigateConsignments && (
            <button
              type="button"
              onClick={onNavigateConsignments}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All Consignments ➔</span>
            </button>
          )}
        </div>

        {shipments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              No cargo loads posted yet
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Click "Post New Load" above to publish your first shipment to the corridor marketplace.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-extrabold text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                      {s.id}
                    </span>
                    <span className="text-xs font-black text-slate-900">{s.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-100 text-sky-800">
                      {s.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    📍 {s.route} • <span className="text-sky-700 font-bold">{s.weight}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  <div className="text-left sm:text-right space-y-0.5">
                    <div className="text-xs font-black text-slate-900">{s.budget}</div>
                    {s.bidsCount && s.bidsCount > 0 ? (
                      <button
                        onClick={onNavigateBids}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <span>{s.bidsCount} Quotes</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400">0 Quotes yet</div>
                    )}
                  </div>

                  {onDeleteLoad && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLoad(s.rawId);
                      }}
                      disabled={deleteLoadingId === s.rawId}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                      title="Delete / Cancel Consignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
