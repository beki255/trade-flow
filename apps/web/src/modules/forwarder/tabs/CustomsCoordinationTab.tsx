import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  FileText,
  Building,
  ShieldCheck,
  Send,
  RefreshCw,
  Clock,
  ArrowRight,
  Stamp,
  Truck,
  User,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ForwarderClientItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

export interface CustomsBatchItem {
  id: string;
  shipmentId: string;
  batchReference: string;
  title: string;
  cargoDescription: string;
  shipperCompany: string;
  shipperTin: string;
  route: string;
  weightTons: number;
  carrierPlate: string;
  carrierName: string;
  driverName: string;
  customsStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CLEARED' | 'REVISION_REQUESTED' | 'REJECTED';
  documentsCount: number;
  documents: any[];
  updatedAt: string;
}

interface CustomsCoordinationTabProps {
  clients: ForwarderClientItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const CustomsCoordinationTab: React.FC<CustomsCoordinationTabProps> = ({
  clients = [],
  loading: parentLoading,
  onRefresh,
}) => {
  const { language, t } = useLanguage();
  const [batches, setBatches] = useState<CustomsBatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [loadingBatches, setLoadingBatches] = useState<boolean>(false);
  const [transmitting, setTransmitting] = useState(false);
  const [transmittedNotice, setTransmittedNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const fetchCustomsBatches = async () => {
    try {
      setLoadingBatches(true);
      const res = await fetch('/api/forwarder/customs-batch');
      if (res.ok) {
        const data = await res.json();
        if (data.batches) {
          setBatches(data.batches);
          if (data.batches.length > 0 && !selectedBatchId) {
            setSelectedBatchId(data.batches[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch customs batches:', e);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchCustomsBatches();
    const timer = setInterval(fetchCustomsBatches, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0] || null;

  const handleTransmitBatch = async () => {
    if (!activeBatch) return;
    setTransmitting(true);
    setErrorNotice('');
    setTransmittedNotice('');

    try {
      const res = await fetch('/api/forwarder/customs-batch/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipmentId: activeBatch.shipmentId,
          batchReference: activeBatch.batchReference,
          clearingStation: 'Galafi Border Checkpoint (Main Corridor)',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTransmittedNotice(
          language === 'AM'
            ? `🎉 የማስተላለፊያ ማመልከቻ ${activeBatch.batchReference} ወደ ኢትዮጵያ ጉምሩክ ኮሚሽን (ECC) Single Window በተሳካ ሁኔታ ተላልፏል!`
            : language === 'OM'
            ? `🎉 Iyyannoo dabarsaa ${activeBatch.batchReference} gara ECC Single Window tti milkaaʼinaan darbeera!`
            : `🎉 Batch Declaration ${activeBatch.batchReference} transmitted successfully to Ethiopian Customs Commission (ECC) Single Window Queue!`
        );
        setTimeout(() => setTransmittedNotice(''), 7000);
        await fetchCustomsBatches();
        onRefresh();
      } else {
        setErrorNotice(data.error || 'Failed to transmit customs declaration');
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Error transmitting to customs authority');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('forwarder.customsCoordTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('forwarder.customsCoordSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchCustomsBatches();
            onRefresh();
          }}
          className="relative z-10 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingBatches || parentLoading ? 'animate-spin' : ''}`} />
          <span>{language === 'AM' ? 'አመሳስል' : language === 'OM' ? 'Walsimsiisi' : 'Sync Status'}</span>
        </button>
      </div>

      {transmittedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{transmittedNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* 2. Pipeline Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'ጠቅላላ ማመልከቻዎች' : language === 'OM' ? 'Waliigala Labsiilee' : 'Total Declarations'}
          </span>
          <span className="text-2xl font-black text-slate-900">{batches.length}</span>
          <span className="text-[10px] text-teal-600 font-bold">
            {language === 'AM' ? 'የተዋሃዱ ዋና ፋይሎች' : language === 'OM' ? 'Faayiloota Gurguddoo' : 'Consolidated Master Files'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'በECC ምርመራ ላይ' : language === 'OM' ? 'Qorannoo ECC Eegaa' : 'Pending ECC Review'}
          </span>
          <span className="text-2xl font-black text-amber-600">
            {batches.filter((b) => b.customsStatus === 'SUBMITTED' || b.customsStatus === 'UNDER_REVIEW').length}
          </span>
          <span className="text-[10px] text-amber-600 font-bold">
            {language === 'AM' ? 'በ Single Window ፍተሻ ላይ' : language === 'OM' ? 'Qorannoo Single Window Keessa' : 'In Single Window Inspection'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'በአረንጓዴ መስመር የጸደቁ' : language === 'OM' ? 'Sarara Magariisaan Darban' : 'Green Line Cleared'}
          </span>
          <span className="text-2xl font-black text-emerald-600">
            {batches.filter((b) => b.customsStatus === 'CLEARED').length}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">
            {language === 'AM' ? 'ህጋዊ ዲጂታል ማህተሞች' : language === 'OM' ? 'Chaappaa Dijitaalaa Seeraa' : 'Official Digital Seals'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'ለመላክ ዝግጁ' : language === 'OM' ? 'Erguuf Qophii' : 'Ready for Dispatch'}
          </span>
          <span className="text-2xl font-black text-indigo-600">
            {batches.filter((b) => b.customsStatus === 'NOT_SUBMITTED').length}
          </span>
          <span className="text-[10px] text-indigo-600 font-bold">
            {language === 'AM' ? 'የተዘጋጁ የረቂቅ ዶሴዎች' : language === 'OM' ? 'Dooziin Qophaaʼeera' : 'Draft Dossiers Ready'}
          </span>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {language === 'AM' ? 'ምንም የጉምሩክ ማስተላለፊያ ፋይሎች የሉም' : language === 'OM' ? 'Faayiliin labsii gumruukaa hin jiru' : 'No Active Customs Declaration Files'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'AM'
              ? 'የጭነት ኮንትራት ሲፈጸም ወይም በኮንሶሊዴሽን ክፍል አዲስ የጋራ ኮንቴይነር ሲፈጠር ለጉምሩክ ማስተላለፊያ ዝግጁ ሆኖ እዚህ ይቀርባል።'
              : language === 'OM'
              ? 'Waliigalteen geejjibaa yammuu xumuramu ykn konteenarri haaraan yammuu qophaaʼu labsii gumruukaaf asitti dhiyaata.'
              : 'When transport tenders are awarded or consolidated shipments are registered, they will appear here ready for electronic Single Window declaration.'}
          </p>
        </div>
      ) : (
        /* 3. Main Declarations Workflow: Left List + Right Active Transmission Workbench */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Declarations List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              {language === 'AM'
                ? `የጉምሩክ ዶሴዎች (${batches.length})`
                : language === 'OM'
                ? `Dooziiwwan Gumruukaa (${batches.length})`
                : `Consignment Declarations (${batches.length})`}
            </h3>

            <div className="space-y-2.5">
              {batches.map((item) => {
                const isSelected = item.id === (activeBatch?.id || '');
                const isCleared = item.customsStatus === 'CLEARED';
                const isSubmitted = item.customsStatus === 'SUBMITTED' || item.customsStatus === 'UNDER_REVIEW';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBatchId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/60 border-teal-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                        {item.batchReference}
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isCleared
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isSubmitted
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isCleared
                          ? (language === 'AM' ? 'የጸደቀ' : language === 'OM' ? 'Darbeera' : 'CLEARED')
                          : isSubmitted
                          ? (language === 'AM' ? 'በምርመራ ላይ' : language === 'OM' ? 'Qorannoo Irra' : 'UNDER REVIEW')
                          : (language === 'AM' ? 'ረቂቅ' : language === 'OM' ? 'Wixinee' : 'DRAFT')}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 mt-2 truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.shipperCompany} • TIN: {item.shipperTin}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 mt-2 border-t border-slate-100">
                      <span>{item.weightTons} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'} • {item.carrierPlate}</span>
                      <span className="font-bold text-teal-700">
                        {item.documentsCount} {language === 'AM' ? 'ሰነዶች ተያይዘዋል' : language === 'OM' ? 'Sanadoonni Qabsiifamaniiru' : 'Docs Attached'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Batch Transmission Workbench (7 cols) */}
          <div className="lg:col-span-7">
            {activeBatch ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5 sticky top-4">
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded">
                        {activeBatch.batchReference}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          activeBatch.customsStatus === 'CLEARED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : activeBatch.customsStatus === 'SUBMITTED' || activeBatch.customsStatus === 'UNDER_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {activeBatch.customsStatus === 'CLEARED'
                          ? (language === 'AM' ? 'የጸደቀ' : language === 'OM' ? 'Darbeera' : 'CLEARED')
                          : activeBatch.customsStatus === 'SUBMITTED' || activeBatch.customsStatus === 'UNDER_REVIEW'
                          ? (language === 'AM' ? 'በምርመራ ላይ' : language === 'OM' ? 'Qorannoo Irra' : 'UNDER REVIEW')
                          : (language === 'AM' ? 'ረቂቅ' : language === 'OM' ? 'Wixinee' : 'DRAFT')}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">{activeBatch.title}</h3>
                    <p className="text-xs text-slate-500">{activeBatch.route}</p>
                  </div>

                  {activeBatch.customsStatus === 'NOT_SUBMITTED' || activeBatch.customsStatus === 'REVISION_REQUESTED' ? (
                    <button
                      type="button"
                      disabled={transmitting}
                      onClick={handleTransmitBatch}
                      className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {transmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'AM' ? 'በማስተላለፍ ላይ...' : language === 'OM' ? 'Dabarsaa jira...' : 'Transmitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{language === 'AM' ? 'ማመልከቻውን ወደ ECC አስተላልፍ ➔' : language === 'OM' ? 'Labsii gara ECC tti Dabarsi ➔' : 'Transmit Declaration to ECC ➔'}</span>
                        </>
                      )}
                    </button>
                  ) : activeBatch.customsStatus === 'CLEARED' ? (
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'AM' ? 'የአረንጓዴ መስመር ማህተም ጸድቋል' : language === 'OM' ? 'Chaappaan Sarara Magariisaa Mirkanaaʼe' : 'Green Line Seal Approved'}</span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{language === 'AM' ? 'በECC ምርመራ ላይ' : language === 'OM' ? 'Qorannoo ECC Keessa' : 'Under ECC Inspection'}</span>
                    </div>
                  )}
                </div>

                {/* Consignment Profile Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {language === 'AM' ? 'የላኪ ድርጅት' : language === 'OM' ? 'Dhaabbata Ergaa' : 'Consignor Business'}
                    </span>
                    <strong className="text-slate-900 block truncate">{activeBatch.shipperCompany}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">TIN: {activeBatch.shipperTin}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {language === 'AM' ? 'አጓጓዥና አሽከርካሪ' : language === 'OM' ? 'Geessisaa fi Konkolaachisaa' : 'Carrier & Crew'}
                    </span>
                    <strong className="text-slate-900 block truncate">{activeBatch.carrierName}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {language === 'AM' ? 'ሰሌዳ፦' : language === 'OM' ? 'Gabatee:' : 'Plate:'} {activeBatch.carrierPlate} • {activeBatch.driverName}
                    </span>
                  </div>
                </div>

                {/* 4 Standard Required Customs Documents */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      {language === 'AM'
                        ? 'የ Single Window ዲጂታል ሰነዶች (4 ከ 4)'
                        : language === 'OM'
                        ? 'Sanadoota Dijitaalaa Single Window (4 keessaa 4)'
                        : 'Single Window Digital Documents (4 of 4)'}
                    </h4>
                    <span className="text-[11px] text-teal-700 font-bold">
                      {language === 'AM' ? 'የተረጋገጡና ትክክለኛ' : language === 'OM' ? 'Mirkanaaʼoo fi Seera Qabeeyyii' : 'Verified & Authenticated'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <div>
                          <strong className="text-slate-900 block text-[11px]">
                            {language === 'AM' ? 'የንግድ ደረሰኝ (Invoice)' : language === 'OM' ? 'Nagahee Daldalaa' : 'Commercial Invoice'}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">ETH-CI-{activeBatch.id.slice(-4).toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {language === 'AM' ? 'ዝግጁ' : language === 'OM' ? 'Qophii' : 'Ready'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <div>
                          <strong className="text-slate-900 block text-[11px]">
                            {language === 'AM' ? 'የጭነት ዝርዝር (Packing List)' : language === 'OM' ? 'Tarree Qabiyyee' : 'Packing List'}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">ETH-PL-{activeBatch.id.slice(-4).toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {language === 'AM' ? 'ዝግጁ' : language === 'OM' ? 'Qophii' : 'Ready'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <div>
                          <strong className="text-slate-900 block text-[11px]">
                            {language === 'AM' ? 'የጭነት ሰነድ (Bill of Lading)' : language === 'OM' ? 'Waraqaa Feʼiisaa (BOL)' : 'Bill of Lading (BOL)'}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">BOL-MJO-{activeBatch.id.slice(-4).toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {language === 'AM' ? 'ዝግጁ' : language === 'OM' ? 'Qophii' : 'Ready'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <div>
                          <strong className="text-slate-900 block text-[11px]">
                            {language === 'AM' ? 'የመነሻ ምስክር ወረቀት' : language === 'OM' ? 'Waraqaa Maddaa (Origin)' : 'Certificate of Origin'}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-mono">MOT-COO-{activeBatch.id.slice(-4).toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {language === 'AM' ? 'ዝግጁ' : language === 'OM' ? 'Qophii' : 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customs Authority Information Note */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>
                      {language === 'AM'
                        ? 'የኢትዮጵያ ጉምሩክ ኮሚሽን የ Single Window ትስስር፦'
                        : language === 'OM'
                        ? 'Walitti Hidhamiinsa Single Window Gumruuka Itoophiyaa:'
                        : 'Ethiopian Customs Commission Single Window Integration:'}
                    </strong>
                    <p className="mt-0.5 text-teal-800">
                      {language === 'AM'
                        ? 'ይህ ዶሴ እንደተላለፈ በገላፊ የድንበር ኬላ እና በሞድጆ ደረቅ ወደብ ላሉ የጉምሩክ መርማሪዎች ለዲጂታል አረንጓዴ መስመር ፍቃድ ወዲያውኑ ይታያል።'
                        : language === 'OM'
                        ? 'Dooziin kun erga darbee booda sakattaatota gumruukaa buufata Galafii fi Moojoo jiraniif sarara magariisaatiin eeyyama argachuuf hatattamaan mulʼata.'
                        : 'Once transmitted, this dossier will immediately become visible to customs inspectors at Galafi Border Checkpoint & Modjo Dry Port for electronic Green Line clearance.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
