import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CommissionCustomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (notice: string) => void;
}

export const CommissionCustomsModal: React.FC<CommissionCustomsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [officerName, setOfficerName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerStation, setOfficerStation] = useState('Galafi Border Checkpoint');
  const [officerBadge, setOfficerBadge] = useState('ECC-OFFICER-' + Math.floor(1000 + Math.random() * 9000));
  const [officerPassword, setOfficerPassword] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');

  if (!isOpen) return null;

  const handleProvisionInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    setProvisionError('');
    try {
      const res = await fetch('/api/portal/provision-customs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: officerName,
          email: officerEmail,
          password: officerPassword,
          station: officerStation,
          badgeId: officerBadge,
          adminId: 'Platform Super-Admin',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to provision inspector');
      }

      onSuccess(`🎉 Official Customs Inspector commissioned for ${officerStation}!`);
      setOfficerName('');
      setOfficerEmail('');
      onClose();
    } catch (err: any) {
      setProvisionError(err.message || 'Provisioning failed');
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Commission Customs Officer
              </h3>
              <p className="text-[11px] text-slate-500">
                Register verified regulatory account for the Ethiopian Customs Commission
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {provisionError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {provisionError}
          </div>
        )}

        <form onSubmit={handleProvisionInspector} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Inspector Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inspector Alula Haile"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Government / Commission Email *
            </label>
            <input
              type="email"
              required
              placeholder="alula.haile@customs.gov.et"
              value={officerEmail}
              onChange={(e) => setOfficerEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Station *
              </label>
              <select
                value={officerStation}
                onChange={(e) => setOfficerStation(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:border-teal-600 outline-none text-slate-900"
              >
                <option value="Galafi Border Checkpoint">Galafi Border Checkpoint</option>
                <option value="Modjo Multimodal Dry Port">Modjo Multimodal Dry Port</option>
                <option value="Dire Dawa Dry Port Terminal">Dire Dawa Dry Port Terminal</option>
                <option value="Addis Ababa Kality Customs">Addis Ababa Kality Customs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Badge / Officer ID *
              </label>
              <input
                type="text"
                required
                value={officerBadge}
                onChange={(e) => setOfficerBadge(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Temporary Password *
            </label>
            <input
              type="text"
              required
              value={officerPassword}
              onChange={(e) => setOfficerPassword(e.target.value)}
              placeholder="Enter temporary password"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-teal-600 outline-none text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={provisioning}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>{provisioning ? 'Commissioning...' : 'Commission Official Inspector'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
