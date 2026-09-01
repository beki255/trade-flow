import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisputesTab: React.FC = () => {
  return (
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
  );
};
