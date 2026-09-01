import React from 'react';
import {
  FileCheck2,
  FileText,
  Shield,
  CheckCircle2,
  CheckCircle,
  Truck,
  Eye,
} from 'lucide-react';
import { VerificationUser, DocumentPreviewData } from '../types';

interface UserInspectionModalProps {
  inspectUser: VerificationUser | null;
  adminNotes: string;
  setAdminNotes: (val: string) => void;
  onClose: () => void;
  onOpenDocPreview: (doc: DocumentPreviewData) => void;
  onUpdateStatus: (userId: string, status: 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => void;
}

export const UserInspectionModal: React.FC<UserInspectionModalProps> = ({
  inspectUser,
  adminNotes,
  setAdminNotes,
  onClose,
  onOpenDocPreview,
  onUpdateStatus,
}) => {
  if (!inspectUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                {inspectUser.role}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {inspectUser.id.slice(0, 12)}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {inspectUser.companyName || inspectUser.fullName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Business & Legal Identity Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Representative Name</span>
            <span className="font-extrabold text-slate-900">{inspectUser.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone & Email</span>
            <span className="font-extrabold text-slate-900">{inspectUser.phone} • {inspectUser.email}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Tax Identification Number (TIN)</span>
            <span className="font-mono font-black text-[#0284C7]">{inspectUser.tin || 'Not Provided / Pending'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Trade License Number</span>
            <span className="font-mono font-black text-slate-800">{inspectUser.tradeLicenseNo || 'Not Provided / Pending'}</span>
          </div>
        </div>

        {/* Submitted Verification Documents */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Submitted Verification Documents & Certificates
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Click any document to inspect original scan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Document 1: Trade License */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Trade License Certificate</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {inspectUser.tradeLicenseNo ? `Lic: ${inspectUser.tradeLicenseNo}` : 'Doc: Trade_License_Scan.pdf'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenDocPreview({
                    title: 'Official Ethiopian Trade License Certificate',
                    docType: 'COMMERCIAL_TRADE_LICENSE',
                    docNumber: inspectUser.tradeLicenseNo || 'ETH-MOTI-PENDING',
                    issuer: 'Ministry of Trade & Regional Integration (MOTI)',
                    fileName: `Trade_License_${inspectUser.tradeLicenseNo || 'Scan'}.pdf`,
                    status: inspectUser.tradeLicenseNo ? 'REGISTERED_VERIFIED' : 'PENDING_UPLOAD',
                    issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                    ownerName: inspectUser.companyName || inspectUser.fullName,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Eye className="w-3 h-3 text-slate-600" />
                <span>Inspect</span>
              </button>
            </div>

            {/* Document 2: TIN Certificate */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Tax Identification (TIN) Cert</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {inspectUser.tin ? `TIN: ${inspectUser.tin}` : 'Doc: TIN_Registration.pdf'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenDocPreview({
                    title: 'Tax Identification Number (TIN) Certificate',
                    docType: 'TAX_IDENTIFICATION_CERTIFICATE',
                    docNumber: inspectUser.tin || 'ERCA-TIN-PENDING',
                    issuer: 'Ministry of Revenues & Ethiopian Customs (ERCA)',
                    fileName: `TIN_Certificate_${inspectUser.tin || 'Scan'}.pdf`,
                    status: inspectUser.tin ? 'REGISTERED_VERIFIED' : 'PENDING_UPLOAD',
                    issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                    ownerName: inspectUser.companyName || inspectUser.fullName,
                  })
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <Eye className="w-3 h-3 text-slate-600" />
                <span>Inspect</span>
              </button>
            </div>

            {/* Document 3: Fleet GIT Insurance (If Transporter) */}
            {inspectUser.role === 'TRANSPORTER' && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Goods in Transit (GIT) Insurance</div>
                    <div className="text-[10px] text-slate-500 font-mono">EIC Commercial GIT Policy</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenDocPreview({
                      title: 'Goods in Transit (GIT) Freight Policy',
                      docType: 'GIT_INSURANCE_POLICY',
                      docNumber: `EIC-GIT-2026-${inspectUser.id.slice(-4).toUpperCase()}`,
                      issuer: 'Ethiopian Insurance Corporation (EIC)',
                      fileName: 'EIC_GIT_Freight_Insurance_Policy.pdf',
                      status: 'ACTIVE_CORRIDOR_GIT',
                      issuedDate: new Date().toLocaleDateString(),
                      ownerName: inspectUser.companyName || inspectUser.fullName,
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <Eye className="w-3 h-3 text-slate-600" />
                  <span>Inspect</span>
                </button>
              </div>
            )}

            {/* Document 4: FTA Roadworthiness (If Transporter) */}
            {inspectUser.role === 'TRANSPORTER' && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">FTA Roadworthiness Safety Pass</div>
                    <div className="text-[10px] text-slate-500 font-mono">Federal Transport Authority</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenDocPreview({
                      title: 'Federal Transport Road Safety & Roadworthiness Certificate',
                      docType: 'FTA_ROADWORTHINESS_CERTIFICATE',
                      docNumber: `FTA-RW-2026-${inspectUser.id.slice(-4).toUpperCase()}`,
                      issuer: 'Federal Transport Authority (FTA)',
                      fileName: 'FTA_Roadworthiness_Safety_Passed_2026.pdf',
                      status: 'PASSED_ANNUAL_INSPECTION',
                      issuedDate: new Date().toLocaleDateString(),
                      ownerName: inspectUser.companyName || inspectUser.fullName,
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <Eye className="w-3 h-3 text-slate-600" />
                  <span>Inspect</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Registered Fleet & Vehicles (If Transporter) */}
        {inspectUser.vehicles && inspectUser.vehicles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Registered Fleet Trucks ({inspectUser.vehicles.length})
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {inspectUser.vehicles.map((v: any) => (
                <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{v.plateNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{v.vehicleType} • {v.capacityTons} Tons</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Administrator Audit Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Administrator Compliance & Verification Notes
          </label>
          <textarea
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="e.g. Verified against MOTI & ERCA trade database. All certificates valid for corridor operations."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            Close Window
          </button>

          <div className="flex items-center gap-2">
            {inspectUser.verificationStatus !== 'SUSPENDED' && (
              <button
                onClick={() => {
                  onUpdateStatus(inspectUser.id, 'SUSPENDED');
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
              >
                Suspend Account
              </button>
            )}

            {inspectUser.verificationStatus !== 'VERIFIED' && (
              <button
                onClick={() => {
                  onUpdateStatus(inspectUser.id, 'VERIFIED');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Verify Organization</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
