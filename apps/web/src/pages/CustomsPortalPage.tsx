import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Inbox,
  Search,
} from 'lucide-react';

export const CustomsPortalPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('review-queue');

  return (
    <DashboardLayout
      portalRole="CUSTOMS"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* 1. DOCUMENT REVIEW QUEUE */}
      {activeTab === 'review-queue' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#064E3B] to-[#059669] text-white shadow-lg">
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                {language === 'AM' ? 'የጉምሩክ ባለስልጣን ፖርታል' : 'Customs Authority Portal'}
              </h1>
              <p className="text-xs text-slate-200 mt-1">
                {language === 'AM' ? 'የገላፊ ድንበር እና የደረቅ ወደቦች የሰነድ ማረጋገጫ' : 'Border Post Single Window Inspection System'}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'ለማጣራት የቀረበ አዲስ የጉምሩክ ሰነድ የለም' : 'No declarations in review queue'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'አስመጪዎች እና አስተላላፊዎች ሰነድ ሲያስገቡ እዚህ ጋር ይዘረዘራሉ።' : 'Submitted declaration files will appear here for OCR compliance review.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. COMPLIANCE VALIDATION */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የህጋዊነት እና የታሪፍ ማጣሪያ' : 'Compliance & Tariff Validation'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'ማጣሪያ የሚደረግበት ሰነድ ይምረጡ' : 'Select a declaration to validate compliance'}
            </div>
          </div>
        </div>
      )}

      {/* 3. CLEARANCE STATUS */}
      {activeTab === 'clearance' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የመልቀቂያ ፈቃድ ሁኔታ' : 'Clearance Status Management'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'የተሰጡ የመልቀቂያ ፈቃዶች እዚህ ይመዘገባሉ' : 'Clearance approval records will display here'}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
