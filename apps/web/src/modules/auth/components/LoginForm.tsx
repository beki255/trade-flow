import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Eye, EyeOff, CheckCircle2, Globe } from 'lucide-react';
import { Logo } from '../../../components/Logo';
import { LanguageDropdown } from '../../../components/LanguageDropdown';
import { validateEthiopianPhone } from '../../../utils/validation';
import { ForgotPasswordModal } from '../../../components/auth/ForgotPasswordModal';

interface LoginFormProps {
  onAuthSuccess: (role: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
  const { loginUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('tradeflow_remembered_identifier') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tradeflow_remember_me');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(t('auth.requiredFields'));
      return;
    }

    // If identifier looks like a phone number (not an email), enforce Ethiopian phone code
    const isLikelyPhone = !email.includes('@') && /[\d+]/.test(email);
    let resolvedIdentifier = email.trim();
    if (isLikelyPhone) {
      const phoneRes = validateEthiopianPhone(email, language as any);
      if (!phoneRes.isValid) {
        setErrorMsg(phoneRes.error || 'Only Ethiopian phone numbers (+251 9... / 09... or +251 7... / 07...) are accepted.');
        return;
      }
      resolvedIdentifier = phoneRes.normalized || resolvedIdentifier;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginUser(resolvedIdentifier, password);
      
      // Persist or clear Remember Me preference in localStorage
      try {
        if (rememberMe) {
          localStorage.setItem('tradeflow_remembered_identifier', email.trim());
          localStorage.setItem('tradeflow_remember_me', 'true');
        } else {
          localStorage.removeItem('tradeflow_remembered_identifier');
          localStorage.setItem('tradeflow_remember_me', 'false');
        }
      } catch (e) {
        // ignore localStorage errors
      }

      setLoading(false);
      const resolvedRole = res?.user?.role || 'SHIPPER';
      onAuthSuccess(resolvedRole);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F0F6FB] p-4 sm:p-8 lg:p-12 flex flex-col justify-center items-center overflow-y-auto relative">
      
      {/* Top Bar with Language Switcher */}
      <div className="w-full max-w-md flex items-center justify-end mb-4">
        {/* Floating Language Dropdown */}
        <LanguageDropdown />
      </div>

      {/* Main Floating Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5">
        
        {/* Brand Icon & Card Title */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Logo className="w-6 h-6 text-[#0284C7]" />
            <span className="text-base font-black text-slate-900">TradeFlow</span>
          </div>
          <h2 className="text-2xl sm:text-[26px] font-black text-[#0F172A] tracking-tight">
            {t('auth.loginHeading')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('auth.loginSubheading')}
          </p>
        </div>

        {/* Tab Switcher: Login active, Register link */}
        <div className="w-full p-1 bg-slate-100 rounded-full flex items-center border border-slate-200">
          <span className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#111C2D] text-white text-center shadow-md">
            {t('auth.loginTab')}
          </span>
          <Link
            to="/register"
            className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-full text-slate-600 hover:text-slate-900 text-center transition-all"
          >
            {t('auth.registerTab')}
          </Link>
        </div>

        {/* Notifications */}
        {errorMsg ? (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        ) : null}

        {notice ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{notice}</span>
          </div>
        ) : null}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.passwordLabel')}
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
              />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[#0284C7] hover:underline font-semibold cursor-pointer"
            >
              {t('auth.forgotPassword')}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-[#111C2D] hover:bg-[#1E293B] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? t('auth.authenticating') : t('auth.signIn')}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="text-center text-xs text-slate-500">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-bold text-[#0284C7] hover:underline">
            {t('auth.registerOrg')}
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal via SMTP */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
        onResetSuccess={() => {
          setNotice('Password reset successful! You may now sign in with your new password.');
        }}
      />
    </div>
  );
};
