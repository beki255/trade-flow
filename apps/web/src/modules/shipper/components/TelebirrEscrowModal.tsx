import React, { useState } from 'react';
import {
  CheckCircle,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Wallet,
  Building,
  Check,
} from 'lucide-react';
import { AIMatchCarrier, BidItem } from '../types';

interface TelebirrEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatch?: AIMatchCarrier | null;
  selectedBid?: BidItem | null;
  paymentSuccess: boolean;
  isProcessing?: boolean;
  error?: string | null;
  telebirrPhone: string;
  setTelebirrPhone: (val: string) => void;
  onPay: (details: { phone: string; paymentMethod: string; amount: number }) => void;
  txReceipt?: { transactionNo: string; amount: number } | null;
}

export const TelebirrEscrowModal: React.FC<TelebirrEscrowModalProps> = ({
  isOpen,
  onClose,
  selectedMatch,
  selectedBid,
  paymentSuccess,
  isProcessing = false,
  error = null,
  telebirrPhone,
  setTelebirrPhone,
  onPay,
  txReceipt,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'AWASH_BIRR'>('TELEBIRR');

  if (!isOpen) return null;

  const grossAmount =
    selectedBid?.bidAmount ??
    selectedMatch?.calculatedSpotRateEtb ??
    185000;

  const commissionRatePct = 5.0;
  const platformFee = Math.round(grossAmount * (commissionRatePct / 100));
  const netTransporterPayout = grossAmount - platformFee;

  const transporterName =
    selectedBid?.transporterName ||
    selectedMatch?.companyName ||
    'Assigned Corridor Transporter';

  const routeName =
    selectedBid?.route ||
    'Addis Ababa ➔ Djibouti Port Corridor';

  const loadName =
    selectedBid?.loadTitle ||
    'Heavy Freight Consignment';

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    onPay({
      phone: telebirrPhone,
      paymentMethod: selectedMethod,
      amount: grossAmount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden">
        
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-sky-800 text-white font-black text-sm flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              TB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  TeleBirr Smart Escrow Lock
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                  Secure
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500">
                Ethio Telecom digital escrow backed by Ethiopian National Logistics SLA
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center text-xs font-bold transition-colors shrink-0 ml-2"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
          {/* Success View */}
        {paymentSuccess ? (
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-black text-emerald-950">
                Escrow Funds Successfully Locked!
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Receipt reference: <span className="font-mono font-bold text-emerald-900">{txReceipt?.transactionNo || 'TB-TF-CONFIRMED'}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-emerald-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Assigned Transporter:</span>
                <span className="font-bold text-slate-900">{transporterName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Locked Escrow Deposit:</span>
                <span className="font-black text-slate-900">{grossAmount.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Net Payout to Carrier:</span>
                <span className="font-black text-emerald-700">{netTransporterPayout.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                <span className="text-slate-500 font-medium">Escrow Release Condition:</span>
                <span className="text-[11px] font-bold text-sky-800">
                  Recipient GPS e-POD Signature
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700 italic">
              Transporter notified immediately to commence dispatch and corridor loading.
            </p>
          </div>
        ) : (
          /* Payment Form View */
          <form onSubmit={handleAuthorize} className="space-y-4">
            
            {/* Cargo & Carrier Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Consignment & Carrier</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{loadName}</div>
                <div className="text-[11px] text-sky-700 font-semibold">{routeName}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-[10px] font-bold uppercase text-slate-400">Transporter</div>
                <div className="text-xs font-bold text-slate-800">{transporterName}</div>
                <div className="text-[10px] font-semibold text-emerald-600">★ Verified Fleet</div>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center text-slate-300">
                <span>Agreed Gross Freight Rate:</span>
                <span className="font-bold text-white font-mono">{grossAmount.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Platform Escrow & SLA Fee (5.0%):</span>
                <span className="font-mono text-amber-400">-{platformFee.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400 text-[11.5px]">
                <span>Transporter Disbursement upon e-POD:</span>
                <span className="font-bold font-mono">{netTransporterPayout.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800 text-sm font-black">
                <span className="text-slate-100 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  Total Escrow Lock:
                </span>
                <span className="text-sky-400 font-mono text-base">{grossAmount.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Mobile Wallet Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Select Mobile Money Wallet
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('TELEBIRR')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedMethod === 'TELEBIRR'
                      ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-700">TeleBirr</span>
                    {selectedMethod === 'TELEBIRR' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Ethio Telecom</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('CBE_BIRR')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedMethod === 'CBE_BIRR'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700">CBE Birr</span>
                    {selectedMethod === 'CBE_BIRR' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Commercial Bank</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('AWASH_BIRR')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedMethod === 'AWASH_BIRR'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700">Awash Birr</span>
                    {selectedMethod === 'AWASH_BIRR' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Awash Bank</div>
                </button>
              </div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payer Mobile Number (Registered Wallet)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={telebirrPhone}
                  onChange={(e) => setTelebirrPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 outline-none text-xs font-mono font-bold text-slate-900 bg-white disabled:bg-slate-100 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">
                  ET
                </span>
              </div>
            </div>

            {/* Escrow Guarantee Disclaimer */}
            <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-start gap-2.5 text-[11px] text-sky-900">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong className="font-bold">Smart Escrow Protection:</strong> Funds remain securely locked in digital escrow and will only be disbursed to the transporter when the recipient confirms delivery via digital signature (e-POD).
              </p>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-700/25 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Contacting TeleBirr Gateway & Locking Escrow...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Lock {grossAmount.toLocaleString()} ETB in Escrow</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};
