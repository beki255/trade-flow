import React, { useState, useMemo } from 'react';
import {
  Gavel,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Building,
  Phone,
  Star,
  Check,
  X,
  AlertCircle,
  Filter,
  Search,
  Hourglass,
  CreditCard,
  Route,
} from 'lucide-react';
import { BidItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

const cleanText = (str?: string) => (str ? String(str).replace(/^`+|`+$/g, '').trim() : '');

interface BidsTabProps {
  bids: BidItem[];
  onAcceptBid: (bid: BidItem) => void;
  onRejectBid: (bidId: string) => void;
  acceptedBidNotification?: string;
}

export const BidsTab: React.FC<BidsTabProps> = ({
  bids,
  onAcceptBid,
  onRejectBid,
  acceptedBidNotification,
}) => {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Process bids to calculate dynamic validity state
  const processedBids = useMemo(() => {
    const now = Date.now();
    return bids.map((b) => {
      let isExpired = b.status === 'EXPIRED';
      let remainingHours = 0;
      let remainingMins = 0;

      if (b.expiresAt) {
        const expiryTime = new Date(b.expiresAt).getTime();
        const diffMs = expiryTime - now;
        if (diffMs <= 0) {
          isExpired = true;
        } else {
          remainingHours = Math.floor(diffMs / (1000 * 60 * 60));
          remainingMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        }
      }

      const isAccepted = b.status === 'ACCEPTED';
      const isRejected = b.status === 'REJECTED';
      const isPending = !isAccepted && !isRejected;
      const isDirectAiOffer = Boolean(
        b.notes?.includes('DIRECT AI INSTANT MATCH') ||
        b.notes?.includes('Option A') ||
        b.notes?.includes('Direct match')
      );
      const isEscrowSecured = Boolean(
        b.isEscrowPaid ||
        b.paymentStatus === 'HELD_IN_ESCROW' ||
        b.paymentStatus === 'CONFIRMED' ||
        b.paymentStatus === 'SETTLED' ||
        b.notes?.toLowerCase().includes('dispatched') ||
        b.notes?.toLowerCase().includes('escrow')
      );

      return {
        ...b,
        isExpired: isExpired && !isAccepted,
        remainingHours,
        remainingMins,
        isAccepted,
        isRejected,
        isPending,
        isDirectAiOffer,
        isEscrowSecured,
      };
    });
  }, [bids]);

  const filteredBids = useMemo(() => {
    return processedBids.filter((b) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && (!b.isPending || b.isExpired)) return false;
      if (statusFilter === 'EXPIRED' && !b.isExpired) return false;
      if (statusFilter === 'ACCEPTED' && !b.isAccepted) return false;
      if (statusFilter === 'REJECTED' && !b.isRejected) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesCarrier = b.transporterName.toLowerCase().includes(q);
        const matchesLoad = b.loadTitle.toLowerCase().includes(q);
        const matchesRoute = b.route.toLowerCase().includes(q);
        if (!matchesCarrier && !matchesLoad && !matchesRoute) return false;
      }

      return true;
    });
  }, [processedBids, statusFilter, searchQuery]);

  const totalActive = processedBids.filter((b) => b.isPending && !b.isExpired).length;
  const totalExpired = processedBids.filter((b) => b.isExpired).length;
  const totalAccepted = processedBids.filter((b) => b.isAccepted).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('shipper.bidsTitle')}
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            {t('shipper.bidsSubtitle')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('shipper.filterAll')} ({processedBids.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('shipper.filterOpen')} ({totalActive})
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'EXPIRED'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'AM' ? 'ጊዜው ያለፈበት' : language === 'OM' ? 'Yeroon Darbe' : 'Expired'} ({totalExpired})
          </button>
          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ACCEPTED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'AM' ? 'ተቀባይነት ያገኘ' : language === 'OM' ? 'Fudhatame' : 'Accepted'} ({totalAccepted})
          </button>
        </div>
      </div>

      {/* 2. Notification Alert */}
      {acceptedBidNotification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{acceptedBidNotification}</span>
        </div>
      )}

      {/* 3. Search & Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'AM'
                ? 'በአጓጓዥ ስም፣ በጭነት ርዕስ ወይም በመስመር ይፈልጉ...'
                : language === 'OM'
                ? 'Maqaa fe\'aadhaan, mata duree fe\'isaan barbaadi...'
                : 'Search by carrier name, cargo title, or corridor route...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold self-end sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{language === 'AM' ? 'መደበኛ ተፈጻሚነት፡ 24 ሰዓታት' : language === 'OM' ? 'Tureetii Idilee: Sa\'aatii 24' : 'Default Validity: 24 Hours'}</span>
        </div>
      </div>

      {/* 4. Empty State */}
      {filteredBids.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
            <Gavel className="w-6 h-6" />
          </div>
          <div className="text-sm font-black text-slate-800">
            {searchQuery
              ? (language === 'AM' ? 'ምንም የሚዛመድ ዋጋ አልተገኘም' : language === 'OM' ? 'Gatiin walsimu hin argamne' : 'No matching quotations found')
              : (language === 'AM' ? 'እስካሁን ምንም የአጓጓዥ ዋጋ አልቀረበም' : language === 'OM' ? 'Hanga ammaatti gatiin dhihaate hin jiru' : 'No transporter quotations received yet')}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? (language === 'AM' ? 'እባክዎ የፍለጋ ቃላትን ያስተካክሉ ወይም ማጣሪያዎችን ያጽዱ።' : language === 'OM' ? 'Maaloo jechoota barbaacha sirreessaa ykn calaltuu qulqulleessaa.' : 'Try refining your search keywords or clear filters.')
              : (language === 'AM' ? 'የተረጋገጡ አጓጓዦች ለለጠፏቸው ጭነቶች ዋጋ ሲያቀርቡ፣ እዚህ በቀጥታ የቆይታ ጊዜ ቆጣሪ ጋር ይታያሉ።' : language === 'OM' ? 'Yeroo fe\'aa mirkanaa\'an gatii dhiheessan, sa\'aatii tureetii waliin asirratti mul\'atu.' : 'When verified transporters submit bids for your published freight consignments, they will appear here with live validity timers.')}
          </p>
        </div>
      ) : (
        /* 5. Bids Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBids.map((b) => {
            const isVerified = b.transporterVerificationStatus === 'VERIFIED';
            const isBoilerplateNotes =
              !b.notes ||
              b.notes.includes('DIRECT AI INSTANT MATCH') ||
              b.notes.includes('DIRECT AI OFFER');

            return (
              <div
                key={b.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-3.5 ${
                  b.isAccepted
                    ? 'border-emerald-500 bg-emerald-50/10 shadow-xs'
                    : b.isExpired
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : b.isRejected
                    ? 'border-rose-200 bg-rose-50/10 opacity-75'
                    : b.isDirectAiOffer
                    ? 'border-amber-200 bg-white shadow-xs hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Header & Carrier Info */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 tracking-tight">
                          {b.transporterName}
                        </span>
                        {isVerified && (
                          <span title="Verified Carrier" className="text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-amber-200/60">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {b.rating}/5.0
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {cleanText(b.loadTitle)}
                      </div>
                      <div className="text-[10px] text-sky-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                        <Route className="w-3 h-3 text-sky-500 shrink-0" />
                        <span className="truncate">{cleanText(b.route)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900 tracking-tight">
                        {b.bidAmount.toLocaleString()} <span className="text-[11px] text-slate-500 font-bold">ETB</span>
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          b.isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.isExpired
                            ? 'bg-rose-100 text-rose-800'
                            : b.isRejected
                            ? 'bg-slate-200 text-slate-700'
                            : b.isDirectAiOffer
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {b.isAccepted
                          ? (language === 'AM' ? 'ተቀባይነት አግኝቷል' : language === 'OM' ? 'Fudhatameera' : 'ACCEPTED')
                          : b.isExpired
                          ? (language === 'AM' ? 'ጊዜው አልፏል' : language === 'OM' ? 'Yeroon Darbeera' : 'EXPIRED')
                          : b.isRejected
                          ? (language === 'AM' ? 'ውድቅ ተደርጓል' : language === 'OM' ? 'Kufaa Ta\'eera' : 'DECLINED')
                          : b.isDirectAiOffer
                          ? (language === 'AM' ? 'ቅናሽ ተልኳል' : language === 'OM' ? 'Ergameera' : 'OFFER SENT')
                          : (language === 'AM' ? 'ዋጋ በመጠባበቅ ላይ' : language === 'OM' ? 'Eegamaa Jira' : 'PENDING QUOTE')}
                      </span>
                    </div>
                  </div>

                  {/* Contact info & Custom Notes (only if real custom notes) */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{b.transporterPhone}</span>
                    </span>
                    {!b.isDirectAiOffer && !b.isAccepted && !b.isExpired && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {b.remainingHours > 0
                          ? `${b.remainingHours}h ${b.remainingMins}m ${language === 'AM' ? 'ተፈጻሚነት' : language === 'OM' ? 'turtii' : 'validity'}`
                          : `${b.remainingMins}m ${language === 'AM' ? 'ተፈጻሚነት' : language === 'OM' ? 'turtii' : 'validity'}`}
                      </span>
                    )}
                  </div>

                  {!isBoilerplateNotes && b.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                {/* Actions & Status Footers */}
                <div className="pt-1">
                  {b.isPending && !b.isExpired && b.isDirectAiOffer && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                            <span>{language === 'AM' ? 'የአጓጓዥ ይሁንታ በመጠባበቅ ላይ' : language === 'OM' ? 'Fudhannaa Fe\'aa Eegaa Jira' : 'Awaiting Transporter Acceptance'}</span>
                            <span className="text-[9.5px] font-semibold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                              {b.remainingHours > 0
                                ? `${b.remainingHours}h ${b.remainingMins}m ${language === 'AM' ? 'ቀሪ' : language === 'OM' ? 'hafe' : 'left'}`
                                : `${b.remainingMins}m ${language === 'AM' ? 'ቀሪ' : language === 'OM' ? 'hafe' : 'left'}`}
                            </span>
                          </div>
                          <div className="text-[9.5px] text-amber-800 truncate">
                            {language === 'AM' ? 'ቀጥተኛ ጥያቄ ተልኳል • አጓጓዡ እየተመለከተው ነው' : language === 'OM' ? 'Dhiheessi kallattii ergame • Fe\'aan ilaalaa jira' : 'Direct offer sent • Transporter reviewing dispatch'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRejectBid(b.id)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-[11px] font-bold transition shadow-2xs shrink-0 cursor-pointer"
                      >
                        {language === 'AM' ? 'ይቅር' : language === 'OM' ? 'Haqi' : 'Cancel'}
                      </button>
                    </div>
                  )}

                  {b.isPending && !b.isExpired && !b.isDirectAiOffer && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAcceptBid(b)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('shipper.acceptBid')}</span>
                      </button>
                      <button
                        onClick={() => onRejectBid(b.id)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                      >
                        {t('shipper.declineBid')}
                      </button>
                    </div>
                  )}

                  {b.isPending && b.isExpired && (
                    <div className="w-full py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{language === 'AM' ? 'ጊዜው አልፏል • የቆይታ ገደቡ አልቋል' : language === 'OM' ? 'Yeroon Darbe • Turtii Xumurame' : 'Expired • Validity Window Elapsed'}</span>
                    </div>
                  )}

                  {b.isAccepted && (
                    <div className="space-y-1.5">
                      <div className="w-full py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black text-center flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'AM' ? 'አጓጓዥ ተቀብሏል • መስመር ተረጋግጧል' : language === 'OM' ? 'Fe\'aan Fudhate • Daandiin Mirkanaa\'e' : 'Carrier Accepted • Route Confirmed'}</span>
                      </div>

                      {b.isEscrowSecured ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center justify-center gap-2 shadow-2xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>
                            {language === 'AM'
                              ? `ክፍያው በኤስክሮው ተቆልፏል • ${b.paymentMethod || 'ቴሌብር'}`
                              : language === 'OM'
                              ? `Iskroow Keessatti Hidhame • ${b.paymentMethod || 'Telebirr'}`
                              : `Escrow Secured in Vault • ${b.paymentMethod || 'Telebirr'}`}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAcceptBid(b)}
                          className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{language === 'AM' ? 'ክፍያ በኤስክሮው አስይዝ (ቴሌብር / ሲቢኢ) ➔' : language === 'OM' ? 'Iskroow Kaffali (Telebirr / CBE) ➔' : 'Deposit Escrow (Telebirr / CBE) ➔'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {b.isRejected && (
                    <div className="w-full py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold text-center border border-rose-200">
                      {language === 'AM' ? 'የቀረበው ዋጋ ተቀባይነት አላገኘም' : language === 'OM' ? 'Dhiheessi Gatii Kufaa Ta\'e' : 'Quotation Declined'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
