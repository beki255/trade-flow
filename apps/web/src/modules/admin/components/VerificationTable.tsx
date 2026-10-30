import React from 'react';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { VerificationUser } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface VerificationTableProps {
  loading: boolean;
  filteredUsers: VerificationUser[];
  onInspectUser: (user: VerificationUser) => void;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => void;
}

export const VerificationTable: React.FC<VerificationTableProps> = ({
  loading,
  filteredUsers,
  onInspectUser,
  onUpdateStatus,
}) => {
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        {language === 'AM' ? 'የማረጋገጫ ተራ በመጫን ላይ...' : language === 'OM' ? 'Dabareen mirkaneessaa fe\'amaa jira...' : 'Loading verification queue...'}
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 space-y-2">
        <div className="text-2xl">🔍</div>
        <div className="font-bold text-slate-700">
          {language === 'AM' ? 'ተዛማጅ ድርጅት አልተገኘም' : language === 'OM' ? 'Dhaabbanni walsimu hin argamne' : 'No matching organizations found'}
        </div>
        <p className="text-[11px] text-slate-400">
          {language === 'AM' ? 'እባክዎ የማጣሪያ ሁኔታውን፣ ሚናውን ወይም የፍለጋ ቃሉን ይቀይሩ።' : language === 'OM' ? 'Mee calaltuu haala, gahee ykn barbaacha keessan jijjiiraa.' : 'Try changing your status filter, role filter, or search query.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
            <th className="py-3.5 px-4">{language === 'AM' ? 'ድርጅት / ተጠቃሚ' : language === 'OM' ? 'Dhaabbata / Fayyadamaa' : 'Organization / User'}</th>
            <th className="py-3.5 px-4">{language === 'AM' ? 'ሚና' : language === 'OM' ? 'Gahee' : 'Role'}</th>
            <th className="py-3.5 px-4">{language === 'AM' ? 'የግብር መለያ (TIN) እና ንግድ ፈቃድ' : language === 'OM' ? 'TIN fi Eeyyama Daldalaa' : 'TIN & Trade License'}</th>
            <th className="py-3.5 px-4">{language === 'AM' ? 'የህግ ተገዢነት ሁኔታ' : language === 'OM' ? 'Haala Seera Qabeessummaa' : 'Compliance Status'}</th>
            <th className="py-3.5 px-4 text-right">{language === 'AM' ? 'እርምጃዎች' : language === 'OM' ? 'Tarkaanfiiwwan' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredUsers.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
              {/* User & Company */}
              <td className="py-4 px-4">
                <div className="font-extrabold text-slate-900">
                  {item.role === 'DRIVER'
                    ? item.fullName
                    : item.role === 'CUSTOMS_OFFICER'
                    ? item.fullName
                    : (item.companyName || item.fullName)}
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                  {item.role === 'DRIVER' ? (
                    <>
                      <span>🏢 Fleet: {item.companyName || 'Carrier Network'}</span>
                      <span>•</span>
                      <span>📞 {item.phone}</span>
                    </>
                  ) : item.role === 'CUSTOMS_OFFICER' ? (
                    <>
                      <span>🏛️ Station: {item.companyName || 'Customs Border Post'}</span>
                      <span>•</span>
                      <span>📞 {item.phone}</span>
                      {item.email && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{item.email}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span>👤 {item.fullName}</span>
                      <span>•</span>
                      <span>📞 {item.phone}</span>
                      {item.email && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{item.email}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </td>

              {/* Role Badge */}
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                    item.role === 'DRIVER'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : item.role === 'CUSTOMS_OFFICER'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {item.role === 'DRIVER'
                    ? (language === 'AM' ? '🚚 አሽከርካሪ' : language === 'OM' ? '🚚 Konkolaachisaa' : '🚚 DRIVER')
                    : item.role === 'CUSTOMS_OFFICER'
                    ? (language === 'AM' ? '🛡️ የጉምሩክ መኮንን' : language === 'OM' ? '🛡️ Hojjataa Gumruukaa' : '🛡️ CUSTOMS OFFICER')
                    : item.role === 'FREIGHT_FORWARDER'
                    ? (language === 'AM' ? '📦 አስተላላፊ' : language === 'OM' ? '📦 Qindeessaa' : '📦 FORWARDER')
                    : item.role}
                </span>
              </td>

              {/* TIN & License / Driver License / Customs Badge */}
              <td className="py-4 px-4 font-mono text-[11px] text-slate-700">
                {item.role === 'DRIVER' ? (
                  <div>
                    <div>
                      DL: <span className="font-bold text-slate-900">{item.driverProfile?.driverLicenseNo || (language === 'AM' ? 'በመጠባበቅ ላይ' : 'Pending')}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{item.driverProfile?.licenseClass || 'Grade 5'}</span>
                      {item.driverProfile?.assignedVehicle?.plateNumber && (
                        <span>• 🚛 {item.driverProfile.assignedVehicle.plateNumber}</span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        🪪 {language === 'AM' ? 'የመንጃ ፈቃድ' : language === 'OM' ? 'Hayyama Konkolaachisummaa' : 'Driver License'}
                      </span>
                    </div>
                  </div>
                ) : item.role === 'CUSTOMS_OFFICER' ? (
                  <div>
                    <div>
                      Gov Badge: <span className="font-bold text-amber-900">{item.tin || 'ECC-OFFICIAL'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        🏛️ {language === 'AM' ? 'የኢትዮጵያ ጉምሩክ ኮሚሽን' : language === 'OM' ? 'Koomishinii Gumruukaa Itoophiyaa' : 'Ethiopian Customs Commission'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>
                      TIN: <span className="font-bold text-slate-900">{item.tin || (language === 'AM' ? 'የለም' : 'None')}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span>Lic: {item.tradeLicenseNo || (language === 'AM' ? 'የለም' : 'None')}</span>
                      {(item.tradeLicenseDoc || item.insuranceDoc || item.roadworthinessDoc) && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          📄 {language === 'AM' ? 'ሰነዶች ተያይዘዋል' : language === 'OM' ? 'Sanadoonni Qabsiifamaniiru' : 'Docs Attached'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </td>

              {/* Verification Status & Flags */}
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div>
                    {item.verificationStatus === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> {language === 'AM' ? 'የተረጋገጠ' : language === 'OM' ? 'Mirkanaa\'e' : 'VERIFIED'}
                      </span>
                    )}
                    {item.verificationStatus === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> {language === 'AM' ? 'በመጠባበቅ ላይ' : language === 'OM' ? 'Eeggamaa jira' : 'PENDING'}
                      </span>
                    )}
                    {item.verificationStatus === 'SUSPENDED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" /> {language === 'AM' ? 'የታገደ' : language === 'OM' ? 'Haggameera' : 'SUSPENDED'}
                      </span>
                    )}
                  </div>

                  {/* Exception Condition 6.7: Automated Performance Review (< 3.0 Stars) */}
                  {(item.performanceReviewRequired || item.verificationNotes?.includes('[AUTOMATED PERFORMANCE REVIEW]')) && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-100/90 text-amber-900 border border-amber-300 shadow-xs">
                      <span>⚠️ {language === 'AM' ? 'የአፈጻጸም ግምገማ (< 3.0★)' : language === 'OM' ? 'Gamaaggama Hojii (< 3.0★)' : 'Performance Review (< 3.0★)'}</span>
                    </div>
                  )}

                  {/* Exception Condition 6.9: Duplicate Account Detected */}
                  {(item.duplicateAccountDetected || item.verificationNotes?.includes('[DUPLICATE ACCOUNT DETECTED]')) && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-100/90 text-rose-900 border border-rose-300 shadow-xs">
                      <span>🚨 {language === 'AM' ? 'የተደገመ አካውንት ጥቆማ' : language === 'OM' ? 'Akeekkachiisa Herrega Dachaa' : 'Duplicate Account Flag'}</span>
                    </div>
                  )}

                  {item.verificationNotes && (
                    <div className="text-[10px] text-slate-500 font-medium max-w-[220px] leading-tight line-clamp-2" title={item.verificationNotes}>
                      {item.verificationNotes}
                    </div>
                  )}
                </div>
              </td>

              {/* Admin Action Buttons */}
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onInspectUser(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-slate-600" />
                    <span>{language === 'AM' ? 'ዝርዝር መርምር' : language === 'OM' ? 'Bal\'ina Sakatta\'i' : 'Inspect Details'}</span>
                  </button>

                  {item.verificationStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'VERIFIED')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                    >
                      {item.role === 'DRIVER'
                        ? (language === 'AM' ? 'አሽከርካሪ አጽድቅ' : language === 'OM' ? 'Konkolaachisaa Raggaasi' : 'Approve Driver')
                        : (language === 'AM' ? 'አጽድቅ' : language === 'OM' ? 'Raggaasi' : 'Approve')}
                    </button>
                  )}
                  {item.verificationStatus !== 'SUSPENDED' && (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'SUSPENDED')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-all cursor-pointer"
                    >
                      {language === 'AM' ? 'እገድ' : language === 'OM' ? 'Haggami' : 'Suspend'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
