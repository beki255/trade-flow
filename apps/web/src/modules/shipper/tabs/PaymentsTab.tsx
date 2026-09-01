import React from 'react';
import { CreditCard } from 'lucide-react';

export const PaymentsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        Payment History & TeleBirr Smart Escrow
      </h2>
      <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
        <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          No transactions recorded yet
        </div>
        <p className="text-[11px] text-slate-500">
          TeleBirr smart escrow locks and automated milestone releases will appear here.
        </p>
      </div>
    </div>
  );
};
