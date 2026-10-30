import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Stamp,
  Printer,
  Download,
  Search,
  RefreshCw,
  Building,
  Truck,
  ShieldCheck,
  FileCheck2,
  FileText,
  ExternalLink,
  QrCode,
  Lock,
  ArrowLeft,
  X,
} from 'lucide-react';
import { ClearanceLedgerItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ClearanceTabProps {
  ledger: ClearanceLedgerItem[];
  loading: boolean;
  onRefresh: () => void;
  selectedCertificateShipmentId?: string | null;
}

export const ClearanceTab: React.FC<ClearanceTabProps> = ({
  ledger = [],
  loading,
  onRefresh,
  selectedCertificateShipmentId,
}) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCertificate, setActiveCertificate] = useState<ClearanceLedgerItem | null>(() => {
    if (selectedCertificateShipmentId) {
      return ledger.find((l) => l.shipmentId === selectedCertificateShipmentId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (selectedCertificateShipmentId && ledger.length > 0) {
      const match = ledger.find((l) => l.shipmentId === selectedCertificateShipmentId);
      if (match) {
        setActiveCertificate(match);
      }
    }
  }, [selectedCertificateShipmentId, ledger]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCertificate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter ledger records
  const filteredLedger = ledger.filter((item) => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchCert = item.certificateNo.toLowerCase().includes(q);
      const matchLoad = item.loadCode.toLowerCase().includes(q);
      const matchShipper = item.shipperCompany.toLowerCase().includes(q) || item.shipperTin.toLowerCase().includes(q);
      const matchPlate = item.carrierPlate.toLowerCase().includes(q);
      const matchRoute = item.route.toLowerCase().includes(q);
      return matchCert || matchLoad || matchShipper || matchPlate || matchRoute;
    }
    return true;
  });

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('customs.clearanceTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('customs.clearanceSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/customs/compliance')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>{language === 'AM' ? 'ወደ ምርመራ ተመለስ' : language === 'OM' ? 'Gara Sakatta\'aatti' : 'Back to Compliance'}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (language === 'AM' ? 'በማመሳሰል ላይ...' : 'Syncing...') : (language === 'AM' ? 'መዝገቡን አመሳስል' : language === 'OM' ? 'Galmee Walsimsiisi' : 'Sync Registry')}</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>{language === 'AM' ? `የተመዘገቡ የጸደቁ ጭነቶች (${filteredLedger.length})` : language === 'OM' ? `Fe'isa Hayyamame Galmaa'e (${filteredLedger.length})` : `Cleared Consignments Registered (${filteredLedger.length})`}</span>
        </div>

        <div className="relative min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'AM' ? 'በሰርተፊኬት ቁጥር፣ ጭነት ኮድ ወይም ታርጋ ፈልግ...' : language === 'OM' ? 'Lakkoofsa waraqaa ragaa, koodii fe\'isaa ykn gabatee barbaadi...' : 'Search by Certificate #, Consignment Code, or Plate...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* 3. Ledger Table */}
      {filteredLedger.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            {language === 'AM' ? 'ምንም የጉምሩክ መልቀቂያ ሰርተፊኬት አልተገኘም' : language === 'OM' ? 'Waraqaan Ragaa Gumruukaa Hin Argamne' : 'No Clearance Certificates Found'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'AM' ? 'የጉምሩክ መርማሪ በግምገማ ወይም በህግ ማረጋገጫ ክፍል አረንጓዴ መስመር ሲፈቅድ፣ ይፋዊ የመልቀቂያ ሰርተፊኬት እዚህ ይመዘገባል።' : 'When a customs inspector approves Green Line status for a consignment in the Review Queue or Compliance Workbench, the official release certificate will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10.5px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4">{language === 'AM' ? 'የሰርተፊኬት ቁጥር' : language === 'OM' ? 'Lakkoofsa Waraqaa' : 'Certificate Number'}</th>
                  <th className="py-3.5 px-4">{language === 'AM' ? 'ጭነት እና ዕቃ' : language === 'OM' ? 'Fe\'isa fi Qabeenya' : 'Consignment & Cargo'}</th>
                  <th className="py-3.5 px-4">{language === 'AM' ? 'የጭነት ባለቤት (ላኪ)' : language === 'OM' ? 'Abbaa Fe\'isaa' : 'Consignor (Shipper)'}</th>
                  <th className="py-3.5 px-4">{language === 'AM' ? 'አጓጓዥ እና ታርጋ' : language === 'OM' ? 'Geejjibaa fi Gabatee' : 'Carrier & Plate'}</th>
                  <th className="py-3.5 px-4">{language === 'AM' ? 'የፈቃድ ጣቢያ' : language === 'OM' ? 'Buufata Hayyamaa' : 'Clearing Station'}</th>
                  <th className="py-3.5 px-4">{language === 'AM' ? 'የተለቀቀበት ቀን' : language === 'OM' ? 'Guyyaa Gadhiifame' : 'Release Date'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'AM' ? 'ድርጊት' : language === 'OM' ? 'Tarkaanfii' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLedger.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {item.certificateNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.cargoTitle}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Gross Weight: {item.weightTons} Tons
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.shipperCompany}</div>
                      <div className="text-[11px] text-slate-500 font-mono">TIN: {item.shipperTin}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {item.carrierPlate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Stamp className="w-3 h-3 text-emerald-600" />
                        <span>{item.clearingStation.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {new Date(item.clearedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveCertificate(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Certificate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Printable Electronic Clearance Certificate Modal */}
      {activeCertificate && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 flex justify-center items-start animate-fade-in"
          onClick={() => setActiveCertificate(null)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl my-3 sm:my-6 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Actions Header - Sticky at Top */}
            <div className="sticky top-0 z-30 px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shadow-md">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCertificate(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'AM' ? '← ተመለስ' : language === 'OM' ? '← Deebi\'i' : '← Back'}</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Stamp className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'AM' ? 'የኢ.ጉ.ኮ ኤሌክትሮኒክ ፈቃድ ሰርተፊኬት' : 'ECC Digital Clearance Certificate'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'AM' ? 'አትም (Print)' : 'Print'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCertificate(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={language === 'AM' ? 'ዝጋ' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Certificate Paper Container */}
            <div className="overflow-y-auto max-h-[75vh] p-4 sm:p-8 bg-slate-50/50">
              <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm space-y-6 text-slate-900" id="ecc-print-certificate">
                {/* Official Ethiopian Customs Commission Header */}
                <div className="text-center border-b-2 border-emerald-900 pb-5 space-y-1.5">
                  <div className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">
                    FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
                  </div>
                  <div className="text-xl sm:text-2xl font-black tracking-tight text-emerald-900">
                    ETHIOPIAN CUSTOMS COMMISSION (ECC)
                  </div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    SINGLE WINDOW ELECTRONIC TRANSIT CLEARANCE CERTIFICATE
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-black mt-1">
                    CERTIFICATE REF: {activeCertificate.certificateNo}
                  </div>
                </div>

                {/* Legal Transit Release Authorization Clause */}
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 leading-relaxed font-medium">
                  <p>
                    <strong>OFFICIAL TRANSIT AUTHORIZATION:</strong> This electronic single-window transit clearance confirms that the freight consignment detailed herein has undergone mandatory documentary inspection, automated consistency validation, and tariff check in accordance with <strong>Ethiopian Customs Proclamation No. 859/2014</strong>. The carrier is hereby granted unrestricted <strong>GREEN LINE TRANSIT PASSAGE</strong> through all corridor toll gates and dry port checkpoints along the Djibouti–Addis Ababa primary trade corridor.
                  </p>
                </div>

                {/* Consignment & Carrier Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-y border-slate-200 py-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cargo Consignment</span>
                    <div className="font-black text-sm text-slate-900">{activeCertificate.cargoTitle}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5 font-medium">Official Clearance Record</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Corridor Route</span>
                    <div className="font-bold text-slate-900">{activeCertificate.route}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Gross Cargo Weight: <strong>{activeCertificate.weightTons} Tons</strong></div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consignor (Shipper)</span>
                    <div className="font-bold text-slate-900">{activeCertificate.shipperCompany}</div>
                    <div className="font-mono text-slate-500 text-[11px]">TIN: {activeCertificate.shipperTin}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authorized Carrier</span>
                    <div className="font-bold text-slate-900">{activeCertificate.driverName}</div>
                    <div className="font-mono text-slate-500 text-[11px]">Plate Number: <strong>{activeCertificate.carrierPlate}</strong></div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clearing Customs Station</span>
                    <div className="font-bold text-emerald-800">{activeCertificate.clearingStation}</div>
                    <div className="text-slate-500 text-[11px]">Officer: {activeCertificate.clearingOfficer}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Digital Release Date & Time</span>
                    <div className="font-bold text-slate-900">{new Date(activeCertificate.clearedAt).toLocaleString()}</div>
                    <div className="font-mono text-[10px] text-emerald-700 font-bold">STATUS: OFFICIAL GREEN LINE RELEASE</div>
                  </div>
                </div>

                {/* Cryptographic Verification Seal & QR Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800 shrink-0">
                      <QrCode className="w-12 h-12 text-slate-800" />
                    </div>
                    <div className="space-y-0.5 text-[10.5px]">
                      <div className="font-bold text-slate-900">Cryptographic Seal Verification:</div>
                      <div className="font-mono text-emerald-700 font-black">{activeCertificate.digitalSeal}</div>
                      <div className="text-slate-500">Scannable by Galafi & Mojo terminal officers.</div>
                    </div>
                  </div>

                  {/* Big Green Digital Seal Badge */}
                  <div className="p-3.5 rounded-2xl border-2 border-emerald-600 bg-emerald-50 text-emerald-900 text-center space-y-0.5 shrink-0">
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700">ECC VERIFIED</div>
                    <div className="text-xs font-black tracking-wider text-emerald-900">GREEN LINE CLEARED</div>
                    <div className="text-[9px] font-mono text-emerald-600">ZERO DELAY TRANSIT</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer - Sticky at Bottom */}
            <div className="sticky bottom-0 z-30 px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveCertificate(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'AM' ? 'ወደ መዝገብ ተመለስ' : language === 'OM' ? 'Gara Galmeetti Deebi\'i' : 'Back to Registry'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'AM' ? 'ሰርተፊኬቱን አትም' : 'Print Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
