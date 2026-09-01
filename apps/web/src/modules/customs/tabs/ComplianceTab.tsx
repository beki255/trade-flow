import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ComplianceTab: React.FC = () => {
  return (
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
  );
};
