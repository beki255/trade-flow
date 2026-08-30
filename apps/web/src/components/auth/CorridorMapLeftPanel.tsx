import React, { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const CorridorMapLeftPanel: React.FC = () => {
  const [truckProgress, setTruckProgress] = useState(35);

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckProgress((prev) => (prev >= 92 ? 10 : prev + 0.4));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#090E17] p-8 md:p-12 flex flex-col justify-between overflow-hidden select-none border-r border-slate-800/80">
      
      {/* Top Header: Brand Logo & Back link */}
      <div className="z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 group cursor-pointer"
            title="Back to Landing Page"
          >
            <Logo className="w-8 h-8 text-[#38BDF8] group-hover:scale-105 transition-transform" size={30} />
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
              TradeFlow
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-700/80 hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Large Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-tight max-w-md">
          TradeFlow Corridor Access
        </h1>
      </div>

      {/* Center Interactive Night Corridor Map SVG */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-90 pointer-events-none">
        <svg className="w-full h-full object-cover" viewBox="0 0 900 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dark topographic terrain contours */}
          <rect width="900" height="600" fill="#090E17"/>
          <path d="M0 0C160 50 320 80 500 60C680 40 780 120 900 100V600H0V0Z" fill="#0D1524" opacity="0.8"/>
          <path d="M0 240C200 270 380 220 600 300C820 380 860 260 900 320V600H0V240Z" fill="#111B2E" opacity="0.6"/>

          {/* Lake Abbet & Lake Abbe */}
          <path d="M120 280 C150 260 200 290 190 340 C175 370 110 360 100 320 Z" fill="#1E3A5F" opacity="0.85"/>
          <text x="110" y="325" fill="#60A5FA" fontSize="12" fontWeight="600">Lake Abbet</text>

          <path d="M80 390 C120 370 170 410 160 460 C145 490 70 480 60 440 Z" fill="#1E3A5F" opacity="0.75"/>
          <text x="95" y="445" fill="#60A5FA" fontSize="13" fontWeight="600">Lake Abbe</text>

          {/* Secondary road network */}
          <path d="M140 180Q320 120 540 160Q720 180 840 320" stroke="#1E293B" strokeWidth="2.5" strokeDasharray="6 6"/>
          <path d="M460 320Q620 290 760 460" stroke="#1E293B" strokeWidth="2.5" strokeDasharray="6 6"/>

          {/* PRIMARY GLOWING TRADE HIGHWAY CORRIDOR */}
          <path
            d="M150 480 Q260 410 390 350 Q520 290 640 240 Q740 220 820 180"
            stroke="#1D4ED8"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M150 480 Q260 410 390 350 Q520 290 640 240 Q740 220 820 180"
            stroke="#38BDF8"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Alternate northern route */}
          <path
            d="M170 330 Q280 220 420 180 Q560 170 700 190 Q800 180 820 180"
            stroke="#1E40AF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* Checkpoints & Nodes */}
          <circle cx="150" cy="480" r="7" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2"/>
          <text x="90" y="510" fill="#94A3B8" fontSize="13" fontWeight="bold">Galafi Port</text>

          <circle cx="420" cy="180" r="5" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.5"/>
          <text x="395" y="160" fill="#CBD5E1" fontSize="12" fontWeight="600">Diredawa</text>

          <text x="500" y="170" fill="#94A3B8" fontSize="11">Metehara</text>
          <text x="620" y="180" fill="#94A3B8" fontSize="11">Metehara</text>

          <circle cx="700" cy="205" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2"/>
          <text x="685" y="235" fill="#34D399" fontSize="13" fontWeight="bold">Mojo</text>

          <circle cx="820" cy="180" r="8" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="3"/>
          <text x="760" y="155" fill="#FFFFFF" fontSize="15" fontWeight="800">Addis Ababa</text>

          {/* Route shields */}
          <rect x="850" y="270" width="22" height="16" rx="3" fill="#1E293B" stroke="#475569"/>
          <text x="856" y="282" fill="#E2E8F0" fontSize="10" fontWeight="bold">30</text>

          <rect x="740" y="440" width="24" height="16" rx="3" fill="#1E293B" stroke="#475569"/>
          <text x="745" y="452" fill="#E2E8F0" fontSize="10" fontWeight="bold">120</text>

          {/* Dynamic Trucks with Light Beams */}
          <g transform={`translate(${150 + (truckProgress / 100) * 670}, ${480 - (truckProgress / 100) * 300})`}>
            <polygon points="12,-4 50,-12 50,12 12,4" fill="#38BDF8" opacity="0.15" />
            <rect x="-16" y="-8" width="32" height="16" rx="3" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5"/>
            <rect x="8" y="-6" width="6" height="12" rx="1.5" fill="#38BDF8"/>
          </g>

          <g transform="translate(480, 310)">
            <polygon points="12,-4 45,-10 45,10 12,4" fill="#38BDF8" opacity="0.12" />
            <rect x="-14" y="-7" width="28" height="14" rx="2.5" fill="#334155" stroke="#38BDF8" strokeWidth="1.2"/>
            <rect x="7" y="-5" width="5" height="10" rx="1" fill="#38BDF8"/>
          </g>

          <g transform="translate(340, 210)">
            <rect x="-14" y="-7" width="28" height="14" rx="2.5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1"/>
          </g>
        </svg>
      </div>

      {/* Floating Telematics HUD Card (Bottom Left) */}
      <div className="z-10 flex flex-col gap-6">
        <div className="w-fit min-w-[210px] rounded-xl bg-[#0F172A]/90 backdrop-blur-md border border-slate-700/70 p-3.5 shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 gap-6">
            <span className="text-slate-400">Active Trucks:</span>
            <span className="font-bold text-white text-sm">16</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 gap-6">
            <span className="text-slate-400">Avg. Speed:</span>
            <span className="font-bold text-white text-sm">68 km/h</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 gap-6 pt-1 border-t border-slate-800">
            <span className="text-slate-400">Galafi Clearance:</span>
            <span className="font-bold text-[#10B981] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Normal
            </span>
          </div>
        </div>

        <p className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug max-w-sm">
          Digitizing Cross-Border<br />Trade & Telematics.
        </p>
      </div>

    </div>
  );
};
