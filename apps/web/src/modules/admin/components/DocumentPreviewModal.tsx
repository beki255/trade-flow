import React, { useState } from 'react';
import { FileText, CheckCircle2, Download, ExternalLink, Eye } from 'lucide-react';
import { DocumentPreviewData } from '../types';

interface DocumentPreviewModalProps {
  previewDoc: DocumentPreviewData | null;
  onClose: () => void;
}

const createVerifiedPdfBlob = (doc: DocumentPreviewData): Blob => {
  const cleanTitle = (doc.title || 'Document').replace(/[()]/g, '');
  const cleanOwner = (doc.ownerName || 'Verified Entity').replace(/[()]/g, '');
  const cleanNumber = (doc.docNumber || 'N/A').replace(/[()]/g, '');
  const cleanIssuer = (doc.issuer || 'Authority').replace(/[()]/g, '');
  const cleanDate = (doc.issuedDate || '2026').replace(/[()]/g, '');
  const cleanFile = (doc.fileName || 'certificate.pdf').replace(/[()]/g, '');
  const cleanStatus = (doc.status || 'VERIFIED').replace(/[()]/g, '');

  const content = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj
5 0 obj << /Length 350 >> stream
BT
/F1 18 Tf
50 720 Td
(${cleanTitle}) Tj
/F1 12 Tf
0 -35 Td
(Entity / Organization: ${cleanOwner}) Tj
0 -22 Td
(Certificate / Document No: ${cleanNumber}) Tj
0 -22 Td
(Issuing Authority: ${cleanIssuer}) Tj
0 -22 Td
(Issue / Registration Date: ${cleanDate}) Tj
0 -22 Td
(Original File Name: ${cleanFile}) Tj
0 -22 Td
(Verification Status: ${cleanStatus}) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000233 00000 n 
0000000315 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
730
%%EOF`;
  return new Blob([content], { type: 'application/pdf' });
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  previewDoc,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!previewDoc) return null;

  const isPdf = previewDoc.fileUrl?.startsWith('data:application/pdf') || previewDoc.fileName.toLowerCase().endsWith('.pdf');
  const isImage = previewDoc.fileUrl?.startsWith('data:image');

  const handleDownload = () => {
    let url = previewDoc.fileUrl;
    let isBlob = false;

    if (!url || !url.startsWith('data:')) {
      const fallbackBlob = createVerifiedPdfBlob(previewDoc);
      url = URL.createObjectURL(fallbackBlob);
      isBlob = true;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = previewDoc.fileName.endsWith('.pdf') || previewDoc.fileName.endsWith('.png') || previewDoc.fileName.endsWith('.jpg')
      ? previewDoc.fileName
      : `${previewDoc.fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (isBlob) {
      setTimeout(() => URL.revokeObjectURL(url!), 2000);
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleOpenNewTab = () => {
    if (previewDoc.fileUrl && previewDoc.fileUrl.startsWith('data:')) {
      const tab = window.open();
      if (tab) {
        tab.document.write(
          `<html><head><title>${previewDoc.fileName}</title></head><body style="margin:0; background:#0f172a;"><iframe src="${previewDoc.fileUrl}" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none;" allowfullscreen></iframe></body></html>`
        );
      }
    } else {
      const blob = createVerifiedPdfBlob(previewDoc);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
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
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live File Preview (If PDF or Image content available) */}
        {previewDoc.fileUrl && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner">
            {isPdf && (
              <div className="relative w-full h-80 sm:h-96">
                <iframe
                  src={previewDoc.fileUrl}
                  title={previewDoc.fileName}
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            )}
            {isImage && (
              <div className="w-full max-h-80 sm:max-h-96 overflow-auto bg-slate-950 flex items-center justify-center p-3">
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-h-80 object-contain rounded-xl shadow-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Document Scan Sheet / Meta Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
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
              <span className="font-mono text-[11px] text-slate-700 font-bold truncate block">{previewDoc.fileName}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 font-bold">Document Verification Status:</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
              {previewDoc.status}
            </span>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
            ✓ Download started successfully!
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Close Viewer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewTab}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
