import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Calendar,
  DollarSign,
  Building,
  Scale,
  FileUp,
} from 'lucide-react';

export interface CustomsDocUploadData {
  docType: string;
  docNumber: string;
  weightTons: string;
  declaredValueEtb: string;
  issuingAuthority: string;
  issueDate: string;
  fileName: string;
  fileUrl: string;
  fileSizeKb: number;
  status: 'DRAFT' | 'SUBMITTED';
  shipmentId?: string;
  resubmissionNotes?: string;
  documentId?: string;
}

interface UploadCustomsDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomsDocUploadData) => Promise<void>;
  loading?: boolean;
  availableShipments?: Array<{ id: string; loadCode: string; title: string }>;
  initialData?: Partial<CustomsDocUploadData> | null;
  isResubmission?: boolean;
  rejectionReason?: string;
}

export const UploadCustomsDocModal: React.FC<UploadCustomsDocModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  availableShipments = [],
  initialData,
  isResubmission = false,
  rejectionReason,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState(initialData?.docType || 'COMMERCIAL_INVOICE');
  const [docNumber, setDocNumber] = useState(initialData?.docNumber || '');
  const [weightTons, setWeightTons] = useState(initialData?.weightTons || '');
  const [declaredValueEtb, setDeclaredValueEtb] = useState(initialData?.declaredValueEtb || '');
  const [issuingAuthority, setIssuingAuthority] = useState(
    initialData?.issuingAuthority || 'Ethiopian Shipping & Logistics'
  );
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate || new Date().toISOString().split('T')[0]
  );
  const [selectedShipmentId, setSelectedShipmentId] = useState(
    initialData?.shipmentId || availableShipments[0]?.id || ''
  );
  const [resubmissionNotes, setResubmissionNotes] = useState('');

  // Attached file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(initialData?.fileName || '');
  const [fileSizeKb, setFileSizeKb] = useState(initialData?.fileSizeKb || 0);
  const [fileFormatError, setFileFormatError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Sync state if initialData changes
  React.useEffect(() => {
    if (initialData) {
      if (initialData.docType) setDocType(initialData.docType);
      if (initialData.docNumber) setDocNumber(initialData.docNumber);
      if (initialData.weightTons) setWeightTons(initialData.weightTons);
      if (initialData.declaredValueEtb) setDeclaredValueEtb(initialData.declaredValueEtb);
      if (initialData.issuingAuthority) setIssuingAuthority(initialData.issuingAuthority);
      if (initialData.issueDate) setIssueDate(initialData.issueDate);
      if (initialData.fileName) setFileName(initialData.fileName);
      if (initialData.fileSizeKb) setFileSizeKb(initialData.fileSizeKb);
      if (initialData.shipmentId) setSelectedShipmentId(initialData.shipmentId);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.jpeg', '.jpg', '.png'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setFileFormatError(`Invalid format "${file.name.split('.').pop()}". TradeFlow supports PDF, JPEG, and PNG trade documents.`);
      setSelectedFile(null);
      setFileName('');
      setFileSizeKb(0);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFileFormatError('File size exceeds 15MB limit. Please compress or optimize the file.');
      setSelectedFile(null);
      setFileName('');
      setFileSizeKb(0);
      return;
    }

    setFileFormatError(null);
    setSelectedFile(file);
    setFileName(file.name);
    setFileSizeKb(Math.round(file.size / 1024));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (!docNumber.trim()) {
      alert('Document Reference Number is required.');
      return;
    }

    // Default simulated URL or real base64
    const resolvedUrl = selectedFile
      ? `https://tradeflow.et/docs/${encodeURIComponent(fileName || docNumber)}`
      : initialData?.fileUrl || `https://tradeflow.et/docs/${docNumber}.pdf`;

    await onSubmit({
      docType,
      docNumber: docNumber.trim(),
      weightTons: weightTons || '28.5',
      declaredValueEtb: declaredValueEtb || '4200000',
      issuingAuthority,
      issueDate,
      fileName: fileName || `${docType.toLowerCase()}_${docNumber.trim()}.pdf`,
      fileUrl: resolvedUrl,
      fileSizeKb: fileSizeKb || 240,
      status,
      shipmentId: selectedShipmentId || undefined,
      resubmissionNotes: isResubmission ? resubmissionNotes : undefined,
      documentId: initialData?.documentId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isResubmission ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isResubmission ? <FileUp className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {isResubmission ? 'Update Consignment Document' : 'Upload Consignment Document'}
              </h3>
              <p className="text-xs text-slate-500">
                Attach trade invoices, packing lists, or bills of lading for freight transit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resubmission Rejection Reason Alert */}
        {isResubmission && rejectionReason && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Document Revision Notice</span>
            </div>
            <p className="text-[11.5px] text-rose-700 leading-relaxed pl-5">
              {rejectionReason}
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4 text-xs">
          {/* Associated Consignment Selector */}
          {availableShipments.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Consignment / Shipment *
              </label>
              <select
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 outline-none focus:border-sky-600"
              >
                {availableShipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Document Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Document Type *
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 outline-none focus:border-sky-600"
            >
              <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
              <option value="PACKING_LIST">Packing List</option>
              <option value="BILL_OF_LADING">Bill of Lading (B/L)</option>
              <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
              <option value="CONSIGNMENT_WAYBILL">Consignment Waybill / Proof of Dispatch</option>
              <option value="INSURANCE_CERTIFICATE">Transit Insurance Certificate (GIT)</option>
            </select>
          </div>

          {/* Document Number & Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Document Reference Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. INV-2026-9901 or BL-ETH-884"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 outline-none focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Issue Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-sky-600"
                />
              </div>
            </div>
          </div>

          {/* Declared Weight & Declared Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Declared Cargo Weight (Tons) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 28.5"
                value={weightTons}
                onChange={(e) => setWeightTons(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 outline-none focus:border-sky-600"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Must align within ±0.1T across Invoice, Packing List, and B/L.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Declared Value (ETB) *</span>
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 4200000"
                value={declaredValueEtb}
                onChange={(e) => setDeclaredValueEtb(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 outline-none focus:border-sky-600"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Total declared cargo value for this document.
              </span>
            </div>
          </div>

          {/* Issuing Authority */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Issuing Authority / Agency</span>
            </label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              placeholder="e.g. Ethiopian Shipping & Logistics, Ministry of Trade"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-sky-600"
            />
          </div>

          {/* Resubmission Notes if Applicable */}
          {isResubmission && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Revision Notes *
              </label>
              <textarea
                rows={2}
                value={resubmissionNotes}
                onChange={(e) => setResubmissionNotes(e.target.value)}
                placeholder="Explain the changes made (e.g. Harmonized gross weight to 28.5T and attached corrected B/L copy)."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 outline-none focus:border-sky-600"
              />
            </div>
          )}

          {/* Drag & Drop File Upload Area */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Attach Clearance Document File *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/60'
                  : fileName
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
              }`}
            >
              {fileName ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {fileName}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">
                      {fileName.split('.').pop()?.toUpperCase()}
                    </span>
                    <span>{fileSizeKb} KB</span>
                    <span className="text-emerald-600 font-bold">✓ Ready for Pre-Validation</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-1 text-[11px] text-sky-600 hover:text-sky-700 font-bold underline"
                  >
                    Replace File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <div className="font-bold text-slate-800 text-xs">
                    Click to browse or drag & drop document
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Supported formats: <strong className="text-slate-700">PDF, JPEG, PNG</strong> (Max 15MB)
                  </div>
                </div>
              )}
            </div>

            {fileFormatError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{fileFormatError}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading || !docNumber.trim()}
              onClick={() => handleFormSubmit('DRAFT')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading || !docNumber.trim()}
              onClick={() => handleFormSubmit('SUBMITTED')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Uploading...' : 'Upload Document'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
