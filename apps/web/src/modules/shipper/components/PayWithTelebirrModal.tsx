import React, { useState } from 'react';
import { Smartphone, CreditCard, ShieldCheck, DollarSign, Calculator, FileCheck, Building } from 'lucide-react';
import { BidItem } from '../types';

interface PayWithTelebirrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    paymentMethod: 'TELEBIRR' | 'CBE_BIRR';
    phone: string;
    accountNo?: string;
    baseRateEtb: number;
    accessorialChargesEtb: number;
    penaltiesEtb: number;
    totalAmountEtb: number;
    selectedBidId?: string;
  }) => Promise<void>;
  bids: BidItem[];
  selectedBidId: string;
  setSelectedBidId: (id: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  paying: boolean;
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
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR'>('TELEBIRR');
  const [cbeAccountNo, setCbeAccountNo] = useState('1000289384729');
  const [accessorialCharges, setAccessorialCharges] = useState('0');
  const [penalties, setPenalties] = useState('0');

  if (!isOpen) return null;

  const baseRate = parseFloat(amount) || 0;
  const accessorials = parseFloat(accessorialCharges) || 0;
  const penaltyDeduction = parseFloat(penalties) || 0;
  const totalGrossAmount = Math.max(0, baseRate + accessorials - penaltyDeduction);

  const platformFee = Math.round(totalGrossAmount * 0.05); // 5% platform fee
  const withholdingTax = Math.round(totalGrossAmount * 0.02); // 2% Ethiopian transport withholding
  const netCarrierPayout = Math.max(0, totalGrossAmount - platformFee - withholdingTax);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      paymentMethod,
      phone,
      accountNo: paymentMethod === 'CBE_BIRR' ? cbeAccountNo : undefined,
      baseRateEtb: baseRate,
      accessorialChargesEtb: accessorials,
      penaltiesEtb: penaltyDeduction,
      totalAmountEtb: totalGrossAmount,
      selectedBidId: selectedBidId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full my-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
              {paymentMethod === 'CBE_BIRR' ? <Building className="w-4 h-4 text-purple-700" /> : <Smartphone className="w-4 h-4 text-sky-600" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {paymentMethod === 'CBE_BIRR' ? 'CBE Birr Escrow Checkout' : 'TeleBirr Smart Escrow Checkout'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Cryptographically locked upon agreement, disbursed upon verified e-POD handover.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          {/* Payment Method Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Supported Settlement Method</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('TELEBIRR')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'TELEBIRR'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                <span>TeleBirr</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CBE_BIRR')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === 'CBE_BIRR'
                    ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-purple-600" />
                <span>CBE Birr</span>
              </button>
            </div>
          </div>

          {/* Select Agreed Bid / Consignment Dropdown */}
          {bids.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Linked Consignment / Agreed Carrier Bid
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none bg-white text-xs cursor-pointer"
              >
                <option value="">-- Custom / Direct Consignment --</option>
                {bids.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.loadTitle} • {b.transporterName} ({b.bidAmount.toLocaleString()} ETB)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account / Phone Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {paymentMethod === 'CBE_BIRR' ? 'CBE Account / Mobile Number *' : 'TeleBirr Wallet Phone *'}
              </label>
              <input
                type="tel"
                required
                placeholder="+251 91 144 5566"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Agreed Base Freight Rate (ETB) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Accessorial Charges & Penalties Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Approved Accessorial Charges (ETB)
              </label>
              <input
                type="number"
                placeholder="0 (e.g. Demurrage, Handling)"
                value={accessorialCharges}
                onChange={(e) => setAccessorialCharges(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Penalties / Deductions (ETB)
              </label>
              <input
                type="number"
                placeholder="0 (e.g. Late Arrival Penalty)"
                value={penalties}
                onChange={(e) => setPenalties(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Comprehensive Settlement Formula Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Agreed Base Rate:</span>
              <span>{baseRate.toLocaleString()} ETB</span>
            </div>

            {accessorials > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>+ Approved Accessorials:</span>
                <span>+{accessorials.toLocaleString()} ETB</span>
              </div>
            )}

            {penaltyDeduction > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>- Penalties / Cargo Deductions:</span>
                <span>-{penaltyDeduction.toLocaleString()} ETB</span>
              </div>
            )}

            <div className="flex justify-between font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Gross Escrow Locked:</span>
              <span className="text-sm font-black">{totalGrossAmount.toLocaleString()} ETB</span>
            </div>

            <div className="flex justify-between text-rose-600 font-medium">
              <span>- Platform Commission (5.0%):</span>
              <span>-{platformFee.toLocaleString()} ETB</span>
            </div>

            <div className="flex justify-between text-amber-700 font-medium">
              <span>- Withholding Tax (2.0%):</span>
              <span>-{withholdingTax.toLocaleString()} ETB</span>
            </div>

            <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-emerald-800 text-sm">
              <span>Transporter Net Payout (at e-POD):</span>
              <span className="text-base">{netCarrierPayout.toLocaleString()} ETB</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-[11px] text-sky-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Instant webhook reconciliation automatically updates the ledger upon payment confirmation.</span>
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
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" /> {paying ? 'Locking Escrow...' : 'Authorize Escrow Checkout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
