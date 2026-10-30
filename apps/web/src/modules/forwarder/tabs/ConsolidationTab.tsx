import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Package,
  TrendingDown,
  Truck,
  Building,
  Plus,
  ArrowRight,
  Box,
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { LtlLoadItem, ConsolidationDossier } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ConsolidationTabProps {
  ltlLoads: LtlLoadItem[];
  consolidatedHistory: ConsolidationDossier[];
  loading: boolean;
  onRefresh: () => void;
  onConsolidate: (
    loadIds: string[],
    containerType: string,
    masterTitle: string,
    origin: string,
    destination: string,
    targetCarrierBudgetEtb: number
  ) => Promise<void>;
}

export const ConsolidationTab: React.FC<ConsolidationTabProps> = ({
  ltlLoads = [],
  consolidatedHistory = [],
  loading,
  onRefresh,
  onConsolidate,
}) => {
  const { language, t } = useLanguage();
  const [selectedLoadIds, setSelectedLoadIds] = useState<string[]>([]);
  const [containerType, setContainerType] = useState('40FT_HIGH_CUBE');
  const [masterTitle, setMasterTitle] = useState('Consolidated Export Freight Container');
  const [originStation, setOriginStation] = useState('Modjo Dry Port Multimodal Terminal');
  const [destStation, setDestStation] = useState('Djibouti Port Red Sea Terminal');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Container Limits
  const maxWeightTons = containerType.includes('20FT') ? 24.0 : 30.0;
  const maxVolumeCbm = containerType.includes('20FT') ? 33.2 : 76.2;

  // Compute selected metrics
  const selectedLoads = ltlLoads.filter((l) => selectedLoadIds.includes(l.id));
  const currentTotalWeight = selectedLoads.reduce((sum, l) => sum + (l.weightTons || 0), 0);
  const currentTotalVolume = selectedLoads.reduce((sum, l) => sum + (l.volumeCbm || 0), 0);
  const separateCostSum = selectedLoads.reduce((sum, l) => sum + (l.targetBudgetEtb || 0), 0);

  // 28% to 32% consolidation savings
  const consolidatedRate = Math.round(separateCostSum * 0.72);
  const totalSavings = separateCostSum - consolidatedRate;
  const savingsPct = separateCostSum > 0 ? Math.round((totalSavings / separateCostSum) * 100) : 0;

  const weightPct = Math.min(100, Math.round((currentTotalWeight / maxWeightTons) * 100));
  const volumePct = Math.min(100, Math.round((currentTotalVolume / maxVolumeCbm) * 100));

  const toggleSelectLoad = (id: string) => {
    setSelectedLoadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteConsolidation = async () => {
    if (selectedLoadIds.length < 2) {
      alert(
        language === 'AM'
          ? 'እባክዎ በአንድ ኮንቴነር ውስጥ ለማዋሃድ ቢያንስ 2 ከፊል LTL ጭነቶችን ይምረጡ።'
          : language === 'OM'
          ? 'Maaloo konteenara tokko keessatti walitti makuuf yoo xiqqaate feʼiisa LTL 2 filadhaa.'
          : 'Please select at least 2 partial LTL loads to consolidate into a single container.'
      );
      return;
    }
    setSubmitting(true);
    try {
      await onConsolidate(
        selectedLoadIds,
        containerType,
        masterTitle,
        originStation,
        destStation,
        consolidatedRate
      );
      setSuccessNotice(
        language === 'AM'
          ? `🎉 ${selectedLoadIds.length} የLTL ጭነቶች በተሳካ ሁኔታ ተዋህደዋል! ኮንቴነር ተመዝግቧል።`
          : language === 'OM'
          ? `🎉 Feʼiisota LTL ${selectedLoadIds.length} milkaaʼinaan walitti makamaniiru! Konteenarri galmaaʼeera.`
          : `🎉 Successfully consolidated ${selectedLoadIds.length} LTL shipments! Container registered.`
      );
      setSelectedLoadIds([]);
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err: any) {
      alert(err.message || 'Consolidation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('forwarder.consolidationTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {t('forwarder.consolidationSubtitle')}
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* 2. Live Container Utilization & Savings Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weight Capacity Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'AM' ? 'የክብደት አቅም' : language === 'OM' ? 'Dandeettii Ulfaatinnaa' : 'Weight Capacity'}</span>
            </span>
            <span className="font-mono font-black text-slate-900">
              {currentTotalWeight.toFixed(1)} / {maxWeightTons} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                weightPct > 95 ? 'bg-rose-500' : weightPct > 70 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${weightPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{language === 'AM' ? 'አጠቃቀም:' : language === 'OM' ? 'Hojiirra Oolmaa:' : 'Utilization:'} <strong>{weightPct}%</strong></span>
            <span>{language === 'AM' ? 'ክፍት የቀረ:' : language === 'OM' ? 'Kan Hafu:' : 'Available:'} {(maxWeightTons - currentTotalWeight).toFixed(1)}T</span>
          </div>
        </div>

        {/* Volume Capacity Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-purple-600" />
              <span>{language === 'AM' ? 'የይዘት/መጠን አጠቃቀም' : language === 'OM' ? 'Hojiirra Oolmaa Qabiyyee' : 'Volume Utilization'}</span>
            </span>
            <span className="font-mono font-black text-slate-900">
              {currentTotalVolume.toFixed(1)} / {maxVolumeCbm} m³
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                volumePct > 95 ? 'bg-rose-500' : volumePct > 70 ? 'bg-purple-500' : 'bg-purple-400'
              }`}
              style={{ width: `${volumePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{language === 'AM' ? 'የተሞላ መጠን:' : language === 'OM' ? 'Bakka Guutame:' : 'Cube Filled:'} <strong>{volumePct}%</strong></span>
            <span>{language === 'AM' ? 'ባዶ ቦታ:' : language === 'OM' ? 'Bakka Duwwaa:' : 'Free Space:'} {(maxVolumeCbm - currentTotalVolume).toFixed(1)} m³</span>
          </div>
        </div>

        {/* Financial Savings Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 shadow-xs space-y-2">
          <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'AM' ? 'የኮንሶሊዴሽን ጭነት ቅናሽ' : language === 'OM' ? 'Hirʼina Gatii Feʼiisa Walitti Makamee' : 'Consolidation Freight Discount'}</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {totalSavings > 0 ? `${Number(totalSavings).toLocaleString()} ETB` : '0 ETB'}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold">
            {language === 'AM'
              ? `ከተናጠል ጭነት በ ${savingsPct}% ቅናሽ`
              : language === 'OM'
              ? `Feʼiisa adda addaa irra %${savingsPct} salphaa dha`
              : `${savingsPct}% Cheaper than separate LTL dispatches`}
          </div>
        </div>
      </div>

      {/* 3. Container Configuration Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            {language === 'AM' ? 'ዋና የኮንቴነር ዓይነት' : language === 'OM' ? 'Gosa Konteenara Guddaa' : 'Master Container Type'}
          </label>
          <select
            value={containerType}
            onChange={(e) => setContainerType(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="40FT_HIGH_CUBE">40ft High-Cube HC (30T / 76.2 m³)</option>
            <option value="20FT_STANDARD">20ft Standard Dry (24T / 33.2 m³)</option>
            <option value="40FT_REEFER">40ft Reefer Thermal (28T / 67.0 m³)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            {language === 'AM' ? 'የኮሪደር መስመር ምዕራፍ' : language === 'OM' ? 'Daandii Koriidoorii' : 'Corridor Route Leg'}
          </label>
          <div className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-700 truncate">
            {originStation.split(' ')[0]} ➔ {destStation.split(' ')[0]}
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            disabled={submitting || selectedLoadIds.length < 2}
            onClick={handleExecuteConsolidation}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>
              {submitting
                ? (language === 'AM' ? 'በማዋሃድ ላይ...' : language === 'OM' ? 'Walitti makaa jira...' : 'Bundling...')
                : (language === 'AM'
                  ? `${selectedLoadIds.length} የተመረጡ ጭነቶችን አዋህድ ➔`
                  : language === 'OM'
                  ? `Feʼiisa Filatame ${selectedLoadIds.length} Walitti Maki ➔`
                  : `Consolidate ${selectedLoadIds.length} Selected Loads ➔`)}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Partial LTL Consignments Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4 text-purple-600" />
            <span>
              {language === 'AM'
                ? `ለማዋሃድ ዝግጁ የሆኑ ከፊል (LTL) ጭነቶች (${ltlLoads.length}):`
                : language === 'OM'
                ? `Feʼiisota LTL walitti qabuuf qophaaʼan (${ltlLoads.length}):`
                : `Available Partial LTL Consignments for Bundling (${ltlLoads.length}):`}
            </span>
          </h3>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {language === 'AM'
              ? `${selectedLoadIds.length} ጭነቶች ተመርጠዋል`
              : language === 'OM'
              ? `Feʼiisa ${selectedLoadIds.length} filatameera`
              : `${selectedLoadIds.length} Consignments Selected`}
          </span>
        </div>

        {ltlLoads.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">
              {language === 'AM'
                ? 'ውህደት የሚጠብቅ ከፊል ጭነት የለም'
                : language === 'OM'
                ? 'Feʼiisni walitti makamuuf eegu hin jiru'
                : 'No Partial Cargo Awaiting Consolidation'}
            </div>
            <p className="text-[11px] text-slate-500">
              {language === 'AM'
                ? 'የጭነት ባለቤቶች በኮሪደሩ ላይ ከ24 ቶን በታች ጭነት ሲለጥፉ እዚህ ይታያሉ።'
                : language === 'OM'
                ? 'Abbootiin qabeenyaa feʼiisa toonii 24 gadi yammuu maxxansan asitti mulʼatu.'
                : 'When cargo owners post loads under 24 Tons along the corridor, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ltlLoads.map((load) => {
              const isChecked = selectedLoadIds.includes(load.id);
              return (
                <div
                  key={load.id}
                  onClick={() => toggleSelectLoad(load.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white relative flex items-start gap-3.5 ${
                    isChecked
                      ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 uppercase">
                        {load.cargoType
                          ? load.cargoType.replace('_', ' ')
                          : (language === 'AM' ? 'ጭነት' : language === 'OM' ? 'Feʼiisa' : 'Consignment')}
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-700">
                        {load.weightTons} {language === 'AM' ? 'ቶን' : language === 'OM' ? 'Toonii' : 'Tons'} • {load.volumeCbm} m³
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 truncate">{load.title}</div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{load.shipperCompany} (TIN: {load.shipperTin})</span>
                    </div>

                    <div className="pt-1 text-[10.5px] text-slate-400 flex items-center justify-between">
                      <span>{language === 'AM' ? 'መስመር:' : language === 'OM' ? 'Daandii:' : 'Route:'} {load.origin} ➔ {load.destination}</span>
                      <span className="text-emerald-700 font-mono font-bold">
                        {Number(load.targetBudgetEtb).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Historical Consolidated Containers */}
      {consolidatedHistory.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'AM'
                ? `በጉዞ ላይ ያሉ ዋና የተዋሃዱ ኮንቴነሮች (${consolidatedHistory.length}):`
                : language === 'OM'
                ? `Konteenaroota gurguddoo imalarra jiran (${consolidatedHistory.length}):`
                : `Master Consolidated Containers in Transit (${consolidatedHistory.length}):`}
            </span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {consolidatedHistory.map((c) => (
              <div
                key={c.containerCode}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded">
                      {c.containerCode}
                    </span>
                    <span className="text-xs font-black text-slate-900">{c.masterTitle}</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {language === 'AM'
                      ? `${c.savingsPct}% ቅናሽ ተገኝቷል`
                      : language === 'OM'
                      ? `Hirʼina %${c.savingsPct} argameera`
                      : `${c.savingsPct}% Discount Achieved`}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>
                    {language === 'AM' ? 'የተሞላ አቅም:' : language === 'OM' ? 'Dandeettii Guutame:' : 'Capacity Filled:'} <strong>{c.weightUtilizationPct}%</strong> ({c.totalWeightTons}{language === 'AM' ? 'ቶን' : language === 'OM' ? 'T' : 'T'})
                  </span>
                  <span>•</span>
                  <span>
                    {language === 'AM' ? 'የተዋሃዱ ጭነቶች:' : language === 'OM' ? 'Feʼiisa Walitti Makame:' : 'Bundled Cargoes:'} <strong>{c.consignmentsCount} {language === 'AM' ? 'ላኪዎች' : language === 'OM' ? 'Ergitoota' : 'Shippers'}</strong>
                  </span>
                  <span>•</span>
                  <span>{language === 'AM' ? 'መስመር:' : language === 'OM' ? 'Daandii:' : 'Route:'} {c.origin} ➔ {c.destination}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
