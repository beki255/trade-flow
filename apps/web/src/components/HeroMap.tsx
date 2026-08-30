import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Truck, Fuel } from 'lucide-react';
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
        
        {/* Left Column: Bold Typography & Buttons */}
        <div className="lg:col-span-5 flex flex-col items-start gap-4 lg:gap-5">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black tracking-tight text-[#0F172A] leading-[1.12]">
            Digitize Your Trade<br />
            Corridor. Real.<br />
            Real-Time Tracking.<br />
            Effortless Logistics.
          </h1>

          <p className="text-sm md:text-[15px] text-[#475569] leading-relaxed max-w-md">
            Optimized Freight from Djibouti to <strong className="text-[#0F172A] font-bold">Addis Ababa</strong> with <strong className="text-[#0F172A] font-bold">AI Matching</strong>, <strong className="text-[#0F172A] font-bold">Live Telematics</strong>, and Integrated Customs Documents.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3.5 pt-1">
            <a
              href="#features"
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all hover:border-slate-400"
            >
              {t('exploreFeatures')}
            </a>

            <a
              href="/login"
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#255779] hover:bg-[#1E4560] transition-all shadow-md hover:shadow-lg"
            >
              {t('requestDemo')}
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
              <span className="text-white font-bold">TradeFlow</span>
              <span className="text-slate-400 font-normal ml-2">Shipment Map and Operations Control</span>
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
                <text x="35" y="355" fill="#1E293B" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Djibouti Port</text>

                <text x="160" y="145" fill="#475569" fontSize="11" fontWeight="600">Diredawa</text>
                <text x="320" y="150" fill="#475569" fontSize="11" fontWeight="600">Metehara</text>

                <circle cx="450" cy="170" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="440" y="155" fill="#0F172A" fontSize="12" fontWeight="bold">Mojo</text>

                <circle cx="590" cy="120" r="7" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="560" y="105" fill="#0F172A" fontSize="13" fontWeight="800">Addis Ababa</text>

                <text x="540" y="275" fill="#64748B" fontSize="10">Naara</text>
                <text x="480" y="350" fill="#64748B" fontSize="10">Dirtedawa</text>

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
                    {t('realtimeTracking')}
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-8 sm:w-12 sm:h-9 rounded-md bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#0284C7]" />
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-normal">{t('speed')}</div>
                        <div className="text-[#0F172A] text-xs font-extrabold">{speed} km/h</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-normal">{t('eta')}</div>
                        <div className="text-[#0F172A] text-xs font-extrabold">1h 45m</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING OPERATIONS CONTROL HUD */}
              <div className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 w-36 sm:w-44 md:w-48 bg-[#0F172A] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl border border-slate-700/80">
                
                {/* 1. Active Shipments */}
                <div className="bg-[#182335] rounded-lg p-2 border border-slate-700/40">
                  <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{t('activeShipments')}</div>
                  <div className="flex items-end justify-between mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-white">16</span>
                    <svg className="w-12 sm:w-14 h-5 sm:h-6 text-[#10B981]" viewBox="0 0 60 25" fill="none">
                      <path d="M2 18L14 22L24 10L36 16L48 4L58 12" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* 2. Pending Bids */}
                <div className="bg-[#182335] rounded-lg p-2 border border-slate-700/40">
                  <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{t('pendingBids')}</div>
                  <div className="flex items-end justify-between mt-0.5">
                    <span className="text-xl sm:text-2xl font-black text-white">5</span>
                    <svg className="w-12 sm:w-14 h-5 sm:h-6 text-[#38BDF8]" viewBox="0 0 60 25" fill="none">
                      <path d="M2 20L16 18L30 22L42 12L58 6" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* 3. Fuel Status */}
                <div className="bg-[#182335] rounded-lg p-2 border border-slate-700/40">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-300 font-medium">
                    <Fuel className="w-3 h-3 text-[#38BDF8]" />
                    <span>{t('fuelStatus')}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <svg className="w-12 sm:w-14 h-6 sm:h-7 text-[#10B981]" viewBox="0 0 60 30" fill="none">
                      <path d="M6 28A24 24 0 0 1 54 28" stroke="#334155" strokeWidth="3.5" strokeLinecap="round"/>
                      <path d="M6 28A24 24 0 0 1 48 14" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round"/>
                      <line x1="30" y1="28" x2="42" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
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
