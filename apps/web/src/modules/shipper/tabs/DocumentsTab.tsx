import React from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export const DocumentsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Customs Document Vault
        </h2>
        <button className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>
      <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
        <FileText className="w-8 h-8 text-slate-400 mx-auto" />
        <div className="text-xs font-bold text-slate-700">
          No documents uploaded yet
        </div>
        <p className="text-[11px] text-slate-500">
          Upload Bill of Lading, Commercial Invoice, Packing lists, and Certificate of Origin for instant customs coordination.
        </p>
      </div>
    </div>
  );
};
