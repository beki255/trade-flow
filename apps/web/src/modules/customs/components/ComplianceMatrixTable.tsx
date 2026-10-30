import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CustomsDossierItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ComplianceMatrixTableProps {
  activeDossier: CustomsDossierItem;
  invoiceNo: string;
  packingNo: string;
  bolNo: string;
  originNo: string;
  invoiceWeight: number;
  packingWeight: number;
  bolWeight: number;
  targetWeight: number;
  hasWeightDiscrepancy: boolean;
}

export const ComplianceMatrixTable: React.FC<ComplianceMatrixTableProps> = ({
  activeDossier,
  invoiceNo,
  packingNo,
  bolNo,
  originNo,
  invoiceWeight,
  packingWeight,
  bolWeight,
  targetWeight,
  hasWeightDiscrepancy,
}) => {
  const { language } = useLanguage();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'AM' ? 'የሰነዶች ትክክለኛነት ማረጋገጫ ማትሪክስ (የኢትዮጵያ ጉምሩክ ነጠላ መስኮት)' : language === 'OM' ? 'Maatriksii Mirkaneessa Sanadoota Daldalaa (ECC Single Window)' : 'Cross-Document Validation Matrix (ECC Single Window Verification)'}
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'AM'
              ? 'በአራቱም ዓለም አቀፍ የንግድ ሰነዶች መካከል ያለውን የመረጃ መጣጣም በራስ-ሰር የሚያረጋግጥ የቅድመ ፍቃድ ፍተሻ።'
              : language === 'OM'
              ? 'Sakatta\'a dursaa sanadoota daldala idil-addunyaa arfan gidduutti walhalsiisa daataa mirkaneessu.'
              : 'Automated pre-clearance checks verifying data alignment across all four international trade documents.'}
          </p>
        </div>
        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {hasWeightDiscrepancy
            ? (language === 'AM' ? '⚠️ 1 ልዩነት ተገኝቷል' : language === 'OM' ? '⚠️ Garaagarummaan 1 Argameera' : '⚠️ 1 Discrepancy Found')
            : (language === 'AM' ? '✓ 100% ፍተሻው አልፏል' : language === 'OM' ? '✓ 100% Qorannoo Darbeera' : '✓ 100% Cross-Check Passed')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-[10.5px] font-extrabold uppercase text-slate-500 border-b border-slate-200/80">
              <th className="py-3 px-4">{language === 'AM' ? 'የማረጋገጫ ነጥብ' : language === 'OM' ? 'Qabxii Mirkaneessaa' : 'Verification Checkpoint'}</th>
              <th className="py-3 px-4">{language === 'AM' ? 'የንግድ ደረሰኝ (Invoice)' : language === 'OM' ? 'Nagahee Daldalaa' : 'Commercial Invoice'}</th>
              <th className="py-3 px-4">{language === 'AM' ? 'የዕቃ ዝርዝር (Packing List)' : language === 'OM' ? 'Tarree Mi\'aa' : 'Packing List'}</th>
              <th className="py-3 px-4">{language === 'AM' ? 'የጭነት ሰነድ (B/L)' : language === 'OM' ? 'Waraqaa Fe\'isaa (B/L)' : 'Bill of Lading (B/L)'}</th>
              <th className="py-3 px-4">{language === 'AM' ? 'የትውልድ ሀገር ሰርተፊኬት' : language === 'OM' ? 'Waraqaa Ragaa Maddaa' : 'Origin Certificate'}</th>
              <th className="py-3 px-4 text-center">{language === 'AM' ? 'የተገዢነት ውጤት' : language === 'OM' ? 'Bu\'aa Seera Qabeessummaa' : 'Compliance Result'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {/* Row 1: Document Reference Numbers */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">
                {language === 'AM' ? 'የሰነድ ማጣቀሻ ቁጥር #' : language === 'OM' ? 'Lakkofsa Wabii Sanadaa #' : 'Document Reference #'}
              </td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{invoiceNo}</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{packingNo}</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{bolNo}</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{originNo}</td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'AM' ? 'ተረጋግጧል' : language === 'OM' ? 'Mirkanaa\'eera' : 'Validated'}
                </span>
              </td>
            </tr>

            {/* Row 2: Declared Gross Weight */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">
                {language === 'AM' ? 'ጠቅላላ የጭነት ክብደት' : language === 'OM' ? 'Ulfaatina Fe\'isaa' : 'Gross Cargo Weight'}
              </td>
              <td className="py-3 px-4">{invoiceWeight} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</td>
              <td className="py-3 px-4">{packingWeight} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</td>
              <td className="py-3 px-4">{bolWeight} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</td>
              <td className="py-3 px-4">{targetWeight} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</td>
              <td className="py-3 px-4 text-center">
                {hasWeightDiscrepancy ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> {language === 'AM' ? 'አልተጣጣመም' : language === 'OM' ? 'Garaagarummaa qaba' : 'Mismatch'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'AM' ? 'ትክክለኛ ተዛምዶ (0.0T ልዩነት)' : language === 'OM' ? 'Wal-gituu Sirrii (0.0T)' : 'Exact Match (0.0T Delta)'}
                  </span>
                )}
              </td>
            </tr>

            {/* Row 3: Declared Value vs Tariff Benchmark */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">
                {language === 'AM' ? 'የተገለጸ ዋጋ (ብር)' : language === 'OM' ? 'Gatii Ibsame (ETB)' : 'Declared Value (ETB)'}
              </td>
              <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                {Number(activeDossier.declaredValueEtb).toLocaleString()} ETB
              </td>
              <td className="py-3 px-4 text-slate-400">
                {language === 'AM' ? 'ክብደት ብቻ' : language === 'OM' ? 'Ulfaatina qofa' : 'N/A (Tonnage only)'}
              </td>
              <td className="py-3 px-4 text-slate-400">
                {language === 'AM' ? 'የአጓጓዥ ጉዞ ብቻ' : language === 'OM' ? 'Geejjiba qofa' : 'Carrier Haulage Only'}
              </td>
              <td className="py-3 px-4 text-slate-400">
                {language === 'AM' ? 'ተመራጭ ቀረጥ ተቀባይነት ያለው' : language === 'OM' ? 'Qaraxni eeyyamameera' : 'Preferential Duty Valid'}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'AM' ? 'የገበያ ቀረጥ ትክክለኛ ነው' : language === 'OM' ? 'Qaraxni Gabaa Sirriidha' : 'Market Tariff In-Bounds'}
                </span>
              </td>
            </tr>

            {/* Row 4: Consignee & Route Alignment */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">
                {language === 'AM' ? 'የኮሪደር መስመር መጣጣም' : language === 'OM' ? 'Walhalsiisa Daandii Koriidarii' : 'Corridor Route Alignment'}
              </td>
              <td className="py-3 px-4">{activeDossier.origin} ➔ {activeDossier.destination}</td>
              <td className="py-3 px-4">{activeDossier.origin} ➔ {activeDossier.destination}</td>
              <td className="py-3 px-4">{activeDossier.origin} ➔ {activeDossier.destination}</td>
              <td className="py-3 px-4">
                {language === 'AM' ? 'የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ' : language === 'OM' ? 'Riippabiliika Dimookiraatawaa Federaalaa Itoophiyaa' : 'Federal Democratic Republic of Ethiopia'}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'AM' ? 'የትራንዚት ኮሪደር ጸድቋል' : language === 'OM' ? 'Koriidariin Darbeera' : 'Corridor Transit Clear'}
                </span>
              </td>
            </tr>

            {/* Row 5: Ministry of Trade Digital Seal */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">
                {language === 'AM' ? 'የኤክስፖርት ማህተም እና የትውልድ ሰርተፊኬት' : language === 'OM' ? 'Ashaaraa Ergaa fi Ragaa Maddaa' : 'Export Seal & Origin Cert'}
              </td>
              <td className="py-3 px-4 text-slate-400">{language === 'AM' ? 'የንግድ ማህተም' : language === 'OM' ? 'Ashaaraa Daldalaa' : 'Commercial Seal'}</td>
              <td className="py-3 px-4 text-slate-400">{language === 'AM' ? 'የመጋዘን ማህተም' : language === 'OM' ? 'Ashaaraa Kuusaa' : 'Warehouse Seal'}</td>
              <td className="py-3 px-4 text-slate-400">{language === 'AM' ? 'የአጓጓዥ ማኒፌስት ማህተም' : language === 'OM' ? 'Ashaaraa Maanifeestii' : 'Carrier Manifest Seal'}</td>
              <td className="py-3 px-4 text-emerald-700 font-bold">
                ✓ {language === 'AM' ? 'በንግድ ሚኒስቴር የተረጋገጠ (ጋላፊ የተመዘገበ)' : language === 'OM' ? 'Ministeera Daldalaan Mirkanaa\'e (Galaafii)' : 'MoT Certified (Galafi Registered)'}
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'AM' ? 'የተረጋገጠ' : language === 'OM' ? 'Mirkanaa\'eera' : 'Certified'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
