import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Cpu, DollarSign, FileText, Gauge } from 'lucide-react';

export const FeatureCards: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      id: 'ai-matching',
      icon: Cpu,
      title: t('aiMatchingTitle'),
      description: 'AI-powered freight matching from Djibouti corridor, enabling digitized road logistics corridor.',
    },
    {
      id: 'dynamic-pricing',
      icon: DollarSign,
      title: t('dynamicPricingTitle'),
      description: 'Dynamic pricing while the spot corridors with real-time trade and capacity sharing.',
    },
    {
      id: 'digital-documents',
      icon: FileText,
      title: t('digitalDocsTitle'),
      description: 'Optimized freight from Djibouti: with AI Matching, Live Telematics, and Integrated customs documents.',
    },
    {
      id: 'predictive-eta',
      icon: Gauge,
      title: t('predictiveEtaTitle'),
      description: 'Predictive ETA and road continuous route context, and predictive transport operations.',
    },
  ];

  return (
    <section id="features" className="w-full max-w-[1340px] mx-auto px-6 sm:px-10 lg:px-16 py-8 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f) => {
          const IconComp = f.icon;
          return (
            <div
              key={f.id}
              className="flex flex-col items-start group"
            >
              {/* Icon Container: Light Cyan Box matching screenshot */}
              <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                <IconComp className="w-5 h-5 text-[#0284C7]" />
              </div>

              {/* Title: Bold Dark Text */}
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight mb-2">
                {f.title}
              </h3>

              {/* Description: Subtle Slate Text */}
              <p className="text-xs md:text-[13px] text-[#64748B] leading-relaxed">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
