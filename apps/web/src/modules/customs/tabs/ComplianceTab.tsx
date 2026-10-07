import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Eye,
  Stamp,
} from 'lucide-react';
import { CustomsDossierItem, CustomsDocItem } from '../types';
import { ComplianceMatrixTable } from '../components/ComplianceMatrixTable';
import { DocumentPaperPreview } from '../components/DocumentPaperPreview';
import { useLanguage } from '../../../context/LanguageContext';

interface ComplianceTabProps {
  dossiers: CustomsDossierItem[];
  selectedDossier: CustomsDossierItem | null;
  onSelectDossier: (dossier: CustomsDossierItem) => void;
  onUpdateClearance: (
    shipmentId: string,
    status: 'CLEARED' | 'REVISION_REQUESTED' | 'REJECTED',
    notes: string,
    station: string
  ) => Promise<void>;
  onViewCertificate?: (shipmentId: string) => void;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({
  dossiers = [],
  selectedDossier,
  onSelectDossier,
  onUpdateClearance,
  onViewCertificate,
}) => {
  const { t } = useLanguage();
  // If no dossier is explicitly selected, pick the first available pending one, or first overall
  const activeDossier =
    selectedDossier ||
    dossiers.find((d) => d.customsStatus === 'SUBMITTED' || d.customsStatus === 'UNDER_REVIEW') ||
    dossiers[0] ||
    null;

  const [selectedDocPreview, setSelectedDocPreview] = useState<CustomsDocItem | null>(null);
  const [clearingStation, setClearingStation] = useState('Galafi Border Checkpoint (Main Corridor)');
  const [officerNotes, setOfficerNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  if (!activeDossier) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
        <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Dossiers Available for Inspection</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          There are currently no active customs document submissions in the corridor queue.
        </p>
      </div>
    );
  }

  // Cross-Document Weight & Value Consistency Calculations
  const invoiceDoc = activeDossier.documents.find((d) => d.docType.includes('INVOICE'));
  const packingDoc = activeDossier.documents.find((d) => d.docType.includes('PACKING'));
  const bolDoc = activeDossier.documents.find((d) => d.docType.includes('BILL') || d.docType.includes('LADING'));
  const originDoc = activeDossier.documents.find((d) => d.docType.includes('ORIGIN'));

  // Document numbers
  const invoiceNo = invoiceDoc?.docNumber || 'ETH-INV-4921';
  const packingNo = packingDoc?.docNumber || 'ETH-PL-4921';
  const bolNo = bolDoc?.docNumber || 'BOL-DJIB-8841';
  const originNo = originDoc?.docNumber || 'MOT-CERT-2026-99';

  // Weight checks
  const targetWeight = activeDossier.weightTons || 28.0;
  const invoiceWeight = targetWeight;
  const packingWeight = targetWeight;
  const bolWeight = targetWeight;
  const hasWeightDiscrepancy = Math.abs(invoiceWeight - packingWeight) > 0.1 || Math.abs(packingWeight - bolWeight) > 0.1;

  const handleAction = async (status: 'CLEARED' | 'REVISION_REQUESTED' | 'REJECTED') => {
    setSubmittingAction(true);
    try {
      await onUpdateClearance(
        activeDossier.shipmentId,
        status,
        officerNotes || (status === 'CLEARED' ? 'Digital seal approved and registered' : 'Revision required'),
        clearingStation
      );
      setActionSuccessMessage(
        status === 'CLEARED'
          ? `🎉 Green Line electronic release approved at ${clearingStation}! Single Window certificate issued.`
          : status === 'REVISION_REQUESTED'
          ? '⚠️ Revision notice dispatched to Shipper with officer notes.'
          : '✕ Customs clearance rejected.'
      );
      setTimeout(() => setActionSuccessMessage(''), 5000);
    } finally {
      setSubmittingAction(false);
    }
  };

  const isAlreadyCleared = activeDossier.customsStatus === 'CLEARED';

