import React, { createContext, useContext, useState } from 'react';

type Language = 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, string> = {
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
  login: 'Log In',
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
  loginButton: 'Log In',
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
  cargoDescription: 'Cargo Description',
  offlineCheckinNotice: 'GPS Check-in works offline. Events sync automatically when connection restores.',
  confirmCheckin: 'Confirm Location Check-In',
  incidentTitle: 'Report Emergency / Route Delay',
  incidentType: 'Incident Category',
  incidentNotes: 'Incident Description & Milepost',
  broadcastIncident: 'Broadcast Alert to Control Center',
  podTitle: 'Digital Proof of Delivery (e-POD)',
  recipientName: 'Recipient Full Name',
  electronicSignature: 'Electronic Signature',
  signAndComplete: 'Sign and Complete Trip',
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
    // English locked for current phase
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
