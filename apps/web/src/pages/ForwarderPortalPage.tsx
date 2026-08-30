import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Layers,
  FileCheck2,
  GitMerge,
  Package,
  TrendingUp,
  Inbox,
  Plus,
} from 'lucide-react';

export const ForwarderPortalPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('multi-shipper');

  // Dynamic LTL Consolidation state
  const [ltlList, setLtlList] = useState<any[]>([]);

  return (
    <DashboardLayout
      portalRole="FORWARDER"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* 1. MULTI-SHIPPER DASHBOARD */}
      {activeTab === 'multi-shipper' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#7C3AED] text-white shadow-lg">
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                {language === 'AM' ? 'የጭነት አስተላላፊ ፖርታል' : 'Freight Forwarder Portal'}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'AM' ? 'የደንበኞች እና የቡድን ጭነቶች አስተዳደር' : 'Multi-Client Freight & LTL Consolidation Management'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 text-[#7C3AED]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'ንቁ ደንበኞች' : 'Active Clients'}
                </div>
                <div className="text-xl font-black text-slate-900">0</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'የተጠቃለሉ ጭነቶች' : 'Consolidated FTLs'}
                </div>
                <div className="text-xl font-black text-slate-900">0</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  {language === 'AM' ? 'አማካይ ቁጠባ' : 'Average Savings'}
                </div>
                <div className="text-xl font-black text-slate-900">0%</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'የተመዘገቡ የደንበኞች ጭነቶች በመጠበቅ ላይ...' : 'Awaiting client load submissions'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'ደንበኞች አዳዲስ ጭነቶችን ሲያስመዘግቡ እዚህ ጋር ይዘረዘራሉ።' : 'Shipper client assignments will populate in this dashboard.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. CONSOLIDATED LOAD MANAGEMENT */}
      {activeTab === 'consolidation' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የጭነት ማጠቃለያ ሞጁል (LTL to FTL)' : 'LTL Consolidation Wizard'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'ለማጠቃለል የቀረበ ከፊል ጭነት (LTL) የለም' : 'No pending partial loads available'}
            </div>
            <p className="text-xs text-slate-400">
              {language === 'AM' ? 'አነስተኛ ጭነቶች ሲመዘገቡ በአንድ ሙሉ ኮንቴይነር (FTL) ለማጠቃለል እዚህ ጋር ማስተካከል ይችላሉ።' : 'Combine multiple smaller LTL loads into a single high-cube FTL container.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. CUSTOMS COORDINATION */}
      {activeTab === 'customs-coord' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የጉምሩክ ሰነዶች ቅንጅት' : 'Batch Customs Document Filing'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'የተያዘ የጉምሩክ ሰነድ የለም' : 'No customs declarations in queue'}
            </div>
          </div>
        </div>
      )}

      {/* 4. MULTI-MODAL TRACKING */}
      {activeTab === 'multimodal' && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'AM' ? 'የባለብዙ-ትራንስፖርት ክትትል' : 'Multi-Modal Corridor Tracking'}
          </h2>

          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
            <GitMerge className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-700">
              {language === 'AM' ? 'የወደብና የባቡር ትራንስፖርት ክትትል ዝግጁ ነው' : 'Multi-modal transit stream ready'}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
