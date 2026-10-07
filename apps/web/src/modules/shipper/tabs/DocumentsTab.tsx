import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Clock,
  ExternalLink,
  Plus,
  Stamp,
  RefreshCw,
  Info,
  XCircle,
  FileUp,
  FileSpreadsheet,
  Building,
  Scale,
  Calendar,
  DollarSign,
  X,
  Search,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { UploadCustomsDocModal, CustomsDocUploadData } from '../components/UploadCustomsDocModal';

export interface CustomsDoc {
  id: string;
  docType: string;
  docNumber: string;
  fileName: string;
  fileUrl?: string;
  fileSizeKb?: number;
  weightTons?: number;
  declaredValueEtb?: number;
  issuingAuthority: string;
  issueDate?: string;
  clearanceStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CLEARED' | 'REJECTED' | 'REVISION_REQUESTED';
  validationPassed: boolean;
  officerNotes?: string;
  uploadedAt: string;
  shipmentId?: string;
  shipmentTitle?: string;
  loadCode?: string;
}

export const DocumentsTab: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<CustomsDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [availableShipments, setAvailableShipments] = useState<Array<{ id: string; loadCode: string; title: string }>>([]);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload & Resubmission Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CustomsDoc | null>(null);
  const [isResubmissionMode, setIsResubmissionMode] = useState(false);

  // Pre-Submission Automated Consistency Validator State
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Official Release Certificate Viewer Modal State
  const [selectedClearedDoc, setSelectedClearedDoc] = useState<CustomsDoc | null>(null);

  // Fetch real customs documents from backend
  const fetchDocuments = async () => {
    if (!user?.id) return;
    setLoadingDocs(true);
    try {
      const shipperQ = user?.id ? `?shipperId=${encodeURIComponent(user.id)}` : '';
      const res = await fetch(`/api/customs/documents${shipperQ}`);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
          const mapped: CustomsDoc[] = data.documents.map((d: any) => ({
            id: d.id,
            docType: d.docType,
            docNumber: d.docNumber,
            fileName: d.fileName || `${d.docType?.toLowerCase() || 'doc'}_${d.docNumber}.pdf`,
            fileUrl: d.fileUrl,
            fileSizeKb: d.fileSizeKb || 240,
            weightTons: d.shipment?.load?.weightTons || 28.5,
            declaredValueEtb: d.declaredValueEtb || d.shipment?.load?.spotEstimatedPriceEtb || 4200000,
            issuingAuthority: d.issuingAuthority || 'Ethiopian Customs Commission (ECC)',
            issueDate: d.issueDate ? new Date(d.issueDate).toISOString().split('T')[0] : undefined,
            clearanceStatus: d.clearanceStatus || 'SUBMITTED',
            validationPassed: Boolean(d.validationPassed),
            officerNotes: d.officerNotes,
            uploadedAt: new Date(d.uploadedAt || d.createdAt || Date.now()).toLocaleString(),
            shipmentId: d.shipmentId,
            shipmentTitle: d.shipment?.load?.title || 'Corridor Freight Consignment',
            loadCode: d.shipment?.load?.title || 'Corridor Freight Consignment',
          }));
          setDocuments(mapped);
        } else {
          setDocuments([]);
        }
      }
    } catch (err) {
      console.warn('Could not fetch customs documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Fetch shipper consignments to populate upload selector
  const fetchShipments = async () => {
    if (!user?.id && !user?.email) return;
    try {
      const q = user?.id ? `shipperId=${encodeURIComponent(user.id)}` : `shipperEmail=${encodeURIComponent(user.email || '')}`;
      const res = await fetch(`/api/portal/loads?${q}`);
      if (res.ok) {
        const data = await res.json();
        if (data.loads && Array.isArray(data.loads)) {
          const list = data.loads.map((l: any) => ({
            id: l.shipment?.id || l.id,
            loadCode: l.title || 'Freight Consignment',
            title: l.title || 'Freight Consignment',
          }));
          setAvailableShipments(list);
        }
      }
    } catch (err) {
      console.warn('Could not fetch loads for customs modal:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchShipments();
  }, [user?.id]);

  // Run Automated Pre-Submission Consistency Validator
  const handleValidateConsistency = async () => {
    setValidating(true);
    try {
      const commDoc = documents.find((d) => d.docType === 'COMMERCIAL_INVOICE');
      const packDoc = documents.find((d) => d.docType === 'PACKING_LIST');
      const bolDoc = documents.find((d) => d.docType === 'BILL_OF_LADING');
      const originDoc = documents.find((d) => d.docType === 'CERTIFICATE_OF_ORIGIN');

      const res = await fetch('/api/customs/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commercialInvoice: commDoc ? {
            docNumber: commDoc.docNumber,
            weightTons: commDoc.weightTons?.toString(),
            fileName: commDoc.fileName,
            fileSizeKb: commDoc.fileSizeKb,
          } : null,
          packingList: packDoc ? {
            docNumber: packDoc.docNumber,
            weightTons: packDoc.weightTons?.toString(),
            fileName: packDoc.fileName,
            fileSizeKb: packDoc.fileSizeKb,
          } : null,
          billOfLading: bolDoc ? {
            docNumber: bolDoc.docNumber,
            weightTons: bolDoc.weightTons?.toString(),
            fileName: bolDoc.fileName,
            fileSizeKb: bolDoc.fileSizeKb,
          } : null,
          certificateOfOrigin: originDoc ? {
            docNumber: originDoc.docNumber,
            fileName: originDoc.fileName,
            fileSizeKb: originDoc.fileSizeKb,
          } : null,
          documents: documents.map((d) => ({
            docType: d.docType,
            docNumber: d.docNumber,
            fileName: d.fileName,
            fileSizeKb: d.fileSizeKb,
            weightTons: d.weightTons,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setValidationResult(data);
      }
    } catch (e) {
      console.warn('Pre-submission validation error:', e);
    } finally {
      setValidating(false);
    }
  };

  // Upload or Resubmit Form Submit Handler
  const handleModalSubmit = async (formData: CustomsDocUploadData) => {
    setModalLoading(true);
    try {
      if (isResubmissionMode && editingDoc) {
        // Resubmit rejected document
        const res = await fetch(`/api/customs/documents/${editingDoc.id}/resubmit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docNumber: formData.docNumber,
            declaredValueEtb: formData.declaredValueEtb,
            issuingAuthority: formData.issuingAuthority,
            issueDate: formData.issueDate,
            fileName: formData.fileName,
            fileUrl: formData.fileUrl,
            fileSizeKb: formData.fileSizeKb,
            resubmissionNotes: formData.resubmissionNotes,
          }),
        });

        if (res.ok) {
          setSubmitNotice({
            type: 'success',
            message: `✓ Corrected document "${formData.docNumber}" successfully resubmitted to Customs Authority!`,
          });
          setModalOpen(false);
          setIsResubmissionMode(false);
          setEditingDoc(null);
          await fetchDocuments();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to resubmit corrected document.');
        }
      } else {
        // Fresh upload (Draft or Submitted)
        const res = await fetch('/api/customs/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shipmentId: formData.shipmentId,
            docType: formData.docType,
            docNumber: formData.docNumber,
            fileName: formData.fileName,
            fileUrl: formData.fileUrl,
            fileSizeKb: formData.fileSizeKb,
            declaredValueEtb: formData.declaredValueEtb,
            weightTons: formData.weightTons,
            issuingAuthority: formData.issuingAuthority,
            issueDate: formData.issueDate,
            status: formData.status,
            documentId: formData.documentId,
          }),
        });

        if (res.ok) {
          setSubmitNotice({
            type: 'success',
            message: formData.status === 'DRAFT'
              ? `✓ Document "${formData.docNumber}" saved as Draft.`
              : `✓ Document "${formData.docNumber}" uploaded and queued for official customs inspection!`,
          });
          setModalOpen(false);
          setEditingDoc(null);
          await fetchDocuments();
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to save customs document.');
        }
      }
    } catch (err) {
      console.error('Error uploading customs document:', err);
      alert('Could not connect to TradeFlow API. Please verify server connection.');
    } finally {
      setModalLoading(false);
      setTimeout(() => setSubmitNotice(null), 5000);
    }
  };

  // Submit a Draft Document directly
  const handleSubmitDraft = async (docId: string, docNumber: string) => {
    try {
      const res = await fetch(`/api/customs/documents/${docId}/submit`, {
        method: 'POST',
      });
      if (res.ok) {
        setSubmitNotice({
          type: 'success',
          message: `✓ Draft document "${docNumber}" submitted for official inspection!`,
        });
        await fetchDocuments();
        setTimeout(() => setSubmitNotice(null), 4000);
      }
    } catch (err) {
      console.warn('Failed to submit draft:', err);
    }
  };

  // Open Resubmission Modal
  const handleOpenResubmit = (doc: CustomsDoc) => {
    setEditingDoc(doc);
    setIsResubmissionMode(true);
    setModalOpen(true);
  };

  // Filtered documents
  const filteredDocs = documents.filter((d) => {
    if (statusFilter === 'DRAFT' && d.clearanceStatus !== 'NOT_SUBMITTED') return false;
    if (statusFilter === 'SUBMITTED' && d.clearanceStatus !== 'SUBMITTED') return false;
    if (statusFilter === 'UNDER_REVIEW' && d.clearanceStatus !== 'UNDER_REVIEW') return false;
    if (statusFilter === 'CLEARED' && d.clearanceStatus !== 'CLEARED') return false;
    if (statusFilter === 'REJECTED' && d.clearanceStatus !== 'REJECTED' && d.clearanceStatus !== 'REVISION_REQUESTED') return false;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchNum = d.docNumber.toLowerCase().includes(q);
      const matchType = d.docType.toLowerCase().includes(q);
      const matchAuth = d.issuingAuthority.toLowerCase().includes(q);
      const matchNotes = d.officerNotes?.toLowerCase().includes(q);
      return matchNum || matchType || matchAuth || matchNotes;
    }
    return true;
  });

  // Calculate 4 Key Documents Presence
  const invoiceDoc = documents.find((d) => d.docType === 'COMMERCIAL_INVOICE');
  const packingDoc = documents.find((d) => d.docType === 'PACKING_LIST');
  const bolDoc = documents.find((d) => d.docType === 'BILL_OF_LADING');
  const originDoc = documents.find((d) => d.docType === 'CERTIFICATE_OF_ORIGIN');

  const keyDocs = [
    {
      title: 'Commercial Invoice',
      type: 'COMMERCIAL_INVOICE',
      required: true,
      doc: invoiceDoc,
      desc: 'Mandatory FOB/CIF valuation and seller-buyer invoice.',
    },
    {
      title: 'Packing List',
      type: 'PACKING_LIST',
      required: true,
      doc: packingDoc,
      desc: 'Mandatory itemized cargo package & gross weight specification.',
    },
    {
      title: 'Bill of Lading (B/L)',
      type: 'BILL_OF_LADING',
      required: true,
      doc: bolDoc,
      desc: 'Multimodal corridor carrier transit document.',
    },
    {
      title: 'Certificate of Origin',
      type: 'CERTIFICATE_OF_ORIGIN',
      required: false,
      doc: originDoc,
      desc: 'Ministry of Trade & Regional Integration preferential origin seal.',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 sm:p-7 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Digital Trade Documentation & Pre-Submission Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Upload Commercial Invoices, Packing Lists, Bills of Lading, and Origin Certificates. Run automated cross-document weight consistency validation prior to official Galafi Border Customs submission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            type="button"
            onClick={handleValidateConsistency}
            disabled={validating}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${validating ? 'animate-spin' : ''}`} />
            <span>{validating ? 'Auditing...' : 'Run Pre-Check'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingDoc(null);
              setIsResubmissionMode(false);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Trade Document</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {submitNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
          submitNotice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {submitNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{submitNotice.message}</span>
          </div>
          <button onClick={() => setSubmitNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. FOUR KEY TRADE DOCUMENTS STATUS GRID */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            <span>Mandatory International Trade Clearance Documents</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Supported formats: <strong className="text-slate-700">PDF, JPEG, PNG</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {keyDocs.map((item, idx) => {
            const isAttached = Boolean(item.doc);
            const isCleared = item.doc?.clearanceStatus === 'CLEARED';
            const isRejected = item.doc?.clearanceStatus === 'REJECTED' || item.doc?.clearanceStatus === 'REVISION_REQUESTED';
            const isDraft = item.doc?.clearanceStatus === 'NOT_SUBMITTED';

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border bg-white shadow-xs transition-all flex flex-col justify-between ${
                  isCleared
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : isAttached
                    ? 'border-slate-300'
                    : 'border-dashed border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black text-slate-900">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isCleared
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isDraft
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : isAttached
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {isCleared
                        ? 'Cleared'
                        : isRejected
                        ? 'Revision'
                        : isDraft
                        ? 'Draft'
                        : isAttached
                        ? 'Submitted'
                        : 'Missing'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {item.desc}
                  </p>

                  {item.doc && (
                    <div className="pt-1 text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-400 font-sans">Ref:</span>
                        <strong className="text-sky-700">{item.doc.docNumber}</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-400 font-sans">Weight:</span>
                        <span>{item.doc.weightTons} Tons</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span className="font-sans">File:</span>
                        <span className="truncate max-w-[130px]">{item.doc.fileName}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100">
                  {item.doc ? (
                    isRejected ? (
                      <button
                        type="button"
                        onClick={() => handleOpenResubmit(item.doc!)}
                        className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Fix & Resubmit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDoc(item.doc!);
                          setIsResubmissionMode(false);
                          setModalOpen(true);
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Update Document</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDoc({
                          id: '',
                          docType: item.type,
                          docNumber: '',
                          fileName: '',
                          issuingAuthority: 'Ethiopian Customs Commission (ECC)',
                          clearanceStatus: 'SUBMITTED',
                          validationPassed: false,
                          uploadedAt: '',
                        });
                        setIsResubmissionMode(false);
                        setModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-600" />
                      <span>Attach {item.title.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AUTOMATED PRE-SUBMISSION CONSISTENCY AUDIT CARD */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Automated Pre-Submission Consistency Validator
              </h3>
              <p className="text-[11px] text-slate-500">
                Automated multi-point inspection cross-checking weight alignment and document integrity prior to official customs transmission.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleValidateConsistency}
            disabled={validating}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${validating ? 'animate-spin' : ''}`} />
            <span>{validating ? 'Validating Cross-Checks...' : 'Run Consistency Audit'}</span>
          </button>
        </div>

        {validationResult ? (
          <div className="space-y-4">
            {/* Top Status & Completeness Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Document Completeness
                </span>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {validationResult.completenessPct}% Complete
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${validationResult.completenessPct}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Weight Alignment (±0.1T Band)
                </span>
                <div className={`text-lg font-black mt-0.5 flex items-center gap-1.5 ${
                  validationResult.crossChecks?.weightConsistent ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {validationResult.crossChecks?.weightConsistent ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Consistent Across Docs</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Discrepancy: {validationResult.crossChecks?.weightDiscrepancyTons}T</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Invoice vs Packing List vs Bill of Lading
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Format Integrity Check
                </span>
                <div className={`text-lg font-black mt-0.5 flex items-center gap-1.5 ${
                  validationResult.formatCompliance?.allValid ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {validationResult.formatCompliance?.allValid ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>PDF, JPEG, PNG Compliant</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Format Errors Detected</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Files compliant with Ethiopian Customs single-window
                </span>
              </div>
            </div>

            {/* Summary Guidance Banner */}
            <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              validationResult.passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {validationResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{validationResult.summaryGuidance}</span>
            </div>

            {/* Actionable Inline Guidance List */}
            {validationResult.actionableGuidance && validationResult.actionableGuidance.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider block">
                  Actionable Inline Corrections Needed:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {validationResult.actionableGuidance.map((guide: any, gIdx: number) => (
                    <div
                      key={gIdx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        guide.severity === 'ERROR'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {guide.severity === 'ERROR' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span>{guide.document} ({guide.field})</span>
                        </span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-black ${
                          guide.severity === 'ERROR' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                        }`}>
                          {guide.severity}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-700 font-medium">
                        {guide.issue}
                      </p>
                      <div className="text-[11px] font-bold text-sky-800 pt-0.5">
                        ↳ Action: {guide.remedy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            Click <strong>"Run Consistency Audit"</strong> to execute automated cross-document validation on all uploaded trade manifests.
          </div>
        )}
      </div>

      {/* 4. CLEARANCE DOCUMENTS TABLE WITH STATUS WORKFLOW */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        {/* Filter Tabs & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Docs ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'DRAFT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({documents.filter((d) => d.clearanceStatus === 'NOT_SUBMITTED').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'SUBMITTED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Submitted ({documents.filter((d) => d.clearanceStatus === 'SUBMITTED').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CLEARED')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'CLEARED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cleared ({documents.filter((d) => d.clearanceStatus === 'CLEARED').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REJECTED')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revisions / Rejected ({documents.filter((d) => d.clearanceStatus === 'REJECTED' || d.clearanceStatus === 'REVISION_REQUESTED').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-auto md:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Ref No. or Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Documents Table / Card List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Document Type & File</th>
                <th className="py-3 px-3.5">Reference No.</th>
                <th className="py-3 px-3.5">Weight / Value</th>
                <th className="py-3 px-3.5">Issuing Authority</th>
                <th className="py-3 px-3.5">Status & Lifecycle</th>
                <th className="py-3 px-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <div className="font-bold text-slate-700 text-xs">
                      {documents.length === 0
                        ? 'No customs documents uploaded yet'
                        : 'No documents match the current filter or search'}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      Click the "Upload Trade Document" button above to upload Commercial Invoices, Packing Lists, or Bills of Lading.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isCleared = doc.clearanceStatus === 'CLEARED';
                  const isUnderReview = doc.clearanceStatus === 'UNDER_REVIEW';
                  const isSubmitted = doc.clearanceStatus === 'SUBMITTED';
                  const isDraft = doc.clearanceStatus === 'NOT_SUBMITTED';
                  const isRejected = doc.clearanceStatus === 'REJECTED' || doc.clearanceStatus === 'REVISION_REQUESTED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Document Type & Format */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{doc.docType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1 rounded text-slate-600 font-bold uppercase">
                            {doc.fileName.split('.').pop() || 'PDF'}
                          </span>
                          <span className="truncate max-w-[130px]">{doc.fileName}</span>
                          <span>• {doc.fileSizeKb} KB</span>
                        </div>
                      </td>

                      {/* Reference Number & Issue Date */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-black text-sky-700">
                          {doc.docNumber}
                        </div>
                        {doc.issueDate && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{doc.issueDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Weight & Declared Value */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900">
                          {doc.weightTons ? `${doc.weightTons} Tons` : 'N/A'}
                        </div>
                        <div className="text-[10.5px] font-mono font-bold text-emerald-700">
                          ETB {Number(doc.declaredValueEtb || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Issuing Authority */}
                      <td className="py-3.5 px-3.5 text-slate-600 font-medium text-[11px] max-w-[140px] truncate">
                        {doc.issuingAuthority}
                      </td>

                      {/* Clearance Status Badge & Rejection Alert */}
                      <td className="py-3.5 px-3.5">
                        <div>
                          <span
                            className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                              isCleared
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isUnderReview
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : isSubmitted
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isDraft
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isCleared && <Stamp className="w-3 h-3 text-emerald-600" />}
                            {isCleared
                              ? 'Cleared'
                              : isUnderReview
                              ? 'Under Review'
                              : isSubmitted
                              ? 'Submitted'
                              : isDraft
                              ? 'Draft'
                              : 'Revision Required'}
                          </span>

                          {/* Rejection Notice Banner immediately surfaced to shipper */}
                          {isRejected && doc.officerNotes && (
                            <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[10.5px] max-w-xs space-y-0.5">
                              <div className="font-bold flex items-center gap-1 text-rose-700">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>Rejection Reason:</span>
                              </div>
                              <p className="text-[10px] text-rose-800 leading-tight">
                                {doc.officerNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          {isDraft && (
                            <button
                              type="button"
                              onClick={() => handleSubmitDraft(doc.id, doc.docNumber)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleOpenResubmit(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FileUp className="w-3 h-3" />
                              <span>Resubmit</span>
                            </button>
                          )}

                          {isCleared && (
                            <button
                              type="button"
                              onClick={() => setSelectedClearedDoc(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Stamp className="w-3 h-3 text-emerald-600" />
                              <span>Certificate</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingDoc(doc);
                              setIsResubmissionMode(false);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit metadata"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: UPLOAD & RESUBMISSION MODAL */}
      <UploadCustomsDocModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIsResubmissionMode(false);
          setEditingDoc(null);
        }}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
        availableShipments={availableShipments}
        initialData={
          editingDoc
            ? {
                docType: editingDoc.docType,
                docNumber: editingDoc.docNumber,
                weightTons: editingDoc.weightTons?.toString() || '28.5',
                declaredValueEtb: editingDoc.declaredValueEtb?.toString() || '4200000',
                issuingAuthority: editingDoc.issuingAuthority,
                issueDate: editingDoc.issueDate || new Date().toISOString().split('T')[0],
                fileName: editingDoc.fileName,
                fileSizeKb: editingDoc.fileSizeKb || 240,
                fileUrl: editingDoc.fileUrl,
                status: editingDoc.clearanceStatus === 'NOT_SUBMITTED' ? 'DRAFT' : 'SUBMITTED',
                shipmentId: editingDoc.shipmentId,
                documentId: editingDoc.id,
              }
            : null
        }
        isResubmission={isResubmissionMode}
        rejectionReason={editingDoc?.officerNotes}
      />

      {/* 6. MODAL: OFFICIAL RELEASE CERTIFICATE VIEWER */}
      {selectedClearedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Official Green Line Electronic Release
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Ethiopian Customs Clearance Certificate
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedClearedDoc(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                <span className="text-xs font-mono font-bold text-emerald-800">
                  ECC-CLR-{selectedClearedDoc.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-600 text-white">
                  Release Authorized ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-bold">Document</span>
                  <span className="font-bold text-slate-900">{selectedClearedDoc.docType.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-bold">Reference Number</span>
                  <span className="font-mono font-bold text-sky-800">{selectedClearedDoc.docNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-bold">Cleared Weight</span>
                  <span className="font-bold text-slate-900">{selectedClearedDoc.weightTons || 28.5} Tons</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-bold">Declared Valuation</span>
                  <span className="font-mono font-bold text-emerald-800">
                    ETB {Number(selectedClearedDoc.declaredValueEtb || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/80 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Issuing Border Station:</span>
                  <span className="text-slate-800 font-bold">Galafi Main Border Checkpoint</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inspector Verification:</span>
                  <span className="text-emerald-800 font-bold">ECC-884 Digital Stamp Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clearing Timestamp:</span>
                  <span className="text-slate-300 font-mono text-[10px]">{selectedClearedDoc.uploadedAt}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block mb-0.5">Inspector Review Notes:</span>
              <p className="text-[11.5px] italic text-slate-700">
                "{selectedClearedDoc.officerNotes || 'Green Line transit release authorized under single-window protocol.'}"
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedClearedDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
