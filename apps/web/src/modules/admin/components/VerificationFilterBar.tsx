import React from 'react';
import { Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface VerificationFilterBarProps {
  totalUsersCount: number;
  statusFilter: 'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  setStatusFilter: (val: 'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED') => void;
  pendingCount: number;
  verifiedCount: number;
  suspendedCount: number;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const VerificationFilterBar: React.FC<VerificationFilterBarProps> = ({
  totalUsersCount,
  statusFilter,
  setStatusFilter,
  pendingCount,
  verifiedCount,
  suspendedCount,
  roleFilter,
  setRoleFilter,
  searchQuery,
  setSearchQuery,
}) => {
  const { language } = useLanguage();

  return (
    <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
      {/* 1. Status Filter Pills */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {language === 'AM' ? `ሁሉም (${totalUsersCount})` : language === 'OM' ? `Hundaa (${totalUsersCount})` : `All (${totalUsersCount})`}
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'AM' ? `የሚጠባበቁ (${pendingCount})` : language === 'OM' ? `Eegamu (${pendingCount})` : `Pending (${pendingCount})`}</span>
        </button>

        <button
          onClick={() => setStatusFilter('VERIFIED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            statusFilter === 'VERIFIED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{language === 'AM' ? `የተረጋገጡ (${verifiedCount})` : language === 'OM' ? `Mirkanaa'an (${verifiedCount})` : `Verified (${verifiedCount})`}</span>
        </button>

        <button
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            statusFilter === 'SUSPENDED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>{language === 'AM' ? `የታገዱ (${suspendedCount})` : language === 'OM' ? `Dhoorkaman (${suspendedCount})` : `Suspended (${suspendedCount})`}</span>
        </button>
      </div>

      {/* 2. Role Selector & Search Input */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 outline-none focus:border-[#0284C7] cursor-pointer"
        >
          <option value="ALL">{language === 'AM' ? 'ሁሉም ሚናዎች' : language === 'OM' ? 'Ga\'ee Hundaa' : 'All Roles'}</option>
          <option value="SHIPPER">{language === 'AM' ? 'የጭነት ባለቤት (Shipper)' : language === 'OM' ? 'Abbaa Fe\'isaa' : 'Shipper'}</option>
          <option value="TRANSPORTER">{language === 'AM' ? 'አጓጓዥ (Transporter)' : language === 'OM' ? 'Geejjibsiisaa' : 'Transporter'}</option>
          <option value="FREIGHT_FORWARDER">{language === 'AM' ? 'የጭነት አስተላላፊ (Forwarder)' : language === 'OM' ? 'Ergaa Fe\'isaa' : 'Freight Forwarder'}</option>
          <option value="DRIVER">{language === 'AM' ? 'አሽከርካሪ (Driver)' : language === 'OM' ? 'Konkolaachisaa' : 'Driver'}</option>
          <option value="CUSTOMS_OFFICER">{language === 'AM' ? 'የጉምሩክ መርማሪ (Customs)' : language === 'OM' ? 'Sakatta\'aa Gumruukaa' : 'Customs Inspector'}</option>
        </select>

        <div className="relative flex-1 md:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'AM' ? 'ድርጅት፣ ቲን (TIN)፣ ስም ፈልግ...' : language === 'OM' ? 'Dhaabbata, TIN, maqaa barbaadi...' : 'Search company, TIN, name...'}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 outline-none focus:border-[#0284C7]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>
    </div>
  );
};
