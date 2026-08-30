import React from 'react';
import { X, UserCheck, Truck, Package, ShieldCheck, UserCog, Smartphone, ArrowRight } from 'lucide-react';
import { DEMO_ACCOUNTS } from '@tradeflow/shared';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (roleKey: string) => void;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  const roleOptions = [
    {
      key: 'SHIPPER',
      title: 'Shipper / Cargo Owner',
      titleAm: 'የጭነት ባለቤት / አስመጪ-ላኪ',
      user: DEMO_ACCOUNTS.SHIPPER,
      icon: Package,
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      description: 'Post loads, AI matching, track live corridor shipment, upload customs invoice & TeleBirr pay.',
      route: '/shipper/dashboard'
    },
    {
      key: 'TRANSPORTER',
      title: 'Transporter / Fleet Owner',
      titleAm: 'የጭነት አጓጓዥ / ባለሀብት',
      user: DEMO_ACCOUNTS.TRANSPORTER,
      icon: Truck,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Manage fleet & trucks, load board, place competitive bids, fuel analytics & payout tracking.',
      route: '/transporter/dashboard'
    },
    {
      key: 'FORWARDER',
      title: 'Freight Forwarder',
      titleAm: 'የጭነት አስተላላፊ',
      user: DEMO_ACCOUNTS.FORWARDER,
      icon: UserCheck,
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Consolidate multiple cargo owners, multi-modal transport & batch customs filings.',
      route: '/forwarder/dashboard'
    },
    {
      key: 'CUSTOMS',
      title: 'Customs Authority Staff',
      titleAm: 'የጉምሩክ ባለስልጣን ኢንስፔክተር',
      user: DEMO_ACCOUNTS.CUSTOMS,
      icon: ShieldCheck,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Review digital customs queue, validate invoice/packing list compliance, approve/reject clearances.',
      route: '/customs/dashboard'
    },
    {
      key: 'ADMIN',
      title: 'Platform Administrator',
      titleAm: 'ዋና ሲስተም አስተዳዳሪ',
      user: DEMO_ACCOUNTS.ADMIN,
      icon: UserCog,
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Verify business licenses & TINs, mediate TeleBirr payment disputes, audit logs & risk zones.',
      route: '/admin/dashboard'
    },
    {
      key: 'DRIVER',
      title: 'Driver (Mobile App Simulator)',
      titleAm: 'አሽከርካሪ (ተንቀሳቃሽ መተግበሪያ)',
      user: DEMO_ACCOUNTS.DRIVER,
      icon: Smartphone,
      badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      description: 'Active trip turn-by-turn navigation, offline waypoint check-in, incident reporting & digital POD.',
      route: '/driver/active-trip'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Select Role Portal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access the dedicated portal for your operational role in the TradeFlow platform.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-4 overflow-y-auto pr-1">
          {roleOptions.map((role) => {
            const IconComp = role.icon;
            return (
              <div
                key={role.key}
                onClick={() => onSelectRole(role.key)}
                className="group p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-150 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center border border-slate-600/50 group-hover:scale-105 transition-transform">
                        <IconComp className="w-4 h-4 text-[#38BDF8]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                          {role.title}
                        </h4>
                        <div className="text-[10px] text-slate-400">{role.titleAm}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                      {role.user.username}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {role.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
                  <span className="font-mono text-[10px] text-slate-400">{role.user.email}</span>
                  <span className="flex items-center gap-1">
                    Enter Portal <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Demo Password: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">Demo1234!</code> (Admin: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">Admin2024!</code>)</span>
          <button onClick={onClose} className="hover:text-white font-medium">Close</button>
        </div>

      </div>
    </div>
  );
};
