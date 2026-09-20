import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
  Building,
  Truck,
  DollarSign,
  CreditCard,
  Scale,
  FileText,
  User,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { DisputeTicketItem, DisputeStats } from '../types';

interface DisputesTabProps {
  tickets: DisputeTicketItem[];
  stats: DisputeStats;
  loading: boolean;
  onRefresh: () => void;
  onArbitrate: (
    paymentId: string,
    verdict: 'REFUND_SHIPPER' | 'RELEASE_TRANSPORTER' | 'PARTIAL_SPLIT',
    refundAmountEtb: number,
    transporterPayoutEtb: number,
    adminNotes: string
  ) => Promise<void>;
}

export const DisputesTab: React.FC<DisputesTabProps> = ({
  tickets = [],
  stats,
  loading,
  onRefresh,
  onArbitrate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'SETTLED' | 'REFUNDED'>('ALL');

  // Selected Ticket for Arbitration Modal
  const [activeTicket, setActiveTicket] = useState<DisputeTicketItem | null>(null);
  const [verdict, setVerdict] = useState<'REFUND_SHIPPER' | 'RELEASE_TRANSPORTER' | 'PARTIAL_SPLIT'>('PARTIAL_SPLIT');
  const [customRefundAmount, setCustomRefundAmount] = useState<string>('20000');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [submittingArbitration, setSubmittingArbitration] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'OPEN' && t.status !== 'DISPUTED') return false;
    if (statusFilter === 'SETTLED' && t.status !== 'SETTLED') return false;
    if (statusFilter === 'REFUNDED' && t.status !== 'REFUNDED') return false;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchNo = t.ticketNumber.toLowerCase().includes(q);
      const matchLoad = t.loadCode.toLowerCase().includes(q);
      const matchShipper = t.shipperCompany.toLowerCase().includes(q) || t.shipperTin.toLowerCase().includes(q);
      const matchCarrier = t.transporterName.toLowerCase().includes(q) || t.truckPlate.toLowerCase().includes(q);
      return matchNo || matchLoad || matchShipper || matchCarrier;
    }
    return true;
  });

  const handleOpenArbitration = (ticket: DisputeTicketItem) => {
    setActiveTicket(ticket);
    setVerdict('PARTIAL_SPLIT');
    setCustomRefundAmount(String(ticket.claimedAmountEtb || Math.round(ticket.grossAmountEtb * 0.15)));
    setAdminNotes('');
  };

  const handleExecuteArbitration = async () => {
    if (!activeTicket) return;
    setSubmittingArbitration(true);
    try {
      let refund = 0;
      let payout = activeTicket.netTransporterPayoutEtb;

      if (verdict === 'REFUND_SHIPPER') {
        refund = activeTicket.grossAmountEtb;
        payout = 0;
      } else if (verdict === 'RELEASE_TRANSPORTER') {
        refund = 0;
        payout = activeTicket.netTransporterPayoutEtb;
      } else {
        refund = parseFloat(customRefundAmount) || 0;
        payout = Math.max(0, activeTicket.grossAmountEtb - refund - activeTicket.platformCommissionEtb);
      }

      await onArbitrate(
        activeTicket.paymentId,
        verdict,
        refund,
        payout,
        adminNotes || 'Administrative arbitration resolution executed'
      );

      setActionSuccessMsg(
        verdict === 'REFUND_SHIPPER'
          ? '🎉 100% Escrow refund to Shipper TeleBirr wallet executed!'
          : verdict === 'RELEASE_TRANSPORTER'
          ? '✓ Claim dismissed. 100% carrier payout disbursed to Transporter!'
          : '⚖️ Compromise split executed: partial refund sent to Shipper and net payout to Transporter!'
      );
      setActiveTicket(null);
      setTimeout(() => setActionSuccessMsg(''), 6000);
    } catch (err: any) {
      alert(err.message || 'Arbitration execution failed');
    } finally {
      setSubmittingArbitration(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-amber-800/60 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10.5px] font-extrabold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" />
            <span>TeleBirr Smart Escrow Mediation Center (FR-10.4)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Escrow Dispute Arbitration Workbench
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Mediate contested freight payments, review cargo condition discrepancy claims, assess delay penalties, and execute binding financial disbursements or TeleBirr escrow refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Disputes</span>
        </button>
      </div>

      {/* Action Success Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Contested Cases</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.openCases}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Funds Frozen in Escrow
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-rose-600" />
            <span>Frozen Escrow Value</span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {Number(stats.totalFrozenAmountEtb).toLocaleString()} ETB
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Pending Resolution
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolved / Settled</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.resolvedCases}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Mediation Completed
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Success Rate</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.mediationSuccessRatePct}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Avg SLA: {stats.averageResolutionHours} Hours
          </div>
        </div>
      </div>

      {/* 3. Filter Pills & Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Disputes ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Open / Frozen ({stats.openCases})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SETTLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'SETTLED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settled / Payout ({stats.resolvedCases})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REFUNDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'REFUNDED'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refunded ({stats.refundedCases})
          </button>
        </div>

        <div className="relative min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Ticket #, Shipper, Carrier, or Plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* 4. Disputes List */}
      {filteredTickets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <div className="text-sm font-bold text-slate-800">
            {tickets.length === 0
              ? 'No Active TeleBirr Escrow Disputes'
              : 'No Disputes Matching Filter'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {tickets.length === 0
              ? 'Freight escrow transactions are currently running smoothly along the corridor. Any disputed charges or damage claims filed by shippers will be routed here.'
              : 'Try clearing your search query or switching to another filter tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => {
            const isOpen = ticket.status === 'DISPUTED';
            const isSettled = ticket.status === 'SETTLED';
            const isRefunded = ticket.status === 'REFUNDED';

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-3xl border transition-all bg-white relative overflow-hidden ${
                  isOpen
                    ? 'border-amber-300 ring-2 ring-amber-500/10 shadow-sm'
                    : isRefunded
                    ? 'border-purple-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info Column */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {ticket.ticketNumber}
                      </span>
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {ticket.loadCode}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isOpen
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : isRefunded
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isOpen
                          ? '⏳ ESCROW FROZEN (UNDER ARBITRATION)'
                          : isRefunded
                          ? '✓ 100% REFUNDED TO SHIPPER'
                          : '✓ RESOLVED & DISBURSED'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      {ticket.title} ({ticket.weightTons}T {ticket.cargoType})
                    </h3>

                    {/* Contested Reason Callout */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Contested Claim: {ticket.disputeReason}</span>
                      </div>
                      <div className="text-[11px] text-amber-800">
                        Shipper Claimed Deduction:{' '}
                        <strong className="font-mono text-rose-700 font-bold">
                          {Number(ticket.claimedAmountEtb).toLocaleString()} ETB
                        </strong>{' '}
                        • Total Frozen Escrow:{' '}
                        <strong className="font-mono text-slate-900">
                          {Number(ticket.grossAmountEtb).toLocaleString()} ETB
                        </strong>
                      </div>
                    </div>

                    {/* Both Parties Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      {/* Shipper Party */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Consignor (Claimant)</div>
                        <div className="font-bold text-slate-900">{ticket.shipperCompany}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          TIN: {ticket.shipperTin} • {ticket.shipperPhone}
                        </div>
                      </div>

                      {/* Transporter Party */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Carrier (Respondent)</div>
                        <div className="font-bold text-slate-900">{ticket.transporterName}</div>
                        <div className="text-slate-500 text-[11px]">
                          Driver: {ticket.driverName} • Plate: <strong>{ticket.truckPlate}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Column */}
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-stretch gap-2 min-w-[200px]">
                    <div className="text-right p-3 rounded-2xl bg-slate-50 border border-slate-200 sm:block hidden">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Total Escrow Funds</div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        {Number(ticket.grossAmountEtb).toLocaleString()} ETB
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Carrier Net: {Number(ticket.netTransporterPayoutEtb).toLocaleString()} ETB
                      </div>
                    </div>

                    {isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleOpenArbitration(ticket)}
                        className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full"
                      >
                        <Scale className="w-4 h-4" />
                        <span>Arbitrate Case (ዳኝ)</span>
                      </button>
                    ) : (
                      <div className="p-3 text-center rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                        {isRefunded ? 'Refund Executed ✓' : 'Settlement Executed ✓'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Interactive Multi-Party Arbitration Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 space-y-6 p-6 sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {activeTicket.ticketNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Consignment: {activeTicket.loadCode}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  TeleBirr Smart Escrow Arbitration Verdict
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
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
                    <span>Compromise Split Settlement (ከፊል ክፍያ እና ተመላሽ)</span>
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
                  <span>100% Full Refund to Shipper (የተሟላ ገንዘብ ተመላሽ)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Total escrow funds returned to Shipper TeleBirr mobile wallet. Transporter receives 0 ETB.
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
                  <span>Dismiss Claim & Disburse 100% to Transporter (ክሱን ውድቅ አድርግ)</span>
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
                onClick={() => setActiveTicket(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submittingArbitration}
                onClick={handleExecuteArbitration}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                <span>{submittingArbitration ? 'Executing...' : 'Confirm Binding Verdict & Disburse (ዳኝነትን አጽድቅ)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
