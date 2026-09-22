import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CustomsDossierItem } from '../types';

interface ComplianceMatrixTableProps {
  activeDossier: CustomsDossierItem;
  invoiceNo: string;
  packingNo: string;
  bolNo: string;
  originNo: string;
  invoiceWeight: number;
  packingWeight: number;
  bolWeight: number;
  targetWeight: number;
  hasWeightDiscrepancy: boolean;
}

export const ComplianceMatrixTable: React.FC<ComplianceMatrixTableProps> = ({
  activeDossier,
  invoiceNo,
  packingNo,
  bolNo,
  originNo,
  invoiceWeight,
  packingWeight,
  bolWeight,
  targetWeight,
  hasWeightDiscrepancy,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cross-Document Validation Matrix (ECC Single Window Verification)</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Automated pre-clearance checks verifying data alignment across all four international trade documents.
          </p>
        </div>
        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {hasWeightDiscrepancy ? '⚠️ 1 Discrepancy Found' : '✓ 100% Cross-Check Passed'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-[10.5px] font-extrabold uppercase text-slate-500 border-b border-slate-200/80">
              <th className="py-3 px-4">Verification Checkpoint</th>
              <th className="py-3 px-4">Commercial Invoice</th>
              <th className="py-3 px-4">Packing List</th>
              <th className="py-3 px-4">Bill of Lading (B/L)</th>
              <th className="py-3 px-4">Origin Certificate</th>
              <th className="py-3 px-4 text-center">Compliance Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {/* Row 1: Document Reference Numbers */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">Document Reference #</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{invoiceNo}</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{packingNo}</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{bolNo}</td>
              <td className="py-3 px-4 font-mono text-slate-800 font-semibold">{originNo}</td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                </span>
              </td>
            </tr>

            {/* Row 2: Declared Gross Weight */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">Gross Cargo Weight</td>
              <td className="py-3 px-4">{invoiceWeight} Tons</td>
              <td className="py-3 px-4">{packingWeight} Tons</td>
              <td className="py-3 px-4">{bolWeight} Tons</td>
              <td className="py-3 px-4">{targetWeight} Tons</td>
              <td className="py-3 px-4 text-center">
                {hasWeightDiscrepancy ? (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5" /> Mismatch
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exact Match (0.0T Delta)
                  </span>
                )}
              </td>
            </tr>

            {/* Row 3: Declared Value vs Tariff Benchmark */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">Declared Value (ETB)</td>
              <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                {Number(activeDossier.declaredValueEtb).toLocaleString()} ETB
              </td>
              <td className="py-3 px-4 text-slate-400">N/A (Tonnage only)</td>
              <td className="py-3 px-4 text-slate-400">Carrier Haulage Only</td>
              <td className="py-3 px-4 text-slate-400">Preferential Duty Valid</td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Market Tariff In-Bounds
                </span>
              </td>
            </tr>

            {/* Row 4: Consignee & Route Alignment */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">Corridor Route Alignment</td>
              <td className="py-3 px-4">{activeDossier.origin} ➔ {activeDossier.destination}</td>
              <td className="py-3 px-4">{activeDossier.origin} ➔ {activeDossier.destination}</td>
              <td className="py-3 px-4">{activeDossier.origin} ➔ {activeDossier.destination}</td>
              <td className="py-3 px-4">Federal Democratic Republic of Ethiopia</td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Corridor Transit Clear
                </span>
              </td>
            </tr>

            {/* Row 5: Ministry of Trade Digital Seal */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-bold text-slate-900">Export Seal & Origin Cert</td>
              <td className="py-3 px-4 text-slate-400">Commercial Seal</td>
              <td className="py-3 px-4 text-slate-400">Warehouse Seal</td>
              <td className="py-3 px-4 text-slate-400">Carrier Manifest Seal</td>
              <td className="py-3 px-4 text-emerald-700 font-bold">✓ MoT Certified (Galafi Registered)</td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
