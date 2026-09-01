import React from 'react';
import { FileText, CheckCircle2, Download } from 'lucide-react';
import { DocumentPreviewData } from '../types';

interface DocumentPreviewModalProps {
  previewDoc: DocumentPreviewData | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  previewDoc,
  onClose,
}) => {
  if (!previewDoc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {previewDoc.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {previewDoc.issuer}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Document Scan Sheet */}
        <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2.5">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Registered Entity:</span>
            <span className="font-extrabold text-slate-900">{previewDoc.ownerName}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Certificate / License No:</span>
              <span className="font-mono font-black text-sky-700">{previewDoc.docNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Issuing Authority:</span>
              <span className="font-semibold text-slate-800">{previewDoc.issuer}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Issue / Registration Date:</span>
              <span className="font-semibold text-slate-800">{previewDoc.issuedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Document File Name:</span>
              <span className="font-mono text-[11px] text-slate-600">{previewDoc.fileName}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 font-bold">Government Database Seal Match:</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
              {previewDoc.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            Close Viewer
          </button>
          <button
            onClick={() => {
              alert(`Opening verified document: ${previewDoc.fileName}`);
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Original PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
