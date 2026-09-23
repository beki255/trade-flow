import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { GoogleAuthButton } from '../../../components/auth/GoogleAuthButton';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface LoginFormProps {
  onAuthSuccess: (role: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
  const { loginUser, googleAuthUser } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginUser(email, password);
      setLoading(false);
      const resolvedRole = res?.user?.role || 'SHIPPER';
      onAuthSuccess(resolvedRole);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSuccess = async (googleData: { email: string; fullName: string; credential?: string }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await googleAuthUser(
        googleData.email,
        googleData.fullName,
        'SHIPPER',
        'login'
      );
      setLoading(false);
      const role = res?.user?.role || 'SHIPPER';
      onAuthSuccess(role);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Google Authentication failed.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F0F6FB] p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center overflow-y-auto">
      {/* Main Floating Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5">
        {/* Card Title */}
        <div>
          <h2 className="text-2xl sm:text-[26px] font-black text-[#0F172A] tracking-tight">
            Log In to TradeFlow
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your corridor freight dashboard and active shipments.
          </p>
        </div>

        {/* Tab Switcher: Login active, Register link */}
        <div className="w-full p-1 bg-slate-100 rounded-full flex items-center border border-slate-200">
          <span className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#111C2D] text-white text-center shadow-md">
            Log In
          </span>
          <Link
            to="/register"
            className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-full text-slate-600 hover:text-slate-900 text-center transition-all"
          >
            Register
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
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. shipper@tradeflow.et"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-[#0284C7] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-[#111C2D] hover:bg-[#1E293B] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-200" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">Or Continue With</span>
          <div className="flex-1 h-[1px] bg-slate-200" />
        </div>

        {/* Google Authentication */}
        <GoogleAuthButton
          mode="login"
          selectedRole="SHIPPER"
          onSuccess={handleGoogleSuccess}
        />

        {/* Footer Link to Register */}
        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#0284C7] hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
};
