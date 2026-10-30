import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Check, Building2, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingSection: React.FC = () => {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');

  return (
    <section id="pricing" className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('pricing.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('pricing.subtitle')}
        </p>

        {/* Currency Switcher */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setCurrency('ETB')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                currency === 'ETB'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('pricing.currencyEtb')}
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('pricing.currencyUsd')}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Clean Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* 1. Shippers */}
        <div className="rounded-2xl p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>

            <div>
              <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">{t('pricing.shippers.category')}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{t('pricing.shippers.title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('pricing.shippers.desc')}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-3xl font-black text-slate-900 dark:text-white">{t('pricing.shippers.price')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('pricing.shippers.priceNote')}</div>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('pricing.shippers.feat1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('pricing.shippers.feat2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('pricing.shippers.feat3')}</span>
              </li>
            </ul>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold text-center block transition-all shadow-xs"
            >
              {t('pricing.shippers.button')}
            </Link>
          </div>
        </div>

        {/* 2. Carriers (Featured) */}
        <div className="rounded-2xl p-6 bg-[#0F172A] border-2 border-sky-400 text-white shadow-xl flex flex-col justify-between relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
            {t('pricing.transporters.popularBadge')}
          </div>

          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>

            <div>
              <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">{t('pricing.transporters.category')}</div>
              <h3 className="text-lg font-black text-white mt-0.5">{t('pricing.transporters.title')}</h3>
              <p className="text-xs text-slate-300 mt-1">{t('pricing.transporters.desc')}</p>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-3xl font-black text-white">{t('pricing.transporters.price')}</div>
              <div className="text-[11px] text-slate-400">{t('pricing.transporters.priceNote')}</div>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{t('pricing.transporters.feat1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{t('pricing.transporters.feat2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{t('pricing.transporters.feat3')}</span>
              </li>
            </ul>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-800">
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-slate-950 text-xs font-black text-center block transition-all shadow-md"
            >
              {t('pricing.transporters.button')}
            </Link>
          </div>
        </div>

        {/* 3. Forwarders */}
        <div className="rounded-2xl p-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>

            <div>
              <div className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">{t('pricing.enterprise.category')}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{t('pricing.enterprise.title')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('pricing.enterprise.desc')}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-3xl font-black text-slate-900 dark:text-white">{t('pricing.enterprise.price')}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('pricing.enterprise.priceNote')}</div>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{t('pricing.enterprise.feat1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{t('pricing.enterprise.feat2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{t('pricing.enterprise.feat3')}</span>
              </li>
            </ul>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
            <a
              href="#contact"
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold text-center block transition-all"
            >
              {t('pricing.enterprise.button')}
            </a>
          </div>
        </div>

      </div>

      {/* Spot Rate Reference */}
      <div className="mt-8 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-center gap-2">
        <span className="font-bold text-slate-800 dark:text-slate-200">💡 {t('pricing.spotTip')}</span>
        <span>{t('pricing.spotDesc')}</span>
        <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">
          {currency === 'USD' ? '~$1,520 USD' : '~190,000 ETB'}
        </strong>
      </div>

    </section>
  );
};
