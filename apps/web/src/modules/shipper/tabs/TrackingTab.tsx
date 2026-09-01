import React from 'react';
import { Navigation } from 'lucide-react';

export const TrackingTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tight">
        Live Corridor Telematics Map
      </h2>
      <div className="p-8 rounded-3xl bg-[#090E17] text-white border border-slate-800 text-center space-y-3">
        <Navigation className="w-10 h-10 text-sky-400 mx-auto animate-pulse" />
        <div className="text-sm font-bold">
          Djibouti–Addis Ababa Corridor Telematics Stream Active
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Real-time GPS coordinates and checkpoint pass events are streamed live across Lake Abbe, Galafi, Mojo Dry Port, and Kaliti Customs terminals.
        </p>
      </div>
    </div>
  );
};
