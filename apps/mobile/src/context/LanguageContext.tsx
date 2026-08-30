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
    // Brand & Common
    tradeflow: 'TradeFlow',
    welcome: 'Welcome',
    logout: 'Logout',
    back: 'Back',
    or: 'OR',
    submit: 'Submit',
    cancel: 'Cancel',
    verified: 'Verified',
    loading: 'Loading...',

    // Welcome Screen
    login: 'Login',
    createAccount: 'Create Account',
    fastDemoDriver: 'Fast Demo Driver',
    lakeAbbe: 'Lake Abbe',
    mojo: 'Mojo',

    // Auth & Roles
    mobileLogin: 'Mobile Login',
    mobileLoginSub: 'Dedicated mobile portal for freight drivers and fleet transporters.',
    driver: 'Driver',
    transporter: 'Transporter',
    phoneOrEmail: 'Phone Number or Email',
    companyEmail: 'Company Email',
    password: 'Password',
    createPassword: 'Create Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot Password?',
    loginButton: 'Login to Portal',
    continueWithGoogle: 'Continue with Google',
    signUpWithGoogle: 'Sign up with Google',
    noAccount: "Don't have an account?",
    alreadyAccount: 'Already have an account?',
    register: 'Register',
    autoFillDriver: 'Demo Driver',
    autoFillTransporter: 'Demo Transporter',

    // Registration
    registrationTitle: 'New Account Registration',
    registrationSub: 'Join the Ethiopia–Djibouti Trade Corridor Network.',
    fullName: 'Full Name',
    driverFullName: 'Driver Full Name',
    phoneNumber: 'Phone Number',
    driverLicenseNo: 'Driver License Number',
    licenseClass: 'License Category',
    companyName: 'Transport Company Name',
    ownerName: 'Owner / Manager Full Name',
    tin: 'Tax Identification Number (TIN)',
    fleetSize: 'Fleet Size (Trucks)',
    completeRegistration: 'Complete Registration',
    fillRequired: 'Please fill in all required fields.',

    // Transporter Portal Tabs
    fleetTab: 'Fleet',
    loadBoardTab: 'Load Board',
    quickBidTab: 'Quick Bid',
    earningsTab: 'Earnings',
    fleetOverview: 'Fleet Status Overview',
    loadBoardTitle: 'Corridor Load Board',
    loadBoardSub: 'Select any freight load to submit a direct competitive bid.',
    quickBidTitle: 'Quick Bid Submission',
    earningsTitle: 'Earnings & Fuel Summary',
    selectedLoadId: 'Selected Cargo Load ID',
    proposedRate: 'Proposed Freight Rate (ETB)',
    transitHours: 'Transit Delivery Window (Hours)',
    transporterNotes: 'Transporter Notes & Vehicle Guarantee',
    submitBid: 'Lock & Submit Live Bid',
    totalPayouts: 'Total Payouts (This Month)',
    completedTrips: 'Completed Corridor Trips',
    fuelEfficiency: 'Fleet Fuel Efficiency Trends',
    avgConsumption: 'Average Corridor Consumption',
    galafiIdle: 'Galafi Border Idle Time',
    payoutAccount: 'TeleBirr Payout Account',
    submitBidForLoad: 'Submit Bid for this Load',

    // Driver Portal Tabs
    activeTripTab: 'Active Trip',
    offlineNavTab: 'Offline Nav',
    checkinTab: 'Check-in',
    incidentTab: 'Incident',
    podTab: 'Digital POD',
    sosEmergency: 'SOS EMERGENCY CALL',
    sosBroadcasting: 'SOS EMERGENCY BROADCASTING LIVE TO CONTROL CENTER',
    currentSpeed: 'Current Speed',
    remainingTime: 'Remaining Transit Time',
    currentPosition: 'Current Position',
    origin: 'Origin',
    destination: 'Destination',
    corridorWaypoints: 'Corridor Waypoints & Safe Zones',
    offlineModeActive: 'Offline Mode: Corridor Map & Safe Zones Cached',
    gpsCheckinTitle: 'GPS Waypoint Check-in',
    autoGpsLocation: 'Auto-Detected GPS Location',
    gpsAccuracy: 'GPS Accuracy',
    gatePassPhoto: 'Stamped Gate Pass / Odometer Photo',
    confirmCheckin: 'Confirm Waypoint Check-in',
    incidentTitle: 'Incident Reporting',
    incidentCategory: 'Incident Category',
    incidentDescription: 'Incident Description & Milepost Details',
    broadcastIncident: 'Broadcast Geotagged Incident',
    podTitle: 'Digital Proof-of-Delivery',
    recipientName: 'Recipient / Customs Officer Name',
    electronicSignature: 'Electronic Signature Pad',
    signAndComplete: 'Sign & Complete Trip',
  },

  AM: {
    // Brand & Common
    tradeflow: 'ትሬድፍሎው',
    welcome: 'እንኳን ደህና መጡ',
    logout: 'ይውጡ',
    back: 'ተመለስ',
    or: 'ወይም',
    submit: 'አስገባ',
    cancel: 'ሰርዝ',
    verified: 'የተረጋገጠ',
    loading: 'በመጫን ላይ...',

    // Welcome Screen
    login: 'ይግቡ',
    createAccount: 'አዲስ አካውንት ይክፈቱ',
    fastDemoDriver: 'ፈጣን የሙከራ አሽከርካሪ',
    lakeAbbe: 'አቤ ሀይቅ',
    mojo: 'ሞጆ',

    // Auth & Roles
    mobileLogin: 'የሞባይል መግቢያ',
    mobileLoginSub: 'ለከባድ ጭነት አሽከርካሪዎች እና ለትራንስፖርት ባለቤቶች የተዘጋጀ።',
    driver: 'አሽከርካሪ',
    transporter: 'አጓጓዥ',
    phoneOrEmail: 'ስልክ ቁጥር ወይም ኢሜይል',
    companyEmail: 'የድርጅቱ ኢሜይል',
    password: 'የይለፍ ቃል',
    createPassword: 'አዲስ የይለፍ ቃል ፍጠር',
    rememberMe: 'አስታውሰኝ',
    forgotPassword: 'የይለፍ ቃል ረሱ?',
    loginButton: 'ወደ መተግበሪያው ግባ',
    continueWithGoogle: 'በጉግል ቀጥል',
    signUpWithGoogle: 'በጉግል ተመዝገብ',
    noAccount: 'አዲስ ተጠቃሚ ነዎት?',
    alreadyAccount: 'አካውንት አለዎት?',
    register: 'ይመዝገቡ',
    autoFillDriver: 'የአሽከርካሪ ሙከራ',
    autoFillTransporter: 'የአጓጓዥ ሙከራ',

    // Registration
    registrationTitle: 'አዲስ አካውንት ምዝገባ',
    registrationSub: 'የኢትዮጵያ–ጅቡቲ የንግድ ኮሪደር ትራንስፖርት አውታርን ይቀላቀሉ።',
    fullName: 'ሙሉ ስም',
    driverFullName: 'የአሽከርካሪው ሙሉ ስም',
    phoneNumber: 'ስልክ ቁጥር',
    driverLicenseNo: 'የመንጃ ፈቃድ ቁጥር',
    licenseClass: 'የመንጃ ፈቃድ ደረጃ',
    companyName: 'የድርጅቱ ስም',
    ownerName: 'የባለቤቱ / አስተዳዳሪው ሙሉ ስም',
    tin: 'የግብር ከፋይ መለያ ቁጥር (TIN)',
    fleetSize: 'የጭነት መኪኖች ብዛት',
    completeRegistration: 'ምዝገባውን አጠናቅቅ',
    fillRequired: 'እባክዎን አስፈላጊ መረጃዎችን በትክክል ይሙሉ',

    // Transporter Portal Tabs
    fleetTab: 'ተሽከርካሪዎች',
    loadBoardTab: 'የጭነት ሰሌዳ',
    quickBidTab: 'ፈጣን ጨረታ',
    earningsTab: 'የገቢ ሪፖርት',
    fleetOverview: 'የተሽከርካሪዎች አጠቃላይ ሁኔታ',
    loadBoardTitle: 'የሚጫኑ እቃዎች ዝርዝር',
    loadBoardSub: 'ዋጋ ለማቅረብ የሚፈልጉትን የጭነት አይነት ይምረጡ።',
    quickBidTitle: 'የጨረታ ዋጋ ማቅረቢያ',
    earningsTitle: 'የገቢ እና የነዳጅ ወጪ ሪፖርት',
    selectedLoadId: 'የተመረጠው ጭነት መለያ',
    proposedRate: 'የቀረበው የትራንስፖርት ዋጋ (ብር)',
    transitHours: 'የሚወስደው የጉዞ ሰዓት',
    transporterNotes: 'የአጓጓዡ ማስታወሻ እና የመኪና ዋስትና',
    submitBid: 'የጨረታ ዋጋውን አስገባ',
    totalPayouts: 'አጠቃላይ የተከፈለ ገቢ (በዚህ ወር)',
    completedTrips: 'የተጠናቀቁ የኮሪደር ጉዞዎች',
    fuelEfficiency: 'የነዳጅ አጠቃቀም ቅልጥፍና',
    avgConsumption: 'አማካይ የነዳጅ ፍጆታ',
    galafiIdle: 'በገላፊ ድንበር የቆይታ ጊዜ',
    payoutAccount: 'የቴሌብር መቀበያ አካውንት',
    submitBidForLoad: 'ለዚህ ጭነት ዋጋ አቅርብ',

    // Driver Portal Tabs
    activeTripTab: 'የአሁኑ ጉዞ',
    offlineNavTab: 'የመንገድ ካርታ',
    checkinTab: 'ቦታ ማረጋገጫ',
    incidentTab: 'አደጋ ሪፖርት',
    podTab: 'ርክክብ ፊርማ',
    sosEmergency: 'የአደጋ ጊዜ ጥሪ (SOS)',
    sosBroadcasting: 'የአደጋ ጥሪው በቀጥታ ለደህንነት ማዕከሉ እየተላለፈ ነው',
    currentSpeed: 'የአሁኑ ፍጥነት',
    remainingTime: 'የቀረው የጉዞ ሰዓት',
    currentPosition: 'የአሁኑ ቦታ',
    origin: 'መነሻ',
    destination: 'መዳረሻ',
    corridorWaypoints: 'የኮሪደሩ ማቆሚያዎችና የደህንነት ጣቢያዎች',
    offlineModeActive: 'ኦፍላይን ሞድ፡ የመንገድ ካርታው ያለ ኢንተርኔት ይሰራል',
    gpsCheckinTitle: 'የቦታ መድረሻ ማረጋገጫ በጂፒኤስ',
    autoGpsLocation: 'በጂፒኤስ የተገኘ ትክክለኛ መገኛ',
    gpsAccuracy: 'የጂፒኤስ ትክክለኛነት',
    gatePassPhoto: 'የማለፊያ ፈቃድ ወይም የኦዶሜትር ፎቶ',
    confirmCheckin: 'መድረሴን አረጋግጥ',
    incidentTitle: 'የመንገድ መዘጋት ወይም የአደጋ ሪፖርት',
    incidentCategory: 'የአደጋው ዓይነት',
    incidentDescription: 'የአደጋው ዝርዝር መግለጫ እና የቦታው ምልክት',
    broadcastIncident: 'ሪፖርቱን ወደ ማዕከሉ ላክ',
    podTitle: 'የእቃ ርክክብ ማረጋገጫ ኤሌክትሮኒክ ፊርማ',
    recipientName: 'የተረካቢው ወይም የጉምሩክ ኦፊሰሩ ስም',
    electronicSignature: 'የዲጂታል ፊርማ መፈረሚያ ሰሌዳ',
    signAndComplete: 'ፈርመህ ጉዞውን አጠናቅቅ',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'AM',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('AM');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'AM' ? 'EN' : 'AM'));
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
