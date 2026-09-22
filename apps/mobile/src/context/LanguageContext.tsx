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
    // Strictly English only across the system
    setLanguage('EN');
  };

  const t = (key: string): string => {
    return translations.EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'EN', setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
