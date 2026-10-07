import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { HeroMap } from '../components/HeroMap';
import { FeatureCards } from '../components/FeatureCards';
import { PricingSection } from '../components/PricingSection';
import { ContactSection } from '../components/ContactSection';
import { Logo } from '../components/Logo';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="flex-1 space-y-4 sm:space-y-8">
        {/* Hero Section with Interactive Live Corridor Simulation */}
        <HeroMap />

        {/* 4 Clean Feature Cards */}
        <FeatureCards />

        {/* 3 Clean Pricing Cards */}
        <PricingSection />

        {/* Support & Contact Desk */}
        <ContactSection />
      </main>

      {/* 3. Simple Elegant Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <Logo className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-black text-slate-900">TradeFlow</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {t('nav.subtitle')}
            </span>
          </div>

          {/* Center: Copyright */}
          <div className="text-[11.5px] text-slate-400 text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            {t('footer.rights')}
          </div>

          {/* Right Spacer */}
          <div className="hidden md:block w-10" />
        </div>
      </footer>
    </div>
  );
};
