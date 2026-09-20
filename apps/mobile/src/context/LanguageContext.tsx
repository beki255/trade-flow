import React, { createContext, useContext, useState } from 'react';

type Language = 'EN' | 'AM';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    tradeflow: 'TradeFlow',
    welcome: 'Welcome',
    logout: 'Logout',
    back: 'Back',
    or: 'OR',
    submit: 'Submit',
    cancel: 'Cancel',
    verified: 'Verified',
    loading: 'Loading...',

    // Auth & Roles
    mobileLogin: 'Mobile Login',
    mobileLoginSub: 'Dedicated mobile portal for freight drivers and fleet transporters.',
    driver: 'Driver',
    transporter: 'Transporter',
    phoneOrEmail: 'Phone Number or Email',
    password: 'Password',
    loginButton: 'Log In',
    register: 'Register',

    // Transporter Portal Tabs
    fleetTab: 'Fleet',
    loadBoardTab: 'Load Board',
    quickBidTab: 'Quick Bid',
    myBidsTab: 'My Bids',
    myQuotesTitle: 'My Quotes & Bids',
    earningsTab: 'Earnings',
    fleetOverview: 'Fleet Status Overview',
    loadBoardTitle: 'Corridor Load Board',
    earningsTitle: 'Earnings & Settlements',

    // Driver Portal Tabs
    activeTripTab: 'Active Trip',
    offlineNavTab: 'Offline Nav',
    checkinTab: 'Check-in',
    incidentTab: 'Incident',
    podTab: 'Digital POD',
    sosEmergency: 'SOS EMERGENCY CALL',
    currentSpeed: 'Current Speed',
    remainingTime: 'Remaining Transit Time',
    origin: 'Origin',
    destination: 'Destination',
    confirmCheckin: 'Confirm Location Check-In',
    incidentTitle: 'Report Emergency / Route Delay',
    podTitle: 'Digital Proof of Delivery (e-POD)',
    recipientName: 'Recipient Full Name',
    signAndComplete: 'Sign and Complete Trip',
  },
  AM: {
    tradeflow: 'ትሬድፍሎው',
    welcome: 'እንኳን ደህና መጡ',
    logout: 'ውጣ',
    back: 'ተመለስ',
    or: 'ወይም',
    submit: 'አስገባ',
    cancel: 'ሰርዝ',
    verified: 'የተረጋገጠ',
    loading: 'በመጫን ላይ...',

    // Auth & Roles
    mobileLogin: 'የሞባይል መግቢያ',
    mobileLoginSub: 'ለአሽከርካሪዎች እና ለትራንስፖርት ድርጅቶች የተዘጋጀ የሞባይል ፖርታል',
    driver: 'አሽከርካሪ',
    transporter: 'የትራንስፖርት ድርጅት',
    phoneOrEmail: 'ስልክ ቁጥር ወይም ኢሜይል',
    password: 'የይለፍ ቃል',
    loginButton: 'ግባ',
    register: 'ይመዝገቡ',

    // Transporter Portal Tabs
    fleetTab: 'ተሽከርካሪዎች',
    loadBoardTab: 'የጭነት ሰሌዳ',
    quickBidTab: 'ፈጣን ጨረታ',
    myBidsTab: 'የኔ ዋጋዎች',
    myQuotesTitle: 'የኔ ዋጋዎች እና ጨረታዎች',
    earningsTab: 'ገቢዎች',
    fleetOverview: 'የተሽከርካሪዎች ሁኔታ',
    loadBoardTitle: 'የኮሪደር ጭነት ሰሌዳ',
    earningsTitle: 'ገቢዎች እና ክፍያዎች',

    // Driver Portal Tabs
    activeTripTab: 'ወቅታዊ ጉዞ',
    offlineNavTab: 'ካርታ',
    checkinTab: 'ቼክ-ኢን',
    incidentTab: 'አደጋ ሪፖርት',
    podTab: 'ዲጂታል ርክክብ',
    sosEmergency: 'የአስቸኳይ ጊዜ ጥሪ (SOS)',
    currentSpeed: 'ወቅታዊ ፍጥነት',
    remainingTime: 'ቀሪ የጉዞ ሰዓት',
    origin: 'መነሻ',
    destination: 'መዳረሻ',
    confirmCheckin: 'የመገኛ ቦታ አረጋግጥ',
    incidentTitle: 'የመንገድ አደጋ / መዘጋት ሪፖርት',
    podTitle: 'ዲጂታል የርክክብ ማረጋገጫ (e-POD)',
    recipientName: 'የተረካቢው ሙሉ ስም',
    signAndComplete: 'ፈርመህ ጉዞውን አጠናቅቅ',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'EN',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('EN');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'AM' : 'EN'));
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
