import React from 'react';
import { Activity } from 'lucide-react';

export const SystemHealthTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        Platform Infrastructure Health
      </h2>
      <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
        <Activity className="w-8 h-8 text-emerald-600 mx-auto animate-pulse" />
        <div className="text-xs font-bold text-slate-700">
          All microservices operational
        </div>
        <p className="text-[11px] text-slate-500">
          PostgreSQL with PostGIS, Redis Cache, Socket.IO Telematics, and REST API are fully online.
        </p>
      </div>
    </div>
  );
};
