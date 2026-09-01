import React from 'react';
import { GitMerge } from 'lucide-react';

export const TransporterBiddingTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        Master Transporter Corridor Bidding
      </h2>
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <GitMerge className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          Corridor Multi-Carrier Dispatch
        </div>
        <p className="text-[11px] text-slate-500">
          Dispatch master freight contracts to registered Ethiopian fleet operators with negotiated volume discounts.
        </p>
      </div>
    </div>
  );
};
