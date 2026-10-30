import React from 'react';
import {
  FileCheck2,
  FileText,
  Shield,
  CheckCircle2,
  CheckCircle,
  Truck,
  Eye,
  User,
  Phone,
  CreditCard,
  Award,
  Clock,
  Building2,
  X,
  ShieldAlert,
  AlertCircle,
  UserX,
  FileSpreadsheet
} from 'lucide-react';
import { VerificationUser, DocumentPreviewData } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

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
  const { language: rawLanguage } = useLanguage();
  const isAm = (rawLanguage || '').toUpperCase() === 'AM';
  const isOm = (rawLanguage || '').toUpperCase() === 'OM';
  const language = isAm ? 'am' : isOm ? 'om' : 'en';
  if (!inspectUser) return null;

  const isDriver = inspectUser.role === 'DRIVER';
  const isCustoms = inspectUser.role === 'CUSTOMS_OFFICER';
  const isTransporter = inspectUser.role === 'TRANSPORTER';

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
      if (val.startsWith('data:image/')) {
        const mime = val.substring(11, val.indexOf(';'));
        const ext = mime === 'jpeg' ? 'jpg' : mime;
        fileName = fallbackName.replace(/\.[^/.]+$/, `.${ext}`);
      } else {
        fileName = fallbackName;
      }
    } else {
      fileName = val;
    }

    return { fileName, fileUrl };
  };

  // Compile submitted documents
  const docs: DocumentPreviewData[] = [];

  if (isDriver) {
    const licenseNo = inspectUser.driverProfile?.driverLicenseNo || 'DL-PENDING';
    const cleanName = (inspectUser.fullName || 'Driver').replace(/\s+/g, '_');
    const fallbackName = `Commercial_Driver_License_${licenseNo}_${cleanName}.jpg`;
    const licenseParsed = inspectUser.tradeLicenseDoc
      ? parseDocumentValue(inspectUser.tradeLicenseDoc, fallbackName)
      : null;

    docs.push({
      title: "Commercial Driver's License (CDL)",
      docType: 'DRIVER_LICENSE',
      docNumber: licenseNo,
      issuer: 'Federal Transport Authority (FTA) - Driver Licensing Division',
      fileName: licenseParsed ? licenseParsed.fileName : fallbackName,
      fileUrl: licenseParsed ? licenseParsed.fileUrl : undefined,
      status: inspectUser.verificationStatus,
      issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
      ownerName: inspectUser.fullName,
    });
  } else {
    // Non-driver documents
    if (inspectUser.insuranceDoc) {
      const fallbackName = `Insurance_GIT_${inspectUser.companyName || inspectUser.fullName}.pdf`.replace(/\s+/g, '_');
      const parsed = parseDocumentValue(inspectUser.insuranceDoc, fallbackName);
      if (parsed) {
        docs.push({
          title: 'Goods in Transit (GIT) Cargo Insurance',
          docType: 'INSURANCE_GIT',
          docNumber: `GIT-${inspectUser.tin || 'PENDING'}`,
          issuer: 'Commercial Insurer / National Insurance Fund',
          fileName: parsed.fileName,
          fileUrl: parsed.fileUrl,
          status: inspectUser.verificationStatus,
          issuedDate: new Date(inspectUser.createdAt).toLocaleDateString(),
          ownerName: inspectUser.companyName || inspectUser.fullName,
        });
      }
    }

    if (inspectUser.roadworthinessDoc) {
      const fallbackName = `Roadworthiness_FTA_${inspectUser.companyName || inspectUser.fullName}.pdf`.replace(/\s+/g, '_');
      const parsed = parseDocumentValue(inspectUser.roadworthinessDoc, fallbackName);
      if (parsed) {
        docs.push({
          title: 'FTA Roadworthiness Fleet Certificate',
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

    if (inspectUser.tradeLicenseDoc) {
      const fallbackName = inspectUser.tradeLicenseNo
        ? `Trade_License_${inspectUser.tradeLicenseNo}.pdf`
        : 'Trade_License_Certificate.pdf';
      const parsed = parseDocumentValue(inspectUser.tradeLicenseDoc, fallbackName);
      if (parsed) {
        docs.push({
          title: 'Commercial Trade License & Registration',
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

    (inspectUser.vehicles || []).forEach((v: any) => {
      if (v.insuranceDocUrl) {
        docs.push({
          title: `Vehicle Fleet Insurance (${v.plateNumber})`,
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
          title: `Fleet Roadworthiness (${v.plateNumber})`,
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
  }

  const getDocExtension = (name: string) => {
    const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
    return ext.length <= 4 ? ext : 'DOC';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/60 via-white to-slate-50/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isDriver
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/20'
                    : isCustoms
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/20'
                    : 'bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-sky-500/20'
                }`}
              >
                {isDriver ? (
                  <Truck className="w-6 h-6" />
                ) : isCustoms ? (
                  <Shield className="w-6 h-6" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isDriver
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : isCustoms
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}
                  >
                    {isDriver
                      ? (language === 'am' ? 'የተፈቀደለት የንግድ አሽከርካሪ' : language === 'om' ? 'Konkolaachisaa Daldalaa Hayyamame' : 'Authorized Commercial Driver')
                      : isCustoms
                      ? (language === 'am' ? 'የጉምሩክ ባለስልጣን ተቆጣጣሪ' : language === 'om' ? 'To’ataa Gumruukaa Seeraa' : 'Official Customs Inspector')
                      : inspectUser.role}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                      inspectUser.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : inspectUser.verificationStatus === 'SUSPENDED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        inspectUser.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500'
                          : inspectUser.verificationStatus === 'SUSPENDED'
                          ? 'bg-rose-500'
                          : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    <span>
                      {inspectUser.verificationStatus === 'VERIFIED'
                        ? (language === 'am' ? 'የተረጋገጠ' : language === 'om' ? 'Mirkanaa’e' : 'VERIFIED')
                        : inspectUser.verificationStatus === 'SUSPENDED'
                        ? (language === 'am' ? 'የታገደ' : language === 'om' ? 'Haqame' : 'SUSPENDED')
                        : (language === 'am' ? 'በመጠባበቅ ላይ' : language === 'om' ? 'Eeggachaa Jira' : 'PENDING')}
                    </span>
                  </span>

                  {inspectUser.tin && (
                    <span className="text-[11px] text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      TIN: {inspectUser.tin}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isDriver
                    ? inspectUser.fullName
                    : isCustoms
                    ? inspectUser.fullName
                    : (inspectUser.companyName || inspectUser.fullName)}
                </h2>

                {isDriver && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'am' ? 'ቀጣሪ ትራንስፖርተር:' : language === 'om' ? 'Fe’aa Qacare:' : 'Employing Transporter:'}</span>
                    <strong className="text-slate-800 font-bold">
                      {inspectUser.companyName || 'TradeFlow Fleet Network'}
                    </strong>
                  </p>
                )}

                {isCustoms && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'am' ? 'የስራ ጣቢያ / ኬላ:' : language === 'om' ? 'Buufata Hojii:' : 'Official Station:'}</span>
                    <strong className="text-slate-800 font-bold">
                      {inspectUser.companyName || 'Galafi Border Checkpoint'}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Close Inspection Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Key Credentials Card */}
          {isDriver ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {language === 'am' ? 'የአሽከርካሪ ብቃት እና የተሽከርካሪ መገለጫ' : language === 'om' ? 'Gahumsa Konkolaachisaa fi Piroofayilii Konkolaataa' : 'Driver Qualification & Fleet Profile'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> {language === 'am' ? 'ሙሉ ስም' : language === 'om' ? 'Maqaa Guutuu' : 'Full Name'}
                  </span>
                  <div className="text-xs font-black text-slate-900">{inspectUser.fullName}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {language === 'am' ? 'ስልክ ቁጥር' : language === 'om' ? 'Bilbila Qunnamtii' : 'Direct Contact'}
                  </span>
                  <div className="text-xs font-bold text-slate-800 font-mono">{inspectUser.phone}</div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-indigo-500" /> {language === 'am' ? 'የመንጃ ፈቃድ ቁጥር' : language === 'om' ? 'Lakkoofsa Hayyama Konkolaachisummaa' : 'License Number'}
                  </span>
                  <div>
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                      {inspectUser.driverProfile?.driverLicenseNo || (language === 'am' ? 'ማስረጃ ይጠበቃል' : language === 'om' ? 'Eeggachaa Jira' : 'Pending Submission')}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-slate-400" /> {language === 'am' ? 'የመንጃ ፈቃድ ደረጃ' : language === 'om' ? 'Sadarkaa Hayyamaa' : 'License Class'}
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {inspectUser.driverProfile?.licenseClass || (language === 'am' ? 'ደረጃ 5 የከባድ ጭነት' : language === 'om' ? 'Sadarkaa 5 Fe’iisa Cimaa' : 'Grade 5 Heavy Freight')}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {language === 'am' ? 'የኮሪደር ልምድ' : language === 'om' ? 'Muuxannoo Koriidarii' : 'Corridor Experience'}
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {inspectUser.driverProfile?.experienceYears || 4} {language === 'am' ? 'ዓመታት የከባድ ጭነት' : language === 'om' ? 'Waggaa Fe’iisa Cimaa' : 'Years Heavy Freight'}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-sky-500" /> {language === 'am' ? 'የተመደበለት ተሽከርካሪ' : language === 'om' ? 'Konkolaataa Ramadame' : 'Assigned Vehicle'}
                  </span>
                  <div>
                    {inspectUser.driverProfile?.assignedVehicle ? (
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md inline-block">
                        {inspectUser.driverProfile.assignedVehicle.plateNumber}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md inline-block">
                        {language === 'am' ? 'ያልተመደበ' : language === 'om' ? 'Hin Ramadamne' : 'Unassigned (Pool)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isCustoms ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {language === 'am' ? 'የጉምሩክ ባለስልጣን ኦፊሴላዊ ማስረጃዎች' : language === 'om' ? 'Ragaalee To’ataa Gumruukaa Seeraa' : 'Customs Officer Regulatory Credentials'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'የተቆጣጣሪ ስም' : language === 'om' ? 'Maqaa To’ataa' : 'Inspector Name'}</span>
                  <span className="font-black text-slate-900">{inspectUser.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'ስልክ ቁጥር' : language === 'om' ? 'Bilbila Qunnamtii' : 'Contact Phone'}</span>
                  <span className="font-mono font-bold text-slate-800">{inspectUser.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'የባጅ መታወቂያ' : language === 'om' ? 'Waraqaa Eenyummaa Baajii' : 'Government Badge ID'}</span>
                  <span className="font-mono font-black text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md inline-block">
                    {inspectUser.tin || 'ECC-INSPECTOR-2026'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'ኦፊሴላዊ ኢሜይል' : language === 'om' ? 'Imeelii Hojii' : 'Official Email'}</span>
                  <span className="font-mono text-slate-700 font-medium truncate block">{inspectUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'የኬላ ጣቢያ' : language === 'om' ? 'Buufata Qorannoo' : 'Station Checkpoint'}</span>
                  <span className="font-bold text-slate-900">{inspectUser.companyName || 'Galafi Border Checkpoint'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'ተቆጣጣሪ ኮሚሽን' : language === 'om' ? 'Koomishinii To’annoo' : 'Regulatory Commission'}</span>
                  <span className="font-bold text-amber-900">{language === 'am' ? 'የኢትዮጵያ ጉምሩክ ኮሚሽን (ECC)' : language === 'om' ? 'Koomishinii Gumruukaa Itoophiyaa (ECC)' : 'Ethiopian Customs Commission (ECC)'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {language === 'am' ? 'የንግድ ህጋዊነት እና ምዝገባ' : language === 'om' ? 'Seerummaa Daldalaa fi Galmee' : 'Commercial Identity & Legal Registration'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'ህጋዊ ወኪል' : language === 'om' ? 'Bakka Bu’aa' : 'Representative'}</span>
                  <span className="font-black text-slate-900">{inspectUser.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'ስልክ እና ኢሜይል' : language === 'om' ? 'Bilbila fi Imeelii' : 'Phone & Email'}</span>
                  <span className="font-bold text-slate-800">{inspectUser.phone} • {inspectUser.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'የግብር ከፋይ መለያ ቁጥር (ቲን)' : language === 'om' ? 'Lakkoofsa Kaffalaa Gibiraa (TIN)' : 'Tax Identification Number (TIN)'}</span>
                  <span className="font-mono font-black text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md inline-block">
                    {inspectUser.tin || (language === 'am' ? 'አልተሰጠም' : language === 'om' ? 'Hin Kennamne' : 'Not Provided')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{language === 'am' ? 'የንግድ ፈቃድ ቁጥር' : language === 'om' ? 'Lakkoofsa Hayyama Daldalaa' : 'Trade License Number'}</span>
                  <span className="font-mono font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                    {inspectUser.tradeLicenseNo || (language === 'am' ? 'አልተሰጠም' : language === 'om' ? 'Hin Kennamne' : 'Not Provided')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submitted Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-slate-600" />
                <span>
                  {isDriver
                    ? (language === 'am'
                        ? `የቀረቡ የአሽከርካሪ ማስረጃዎች እና መታወቂያዎች (${docs.length})`
                        : language === 'om'
                        ? `Ragaalee Konkolaachisaa Dhiyaatan (${docs.length})`
                        : `Submitted Driver Credentials & Identification (${docs.length})`)
                    : (language === 'am'
                        ? `የቀረቡ የማረጋገጫ ሰነዶች እና የምስክር ወረቀቶች (${docs.length})`
                        : language === 'om'
                        ? `Sanadoota Mirkaneessaa Dhiyaatan (${docs.length})`
                        : `Submitted Verification Documents & Certificates (${docs.length})`)}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'am' ? 'ሰነዱን ሙሉ ለሙሉ ለማየት መርምርን ይጫኑ' : language === 'om' ? 'Sanada guutuu arguuf Qoradhu cuqaasaa' : 'Click Inspect to preview full file'}
              </span>
            </div>

            {docs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  {language === 'am' ? 'ምንም የተያያዘ የማረጋገጫ ሰነድ የለም' : language === 'om' ? 'Sanadni Mirkaneessaa Hin Qabsiifamne' : 'No Verification Documents Attached'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {language === 'am'
                    ? 'ለዚህ አካውንት የተላከ ዲጂታል የምስክር ወረቀት፣ የመንጃ ፈቃድ ቅጅ ወይም የኢንሹራንስ ፋይል የለም።'
                    : language === 'om'
                    ? 'Akkaawuntii kanaaf waraqaan ragaa, kooppii hayyamaa ykn inshuraansii hin dhiyaanne.'
                    : 'No digital certificate, driver license scan, or insurance files were submitted for this account.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {docs.map((doc, idx) => {
                  const ext = getDocExtension(doc.fileName);
                  const isImage = ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs ${
                            isImage
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {isImage ? <FileCheck2 className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5 text-rose-600" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 tracking-tight">
                              {doc.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                              {ext}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate max-w-sm sm:max-w-md mt-0.5">
                            {doc.fileName}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {language === 'am' ? 'አውጪ አካል:' : language === 'om' ? 'Qaama Kennise:' : 'Issuer:'} <span className="font-semibold text-slate-600">{doc.issuer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => onOpenDocPreview(doc)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 hover:border-indigo-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'am' ? 'ሰነድ መርምር' : language === 'om' ? 'Sanada Qoradhu' : 'Inspect Document'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Registered Fleet (If Transporter) */}
          {inspectUser.vehicles && inspectUser.vehicles.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-600" />
                <span>
                  {language === 'am'
                    ? `የተመዘገቡ የፍሊት ተሽከርካሪዎች (${inspectUser.vehicles.length})`
                    : language === 'om'
                    ? `Konkolaattota Galmaa’an (${inspectUser.vehicles.length})`
                    : `Registered Fleet Vehicles (${inspectUser.vehicles.length})`}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {inspectUser.vehicles.map((v: any) => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
                        <span>{v.plateNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {v.vehicleType} • {v.capacityTons} {language === 'am' ? 'ቶን የመጫን አቅም' : language === 'om' ? 'Dandeettii Toonii' : 'Tons Capacity'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {language === 'am' ? 'ንቁ' : language === 'om' ? 'Hojiirra' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Administrator Audit Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {language === 'am'
                  ? 'የአስተዳዳሪ ተገዢነት እና ማረጋገጫ ማስታወሻዎች'
                  : language === 'om'
                  ? 'Yaada Hordoffii fi Mirkaneessaa Bulchaa'
                  : 'Administrator Compliance & Verification Notes'}
              </span>
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={language === 'am' ? 'የተገዢነት ማስታወሻዎችን፣ የማረጋገጫ ውሳኔ ምክንያት ወይም የፍተሻ ምልከታዎችን እዚህ ይጻፉ...' : language === 'om' ? 'Yaada hordoffii, sababa murtee mirkaneessaa ykn qorannoo barreessaa...' : 'Enter administrative compliance notes, verification status rationale, or inspection observations.'}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            {language === 'am' ? 'መስኮቱን ዝጋ' : language === 'om' ? 'Foddaa Cufi' : 'Close Window'}
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {inspectUser.verificationStatus !== 'SUSPENDED' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(inspectUser.id, 'SUSPENDED');
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>
                  {isDriver
                    ? (language === 'am' ? 'አሽከርካሪውን አግድ' : language === 'om' ? 'Konkolaachisaa Dorki' : 'Suspend Driver')
                    : (language === 'am' ? 'መለያውን አግድ' : language === 'om' ? 'Akkaawuntii Dorki' : 'Suspend Account')}
                </span>
              </button>
            )}

            {inspectUser.verificationStatus !== 'VERIFIED' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(inspectUser.id, 'VERIFIED');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {isDriver
                    ? (language === 'am' ? 'አሽከርካሪውን አጽድቅ እና አረጋግጥ' : language === 'om' ? 'Konkolaachisaa Mirkaneessi' : 'Approve & Verify Driver')
                    : (language === 'am' ? 'ድርጅቱን አጽድቅ እና አረጋግጥ' : language === 'om' ? 'Dhaabbata Mirkaneessi' : 'Approve & Verify Organization')}
                </span>
              </button>
            )}

            {inspectUser.verificationStatus === 'SUSPENDED' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(inspectUser.id, 'VERIFIED');
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {language === 'am' ? 'እገዳ አንሳ / እንደገና አረጋግጥ' : language === 'om' ? 'Dorkaa Kaasi / Deebisii Mirkaneessi' : 'Reinstate / Verify Driver'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
