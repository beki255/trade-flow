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
} from 'lucide-react';
import { BidItem } from '../types';

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

      return {
        ...b,
        isExpired: isExpired && !isAccepted,
        remainingHours,
        remainingMins,
        isAccepted,
        isRejected,
        isPending,
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
            Transporter Bids & Quotations
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Review competitive carrier quotations, assess driver ratings, and confirm assignments within the active validity window.
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
            All ({processedBids.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({totalActive})
          </button>
          <button
            onClick={() => setStatusFilter('EXPIRED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'EXPIRED'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expired ({totalExpired})
          </button>
          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ACCEPTED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accepted ({totalAccepted})
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
            placeholder="Search by carrier name, cargo title, or corridor route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold self-end sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Default Validity: 24 Hours</span>
        </div>
      </div>

      {/* 4. Empty State */}
      {filteredBids.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
            <Gavel className="w-6 h-6" />
          </div>
          <div className="text-sm font-black text-slate-800">
            {searchQuery ? 'No matching quotations found' : 'No transporter quotations received yet'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Try refining your search keywords or clear filters.'
              : 'When verified transporters submit bids for your published freight consignments, they will appear here with live validity timers.'}
          </p>
        </div>
      ) : (
        /* 5. Bids Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBids.map((b) => {
            const isVerified = b.transporterVerificationStatus === 'VERIFIED';

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl bg-white border shadow-xs space-y-3.5 transition-all flex flex-col justify-between ${
                  b.isAccepted
                    ? 'border-emerald-500 bg-emerald-50/15 ring-1 ring-emerald-500/20'
                    : b.isExpired
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : b.isRejected
                    ? 'border-rose-200 bg-rose-50/10 opacity-75'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Transporter & Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 tracking-tight">
                          {b.transporterName}
                        </span>
                        {isVerified && (
                          <span title="Verified Carrier" className="text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {b.loadTitle}
                      </div>
                      <div className="text-[10px] text-sky-700 font-bold mt-0.5">
                        {b.route}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900">
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
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.isAccepted
                          ? 'ACCEPTED'
                          : b.isExpired
                          ? 'EXPIRED'
                          : b.isRejected
                          ? 'DECLINED'
                          : 'PENDING QUOTE'}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Contact Bar */}
                  <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{b.transporterPhone}</span>
                    </span>
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{b.rating}/5.0</span>
                    </span>
                  </div>

                  {/* Validity Window Countdown Indicator */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Quotation Validity:</span>
                      </span>
                      {b.isAccepted ? (
                        <span className="text-emerald-700 font-black text-[10px]">
                          Locked & Accepted
                        </span>
                      ) : b.isExpired ? (
                        <span className="text-rose-600 font-black text-[10px] flex items-center gap-1">
                          <Hourglass className="w-3 h-3" />
                          <span>Validity Window Elapsed</span>
                        </span>
                      ) : (
                        <span className="text-sky-700 font-black text-[10px] flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-sky-600 animate-spin" />
                          <span>
                            {b.remainingHours > 0
                              ? `${b.remainingHours}h ${b.remainingMins}m remaining`
                              : `${b.remainingMins}m remaining`}
                          </span>
                        </span>
                      )}
                    </div>
                    {b.expiresAt && (
                      <div className="text-[9.5px] text-slate-400">
                        Valid Until: {new Date(b.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Transporter Notes */}
                  {b.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                {/* Actions & Status Footers */}
                <div className="pt-2">
                  {b.isPending && !b.isExpired && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAcceptBid(b)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Bid</span>
                      </button>
                      <button
                        onClick={() => onRejectBid(b.id)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {b.isPending && b.isExpired && (
                    <div className="space-y-1.5">
                      <button
                        disabled
                        title="Quotation has expired. Shippers must accept or decline bids within the active validity window."
                        className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expired • Cannot Accept</span>
                      </button>
                      <div className="text-[10px] text-rose-600 font-bold text-center">
                        Quotation validity window has elapsed. Transporter must refresh quote.
                      </div>
                    </div>
                  )}

                  {b.isAccepted && (
                    <div className="w-full py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black text-center flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Accepted • Transporter Assigned</span>
                    </div>
                  )}

                  {b.isRejected && (
                    <div className="w-full py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold text-center border border-rose-200">
                      Quotation Declined
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
