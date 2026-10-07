import React, { useState, useMemo } from 'react';
import {
  Package,
  PlusCircle,
  Trash2,
  ExternalLink,
  Inbox,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  MapPin,
  Route,
  Gavel,
  Navigation,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import { ShipmentItem } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ConsignmentsTabProps {
  shipments: ShipmentItem[];
  onDeleteLoad?: (rawLoadId: string) => void;
  deleteLoadingId?: string | null;
  onNavigatePostLoad?: () => void;
  onNavigateBids?: () => void;
  onNavigateTracking?: () => void;
  onRateCarrier?: (item: ShipmentItem) => void;
}

export const ConsignmentsTab: React.FC<ConsignmentsTabProps> = ({
  shipments = [],
  onDeleteLoad,
  deleteLoadingId,
  onNavigatePostLoad,
  onNavigateBids,
  onNavigateTracking,
}) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: shipments.length,
      open: shipments.filter((s) => s.status === 'OPEN' || s.status === 'POSTED' || s.status === 'MATCHED').length,
      inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'ASSIGNED' || s.status === 'DISPATCHED').length,
      delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
    };
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      // Status Filter
      if (statusFilter === 'OPEN' && !(item.status === 'OPEN' || item.status === 'POSTED' || item.status === 'MATCHED')) {
        return false;
      }
      if (statusFilter === 'IN_TRANSIT' && !(item.status === 'IN_TRANSIT' || item.status === 'ASSIGNED' || item.status === 'DISPATCHED')) {
        return false;
      }
      if (statusFilter === 'DELIVERED' && item.status !== 'DELIVERED') {
        return false;
      }

      // Search Filter
      if (searchTerm.trim().length > 0) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesId = item.id?.toLowerCase().includes(q);
        const matchesOrigin = item.originName?.toLowerCase().includes(q);
        const matchesDest = item.destName?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        return matchesTitle || matchesId || matchesOrigin || matchesDest || matchesType;
      }

      return true;
    });
  }, [shipments, statusFilter, searchTerm]);

  const getStatusInfo = (status: string, isDelivered: boolean, isInTransit: boolean) => {
    if (isDelivered) {
      return {
        label: language === 'AM' ? 'ደርሷል (ዲጂታል ርክክብ)' : language === 'OM' ? 'Gaheera (e-POD)' : 'Delivered (e-POD)',
        classes: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />,
      };
    }
    if (isInTransit) {
      return {
        label: language === 'AM' ? 'በጉዞ ላይ (ቀጥታ)' : language === 'OM' ? 'Imala Irra' : 'In-Transit (Live)',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <Radio className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />,
      };
    }
    if (status === 'MATCHED') {
      return {
        label: language === 'AM' ? 'ተዛምዷል' : language === 'OM' ? 'Walsimee' : 'Matched',
        classes: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />,
      };
    }
    return {
      label: language === 'AM' ? 'ክፍት ጨረታ' : language === 'OM' ? 'Caalbaasii Banaa' : 'Open RFQ',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock className="w-3 h-3 text-amber-600 shrink-0" />,
    };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. HERO / HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('shipper.consignmentsTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              {t('shipper.consignmentsSubtitle')}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {onNavigatePostLoad && (
              <button
                type="button"
                onClick={onNavigatePostLoad}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs hover:shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('shipper.postNewLoad')}</span>
              </button>
            )}
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 relative z-10">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{t('shipper.filterAll')}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{counts.all}</div>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/60">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700">{t('shipper.filterOpen')}</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{counts.open}</div>
          </div>
          <div className="bg-sky-50/60 rounded-xl p-3.5 border border-sky-200/60">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-sky-700">{t('shipper.filterInTransit')}</div>
            <div className="text-2xl font-black text-sky-900 mt-1">{counts.inTransit}</div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200/60">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700">{t('shipper.filterDelivered')}</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{counts.delivered}</div>
          </div>
        </div>
      </div>

      {/* 2. FILTER, SEARCH & VIEW SWITCHER CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('shipper.filterAll')} ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OPEN')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('shipper.filterOpen')} ({counts.open})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_TRANSIT')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'IN_TRANSIT'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('shipper.filterInTransit')} ({counts.inTransit})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DELIVERED')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'DELIVERED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('shipper.filterDelivered')} ({counts.delivered})
          </button>
        </div>

        {/* Search Box & View Mode Toggle */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('shipper.searchConsignments')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={language === 'AM' ? 'የሰንጠረዥ እይታ' : language === 'OM' ? 'Ilaalcha Gabatee' : 'Table List View'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={language === 'AM' ? 'የካርድ እይታ' : language === 'OM' ? 'Ilaalcha Kaardii' : 'Cards Grid View'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONSIGNMENTS LIST / HIGH-DENSITY VIEW */}
      {filteredShipments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-900">
              {searchTerm || statusFilter !== 'ALL'
                ? (language === 'AM' ? 'ምንም የሚዛመድ ጭነት አልተገኘም' : language === 'OM' ? 'Fe\'isni walsimu hin argamne' : 'No matching freight consignments found')
                : (language === 'AM' ? 'ምንም የተመዘገበ ጭነት የለም' : language === 'OM' ? 'Fe\'isni galmaa\'e hin jiru' : 'No Posted Freight Consignments')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'ALL'
                ? (language === 'AM' ? 'እባክዎ ፍለጋዎን ያስተካክሉ ወይም ሌላ ማጣሪያ ይምረጡ።' : language === 'OM' ? 'Barbaacha keessan sirreessaa ykn filannoo biroo fayyadamaa.' : 'Try adjusting your search query or switching the status filter tab.')
                : (language === 'AM' ? 'እስካሁን ምንም ጭነት አልመዘገቡም። አዲስ ጭነት ለመመዝገብ ከታች ያለውን ይጫኑ።' : language === 'OM' ? 'Hanga ammaatti fe\'isa hin galchine. Fe\'isa haaraa galchuuf armaan gadi tuqaa.' : 'You have not registered any cargo postings on TradeFlow yet. Click below to broadcast your first load to verified corridor carriers.')}
            </p>
          </div>

          {onNavigatePostLoad && statusFilter === 'ALL' && (
            <button
              type="button"
              onClick={onNavigatePostLoad}
              className="mt-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'AM' ? 'የመጀመሪያ ጭነት መዝግብ' : language === 'OM' ? 'Fe\'isa Jalqabaa Galchi' : 'Post First Consignment'}</span>
            </button>
          )}
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE / HIGH-DENSITY TMS VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">
                    {language === 'AM' ? 'ጭነት / ዓይነት' : language === 'OM' ? 'Fe\'isa / Akaakuu' : 'Cargo / Commodity'}
                  </th>
                  <th className="py-3 px-4">
                    {language === 'AM' ? 'የኮሪደር መስመር' : language === 'OM' ? 'Daandii Koriidaraa' : 'Corridor Route'}
                  </th>
                  <th className="py-3 px-4">
                    {language === 'AM' ? 'ክብደት እና ዋጋ' : language === 'OM' ? 'Ulfaatina & Baajata' : 'Payload & Budget'}
                  </th>
                  <th className="py-3 px-4">
                    {language === 'AM' ? 'ሁኔታ' : language === 'OM' ? 'Haala' : 'Status'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {language === 'AM' ? 'ተግባራት' : language === 'OM' ? 'Tarkaanfii' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredShipments.map((item) => {
                  const isDelivered = item.status === 'DELIVERED';
                  const isInTransit = item.status === 'IN_TRANSIT' || item.status === 'ASSIGNED' || item.status === 'DISPATCHED';
                  const isExpanded = expandedRowId === item.id;
                  const statusInfo = getStatusInfo(item.status, isDelivered, isInTransit);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Cargo title & type */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{item.title}</span>
                                {item.type && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                                    {item.type.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{item.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Route */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{item.originName || 'Origin'}</span>
                              <span className="text-sky-600 font-black">➔</span>
                              <span>{item.destName || 'Destination'}</span>
                            </div>
                            {item.distanceKm && (
                              <div className="text-[10.5px] font-mono font-bold text-sky-700">
                                {item.distanceKm} km
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Weight & Budget */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900">
                              {item.weight || (item.weightTons ? `${item.weightTons} Tons` : '—')}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {item.budget || (item.targetBudgetEtb ? `ETB ${item.targetBudgetEtb.toLocaleString()}` : (language === 'AM' ? 'ክፍት ጨረታ' : language === 'OM' ? 'Caalbaasii Banaa' : 'Open RFQ'))}
                            </div>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${statusInfo.classes}`}>
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        {/* 5. Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quotes button */}
                            {item.bidsCount && item.bidsCount > 0 ? (
                              <button
                                type="button"
                                onClick={onNavigateBids}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title={language === 'AM' ? 'የቀረቡ ዋጋዎችን እይ' : language === 'OM' ? 'Dhiyeessii Gatii Ilaali' : 'View Carrier Quotes'}
                              >
                                <Gavel className="w-3 h-3 text-emerald-600" />
                                <span>{item.bidsCount}</span>
                              </button>
                            ) : null}

                            {/* Live Track / e-POD */}
                            {(isInTransit || isDelivered) && onNavigateTracking && (
                              <button
                                type="button"
                                onClick={onNavigateTracking}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                                  isDelivered
                                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                                }`}
                                title={isDelivered ? (language === 'AM' ? 'ዲጂታል ርክክብ እይ' : 'View e-POD') : (language === 'AM' ? 'ቀጥታ ተከታተል' : 'Live Tracking')}
                              >
                                <Navigation className="w-3 h-3 text-sky-600" />
                                <span>{isDelivered ? 'e-POD' : (language === 'AM' ? 'መከታተያ' : 'Track')}</span>
                              </button>
                            )}

                            {/* Post-Delivery Rate Carrier Action */}
                            {isDelivered && onRateCarrier && (
                              <button
                                type="button"
                                onClick={() => onRateCarrier(item)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                                title={language === 'AM' ? 'አጓጓዥ ደረጃ ስጥ' : 'Rate Carrier ★'}
                              >
                                <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                                <span>{language === 'AM' ? 'ደረጃ ስጥ ★' : 'Rate ★'}</span>
                              </button>
                            )}

                            {/* Delete button */}
                            {onDeleteLoad && (
                              <button
                                type="button"
                                onClick={() => onDeleteLoad(item.rawId)}
                                disabled={deleteLoadingId === item.rawId}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                                title={language === 'AM' ? 'ጭነት ሰርዝ' : language === 'OM' ? 'Fe\'isa Haqi' : 'Delete Consignment'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Expand details button */}
                            {item.cargoDescription && (
                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title={language === 'AM' ? 'ተጨማሪ ዝርዝር' : 'Details'}
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable details drawer */}
                      {isExpanded && item.cargoDescription && (
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <td colSpan={5} className="py-2.5 px-6">
                            <div className="text-xs text-slate-600 flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200/80">
                              <span className="font-bold text-slate-800 shrink-0">
                                {language === 'AM' ? 'የጭነት ዝርዝር ማብራሪያ፡' : language === 'OM' ? 'Ibsa Fe\'isaa:' : 'Cargo Description & Details:'}
                              </span>
                              <span>{item.cargoDescription}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* COMPACT STREAMLINED CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredShipments.map((item) => {
            const isDelivered = item.status === 'DELIVERED';
            const isInTransit = item.status === 'IN_TRANSIT' || item.status === 'ASSIGNED' || item.status === 'DISPATCHED';
            const statusInfo = getStatusInfo(item.status, isDelivered, isInTransit);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Top Row: Title, Type badge & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 truncate capitalize">
                          {item.title}
                        </h3>
                        {item.type && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                            {item.type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{item.createdAt}</span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0 ${statusInfo.classes}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Corridor Route */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                      <span className="truncate">{item.originName || 'Origin'}</span>
                      <span className="text-sky-600 font-black shrink-0">➔</span>
                      <span className="truncate">{item.destName || 'Destination'}</span>
                    </div>
                    {item.distanceKm && (
                      <span className="font-mono text-[10.5px] font-bold text-sky-700 shrink-0">
                        {item.distanceKm} km
                      </span>
                    )}
                  </div>

                  {/* Weight & Budget stats */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {language === 'AM' ? 'ክብደት' : language === 'OM' ? 'Ulfaatina' : 'Weight'}
                      </span>
                      <span className="font-bold text-slate-800">
                        {item.weight || (item.weightTons ? `${item.weightTons} Tons` : '—')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {language === 'AM' ? 'የታሰበ በጀት' : language === 'OM' ? 'Baajata' : 'Target Budget'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {item.budget || (item.targetBudgetEtb ? `ETB ${item.targetBudgetEtb.toLocaleString()}` : (language === 'AM' ? 'ክፍት ጨረታ' : 'Open RFQ'))}
                      </span>
                    </div>
                  </div>

                  {item.cargoDescription && (
                    <p className="text-[11px] text-slate-500 bg-slate-50/60 p-2 rounded-lg border border-slate-100 line-clamp-2">
                      {item.cargoDescription}
                    </p>
                  )}
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {item.bidsCount && item.bidsCount > 0 ? (
                      <button
                        type="button"
                        onClick={onNavigateBids}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Gavel className="w-3 h-3 text-emerald-600" />
                        <span>{item.bidsCount} Quotes</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {language === 'AM' ? 'ዋጋ እየተጠበቀ...' : language === 'OM' ? 'Gatii eegaa...' : 'Awaiting quotes'}
                      </span>
                    )}

                    {(isInTransit || isDelivered) && onNavigateTracking && (
                      <button
                        type="button"
                        onClick={onNavigateTracking}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                          isDelivered
                            ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        <Navigation className="w-3 h-3 text-sky-600" />
                        <span>{isDelivered ? 'e-POD' : (language === 'AM' ? 'መከታተያ' : 'Track')}</span>
                      </button>
                    )}

                    {isDelivered && onRateCarrier && (
                      <button
                        type="button"
                        onClick={() => onRateCarrier(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                        title={language === 'AM' ? 'አጓጓዥ ደረጃ ስጥ' : 'Rate Carrier ★'}
                      >
                        <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                        <span>{language === 'AM' ? 'ደረጃ ስጥ ★' : 'Rate ★'}</span>
                      </button>
                    )}
                  </div>

                  {onDeleteLoad && (
                    <button
                      type="button"
                      onClick={() => onDeleteLoad(item.rawId)}
                      disabled={deleteLoadingId === item.rawId}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                      title={language === 'AM' ? 'ጭነት ሰርዝ' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
