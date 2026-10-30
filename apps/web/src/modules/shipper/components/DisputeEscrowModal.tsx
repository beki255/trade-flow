import React, { useState } from 'react';
import { Scale, Send, X, Camera, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

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
  const { language } = useLanguage();
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
              <h3 className="text-base font-black text-slate-900">
                {language === 'AM' ? 'የክፍያ ቅሬታ ማመልከቻ መመዝገቢያ' : language === 'OM' ? 'Tikeettii Mormii Kaffaltii Galmeessi' : 'File Payment Dispute Ticket'}
              </h3>
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
              {language === 'AM' ? 'የቅሬታው ዓይነት እና ዝርዝር ማብራሪያ *' : language === 'OM' ? 'Gosa Mormii fi Ibsa Rakkoo *' : 'Dispute Category & Issue Description *'}
            </label>
            <textarea
              rows={3}
              required
              placeholder={
                language === 'AM'
                  ? 'የጭነት ጉዳት፣ የጎደለ እቃ፣ ያልተፈቀደ የጉዞ መዘግየት ወይም የዋጋ ልዩነትን በዝርዝር ይግለጹ...'
                  : language === 'OM'
                  ? 'Miidhaa fe\'isaa, qabeenya dhabame, tureetii imalaa hin heyyamamne ykn garaagarummaa gatii ibsaa...'
                  : 'Detail cargo damage, missing parcels, unapproved transit delays, or rate discrepancies...'
              }
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'AM' ? 'የሚጠየቀው የካሳ መጠን (ብር) *' : language === 'OM' ? 'Hanga Beenyaa Gaafatamu (ETB) *' : 'Claimed Compensation Amount (ETB) *'}
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
                {language === 'AM' ? 'የሚፈለገው የውሳኔ ዓይነት' : language === 'OM' ? 'Furmaata Mormii Barbaadame' : 'Requested Settlement Resolution'}
              </label>
              <select
                value={requestedResolution}
                onChange={(e) => setRequestedResolution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 outline-none"
              >
                <option value="Escrow Adjustment & Partial Refund">
                  {language === 'AM' ? 'የኤስክሮው ማስተካከያ እና ከፊል ተመላሽ' : language === 'OM' ? 'Sirreeffama Iskroow fi Deebii Gamisaa' : 'Escrow Adjustment & Partial Refund'}
                </option>
                <option value="Full Escrow Refund (Severe Damage / Non-Delivery)">
                  {language === 'AM' ? 'ሙሉ የገንዘብ ተመላሽ (ከባድ ጉዳት / ላልደረሰ ጭነት)' : language === 'OM' ? 'Deebii Guutuu (Miidhaa Cimaa / Kan Hin Geenyee)' : 'Full Escrow Refund'}
                </option>
                <option value="Late Delivery Penalty Deduction">
                  {language === 'AM' ? 'የዘገየበት የቅጣት ቅናሽ' : language === 'OM' ? 'Adabbii Turuu Hir\'isuu' : 'Late Delivery Penalty Deduction'}
                </option>
                <option value="Administrative Mediation Hearing">
                  {language === 'AM' ? 'የአስተዳዳሪ የሽምግልና ችሎት' : language === 'OM' ? 'Dhaddacha Araaraa Bulchaa' : 'Administrative Mediation Hearing'}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {language === 'AM' ? 'የፎቶ ማስረጃ / የፍተሻ ሰርተፊኬት ማስፈንጠሪያ (አማራጭ)' : language === 'OM' ? 'Ragaa Suuraa / Liinkii Waraqaa Sakatta\'aa (Filannoo)' : 'Photo Evidence / Inspection Certificate Link (Optional)'}
              </span>
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
              <strong>{language === 'AM' ? 'የኤስክሮው ጥበቃ ሥርዓት፦' : language === 'OM' ? 'Sirna Eegumsa Iskroow:' : 'Escrow Protection Protocol:'}</strong>{' '}
              {language === 'AM'
                ? 'ቅሬታው እንደገባ የኤስክሮው ገንዘቡ ወዲያውኑ በስማርት ኮንትራክቱ ውስጥ ይታገዳል፤ እንዲሁም በፕላትፎርሙ አስተዳዳሪ የሽምግልና ሰሌዳ እንዲታይ ይላካል።'
                : language === 'OM'
                ? 'Akkuma galfameen maallaqni iskroow hatattamaan hidhama, gamaaggama araaraaf gara Boordii Bulchaa Pilaatfoormiitti ergama.'
                : 'Upon submission, escrow funds are immediately frozen in smart contract vault and routed to the Platform Administrator Console for mediation review.'}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
            >
              {language === 'AM' ? 'ይቅር' : language === 'OM' ? 'Haqi' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? (language === 'AM' ? 'በማስገባት ላይ...' : language === 'OM' ? 'Galchaa jira...' : 'Submitting...')
                  : (language === 'AM' ? 'የቅሬታ ቲኬት መዝግብ' : language === 'OM' ? 'Tikeettii Mormii Galmeessi' : 'Register Dispute Ticket')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
