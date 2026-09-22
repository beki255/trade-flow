import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  Cpu,
  DollarSign,
  FileText,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ElementType;
  tag: string;
  titleKey: string;
  descKey: string;
  defaultTitle: string;
  defaultDesc: string;
  accent: {
    color: string;
    bg: string;
    border: string;
    hoverBorder: string;
    hoverShadow: string;
    iconBg: string;
    iconHoverBg: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  };
}

export const FeatureCards: React.FC = () => {
  const { t } = useLanguage();

  const features: FeatureItem[] = [
    {
      id: 'ai-matching',
      icon: Cpu,
      tag: '⚡ AI Match Engine',
      titleKey: 'aiMatchingTitle',
      descKey: 'aiMatchingDesc',
      defaultTitle: 'AI-Powered Freight Matching',
      defaultDesc:
        'Intelligent algorithm pairs cross-border shippers with available heavy freight carriers in real-time along the Djibouti-Addis corridor.',
      accent: {
        color: '#0284C7',
        bg: 'from-sky-500/10 via-sky-500/5 to-transparent',
        border: 'border-sky-100',
        hoverBorder: 'hover:border-sky-400',
        hoverShadow: 'hover:shadow-sky-500/20',
        iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
        iconHoverBg: 'group-hover:bg-sky-600 group-hover:text-white',
        badgeBg: 'bg-sky-50',
        badgeText: 'text-sky-700',
        badgeBorder: 'border-sky-200',
      },
    },
    {
      id: 'dynamic-pricing',
      icon: DollarSign,
      tag: '📊 Smart Spot Index',
      titleKey: 'dynamicPricingTitle',
      descKey: 'dynamicPricingDesc',
      defaultTitle: 'Dynamic Spot Corridor Pricing',
      defaultDesc:
        'Transparent freight rates indexed to live fuel adjustments, seasonal harvest flows, and port dwell times with secure milestone escrow.',
      accent: {
        color: '#059669',
        bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        border: 'border-emerald-100',
        hoverBorder: 'hover:border-emerald-400',
        hoverShadow: 'hover:shadow-emerald-500/20',
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        iconHoverBg: 'group-hover:bg-emerald-600 group-hover:text-white',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-200',
      },
    },
    {
      id: 'digital-documents',
      icon: FileText,
      tag: '📑 Single-Window KYC',
      titleKey: 'digitalDocsTitle',
      descKey: 'digitalDocsDesc',
      defaultTitle: 'Digital Customs & Compliance',
      defaultDesc:
        'Electronic verification of Commercial Trade Licenses, GIT Cargo Insurance, and Roadworthiness certificates integrated with customs.',
      accent: {
        color: '#D97706',
        bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
        border: 'border-amber-100',
        hoverBorder: 'hover:border-amber-400',
        hoverShadow: 'hover:shadow-amber-500/20',
        iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
        iconHoverBg: 'group-hover:bg-amber-600 group-hover:text-white',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        badgeBorder: 'border-amber-200',
      },
    },
    {
      id: 'predictive-eta',
      icon: Gauge,
      tag: '🛰️ Real-Time Telematics',
      titleKey: 'predictiveEtaTitle',
      descKey: 'predictiveEtaDesc',
      defaultTitle: 'Live Telematics & Predictive ETA',
      defaultDesc:
        'Continuous GPS satellite positioning across the 900km corridor, factoring checkpoint wait times, road gradient, and border congestion.',
      accent: {
        color: '#7C3AED',
        bg: 'from-purple-500/10 via-purple-500/5 to-transparent',
        border: 'border-purple-100',
        hoverBorder: 'hover:border-purple-400',
        hoverShadow: 'hover:shadow-purple-500/20',
        iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
        iconHoverBg: 'group-hover:bg-purple-600 group-hover:text-white',
        badgeBg: 'bg-purple-50',
        badgeText: 'text-purple-700',
        badgeBorder: 'border-purple-200',
      },
    },
  ];

  return (
    <section
      id="features"
      className="relative w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 py-12 md:py-20 overflow-hidden"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-400/10 via-blue-500/5 to-purple-500/10 blur-3xl rounded-full -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-[#0284C7] text-xs font-bold shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>TRADEFLOW CORRIDOR PLATFORM</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight"
        >
          Engineered for the Djibouti-Addis Ababa Trade Corridor
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto"
        >
          Explore the next-generation capabilities streamlining freight logistics, cross-border customs clearing, and telematics for hundreds of active fleets.
        </motion.p>
      </div>

      {/* 4 Rich Animated Cards with Hover Effects (Clean, No Numbers, No Modal, No Explore link) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, idx) => {
          const IconComp = f.icon;
          const title = t(f.titleKey) || f.defaultTitle;
          const desc = t(f.descKey) || f.defaultDesc;

          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.015 }}
              className={`group relative rounded-3xl bg-white p-7 border ${f.accent.border} ${f.accent.hoverBorder} shadow-sm ${f.accent.hoverShadow} transition-all duration-300 flex flex-col justify-start overflow-hidden`}
            >
              {/* Subtle Card Header Gradient Sweep on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${f.accent.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              {/* Ambient Top Light Spot */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-radial from-slate-100/60 to-transparent rounded-bl-full pointer-events-none -z-0" />

              <div className="relative z-10 space-y-4">
                {/* Top Row: Icon & Tag Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl ${f.accent.iconBg} ${f.accent.iconHoverBg} flex items-center justify-center border shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <IconComp className="w-6 h-6 transition-colors" />
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border ${f.accent.badgeBg} ${f.accent.badgeText} ${f.accent.badgeBorder} shadow-2xs`}
                  >
                    {f.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight group-hover:text-slate-900 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed mt-2.5">
                    {desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
