import React from 'react';
import { AdminStats } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AdminKpiCardsProps {
  stats: AdminStats;
}

export const AdminKpiCards: React.FC<AdminKpiCardsProps> = ({ stats }) => {
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase">
          {language === 'AM' ? 'የሚጠባበቁ ማረጋገጫዎች' : language === 'OM' ? 'Mirkaneessa Eegamu' : 'Pending KYC'}
        </div>
        <div className="text-2xl font-black text-amber-600">
          {stats.pendingVerifications}
        </div>
        <div className="text-[10px] text-slate-400">
          {language === 'AM' ? 'ግምገማ ያስፈልገዋል' : language === 'OM' ? 'Qorannoo Barbaada' : 'Requires Review'}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase">
          {language === 'AM' ? 'የተረጋገጡ ድርጅቶች' : language === 'OM' ? 'Dhaabbilee Mirkanaa\'an' : 'Verified Organizations'}
        </div>
        <div className="text-2xl font-black text-emerald-600">
          {stats.verifiedUsers}
        </div>
        <div className="text-[10px] text-emerald-600 font-semibold">
          {language === 'AM' ? 'በኮሪደሩ ንቁ የሆኑ' : language === 'OM' ? 'Kooridoorii Keessatti Hojiirra' : 'Active in Corridor'}
        </div>
      </div>
    </div>
  );
};
