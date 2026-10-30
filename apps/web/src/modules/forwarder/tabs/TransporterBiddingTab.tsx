import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  Truck,
  DollarSign,
  Clock,
  CheckCircle2,
  Send,
  Building,
  Award,
  Filter,
  Plus,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface CarrierTender {
  id: string;
  tenderCode: string;
  routeTitle: string;
  totalConsolidatedTons: number;
  containerClass: string;
  bidsCount: number;
  lowestQuoteEtb: number;
  budgetCapEtb: number;
  status: 'OPEN_FOR_BIDS' | 'AWARDED' | 'DISPATCHED';
  awardedCarrier?: string;
  deadlineHours: number;
  bidders: {
    bidId?: string;
    transporterId?: string;
    transporterName: string;
    fleetSize: number;
    rating: number;
    quotedRateEtb: number;
    transitHours: number;
    status?: string;
  }[];
}

export const TransporterBiddingTab: React.FC = () => {
  const { language, t } = useLanguage();
  const [tenders, setTenders] = useState<CarrierTender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [awardingId, setAwardingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState('');

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/forwarder/tenders');
      if (res.ok) {
        const data = await res.json();
        const incoming = data.tenders || [];
        setTenders(incoming);
        if (incoming.length > 0) {
          if (!incoming.some((t: any) => t.id === selectedTenderId)) {
            setSelectedTenderId(incoming[0].id);
          }
        } else {
          setSelectedTenderId('');
        }
      }
    } catch (e) {
      console.warn('Could not fetch tenders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
    const timer = setInterval(fetchTenders, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeTender = tenders.find((t) => t.id === selectedTenderId) || tenders[0] || null;

  // Real Dynamic KPIs calculated from PostgreSQL records
  const openTendersCount = tenders.filter((t) => t.status === 'OPEN_FOR_BIDS').length;
  const awardedTenders = tenders.filter((t) => t.status === 'AWARDED');
  const awardedVolumeTons = awardedTenders.reduce((sum, t) => sum + (t.totalConsolidatedTons || 0), 0);
  const totalVolumeSavingsEtb = tenders.reduce(
    (sum, t) => sum + Math.max(0, (t.budgetCapEtb || 0) - (t.lowestQuoteEtb || 0)),
    0
  );
  const uniqueCarriersCount = new Set(
    tenders.flatMap((t) => t.bidders.map((b) => b.transporterId || b.transporterName))
  ).size;

  const handleAwardCarrier = async (tenderId: string, bidder: any) => {
    setAwardingId(bidder.bidId || bidder.transporterName);
    try {
      const res = await fetch('/api/forwarder/tenders/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loadId: tenderId,
          bidId: bidder.bidId,
          transporterId: bidder.transporterId,
          agreedRateEtb: bidder.quotedRateEtb,
        }),
      });

      if (res.ok) {
        setTenders((prev) =>
          prev.map((item) =>
            item.id === tenderId
              ? { ...item, status: 'AWARDED', awardedCarrier: bidder.transporterName }
              : item
          )
        );
        setSuccessToast(
          language === 'AM'
            ? `✓ የኮሪደር ማስተር ውል ለ ${bidder.transporterName} በ ${bidder.quotedRateEtb?.toLocaleString()} ብር በተሳካ ሁኔታ ተሰጥቷል! የቀጥታ ጭነት ተልኳል።`
            : language === 'OM'
            ? `✓ Waliigalteen Koriidoorii ${bidder.transporterName}f gatii ETB ${bidder.quotedRateEtb?.toLocaleString()}n milkaaʼinaan kennameera! Feʼiisni imala eegaleera.`
            : `✓ Master contract successfully awarded to ${bidder.transporterName} at ${bidder.quotedRateEtb?.toLocaleString()} ETB! Live corridor shipment dispatched.`
        );
        setTimeout(() => setSuccessToast(''), 6000);
        await fetchTenders();
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error || 'Failed to award tender contract');
      }
    } catch (e: any) {
      alert(e.message || 'Error communicating with dispatch server');
    } finally {
      setAwardingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-sky-600" />
            <span>
              {language === 'AM'
                ? 'የአገር አቋራጭ አጓጓዦች ጨረታ'
                : language === 'OM'
                ? 'Caalbaasii Geessitoota Koriidoorii'
                : 'Master Transporter Corridor Bidding'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'AM'
              ? 'የተዋሃዱ የበርካታ ላኪዎች ጭነቶችን ለተረጋገጡ የኢትዮጵያ አጓጓዦች በድርድርና በጨረታ ይላኩ።'
              : language === 'OM'
              ? 'Feʼiisa walitti makame ergitoota heddduu irraa waldaalee geejjibaa Itoophiyaa mirkanaaʼaniif caalbaasiin ergaa.'
              : 'Dispatch consolidated multi-shipper freight tenders to verified Ethiopian carrier associations with negotiated volume discounts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTenders}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>
            {language === 'AM' ? 'ጨረታዎችን አመሳስል' : language === 'OM' ? 'Caalbaasii Walsaamisiisi' : 'Sync Tenders'}
          </span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Real Dynamic KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'ክፍት ጨረታዎች' : language === 'OM' ? 'Caalbaasii Banamaa' : 'Active Tenders'}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {openTendersCount}
          </span>
          <span className="text-[10px] text-sky-600 font-bold">
            {language === 'AM' ? 'ለአጓጓዥ ክፍት' : language === 'OM' ? 'Geessitootaaf Banamaa' : 'Open for Carrier Bids'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'የተሰጠ ውል መጠን' : language === 'OM' ? 'Hamma Waliigaltee Kenname' : 'Awarded Volume'}
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {awardedVolumeTons > 0 ? `${awardedVolumeTons.toFixed(1)} ${language === 'AM' ? 'ቶን' : language === 'OM' ? 'T' : 'T'}` : '0 T'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {awardedTenders.length} {language === 'AM' ? 'የፀደቁ ኮንትራቶች' : language === 'OM' ? 'Waliigalteewwan Mirkanoofan' : 'Master Contracts'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'የጅምላ ዋጋ ቁጠባ' : language === 'OM' ? 'Qusannaa Gatii Jumlaa' : 'Volume Savings'}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {totalVolumeSavingsEtb > 0 ? `${totalVolumeSavingsEtb.toLocaleString()} ETB` : '0 ETB'}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">
            {language === 'AM' ? 'ከተናጠል ጭነት አንፃር' : language === 'OM' ? 'Gatii Idilee Gadi' : 'Below Standard Spot Rates'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'AM' ? 'ተወዳዳሪ አጓጓዦች' : language === 'OM' ? 'Geessitoota Dorgoman' : 'Bidding Carriers'}
          </span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {uniqueCarriersCount}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {language === 'AM' ? 'የተመዘገቡ ተጫራቾች' : language === 'OM' ? 'Konkolaattota Hirmaatan' : 'Participating Fleets'}
          </span>
        </div>
      </div>

      {/* Main Grid or Empty State */}
      {tenders.length === 0 && !loading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <GitMerge className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {language === 'AM'
              ? 'ምንም ክፍት ወይም የተዋሃደ የአጓጓዥ ጨረታ የለም'
              : language === 'OM'
              ? 'Caalbaasiin walitti makame hin jiru'
              : 'No Consolidated Tenders Available'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'AM'
              ? 'በ Consolidation Wizard ታብ ውስጥ አነስተኛ ጭነቶችን (LTL Loads) ወደ አንድ ኮንቴነር ሲያዋህዱ ለትራንስፖርተሮች የቀረበው ጨረታ እዚህ በቀጥታ ይታያል።'
              : language === 'OM'
              ? 'Yammuu feʼiisa LTL konteenara tokko keessatti walitti maktan caalbaasiin geessitootaa asitti mulʼata.'
              : 'When you consolidate partial consignments (LTL loads) into a master container in the Consolidation Wizard, the resulting tender will appear here live for transporter bidding.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tenders List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              {language === 'AM'
                ? `የተዋሃዱ የጭነት ጨረታዎች (${tenders.length})`
                : language === 'OM'
                ? `Caalbaasiiwwan Feʼiisa Walitti Makamee (${tenders.length})`
                : `Consolidated Freight Tenders (${tenders.length})`}
            </h3>

            <div className="space-y-2.5">
              {tenders.map((item) => {
                const isSelected = item.id === selectedTenderId;
                const isAwarded = item.status === 'AWARDED';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTenderId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/50 border-sky-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-slate-900">{item.tenderCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          isAwarded ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {isAwarded
                          ? (language === 'AM' ? 'የተሰጠ' : language === 'OM' ? 'Kennameera' : 'AWARDED')
                          : (language === 'AM' ? 'ክፍት ጨረታ' : language === 'OM' ? 'Banamaa' : 'OPEN FOR BIDS')}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-800 mt-2 line-clamp-1">{item.routeTitle}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.containerClass}</p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          {language === 'AM' ? 'ዝቅተኛ ዋጋ' : language === 'OM' ? 'Gatii Gadi-aanaa' : 'Lowest Bid'}
                        </span>
                        <strong className="text-emerald-700 font-black">
                          {item.lowestQuoteEtb > 0
                            ? `${item.lowestQuoteEtb.toLocaleString()} ETB`
                            : (language === 'AM' ? 'ጨረታ ይጠበቃል' : language === 'OM' ? 'Caalbaasii Eegaa Jira' : 'Awaiting Bids')}
                        </strong>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          {language === 'AM' ? 'የቀረቡ ጨረታዎች' : language === 'OM' ? 'Caalbaasii Dhiyaate' : 'Bids Received'}
                        </span>
                        <strong className="text-slate-800 font-black">
                          {item.bidsCount} {language === 'AM' ? 'አጓጓዦች' : language === 'OM' ? 'Geessitoota' : 'Carriers'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Tender Bidders & Dispatch (7 cols) */}
          <div className="lg:col-span-7">
            {activeTender ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      {activeTender.tenderCode} {language === 'AM' ? 'የጭነት ዶሴ' : language === 'OM' ? 'Doozii Feʼiisaa' : 'Tender Dossier'}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{activeTender.routeTitle}</h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'AM' ? 'ጠቅላላ ክብደት፦' : language === 'OM' ? 'Waliigala Ulfaatina:' : 'Total Weight:'} <strong>{activeTender.totalConsolidatedTons} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {language === 'AM' ? 'የበጀት ጣሪያ' : language === 'OM' ? 'Daangaa Baajataa' : 'Budget Cap'}
                    </span>
                    <strong className="text-sm font-black text-slate-900">
                      {activeTender.budgetCapEtb > 0
                        ? `${activeTender.budgetCapEtb.toLocaleString()} ETB`
                        : (language === 'AM' ? 'አልተወሰነም' : language === 'OM' ? 'Hin Murtoofne' : 'Not Set')}
                    </strong>
                  </div>
                </div>

                {activeTender.awardedCarrier && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="text-emerald-900 block">
                          {language === 'AM' ? 'የተሰጠው አሸናፊ አጓጓዥ' : language === 'OM' ? 'Geessisaa Moʼate' : 'Awarded Carrier'}
                        </strong>
                        <span className="text-emerald-700 text-[11px] font-bold">{activeTender.awardedCarrier}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                      {language === 'AM' ? 'የተቆለፈ ውል' : language === 'OM' ? 'Cufameera' : 'Locked'}
                    </span>
                  </div>
                )}

                {/* Competitive Bidders Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      {language === 'AM'
                        ? `የቀረቡ የአጓጓዥ ጨረታዎች (${activeTender.bidders.length})`
                        : language === 'OM'
                        ? `Yaada Caalbaasii Geessitootaa (${activeTender.bidders.length})`
                        : `Carrier Proposals (${activeTender.bidders.length})`}
                    </h4>
                  </div>

                  {activeTender.bidders.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <Truck className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">
                        {language === 'AM'
                          ? 'ገና የቀረበ የአጓጓዥ ጨረታ የለም'
                          : language === 'OM'
                          ? 'Hanga ammaatti caalbaasiin hin dhiyaanne'
                          : 'No Carrier Bids Yet'}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {language === 'AM'
                          ? 'የኮሪደር አጓጓዦች በሞባይል መተግበሪያቸው ጨረታ ሲያስገቡ እዚህ በቀጥታ ይደርሳል።'
                          : language === 'OM'
                          ? 'Geessitoonni mobaayila isaaniin caalbaasii yammuu galchan asitti mulʼata.'
                          : 'When registered transporters submit bids on this corridor load, their proposals will appear here in real time.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeTender.bidders.map((b, idx) => {
                        const isLowest = b.quotedRateEtb === activeTender.lowestQuoteEtb;
                        const isAwardedThis = activeTender.awardedCarrier === b.transporterName;

                        return (
                          <div
                            key={b.bidId || b.transporterName}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isAwardedThis
                                ? 'bg-emerald-50/60 border-emerald-300'
                                : isLowest
                                ? 'bg-sky-50/30 border-sky-200'
                                : 'bg-slate-50/50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <strong className="text-xs font-black text-slate-900">{b.transporterName}</strong>
                                  {isLowest && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                                      {language === 'AM' ? 'ዝቅተኛ ዋጋ' : language === 'OM' ? 'Gatii Gaarii' : 'Best Quote'}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-7 font-medium">
                                  <span>{language === 'AM' ? 'ተሽከርካሪዎች፦' : language === 'OM' ? 'Konkolaattota:' : 'Vehicles:'} {b.fleetSize}</span>
                                  <span>•</span>
                                  <span>{language === 'AM' ? 'ደረጃ፦' : language === 'OM' ? 'Sadarkaa:' : 'Rating:'} {b.rating} ★</span>
                                  <span>•</span>
                                  <span>{b.transitHours} {language === 'AM' ? 'ሰዓት' : language === 'OM' ? 'saʼa' : 'hrs'}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0">
                                <div className="text-right">
                                  <div className="text-sm font-black text-slate-900">
                                    {b.quotedRateEtb.toLocaleString()} ETB
                                  </div>
                                  {activeTender.budgetCapEtb > b.quotedRateEtb && (
                                    <div className="text-[10px] text-emerald-600 font-bold">
                                      {language === 'AM' ? 'ቁጠባ፦' : language === 'OM' ? 'Qusannaa:' : 'Savings:'} -{(activeTender.budgetCapEtb - b.quotedRateEtb).toLocaleString()} ETB
                                    </div>
                                  )}
                                </div>

                                {activeTender.status === 'OPEN_FOR_BIDS' && (
                                  <button
                                    type="button"
                                    disabled={Boolean(awardingId)}
                                    onClick={() => handleAwardCarrier(activeTender.id, b)}
                                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {awardingId === (b.bidId || b.transporterName) ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>{language === 'AM' ? 'በማጽደቅ ላይ...' : language === 'OM' ? 'Mirkaneessaa jira...' : 'Awarding...'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Award className="w-3.5 h-3.5" />
                                        <span>{language === 'AM' ? 'ውል ስጥ' : language === 'OM' ? 'Waliigaltee Kenni' : 'Award Contract'}</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {isAwardedThis && (
                                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{language === 'AM' ? 'የፀደቀ' : language === 'OM' ? 'Mirkanaaʼe' : 'Awarded'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
