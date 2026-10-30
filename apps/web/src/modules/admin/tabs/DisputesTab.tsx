import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Building,
  Truck,
  DollarSign,
  CreditCard,
  Scale,
  FileText,
  User,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { DisputeTicketItem, DisputeStats } from '../types';
import { DisputeArbitrationModal } from '../components/DisputeArbitrationModal';
import { useLanguage } from '../../../context/LanguageContext';

interface DisputesTabProps {
  tickets: DisputeTicketItem[];
  stats: DisputeStats;
  loading: boolean;
  onRefresh: () => void;
  onArbitrate: (
    paymentId: string,
    verdict: 'REFUND_SHIPPER' | 'RELEASE_TRANSPORTER' | 'PARTIAL_SPLIT',
    refundAmountEtb: number,
    transporterPayoutEtb: number,
    adminNotes: string
  ) => Promise<void>;
}

export const DisputesTab: React.FC<DisputesTabProps> = ({
  tickets = [],
  stats,
  loading,
  onRefresh,
  onArbitrate,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'SETTLED' | 'REFUNDED'>('ALL');

  // Selected Ticket for Arbitration Modal
  const [activeTicket, setActiveTicket] = useState<DisputeTicketItem | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'OPEN' && t.status !== 'DISPUTED') return false;
    if (statusFilter === 'SETTLED' && t.status !== 'SETTLED') return false;
    if (statusFilter === 'REFUNDED' && t.status !== 'REFUNDED') return false;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchNo = t.ticketNumber.toLowerCase().includes(q);
      const matchLoad = t.loadCode.toLowerCase().includes(q);
      const matchShipper = t.shipperCompany.toLowerCase().includes(q) || t.shipperTin.toLowerCase().includes(q);
      const matchCarrier = t.transporterName.toLowerCase().includes(q) || t.truckPlate.toLowerCase().includes(q);
      return matchNo || matchLoad || matchShipper || matchCarrier;
    }
    return true;
  });

  const handleOpenArbitration = (ticket: DisputeTicketItem) => {
    setActiveTicket(ticket);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('admin.disputesTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('admin.disputesSubtitle')}
          </p>
        </div>
      </div>

      {/* Action Success Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'AM' ? 'ክፍት የክርክር መዝገቦች' : language === 'OM' ? 'Galmeewwan Falmii Banaa' : 'Open Contested Cases'}</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.openCases}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {language === 'AM' ? 'በኤስክሮው የታገዱ ገንዘቦች' : language === 'OM' ? 'Maallaqa Eeskiroo Keessatti Qabame' : 'Funds Frozen in Escrow'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'AM' ? 'የታገደ የኤስክሮው መጠን' : language === 'OM' ? 'Gatii Eeskiroo Qabame' : 'Frozen Escrow Value'}</span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {Number(stats.totalFrozenAmountEtb).toLocaleString()} ETB
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {language === 'AM' ? 'ውሳኔ በመጠባበቅ ላይ' : language === 'OM' ? 'Murtee Eeggamaa Jira' : 'Pending Resolution'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'AM' ? 'የተፈቱ / የተከፈሉ' : language === 'OM' ? 'Furmaata Kan Argatan' : 'Resolved / Settled'}</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.resolvedCases}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {language === 'AM' ? 'ሽምግልና ተጠናቋል' : language === 'OM' ? 'Araarri Xumurameera' : 'Mediation Completed'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>{language === 'AM' ? 'የስኬት ምጣኔ' : language === 'OM' ? 'Reeshoo Milkaa\'inaa' : 'Success Rate'}</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.mediationSuccessRatePct}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {language === 'AM' ? 'አማካይ የመፍቻ ጊዜ:' : language === 'OM' ? 'Giddu-galeessaan:' : 'Avg SLA:'} {stats.averageResolutionHours} {language === 'AM' ? 'ሰዓታት' : language === 'OM' ? 'Sa\'aatii' : 'Hours'}
          </div>
        </div>
      </div>

      {/* 3. Filter Pills & Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'AM' ? 'ሁሉም ክርክሮች' : language === 'OM' ? 'Falmiiwwan Hundaa' : 'All Disputes'} ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'AM' ? 'ክፍት / የታገዱ' : language === 'OM' ? 'Banaa / Qabame' : 'Open / Frozen'} ({stats.openCases})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SETTLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'SETTLED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'AM' ? 'የተከፈሉ' : language === 'OM' ? 'Kaffalame' : 'Settled / Payout'} ({stats.resolvedCases})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REFUNDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'REFUNDED'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'AM' ? 'የተመለሱ' : language === 'OM' ? 'Deebifame' : 'Refunded'} ({stats.refundedCases})
          </button>
        </div>

        <div className="relative min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'AM' ? 'በትኬት ቁጥር፣ ላኪ፣ አጓጓዥ ወይም የታርጋ ቁጥር ይፈልጉ...' : language === 'OM' ? 'Lakkofsa Tikkeettii, Ergaa, Konkolaachisaan barbaadaa...' : 'Search by Ticket #, Shipper, Carrier, or Plate...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* 4. Disputes List */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <div className="text-sm font-bold text-slate-800">
            {tickets.length === 0
              ? (language === 'AM' ? 'ምንም ንቁ የኤስክሮው ክርክሮች የሉም' : language === 'OM' ? 'Falmiin Eeskiroo Hojiirra Jiru Hin Jiru' : 'No Active Smart Escrow Disputes')
              : (language === 'AM' ? 'ከማጣሪያው ጋር የሚዛመድ ክርክር የለም' : language === 'OM' ? 'Falmiin Calaltuu Waliin Walsimu Hin Jiru' : 'No Disputes Matching Filter')}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {tickets.length === 0
              ? (language === 'AM'
                  ? 'የጭነት ኤስክሮው ክፍያዎች በኮሪደሩ ላይ ያለምንም እንከን እየተከናወኑ ነው። በላኪዎች የተነሱ ማናቸውም የጉዳት ወይም የክፍያ ቅሬታዎች እዚህ ይመደባሉ።'
                  : language === 'OM'
                  ? 'Kaffaltiin eeskiroo imala geejjibaa nagaan adeemsifamaa jira. Kaffaltiin ykn komiin miidhaa ergitootaan dhiyaatu hundi asitti ilaalama.'
                  : 'Freight escrow transactions are currently running smoothly along the corridor. Any disputed charges or damage claims filed by shippers will be routed here.')
              : (language === 'AM'
                  ? 'እባክዎ የፍለጋ ቃሉን ያጥፉ ወይም ወደ ሌላ የማጣሪያ ታብ ይቀይሩ።'
                  : language === 'OM'
                  ? 'Mee jecha barbaachaa qulqulleessaa ykn calaltuu birootti jijjiiraa.'
                  : 'Try clearing your search query or switching to another filter tab.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => {
            const isOpen = ticket.status === 'DISPUTED';
            const isSettled = ticket.status === 'SETTLED';
            const isRefunded = ticket.status === 'REFUNDED';

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-3xl border transition-all bg-white relative overflow-hidden ${
                  isOpen
                    ? 'border-amber-300 ring-2 ring-amber-500/10 shadow-sm'
                    : isRefunded
                    ? 'border-purple-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info Column */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isOpen
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : isRefunded
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isOpen
                          ? (language === 'AM' ? '⏳ ኤስክሮው ታግዷል (በሽምግልና ላይ)' : language === 'OM' ? '⏳ Eeskiroo Qabame (Adeemsa Murtee)' : '⏳ ESCROW FROZEN (UNDER ARBITRATION)')
                          : isRefunded
                          ? (language === 'AM' ? '✓ 100% ለላኪው ተመላሽ ተደርጓል' : language === 'OM' ? '✓ 100% Ergaaf Deebifame' : '✓ 100% REFUNDED TO SHIPPER')
                          : (language === 'AM' ? '✓ ተፈትቶ ክፍያ ተፈጽሟል' : language === 'OM' ? '✓ Furamee Kaffaltiin Raawwate' : '✓ RESOLVED & DISBURSED')}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      {ticket.title} ({ticket.weightTons}T {ticket.cargoType})
                    </h3>

                    {/* Contested Reason Callout */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>{language === 'AM' ? 'የተነሳው አቤቱታ:' : language === 'OM' ? 'Kompii Dhiyaate:' : 'Contested Claim:'} {ticket.disputeReason}</span>
                      </div>
                      <div className="text-[11px] text-amber-800">
                        {language === 'AM' ? 'ላኪው የጠየቀው ተቀናሽ:' : language === 'OM' ? 'Hir\'ifama Ergaan Gaafate:' : 'Shipper Claimed Deduction:'}{' '}
                        <strong className="font-mono text-rose-700 font-bold">
                          {Number(ticket.claimedAmountEtb).toLocaleString()} ETB
                        </strong>{' '}
                        • {language === 'AM' ? 'ጠቅላላ የታገደ ኤስክሮው:' : language === 'OM' ? 'Ida\'ama Eeskiroo Qabamee:' : 'Total Frozen Escrow:'}{' '}
                        <strong className="font-mono text-slate-900">
                          {Number(ticket.grossAmountEtb).toLocaleString()} ETB
                        </strong>
                      </div>
                    </div>

                    {/* Both Parties Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      {/* Shipper Party */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{language === 'AM' ? 'ላኪ (ከሳሽ)' : language === 'OM' ? 'Ergaa (Himataa)' : 'Consignor (Claimant)'}</div>
                        <div className="font-bold text-slate-900">{ticket.shipperCompany}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          TIN: {ticket.shipperTin} • {ticket.shipperPhone}
                        </div>
                      </div>

                      {/* Transporter Party */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{language === 'AM' ? 'አጓጓዥ (ተከሳሽ)' : language === 'OM' ? 'GeesSAA (Himataamaa)' : 'Carrier (Respondent)'}</div>
                        <div className="font-bold text-slate-900">{ticket.transporterName}</div>
                        <div className="text-slate-500 text-[11px]">
                          {language === 'AM' ? 'አሽከርካሪ:' : language === 'OM' ? 'Konkolaachisaa:' : 'Driver:'} {ticket.driverName} • {language === 'AM' ? 'ታርጋ:' : language === 'OM' ? 'Gabatee:' : 'Plate:'} <strong>{ticket.truckPlate}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Column */}
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-stretch gap-2 min-w-[200px]">
                    <div className="text-right p-3 rounded-2xl bg-slate-50 border border-slate-200 sm:block hidden">
                      <div className="text-[10px] font-bold uppercase text-slate-400">{language === 'AM' ? 'ጠቅላላ የኤስክሮው ገንዘብ' : language === 'OM' ? 'Maallaqa Eeskiroo Waliigalaa' : 'Total Escrow Funds'}</div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        {Number(ticket.grossAmountEtb).toLocaleString()} ETB
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {language === 'AM' ? 'የአጓጓዥ የተጣራ:' : language === 'OM' ? 'Qulqulluu Geessituu:' : 'Carrier Net:'} {Number(ticket.netTransporterPayoutEtb).toLocaleString()} ETB
                      </div>
                    </div>

                    {isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleOpenArbitration(ticket)}
                        className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full"
                      >
                        <Scale className="w-4 h-4" />
                        <span>{language === 'AM' ? 'ጉዳዩን ሸምግልና ወስን' : language === 'OM' ? 'Falmii Murteessi' : 'Arbitrate Case'}</span>
                      </button>
                    ) : (
                      <div className="p-3 text-center rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                        {isRefunded
                          ? (language === 'AM' ? 'ተመላሽ ተፈጽሟል ✓' : language === 'OM' ? 'Deebiin Raawwateera ✓' : 'Refund Executed ✓')
                          : (language === 'AM' ? 'ክፍያ ተፈጽሟል ✓' : language === 'OM' ? 'Kaffaltiin Raawwateera ✓' : 'Settlement Executed ✓')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modular Smart Escrow Arbitration Verdict Modal */}
      <DisputeArbitrationModal
        activeTicket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onConfirm={async (paymentId, v, refund, payout, notes) => {
          await onArbitrate(paymentId, v, refund, payout, notes);
          setActionSuccessMsg(
            language === 'AM'
              ? '⚖️ מחሪኝ ውሳኔ ተመዝግቧል! ገንዘብ ተከፋፍሏል።'
              : language === 'OM'
              ? '⚖️ Murteen dirqisiisaa galmaa\'eera! Maallaqni kaffalameera.'
              : '⚖️ Binding verdict recorded! Funds disbursed.'
          );
          setTimeout(() => setActionSuccessMsg(''), 5000);
          onRefresh();
        }}
      />
    </div>
  );
};
