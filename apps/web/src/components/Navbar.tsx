import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageDropdown } from './LanguageDropdown';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple scroll spy
      const sections = ['home', 'features', 'pricing', 'contact'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    setMobileNavOpen(false);
    setActiveSection(id);

    if (location.pathname !== '/') {
      // If not on home page, allow default navigation to /#id
      return;
    }

    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 pt-3 sm:pt-4 pb-2 transition-all">
      <nav
        className={`rounded-2xl sm:rounded-full px-4 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-[#0B1220]/95 backdrop-blur-md shadow-2xl border border-sky-500/20'
            : 'bg-[#111C2D]/90 backdrop-blur-sm shadow-xl border border-white/10'
        }`}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={(e) => handleNavClick('home', e)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <Logo className="w-7 h-7 text-[#38BDF8] group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
              TradeFlow
            </span>
            <span className="text-[9px] font-bold text-sky-400 tracking-widest uppercase -mt-0.5 hidden sm:block">
              {t('nav.subtitle')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-[13px] font-semibold text-slate-300">
          <a
            href="#home"
            onClick={(e) => handleNavClick('home', e)}
            className={`transition-all pb-1 cursor-pointer ${
              activeSection === 'home'
                ? 'text-[#38BDF8] font-bold border-b-2 border-[#38BDF8]'
                : 'hover:text-white'
            }`}
          >
            {t('home')}
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick('features', e)}
            className={`transition-all pb-1 cursor-pointer ${
              activeSection === 'features'
                ? 'text-[#38BDF8] font-bold border-b-2 border-[#38BDF8]'
                : 'hover:text-white'
            }`}
          >
            {t('features')}
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleNavClick('pricing', e)}
            className={`transition-all pb-1 cursor-pointer ${
              activeSection === 'pricing'
                ? 'text-[#38BDF8] font-bold border-b-2 border-[#38BDF8]'
                : 'hover:text-white'
            }`}
          >
            {t('pricing')}
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick('contact', e)}
            className={`transition-all pb-1 cursor-pointer ${
              activeSection === 'contact'
                ? 'text-[#38BDF8] font-bold border-b-2 border-[#38BDF8]'
                : 'hover:text-white'
            }`}
          >
            {t('contact')}
          </a>
        </div>

        {/* Right CTA Button & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Dropdown supporting EN, AM, OM */}
          <LanguageDropdown dark={true} />

          {/* Quick Demo Portals / Login Button */}
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#38BDF8] to-emerald-400 hover:from-sky-300 hover:to-emerald-300 transition-all shadow-md hover:shadow-sky-500/20"
          >
            <span>{t('getStarted')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      {mobileNavOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-[#0B1220]/95 backdrop-blur-md border border-slate-800 shadow-2xl space-y-2.5 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#home"
            onClick={(e) => handleNavClick('home', e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSection === 'home' ? 'bg-slate-800 text-[#38BDF8]' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {t('home')}
          </a>
          <a
            href="#features"
            onClick={(e) => handleNavClick('features', e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSection === 'features' ? 'bg-slate-800 text-[#38BDF8]' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {t('features')}
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleNavClick('pricing', e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSection === 'pricing' ? 'bg-slate-800 text-[#38BDF8]' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {t('pricing')}
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick('contact', e)}
            className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSection === 'contact' ? 'bg-slate-800 text-[#38BDF8]' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {t('contact')}
          </a>

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              className="block w-full text-center py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#38BDF8] to-emerald-400 shadow-md"
            >
              {t('getStarted')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
