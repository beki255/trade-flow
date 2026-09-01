import React from 'react';
import { History } from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogsTabProps {
  auditLogs: AuditLogItem[];
  onRefresh: () => void;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ auditLogs, onRefresh }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Immutable System Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Comprehensive timestamped audit logs for legal status transitions, document approvals, and administrator actions.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
        >
          <History className="w-3.5 h-3.5" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit trail recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action & Category</th>
                  <th className="py-3.5 px-4">Target Organization</th>
                  <th className="py-3.5 px-4">Status Transition</th>
                  <th className="py-3.5 px-4">Admin ID / Actor</th>
                  <th className="py-3.5 px-4">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block font-sans">
                        {log.action}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                        {log.category}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 font-sans font-extrabold text-slate-900">
                      {log.targetName}
                    </td>

                    {/* Status Transition */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.previousStatus ? (
                        <div className="flex items-center gap-1.5 font-sans font-bold text-[10px]">
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {log.previousStatus}
                          </span>
                          <span>➔</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {log.newStatus}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans">INITIALIZED</span>
                      )}
                    </td>

                    {/* Admin ID */}
                    <td className="py-3.5 px-4 text-slate-700 font-bold font-sans">
                      🛡️ {log.performedByAdminId}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-slate-600 font-sans text-[11px]">
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
