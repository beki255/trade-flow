import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageDropdownProps {
  dark?: boolean;
  className?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ dark = false, className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; subLabel: string; flag: string }[] = [
    { code: 'EN', label: 'English', subLabel: 'English', flag: '🇬🇧' },
    { code: 'AM', label: 'አማርኛ', subLabel: 'Amharic', flag: '🇪🇹' },
    { code: 'OM', label: 'Afaan Oromoo', subLabel: 'Oromo', flag: '🌳' },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
          dark
            ? 'bg-slate-800/90 hover:bg-slate-700/90 text-white border-slate-700/80 shadow-xs'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs'
        }`}
        aria-expanded={isOpen}
      >
        <Globe className={`w-3.5 h-3.5 ${dark ? 'text-[#38BDF8]' : 'text-[#0284C7]'}`} />
        <span className="flex items-center gap-1.5">
          <span>{current.flag}</span>
          <span className="font-extrabold">{current.label}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-400`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-1.5 w-44 rounded-2xl shadow-xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
          dark
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/50'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10'
        }`}>
          <div className="text-[9.5px] uppercase tracking-wider font-extrabold px-2.5 py-1 text-slate-400">
            Language / ቋንቋ
          </div>
          {languages.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected
                    ? dark
                      ? 'bg-sky-500/20 text-[#38BDF8]'
                      : 'bg-sky-50 text-[#0284C7]'
                    : dark
                    ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.flag}</span>
                  <div>
                    <div className="font-extrabold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.subLabel}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
