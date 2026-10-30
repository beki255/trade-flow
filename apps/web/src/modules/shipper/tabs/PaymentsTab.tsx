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
  Send,
  Building,
  Filter,
  Check,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Receipt,
  Percent,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { BidItem, ShipmentItem } from '../types';
import { PayWithTelebirrModal } from '../components/PayWithTelebirrModal';
import { DisputeEscrowModal } from '../components/DisputeEscrowModal';

export interface PaymentRecord {
  id: string;
  shipmentId?: string;
  shipmentCode: string;
  routeTitle: string;
  grossAmountEtb: number;
  commissionEtb: number;
  withholdingTaxEtb?: number;
  netPayoutEtb: number;
  paymentMethod: string;
  telebirrTxNo: string;
  status: 'PENDING' | 'CONFIRMED' | 'SETTLED' | 'DISPUTED' | 'HELD_IN_ESCROW';
  paidAt: string;
  settledAt?: string;
  shipmentStatus?: string;
  loadStatus?: string;
  isDelivered: boolean;
}

interface PaymentsTabProps {
  bids?: BidItem[];
  shipments?: ShipmentItem[];
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ bids = [], shipments = [] }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Payment Initiation Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<string>('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState('');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedPaymentForDispute, setSelectedPaymentForDispute] = useState<PaymentRecord | null>(null);

  // Fetch real payment ledger from backend
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const shipperQ = user?.id ? `?shipperId=${encodeURIComponent(user.id)}` : '';
      const res = await fetch(`/api/payments/ledger${shipperQ}`);
      if (res.ok) {
        const data = await res.json();
        if (data.payments && Array.isArray(data.payments)) {
          const mapped: PaymentRecord[] = data.payments.map((p: any) => {
            const gross = Number(p.grossAmountEtb || 0);
            const comm = Number(p.platformCommissionEtb || Math.round(gross * 0.05));
            const withTax = Math.round(gross * 0.02);
            const net = Number(p.netTransporterPayoutEtb || gross - comm - withTax);

            const shipmentStatus = p.shipment?.status;
            const loadStatus = p.shipment?.load?.status;
            const isDelivered = shipmentStatus === 'DELIVERED' || loadStatus === 'DELIVERED';

            return {
              id: p.id,
              shipmentId: p.shipmentId,
              shipmentCode: p.shipment?.load?.title || 'Corridor Consignment',
              routeTitle: p.shipment?.load
                ? `${p.shipment.load.originName} ➔ ${p.shipment.load.destName}`
                : 'Addis Ababa ➔ Djibouti Doraleh Port',
              grossAmountEtb: gross,
              commissionEtb: comm,
              withholdingTaxEtb: withTax,
              netPayoutEtb: net,
              paymentMethod: p.paymentMethod || 'TELEBIRR',
              telebirrTxNo: p.telebirrTransactionNo || `${p.paymentMethod === 'CBE_BIRR' ? 'CBE' : 'TB'}-TF-${p.id.slice(0, 8)}`,
              status: p.status || 'HELD_IN_ESCROW',
              paidAt: new Date(p.paidAt || p.createdAt).toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              settledAt: p.settledAt ? new Date(p.settledAt).toLocaleDateString() : undefined,
              shipmentStatus,
              loadStatus,
              isDelivered,
            };
          });
          setPayments(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch payment ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Financial KPIs dynamically computed from ledger
  const totalEscrow = useMemo(() => payments.reduce((sum, p) => sum + (p.grossAmountEtb || 0), 0), [payments]);
  const totalCommission = useMemo(() => payments.reduce((sum, p) => sum + (p.commissionEtb || 0), 0), [payments]);
  const totalNetPayout = useMemo(() => payments.reduce((sum, p) => sum + (p.netPayoutEtb || 0), 0), [payments]);
  const settledCount = useMemo(() => payments.filter((p) => p.status === 'SETTLED').length, [payments]);

  // Handle Initiate Payment (Multi-Method: TeleBirr / CBE Birr)
  const handleInitiatePayment = async (payload: {
    paymentMethod: 'TELEBIRR' | 'CBE_BIRR';
    phone: string;
    accountNo?: string;
    baseRateEtb: number;
    accessorialChargesEtb: number;
    penaltiesEtb: number;
    totalAmountEtb: number;
    selectedBidId?: string;
  }) => {
    try {
      setPaying(true);
      const matchedBid = bids.find((b) => b.id === payload.selectedBidId);
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId: payload.selectedBidId || undefined,
          loadId: matchedBid?.rawLoadId || undefined,
          grossAmountEtb: payload.totalAmountEtb,
          accessorialChargesEtb: payload.accessorialChargesEtb,
          penaltiesEtb: payload.penaltiesEtb,
          telebirrPhone: payload.phone,
          paymentMethod: payload.paymentMethod,
          shipperId: user?.id,
        }),
      });

      if (res.ok) {
        setPaySuccess('✓ Smart escrow payment authorized and funds securely locked in TradeFlow vault!');
        setPayModalOpen(false);
        await fetchLedger();
        setTimeout(() => setPaySuccess(''), 5000);
      }
    } catch (err) {
      console.warn('Payment error:', err);
    } finally {
      setPaying(false);
    }
  };

  // Handle Escrow Settlement Release (strictly after verified delivery)
  const handleSettlePayment = async (paymentId: string, shipmentId?: string) => {
    const target = payments.find((p) => p.id === paymentId || p.shipmentId === shipmentId);
    if (target && !target.isDelivered) {
      alert(
        '⚠️ Cannot settle escrow payout:\n\nThis consignment has not been delivered by the driver yet. Escrow funds will remain safely held in the TradeFlow vault until the driver reaches destination and uploads verified Proof of Delivery (e-POD).'
      );
      return;
    }

    try {
      const res = await fetch('/api/payments/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          shipmentId,
        }),
      });

      if (res.ok) {
        setPaySuccess('✓ Escrow funds settled & disbursed to carrier mobile wallet upon verified delivery!');
        await fetchLedger();
        setTimeout(() => setPaySuccess(''), 5000);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to settle escrow payout');
      }
    } catch (e) {
      console.warn('Settlement error:', e);
    }
  };

  // Open Dispute Modal for a specific escrow payment
  const handleOpenDispute = (p: PaymentRecord) => {
    setSelectedPaymentForDispute(p);
    setDisputeModalOpen(true);
  };

  // Submit dispute to backend /api/payments/dispute
  const handleSubmitDispute = async (
    reason: string,
    claimedAmount: number,
    photoUrl?: string,
    requestedResolution?: string
  ) => {
    if (!selectedPaymentForDispute) return;
    try {
      const res = await fetch('/api/payments/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPaymentForDispute.id,
          shipmentId: selectedPaymentForDispute.shipmentId,
          disputeReason: reason,
          claimedAmountEtb: claimedAmount,
          requestedResolution: requestedResolution || 'Escrow Adjustment & Partial Refund',
          photoUrl: photoUrl || undefined,
        }),
      });

      if (res.ok) {
        setPaySuccess('✓ Dispute registered! Escrow locked & ticket routed to Platform Admin Mediation Console.');
        setDisputeModalOpen(false);
        setSelectedPaymentForDispute(null);
        await fetchLedger();
        setTimeout(() => setPaySuccess(''), 5000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to file dispute');
      }
    } catch (err) {
      console.warn('Dispute error:', err);
    }
  };



  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.shipmentCode.toLowerCase().includes(q) ||
        p.telebirrTxNo.toLowerCase().includes(q) ||
        p.routeTitle.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [payments, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Deposit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('shipper.paymentsTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('shipper.paymentsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setPayModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" /> {t('shipper.depositEscrow')}
          </button>
        </div>
      </div>

      {paySuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{paySuccess}</span>
        </div>
      )}

      {/* PAYMENTS & SETTLEMENT LEDGER */}
      <div className="space-y-6">
          {/* Financial KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'AM' ? 'አጠቃላይ የኤስክሮው መጠን' : language === 'OM' ? 'Waliigala Hanga Iskroow' : 'Total Escrow Volume'}
                </div>
                <div className="text-xl font-black text-slate-900">{totalEscrow.toLocaleString()} ETB</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {language === 'AM' ? 'ቴሌብር እና ሲቢኢ ብር' : language === 'OM' ? 'Telebirr fi CBE Birr' : 'TeleBirr & CBE Birr'}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'AM' ? 'የፕላትፎርም ኮሚሽን (5.0%)' : language === 'OM' ? 'Koomishinii Pilaatfoormii (5.0%)' : 'Platform Commission (5.0%)'}
                </div>
                <div className="text-xl font-black text-indigo-900">{totalCommission.toLocaleString()} ETB</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {language === 'AM' ? 'በራስ-ሰር የሚቀነስ' : language === 'OM' ? 'Ofumaan kan Hir\'ifamu' : 'Automated Deduction'}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'AM' ? 'የአጓጓዥ የተጣራ ክፍያ' : language === 'OM' ? 'Kaffaltii Qulqulluu Fe\'aa' : 'Carrier Net Payouts'}
                </div>
                <div className="text-xl font-black text-emerald-700">{totalNetPayout.toLocaleString()} ETB</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {language === 'AM' ? 'የ 2% ዊዝሆልዲንግ ታክስ ተቀንሶ' : language === 'OM' ? 'Taaksii 2% erga hir\'ifamee booda' : 'Net of 2% Withholding'}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {language === 'AM' ? 'የተወራረዱ ክፍያዎች' : language === 'OM' ? 'Kaffaltiiwwan Murteeffaman' : 'Reconciled Settlements'}
                </div>
                <div className="text-xl font-black text-purple-900">
                  {settledCount} {language === 'AM' ? 'የተወራረደ' : language === 'OM' ? 'Murteeffame' : 'Settled'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {language === 'AM' ? 'በተረጋገጠ e-POD የተከፈለ' : language === 'OM' ? 'e-POD Mirkanaa\'een kan Kaffalame' : 'e-POD Verified Disbursed'}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'AM' ? 'ሁሉም ዝውውሮች' : language === 'OM' ? 'Daldala Hunda' : 'All Transactions'} ({payments.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('HELD_IN_ESCROW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'HELD_IN_ESCROW' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'AM' ? 'በኤስክሮው የተያዘ' : language === 'OM' ? 'Iskroow Keessatti' : 'In Escrow'} ({payments.filter((p) => p.status === 'HELD_IN_ESCROW').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('SETTLED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'SETTLED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'AM' ? 'የተወራረደ' : language === 'OM' ? 'Murteeffame' : 'Settled'} ({settledCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('DISPUTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'DISPUTED' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {language === 'AM' ? 'አለመግባባት ያለበት' : language === 'OM' ? 'Mormii Qabu' : 'Disputed'} ({payments.filter((p) => p.status === 'DISPUTED').length})
              </button>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'AM' ? 'በመለያ ቁጥር፣ በግብይት ይፈልጉ...' : language === 'OM' ? 'ID imalaatiin, daldalaan barbaadi...' : 'Search trip ID, transaction...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Automated Transaction Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'AM' ? 'የክፍያ ማወራረጃ እና የገንዘብ ዝውውር መዝገብ' : language === 'OM' ? 'Galmee Kaffaltii fi Sagantaa Kaffaltii Ofumaa' : 'Automated Reconciliation Ledger & Payout Schedule'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'AM' ? 'ክፍያዎች በጉዞ ማጠናቀቂያ መለያዎች፣ በዲጂታል ፊርማ እና በ e-POD የተረጋገጡ ናቸው።' : language === 'OM' ? 'Kaffaltiiwwan ID xumura imalaatiin, mirkaneessa webhook fi mallattoo e-POD tiin wal-simataniiru.' : 'Transactions reconciled against trip completion IDs, webhook confirmations, and e-POD signatures.'}
                </p>
              </div>
              <div className="text-xs font-bold text-slate-400">
                {filteredPayments.length} {language === 'AM' ? 'የተመዘገቡ ክፍያዎች' : language === 'OM' ? 'Galmeewwan Kaffaltii' : 'Reconciled Records'}
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold">
                  {language === 'AM' ? 'የተመረጠውን ማጣሪያ የሚያሟላ ምንም የክፍያ መዝገብ አልተገኘም።' : language === 'OM' ? 'Galmeen kaffaltii filannoo wajjin walsimu hin argamne.' : 'No payment ledger records found matching filter.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'AM' ? 'ዝውውሮችን ለማየት ፍለጋውን ያጽዱ ወይም ማጣሪያዎችን ያስተካክሉ።' : language === 'OM' ? 'Daldaloota ilaaluuf barbaacha qulqulleessi ykn calaltuu sirreessi.' : 'Clear search or adjust filters to view corridor transactions.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">{language === 'AM' ? 'የጉዞ መለያ እና መስመር' : language === 'OM' ? 'Koodii Imalaa fi Daandii' : 'Trip Code & Route'}</th>
                      <th className="py-3 px-4">{language === 'AM' ? 'የክፍያ ዘዴ እና የግብይት ቁጥር' : language === 'OM' ? 'Mala Kaffaltii fi Lakkoofsa Tx' : 'Gateway & Tx No'}</th>
                      <th className="py-3 px-4 text-right">{language === 'AM' ? 'ጠቅላላ ክፍያ' : language === 'OM' ? 'Hanga Waliigalaa' : 'Gross Amount'}</th>
                      <th className="py-3 px-4 text-right">{language === 'AM' ? 'ኮሚሽን (5%) እና ታክስ (2%)' : language === 'OM' ? 'Koomishinii (5%) fi Taaksii (2%)' : 'Fee (5%) & Tax (2%)'}</th>
                      <th className="py-3 px-4 text-right">{language === 'AM' ? 'የተጣራ ክፍያ' : language === 'OM' ? 'Kaffaltii Qulqulluu' : 'Net Payout'}</th>
                      <th className="py-3 px-4 text-center">{language === 'AM' ? 'የክፍያው ሁኔታ' : language === 'OM' ? 'Haala Kaffaltii' : 'Settlement Status'}</th>
                      <th className="py-3 px-4 text-center">{language === 'AM' ? 'እርምጃዎች' : language === 'OM' ? 'Tarkaanfiiwwan' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => {
                      const isSettled = p.status === 'SETTLED';
                      const isDisputed = p.status === 'DISPUTED';
                      const isEscrow = p.status === 'HELD_IN_ESCROW' || p.status === 'CONFIRMED';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900">{p.shipmentCode}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{p.routeTitle}</div>
                            <div className="text-[10px] text-slate-400">{p.paidAt}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                              {p.paymentMethod === 'CBE_BIRR' ? (
                                <Building className="w-3.5 h-3.5 text-purple-600" />
                              ) : (
                                <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                              )}
                              <span>{p.paymentMethod}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">{p.telebirrTxNo}</div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="font-black text-slate-900 text-sm">
                              {p.grossAmountEtb.toLocaleString()} ETB
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="text-rose-600 font-bold">
                              -{p.commissionEtb.toLocaleString()} ETB
                            </div>
                            <div className="text-amber-700 text-[10px] font-medium">
                              -{(p.withholdingTaxEtb || 0).toLocaleString()} ETB ({language === 'AM' ? 'ታክስ' : language === 'OM' ? 'Taaksii' : 'Tax'})
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="font-black text-emerald-700 text-sm">
                              {p.netPayoutEtb.toLocaleString()} ETB
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {language === 'AM' ? 'የሚለቀቅ ክፍያ' : language === 'OM' ? 'Kaffaltii Saganteeffame' : 'Scheduled Payout'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isSettled
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDisputed
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isSettled ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{language === 'AM' ? 'የተወራረደ' : language === 'OM' ? 'Murteeffame' : 'Settled'}</span>
                                </>
                              ) : isDisputed ? (
                                <>
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>{language === 'AM' ? 'አለመግባባት ያለበት' : language === 'OM' ? 'Mormii Qabu' : 'Disputed'}</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>{language === 'AM' ? 'በኤስክሮው የተያዘ' : language === 'OM' ? 'Iskroow Keessatti' : 'Held in Escrow'}</span>
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {isEscrow && (
                                <>
                                  {!p.isDelivered ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold"
                                      title={language === 'AM' ? 'ክፍያው በካዝና ውስጥ ተቆልፏል። ሹፌሩ እቃውን አድርሶ e-POD ሲያስመዘግብ ይለቀቃል።' : 'Escrow is locked in vault. Release will become active once the driver completes delivery and collects verified e-POD.'}
                                    >
                                      <Lock className="w-3 h-3 text-amber-600" />
                                      <span>{language === 'AM' ? 'ተቆልፏል (በጉዞ ላይ)' : language === 'OM' ? 'Cufameera (Imala Keessa)' : 'Locked (In Transit)'}</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSettlePayment(p.id, p.shipmentId)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shadow-xs cursor-pointer flex items-center gap-1"
                                      title={language === 'AM' ? 'ጭነቱ በተረጋገጠ e-POD ደርሷል። ክፍያውን ልቀቅ።' : 'Consignment delivered with verified e-POD. Release escrow funds.'}
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>{language === 'AM' ? 'ክፍያውን ልቀቅ' : language === 'OM' ? 'Iskroow Gadi Dhiisi' : 'Release Escrow'}</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDispute(p)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] transition shadow-xs cursor-pointer"
                                  >
                                    {language === 'AM' ? 'ቅሬታ አቅርብ' : language === 'OM' ? 'Mormii Kaasi' : 'Raise Dispute'}
                                  </button>
                                </>
                              )}
                              {isDisputed && (
                                <span className="text-[10px] font-bold text-rose-600 italic">
                                  {language === 'AM' ? 'በሽምግልና ሂደት ላይ' : language === 'OM' ? 'Adeemsa Araaraa Keessa' : 'Under Mediation'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>

      {/* Pay / Escrow Modal */}
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
      />

      {/* Dispute Modal */}
      <DisputeEscrowModal
        isOpen={disputeModalOpen}
        onClose={() => {
          setDisputeModalOpen(false);
          setSelectedPaymentForDispute(null);
        }}
        onSubmit={handleSubmitDispute}
        paymentRef={selectedPaymentForDispute?.telebirrTxNo || selectedPaymentForDispute?.shipmentCode}
        defaultAmount={selectedPaymentForDispute ? Math.round(selectedPaymentForDispute.grossAmountEtb * 0.25) : 25000}
      />
    </div>
  );
};
