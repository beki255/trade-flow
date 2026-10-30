import React, { useState, useEffect } from 'react';
import { History, TrendingUp, ShieldCheck, Scale, RefreshCw, FileText } from 'lucide-react';
import { AuditLogItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AuditLogsTabProps {
  auditLogs: AuditLogItem[];
  onRefresh: () => void;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ auditLogs, onRefresh }) => {
  const { t, language } = useLanguage();
  const [activeLogSection, setActiveLogSection] = useState<'SYSTEM' | 'PRICING'>('SYSTEM');
  const [pricingLogs, setPricingLogs] = useState<any[]>([]);
  const [pricingLoading, setPricingLoading] = useState<boolean>(false);

  const fetchPricingLogs = async () => {
    try {
      setPricingLoading(true);
      const res = await fetch('/api/pricing/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setPricingLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch pricing logs:', err);
    } finally {
      setPricingLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingLogs();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {t('admin.auditTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('admin.auditSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveLogSection('SYSTEM')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeLogSection === 'SYSTEM'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'AM' ? 'የስርዓት ክንውኖች' : language === 'OM' ? 'Hojiiwwan Sirnichaa' : 'System Operations'} ({auditLogs.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveLogSection('PRICING');
                fetchPricingLogs();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeLogSection === 'PRICING'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'AM' ? 'የዋጋ ስሌት ኦዲት' : language === 'OM' ? 'Ooditii Shallaggii Gatii' : 'Pricing Engine Audit'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              onRefresh();
              fetchPricingLogs();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>{language === 'AM' ? 'አድስ' : language === 'OM' ? 'Haaromsi' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 1. SYSTEM & ADMINISTRATIVE AUDIT LOG */}
      {activeLogSection === 'SYSTEM' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {language === 'AM' ? 'ምንም የኦዲት መዝገብ አልተገኘም።' : language === 'OM' ? 'Galmeen ooditii hin jiru.' : 'No audit trail recorded yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-4">{language === 'AM' ? 'ቀንና ሰዓት' : language === 'OM' ? 'Yeroo' : 'Timestamp'}</th>
                    <th className="py-3.5 px-4">{language === 'AM' ? 'ክንውን እና ምድብ' : language === 'OM' ? 'Tarkaanfii fi Garee' : 'Action & Category'}</th>
                    <th className="py-3.5 px-4">{language === 'AM' ? 'የሚመለከተው ድርጅት' : language === 'OM' ? 'Dhaabbata Xiyyeeffatame' : 'Target Organization'}</th>
                    <th className="py-3.5 px-4">{language === 'AM' ? 'የሁኔታ ለውጥ' : language === 'OM' ? 'Jijjiirama Haalaa' : 'Status Transition'}</th>
                    <th className="py-3.5 px-4">{language === 'AM' ? 'አስተዳዳሪ / ፈጻሚ' : language === 'OM' ? 'Bulchaa / Raawwataa' : 'Admin ID / Actor'}</th>
                    <th className="py-3.5 px-4">{language === 'AM' ? 'የኦዲት ማስታወሻዎች' : language === 'OM' ? 'Yaadannoo Ooditii' : 'Audit Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block font-sans">
                          {log.action}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                          {log.category}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                        {log.targetName}
                      </td>

                      {/* Status Transition */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.previousStatus ? (
                          <div className="flex items-center gap-1.5 font-sans font-bold text-[10px]">
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {log.previousStatus}
                            </span>
                            <span>➔</span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {log.newStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans">INITIALIZED</span>
                        )}
                      </td>

                      {/* Admin ID */}
                      <td className="py-3.5 px-4 text-slate-700 font-bold font-sans">
                        🛡️ {log.performedByAdminId}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-slate-600 font-sans text-[11px]">
                        {log.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. DYNAMIC PRICING ENGINE AUDIT TRAIL (FR-04.3) */}
      {activeLogSection === 'PRICING' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-5">
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs text-sky-900">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>{language === 'AM' ? 'የክርክር መፍቻ እና የኦዲት መረጃ፡' : language === 'OM' ? 'Furmaata Falmii fi Odeeffannoo Ooditii:' : 'Dispute Resolution & Audit Access:'}</strong>{' '}
                {language === 'AM'
                  ? 'በስሌት ጊዜ የተመዘገቡ ሁሉም የዋጋ ተለዋዋጮች ለህጋዊ ግምገማና ለሂሳብ ክርክር ሽምግልና ተመዝግበው ተቀምጠዋል።'
                  : language === 'OM'
                  ? 'Jijjiiramoonni gatii shallaggii yeroo raawwataman hundi gamaaggama seeraa fi araara falmii kaffaltiif galmaa\'aniiru.'
                  : 'All rate variables recorded at calculation time are logged for compliance review and invoice dispute arbitration.'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-300">
              {pricingLogs.length} {language === 'AM' ? 'የዋጋ ስሌቶች ተመዝግበዋል' : language === 'OM' ? 'Shallaggiin Galmaa\'e' : 'Calculations Logged'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3.5">{language === 'AM' ? 'ቀንና ሰዓት' : language === 'OM' ? 'Yeroo' : 'Timestamp'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'የኮሪደር መስመር' : language === 'OM' ? 'Daandii Koriidarii' : 'Corridor Route'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'ርቀት' : language === 'OM' ? 'Fageenya' : 'Distance'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'መነሻ ተመን' : language === 'OM' ? 'Gatii Ka\'umsaa' : 'Base Rate'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'የፍላጎት ምጣኔ' : language === 'OM' ? 'Reeshoo Fedhii' : 'Demand Ratio'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'የነዳጅ ማባዣ' : language === 'OM' ? 'Gatii Boba\'aa' : 'Fuel Multiplier'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'የኬላ መዘግየት' : language === 'OM' ? 'Dabalata Sakatta\'aa' : 'Checkpoint Delay'}</th>
                  <th className="py-3 px-3.5">{language === 'AM' ? 'ዝቅተኛ / ከፍተኛ ወሰን' : language === 'OM' ? 'Daangaa Gadiaana / Ol\'aana' : 'Floor / Ceiling Band'}</th>
                  <th className="py-3 px-3.5 font-black text-slate-900">{language === 'AM' ? 'የተሰላ ዋጋ' : language === 'OM' ? 'Gatii Shallagame' : 'Calculated Spot'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {pricingLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                      {language === 'AM' ? 'ምንም የተመዘገበ የዋጋ ስሌት የለም።' : language === 'OM' ? 'Shallaggiin gatii hin jiru.' : 'No pricing calculations recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  pricingLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 font-sans font-bold text-slate-800">
                        {log.corridorName}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {log.baseDistanceKm} km
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">
                        ETB {log.baseCorridorRateEtb?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-amber-600 font-bold">
                        {log.demandRatio}×
                      </td>
                      <td className="py-3 px-3.5 text-sky-600 font-bold">
                        {log.fuelCostIndex}×
                      </td>
                      <td className="py-3 px-3.5 text-purple-600">
                        ETB {log.congestionSurchargeEtb?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 text-[10px]">
                        ETB {log.floorBoundEtb?.toLocaleString()} - {log.ceilingBoundEtb?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 font-sans font-black text-emerald-700">
                        ETB {log.finalRateEtb?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};