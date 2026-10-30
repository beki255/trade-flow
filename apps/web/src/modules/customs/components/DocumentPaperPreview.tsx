import React, { useState } from 'react';
import { FileText, Stamp, Download, Paperclip, ExternalLink, Eye, ShieldCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'FILE' | 'SHEET'>('FILE');

  const isImageFile =
    Boolean(selectedDocPreview.fileUrl?.startsWith('data:image')) ||
    Boolean(selectedDocPreview.fileName?.match(/\.(jpeg|jpg|png|webp|gif)$/i)) ||
    Boolean(selectedDocPreview.fileUrl?.match(/\.(jpeg|jpg|png|webp|gif)$/i));

  const isPdfFile =
    Boolean(selectedDocPreview.fileUrl?.startsWith('data:application/pdf')) ||
    Boolean(selectedDocPreview.fileName?.match(/\.pdf$/i)) ||
    Boolean(selectedDocPreview.fileUrl?.match(/\.pdf$/i));

  return (
    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-300 space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              {selectedDocPreview.docType.replace('_', ' ')}: {selectedDocPreview.docNumber}
            </h4>
            <p className="text-[11px] text-slate-500">
              Authority: {selectedDocPreview.issuingAuthority} • File: {selectedDocPreview.fileName} ({selectedDocPreview.fileSizeKb || 93} KB)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('FILE')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'FILE'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Shipper Uploaded File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SHEET')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'SHEET'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ECC Declaration</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-xl hover:bg-slate-200 cursor-pointer transition"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Mode 1: Real Uploaded Shipper File View */}
      {activeTab === 'FILE' ? (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 max-w-3xl mx-auto shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm text-slate-900">{selectedDocPreview.fileName}</span>
              <span className="text-xs text-slate-400 font-mono">({selectedDocPreview.fileSizeKb || 93} KB)</span>
            </div>

            {selectedDocPreview.fileUrl && (
              <a
                href={selectedDocPreview.fileUrl}
                target="_blank"
                rel="noreferrer"
                download={selectedDocPreview.fileName}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Attachment</span>
              </a>
            )}
          </div>

          {/* Real Uploaded Image Display */}
          {isImageFile && selectedDocPreview.fileUrl && !selectedDocPreview.fileUrl.startsWith('https://tradeflow.et') ? (
            <div className="flex flex-col items-center justify-center p-3 bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden">
              <img
                src={selectedDocPreview.fileUrl}
                alt={selectedDocPreview.fileName}
                className="max-h-[500px] max-w-full rounded-lg shadow-md object-contain bg-white"
              />
            </div>
          ) : isPdfFile && selectedDocPreview.fileUrl && !selectedDocPreview.fileUrl.startsWith('https://tradeflow.et') ? (
            <iframe
              src={selectedDocPreview.fileUrl}
              title={selectedDocPreview.fileName}
              className="w-full h-[500px] rounded-xl border border-slate-200"
            />
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-800">{selectedDocPreview.fileName}</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Verified trade document attachment submitted by Shipper ({activeDossier.shipperCompany}).
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Official ECC Declaration Sheet */
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
      )}
    </div>
  );
};
