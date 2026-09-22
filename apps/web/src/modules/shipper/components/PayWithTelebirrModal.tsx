import React from 'react';
import { Smartphone } from 'lucide-react';
import { BidItem } from '../types';

interface PayWithTelebirrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  bids: BidItem[];
  selectedBidId: string;
  setSelectedBidId: (id: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  paying: boolean;
  calculatedCommission: number;
  calculatedNetPayout: number;
}

export const PayWithTelebirrModal: React.FC<PayWithTelebirrModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bids,
  selectedBidId,
  setSelectedBidId,
  phone,
  setPhone,
  amount,
  setAmount,
  paying,
  calculatedCommission,
  calculatedNetPayout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full my-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-black text-slate-900">TeleBirr Smart Escrow Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          {/* Select Agreed Bid / Consignment Dropdown */}
          {bids.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Agreed Bid / Consignment
              </label>
              <select
                value={selectedBidId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setSelectedBidId(bId);
                  const matched = bids.find((b) => b.id === bId);
                  if (matched) {
                    setAmount(String(matched.bidAmount));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none bg-white text-xs cursor-pointer"
              >
                <option value="">-- Custom / Direct Amount --</option>
                {bids.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.loadTitle} • {b.transporterName} ({b.bidAmount.toLocaleString()} ETB)
                  </option>
                ))}
              </select>

              {selectedBidId && (() => {
                const matched = bids.find((b) => b.id === selectedBidId);
                if (!matched) return null;
                return (
                  <div className="mt-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] space-y-0.5">
                    <div className="font-extrabold text-sky-950 flex items-center gap-1">
                      <span>✓ Agreed Bid Rate:</span>
                      <span className="font-mono text-emerald-700">{matched.bidAmount.toLocaleString()} ETB</span>
                    </div>
                    <div className="text-slate-600 font-medium">
                      Carrier: <span className="font-bold text-slate-800">{matched.transporterName}</span> • Route: {matched.route}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">TeleBirr Mobile Number *</label>
            <input
              type="tel"
              required
              placeholder="+251 91 144 5566"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Gross Freight Amount (ETB) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none"
            />
          </div>

          {/* Commission Calculation Breakdown Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Gross Escrow Deposit:</span>
              <span className="font-bold text-slate-900">{parseFloat(amount || '0').toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between font-medium text-rose-600">
              <span>Platform Commission (5.0%):</span>
              <span className="font-bold">-{calculatedCommission.toLocaleString()} ETB</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-emerald-800 text-sm">
              <span>Net Transporter Payout:</span>
              <span>{calculatedNetPayout.toLocaleString()} ETB</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4" /> {paying ? 'Processing...' : 'Confirm Escrow Lock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
