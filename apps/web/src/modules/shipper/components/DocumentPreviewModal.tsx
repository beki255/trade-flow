import React from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building,
  Scale,
  Calendar,
  DollarSign,
  QrCode,
  Truck,
  Anchor,
  FileSpreadsheet,
  ArrowRight,
  Stamp,
  ExternalLink,
  Paperclip,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';
import { CustomsDoc } from '../tabs/DocumentsTab';
import { useLanguage } from '../../../context/LanguageContext';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: CustomsDoc | null;
  onRunPreSubmissionCheck?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  doc,
  onRunPreSubmissionCheck,
}) => {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = React.useState<'CERTIFICATE' | 'ATTACHMENT'>('CERTIFICATE');

  React.useEffect(() => {
    if (isOpen) {
      setViewMode('CERTIFICATE');
    }
  }, [isOpen, doc?.id]);

  if (!isOpen || !doc) return null;

  const docType = doc.docType?.toUpperCase() || 'COMMERCIAL_INVOICE';
  const isInvoice = docType.includes('INVOICE');
  const isPacking = docType.includes('PACKING');
  const isBOL = docType.includes('BILL') || docType.includes('LADING');
  const isOrigin = docType.includes('ORIGIN');

  const formattedValue = doc.declaredValueEtb ? Number(doc.declaredValueEtb).toLocaleString() : '0';
  const weightTons = doc.weightTons ? Number(doc.weightTons).toFixed(2) : '0.00';
  const netWeightTons = doc.weightTons ? (Number(doc.weightTons) * 0.92).toFixed(2) : '0.00';
  const tareWeightTons = doc.weightTons ? (Number(doc.weightTons) * 0.08).toFixed(2) : '0.00';

  const handlePrint = () => {
    window.print();
  };

  const isImageFile =
    Boolean(doc.fileUrl?.startsWith('data:image')) ||
    Boolean(doc.fileName?.match(/\.(jpeg|jpg|png|webp|gif)$/i)) ||
    Boolean(doc.fileUrl?.match(/\.(jpeg|jpg|png|webp|gif)$/i));

  const isPdfFile =
    Boolean(doc.fileUrl?.startsWith('data:application/pdf')) ||
    Boolean(doc.fileName?.match(/\.pdf$/i)) ||
    Boolean(doc.fileUrl?.match(/\.pdf$/i));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  {language === 'AM'
                    ? 'የኢ.ጉ.ኮ ይፋዊ የጭነት ቅድመ-ዕይታ'
                    : language === 'OM'
                    ? 'Ilaalcha Sanada Fe\'isaa Abbaa Taayitaa Gumruukaa'
                    : 'ECC Official Consignment Preview'}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
                  {doc.docNumber}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white">
                {isInvoice &&
                  (language === 'AM'
                    ? 'የንግድ ደረሰኝ — የኤክስፖርት ማስታወቂያ'
                    : language === 'OM'
                    ? 'Inwooysii Daldalaa — Beeksisni Ergaa'
                    : 'Commercial Invoice — Export Declaration')}
                {isPacking &&
                  (language === 'AM'
                    ? 'የኤክስፖርት ማሸጊያ ዝርዝር እና የክብደት መግለጫ'
                    : language === 'OM'
                    ? 'Tarree Saamsamaa Ergaa fi Ulfaatinaa'
                    : 'Export Packing List & Weight Specification')}
                {isBOL &&
                  (language === 'AM'
                    ? 'ባለብዙ-ትራንስፖርት የጉዞ ሰነድ (ESLSE / ASYCUDA)'
                    : language === 'OM'
                    ? 'Sanada Geejjibaa Qindaa\'aa (ESLSE / ASYCUDA)'
                    : 'Multimodal Bill of Lading (ESLSE / ASYCUDA)')}
                {isOrigin &&
                  (language === 'AM'
                    ? 'የትውልድ ሀገር ምስክር ወረቀት — ተመራጭ የንግድ ስምምነት'
                    : language === 'OM'
                    ? 'Waraqaa Eenyummaa Maddaa — Daldala Filatamaa'
                    : 'Certificate of Origin — Preferential Trade Protocol')}
                {!isInvoice && !isPacking && !isBOL && !isOrigin && doc.docType.replace(/_/g, ' ')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher: Certificate vs Uploaded File */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold gap-1 mr-2">
              <button
                type="button"
                onClick={() => setViewMode('CERTIFICATE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'CERTIFICATE'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {language === 'AM' ? 'ይፋዊ ሰርተፍኬት' : 'ECC Certificate'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('ATTACHMENT')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'ATTACHMENT'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{language === 'AM' ? 'የተያያዘ ፋይል' : 'Attached File'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        {viewMode === 'ATTACHMENT' ? (
          <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col items-center justify-center min-h-[420px]">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{doc.fileName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {doc.fileSizeKb ? `${doc.fileSizeKb} KB` : 'Attached Trade Document'} • Ref: {doc.docNumber}
                    </p>
                  </div>
                </div>

                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={doc.fileName}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'AM' ? 'ፋይሉን አውርድ' : 'Download File'}</span>
                  </a>
                )}
              </div>

              {/* Render Image or PDF Preview */}
              {isImageFile && doc.fileUrl && !doc.fileUrl.startsWith('https://tradeflow.et') ? (
                <div className="flex flex-col items-center justify-center p-3 bg-slate-100 dark:bg-slate-950/60 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={doc.fileUrl}
                    alt={doc.fileName}
                    className="max-h-[500px] max-w-full rounded-lg shadow-md object-contain bg-white"
                  />
                </div>
              ) : isPdfFile && doc.fileUrl && !doc.fileUrl.startsWith('https://tradeflow.et') ? (
                <iframe
                  src={doc.fileUrl}
                  title={doc.fileName}
                  className="w-full h-[500px] rounded-xl border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{doc.fileName}</div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {language === 'AM'
                        ? 'የተጫነው ኦርጅናል የንግድ ሰነድ ማስረጃ ከዚህ የጉምሩክ ሰርተፍኬት ጋር በዲጂታል ማህተም ተያይዟል።'
                        : 'Uploaded physical trade evidence is cryptographically bound to this customs clearance declaration.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/40">
          {/* Certificate Paper Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Subtle ECC Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none">
              <span className="text-9xl font-black uppercase tracking-widest text-slate-900 dark:text-white rotate-[-25deg]">
                TRADEFLOW ECC
              </span>
            </div>

            {/* Official Header */}
            <div className="border-b-2 border-slate-800 dark:border-slate-700 pb-5 mb-6 text-center space-y-1 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === 'AM'
                    ? 'የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ — ጉምሩክ እና ንግድ'
                    : language === 'OM'
                    ? 'Rippabiliika Dimookiraatawaa Federaalawa Itoophiyaa — Gumruukaa fi Daldala'
                    : 'Federal Democratic Republic of Ethiopia — Customs & Trade'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white uppercase">
                {isInvoice &&
                  (language === 'AM'
                    ? 'የንግድ ኤክስፖርት ደረሰኝ'
                    : language === 'OM'
                    ? 'Inwooysii Daldala Ergaa'
                    : 'Commercial Export Invoice')}
                {isPacking &&
                  (language === 'AM'
                    ? 'ዝርዝር የጭነት ማሸጊያ መግለጫ'
                    : language === 'OM'
                    ? 'Tarree Bal\'aa Saamsama Fe\'isaa'
                    : 'Detailed Consignment Packing List')}
                {isBOL &&
                  (language === 'AM'
                    ? 'ዓለም አቀፍ ባለብዙ-ትራንስፖርት የጉዞ ሰነድ'
                    : language === 'OM'
                    ? 'Sanada Geejjibaa Addunyaa Qindaa\'aa'
                    : 'International Multimodal Bill of Lading')}
                {isOrigin &&
                  (language === 'AM'
                    ? 'የተረጋገጠ የትውልድ ሀገር ምስክር ወረቀት'
                    : language === 'OM'
                    ? 'Waraqaa Eenyummaa Maddaa Mirkanaa\'e'
                    : 'Certified Certificate of Origin')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isInvoice && 'Registered under Ethiopian Customs Commission ASYCUDA World Export Protocol'}
                {isPacking && 'Containerized Tare & Gross Mass Breakdown (SOLAS VGM Compliant)'}
                {isBOL && 'Transit Corridor: Modjo Dry Port ➔ Galafi Border Checkpoint ➔ Port of Djibouti'}
                {isOrigin && 'Ministry of Trade & Regional Integration — AfCFTA & COMESA Preferential Regime'}
              </p>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {language === 'AM' ? 'የሰነድ ቁጥር' : language === 'OM' ? 'Lakkoofsa Sanadaa' : 'Document Ref'}
                </span>
                <strong className="text-sky-700 dark:text-sky-400 font-mono text-sm">{doc.docNumber}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {language === 'AM' ? 'የተሰጠበት ቀን' : language === 'OM' ? 'Guyyaa Kenname' : 'Date of Issue'}
                </span>
                <strong className="text-slate-700 dark:text-slate-300 font-mono">
                  {doc.issueDate || '2026-10-22'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {language === 'AM' ? 'ያወጣው ባለስልጣን' : language === 'OM' ? 'Abbaa Taayitaa Kenne' : 'Issuing Authority'}
                </span>
                <strong className="text-slate-800 dark:text-slate-200 truncate block">
                  {doc.issuingAuthority || 'Ethiopian Customs Commission'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {language === 'AM' ? 'የክሊራንስ ሁኔታ' : language === 'OM' ? 'Haala Eeyyamaa' : 'Clearance Status'}
                </span>
                {doc.clearanceStatus === 'CLEARED' ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'AM' ? 'ተፈቅዷል' : language === 'OM' ? 'Eeyyamameera' : 'Cleared'}</span>
                  </span>
                ) : doc.clearanceStatus === 'SUBMITTED' ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'AM' ? 'ለጉምሩክ ገብቷል' : language === 'OM' ? 'Gumruukaatti Ergameera' : 'Submitted to ECC'}</span>
                  </span>
                ) : doc.clearanceStatus === 'REJECTED' || doc.clearanceStatus === 'REVISION_REQUESTED' ? (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'AM' ? 'ማሻሻያ ያስፈልጋል' : language === 'OM' ? 'Fooyya\'iinsa Barbaada' : 'Revision Required'}</span>
                  </span>
                ) : doc.validationPassed ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'AM' ? 'ቅድመ-ምርመራ አልፏል' : language === 'OM' ? 'Dura Mirkanaa\'eera' : 'Pre-Checked'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'AM' ? 'ረቂቅ' : language === 'OM' ? 'Waraqaa Duraa' : 'Draft'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Consignor & Consignee Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'AM' ? 'ላኪ / ኤክስፖርተር' : language === 'OM' ? 'Ergaa / Daldalaa' : 'Consignor / Exporter'}</span>
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Sidama Coffee Farmers Cooperative Union (SCFCU)
                </div>
                <div className="text-slate-500 text-[11px] space-y-0.5">
                  <div>Addis Ababa / Hawassa Logistics Hub, Ethiopia</div>
                  <div>TIN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">0049281726</span> | VAT: 8841-ET</div>
                  <div>ECC Exporter Code: <span className="font-mono">ET-EXP-2026-9921</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'AM' ? 'ተቀባይ እና መዳረሻ' : language === 'OM' ? 'Fudhataa fi Bakka Geessuu' : 'Consignee & Destination'}</span>
                </span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Djibouti Global Logistics & Free Zone Authority
                </div>
                <div className="text-slate-500 text-[11px] space-y-0.5">
                  <div>Doraleh Container Terminal (SGTD), Djibouti</div>
                  <div>Transit Corridor: <span className="font-bold text-slate-700 dark:text-slate-300">Modjo Dry Port ➔ Galafi Border</span></div>
                  <div>Port of Discharge: Port of Djibouti / Red Sea Transit</div>
                </div>
              </div>
            </div>

            {/* DYNAMIC CONTENT PER DOCUMENT TYPE */}

            {/* 1. COMMERCIAL INVOICE SPECIFIC ITEMS */}
            {isInvoice && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {language === 'AM' ? 'ዝርዝር የኤክስፖርት ጭነት እና የፋይናንስ ግመታ' : language === 'OM' ? 'Tarree Fe\'isaa fi Gatii Faayinaansii' : 'Itemized Export Cargo & Financial Valuation'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">Incoterm: CIF Port of Djibouti</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2.5 px-3">{language === 'AM' ? 'ዕቃ እና መግለጫ' : language === 'OM' ? 'Mi\'aa fi Ibsa' : 'Item & Description'}</th>
                        <th className="py-2.5 px-3">{language === 'AM' ? 'የኤች.ኤስ ኮድ' : language === 'OM' ? 'Koodii HS' : 'HS Code'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'AM' ? 'ብዛት' : language === 'OM' ? 'Baay\'ina' : 'Quantity'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'AM' ? 'የተጣራ ክብደት' : language === 'OM' ? 'Ulfaatina Qulqulluu' : 'Net Weight'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'AM' ? 'የነጠላ ዋጋ' : language === 'OM' ? 'Gatii Tokkoo' : 'Unit Price'}</th>
                        <th className="py-2.5 px-3 text-right">{language === 'AM' ? 'ጠቅላላ CIF (ብር)' : language === 'OM' ? 'Waliigala CIF (ETB)' : 'Total CIF (ETB)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      <tr>
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 dark:text-white block">
                            {doc.shipmentTitle || 'Commercial Freight Consignment'}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            {language === 'AM' ? 'ይፋዊ የኤክስፖርት ማስታወቂያ ጭነት' : language === 'OM' ? 'Fe\'isa Beeksisni Ergaa Ifaa' : 'Official Export Declaration Cargo'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px]">0901.11.00</td>
                        <td className="py-3 px-3 text-right">{language === 'AM' ? 'የጭነት ቡድን' : language === 'OM' ? 'Tuuta Fe\'isaa' : 'Consignment Lot'}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">{weightTons} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</td>
                        <td className="py-3 px-3 text-right font-mono">—</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400">
                          ETB {formattedValue}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">Gross Weight</span>
                    <strong className="text-emerald-950 dark:text-emerald-200 font-mono text-sm">{weightTons} Tons</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">Declared CIF Value</span>
                    <strong className="text-emerald-950 dark:text-emerald-200 font-mono text-sm">ETB {formattedValue}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">USD Equivalent</span>
                    <strong className="text-emerald-950 dark:text-emerald-200 font-mono text-sm">~ $78,500.00 USD</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PACKING LIST SPECIFIC ITEMS */}
            {isPacking && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Packaging Specification & Tare/Gross Breakdown
                  </h3>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">SOLAS VGM Certified</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Container Number</span>
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-white">MSKU-749210-4</div>
                    <div className="text-[11px] text-slate-500">40ft High Cube Dry Freight</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customs Security Seal</span>
                    <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">ECC-SEAL-88319-A</div>
                    <div className="text-[11px] text-slate-500">High-Security Bolt Seal (ISO 17712)</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Packaging Unit</span>
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-white">500 Jute Bags</div>
                    <div className="text-[11px] text-slate-500">GrainPro lined / 20 Pallets</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-sky-900 dark:text-sky-300">
                    <span>Weighbridge Certified Mass (Modjo Terminal Scale #3)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">Tolerance Checked: ±0.00T</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-sky-100 dark:border-sky-900">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Gross Weight</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{weightTons} Tons</strong>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-sky-100 dark:border-sky-900">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Tare Weight</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{tareWeightTons} Tons</strong>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-sky-100 dark:border-sky-900">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Net Weight</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{netWeightTons} Tons</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BILL OF LADING SPECIFIC ITEMS */}
            {isBOL && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Carrier & Multimodal Transit Manifest
                  </h3>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">Carrier: {doc.issuingAuthority || 'Authorized Corridor Carrier'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Highway Unit</span>
                    <div className="font-bold text-slate-900 dark:text-white">{doc.shipmentTitle || doc.loadCode || 'Designated Transport Unit'}</div>
                    <div className="text-[11px] text-slate-500">Authority: {doc.issuingAuthority || 'TradeFlow Corridor Logistics'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ASYCUDA Transit Registration</span>
                    <div className="font-mono font-bold text-sky-700 dark:text-sky-400">{doc.docNumber}</div>
                    <div className="text-[11px] text-slate-500">Electronic Green Manifest</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Manifested Gross Weight</span>
                    <strong className="text-sm font-mono text-slate-900 dark:text-white">{weightTons} Tons</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Freight Status</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">FREIGHT PREPAID / CLEAN B/L</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CERTIFICATE OF ORIGIN SPECIFIC ITEMS */}
            {isOrigin && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Origin Declaration & Preferential Tariff Verification
                  </h3>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">AfCFTA & COMESA Protocol</span>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-2">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "The undersigned certifying authority of the Federal Democratic Republic of Ethiopia hereby certifies that the specified specialty agricultural consignment (500 Bags, <strong>{weightTons} Tons</strong> Gross) has been harvested, processed, and packed within Ethiopia and complies with the rules of origin of the African Continental Free Trade Area (AfCFTA)."
                  </p>
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Origin Criterion: <strong>Wholly Produced in Ethiopia</strong></span>
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-300">HS 0901.11.00 (Specialty Coffee)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Official Digital ECC Stamp & Signatures */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Seal Stamp */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-600 dark:border-emerald-500 p-1 flex items-center justify-center text-center rotate-[-6deg] shadow-xs">
                  <div className="w-full h-full rounded-full border border-dashed border-emerald-600 dark:border-emerald-500 flex flex-col items-center justify-center p-0.5 text-[7px] font-black uppercase text-emerald-700 dark:text-emerald-400 leading-none">
                    <span>ETHIOPIA</span>
                    <span className="my-0.5 font-bold">CUSTOMS</span>
                    <span>ECC VERIFIED</span>
                  </div>
                </div>
                <div className="text-[11px] space-y-0.5">
                  <div className="font-black text-slate-900 dark:text-white uppercase">
                    Electronically Authenticated & Sealed
                  </div>
                  <div className="text-slate-400 font-mono text-[10px]">
                    SHA-256: 7f8b92c4...e3a098 (Immutable Ledger Stamp)
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    ✓ Verified by Officer: Inspector K. Tadesse (ECC-884)
                  </div>
                </div>
              </div>

              {/* Attached Evidence Badge */}
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <Paperclip className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="text-slate-500 dark:text-slate-400 block">{language === 'AM' ? 'የተያያዘ ማስረጃ ፋይል' : 'Attached Evidence'}:</span>
                  <button
                    type="button"
                    onClick={() => setViewMode('ATTACHMENT')}
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {doc.fileName} ({doc.fileSizeKb} KB) ➔
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <QrCode className="w-10 h-10 text-slate-700 dark:text-slate-300" />
                <div className="text-[10px] space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Scan to Verify</div>
                  <div className="text-slate-400 font-mono">asycuda.ecc.gov.et</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {language === 'AM'
                ? 'የዲጂታል ማህተም ለገላፊ ኬላ ፈጣን መስመር ተመዝግቧል'
                : language === 'OM'
                ? 'Mallattoon dijitaalaa buufata Galaafiitiif galmaa\'eera'
                : 'Digital seal registered for Galafi Border Fast-Track'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onRunPreSubmissionCheck && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRunPreSubmissionCheck();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === 'AM'
                    ? 'የቅድመ-ማስገቢያ ምርመራ አሂድ'
                    : language === 'OM'
                    ? 'Qorannoo Duraa Adeemsisi'
                    : 'Run Pre-Submission Check'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              {language === 'AM' ? 'ቅድመ-ዕይታ ዝጋ' : language === 'OM' ? 'Ilaalcha Cufi' : 'Close Preview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
