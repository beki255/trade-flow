import React from 'react';
import { FileCheck2 } from 'lucide-react';

export const CustomsCoordinationTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        Batch Customs Document Filing
      </h2>
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          Consolidated Customs Clearance Pipeline
        </div>
        <p className="text-[11px] text-slate-500">
          File single-window transit declarations for multi-shipper consolidated containers at Galafi and Mojo Dry Port.
        </p>
      </div>
    </div>
  );
};
