import React from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck2,
  Lock,
  Stamp,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Post Consignment & AI Match',
      desc: 'Shipper inputs container size, tonnage, and pickup window. Our AI pairing engine routes the load to verified carriers on the corridor.',
      icon: FileCheck2,
      badge: 'Step 1: Origin',
      color: 'sky',
    },
    {
      step: '02',
      title: 'Lock Funds in Smart Escrow',
      desc: 'Shipper accepts best quotation. Freight funds are locked securely in TeleBirr or CBE Escrow. Carrier is protected and guaranteed payment.',
      icon: Lock,
      badge: 'Step 2: Financial Safety',
      color: 'emerald',
    },
    {
      step: '03',
      title: 'Single-Window Customs Clearance',
      desc: 'Digital commercial invoice, B/L, and packing lists are cross-checked automatically for Green Line fast-track clearance at Galafi and Modjo.',
      icon: Stamp,
      badge: 'Step 3: Regulatory Compliance',
      color: 'amber',
    },
    {
      step: '04',
      title: 'Satellite GPS & e-POD Payout',
      desc: 'Driver navigates with 5s telematics tracking. Cargo recipient signs digital e-POD upon arrival, triggering instant automated escrow payout.',
      icon: CheckCircle2,
      badge: 'Step 4: Safe Handover',
      color: 'purple',
    },
  ];

  return (
    <section className="relative w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 py-16 md:py-20 border-t border-slate-200/80">
      
      {/* Corridor Key Performance Metrics Bar */}
      <div className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Corridor Length</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">910 km</div>
          <div className="text-[11px] text-slate-500">Djibouti Port to Addis Ababa</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Customs Dwell</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">18 Hours</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Reduced from 72h baseline</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Verified Fleet</span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">2,450+</div>
          <div className="text-[11px] text-slate-500">Heavy trucks with GIT insurance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Broker Cost Savings</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">18 - 24%</div>
          <div className="text-[11px] text-teal-600 font-semibold">Transparent algorithmic spot rate</div>
        </div>
      </div>

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How TradeFlow Powers the Corridor
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          From vessel container discharge at Port de Djibouti to delivery in Addis Ababa or Modjo Dry Port, every milestone is orchestrated seamlessly.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <motion.div
              key={st.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                    {st.step}
                  </span>
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {st.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:scale-110 group-hover:bg-sky-50 group-hover:text-sky-600 group-hover:border-sky-200 transition-all">
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
                <span>Explore Milestone</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Corridor Quick Launch CTA */}
      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-sky-800/40">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Experience the Complete Demo Right Now
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Test any role immediately — Shipper, Transporter, Driver, Customs Officer, or Admin — with pre-configured accounts.
          </p>
        </div>

        <Link
          to="/login"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-xl transition-all shrink-0 cursor-pointer"
        >
          Access Demo Portals
        </Link>
      </div>

    </section>
  );
};
