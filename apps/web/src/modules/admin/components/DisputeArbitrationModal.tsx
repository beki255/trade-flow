import React, { useState } from 'react';
import { Scale, ShieldCheck, Truck, X } from 'lucide-react';
import { DisputeTicketItem } from '../types';

interface DisputeArbitrationModalProps {
  activeTicket: DisputeTicketItem | null;
  onClose: () => void;
  onConfirm: (
    paymentId: string,
    verdict: 'REFUND_SHIPPER' | 'RELEASE_TRANSPORTER' | 'PARTIAL_SPLIT',
    refundAmountEtb: number,
    transporterPayoutEtb: number,
    adminNotes: string
  ) => Promise<void>;
}

export const DisputeArbitrationModal: React.FC<DisputeArbitrationModalProps> = ({
  activeTicket,
  onClose,
  onConfirm,
}) => {
  const [verdict, setVerdict] = useState<'REFUND_SHIPPER' | 'RELEASE_TRANSPORTER' | 'PARTIAL_SPLIT'>('PARTIAL_SPLIT');
  const [customRefundAmount, setCustomRefundAmount] = useState<string>('20000');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!activeTicket) return null;

  const handleExecute = async () => {
    setSubmitting(true);
    try {
      const gross = activeTicket.grossAmountEtb;
      const commission = activeTicket.platformCommissionEtb;
      let refund = 0;
      let payout = 0;

      if (verdict === 'REFUND_SHIPPER') {
        refund = gross;
        payout = 0;
      } else if (verdict === 'RELEASE_TRANSPORTER') {
        refund = 0;
        payout = Math.max(0, gross - commission);
      } else {
        refund = parseFloat(customRefundAmount) || 0;
        payout = Math.max(0, gross - refund - commission);
      }

      await onConfirm(
        activeTicket.paymentId,
        verdict,
        refund,
        payout,
        adminNotes || 'Arbitration settled by administrator'
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {activeTicket.ticketNumber}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {activeTicket.title}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Smart Escrow Arbitration Verdict
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Escrow Financial Balance Overview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Escrow Funds</div>
            <div className="font-black text-slate-900 font-mono mt-0.5">
              {Number(activeTicket.grossAmountEtb).toLocaleString()} ETB
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Platform Fee (5%)</div>
            <div className="font-bold text-slate-700 font-mono mt-0.5">
              {Number(activeTicket.platformCommissionEtb).toLocaleString()} ETB
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-500">Shipper Claimed</div>
            <div className="font-black text-rose-600 font-mono mt-0.5">
              {Number(activeTicket.claimedAmountEtb).toLocaleString()} ETB
            </div>
          </div>
        </div>

        {/* 3 Verdict Radio Selections */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
            Select Administrative Verdict:
          </label>

          {/* Option 1: Compromise Split */}
          <div
            onClick={() => setVerdict('PARTIAL_SPLIT')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              verdict === 'PARTIAL_SPLIT'
                ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Compromise Split Settlement</span>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Deduct agreed penalty from escrow to refund the shipper, and release the remaining balance to the carrier.
            </p>

            {verdict === 'PARTIAL_SPLIT' && (
              <div className="pt-2 border-t border-amber-200/60 flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">
                    Refund Amount to Shipper (ETB):
                  </label>
                  <input
                    type="number"
                    value={customRefundAmount}
                    onChange={(e) => setCustomRefundAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">
                    Net Transporter Payout (ETB):
                  </label>
                  <div className="mt-1 px-3 py-1.5 text-xs font-mono font-black text-emerald-700 rounded-lg bg-white border border-slate-200">
                    {Math.max(
                      0,
                      activeTicket.grossAmountEtb -
                        (parseFloat(customRefundAmount) || 0) -
                        activeTicket.platformCommissionEtb
                    ).toLocaleString()}{' '}
                    ETB
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Full Refund to Shipper */}
          <div
            onClick={() => setVerdict('REFUND_SHIPPER')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
              verdict === 'REFUND_SHIPPER'
                ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>100% Full Refund to Shipper</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Total escrow funds returned to Shipper digital mobile wallet. Transporter receives 0 ETB.
            </p>
          </div>

          {/* Option 3: Release to Carrier */}
          <div
            onClick={() => setVerdict('RELEASE_TRANSPORTER')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
              verdict === 'RELEASE_TRANSPORTER'
                ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Dismiss Claim & Disburse 100% to Transporter</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Shipper claim dismissed. Full net payout ({Number(activeTicket.netTransporterPayoutEtb).toLocaleString()} ETB) disbursed to Carrier.
            </p>
          </div>
        </div>

        {/* Legal Rationale Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Official Mediation Rationale / Verdict Notes *</label>
          <textarea
            rows={2}
            placeholder="Detail reason for decision (e.g. Verified packaging defect on photo upload; compromise 15% penalty approved)..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Confirmation Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleExecute}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>{submitting ? 'Executing...' : 'Confirm Binding Verdict & Disburse'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
