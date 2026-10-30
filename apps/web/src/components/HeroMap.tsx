import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Truck } from 'lucide-react';
import { Logo } from './Logo';

export const HeroMap: React.FC = () => {
  const { t } = useLanguage();

  const [truckProgress, setTruckProgress] = useState(48);
  const [speed, setSpeed] = useState(68);

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckProgress((prev) => (prev >= 92 ? 15 : prev + 0.35));
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-6 md:pt-6 md:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        
        {/* Left Column: Clean Typography & Quick Actions */}
        <div className="lg:col-span-5 flex flex-col items-start gap-3.5 sm:gap-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.14]">
            {t('hero.titlePart1')} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-700 dark:from-sky-400 dark:to-blue-400">
              {t('hero.titlePart2')}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
            {t('hero.subtitle')}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="#pricing"
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all shadow-sm cursor-pointer"
            >
              {t('hero.viewPricing')}
            </a>

            <a
              href="/login"
              className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              {t('hero.signInPortals')}
            </a>
          </div>

        </div>

        {/* Right Column: Exact Replica of the Map and Operations Control Card */}
        <div className="lg:col-span-7 relative w-full">
          
          {/* Cyan Glow Effect behind the card */}
          <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-tr from-sky-400/30 via-cyan-400/20 to-blue-500/25 rounded-3xl blur-2xl -z-10"></div>

          {/* Dark Container Card */}
          <div className="rounded-2xl bg-[#0F172A] p-2 md:p-2.5 shadow-2xl border border-slate-700/60 w-full">
            
            {/* Card Header Bar */}
            <div className="px-3.5 py-2 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Logo className="w-4 h-4 text-[#38BDF8]" size={18} />
              <span className="text-white font-bold">{t('hero.mapTitle')}</span>
              <span className="text-slate-400 font-normal ml-2">{t('hero.mapSubtitle')}</span>
            </div>

            {/* Map Body Area */}
            <div className="relative w-full h-[310px] sm:h-[350px] md:h-[380px] lg:h-[390px] rounded-xl overflow-hidden bg-[#ECE6D8] border border-slate-300">
              
              {/* SVG Realistic Topographic Map (Djibouti ➔ Addis Ababa) */}
              <svg className="w-full h-full object-cover" viewBox="0 0 740 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="740" height="420" fill="#EAE4D6"/>
                <path d="M0 0C100 40 220 70 380 50C540 30 650 100 740 80V420H0V0Z" fill="#DFD8C8"/>
                <path d="M0 160C140 180 260 150 440 200C620 250 670 190 740 220V420H0V160Z" fill="#D7D0BF" opacity="0.6"/>

                <path d="M530 200C545 190 565 205 558 222C550 235 530 230 525 215Z" fill="#A5C9EB"/>
                <path d="M500 270C515 255 535 275 530 295C520 310 495 300 490 285Z" fill="#A5C9EB"/>

                <path d="M80 160Q220 120 400 150Q540 170 660 270" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5 5"/>
                <path d="M350 270Q460 250 560 360" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5 5"/>

                {/* PRIMARY BLUE TRADE CORRIDOR ROUTE */}
                <path
                  d="M60 330 Q140 300 220 260 Q320 220 410 180 Q500 160 590 120"
                  stroke="#1D4ED8"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M60 330 Q140 300 220 260 Q320 220 410 180 Q500 160 590 120"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <circle cx="60" cy="330" r="6" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="35" y="355" fill="#1E293B" fontSize="12" fontWeight="bold" fontFamily="sans-serif">{t('hero.djiboutiPort')}</text>

                <text x="160" y="145" fill="#475569" fontSize="11" fontWeight="600">{t('hero.diredawa')}</text>
                <text x="320" y="150" fill="#475569" fontSize="11" fontWeight="600">{t('hero.metehara')}</text>

                <circle cx="450" cy="170" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="440" y="155" fill="#0F172A" fontSize="12" fontWeight="bold">{t('hero.mojo')}</text>

                <circle cx="590" cy="120" r="7" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="560" y="105" fill="#0F172A" fontSize="13" fontWeight="800">{t('hero.addisAbaba')}</text>

                <rect x="635" y="225" width="20" height="15" rx="3" fill="#FFFFFF" stroke="#94A3B8"/>
                <text x="640" y="236" fill="#475569" fontSize="9" fontWeight="bold">39</text>

                {/* Trucks on Highway */}
                <g transform="translate(520, 145)">
                  <rect x="-14" y="-7" width="26" height="14" rx="2" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1"/>
                  <rect x="6" y="-5" width="5" height="10" rx="1" fill="#FFFFFF"/>
                </g>

                <g transform="translate(370, 200)">
                  <rect x="-14" y="-7" width="26" height="14" rx="2" fill="#334155" stroke="#FFFFFF" strokeWidth="1"/>
                  <rect x="6" y="-5" width="5" height="10" rx="1" fill="#60A5FA"/>
                </g>

                <g transform="translate(130, 295)">
                  <rect x="-14" y="-7" width="26" height="14" rx="2" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1"/>
                  <rect x="6" y="-5" width="5" height="10" rx="1" fill="#FFFFFF"/>
                </g>

                <g transform="translate(90, 185)">
                  <rect x="-14" y="-7" width="26" height="14" rx="2" fill="#64748B" stroke="#FFFFFF" strokeWidth="1"/>
                </g>
              </svg>

              {/* REAL-TIME TRACKING TOOLTIP CARD */}
              <div 
                className="absolute transition-all duration-300 pointer-events-none"
                style={{
                  left: `${Math.min(46, Math.max(16, truckProgress * 0.65))}%`,
                  top: `${Math.max(22, 54 - truckProgress * 0.38)}%`
                }}
              >
                <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xl border border-slate-200 min-w-[185px] sm:min-w-[200px]">
                  <div className="text-[11px] sm:text-[12px] font-bold text-[#0F172A] tracking-tight mb-1">
                    {t('hero.realtimeTracking')}
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-8 sm:w-12 sm:h-9 rounded-md bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#0284C7]" />
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-normal">{t('hero.speed')}</div>
                        <div className="text-[#0F172A] text-xs font-extrabold">{speed} km/h</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-normal">{t('hero.eta')}</div>
                        <div className="text-[#0F172A] text-xs font-extrabold">1h 45m</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
