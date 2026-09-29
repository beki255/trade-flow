import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  FileText,
  Building,
  ShieldCheck,
  Send,
  RefreshCw,
  Clock,
  ArrowRight,
  Stamp
} from 'lucide-react';
import { ForwarderClientItem } from '../types';

interface CustomsCoordinationTabProps {
  clients: ForwarderClientItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const CustomsCoordinationTab: React.FC<CustomsCoordinationTabProps> = ({
  clients = [],
  loading,
  onRefresh,
}) => {
  const [transmitting, setTransmitting] = useState(false);
  const [transmittedNotice, setTransmittedNotice] = useState('');

  const handleTransmitBatch = () => {
    setTransmitting(true);
    setTimeout(() => {
      setTransmitting(false);
      setTransmittedNotice('🎉 Multi-Consignor Batch Declaration transmitted to Ethiopian Customs Commission (ECC) Single Window Queue!');
      setTimeout(() => setTransmittedNotice(''), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-[11px] font-bold tracking-wide">
            <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Customs Coordination Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Batch Customs Document Filing & Single Window Clearance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Coordinate customs clearance filings across multi-shipper consolidated containers. Assemble master transit declarations, commercial invoices, and packing lists for Galafi and Modjo customs inspection.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="relative z-10 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {transmittedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{transmittedNotice}</span>
        </div>
      )}

      {/* 2. Master Batch Declaration Pipeline Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded">
                ECC-BATCH-2026-8841
              </span>
              <span className="text-xs font-black text-slate-900">
                Corridor Multi-Consignor Master Transit Declaration
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Terminal: Modjo Dry Port Multimodal Terminal ➔ Galafi Border Checkpoint (Djibouti Transit)
            </p>
          </div>

          <button
            type="button"
            disabled={transmitting}
            onClick={handleTransmitBatch}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{transmitting ? 'Transmitting...' : 'Transmit Batch Declaration to ECC ➔'}</span>
          </button>
        </div>

        {/* 3. Bundled Consignors Sub-Declarations */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Bundled Consignments in Master Declaration:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">1. Ethio Coffee Exporters PLC</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  TIN: 0012938475
                </span>
              </div>
              <div className="text-slate-600">Cargo: Grade 1 Washed Yirgacheffe Coffee (14.5 Tons)</div>
              <div className="flex items-center gap-2 text-[10.5px] text-slate-500 pt-1 border-t border-slate-200">
                <span className="text-emerald-700 font-bold">✓ Commercial Invoice #ETH-CI-4921</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">✓ Packing List #ETH-PL-4921</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">2. Hawassa Garment Manufacturing SC</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  TIN: 0049281726
                </span>
              </div>
              <div className="text-slate-600">Cargo: Finished Textile Apparel for Export (13.5 Tons)</div>
              <div className="flex items-center gap-2 text-[10.5px] text-slate-500 pt-1 border-t border-slate-200">
                <span className="text-emerald-700 font-bold">✓ Commercial Invoice #HAW-TX-089</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">✓ Origin Cert #MOT-2026-88</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
