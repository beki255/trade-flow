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

        {/* 4. Corridor Compliance Trust Strip */}
        <section className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 py-6">
          <div className="rounded-2xl p-5 bg-white border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-around gap-6 text-slate-600 text-xs font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              <span>Compliant with Ethiopian Customs Commission (ECC)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
              <span>ESLSE Multi-Modal Corridor Coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-slate-700" />
              <span>Real-Time GPS Telematics & Offline Checkpoints</span>
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
