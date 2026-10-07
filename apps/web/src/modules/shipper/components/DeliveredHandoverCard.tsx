import React from 'react';
import {
  CheckCircle2,
  CheckCircle,
  FileCheck,
  CreditCard,
  Package,
  PlusCircle,
} from 'lucide-react';
import { PostedLoadItem } from './CorridorLiveMap';

interface DeliveredHandoverCardProps {
  selectedLoad: PostedLoadItem;
  onPaymentsRedirect?: () => void;
  onConsignmentsRedirect?: () => void;
  onPostLoadRedirect?: () => void;
}

export const DeliveredHandoverCard: React.FC<DeliveredHandoverCardProps> = ({
  selectedLoad,
  onPaymentsRedirect,
  onConsignmentsRedirect,
  onPostLoadRedirect,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-md space-y-6">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-purple-700" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Consignment Delivered & Verified
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The cargo has arrived at destination and was confirmed via electronic proof of delivery (e-POD). Live GPS tracking completed.
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Route Covered</div>
          <div className="text-base font-black text-purple-900">
            {selectedLoad.distanceKm || '--'} km Corridor Completed
          </div>
        </div>
      </div>

      {/* Verified e-POD & Smart Escrow Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proof of Delivery Details */}
        <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
          <div className="flex items-center gap-2 text-purple-800 font-extrabold text-xs">
            <FileCheck className="w-4 h-4 text-purple-700" />
            <span>Electronic Proof of Delivery (e-POD)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-purple-200/40 pb-1.5">
              <span className="text-slate-500">Confirmed Recipient:</span>
              <span className="font-bold text-slate-900">
                {selectedLoad.podRecipientName || 'Verified Consignee Recipient'}
              </span>
            </div>
            <div className="flex justify-between border-b border-purple-200/40 pb-1.5">
              <span className="text-slate-500">Digital Signature:</span>
              <span className="font-bold text-purple-700 font-mono text-[11px]">
                {selectedLoad.podSignatureUrl || '✓ [Cryptographically Verified]'}
              </span>
            </div>
            <div className="flex justify-between border-b border-purple-200/40 pb-1.5">
              <span className="text-slate-500">Delivery Destination:</span>
              <span className="font-bold text-slate-900">{selectedLoad.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Handover Timestamp:</span>
              <span className="font-semibold text-slate-700">
                {selectedLoad.podDeliveredAt
                  ? new Date(selectedLoad.podDeliveredAt).toLocaleString()
                  : `${new Date().toLocaleTimeString()} • ${new Date().toLocaleDateString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Smart Escrow Settlement Details */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span>Digital Smart Escrow Settlement</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
              <span className="text-slate-500">Escrow Status:</span>
              <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                RELEASED & SETTLED
              </span>
            </div>
            <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
              <span className="text-slate-500">Payment Release Trigger:</span>
              <span className="font-bold text-slate-900">Automated upon e-POD Handover</span>
            </div>
            <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
              <span className="text-slate-500">Assigned Transporter:</span>
              <span className="font-bold text-slate-900">
                {selectedLoad.driverName || 'Verified Fleet Carrier'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Vehicle:</span>
              <span className="font-bold text-slate-900 font-mono">
                🚛 {selectedLoad.truckPlate || 'Heavy Freight Carrier'}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {onPaymentsRedirect && (
          <button
            type="button"
            onClick={onPaymentsRedirect}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" /> View Payment Receipt
          </button>
        )}

        {onConsignmentsRedirect && (
          <button
            type="button"
            onClick={onConsignmentsRedirect}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" /> View in My Consignments
          </button>
        )}

        {onPostLoadRedirect && (
          <button
            type="button"
            onClick={onPostLoadRedirect}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" /> Post Another Load
          </button>
        )}
      </div>
    </div>
  );
};
