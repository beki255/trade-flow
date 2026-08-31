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
      user: DEMO_ACCOUNTS.SHIPPER,
      icon: Package,
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      description: 'Post loads, AI matching, track live corridor shipment, upload customs invoice & TeleBirr pay.',
      route: '/shipper/dashboard'
    },
    {
      key: 'TRANSPORTER',
      title: 'Transporter / Fleet Owner',
      user: DEMO_ACCOUNTS.TRANSPORTER,
      icon: Truck,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Manage fleet & trucks, load board, place competitive bids, fuel analytics & payout tracking.',
      route: '/transporter/dashboard'
    },
    {
      key: 'FORWARDER',
      title: 'Freight Forwarder',
      user: DEMO_ACCOUNTS.FORWARDER,
      icon: UserCheck,
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Consolidate multiple cargo owners, multi-modal transport & batch customs filings.',
      route: '/forwarder/dashboard'
    },
    {
      key: 'CUSTOMS',
      title: 'Customs Authority Staff',
      user: DEMO_ACCOUNTS.CUSTOMS,
      icon: ShieldCheck,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Review digital customs queue, validate invoice/packing list compliance, approve/reject clearances.',
      route: '/customs/dashboard'
    },
    {
      key: 'ADMIN',
      title: 'Platform Administrator',
      user: DEMO_ACCOUNTS.ADMIN,
      icon: UserCog,
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Verify business licenses & TINs, mediate TeleBirr payment disputes, audit logs & risk zones.',
      route: '/admin/dashboard'
    },
    {
      key: 'DRIVER',
      title: 'Driver (Mobile App Simulator)',
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
            const Icon = role.icon;
            return (
              <div
                key={role.key}
                onClick={() => {
                  onSelectRole(role.key);
                  onClose();
                }}
                className="group relative p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/60 hover:border-[#38BDF8]/60 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                          {role.title}
                        </h3>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                      {role.key}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {role.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/50 mt-auto">
                  <div className="text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-500">Demo User: </span>
                    <span className="text-slate-300 font-semibold">{role.user.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#38BDF8] group-hover:translate-x-1 transition-transform">
                    <span>Enter Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>All 6 role portals are pre-configured with test scenarios and live PostgreSQL data.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
