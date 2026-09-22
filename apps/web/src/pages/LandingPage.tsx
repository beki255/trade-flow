import React from 'react';
import { Navbar } from '../components/Navbar';
import { HeroMap } from '../components/HeroMap';
import { FeatureCards } from '../components/FeatureCards';
import { ShieldCheck, CheckCircle2, Truck } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* 1. Dark Floating Header / Navbar */}
      <Navbar />

      {/* 2. Hero Section with Interactive Map */}
      <main className="flex-1">
        <HeroMap />

        {/* 3. 4 Feature Cards (AI Matching, Dynamic Pricing, Digital Docs, Predictive ETA) */}
        <FeatureCards />

        {/* 4. Corridor Compliance Trust Cards */}
        <section className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4.5 bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Ethiopian Customs (ECC)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Compliant with Single-Window clearance</div>
              </div>
            </div>

            <div className="rounded-2xl p-4.5 bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">ESLSE Multi-Modal Hub</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Djibouti Port ➔ Modjo Dry Port coordination</div>
              </div>
            </div>

            <div className="rounded-2xl p-4.5 bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Real-Time GPS Telematics</div>
                <div className="text-[11px] text-slate-500 mt-0.5">5s satellite ping across 900km corridor</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-4">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="font-bold text-[#0F172A]">TradeFlow</span> — Intelligent Logistics & Freight Matching Platform
          </div>
          <div>
            Djibouti Port ➔ Modjo Dry Port ➔ Addis Ababa Corridor © 2026
          </div>
        </div>
      </footer>

    </div>
  );
};
