import React from 'react';
import { PostedLoadItem } from './CorridorLiveMap';

interface TrackingConsignmentCardProps {
  load: PostedLoadItem;
  isSelected: boolean;
  isLoadDelivered: boolean;
  isLoadInTransit: boolean;
  isLoadDispatched: boolean;
  onSelect: () => void;
}

export const TrackingConsignmentCard: React.FC<TrackingConsignmentCardProps> = ({
  load,
  isSelected,
  isLoadDelivered,
  isLoadInTransit,
  isLoadDispatched,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isSelected
          ? isLoadDelivered
            ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/30 shadow-md transform -translate-y-0.5'
            : 'bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/30 shadow-md transform -translate-y-0.5'
          : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-sm'
      }`}
    >
      {/* Active Indicator Border Pill */}
      {isSelected && (
        <div
          className={`absolute top-0 right-0 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg shadow-sm ${
            isLoadDelivered ? 'bg-purple-600' : 'bg-sky-600'
          }`}
        >
          {isLoadDelivered
            ? '✓ Delivered & Completed'
            : isLoadInTransit
            ? 'Live Tracking Active'
            : 'Consignment Selected'}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pr-14">
        <h4 className="text-sm font-black text-slate-900 truncate capitalize">
          {load.title}
        </h4>
        <span
          className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
            isLoadDelivered
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : isLoadInTransit
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isLoadDispatched
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isLoadDelivered
            ? '✓ DELIVERED'
            : isLoadInTransit
            ? '🟢 IN TRANSIT'
            : isLoadDispatched
            ? 'DISPATCHED'
            : load.status}
        </span>
      </div>

      {/* Origin ➔ Destination Route */}
      <div className="mt-2.5 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="line-clamp-1 font-medium">{load.origin}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <span className="line-clamp-1 font-medium">{load.destination}</span>
        </div>
      </div>

      {/* Weight, Distance & Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
        <span className="text-slate-500">
          Gross: {load.weightTons} Tons {load.distanceKm ? `• ${load.distanceKm} km` : ''}
        </span>
        <span
          className={`flex items-center gap-1 ${
            isSelected
              ? isLoadDelivered
                ? 'text-purple-700 font-black'
                : 'text-sky-700 font-black'
              : isLoadDelivered
              ? 'text-purple-700 font-bold'
              : isLoadInTransit
              ? 'text-emerald-700 font-bold'
              : 'text-sky-600'
          }`}
        >
          {isSelected
            ? isLoadDelivered
              ? 'Viewing e-POD ✓'
              : isLoadInTransit
              ? 'Viewing Live Map ✓'
              : 'Viewing Status ✓'
            : isLoadDelivered
            ? 'Delivered & Settled ✓'
            : isLoadInTransit
            ? 'Live GPS Active ➔'
            : isLoadDispatched
            ? 'Awaiting Start Trip ⏳'
            : 'Awaiting Bids ➔'}
        </span>
      </div>
    </div>
  );
};
