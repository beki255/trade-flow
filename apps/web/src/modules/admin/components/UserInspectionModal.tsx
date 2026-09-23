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
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  inspectUser.role === 'DRIVER'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : inspectUser.role === 'CUSTOMS_OFFICER'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {inspectUser.role === 'DRIVER'
                  ? '🚚 AUTHORIZED DRIVER'
                  : inspectUser.role === 'CUSTOMS_OFFICER'
                  ? '🛡️ OFFICIAL CUSTOMS INSPECTOR'
                  : inspectUser.role}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {inspectUser.id.slice(0, 12)}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {inspectUser.role === 'DRIVER'
                ? inspectUser.fullName
                : inspectUser.role === 'CUSTOMS_OFFICER'
                ? inspectUser.fullName
                : (inspectUser.companyName || inspectUser.fullName)}
            </h2>
            {inspectUser.role === 'DRIVER' && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Employing Transporter: <span className="font-bold text-slate-800">{inspectUser.companyName || 'TradeFlow Fleet Network'}</span>
              </p>
            )}
            {inspectUser.role === 'CUSTOMS_OFFICER' && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official Station: <span className="font-bold text-slate-800">{inspectUser.companyName || 'Galafi Border Checkpoint'}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Business & Legal Identity Grid (Specialized for Driver vs Organization) */}
        {inspectUser.role === 'DRIVER' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Driver Full Name</span>
              <span className="font-extrabold text-slate-900">{inspectUser.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone & Contact</span>
              <span className="font-extrabold text-slate-900">{inspectUser.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Driver License No</span>
              <span className="font-mono font-black text-purple-700">
                {inspectUser.driverProfile?.driverLicenseNo || 'Pending Submission'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">License Qualification</span>
              <span className="font-bold text-slate-900">
                {inspectUser.driverProfile?.licenseClass || 'Grade 5 Heavy Freight'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Corridor Experience</span>
              <span className="font-bold text-slate-900">
                {inspectUser.driverProfile?.experienceYears || 4} Years Heavy Freight
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Assigned Truck</span>
              <span className="font-mono font-bold text-sky-700">
                {inspectUser.driverProfile?.assignedVehicle
                  ? `${inspectUser.driverProfile.assignedVehicle.plateNumber} (${inspectUser.driverProfile.assignedVehicle.vehicleType || 'Truck'})`
                  : 'Unassigned (Pool)'}
              </span>
            </div>
          </div>
        ) : inspectUser.role === 'CUSTOMS_OFFICER' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Inspector Full Name</span>
              <span className="font-extrabold text-slate-900">{inspectUser.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone & Contact</span>
              <span className="font-extrabold text-slate-900">{inspectUser.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Government Badge ID</span>
              <span className="font-mono font-black text-amber-900">{inspectUser.tin || 'ECC-INSPECTOR-2026'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Official Commission Email</span>
              <span className="font-mono text-slate-700 font-bold">{inspectUser.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Station / Checkpoint</span>
              <span className="font-extrabold text-slate-900">{inspectUser.companyName || 'Galafi Border Checkpoint'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Regulatory Commission</span>
              <span className="font-bold text-amber-900">Ethiopian Customs Commission (ECC)</span>
            </div>
          </div>
        ) : (
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
              <span className="font-mono font-black text-[#0284C7]">{inspectUser.tin || 'Not Provided'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Trade License Number</span>
              <span className="font-mono font-black text-slate-800">{inspectUser.tradeLicenseNo || 'Not Provided'}</span>
            </div>
          </div>
        )}

        {/* Submitted Verification Documents */}
        {(() => {
          const docs: Array<{
            title: string;
            docType: string;
            docNumber: string;
            issuer: string;
            fileName: string;
            status: string;
            issuedDate: string;
            ownerName: string;
          }> = [];

          const parseDocumentValue = (val?: string | null, fallbackName: string = 'Document.pdf') => {
            if (!val) return null;
            let fileName = fallbackName;
            let fileUrl: string | undefined = undefined;

            if (val.startsWith('{')) {
              try {
                const parsed = JSON.parse(val);
                fileName = parsed.name || fallbackName;
                fileUrl = parsed.data || undefined;
              } catch {
                fileName = val;
              }
            } else if (val.startsWith('data:') || val.startsWith('http:') || val.startsWith('https:')) {
              fileUrl = val;
              fileName = fallbackName;
            } else {
              fileName = val;
            }

            return { fileName, fileUrl };
          };

          // 1. Insurance Documentation (GIT) (Uploaded by Transporter)
          if (inspectUser.insuranceDoc) {
            const fallbackName = `Insurance_GIT_${inspectUser.companyName || inspectUser.fullName}.pdf`.replace(/\s+/g, '_');
            const parsed = parseDocumentValue(inspectUser.insuranceDoc, fallbackName);

            if (parsed) {
              docs.push({
                title: 'Insurance Documentation (GIT)',
                docType: 'INSURANCE_GIT',
                docNumber: `GIT-${inspectUser.tin || 'PENDING'}`,
                issuer: 'Ethiopian Insurance Corporation / Commercial Insurer',
                fileName: parsed.fileName,
                fileUrl: parsed.fileUrl,
                status: inspectUser.verificationStatus,
                issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                ownerName: inspectUser.companyName || inspectUser.fullName,
              });
            }
          }

          // 2. Roadworthiness Certificate (FTA) (Uploaded by Transporter)
          if (inspectUser.roadworthinessDoc) {
            const fallbackName = `Roadworthiness_FTA_${inspectUser.companyName || inspectUser.fullName}.pdf`.replace(/\s+/g, '_');
            const parsed = parseDocumentValue(inspectUser.roadworthinessDoc, fallbackName);

            if (parsed) {
              docs.push({
                title: 'Roadworthiness Certificate (FTA)',
                docType: 'ROADWORTHINESS_FTA',
                docNumber: `FTA-${inspectUser.tin || 'PENDING'}`,
                issuer: 'Federal Transport Authority (FTA Ethiopia)',
                fileName: parsed.fileName,
                fileUrl: parsed.fileUrl,
                status: inspectUser.verificationStatus,
                issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                ownerName: inspectUser.companyName || inspectUser.fullName,
              });
            }
          }

          // 3. Trade License / Registration Certificate (Uploaded by Shipper / Other Users)
          if (inspectUser.tradeLicenseDoc) {
            const fallbackName = inspectUser.tradeLicenseNo
              ? `Trade_License_${inspectUser.tradeLicenseNo}.pdf`
              : 'Trade_License_Certificate.pdf';
            const parsed = parseDocumentValue(inspectUser.tradeLicenseDoc, fallbackName);

            if (parsed) {
              docs.push({
                title: 'Trade License / Business Registration Certificate',
                docType: 'COMMERCIAL_TRADE_LICENSE',
                docNumber: inspectUser.tradeLicenseNo || 'MOTI-PENDING',
                issuer: 'Ministry of Trade & Regional Integration (MOTI)',
                fileName: parsed.fileName,
                fileUrl: parsed.fileUrl,
                status: inspectUser.verificationStatus,
                issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                ownerName: inspectUser.companyName || inspectUser.fullName,
              });
            }
          }

          // 4. Commercial Driving License & Heavy Vehicle Qualification Certificate (If Driver)
          if (inspectUser.role === 'DRIVER') {
            const licenseNo = inspectUser.driverProfile?.driverLicenseNo || 'DL-PENDING';
            const cleanName = (inspectUser.fullName || 'Driver').replace(/\s+/g, '_');
            const fallbackName = `Commercial_Driver_License_${licenseNo}_${cleanName}.pdf`;

            docs.push({
              title: "Commercial Driver's License (CDL) & Grade Qualification",
              docType: 'DRIVER_LICENSE',
              docNumber: licenseNo,
              issuer: 'Federal Transport Authority (FTA) - Driver Licensing Division',
              fileName: fallbackName,
              fileUrl: undefined,
              status: inspectUser.verificationStatus,
              issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
              ownerName: inspectUser.fullName,
            });
          }

          // 5. Transporter Individual Vehicle Fleet Documents
          (inspectUser.vehicles || []).forEach((v: any) => {
            if (v.insuranceDocUrl) {
              docs.push({
                title: `Vehicle Insurance Policy (${v.plateNumber})`,
                docType: 'INSURANCE_POLICY',
                docNumber: v.insurancePolicyNo || `POL-${v.plateNumber}`,
                issuer: 'Commercial Insurance Provider',
                fileName: v.insuranceDocUrl,
                fileUrl: v.insuranceDocUrl,
                status: 'ATTACHED',
                issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                ownerName: inspectUser.companyName || inspectUser.fullName,
              });
            }
            if (v.roadworthinessCertUrl) {
              docs.push({
                title: `Roadworthiness Certificate (${v.plateNumber})`,
                docType: 'ROADWORTHINESS_CERTIFICATE',
                docNumber: `RW-${v.plateNumber}`,
                issuer: 'Transport Regulatory Authority',
                fileName: v.roadworthinessCertUrl,
                fileUrl: v.roadworthinessCertUrl,
                status: 'ATTACHED',
                issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
                ownerName: inspectUser.companyName || inspectUser.fullName,
              });
            }
          });

          return (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Submitted Verification Documents & Certificates ({docs.length})
                </h3>
              </div>

              {docs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-700">No Verification Documents Attached</div>
                  <p className="text-[11px] text-slate-500">
                    No digital certificate, trade license scan, or insurance files were submitted for this account.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileCheck2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{doc.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{doc.fileName}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenDocPreview(doc)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

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
            placeholder="Enter administrative compliance notes, verification status rationale, or inspection observations."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
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
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
              >
                {inspectUser.role === 'DRIVER' ? 'Suspend Driver' : 'Suspend Account'}
              </button>
            )}

            {inspectUser.verificationStatus !== 'VERIFIED' && (
              <button
                onClick={() => {
                  onUpdateStatus(inspectUser.id, 'VERIFIED');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{inspectUser.role === 'DRIVER' ? 'Approve & Verify Driver' : 'Approve & Verify Organization'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
