import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  Cpu,
  Lock,
  FileCheck2,
  Navigation,
} from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      id: 'ai-matching',
      icon: Cpu,
      tag: t('features.aiMatching.tag'),
      title: t('features.aiMatching.title'),
      desc: t('features.aiMatching.desc'),
      accentBorder: 'hover:border-sky-400 group-hover:shadow-sky-500/10',
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'smart-escrow',
      icon: Lock,
      tag: t('features.smartEscrow.tag'),
      title: t('features.smartEscrow.title'),
      desc: t('features.smartEscrow.desc'),
      accentBorder: 'hover:border-emerald-400 group-hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'digital-customs',
      icon: FileCheck2,
      tag: t('features.digitalCustoms.tag'),
      title: t('features.digitalCustoms.title'),
      desc: t('features.digitalCustoms.desc'),
      accentBorder: 'hover:border-amber-400 group-hover:shadow-amber-500/10',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'live-telematics',
      icon: Navigation,
      tag: t('features.liveTelematics.tag'),
      title: t('features.liveTelematics.title'),
      desc: t('features.liveTelematics.desc'),
      accentBorder: 'hover:border-purple-400 group-hover:shadow-purple-500/10',
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <section id="features" className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      
      {/* Clean Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          {t('features.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('features.subtitle')}
        </p>
      </div>

      {/* 4 Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, idx) => {
          const IconComp = f.icon;
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={`group p-6 rounded-2xl bg-white border border-slate-200 ${f.accentBorder} shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 tracking-wider">
                    {f.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    {f.desc}
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
