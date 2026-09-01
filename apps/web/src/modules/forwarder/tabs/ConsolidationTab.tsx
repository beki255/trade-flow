import React from 'react';
import { Layers } from 'lucide-react';

export const ConsolidationTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        LTL Consolidation Wizard
      </h2>
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <Layers className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          No pending partial loads available
        </div>
        <p className="text-[11px] text-slate-500">
          Combine multiple smaller LTL loads into a single high-cube FTL container to reduce corridor haulage costs.
        </p>
      </div>
    </div>
  );
};
