import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Stamp,
  Truck,
  Building,
  User,
  AlertCircle
} from 'lucide-react';
import { CustomsStats, CustomsDossierItem } from '../types';

interface ReviewQueueTabProps {
  stats: CustomsStats;
  dossiers: CustomsDossierItem[];
  loading: boolean;
  onRefresh: () => void;
  onSelectDossierForCompliance: (dossier: CustomsDossierItem) => void;
  onQuickApprove: (shipmentId: string, station: string) => Promise<void>;
  onViewCertificate?: (shipmentId: string) => void;
}

export const ReviewQueueTab: React.FC<ReviewQueueTabProps> = ({
  stats,
  dossiers = [],
  loading,
  onRefresh,
  onSelectDossierForCompliance,
  onQuickApprove,
  onViewCertificate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CLEARED' | 'REVISION'>('ALL');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Filter dossiers
  const filteredDossiers = dossiers.filter((d) => {
    // Status filter
    if (statusFilter === 'PENDING' && !(d.customsStatus === 'SUBMITTED' || d.customsStatus === 'UNDER_REVIEW')) {
      return false;
    }
    if (statusFilter === 'CLEARED' && d.customsStatus !== 'CLEARED') {
      return false;
    }
    if (statusFilter === 'REVISION' && !(d.customsStatus === 'REVISION_REQUESTED' || d.customsStatus === 'REJECTED')) {
      return false;
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchCode = d.loadCode.toLowerCase().includes(q);
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchShipper = d.shipperCompany.toLowerCase().includes(q) || d.shipperTin.toLowerCase().includes(q);
      const matchRoute = d.origin.toLowerCase().includes(q) || d.destination.toLowerCase().includes(q);
      const matchDoc = d.documents.some((doc) => doc.docNumber.toLowerCase().includes(q));
      return matchCode || matchTitle || matchShipper || matchRoute || matchDoc;
    }

    return true;
  });

  const handleQuickApproveClick = async (e: React.MouseEvent, shipmentId: string) => {
    e.stopPropagation();
    setApprovingId(shipmentId);
    try {
      await onQuickApprove(shipmentId, 'Galafi Border Checkpoint (Main Corridor)');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10.5px] font-extrabold uppercase tracking-widest">
            <Stamp className="w-3.5 h-3.5" />
            <span>Ethiopian Customs Commission (ECC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Customs Document Review Queue
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
            Inspect international trade documents (Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin) for Djibouti–Addis Ababa corridor consignments, conduct automated compliance cross-checks, and issue single-window Green Line electronic releases.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Reviews</span>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.pendingReviews}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Galafi & Mojo Terminals
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Green Line Cleared</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.greenLineCleared}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            Zero Delay Transit Pass
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Revisions / Holds</span>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {stats.revisionsRequested}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Requires Shipper Correction
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Average Processing</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.averageProcessingMins || 14} mins
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Single Window SLA
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
            All Dossiers ({dossiers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review ({stats.pendingReviews})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('CLEARED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'CLEARED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Green Line Cleared ({stats.greenLineCleared})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REVISION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'REVISION'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revisions / Holds ({stats.revisionsRequested})
          </button>
        </div>

        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Code, Shipper TIN, or Route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* 4. Dossiers List */}
      {filteredDossiers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-200 space-y-3">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">
            {dossiers.length === 0 ? 'No Customs Submissions in Queue' : 'No Matching Customs Submissions Found'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {dossiers.length === 0
              ? 'When Shippers or Freight Forwarders upload trade documents for corridor shipments, they will appear here for officer verification.'
              : 'Try clearing your search query or switching to another filter tab.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDossiers.map((dossier) => {
            const isCleared = dossier.customsStatus === 'CLEARED';
            const isPending = dossier.customsStatus === 'SUBMITTED' || dossier.customsStatus === 'UNDER_REVIEW';
            const isRevision = dossier.customsStatus === 'REVISION_REQUESTED' || dossier.customsStatus === 'REJECTED';

            return (
              <div
                key={dossier.id}
                onClick={() => onSelectDossierForCompliance(dossier)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden bg-white hover:shadow-md ${
                  isCleared
                    ? 'border-emerald-200/80 hover:border-emerald-300'
                    : isRevision
                    ? 'border-rose-200 hover:border-rose-300'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Consignment Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {dossier.loadCode}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isCleared
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isRevision
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isCleared ? '✓ GREEN LINE CLEARED' : isRevision ? '⚠️ REVISION REQUIRED' : '⏳ PENDING REVIEW'}
                      </span>
                      <span
                        className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          dossier.recommendation === 'FAST_TRACK_GREEN'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : dossier.recommendation === 'MANUAL_INSPECTION_YELLOW'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {dossier.recommendation === 'FAST_TRACK_GREEN'
                          ? 'AI Rec: Fast-Track Green Line'
                          : dossier.recommendation === 'MANUAL_INSPECTION_YELLOW'
                          ? 'AI Rec: Inspect Consistency'
                          : 'AI Rec: Incomplete Dossier'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900">
                      {dossier.title}
                    </h3>

                    {/* Route & Cargo Specs */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{dossier.origin} ➔ {dossier.destination}</span>
                      </div>
                      <div className="text-slate-400">•</div>
                      <div>
                        Weight: <strong className="text-slate-900">{dossier.weightTons} Tons</strong> ({dossier.cargoType})
                      </div>
                      <div className="text-slate-400">•</div>
                      <div>
                        Declared Value: <strong className="text-emerald-700 font-mono">{Number(dossier.declaredValueEtb).toLocaleString()} ETB</strong>
                      </div>
                    </div>

                    {/* Shipper & Carrier Details */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dossier.shipperCompany} (TIN: <strong className="font-mono text-slate-700">{dossier.shipperTin}</strong>)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Carrier: <strong className="text-slate-700">{dossier.driverName}</strong> ({dossier.truckPlate})</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Document Presence Badges */}
                  <div className="flex flex-col gap-2 min-w-[240px] p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500">
                      <span>Dossier Completeness:</span>
                      <span className="text-emerald-700 font-black">{dossier.completenessPct}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        dossier.hasInvoice ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {dossier.hasInvoice ? '✓' : '✗'} Commercial Invoice
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        dossier.hasPackingList ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {dossier.hasPackingList ? '✓' : '✗'} Packing List
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        dossier.hasBOL ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {dossier.hasBOL ? '✓' : '✗'} Bill of Lading
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border ${
                        dossier.hasOrigin ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {dossier.hasOrigin ? '✓' : '✗'} Origin Cert
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectDossierForCompliance(dossier)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full"
                    >
                      <span>Inspect Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {!isCleared && (
                      <button
                        type="button"
                        disabled={approvingId === dossier.shipmentId}
                        onClick={(e) => handleQuickApproveClick(e, dossier.shipmentId)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 w-full"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{approvingId === dossier.shipmentId ? 'Clearing...' : 'Fast Green Line'}</span>
                      </button>
                    )}

                    {isCleared && onViewCertificate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewCertificate(dossier.shipmentId);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Release Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
