import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'AM';

interface Translations {
  [key: string]: {
    EN: string;
    AM: string;
  };
}

export const landingTranslations: Translations = {
  home: { EN: 'Home', AM: 'ዋና ገጽ' },
  features: { EN: 'Features', AM: 'አገልግሎቶች' },
  pricing: { EN: 'Pricing', AM: 'የዋጋ ተመን' },
  demo: { EN: 'Demo Portals', AM: 'የሙከራ ገጾች' },
  contact: { EN: 'Contact', AM: 'አግኙን' },
  getStarted: { EN: 'Get Started Free', AM: 'በነፃ ይጀምሩ' },
  heroHeadline1: { EN: 'Digitize Your Trade Corridor.', AM: 'የንግድ መስመርዎን በዲጂታል ያቀላጥፉ።' },
  heroHeadline2: { EN: 'Real-Time Tracking.', AM: 'የቀጥታ የጭነት ክትትል ካርታ።' },
  heroHeadline3: { EN: 'Effortless Logistics.', AM: 'ቀላል እና አስተማማኝ ሎጅስቲክስ።' },
  heroSubtitle: { 
    EN: 'Optimized Freight from Djibouti to Addis Ababa with AI Matching, Live Telematics, and Integrated Customs Documents.',
    AM: 'ከጅቡቲ ወደብ እስከ አዲስ አበባ ያለውን የጭነት ትራንስፖርት በሰው ሰራሽ አስተዋይነት (AI)፣ በቅጽበታዊ ጂፒኤስ እና በዲጂታል የጉምሩክ ሰነዶች ማቀላጠፊያ።'
  },
  exploreFeatures: { EN: 'Explore Features', AM: 'አገልግሎቶችን ይመልከቱ' },
  requestDemo: { EN: 'Quick Demo Access', AM: 'የሙከራ አካውንቶች' },
  mapHeader: { EN: 'TradeFlow Shipment Map and Operations Control', AM: 'የጭነት መከታተያ ካርታ እና የቁጥጥር ማዕከል' },
  realtimeTracking: { EN: 'Real-Time Tracking', AM: 'አሁናዊ የቦታ ክትትል' },
  speed: { EN: 'Speed', AM: 'ፍጥነት' },
  eta: { EN: 'ETA', AM: 'የሚደርስበት' },
  activeShipments: { EN: 'Active Shipments', AM: 'በጉዞ ላይ ያሉ' },
  pendingBids: { EN: 'Pending Bids', AM: 'ክፍት ጨረታዎች' },
  fuelStatus: { EN: 'Fuel Status', AM: 'የነዳጅ ክምችት' },
  aiMatchingTitle: { EN: 'AI Matching', AM: 'AI ማዛመጃ' },
  aiMatchingDesc: { 
    EN: 'AI-powered freight matching from Djibouti corridor, enabling digitized logistics optimization.',
    AM: 'የጭነት ባለቤቶችን ከአጓጓዦች ጋር በሰከንዶች ውስጥ በዋጋ እና በአስተማማኝነት የሚያዛምድ ስልተ-ቀመር።'
  },
  dynamicPricingTitle: { EN: 'Dynamic Pricing', AM: 'ተለዋዋጭ የዋጋ ተመን' },
  dynamicPricingDesc: { 
    EN: 'Real-time spot pricing responsive to fuel costs, capacity balance, and corridor congestion.',
    AM: 'እንደ ነዳጅ ዋጋ፣ የፍላጎትና አቅርቦት ጥምርታ እና የመንገድ መጨናነቅ የሚሰላ ትክክለኛ የጭነት ዋጋ።'
  },
  digitalDocsTitle: { EN: 'Digital Documents', AM: 'ዲጂታል የጉምሩክ ሰነዶች' },
  digitalDocsDesc: { 
    EN: 'Streamlined customs documentation with automated pre-submission compliance validation.',
    AM: 'የክፍያ ሰነድ (Invoice)፣ Packing List እና B/L በራስ-ሰር አረጋግጦ ለጉምሩክ ፈቃድ ማቅረቢያ።'
  },
  predictiveEtaTitle: { EN: 'Predictive ETA', AM: 'ግምታዊ የመድረሻ ሰዓት' },
  predictiveEtaDesc: { 
    EN: 'Predictive ETA tracking factoring live telematics, weather, and checkpoint queues.',
    AM: 'የአየር ሁኔታን፣ የመንገድ ፍተሻ መዘግየቶችን እና የመኪናውን ፍጥነት ያገናዘበ አስተማማኝ ግምት።'
  },
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
