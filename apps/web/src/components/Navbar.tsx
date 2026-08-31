import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-2">
      <nav className="nav-pill rounded-2xl sm:rounded-full px-4 sm:px-8 py-3 flex items-center justify-between shadow-xl relative z-40">
        
        {/* Brand Logo */}
        <Link 
          to="/"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Logo className="w-7 h-7 text-[#38BDF8]" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            TradeFlow
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] font-medium text-slate-300">
          <Link to="/" className="text-[#38BDF8] font-semibold border-b-2 border-[#38BDF8] pb-0.5">
            {t('home')}
          </Link>
          <a href="#features" className="hover:text-white transition-colors">
            {t('features')}
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            {t('pricing')}
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            {t('contact')}
          </a>
        </div>

        {/* Right CTA Button & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-semibold text-slate-200"
          >
            <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>English</span>
          </div>

          {/* "Get Started Free" Pill Button */}
          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-transparent hover:bg-slate-800/90 border border-slate-500/80 hover:border-slate-300 transition-all shadow-sm"
          >
            {t('getStarted')}
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </nav>

      {/* Mobile Nav Dropdown */}
      {mobileNavOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-[#0B1220] border border-slate-800 shadow-2xl space-y-3 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileNavOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold bg-slate-850 text-[#38BDF8]"
          >
            {t('home')}
          </Link>
          <a
            href="#features"
            onClick={() => setMobileNavOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('features')}
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileNavOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('pricing')}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileNavOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            {t('contact')}
          </a>
          <div className="pt-2 border-t border-slate-800">
            <Link
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#38BDF8]"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
