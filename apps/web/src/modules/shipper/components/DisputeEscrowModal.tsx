import React, { useState } from 'react';
import { Scale, Send, X, Camera, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisputeEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    reason: string,
    claimedAmount: number,
    photoUrl?: string,
    requestedResolution?: string
  ) => Promise<void>;
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
  const [photoUrl, setPhotoUrl] = useState('');
  const [requestedResolution, setRequestedResolution] = useState('Escrow Adjustment & Partial Refund');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(
        disputeReason,
        parseFloat(claimedAmount) || 0,
        photoUrl.trim() || undefined,
        requestedResolution
      );
      setDisputeReason('');
      setPhotoUrl('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
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
              Dispute Category & Issue Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detail cargo damage, missing parcels, unapproved transit delays, or rate discrepancies..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Requested Settlement Resolution
              </label>
              <select
                value={requestedResolution}
                onChange={(e) => setRequestedResolution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 outline-none"
              >
                <option value="Escrow Adjustment & Partial Refund">Escrow Adjustment & Partial Refund</option>
                <option value="Full Escrow Refund (Severe Damage / Non-Delivery)">Full Escrow Refund</option>
                <option value="Late Delivery Penalty Deduction">Late Delivery Penalty Deduction</option>
                <option value="Administrative Mediation Hearing">Administrative Mediation Hearing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>Photo Evidence / Inspection Certificate Link (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://tradeflow.et/evidence/inspection-damage-01.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Escrow Protection Protocol:</strong> Upon submission, escrow funds are immediately frozen in smart contract vault and routed to the <strong>Platform Administrator Console</strong> for mediation review.
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
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Register Dispute Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
