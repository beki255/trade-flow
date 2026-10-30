import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { validatePassword, validatePasswordMatch } from '../utils/validation';
import { Logo } from '../components/Logo';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    if (!tokenParam && (!code.trim() || code.trim().length !== 6)) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    const passRes = validatePassword(newPassword);
    if (!passRes.isValid) {
      setErrorMsg(passRes.error || 'Password must be at least 8 characters with a letter and a number.');
      return;
    }

    const matchRes = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchRes.isValid) {
      setErrorMsg(matchRes.error || 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email.trim(),
          token: tokenParam || undefined,
          code: code.trim() || undefined,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password. The link or code may have expired.');
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Cannot reach TradeFlow server. Please check your connection.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090E17] text-white p-4">
      <div className="w-full max-w-md bg-[#111C2D] border border-slate-700/80 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <Logo className="w-7 h-7 text-[#38BDF8]" />
            <span className="text-xl font-black tracking-tight text-white">TradeFlow</span>
          </div>
          <h2 className="text-xl font-black text-white">Choose a New Password</h2>
          <p className="text-xs text-slate-400">
            Ethio-Djibouti Trade Corridor • Secure Account Recovery
          </p>
        </div>

        {success ? (
          <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Password Updated!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your password has been securely reset. You can now log into your TradeFlow portal.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            {/* 6-Digit Code (if no token) */}
            {!tokenParam && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full text-center tracking-[8px] font-mono text-xl py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-black focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters (letters & numbers)"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Update Password ➔</span>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
