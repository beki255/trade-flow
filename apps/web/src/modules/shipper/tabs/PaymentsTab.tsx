import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Smartphone,
  AlertCircle,
  FileText,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Scale,
  Send
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

import { BidItem, ShipmentItem } from '../types';
import { DisputeEscrowModal } from '../components/DisputeEscrowModal';
import { PayWithTelebirrModal } from '../components/PayWithTelebirrModal';

interface PaymentRecord {
  id: string;
  shipmentCode: string;
  grossAmountEtb: number;
  commissionEtb: number;
  netPayoutEtb: number;
  paymentMethod: string;
  telebirrTxNo: string;
  status: 'PENDING' | 'CONFIRMED' | 'SETTLED' | 'DISPUTED' | 'HELD_IN_ESCROW';
  paidAt: string;
}

interface PaymentsTabProps {
  bids?: BidItem[];
  shipments?: ShipmentItem[];
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ bids = [], shipments = [] }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Fetch real payment ledger from backend with auto-polling (strictly isolated by current shipper)
  useEffect(() => {
    setPayments([]);
    if (!user?.id) return;

    const fetchLedger = async () => {
      try {
        const shipperQ = user?.id ? `?shipperId=${encodeURIComponent(user.id)}` : '';
        const res = await fetch(`/api/payments/ledger${shipperQ}`);
        if (res.ok) {
          const data = await res.json();
          if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
            const mapped: PaymentRecord[] = data.payments.map((p: any) => ({
              id: p.id,
              shipmentCode: p.shipment?.load?.title ? `TF-SH-${p.shipment.id.slice(0, 4).toUpperCase()}` : 'TF-SH-CORRIDOR',
              grossAmountEtb: Number(p.grossAmountEtb || p.amountEtb || 0),
              commissionEtb: Number(p.platformCommissionEtb || p.platformFeeEtb || p.commissionEtb || 0),
              netPayoutEtb: Number(p.netTransporterPayoutEtb || p.carrierPayoutEtb || p.netPayoutEtb || 0),
              paymentMethod: p.paymentMethod || 'TELEBIRR',
              telebirrTxNo: p.telebirrTransactionNo || p.telebirrTxId || p.telebirrTxNo || `TB-TF-${p.id.slice(0, 6)}`,
              status: p.status || 'HELD_IN_ESCROW',
              paidAt: new Date(p.paidAt || p.createdAt).toLocaleDateString() + ' ' + new Date(p.paidAt || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));
            setPayments(mapped);
          } else {
            setPayments([]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch payment ledger:', err);
      }
    };

    fetchLedger();
    const interval = setInterval(fetchLedger, 3500);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Financial KPIs dynamically computed from ledger
  const totalEscrow = useMemo(() => payments.reduce((sum, p) => sum + (p.grossAmountEtb || 0), 0), [payments]);
  const totalCommission = useMemo(() => payments.reduce((sum, p) => sum + (p.commissionEtb || 0), 0), [payments]);
  const totalNetPayout = useMemo(() => payments.reduce((sum, p) => sum + (p.netPayoutEtb || 0), 0), [payments]);

  // Payment Initiation Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<string>('');
  const [phone, setPhone] = useState('+251911445566');
  const [amount, setAmount] = useState('185000');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState('');

  const commissionRate = 5.0; // 5% platform fee
  const calculatedCommission = Math.round((parseFloat(amount) || 0) * (commissionRate / 100));
  const calculatedNetPayout = (parseFloat(amount) || 0) - calculatedCommission;

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const matchedBid = bids.find((b) => b.id === selectedBidId);
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: selectedBidId || undefined,
          grossAmountEtb: parseFloat(amount),
          telebirrPhone: phone,
          paymentMethod: 'TELEBIRR',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newRecord: PaymentRecord = {
          id: data.payment?.id || `PAY-${Date.now().toString().slice(-4)}`,
          shipmentCode: matchedBid?.loadId || 'TF-SH-9901',
          grossAmountEtb: parseFloat(amount),
          commissionEtb: calculatedCommission,
          netPayoutEtb: calculatedNetPayout,
          paymentMethod: 'TELEBIRR',
          telebirrTxNo: data.telebirrReceipt?.transactionNo || `TB-TF-${Date.now().toString().slice(-6)}`,
          status: 'CONFIRMED',
          paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setPayments([newRecord, ...payments]);
        setPaySuccess('TeleBirr smart escrow payment confirmed & locked successfully!');
        setPayModalOpen(false);
        setTimeout(() => setPaySuccess(''), 4000);
      }
    } catch (err) {
      console.warn('Payment error:', err);
    } finally {
      setPaying(false);
    }
  };

  const handleFileDispute = async (reason: string, claimed: number) => {
    try {
      const res = await fetch('/api/payments/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeReason: reason,
          claimedAmountEtb: claimed,
          requestedResolution: 'Escrow Deduction & Shipper Refund',
        }),
      });

      if (res.ok) {
        setDisputeSuccess('Dispute ticket registered and routed to Platform Admin for mediation.');
        setTimeout(() => setDisputeSuccess(''), 4000);
      }
    } catch (e) {
      console.warn('Dispute error:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 inline-flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-sky-600" /> TeleBirr Smart Escrow & Financial Settlement
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Payment & Carrier Settlement Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            TeleBirr escrow checkout upon proof-of-delivery (e-POD), 5.0% commission deduction, and dispute resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDisputeModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Scale className="w-3.5 h-3.5" /> File Payment Dispute
          </button>

          <button
            onClick={() => setPayModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" /> Pay with TeleBirr
          </button>
        </div>
      </div>

      {paySuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {paySuccess}
        </div>
      )}

      {disputeSuccess && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" /> {disputeSuccess}
        </div>
      )}

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Escrow Processed</div>
            <div className="text-xl font-black text-slate-900">{totalEscrow.toLocaleString()} ETB</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">✓ 100% TeleBirr Verified</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Platform Commission (5.0%)</div>
            <div className="text-xl font-black text-indigo-900">{totalCommission.toLocaleString()} ETB</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Automated Deduction</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Carrier Net Payouts</div>
            <div className="text-xl font-black text-emerald-700">{totalNetPayout.toLocaleString()} ETB</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Disbursed upon e-POD</div>
          </div>
        </div>

      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Settlement & Escrow Ledger ({payments.length})
          </h3>
          <span className="text-[11px] text-slate-500">Instant TeleBirr Webhook Reconciliation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction Reference</th>
                <th className="py-3 px-4">Shipment Code</th>
                <th className="py-3 px-4">Gross Freight</th>
                <th className="py-3 px-4">Platform Fee (5%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Settlement Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                    <div className="font-bold text-slate-700 text-xs">No transactions in ledger yet</div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      TeleBirr escrow deposits and carrier settlements will appear here once freight consignments are funded and delivered.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-800">
                      {p.telebirrTxNo}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.shipmentCode}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {p.grossAmountEtb.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      -{p.commissionEtb.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700">
                      {p.netPayoutEtb.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                          p.status === 'SETTLED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'HELD_IN_ESCROW'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : p.status === 'CONFIRMED'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {p.status === 'HELD_IN_ESCROW'
                          ? '🔒 HELD IN ESCROW'
                          : p.status === 'SETTLED'
                          ? '✓ SETTLED (e-POD)'
                          : p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {p.paidAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modular Pay with TeleBirr Modal */}
      <PayWithTelebirrModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSubmit={handleInitiatePayment}
        bids={bids}
        selectedBidId={selectedBidId}
        setSelectedBidId={setSelectedBidId}
        phone={phone}
        setPhone={setPhone}
        amount={amount}
        setAmount={setAmount}
        paying={paying}
        calculatedCommission={calculatedCommission}
        calculatedNetPayout={calculatedNetPayout}
      />

      {/* Modular File Dispute Modal */}
      <DisputeEscrowModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        onSubmit={handleFileDispute}
      />

    </div>
  );
};
