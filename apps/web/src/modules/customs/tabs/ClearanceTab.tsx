import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const ClearanceTab: React.FC = () => {
  return (
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
  );
};
