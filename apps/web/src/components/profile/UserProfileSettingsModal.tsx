import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Phone,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Loader2,
  X,
  Bell,
  LogOut,
  Sliders,
  FileCheck2,
  Clock,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  validateEthiopianPhone,
  validatePassword,
  validatePasswordMatch,
} from '../../utils/validation';

interface UserProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalRole: 'SHIPPER' | 'FORWARDER' | 'CUSTOMS' | 'ADMIN';
}

export const UserProfileSettingsModal: React.FC<UserProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  portalRole,
}) => {
  const { user, updateUser, refreshUser, logout } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [tin, setTin] = useState('');
  const [tradeLicenseNo, setTradeLicenseNo] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password / Security Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Preference notification toggles (persisted in localStorage)
  const [smsAlerts, setSmsAlerts] = useState<boolean>(() => {
    return localStorage.getItem('tradeflow_sms_alerts') !== 'false';
  });
  const [bidAlerts, setBidAlerts] = useState<boolean>(() => {
    return localStorage.getItem('tradeflow_bid_alerts') !== 'false';
  });
  const [customsAlerts, setCustomsAlerts] = useState<boolean>(() => {
    return localStorage.getItem('tradeflow_customs_alerts') !== 'false';
  });

  // Sync user state into form when opened
  useEffect(() => {
    if (isOpen) {
      refreshUser();
    }
    if (user && isOpen) {
      setFullName(user.fullName || '');
      setCompanyName(user.companyName || '');
      setPhone(user.phone || '');
      setTin((user as any).tin || '');
      setTradeLicenseNo((user as any).tradeLicenseNo || '');
      setProfileSuccess('');
      setProfileError('');
      setPasswordSuccess('');
      setPasswordError('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [user, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' =
    portalRole === 'ADMIN' ? 'VERIFIED' : (user as any)?.verificationStatus || 'VERIFIED';

  // Role Badge Styling
  const getRoleBadge = () => {
    switch (portalRole) {
      case 'SHIPPER':
        return { label: 'Cargo Owner', bg: 'bg-sky-500/20 text-sky-300 border-sky-400/30' };
      case 'FORWARDER':
        return { label: 'Forwarder', bg: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
      case 'CUSTOMS':
        return { label: 'Customs Officer', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
      case 'ADMIN':
        return { label: 'Administrator', bg: 'bg-rose-500/20 text-rose-300 border-rose-400/30' };
    }
  };

  const roleBadge = getRoleBadge();

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    // Strict Ethiopian Phone Validation if provided
    let normalizedPhone = phone.trim();
    if (phone && phone.trim()) {
      const phoneRes = validateEthiopianPhone(phone, language as any);
      if (!phoneRes.isValid) {
        setProfileError(phoneRes.error || 'Only Ethiopian phone numbers (+251 9... / 09... or +251 7... / 07...) are accepted.');
        setProfileLoading(false);
        return;
      }
      normalizedPhone = phoneRes.normalized || normalizedPhone;
    }

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('tradeflow_token') || ''}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          fullName: fullName.trim(),
          companyName: companyName.trim(),
          phone: normalizedPhone,
          tin: tin.trim(),
          tradeLicenseNo: tradeLicenseNo.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile information.');
      }

      // Update in client AuthContext
      updateUser({
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        phone: normalizedPhone,
        ...(tin ? { tin: tin.trim() } : {}),
        ...(tradeLicenseNo ? { tradeLicenseNo: tradeLicenseNo.trim() } : {}),
      } as any);

      await refreshUser();
      setProfileSuccess(language === 'AM' ? 'መገለጫው ተሻሽሏል!' : 'Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3500);
    } catch (err: any) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');

    // Current Password Validation
    if (!oldPassword || !oldPassword.trim()) {
      setPasswordError(
        language === 'AM'
          ? 'እባክዎ የአሁኑን የይለፍ ቃል ያስገቡ።'
          : 'Please enter your current password.'
      );
      setPasswordLoading(false);
      return;
    }

    // Strict Password Validation (8+ chars, letter + number)
    const passRes = validatePassword(newPassword, language as any);
    if (!passRes.isValid) {
      setPasswordError(
        passRes.error ||
          (language === 'AM'
            ? 'አዲሱ የይለፍ ቃል ቢያንስ 8 ፊደላት/ቁጥሮች መሆን አለበት እና ፊደልና ቁጥር ማካተት አለበት።'
            : 'New password must be at least 8 characters long and contain at least one letter and one number.')
      );
      setPasswordLoading(false);
      return;
    }

    // Password Match Validation
    const matchRes = validatePasswordMatch(newPassword, confirmPassword, language as any);
    if (!matchRes.isValid) {
      setPasswordError(
        matchRes.error ||
          (language === 'AM'
            ? 'የተረጋገጠው የይለፍ ቃል ከአዲሱ ጋር አይዛመድም።'
            : 'New password and confirmation do not match.')
      );
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('tradeflow_token') || ''}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          phone: user?.phone,
          oldPassword: oldPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccess(
        language === 'AM'
          ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!'
          : 'Password changed successfully!'
      );
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      const msg = err.message || 'Error changing password.';
      if (language === 'AM') {
        if (msg.includes('Current password does not match') || msg.includes('temporary password does not match')) {
          setPasswordError('ያስገቡት የአሁን የይለፍ ቃል ትክክል አይደለም።');
        } else if (msg.includes('at least 8 characters')) {
          setPasswordError('አዲሱ የይለፍ ቃል ቢያንስ 8 ፊደላት/ቁጥሮች መሆን አለበት (ፊደልና ቁጥር ያካተተ)።');
        } else {
          setPasswordError(msg);
        }
      } else {
        setPasswordError(msg);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleSms = () => {
    const val = !smsAlerts;
    setSmsAlerts(val);
    localStorage.setItem('tradeflow_sms_alerts', String(val));
  };

  const toggleBid = () => {
    const val = !bidAlerts;
    setBidAlerts(val);
    localStorage.setItem('tradeflow_bid_alerts', String(val));
  };

  const toggleCustoms = () => {
    const val = !customsAlerts;
    setCustomsAlerts(val);
    localStorage.setItem('tradeflow_customs_alerts', String(val));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Side Drawer Container (Sliding from Right to Left, Compact width) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex z-10 pointer-events-none">
        <div className="w-screen max-w-sm sm:max-w-[410px] bg-white dark:bg-[#0F172A] shadow-2xl flex flex-col h-full pointer-events-auto border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-250 ease-out">
          
          {/* Top Header - Compact & Sleek */}
          <div className="bg-[#0F172A] px-5 py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center text-base font-black shadow-sm">
                  {(user?.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-black text-white truncate leading-tight">
                    {user?.fullName || 'Active User'}
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${roleBadge.bg}`}>
                    {roleBadge.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 truncate">
                  <span className="truncate">{user?.companyName || user?.email || 'TradeFlow'}</span>
                  {portalRole !== 'ADMIN' ? (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-400 shrink-0">
                        {verificationStatus === 'VERIFIED' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </>
                        ) : verificationStatus === 'PENDING' ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-400">Pending</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            <span className="text-rose-400">Suspended</span>
                          </>
                        )}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-400 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>
                          {user?.totalRatingsCount && user.totalRatingsCount > 0 && user?.ratingAvg
                            ? `${Number(user.ratingAvg).toFixed(1)}`
                            : 'New'}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span className="text-sky-400 font-medium">Platform Administration</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2 cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Pill Tabs - Fits perfectly without horizontal scrollbar */}
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-1.5 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-800 text-[#0284C7] dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="truncate">{language === 'AM' ? 'መገለጫ' : 'Profile'}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-1.5 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-slate-800 text-[#0284C7] dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="truncate">{language === 'AM' ? 'የይለፍ ቃል' : 'Password'}</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-1.5 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-white dark:bg-slate-800 text-[#0284C7] dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="truncate">{language === 'AM' ? 'ቅንብሮች' : 'Settings'}</span>
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

            {/* TAB 1: PROFILE & COMPANY (Clean Single-Column) */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                
                {profileSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold">{profileError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'ሙሉ ስም *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Bereket Sahlemariam"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'የድርጅት / ኩባንያ ስም' : 'Company / Enterprise Name'}
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. bekiplc"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'ኢሜይል አድራሻ (የተረጋገጠ)' : 'Email Address (Verified)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'ስልክ ቁጥር' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 91 123 4567"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                    />
                  </div>
                </div>

                {/* TIN & Trade License (Only for Shippers, Forwarders, Customs, Transporters) */}
                {portalRole !== 'ADMIN' && (
                  <>
                    {/* TIN */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'AM' ? 'የግብር ከፋይ መለያ (TIN)' : 'Tax Identification Number (TIN)'}
                      </label>
                      <div className="relative">
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={tin}
                          onChange={(e) => setTin(e.target.value)}
                          placeholder="e.g. 12345678"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                        />
                      </div>
                    </div>

                    {/* Trade License No */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'AM' ? 'የንግድ ፈቃድ ቁጥር' : 'Trade License / Reg Number'}
                      </label>
                      <div className="relative">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={tradeLicenseNo}
                          onChange={(e) => setTradeLicenseNo(e.target.value)}
                          placeholder="e.g. ETH-MOTI-1234"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'AM' ? 'በማስቀመጥ ላይ...' : 'Saving Changes...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{language === 'AM' ? 'ለውጦችን መዝግብ' : 'Save Profile Changes'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* TAB 2: CHANGE PASSWORD */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-3.5">
                
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-sky-950/30 border border-blue-200 dark:border-sky-800/60 text-blue-900 dark:text-sky-300 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <p className="text-blue-800 dark:text-sky-200 text-[11px] leading-relaxed">
                    {language === 'AM'
                      ? 'የይለፍ ቃልዎን በሚቀይሩበት ጊዜ ቢያንስ 8 ፊደላትና ቁጥሮችን ይጠቀሙ (ቢያንስ አንድ ፊደል እና አንድ ቁጥር)።'
                      : 'Ensure your password is at least 8 characters long and contains at least one letter and one number.'}
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="font-bold">{passwordError}</span>
                  </div>
                )}

                {/* Current / Old Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'የአሁን የይለፍ ቃል *' : 'Current Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder={language === 'AM' ? 'የአሁኑን የይለፍ ቃል ያስገቡ' : 'Enter current password'}
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'አዲስ ቋሚ የይለፍ ቃል *' : 'New Password *'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'AM' ? 'አዲሱን የይለፍ ቃል አረጋግጥ *' : 'Confirm Password *'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                    className="w-full py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'AM' ? 'በመቀየር ላይ...' : 'Updating Password...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>{language === 'AM' ? 'የይለፍ ቃል አድስ' : 'Update Password'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* TAB 3: SETTINGS & PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="space-y-3.5">

                {/* Notification Preferences */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#0284C7] dark:text-sky-400" />
                    <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      {language === 'AM' ? 'የማሳወቂያ ቅንብሮች' : 'Alerts & Notifications'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div
                      onClick={toggleSms}
                      className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {language === 'AM' ? 'የኤስኤምኤስ ማሳወቂያዎች' : 'SMS Dispatch Alerts'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {language === 'AM' ? 'የፍተሻ ኬላ እና ጭነት መልዕክቶች' : 'Checkpoints & dispatch updates'}
                        </div>
                      </div>
                      <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition shrink-0 ${smsAlerts ? 'bg-[#0284C7]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${smsAlerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    <div
                      onClick={toggleBid}
                      className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {language === 'AM' ? 'የጨረታ እና አዲስ ጥቅሶች' : 'Bidding & Quotes'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {language === 'AM' ? 'አጓጓዦች ዋጋ ሲያቀርቡ' : 'When carriers submit quotes'}
                        </div>
                      </div>
                      <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition shrink-0 ${bidAlerts ? 'bg-[#0284C7]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${bidAlerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    <div
                      onClick={toggleCustoms}
                      className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {language === 'AM' ? 'የጉምሩክ አረንጓዴ መስመር' : 'Customs Green Line'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {language === 'AM' ? 'የሞጆና ጋላፊ ፈቃድ ሲሰጥ' : 'Galafi / Modjo release notices'}
                        </div>
                      </div>
                      <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition shrink-0 ${customsAlerts ? 'bg-[#0284C7]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${customsAlerts ? 'translate-x-3.5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Drawer Footer - Compact & Clean */}
          <div className="bg-slate-50 dark:bg-[#0B0F19] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('dashboard.logout') || 'Log Out'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              {language === 'AM' ? 'ዝጋ' : 'Close'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
