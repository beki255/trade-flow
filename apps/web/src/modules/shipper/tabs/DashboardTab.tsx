import {
  PlusCircle,
  Package,
  Inbox,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { ShipmentItem, BidItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {t('shipper.welcome')}, {user?.fullName || 'Shipper'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('shipper.subtitle')}
          </p>
        </div>

        <button
          onClick={onNavigatePostLoad}
          className="relative z-10 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('shipper.postNewLoad')}</span>
        </button>
      </div>

      {/* Quick Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            {t('shipper.activeShipments')}
          </div>
          <div className="text-2xl font-black text-slate-900">
            {shipments.length}
          </div>
          <div className="text-[10px] text-sky-600 font-semibold">
            {t('shipper.corridorRoute')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            {t('shipper.pendingQuotes')}
          </div>
          <div className="text-2xl font-black text-slate-900">
            {bids.length}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">
            {t('shipper.transporterQuotes')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            {t('shipper.customsStatus')}
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {t('shipper.compliant')}
          </div>
          <div className="text-[10px] text-slate-400">
            {t('shipper.checkpoints')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase">
            {t('shipper.escrowProtected')}
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {t('shipper.smartEscrow')}
          </div>
          <div className="text-[10px] text-slate-400">
            {t('shipper.escrowSupport')}
          </div>
        </div>
      </div>

      {/* Recent Shipments Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
            <Package className="w-4 h-4 text-sky-600" />
            <span>{t('shipper.shipmentRegister')}</span>
          </div>
          {onNavigateConsignments && (
            <button
              type="button"
              onClick={onNavigateConsignments}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{t('shipper.viewAllConsignments')} ➔</span>
            </button>
          )}
        </div>

        {shipments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              {t('shipper.noPostings')}
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              {t('shipper.noPostingsSub')}
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
                    <span className="text-xs font-black text-slate-900 capitalize">{s.title}</span>
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
                        <span>{s.bidsCount} {t('shipper.quotes')}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400">{t('shipper.quotesYet')}</div>
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
                      title={t('shipper.deleteConsignment')}
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
