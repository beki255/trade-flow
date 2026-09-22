import React, { useState } from 'react';
import { Scale, Send, X } from 'lucide-react';

interface DisputeEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, claimedAmount: number) => Promise<void>;
  paymentRef?: string;
  defaultAmount?: number;
}

export const DisputeEscrowModal: React.FC<DisputeEscrowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  paymentRef,
  defaultAmount = 25000,
}) => {
  const [disputeReason, setDisputeReason] = useState('');
  const [claimedAmount, setClaimedAmount] = useState(String(defaultAmount));
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(disputeReason, parseFloat(claimedAmount) || 0);
      setDisputeReason('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full my-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">File Payment Dispute Ticket</h3>
              {paymentRef && (
                <span className="text-[11px] font-mono text-slate-400">Ref: {paymentRef}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dispute Reason / Cargo Damage Details *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide evidence of defect, route delay, or missing parcels..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Claimed Compensation Amount (ETB) *
            </label>
            <input
              type="number"
              required
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            Escrow funds will remain locked in TradeFlow vault while a Platform Administrator conducts evidence mediation with both parties.
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
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit to Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
