import React from 'react';
import { FileText, Stamp } from 'lucide-react';
import { CustomsDocItem, CustomsDossierItem } from '../types';

interface DocumentPaperPreviewProps {
  selectedDocPreview: CustomsDocItem;
  activeDossier: CustomsDossierItem;
  onClose: () => void;
}

export const DocumentPaperPreview: React.FC<DocumentPaperPreviewProps> = ({
  selectedDocPreview,
  activeDossier,
  onClose,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-300 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-emerald-600" />
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Document Preview: {selectedDocPreview.docType.replace('_', ' ')} ({selectedDocPreview.docNumber})
            </h4>
            <p className="text-[11px] text-slate-500">
              Issuing Authority: {selectedDocPreview.issuingAuthority} • Uploaded:{' '}
              {new Date(selectedDocPreview.uploadedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-200 cursor-pointer"
        >
          ✕ Close Preview
        </button>
      </div>

      {/* Simulated Official Document Sheet */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 max-w-2xl mx-auto shadow-sm space-y-4">
        <div className="text-center border-b border-slate-100 pb-4 space-y-1">
          <div className="text-xs font-black text-slate-900 tracking-widest uppercase">
            FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
          </div>
          <div className="text-sm font-black text-emerald-800">
            {selectedDocPreview.issuingAuthority.toUpperCase()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            DOCUMENT REF: {selectedDocPreview.docNumber}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Consignor (Shipper)</span>
            <div className="font-bold text-slate-800">{activeDossier.shipperCompany}</div>
            <div className="text-slate-500 font-mono text-[11px]">TIN: {activeDossier.shipperTin}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Destination & Port</span>
            <div className="font-bold text-slate-800">{activeDossier.destination}</div>
            <div className="text-slate-500 text-[11px]">Route: {activeDossier.origin}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Cargo Description</span>
            <div className="font-bold text-slate-800">{activeDossier.title} ({activeDossier.cargoType})</div>
            <div className="text-slate-500 text-[11px]">Declared Weight: {activeDossier.weightTons} Tons</div>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Declared Customs Value</span>
            <div className="font-bold text-emerald-700 font-mono text-sm">
              {Number(selectedDocPreview.declaredValueEtb || activeDossier.declaredValueEtb).toLocaleString()} ETB
            </div>
          </div>
        </div>

        {/* Official Digital Stamp Box */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">
            Verification Hash:{' '}
            <span className="font-mono text-slate-600">
              0x{selectedDocPreview.id.replace(/-/g, '').slice(0, 16)}
            </span>
          </div>
          <div className="px-3 py-1 rounded-md border border-emerald-600 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Stamp className="w-3.5 h-3.5 text-emerald-600" />
            <span>ECC OFFICIAL STAMP VALID</span>
          </div>
        </div>
      </div>
    </div>
  );
};
