import React from 'react';
import { CheckCircle, Smartphone, ShieldCheck } from 'lucide-react';
import { AIMatchCarrier } from '../types';

interface TelebirrEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch: AIMatchCarrier | null;
  paymentSuccess: boolean;
  telebirrPhone: string;
  setTelebirrPhone: (val: string) => void;
  onPay: () => void;
}

export const TelebirrEscrowModal: React.FC<TelebirrEscrowModalProps> = ({
  isOpen,
  onClose,
  selectedMatch,
  paymentSuccess,
  telebirrPhone,
  setTelebirrPhone,
  onPay,
}) => {
  if (!isOpen) return null;

  const grossAmount = selectedMatch?.calculatedSpotRateEtb || 178000;
  const commission = grossAmount * 0.05;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-700 text-white font-bold text-xs flex items-center justify-center">
              TB
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">TeleBirr Smart Escrow Lock</h3>
              <p className="text-[10px] text-slate-400">Funds locked securely until GPS delivery proof</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-emerald-950">
              Escrow Payment Locked Successfully
            </div>
            <p className="text-xs text-emerald-800">
              Transporter assigned: {selectedMatch?.companyName || 'Red Sea Freight Logistics'}. Funds will release upon digital POD completion.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Freight Amount:</span>
                <span className="font-bold text-slate-900">
                  {grossAmount.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Commission (5%):</span>
                <span className="font-bold text-slate-900">
                  {commission.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                <span className="text-slate-900">Total Escrow Deposit:</span>
                <span className="text-sky-700">
                  {grossAmount.toLocaleString()} ETB
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                TeleBirr Wallet Mobile Number
              </label>
              <input
                type="text"
                value={telebirrPhone}
                onChange={(e) => setTelebirrPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 flex items-start gap-2 text-[11px] text-sky-900">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                Ethio Telecom TeleBirr API will send an OTP USSD prompt to your mobile phone to authorize the escrow lock.
              </span>
            </div>

            <button
              onClick={onPay}
              className="w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Authorize & Lock TeleBirr Escrow</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
