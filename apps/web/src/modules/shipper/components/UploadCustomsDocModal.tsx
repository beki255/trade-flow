import React from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadCustomsDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  docType: string;
  setDocType: (val: string) => void;
  docNumber: string;
  setDocNumber: (val: string) => void;
  weightTons: string;
  setWeightTons: (val: string) => void;
  declaredValue: string;
  setDeclaredValue: (val: string) => void;
  issuingAuthority: string;
  setIssuingAuthority: (val: string) => void;
}

export const UploadCustomsDocModal: React.FC<UploadCustomsDocModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  docType,
  setDocType,
  docNumber,
  setDocNumber,
  weightTons,
  setWeightTons,
  declaredValue,
  setDeclaredValue,
  issuingAuthority,
  setIssuingAuthority,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900">Upload International Trade Document</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Category *</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none"
            >
              <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
              <option value="PACKING_LIST">Packing List (Containerized)</option>
              <option value="BILL_OF_LADING">Bill of Lading (B/L)</option>
              <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
              <option value="TRANSIT_PERMIT">Galafi Customs Transit Permit</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Reference Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. INV-2026-9901 or BL-ETH-884"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Declared Weight (Tons) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightTons}
                onChange={(e) => setWeightTons(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Declared Value (ETB)</label>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Issuing Authority / Regulatory Body</label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-1">
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-700">Attach Document File (PDF, PNG, JPEG)</div>
            <div className="text-[10px] text-slate-400">Maximum file size 15MB</div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
            >
              Submit for Clearance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