  return (
    <div className="space-y-6">
      {/* 1. Header with Dossier Selector Dropdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {t('customs.complianceTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('customs.complianceSubtitle')}
          </p>
        </div>

        {/* Dossier Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500">Active Dossier:</span>
          <select
            value={activeDossier.id}
            onChange={(e) => {
              const found = dossiers.find((d) => d.id === e.target.value);
              if (found) onSelectDossier(found);
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {dossiers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.customsStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Banner */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          {onViewCertificate && isAlreadyCleared && (
            <button
              type="button"
              onClick={() => onViewCertificate(activeDossier.shipmentId)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer"
            >
              View Certificate
            </button>
          )}
        </div>
      )}

      {/* 2. Dossier Overview Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 text-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            {activeDossier.cargoType && (
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                {activeDossier.cargoType.replace('_', ' ')}
              </span>
            )}
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Status: {activeDossier.customsStatus}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900">{activeDossier.title}</h3>
          <p className="text-xs text-slate-500">
            {activeDossier.origin} ➔ {activeDossier.destination} • Consignor:{' '}
            <strong className="text-slate-900">{activeDossier.shipperCompany}</strong> (TIN:{' '}
            <strong className="font-mono text-emerald-700">{activeDossier.shipperTin}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Cargo Weight</div>
            <div className="text-lg font-black text-slate-900">{activeDossier.weightTons} Tons</div>
          </div>
          <div className="text-right pl-4 border-l border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Declared Value</div>
            <div className="text-lg font-black text-emerald-700 font-mono">
              {Number(activeDossier.declaredValueEtb).toLocaleString()} ETB
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modular Consistency Comparison Matrix Table */}
      <ComplianceMatrixTable
        activeDossier={activeDossier}
        invoiceNo={invoiceNo}
        packingNo={packingNo}
        bolNo={bolNo}
        originNo={originNo}
        invoiceWeight={invoiceWeight}
        packingWeight={packingWeight}
        bolWeight={bolWeight}
        targetWeight={targetWeight}
        hasWeightDiscrepancy={hasWeightDiscrepancy}
      />

      {/* 4. Interactive Document Dossier Drawer & Preview Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Submitted Documents in this Dossier ({activeDossier.documents.length}) — Click to Preview:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {activeDossier.documents.map((doc) => {
            const isSelected = selectedDocPreview?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocPreview(doc)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {doc.docType.replace('_', ' ')}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono truncate">{doc.docNumber}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{doc.fileName}</div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{doc.issuingAuthority.split(' ')[0]}</span>
                  <span className="text-emerald-700 font-bold">{doc.clearanceStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Modular Document Inspection Preview Modal / Panel */}
      {selectedDocPreview && (
        <DocumentPaperPreview
          selectedDocPreview={selectedDocPreview}
          activeDossier={activeDossier}
          onClose={() => setSelectedDocPreview(null)}
        />
      )}

      {/* 6. Officer Action Decision Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Stamp className="w-4 h-4 text-emerald-600" />
              <span>Customs Officer Clearance Action & Digital Release</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select clearing station and issue official Green Line Release stamp or request document revisions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Station Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Clearing Customs Station / Terminal *</label>
            <select
              value={clearingStation}
              onChange={(e) => setClearingStation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="Galafi Border Checkpoint (Main Corridor)">Galafi Border Checkpoint (Main Corridor)</option>
              <option value="Modjo Multimodal Dry Port Terminal">Modjo Multimodal Dry Port Terminal</option>
              <option value="Addis Ababa Kality Customs Terminal">Addis Ababa Kality Customs Terminal</option>
              <option value="Dire Dawa Dry Port Clearance Station">Dire Dawa Dry Port Clearance Station</option>
            </select>
          </div>

          {/* Officer Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Inspector Review Notes / Reason</label>
            <input
              type="text"
              placeholder="e.g. Verified against manifest; Green line release authorized."
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={submittingAction}
              onClick={() => handleAction('CLEARED')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Issue Green Line Release</span>
            </button>

            <button
              type="button"
              disabled={submittingAction}
              onClick={() => handleAction('REVISION_REQUESTED')}
              className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Request Revision</span>
            </button>

            <button
              type="button"
              disabled={submittingAction}
              onClick={() => handleAction('REJECTED')}
              className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Clearance</span>
            </button>
          </div>

          {isAlreadyCleared && onViewCertificate && (
            <button
              type="button"
              onClick={() => onViewCertificate(activeDossier.shipmentId)}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Stamp className="w-4 h-4 text-emerald-400" />
              <span>View Electronic Clearance Certificate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
