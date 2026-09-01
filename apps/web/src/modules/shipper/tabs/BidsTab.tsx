import React from 'react';
import { Gavel, CreditCard, CheckCircle } from 'lucide-react';
import { BidItem } from '../types';

interface BidsTabProps {
  bids: BidItem[];
  onAcceptBid: (bid: BidItem) => void;
  onRejectBid: (bidId: string) => void;
}

export const BidsTab: React.FC<BidsTabProps> = ({
  bids,
  onAcceptBid,
  onRejectBid,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Bid Management & Quotes Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Compare incoming transporter quotes, evaluate driver ratings & transit timelines, and lock TeleBirr smart escrow.
          </p>
        </div>
      </div>

      {bids.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <Gavel className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-xs font-bold text-slate-700">
            No transporter bids received yet
          </div>
          <p className="text-[11px] text-slate-500">
            When transporters place quotes for your active loads, they will appear here for review and TeleBirr escrow lock.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bids.map((b) => {
            const isAccepted = b.status === 'ACCEPTED';
            const isRejected = b.status === 'REJECTED';
            const isPending = !isAccepted && !isRejected;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl bg-white border shadow-sm space-y-3 transition-all ${
                  isAccepted
                    ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/20'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/10 opacity-75'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{b.transporterName}</div>
                    <div className="text-[11px] text-slate-500">{b.loadTitle} ({b.loadId})</div>
                    <div className="text-[10px] text-sky-700 font-semibold">{b.route}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-sky-700">
                      {b.bidAmount.toLocaleString()} ETB
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>Tel: {b.transporterPhone}</span>
                  <span className="text-emerald-600 font-bold">Rating: {b.rating}/5.0</span>
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  Validity: {b.estimatedHours}
                </div>

                <p className="text-[10.5px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{b.notes}"
                </p>

                {isPending && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onAcceptBid(b)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Accept & Lock Escrow</span>
                    </button>
                    <button
                      onClick={() => onRejectBid(b.id)}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all border border-slate-200"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {isAccepted && (
                  <div className="w-full py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Accepted • TeleBirr Escrow Funded</span>
                  </div>
                )}

                {isRejected && (
                  <div className="w-full py-2 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold text-center">
                    Quote Declined
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
