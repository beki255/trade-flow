import React from 'react';
import { Activity } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export const SystemHealthTab: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('admin.healthTitle') || 'System Health & Platform Telemetry'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('admin.healthSubtitle') || 'Platform telemetry, infrastructure diagnostics, and service health dashboard.'}
          </p>
        </div>
      </div>

      {/* Empty Dashboard Card */}
      <div className="p-12 sm:p-16 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <Activity className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">
            {language === 'AM'
              ? 'የስርዓት ጤና ዳሽቦርድ'
              : language === 'OM'
              ? 'Daashboordii Fayyaa Sirnaa'
              : 'System Health Dashboard'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {language === 'AM'
              ? 'የስርዓት እና የመሠረተ ልማት መከታተያ ዳሽቦርድ በቅርቡ ይገናኛል።'
              : language === 'OM'
              ? 'Daashboordiin hordoffii sirnaa fi bu\'uuraalee misoomaa dhiyootti ni hojjeta.'
              : 'Infrastructure telemetry and diagnostic services dashboard will appear here once connected.'}
          </p>
        </div>
      </div>
    </div>
  );
};
