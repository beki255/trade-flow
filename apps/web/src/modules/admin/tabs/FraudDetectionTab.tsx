import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const FraudDetectionTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        Corridor Telematics Geofence & Fraud Detection
      </h2>
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          No corridor geofence breaches detected
        </div>
        <p className="text-[11px] text-slate-500">
          AI Telematics route deviation and seal tampering alerts will appear here in real-time.
        </p>
      </div>
    </div>
  );
};
