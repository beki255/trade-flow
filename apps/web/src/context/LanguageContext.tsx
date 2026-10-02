import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'EN' | 'AM' | 'OM';

interface Translations {
  [key: string]: {
    EN: string;
    AM: string;
    OM: string;
  };
}

export const landingTranslations: Translations = {
  home: { EN: 'Home', AM: 'ዋና ገጽ', OM: 'Fuula Duraa' },
  features: { EN: 'Features', AM: 'አገልግሎቶች', OM: 'Tajaajiloota' },
  pricing: { EN: 'Pricing', AM: 'የዋጋ ተመን', OM: 'Gatii' },
  demo: { EN: 'Demo Portals', AM: 'የሙከራ ገጾች', OM: 'Fuulawwan Yaalii' },
  contact: { EN: 'Contact', AM: 'አግኙን', OM: 'Nu Quunnamaa' },
  getStarted: { EN: 'Get Started Free', AM: 'በነፃ ይጀምሩ', OM: 'Bilaash Jalqabaa' },
  heroHeadline1: { EN: 'Digitize Your Trade Corridor.', AM: 'የንግድ መስመርዎን በዲጂታል ያቀላጥፉ።', OM: 'Daandii Daldala Keessan Diijiteessaa.' },
  heroHeadline2: { EN: 'Real-Time Tracking.', AM: 'የቀጥታ የጭነት ክትትል ካርታ።', OM: 'Hordoffii Yeroo Qabatamaa.' },
  heroHeadline3: { EN: 'Effortless Logistics.', AM: 'ቀላል እና አስተማማኝ ሎጅስቲክስ።', OM: 'Lojistiksii Salphaa fi Amansiisaa.' },
  heroSubtitle: { 
    EN: 'Optimized Freight from Djibouti to Addis Ababa with AI Matching, Live Telematics, and Integrated Customs Documents.',
    AM: 'ከጅቡቲ ወደብ እስከ አዲስ አበባ ያለውን የጭነት ትራንስፖርት በሰው ሰራሽ አስተዋይነት (AI)፣ በቅጽበታዊ ጂፒኤስ እና በዲጂታል የጉምሩክ ሰነዶች ማቀላጠፊያ።',
    OM: 'Fe\'isa buufata Jibuutii irraa hanga Finfinneetti AI, telemaatiiksii kallattii fi sanadoota gumruukaatiin qindeessaa.'
  },
  exploreFeatures: { EN: 'Explore Features', AM: 'አገልግሎቶችን ይመልከቱ', OM: 'Tajaajiloota Daawwadhaa' },
  requestDemo: { EN: 'Quick Demo Access', AM: 'የሙከራ አካውንቶች', OM: 'Akaawuntii Yaalii' },
  mapHeader: { EN: 'TradeFlow Shipment Map and Operations Control', AM: 'የጭነት መከታተያ ካርታ እና የቁጥጥር ማዕከል', OM: 'Kaartaa Hordoffii Fe\'isaa fi Wiirtuu To\'annoo' },
  realtimeTracking: { EN: 'Real-Time Tracking', AM: 'አሁናዊ የቦታ ክትትል', OM: 'Hordoffii Yeroo Qabatamaa' },
  speed: { EN: 'Speed', AM: 'ፍጥነት', OM: 'Saffisa' },
  eta: { EN: 'ETA', AM: 'የሚደርስበት', OM: 'Yeroo Ga\'iinsaa' },
  activeShipments: { EN: 'Active Shipments', AM: 'በጉዞ ላይ ያሉ', OM: 'Fe\'isa Imala Irra Jiran' },
  pendingBids: { EN: 'Pending Bids', AM: 'ክፍት ጨረታዎች', OM: 'Caalbaasiiwwan Eeggatan' },
  fuelStatus: { EN: 'Fuel Status', AM: 'የነዳጅ ክምችት', OM: 'Haala Boba\'aa' },
  aiMatchingTitle: { EN: 'AI Matching', AM: 'AI ማዛመጃ', OM: 'Walsimsiisa AI' },
  aiMatchingDesc: { 
    EN: 'AI-powered freight matching from Djibouti corridor, enabling digitized logistics optimization.',
    AM: 'የጭነት ባለቤቶችን ከአጓጓዦች ጋር በሰከንዶች ውስጥ በዋጋ እና በአስተማማኝነት የሚያዛምድ ስልተ-ቀመር።',
    OM: 'Abbootii qabeenyaa fe\'isaa konkolaachistoota waliin sekondii keessatti walsimsiisa.'
  },
  dynamicPricingTitle: { EN: 'Dynamic Pricing', AM: 'ተለዋዋጭ የዋጋ ተመን', OM: 'Gatii Jijjiiramaa' },
  dynamicPricingDesc: { 
    EN: 'Real-time spot pricing responsive to fuel costs, capacity balance, and corridor congestion.',
    AM: 'እንደ ነዳጅ ዋጋ፣ የፍላጎትና አቅርቦት ጥምርታ እና የመንገድ መጨናነቅ የሚሰላ ትክክለኛ የጭነት ዋጋ።',
    OM: 'Gatii boba\'aa fi dhiphina daandii irratti hundaa\'ee gatii fe\'isaa sirrii herregu.'
  },
  digitalDocsTitle: { EN: 'Digital Documents', AM: 'ዲጂታል የጉምሩክ ሰነዶች', OM: 'Sanadoota Gumruuka Diijitaalaa' },
  digitalDocsDesc: { 
    EN: 'Streamlined customs documentation with automated pre-submission compliance validation.',
    AM: 'የክፍያ ሰነድ (Invoice)፣ Packing List እና B/L በራስ-ሰር አረጋግጦ ለጉምሩክ ፈቃድ ማቅረቢያ።',
    OM: 'Nagahee kaffaltii, tarree qorannoo fi B/L ofumaan mirkaneessee gumruukaaf dhiyeessa.'
  },
  predictiveEtaTitle: { EN: 'Predictive ETA', AM: 'ግምታዊ የመድረሻ ሰዓት', OM: 'Tilmaama Yeroo Ga\'iinsaa' },
  predictiveEtaDesc: { 
    EN: 'Predictive ETA tracking factoring live telematics, weather, and checkpoint queues.',
    AM: 'የአየር ሁኔታን፣ የመንገድ ፍተሻ መዘግየቶችን እና የመኪናውን ፍጥነት ያገናዘበ አስተማማኝ ግምት።',
    OM: 'Haala qilleensaa fi saffisa konkolaataa irratti hundaa\'uun yeroo ga\'iinsaa tilmaama.'
  },
  shipperPortal: { EN: 'Shipper Portal', AM: 'የጭነት ባለቤት ፖርታል', OM: 'Poortaalii Abbaa Qabeenyaa' },
  transporterPortal: { EN: 'Transporter Portal', AM: 'የአጓጓዥ ፖርታል', OM: 'Poortaalii Fe\'aa' },
  driverPortal: { EN: 'Driver Mobile', AM: 'የሹፌር መተግበሪያ', OM: 'Moobaayila Konkolaachisaa' },
  customsPortal: { EN: 'Customs Officer', AM: 'የጉምሩክ ባለስልጣን', OM: 'Abbaa Taayitaa Gumruukaa' },
  adminPortal: { EN: 'Admin Console', AM: 'የአስተዳዳሪ ማዕከል', OM: 'Wiirtuu Bulchiinsaa' },
  postLoad: { EN: 'Post Freight Load', AM: 'አዲስ ጭነት ይለጥፉ', OM: 'Fe\'isa Haaraa Maxxansaa' },
  liveTracking: { EN: 'Live Tracking', AM: 'የቀጥታ ክትትል', OM: 'Hordoffii Kallattii' },
  offlineSync: { EN: 'Offline Auto-Sync', AM: 'ያለኢንተርኔት ራስ-ሰር ማመሳሰል', OM: 'Ofiin Walsaamuu' },
  telebirrEscrow: { EN: 'Smart Escrow (TeleBirr & CBE)', AM: 'አስተማማኝ የኤስክሮው ክፍያ (ቴሌብር እና ሲቢኢ)', OM: 'Kaffaltii Amansiisaa (TeleBirr & CBE)' },
  complianceEcc: { EN: 'ECC Compliant', AM: 'የኢትዮጵያ ጉምሩክ ኮሚሽን ደንብ ያሟላ', OM: 'Ulaagaa Gumruukaa Guute' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: string): string => {
    if (landingTranslations[key]) {
      return landingTranslations[key][language] || landingTranslations[key]['EN'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
