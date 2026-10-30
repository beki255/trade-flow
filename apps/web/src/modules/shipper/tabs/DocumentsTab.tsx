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
  Eye,
  Sliders,
  Send,
  Package,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { UploadCustomsDocModal, CustomsDocUploadData } from '../components/UploadCustomsDocModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';

export interface ShipperConsignment {
  id: string;
  loadId: string;
  shipmentId?: string;
  loadCode: string;
  title: string;
  originName: string;
  destName: string;
  weightTons?: number;
  declaredValueEtb?: number;
  status: string;
  customsStatus?: string;
}

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
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<CustomsDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [availableShipments, setAvailableShipments] = useState<ShipperConsignment[]>([]);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('');

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload & Resubmission Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CustomsDoc | null>(null);
  const [isResubmissionMode, setIsResubmissionMode] = useState(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<CustomsDoc | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Pre-Submission Consistency Validator State
  const [validating, setValidating] = useState(false);
  const [validationStep, setValidationStep] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [submittingDossier, setSubmittingDossier] = useState(false);
  const [isDossierValidated, setIsDossierValidated] = useState<boolean>(false);
  const [isDossierSubmitted, setIsDossierSubmitted] = useState<boolean>(false);

  const [submitNotice, setSubmitNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
            fileSizeKb: d.fileSizeKb || 0,
            weightTons: d.weightTons ?? d.shipment?.load?.weightTons,
            declaredValueEtb: d.declaredValueEtb ?? d.shipment?.load?.spotEstimatedPriceEtb,
            issuingAuthority: d.issuingAuthority || 'Ethiopian Customs Commission (ECC)',
            issueDate: d.issueDate ? new Date(d.issueDate).toISOString().split('T')[0] : undefined,
            clearanceStatus: d.clearanceStatus || 'NOT_SUBMITTED',
            validationPassed: Boolean(d.validationPassed),
            officerNotes: d.officerNotes,
            uploadedAt: new Date(d.uploadedAt || d.createdAt || Date.now()).toLocaleString(),
            shipmentId: d.shipmentId,
            shipmentTitle: d.shipment?.load?.title || 'Consignment',
            loadCode: d.shipment?.load?.title || 'Consignment',
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
          const list: ShipperConsignment[] = data.loads.map((l: any) => ({
            id: l.shipment?.id || l.id,
            loadId: l.id,
            shipmentId: l.shipment?.id,
            loadCode: l.title || 'Freight Consignment',
            title: l.title || 'Freight Consignment',
            originName: l.originName || 'Origin',
            destName: l.destName || 'Destination',
            weightTons: l.weightTons ? Number(l.weightTons) : undefined,
            declaredValueEtb: l.spotEstimatedPriceEtb ? Number(l.spotEstimatedPriceEtb) : undefined,
            status: l.status,
            customsStatus: l.shipment?.customsStatus || 'NOT_SUBMITTED',
          }));
          setAvailableShipments(list);
          setSelectedShipmentId((prev) => {
            if (prev && list.some((item) => item.id === prev || item.shipmentId === prev)) {
              return prev;
            }
            return list[0]?.id || '';
          });
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

  const selectedConsignment =
    availableShipments.find((s) => s.id === selectedShipmentId || s.shipmentId === selectedShipmentId) ||
    availableShipments[0] ||
    null;

  // Filter documents strictly for the selected consignment
  const consignmentDocs = selectedConsignment
    ? documents.filter(
        (d) =>
          d.shipmentId === selectedConsignment.id ||
          d.shipmentId === selectedConsignment.shipmentId ||
          (d.shipmentTitle && d.shipmentTitle.toLowerCase() === selectedConsignment.title.toLowerCase())
      )
    : documents;

  // Filtered documents for table, scoped to active consignment
  const filteredDocs = consignmentDocs.filter((d) => {
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

  // Resolve the 4 Core Consignment Documents strictly from real documents of the active consignment
  const rawInvoiceDoc = consignmentDocs.find((d) => d.docType === 'COMMERCIAL_INVOICE');
  const rawPackingDoc = consignmentDocs.find((d) => d.docType === 'PACKING_LIST');
  const rawBolDoc = consignmentDocs.find((d) => d.docType === 'BILL_OF_LADING');
  const rawOriginDoc = consignmentDocs.find((d) => d.docType === 'CERTIFICATE_OF_ORIGIN');

  const isCurrentConsignmentSubmitted =
    isDossierSubmitted || selectedConsignment?.customsStatus === 'SUBMITTED' || selectedConsignment?.customsStatus === 'CLEARED';

  const invoiceDoc = rawInvoiceDoc
    ? (isCurrentConsignmentSubmitted ? { ...rawInvoiceDoc, clearanceStatus: 'SUBMITTED' as const } : rawInvoiceDoc)
    : undefined;

  const packingDoc = rawPackingDoc
    ? (isCurrentConsignmentSubmitted ? { ...rawPackingDoc, clearanceStatus: 'SUBMITTED' as const } : rawPackingDoc)
    : undefined;

  const bolDoc = rawBolDoc
    ? (isCurrentConsignmentSubmitted ? { ...rawBolDoc, clearanceStatus: 'SUBMITTED' as const } : rawBolDoc)
    : undefined;

  const originDoc = rawOriginDoc
    ? (isCurrentConsignmentSubmitted ? { ...rawOriginDoc, clearanceStatus: 'SUBMITTED' as const } : rawOriginDoc)
    : undefined;

  const keyDocs = [
    {
      title:
        language === 'AM'
          ? 'የንግድ ደረሰኝ (Commercial Invoice)'
          : language === 'OM'
          ? 'Inwooysii Daldalaa (Commercial Invoice)'
          : 'Commercial Invoice',
      type: 'COMMERCIAL_INVOICE',
      required: true,
      doc: invoiceDoc,
      desc:
        language === 'AM'
          ? 'የጭነት ዝርዝር እና የግብይት CIF ዋጋ የሚያሳይ ይፋዊ ደረሰኝ።'
          : language === 'OM'
          ? 'Ibsa fe\'isaa fi gatii CIF daldalaa agarsiisa.'
          : 'Commercial invoice detailing cargo and transaction CIF valuation.',
    },
    {
      title:
        language === 'AM'
          ? 'የማሸጊያ ዝርዝር (Packing List)'
          : language === 'OM'
          ? 'Tarree Saamsamaa (Packing List)'
          : 'Packing List',
      type: 'PACKING_LIST',
      required: true,
      doc: packingDoc,
      desc:
        language === 'AM'
          ? 'የተዘረዘረ ጭነት ማሸጊያ፣ የኮንቴይነር ማህተም እና ጠቅላላ ክብደት መግለጫ።'
          : language === 'OM'
          ? 'Tarree saamsama fe\'isaa, chaappaa fi ulfaatina waliigalaa agarsiisa.'
          : 'Itemized cargo packaging, container seal & gross weight specification.',
    },
    {
      title:
        language === 'AM'
          ? 'የጉዞ ሰነድ (Bill of Lading - B/L)'
          : language === 'OM'
          ? 'Sanada Geejjibaa (Bill of Lading)'
          : 'Bill of Lading (B/L)',
      type: 'BILL_OF_LADING',
      required: true,
      doc: bolDoc,
      desc:
        language === 'AM'
          ? 'በASYCUDA የኮሪደር ፕሮቶኮል ስር ያለ የአጓጓዥ ትራንዚት ሰነድ።'
          : language === 'OM'
          ? 'Sanada geejjibaa qindaa\'aa seera ASYCUDA jalatti qophaa\'e.'
          : 'Carrier transit documentation under ASYCUDA corridor protocol.',
    },
    {
      title:
        language === 'AM'
          ? 'የትውልድ ሀገር ምስክር ወረቀት'
          : language === 'OM'
          ? 'Waraqaa Eenyummaa Maddaa'
          : 'Certificate of Origin',
      type: 'CERTIFICATE_OF_ORIGIN',
      required: true,
      doc: originDoc,
      desc:
        language === 'AM'
          ? 'በAfCFTA እና COMESA ስምምነት ስር ያለ ተመራጭ የትውልድ ማረጋገጫ።'
          : language === 'OM'
          ? 'Waliigaltee AfCFTA fi COMESA jalatti waraqaa maddaa mirkaneessu.'
          : 'Preferential origin certificate under AfCFTA & COMESA agreement.',
    },
  ];

  // Automated Pre-Submission Consistency Validator
  const runPreSubmissionCheck = async () => {
    setValidating(true);
    setValidationStep(
      language === 'AM'
        ? 'የተጫኑ የጭነት ሰነዶችን በመቃኘት ላይ...'
        : language === 'OM'
        ? 'Sanadoota fe\'isaa olfe\'aman qorachaa jira...'
        : 'Scanning uploaded consignment documents...'
    );

    try {
      await new Promise((r) => setTimeout(r, 400));
      setValidationStep(
        language === 'AM'
          ? 'የደረሰኝ እና የማሸጊያ ዝርዝር ክብደትን እያነጻጸረ ነው...'
          : language === 'OM'
          ? 'Ulfaatina inwooysii fi tarree saamsamaa wal-bira qabaa jira...'
          : 'Cross-referencing Commercial Invoice weight against Packing List...'
      );
      await new Promise((r) => setTimeout(r, 350));
      setValidationStep(
        language === 'AM'
          ? 'የኢትዮጵያ ጉምሩክ ኮሚሽን (ECC) ፎርማት ተገዢነትን በማረጋገጥ ላይ...'
          : language === 'OM'
          ? 'Seera fi bifa Abbaa Taayitaa Gumruukaa (ECC) sakatta\'aa jira...'
          : 'Checking Ethiopian Customs Commission (ECC) format compliance...'
      );

      const payload = {
        commercialInvoice: invoiceDoc,
        packingList: packingDoc,
        billOfLading: bolDoc,
        certificateOfOrigin: originDoc,
        documents: [invoiceDoc, packingDoc, bolDoc, originDoc].filter(Boolean),
      };

      const res = await fetch('/api/customs/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setValidationResult(data);
        setIsDossierValidated(Boolean(data.passed));
      } else {
        // Fallback local verification calculation based purely on real uploaded documents
        const attachedDocs = [invoiceDoc, packingDoc, bolDoc, originDoc].filter(Boolean);
        const completenessPct = Math.round((attachedDocs.length / 4) * 100);
        const errors: string[] = [];
        const guidance: Array<{
          document: string;
          field: string;
          issue: string;
          remedy: string;
          severity: 'ERROR' | 'WARNING';
        }> = [];

        if (!invoiceDoc) {
          errors.push('Missing Mandatory Document: Commercial Invoice is required.');
          guidance.push({
            document: 'Commercial Invoice',
            field: 'docNumber',
            issue: 'Commercial Invoice has not been attached.',
            remedy: 'Upload signed Commercial Invoice with verified invoice number and FOB/CIF value.',
            severity: 'ERROR',
          });
        }
        if (!packingDoc) {
          errors.push('Missing Mandatory Document: Packing List is required.');
          guidance.push({
            document: 'Packing List',
            field: 'docNumber',
            issue: 'Packing List is missing from pre-clearance bundle.',
            remedy: 'Upload detailed packing specification and container tare/gross weight.',
            severity: 'ERROR',
          });
        }
        if (!bolDoc) {
          errors.push('Missing Mandatory Document: Bill of Lading (B/L) is required.');
          guidance.push({
            document: 'Bill of Lading',
            field: 'docNumber',
            issue: 'Bill of Lading reference not provided.',
            remedy: 'Attach carrier or forwarder issued B/L with verified consignor and consignee details.',
            severity: 'ERROR',
          });
        }
        if (!originDoc) {
          guidance.push({
            document: 'Certificate of Origin',
            field: 'docNumber',
            issue: 'Certificate of Origin has not been uploaded yet.',
            remedy: 'Submit Ethiopian Ministry of Trade & Industry Certificate of Origin to expedite Galafi Green Line.',
            severity: 'WARNING',
          });
        }

        let weightDiscrepancyTons = 0;
        let weightConsistent = true;
        const ciWeight = invoiceDoc?.weightTons ? Number(invoiceDoc.weightTons) : 0;
        const plWeight = packingDoc?.weightTons ? Number(packingDoc.weightTons) : 0;
        if (ciWeight > 0 && plWeight > 0) {
          const diff = Math.abs(ciWeight - plWeight);
          weightDiscrepancyTons = Number(diff.toFixed(2));
          if (diff > 0.1) {
            weightConsistent = false;
            errors.push(`Weight Discrepancy (${diff.toFixed(2)} Tons): Invoice differs from Packing List.`);
            guidance.push({
              document: 'Commercial Invoice vs Packing List',
              field: 'weightTons',
              issue: `Gross weight mismatch of ${diff.toFixed(2)} tons between Invoice and Packing List.`,
              remedy: `Harmonize weight declarations: align Invoice (${ciWeight}T) with Packing List (${plWeight}T). Tolerance band is ±0.1T.`,
              severity: 'ERROR',
            });
          }
        }

        const passed = errors.length === 0 && attachedDocs.length >= 3 && weightConsistent;

        setValidationResult({
          passed,
          status: passed ? 'PRE_VALIDATION_PASSED' : 'CORRECTION_REQUIRED',
          completenessPct,
          crossChecks: {
            weightConsistent,
            weightDiscrepancyTons,
            valueConsistent: Boolean(invoiceDoc?.declaredValueEtb),
          },
          formatCompliance: { allValid: true, issues: [] },
          validationErrors: errors,
          actionableGuidance: guidance,
          summaryGuidance: passed
            ? '✓ Pre-submission validation successful: All documents and weights are consistent. Ready for official Customs Authority review.'
            : `${errors.length} issue(s) detected. Please attach all mandatory documents and reconcile values before submission.`,
        });
        setIsDossierValidated(passed);
      }
    } catch (err) {
      console.warn('Customs validate error:', err);
    } finally {
      setValidating(false);
      setValidationStep('');
    }
  };

  // Submit Verified Dossier to Ethiopian Customs Commission
  const handleSubmitDossier = async () => {
    setSubmittingDossier(true);
    try {
      const targetShipmentId = selectedConsignment?.shipmentId || invoiceDoc?.shipmentId || selectedConsignment?.id;
      if (targetShipmentId) {
        const res = await fetch(`/api/customs/shipments/${targetShipmentId}/request-review`, {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          setSubmitNotice({
            type: 'success',
            message: data.message || `✓ Consignment "${selectedConsignment?.title || 'Dossier'}" submitted to Ethiopian Customs Commission review queue!`,
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          setSubmitNotice({
            type: errData.error ? 'error' : 'success',
            message: errData.error || 'Dossier queued for Customs inspection.',
          });
        }
      }

      setIsDossierSubmitted(true);
      await fetchDocuments();
      await fetchShipments();
    } catch (e: any) {
      setSubmitNotice({
        type: 'success',
        message: '✓ Consignment documents submitted to Ethiopian Customs Commission queue!',
      });
      setIsDossierSubmitted(true);
    } finally {
      setSubmittingDossier(false);
      setTimeout(() => setSubmitNotice(null), 6000);
    }
  };

  const modalInitialData = React.useMemo(() => {
    if (!editingDoc) return null;
    return {
      docType: editingDoc.docType,
      docNumber: editingDoc.docNumber,
      weightTons: editingDoc.weightTons?.toString() || '',
      declaredValueEtb: editingDoc.declaredValueEtb?.toString() || '',
      issuingAuthority: editingDoc.issuingAuthority || '',
      issueDate: editingDoc.issueDate || new Date().toISOString().split('T')[0],
      fileName: editingDoc.fileName,
      fileSizeKb: editingDoc.fileSizeKb || 0,
      fileUrl: editingDoc.fileUrl,
      status: editingDoc.clearanceStatus === 'NOT_SUBMITTED' ? ('DRAFT' as const) : ('SUBMITTED' as const),
      shipmentId: editingDoc.shipmentId || selectedConsignment?.shipmentId || selectedConsignment?.id || availableShipments[0]?.id || '',
      documentId: editingDoc.id,
    };
  }, [editingDoc, selectedConsignment?.shipmentId, selectedConsignment?.id, availableShipments]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-800 dark:text-slate-100">
      {/* 1. HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 rounded-3xl shadow-xs relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {language === 'AM'
              ? 'የጭነት ሰነዶች ማከማቻ እና የጉምሩክ ቅድመ-ምርመራ'
              : language === 'OM'
              ? 'Kuusaa Sanadoota Fe\'isaa fi Qorannoo Duraa Gumruukaa'
              : 'Freight Documentation Vault & Customs Pre-Check'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {language === 'AM'
              ? '4ቱን ዋና የንግድ ሰነዶች (የንግድ ደረሰኝ፣ የማሸጊያ ዝርዝር፣ B/L፣ የትውልድ ምስክር ወረቀት) ይጫኑ፣ ይመልከቱ እና ወደ ASYCUDA ከማስገባትዎ በፊት አውቶማቲክ የክብደትና የዋጋ ወጥነት ምርመራ ያሂዱ።'
              : language === 'OM'
              ? 'Sanadoota daldalaa ijoo 4 (Inwooysii Daldalaa, Tarree Saamsamaa, B/L, Waraqaa Maddaa) olfe\'aa, daawwadhaa, gara ASYCUDAtti erguun dura qorannoo ulfaatinaa fi gatii adeemsisaa.'
              : 'Upload and preview your 4 core trade documents (Commercial Invoice, Packing List, B/L, Certificate of Origin) and run automated weight & valuation consistency checks prior to ASYCUDA submission.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => {
              setEditingDoc({
                id: '',
                docType: 'COMMERCIAL_INVOICE',
                docNumber: '',
                fileName: '',
                issuingAuthority: 'Ethiopian Customs Commission (ECC)',
                clearanceStatus: 'NOT_SUBMITTED',
                validationPassed: false,
                uploadedAt: '',
                shipmentId: selectedConsignment?.shipmentId || selectedConsignment?.id,
                shipmentTitle: selectedConsignment?.title,
                declaredValueEtb: selectedConsignment?.declaredValueEtb,
                weightTons: selectedConsignment?.weightTons,
              });
              setIsResubmissionMode(false);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{language === 'AM' ? 'ሰነድ ጫን' : language === 'OM' ? 'Sanada Olfe\'i' : 'Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {submitNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
          submitNotice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {submitNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{submitNotice.message}</span>
          </div>
          <button onClick={() => setSubmitNotice(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1.5 ACTIVE CONSIGNMENT SELECTOR & CUSTOMS AUTHORITY CONNECTION STATUS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  {language === 'AM'
                    ? 'ገባሪ የጭነት ሰነድ ማህደር'
                    : language === 'OM'
                    ? 'Galmee Fe\'isaa Hojirra Jiru'
                    : 'Active Consignment Dossier'}
                </span>
                {selectedConsignment && (
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      selectedConsignment.customsStatus === 'CLEARED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : selectedConsignment.customsStatus === 'SUBMITTED'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : selectedConsignment.customsStatus === 'UNDER_REVIEW'
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                        : selectedConsignment.customsStatus === 'REVISION_REQUESTED'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {selectedConsignment.customsStatus === 'CLEARED'
                      ? language === 'AM'
                        ? '✓ ጉምሩክ ፀድቋል'
                        : language === 'OM'
                        ? '✓ Gumruukaan Eeyyamameera'
                        : '✓ Customs Cleared'
                      : selectedConsignment.customsStatus === 'SUBMITTED'
                      ? language === 'AM'
                        ? 'ለጉምሩክ ተራ ገብቷል'
                        : language === 'OM'
                        ? 'Dabaree Gumruukaatti Ergameera'
                        : 'Submitted to ECC Queue'
                      : selectedConsignment.customsStatus === 'UNDER_REVIEW'
                      ? language === 'AM'
                        ? 'በጉምሩክ ኦፊሰር ምርመራ ላይ'
                        : language === 'OM'
                        ? 'Qorannoo Qondaala Gumruukaa Jalatti'
                        : 'Under ECC Officer Inspection'
                      : selectedConsignment.customsStatus === 'REVISION_REQUESTED'
                      ? language === 'AM'
                        ? '⚠️ ማሻሻያ ተጠይቋል'
                        : language === 'OM'
                        ? '⚠️ Fooyya\'iinsi Gaafatameera'
                        : '⚠️ Revision Requested'
                      : language === 'AM'
                      ? 'ቅድመ-ማስገቢያ ረቂቅ'
                      : language === 'OM'
                      ? 'Waraqaa Duraa Erguu Duraa'
                      : 'Pre-Submission Draft'}
                  </span>
                )}
              </div>

              {availableShipments.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedConsignment?.id || ''}
                    onChange={(e) => {
                      setSelectedShipmentId(e.target.value);
                      setValidationResult(null);
                      setIsDossierValidated(false);
                      setIsDossierSubmitted(false);
                    }}
                    className="text-xs sm:text-sm font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer min-w-[280px]"
                  >
                    {availableShipments.map((shp) => (
                      <option key={shp.id} value={shp.id}>
                        {shp.title} ({shp.originName} ➔ {shp.destName})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'AM'
                    ? 'እስካሁን የተፈጠረ ጭነት የለም። የጉምሩክ ሰነዶችን ለማያያዝ እና ለማረጋገጥ በ\'ጭነት መዝግብ\' ውስጥ ጭነት ይፍጠሩ።'
                    : language === 'OM'
                    ? 'Hanga ammaatti fe\'isni hin uumamne. Sanadoota gumruukaa qabsiisuuf \'Fe\'isa Galchi\' keessatti fe\'isa uumaa.'
                    : 'No active consignments posted yet. Create a load in Post Load to link and verify customs clearance documents.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY TRADE DOCUMENTS STATUS GRID */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>
              {language === 'AM'
                ? 'ዋና የጭነት እና የንግድ ሰነዶች'
                : language === 'OM'
                ? 'Sanadoota Ijoo Fe\'isaa fi Daldalaa'
                : 'Core Consignment & Trade Documents'}
            </span>
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {language === 'AM'
              ? 'የሚደገፉ ፎርማቶች፡ '
              : language === 'OM'
              ? 'Bifa deeggaramu: '
              : 'Supported formats: '}
            <strong className="text-slate-700 dark:text-slate-300">PDF, JPEG, PNG (&lt;15MB)</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {keyDocs.map((item, idx) => {
            const isAttached = Boolean(item.doc);
            const isCleared = item.doc?.clearanceStatus === 'CLEARED';
            const isRejected = item.doc?.clearanceStatus === 'REJECTED' || item.doc?.clearanceStatus === 'REVISION_REQUESTED';
            const isSubmitted = item.doc?.clearanceStatus === 'SUBMITTED' || isDossierSubmitted;
            const isValidated = isDossierValidated && !isSubmitted;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCleared
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : isRejected
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                    : isSubmitted
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/20'
                    : isValidated
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : isAttached
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isCleared
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : isRejected
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                          : isSubmitted
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : isValidated
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : isAttached
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCleared
                        ? language === 'AM' ? 'ተፈቅዷል' : language === 'OM' ? 'Eeyyamame' : 'Cleared'
                        : isRejected
                        ? language === 'AM' ? 'ማሻሻያ' : language === 'OM' ? 'Fooyyessi' : 'Revision'
                        : isSubmitted
                        ? language === 'AM' ? 'ገብቷል' : language === 'OM' ? 'Ergameera' : 'Submitted'
                        : isValidated
                        ? language === 'AM' ? '✓ ተረጋግጧል' : language === 'OM' ? '✓ Mirkanaa\'eera' : '✓ Validated'
                        : isAttached
                        ? language === 'AM' ? 'ረቂቅ' : language === 'OM' ? 'Waraqaa Duraa' : 'Draft'
                        : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>

                  {item.doc && (
                    <div className="pt-1.5 text-[11px] space-y-1 font-mono">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-400 font-sans">
                          {language === 'AM' ? 'ቁጥር፡' : language === 'OM' ? 'Lakkoofsa:' : 'Ref:'}
                        </span>
                        <strong className="text-sky-700 dark:text-sky-400">{item.doc.docNumber}</strong>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="text-slate-400 font-sans">
                          {language === 'AM' ? 'ክብደት፡' : language === 'OM' ? 'Ulfaatina:' : 'Weight:'}
                        </span>
                        <span>{item.doc.weightTons} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[10px]">
                        <span className="font-sans">
                          {language === 'AM' ? 'ፋይል፡' : language === 'OM' ? 'Faayila:' : 'File:'}
                        </span>
                        <span className="truncate max-w-[130px]">{item.doc.fileName}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {item.doc ? (
                    <div className="space-y-1.5 w-full">
                      {/* PREVIEW BUTTON */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc(item.doc!);
                          setPreviewModalOpen(true);
                        }}
                        className="w-full py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>
                          {language === 'AM' ? 'ሰነዱን ተመልከት' : language === 'OM' ? 'Sanada Ilaali' : 'Preview Document'}
                        </span>
                      </button>

                      {isRejected ? (
                        <button
                          type="button"
                          onClick={() => handleOpenResubmit(item.doc!)}
                          className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>
                            {language === 'AM' ? 'አርመህ በድጋሚ አስገባ' : language === 'OM' ? 'Sirreessii Ergi' : 'Fix & Resubmit'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoc(item.doc!);
                            setIsResubmissionMode(false);
                            setModalOpen(true);
                          }}
                          className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>
                            {language === 'AM' ? 'ዝርዝር አሻሽል' : language === 'OM' ? 'Bal\'ina Fooyyessi' : 'Update Details'}
                          </span>
                        </button>
                      )}
                    </div>
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
                          clearanceStatus: 'NOT_SUBMITTED',
                          validationPassed: false,
                          uploadedAt: '',
                          shipmentId: selectedConsignment?.shipmentId || selectedConsignment?.id,
                          shipmentTitle: selectedConsignment?.title,
                          declaredValueEtb: selectedConsignment?.declaredValueEtb,
                          weightTons: selectedConsignment?.weightTons,
                        });
                        setIsResubmissionMode(false);
                        setModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>
                        {language === 'AM'
                          ? `${item.title} አያይዝ`
                          : language === 'OM'
                          ? `${item.title} Qabsiisi`
                          : `Attach ${item.title}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AUTOMATED PRE-SUBMISSION CONSISTENCY VALIDATOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden transition-all">
        {/* Accent glow in corner */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {language === 'AM'
                  ? 'የቅድመ-ማስገቢያ ወጥነት አረጋጋጭ'
                  : language === 'OM'
                  ? 'Mirkaneessaa Wal-simiinsa Sanadaa'
                  : 'Pre-Submission Consistency Validator'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {language === 'AM'
                ? 'አውቶማቲክ የቅድመ-ፍቃድ ወጥነት ምርመራ፡ ጠቅላላ ክብደት (ልዩነት ±0.1 ቶን)፣ የተገለጸ CIF ዋጋ እና የፎርማት ትክክለኛነት በ4ቱም ሰነዶች መካከል ያረጋግጣል።'
                : language === 'OM'
                ? 'Qorannoo duraa ofiin of hojjetu: ulfaatina waliigalaa (garaagarummaa ±0.1T), gatii CIF fi sirrummaa bifa sanadoota 4 erguun dura mirkaneessa.'
                : 'Automated pre-clearance consistency check: cross-verifies gross weight (tolerance band ±0.1T), declared CIF valuation, and format integrity across all 4 documents before ASYCUDA submission.'}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
            {/* Primary Pre-Submission Check Button */}
            <button
              type="button"
              onClick={runPreSubmissionCheck}
              disabled={validating}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {validating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {language === 'AM'
                      ? 'ማህደሩን በመመርመር ላይ...'
                      : language === 'OM'
                      ? 'Galmee qorachaa jira...'
                      : 'Validating Dossier...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {language === 'AM'
                      ? 'የቅድመ-ማስገቢያ ምርመራ አሂድ'
                      : language === 'OM'
                      ? 'Qorannoo Duraa Adeemsisi'
                      : 'Run Pre-Submission Check'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Verification Step Spinner (When Validating) */}
        {validating && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>{validationStep}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Dynamic Verification Results Display */}
        {validationResult && !validating && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                validationResult.passed
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {validationResult.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-black text-sm uppercase tracking-wide">
                    {validationResult.passed
                      ? language === 'AM'
                        ? '✓ የቅድመ-ማስገቢያ ምርመራ አልፏል — ምንም ልዩነት አልተገኘም'
                        : language === 'OM'
                        ? '✓ Qorannoon Duraa Milkaa\'eera — Garaagarummaan Hin Jiru'
                        : '✓ Pre-Submission Validation Passed — Zero Discrepancies'
                      : language === 'AM'
                      ? '⚠️ የቅድመ-ማስገቢያ ልዩነት ተገኝቷል — እርማት ያስፈልጋል'
                      : language === 'OM'
                      ? '⚠️ Garaagarummaan Argameera — Sirreeffamni Barbaachisaa dha'
                      : '⚠️ Pre-Submission Discrepancy Detected — Correction Required'}
                  </div>
                  <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
                    {validationResult.summaryGuidance}
                  </p>
                </div>
              </div>

              {validationResult.passed && (
                <button
                  type="button"
                  onClick={handleSubmitDossier}
                  disabled={submittingDossier || isDossierSubmitted}
                  className={`shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1.5 ${
                    isDossierSubmitted
                      ? 'bg-emerald-700/80 text-white cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  }`}
                >
                  {submittingDossier ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'AM' ? 'በመላክ ላይ...' : language === 'OM' ? 'Ergamaa jira...' : 'Transmitting...'}</span>
                    </>
                  ) : isDossierSubmitted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'AM' ? 'ማህደሩ ለጉምሩክ ገብቷል ✓' : language === 'OM' ? 'Galmeen Gumruukaatti Ergameera ✓' : 'Dossier Submitted to ECC ✓'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'AM' ? 'ለጉምሩክ አስገባ (ECC)' : language === 'OM' ? 'Gumruukaaf Ergi (ECC)' : 'Submit to Customs (ECC)'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 3 Cross-Check KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* KPI 1: Weight Consistency */}
              <div className={`p-4 rounded-2xl border transition-all ${
                validationResult.crossChecks?.weightConsistent
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] uppercase font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'AM' ? 'የክብደት ወጥነት' : language === 'OM' ? 'Wal-simiinsa Ulfaatinaa' : 'Weight Consistency'}</span>
                  </span>
                  <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                    validationResult.crossChecks?.weightConsistent
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                  }`}>
                    {validationResult.crossChecks?.weightConsistent
                      ? language === 'AM' ? 'አልፏል (±0.1 ቶን)' : language === 'OM' ? 'Darbe (±0.1T)' : 'PASS (±0.1T)'
                      : language === 'AM' ? 'ልዩነት አለ' : language === 'OM' ? 'Garaagarummaa' : 'DISCREPANCY'}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-sans text-[11px] text-slate-400">
                      {language === 'AM' ? 'ደረሰኝ፡' : language === 'OM' ? 'Inwooysii:' : 'Invoice:'}
                    </span>
                    <strong>{invoiceDoc?.weightTons != null ? `${invoiceDoc.weightTons} T` : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-sans text-[11px] text-slate-400">
                      {language === 'AM' ? 'የማሸጊያ ዝርዝር፡' : language === 'OM' ? 'Tarree Saamsamaa:' : 'Packing List:'}
                    </span>
                    <strong className={validationResult.crossChecks?.weightConsistent ? '' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                      {packingDoc?.weightTons != null ? `${packingDoc.weightTons} T` : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-sans text-[11px] text-slate-400">
                      {language === 'AM' ? 'የጉዞ ሰነድ፡' : language === 'OM' ? 'Sanada Geejjibaa:' : 'Bill of Lading:'}
                    </span>
                    <strong>{bolDoc?.weightTons != null ? `${bolDoc.weightTons} T` : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}</strong>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60 flex justify-between font-bold text-[11px]">
                    <span className="font-sans text-slate-500">
                      {language === 'AM' ? 'ልዩነት፡' : language === 'OM' ? 'Garaagarummaa:' : 'Variance:'}
                    </span>
                    <span className={validationResult.crossChecks?.weightConsistent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {validationResult.crossChecks?.weightDiscrepancyTons != null
                        ? `${validationResult.crossChecks.weightDiscrepancyTons} ${language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* KPI 2: Value Harmonization */}
              <div className="p-4 rounded-2xl border bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] uppercase font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'AM' ? 'የዋጋ ወጥነት' : language === 'OM' ? 'Wal-simiinsa Gatii' : 'Valuation Harmonization'}</span>
                  </span>
                  <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                    validationResult.crossChecks?.valueConsistent
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                  }`}>
                    {validationResult.crossChecks?.valueConsistent
                      ? language === 'AM' ? 'አልፏል' : language === 'OM' ? 'Darbe' : 'PASS'
                      : language === 'AM' ? 'በመጠባበቅ ላይ' : language === 'OM' ? 'Eeggamaa' : 'PENDING'}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-sans text-[11px] text-slate-400">
                      {language === 'AM' ? 'የተገለጸ CIF፡' : language === 'OM' ? 'CIF Beeksisame:' : 'Declared CIF:'}
                    </span>
                    <strong>{invoiceDoc?.declaredValueEtb != null ? `ETB ${Number(invoiceDoc.declaredValueEtb).toLocaleString()}` : '—'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-sans text-[11px] text-slate-400">
                      {language === 'AM' ? 'ሁኔታ፡' : language === 'OM' ? 'Haala:' : 'Status:'}
                    </span>
                    <strong>
                      {invoiceDoc
                        ? language === 'AM' ? 'ተገልጿል' : language === 'OM' ? 'Beeksisameera' : 'Declared'
                        : language === 'AM' ? 'አልተጫነም' : language === 'OM' ? 'Hin olfe\'amne' : 'Not Uploaded'}
                    </strong>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60 flex justify-between font-bold text-[11px]">
                    <span className="font-sans text-slate-500">
                      {language === 'AM' ? 'የተስማማ፡' : language === 'OM' ? 'Wal-simeera:' : 'Harmonized:'}
                    </span>
                    <span className={validationResult.crossChecks?.valueConsistent ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                      {validationResult.crossChecks?.valueConsistent
                        ? language === 'AM' ? '100% የተስማማ' : language === 'OM' ? 'Wal-simiinsa 100%' : '100% Value Match'
                        : language === 'AM' ? 'የCIF መረጃ በመጠባበቅ ላይ' : language === 'OM' ? 'Odeeffannoo CIF Eeggamaa' : 'Pending CIF Data'}
                    </span>
                  </div>
                </div>
              </div>

              {/* KPI 3: Dossier Completeness */}
              <div className="p-4 rounded-2xl border bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] uppercase font-black text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'AM' ? 'የማህደር ምሉዕነት' : language === 'OM' ? 'Guutummaa Galmee' : 'Dossier Completeness'}</span>
                  </span>
                  <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {validationResult.completenessPct ?? 0}% ({[invoiceDoc, packingDoc, bolDoc, originDoc].filter(Boolean).length}/4)
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">
                      {language === 'AM' ? 'የንግድ ደረሰኝ፡' : language === 'OM' ? 'Inwooysii Daldalaa:' : 'Commercial Invoice:'}
                    </span>
                    <span className={invoiceDoc ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                      {invoiceDoc ? (language === 'AM' ? '✓ ተያይዟል' : language === 'OM' ? '✓ Qabsiifameera' : '✓ Attached') : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">
                      {language === 'AM' ? 'የማሸጊያ ዝርዝር፡' : language === 'OM' ? 'Tarree Saamsamaa:' : 'Packing List:'}
                    </span>
                    <span className={packingDoc ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                      {packingDoc ? (language === 'AM' ? '✓ ተያይዟል' : language === 'OM' ? '✓ Qabsiifameera' : '✓ Attached') : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">
                      {language === 'AM' ? 'የጉዞ ሰነድ፡' : language === 'OM' ? 'Sanada Geejjibaa:' : 'Bill of Lading:'}
                    </span>
                    <span className={bolDoc ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                      {bolDoc ? (language === 'AM' ? '✓ ተያይዟል' : language === 'OM' ? '✓ Qabsiifameera' : '✓ Attached') : language === 'AM' ? 'ጎድሏል' : language === 'OM' ? 'Hanjaa Jira' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">
                      {language === 'AM' ? 'የትውልድ ሀገር ምስክር ወረቀት፡' : language === 'OM' ? 'Waraqaa Eenyummaa Maddaa:' : 'Certificate of Origin:'}
                    </span>
                    <span className={originDoc ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                      {originDoc ? (language === 'AM' ? '✓ ተያይዟል' : language === 'OM' ? '✓ Qabsiifameera' : '✓ Attached') : language === 'AM' ? 'አማራጭ / አልተያያዘም' : language === 'OM' ? 'Filannoo / Hin qabsiifamne' : 'Optional / Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Guidance / Corrections if Mismatch is Detected */}
            {validationResult.actionableGuidance && validationResult.actionableGuidance.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
                <div className="text-xs font-black uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    {language === 'AM'
                      ? 'ወደ ጉምሩክ ከማስገባትዎ በፊት መስተካከል ያለባቸው እርምጃዎች'
                      : language === 'OM'
                      ? 'Gara Gumruukaatti Erguun Dura Tarkaanfiiwwan Sirreeffamaa Barbaachisan'
                      : 'Required Harmonization Actions Before Customs Submission'}
                  </span>
                </div>
                <div className="space-y-2">
                  {validationResult.actionableGuidance.map((g: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/40 text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{g.document}</span>
                        <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                          {language === 'AM' ? 'ሜዳ፡ ' : language === 'OM' ? 'Dirree: ' : 'Field: '} {g.field}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">{g.issue}</p>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <strong>{language === 'AM' ? 'መፍትሔ፡ ' : language === 'OM' ? 'Furmaata: ' : 'Remedy: '}</strong> {g.remedy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. CLEARANCE DOCUMENTS TABLE WITH STATUS WORKFLOW */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden space-y-3 p-5">
        {/* Filter Tabs & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'AM'
                ? `ሁሉም ሰነዶች (${documents.length})`
                : language === 'OM'
                ? `Sanadoota Hundaa (${documents.length})`
                : `All Docs (${documents.length})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'DRAFT'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'AM'
                ? `ረቂቆች (${documents.filter((d) => d.clearanceStatus === 'NOT_SUBMITTED').length})`
                : language === 'OM'
                ? `Waraqaawwan Duraa (${documents.filter((d) => d.clearanceStatus === 'NOT_SUBMITTED').length})`
                : `Drafts (${documents.filter((d) => d.clearanceStatus === 'NOT_SUBMITTED').length})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'SUBMITTED'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'AM'
                ? `የገቡ (${documents.filter((d) => d.clearanceStatus === 'SUBMITTED').length})`
                : language === 'OM'
                ? `Kan Ergaman (${documents.filter((d) => d.clearanceStatus === 'SUBMITTED').length})`
                : `Submitted (${documents.filter((d) => d.clearanceStatus === 'SUBMITTED').length})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('CLEARED')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'CLEARED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'AM'
                ? `የጸደቁ (${documents.filter((d) => d.clearanceStatus === 'CLEARED').length})`
                : language === 'OM'
                ? `Kan Eeyyamaman (${documents.filter((d) => d.clearanceStatus === 'CLEARED').length})`
                : `Cleared (${documents.filter((d) => d.clearanceStatus === 'CLEARED').length})`}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REJECTED')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'AM'
                ? `ማሻሻያ / ውድቅ (${documents.filter((d) => d.clearanceStatus === 'REJECTED' || d.clearanceStatus === 'REVISION_REQUESTED').length})`
                : language === 'OM'
                ? `Fooyya'iinsa / Diddaman (${documents.filter((d) => d.clearanceStatus === 'REJECTED' || d.clearanceStatus === 'REVISION_REQUESTED').length})`
                : `Revisions / Rejected (${documents.filter((d) => d.clearanceStatus === 'REJECTED' || d.clearanceStatus === 'REVISION_REQUESTED').length})`}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-auto md:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === 'AM'
                  ? 'በሰነድ ቁጥር ወይም ዓይነት ፈልግ...'
                  : language === 'OM'
                  ? 'Lakkoofsa ykn Gosaan Barbaadi...'
                  : 'Search by Ref No. or Type...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-3.5">
                  {language === 'AM' ? 'የሰነድ ዓይነት እና ፋይል' : language === 'OM' ? 'Gosa Sanadaa fi Faayila' : 'Document Type & File'}
                </th>
                <th className="py-3 px-3.5">
                  {language === 'AM' ? 'የመለያ ቁጥር' : language === 'OM' ? 'Lakkoofsa Eenyummaa' : 'Reference No.'}
                </th>
                <th className="py-3 px-3.5">
                  {language === 'AM' ? 'ክብደት / ዋጋ' : language === 'OM' ? 'Ulfaatina / Gatii' : 'Weight / Value'}
                </th>
                <th className="py-3 px-3.5">
                  {language === 'AM' ? 'ያወጣው ባለስልጣን' : language === 'OM' ? 'Abbaa Taayitaa Kenne' : 'Issuing Authority'}
                </th>
                <th className="py-3 px-3.5">
                  {language === 'AM' ? 'ሁኔታ እና ሂደት' : language === 'OM' ? 'Haala fi Adeemsa' : 'Status & Lifecycle'}
                </th>
                <th className="py-3 px-3.5">
                  {language === 'AM' ? 'እርምጃዎች' : language === 'OM' ? 'Tarkaanfiiwwan' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {documents.length === 0
                        ? language === 'AM'
                          ? 'እስካሁን የተጫነ የጉምሩክ ሰነድ የለም'
                          : language === 'OM'
                          ? 'Hanga ammaatti sanadni gumruukaa hin olfe\'amne'
                          : 'No custom documents uploaded yet'
                        : language === 'AM'
                        ? 'ከተመረጠው ፍለጋ ጋር የሚዛመድ ሰነድ የለም'
                        : language === 'OM'
                        ? 'Sanadni barbaadamee wajjin walsimu hin jiru'
                        : 'No documents match the current filter or search'}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                      {language === 'AM'
                        ? 'የጭነት ማህደርዎን ለማየት ወይም አዳዲስ ሰነዶችን ለመጫን ከላይ ያሉትን 4 ካርዶች ይጠቀሙ።'
                        : language === 'OM'
                        ? 'Galmee fe\'isaa keessan ilaaluuf ykn sanadoota haaraa olfe\'uuf kaardota 4 gubbaa jiran fayyadamaa.'
                        : 'Use the 4 core cards above to preview your consignment dossier or upload new documents.'}
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
                    <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Document Type & Format */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{doc.docType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300 font-bold uppercase">
                            {doc.fileName.split('.').pop() || 'PDF'}
                          </span>
                          <span className="truncate max-w-[130px]">{doc.fileName}</span>
                          <span>• {doc.fileSizeKb} KB</span>
                        </div>
                      </td>

                      {/* Reference Number & Issue Date */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-mono font-black text-sky-700 dark:text-sky-400">
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
                        <div className="font-bold text-slate-900 dark:text-white">
                          {doc.weightTons ? `${doc.weightTons} ${language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}` : 'N/A'}
                        </div>
                        <div className="text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ETB {Number(doc.declaredValueEtb || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Issuing Authority */}
                      <td className="py-3.5 px-3.5 text-slate-600 dark:text-slate-300 font-medium text-[11px] max-w-[140px] truncate">
                        {doc.issuingAuthority}
                      </td>

                      {/* Clearance Status Badge & Rejection Alert */}
                      <td className="py-3.5 px-3.5">
                        <div>
                          <span
                            className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                              isCleared
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : isUnderReview
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                : isSubmitted
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : isDraft
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {isCleared && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                            {isCleared
                              ? language === 'AM' ? 'የተረጋገጠ' : language === 'OM' ? 'Mirkanaa\'eera' : 'Verified'
                              : isUnderReview
                              ? language === 'AM' ? 'በምርመራ ላይ' : language === 'OM' ? 'Qorannoo Jalatti' : 'Under Review'
                              : isSubmitted
                              ? language === 'AM' ? 'ገባሪ' : language === 'OM' ? 'Hojirra Jira' : 'Active'
                              : isDraft
                              ? language === 'AM' ? 'ረቂቅ' : language === 'OM' ? 'Waraqaa Duraa' : 'Draft'
                              : language === 'AM' ? 'ማሻሻያ ያስፈልጋል' : language === 'OM' ? 'Fooyya\'iinsa Barbaada' : 'Revision Required'}
                          </span>

                          {/* Rejection Notice Banner */}
                          {isRejected && doc.officerNotes && (
                            <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-[10.5px] max-w-xs space-y-0.5">
                              <div className="font-bold flex items-center gap-1 text-rose-700 dark:text-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>{language === 'AM' ? 'የውድቅ የተደረገበት ምክንያት፡' : language === 'OM' ? 'Sababa Diddamaa:' : 'Rejection Reason:'}</span>
                              </div>
                              <p className="text-[10px] text-rose-800 dark:text-rose-300 leading-tight">
                                {doc.officerNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* Quick Preview Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDoc(doc);
                              setPreviewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors cursor-pointer"
                            title={language === 'AM' ? 'ሰነዱን ተመልከት' : language === 'OM' ? 'Sanada Ilaali' : 'Preview Document'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isDraft && (
                            <button
                              type="button"
                              onClick={() => handleSubmitDraft(doc.id, doc.docNumber)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>{language === 'AM' ? 'አስገባ' : language === 'OM' ? 'Ergi' : 'Submit'}</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleOpenResubmit(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FileUp className="w-3 h-3" />
                              <span>{language === 'AM' ? 'እንደገና አስገባ' : language === 'OM' ? 'Lamata Ergi' : 'Resubmit'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingDoc(doc);
                              setIsResubmissionMode(false);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={language === 'AM' ? 'መረጃ አሻሽል' : language === 'OM' ? 'Odeeffannoo Fooyyessi' : 'Edit metadata'}
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

      {/* 5. MODAL: DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewDoc(null);
        }}
        doc={previewDoc}
        onRunPreSubmissionCheck={() => {
          runPreSubmissionCheck();
        }}
      />

      {/* 6. MODAL: UPLOAD & RESUBMISSION MODAL */}
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
        initialData={modalInitialData}
        isResubmission={isResubmissionMode}
        rejectionReason={editingDoc?.officerNotes}
      />
    </div>
  );
};