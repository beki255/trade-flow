import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Lock,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  Truck,
  Inbox,
  ShieldCheck,
} from 'lucide-react';
import { LockedContractItem, SpotPricingResult } from '../types';
import { useAuth } from '../../../context/AuthContext';

export const PricingContractsTab: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<LockedContractItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'CONTRACTS' | 'SPOT_SIMULATOR'>('CONTRACTS');
  const [flaggedCount, setFlaggedCount] = useState<number>(0);

  // Real Transporters from PostgreSQL
  const [verifiedTransporters, setVerifiedTransporters] = useState<any[]>([]);
  const [selectedTransporterId, setSelectedTransporterId] = useState<string>('');

  // Renegotiation Modal State
  const [renegotiateModalContract, setRenegotiateModalContract] = useState<LockedContractItem | null>(null);
  const [proposedNewRate, setProposedNewRate] = useState<string>('');
  const [renegotiationNotes, setRenegotiationNotes] = useState<string>('');
  const [submittingRenegotiation, setSubmittingRenegotiation] = useState<boolean>(false);
  const [renegotiateAction, setRenegotiateAction] = useState<'PROPOSE' | 'ACCEPT_ADJUSTMENT'>('PROPOSE');

  // Lock New Contract Modal State
  const [lockModalOpen, setLockModalOpen] = useState<boolean>(false);
  const [newCorridor, setNewCorridor] = useState<string>('Djibouti Port - Modjo Dry Port - Addis Ababa');
  const [newOrigin, setNewOrigin] = useState<string>('Djibouti Port Container Terminal');
  const [newDest, setNewDest] = useState<string>('Addis Ababa (Kality Logistics Hub)');
  const [newRateEtb, setNewRateEtb] = useState<string>('');
  const [newPeriodWeeks, setNewPeriodWeeks] = useState<number>(12);
  const [newWeeklyLoads, setNewWeeklyLoads] = useState<number>(5);
  const [lockingContract, setLockingContract] = useState<boolean>(false);
  const [lockError, setLockError] = useState<string | null>(null);

  // Spot Simulator State
  const [simOrigin, setSimOrigin] = useState<string>('Djibouti Port Container Terminal');
  const [simDest, setSimDest] = useState<string>('Addis Ababa (Kality Logistics Hub)');
  const [simWeight, setSimWeight] = useState<string>('30');
  const [simCargo, setSimCargo] = useState<string>('GENERAL_CONTAINER');
  const [simReefer, setSimReefer] = useState<boolean>(false);
  const [simHazmat, setSimHazmat] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SpotPricingResult | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);


  // 1. Fetch Real Contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const queryParam = user?.email ? `?shipperEmail=${encodeURIComponent(user.email)}` : '';
      const res = await fetch(`/api/pricing/contracts${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts || []);
        setFlaggedCount(data.flaggedCount || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Real Verified Transporters from Database
  const fetchTransporters = async () => {
    try {
      const res = await fetch('/api/portal/verifications');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          const list = data.users.filter(
            (u: any) => u.role === 'TRANSPORTER' && u.verificationStatus === 'VERIFIED'
          );
          setVerifiedTransporters(list);
          if (list.length > 0) {
            setSelectedTransporterId(list[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch verified transporters:', err);
    }
  };


  // 4. Run Simulator with Real Auth Context
  const runSimulator = async () => {
    if (!simOrigin || !simDest) return;

    try {
      setSimLoading(true);
      const res = await fetch('/api/pricing/spot-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originName: simOrigin,
          destName: simDest,
          originLat: simOrigin.includes('Djibouti') ? 11.595 : 8.895,
          originLng: simOrigin.includes('Djibouti') ? 43.148 : 38.765,
          destLat: simDest.includes('Djibouti') ? 11.595 : 8.895,
          destLng: simDest.includes('Djibouti') ? 43.148 : 38.765,
          weightTons: parseFloat(simWeight) || 30.0,
          cargoType: simCargo,
          isRefrigerated: simReefer,
          isHazardous: simHazmat,
          requesterId: user?.id,
          requesterEmail: user?.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data.pricing);
      }
    } catch (err) {
      console.warn('Simulation failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchTransporters();
    runSimulator();
  }, [user]);

  // Submit Renegotiation
  const handleRenegotiationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renegotiateModalContract) return;

    setSubmittingRenegotiation(true);
    try {
      const res = await fetch(`/api/pricing/contracts/${renegotiateModalContract.id}/renegotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedNewRateEtb: proposedNewRate,
          renegotiationNotes,
          action: renegotiateAction,
          requestedByEmail: user?.email,
        }),
      });

      if (res.ok) {
        await fetchContracts();
        setRenegotiateModalContract(null);
        setProposedNewRate('');
        setRenegotiationNotes('');
      }
    } catch (err) {
      console.error('Failed to submit renegotiation:', err);
    } finally {
      setSubmittingRenegotiation(false);
    }
  };

  // Submit Lock Contract
  const handleLockContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockError(null);

    if (!user?.id) {
      setLockError('You must be logged in as an authorized shipper to lock a contract.');
      return;
    }

    if (!selectedTransporterId) {
      setLockError('Please select a verified corridor transporter.');
      return;
    }

    setLockingContract(true);
    try {
      const res = await fetch('/api/pricing/contracts/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipperId: user.id,
          transporterId: selectedTransporterId,
          corridorName: newCorridor,
          originName: newOrigin,
          destName: newDest,
          lockedRateEtb: newRateEtb,
          periodDurationWeeks: newPeriodWeeks,
          committedWeeklyLoads: newWeeklyLoads,
        }),
      });

      if (res.ok) {
        await fetchContracts();
        setLockModalOpen(false);
        setNewRateEtb('');
      } else {
        const errData = await res.json();
        setLockError(errData.error || 'Failed to lock contract');
      }
    } catch (err: any) {
      setLockError(err.message || 'Failed to lock contract');
    } finally {
      setLockingContract(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Corridor Dynamic Pricing & Contract Rates
            </h1>
            {flaggedCount > 0 && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {flaggedCount} Divergence Flagged (&gt;20%)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time spot rate calculation, committed volume contracts with verified carriers, and automated divergence review workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('CONTRACTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'CONTRACTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Locked Contracts
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('SPOT_SIMULATOR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'SPOT_SIMULATOR'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Spot Rate Calculator
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CONTRACT RATE MANAGEMENT (4.4.2) */}
      {activeSubTab === 'CONTRACTS' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-900">{contracts.length} active agreements</span> established with verified carriers.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={fetchContracts}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => setLockModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock New Multi-Week Contract</span>
              </button>
            </div>
          </div>

          {/* Zero-Mock Empty State */}
          {contracts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                No Locked Corridor Contracts Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You haven't established any locked multi-week agreements yet. Locking rates with verified transporters protects your shipments against spot market volatility, diesel surges, and seasonal capacity shortages.
              </p>
              <button
                type="button"
                onClick={() => setLockModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-sky-400" />
                <span>Lock Your First Contract</span>
              </button>
            </div>
          ) : (
            /* Contracts Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.map((contract) => {
                const isFlagged = contract.status === 'FLAGGED_FOR_RENEGOTIATION';
                const isUnderRenegotiation = contract.status === 'UNDER_RENEGOTIATION';
                const isRenewed = contract.status === 'RENEGOTIATED_RENEWED';

                return (
                  <div
                    key={contract.id}
                    className={`bg-white rounded-3xl p-5 border transition-all shadow-xs ${
                      isFlagged
                        ? 'border-rose-300 ring-2 ring-rose-500/20 bg-rose-50/20'
                        : isUnderRenegotiation
                        ? 'border-amber-300 ring-2 ring-amber-500/20 bg-amber-50/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {contract.contractCode}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">
                          {contract.corridorName}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Carrier: <span className="font-bold text-slate-700">{contract.transporterName}</span>
                        </p>
                      </div>

                      {isFlagged ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Divergent (&gt;20%)
                        </span>
                      ) : isUnderRenegotiation ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          In Review
                        </span>
                      ) : isRenewed ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Renewed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          Active Locked
                        </span>
                      )}
                    </div>

                    {/* Financial Comparison: Locked vs Prevailing Spot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3.5 my-1">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Locked Contract Rate
                        </span>
                        <div className="text-lg font-black text-slate-900 mt-0.5">
                          ETB {contract.lockedRateEtb.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Committed: {contract.committedWeeklyLoads} loads / wk
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80">
                        <span className="text-[10px] uppercase font-bold text-sky-800 block">
                          Live Spot Benchmark
                        </span>
                        <div className="text-lg font-black text-sky-950 mt-0.5">
                          ETB {contract.currentSpotBenchmarkEtb.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold mt-0.5">
                          <span className={contract.divergencePercentage >= 20 ? 'text-rose-600' : 'text-emerald-600'}>
                            {contract.divergencePercentage > 0 ? '+' : ''}
                            {contract.divergencePercentage}% divergence
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divergence Warning */}
                    {isFlagged && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mb-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Automatic Material Divergence Trigger (&gt; 20% Threshold)</span>
                        </div>
                        <p className="text-[11px] text-rose-700">
                          Prevailing spot rate has shifted by {contract.divergencePercentage}% from this agreement. System has flagged this contract for renegotiation review.
                        </p>
                      </div>
                    )}

                    {/* Period & Dates */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contract.periodDurationWeeks}-Week Term</span>
                      </div>
                      <span>
                        Expires: {new Date(contract.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-3">
                      {isFlagged ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRenegotiateModalContract(contract);
                            setProposedNewRate(String(contract.currentSpotBenchmarkEtb));
                            setRenegotiationNotes(
                              `Rate adjustment review requested due to +${contract.divergencePercentage}% spot variance.`
                            );
                            setRenegotiateAction('PROPOSE');
                          }}
                          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Launch Renegotiation Review Workflow</span>
                        </button>
                      ) : isUnderRenegotiation ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRenegotiateModalContract(contract);
                            setProposedNewRate(String(contract.proposedNewRateEtb || contract.currentSpotBenchmarkEtb));
                            setRenegotiationNotes(contract.renegotiationNotes || '');
                            setRenegotiateAction('ACCEPT_ADJUSTMENT');
                          }}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Review & Approve Renegotiated Terms</span>
                        </button>
                      ) : (
                        <div className="text-center py-2 text-xs font-bold text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                          Rate Within Corridor Tolerance Band (±20%)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SPOT RATE CALCULATOR & COST SIMULATOR (4.4.1) */}
      {activeSubTab === 'SPOT_SIMULATOR' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Corridor Spot Rate Engine & Cost Model
              </h2>
              <p className="text-xs text-slate-500">
                Interactive rate calculator incorporating base corridor rates (145 ETB/km), demand ratio, diesel index, and checkpoint delays.
              </p>
            </div>
            <button
              type="button"
              onClick={runSimulator}
              disabled={simLoading}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${simLoading ? 'animate-spin' : ''}`} />
              <span>{simLoading ? 'Calculating...' : 'Calculate Rate'}</span>
            </button>
          </div>

          {/* Simulator Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corridor Origin Hub
              </label>
              <input
                type="text"
                value={simOrigin}
                onChange={(e) => setSimOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination Hub
              </label>
              <input
                type="text"
                value={simDest}
                onChange={(e) => setSimDest(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payload Weight (Tons)
              </label>
              <input
                type="number"
                value={simWeight}
                onChange={(e) => setSimWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cargo Classification
              </label>
              <select
                value={simCargo}
                onChange={(e) => setSimCargo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                <option value="GENERAL_CONTAINER">Standard Container Freight</option>
                <option value="AGRICULTURAL_COFFEE">Agricultural Export Coffee</option>
                <option value="INDUSTRIAL_MACHINERY">Heavy Industrial Equipment</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simReefer}
                  onChange={(e) => setSimReefer(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Reefer (+22%)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simHazmat}
                  onChange={(e) => setSimHazmat(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Hazmat (+30%)</span>
              </label>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 inline-block">
                    Calculated Spot Benchmark
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    ETB {simResult.totalSpotRateEtb.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  <div>Floor (-12%): ETB {simResult.floorBoundEtb.toLocaleString()}</div>
                  <div>Ceiling (+18%): ETB {simResult.ceilingBoundEtb.toLocaleString()}</div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-500 text-[10px] block font-bold">Base Freight</span>
                  <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                    ETB {simResult.itemizedBreakdown.baseFreightEtb.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-500 text-[10px] block font-bold">Demand Index (+12%)</span>
                  <span className="font-bold font-mono text-amber-700 mt-0.5 block">
                    +ETB {simResult.itemizedBreakdown.demandAdjustmentEtb.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-500 text-[10px] block font-bold">Fuel Surcharge (EPSE Index)</span>
                  <span className="font-bold font-mono text-sky-700 mt-0.5 block">
                    +ETB {simResult.itemizedBreakdown.fuelSurchargeEtb.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-slate-500 text-[10px] block font-bold">Checkpoint Delays</span>
                  <span className="font-bold font-mono text-purple-700 mt-0.5 block">
                    +ETB {simResult.itemizedBreakdown.congestionSurchargeEtb.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENEGOTIATION REVIEW MODAL (4.4.2) */}
      {renegotiateModalContract && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Contract Renegotiation Review
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {renegotiateModalContract.contractCode} - {renegotiateModalContract.corridorName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRenegotiateModalContract(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenegotiationSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Locked Rate:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ETB {renegotiateModalContract.lockedRateEtb.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prevailing Spot Benchmark:</span>
                  <span className="font-bold text-sky-700 font-mono">
                    ETB {renegotiateModalContract.currentSpotBenchmarkEtb.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Spot Divergence:</span>
                  <span className="font-black text-rose-600 font-mono">
                    +{renegotiateModalContract.divergencePercentage}% (Threshold: &gt; 20%)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proposed Adjusted Rate (ETB) *
                </label>
                <input
                  type="number"
                  required
                  value={proposedNewRate}
                  onChange={(e) => setProposedNewRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Renegotiation Review Justification & Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={renegotiationNotes}
                  onChange={(e) => setRenegotiationNotes(e.target.value)}
                  placeholder="State rationale regarding fuel cost changes or turnaround delays..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-600 outline-none text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRenegotiateModalContract(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRenegotiation}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingRenegotiation
                    ? 'Processing...'
                    : renegotiateAction === 'ACCEPT_ADJUSTMENT'
                    ? 'Accept & Lock Adjusted Rate'
                    : 'Submit Renegotiation Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCK NEW CONTRACT MODAL (4.4.2) */}
      {lockModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  New Long-Term Freight Contract
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Lock Multi-Week Corridor Rate Guarantee
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLockModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLockContractSubmit} className="space-y-4">
              {lockError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {lockError}
                </div>
              )}

              {/* Real Transporter Selector from Database */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Verified Transporter Partner *
                </label>
                {verifiedTransporters.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No verified transporters currently in system. Transporters must be verified by admin.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedTransporterId}
                    onChange={(e) => setSelectedTransporterId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  >
                    {verifiedTransporters.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.companyName || t.fullName} • TIN: {t.tin || 'N/A'} (Verified)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corridor Route *
                </label>
                <select
                  value={newCorridor}
                  onChange={(e) => {
                    setNewCorridor(e.target.value);
                    if (e.target.value.includes('Hawassa')) {
                      setNewOrigin('Modjo Dry Port Customs Zone');
                      setNewDest('Hawassa Industrial Park Phase 2');
                    } else if (e.target.value.includes('Dire Dawa')) {
                      setNewOrigin('Dire Dawa Free Trade Zone');
                      setNewDest('Addis Ababa Central Logistics Hub');
                    } else {
                      setNewOrigin('Djibouti Port Container Terminal');
                      setNewDest('Addis Ababa (Kality Logistics Hub)');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="Djibouti Port - Modjo Dry Port - Addis Ababa">
                    Djibouti Port - Modjo Dry Port - Addis Ababa
                  </option>
                  <option value="Modjo Dry Port - Hawassa Industrial Park">
                    Modjo Dry Port - Hawassa Industrial Park
                  </option>
                  <option value="Dire Dawa Free Trade Zone - Addis Ababa">
                    Dire Dawa Free Trade Zone - Addis Ababa
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Locked Rate (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newRateEtb}
                    onChange={(e) => setNewRateEtb(e.target.value)}
                    placeholder="e.g. 175000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lock Period (Weeks) *
                  </label>
                  <select
                    value={newPeriodWeeks}
                    onChange={(e) => setNewPeriodWeeks(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  >
                    <option value={4}>4 Weeks (1 Month)</option>
                    <option value={8}>8 Weeks (2 Months)</option>
                    <option value={12}>12 Weeks (Quarterly / 3 Months)</option>
                    <option value={24}>24 Weeks (Half-Year / 6 Months)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Committed Weekly Load Volume *
                </label>
                <input
                  type="number"
                  required
                  value={newWeeklyLoads}
                  onChange={(e) => setNewWeeklyLoads(parseInt(e.target.value))}
                  placeholder="e.g. 5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLockModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lockingContract || verifiedTransporters.length === 0}
                  className="w-1/2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {lockingContract ? 'Locking Agreement...' : 'Confirm & Lock Rate Guarantee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
