import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  Package,
  Building2,
  FileCheck,
  Eye,
  EyeOff,
  Zap,
  Shield,
} from 'lucide-react';

interface AuthCardRightPanelProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (role: string) => void;
}

export const AuthCardRightPanel: React.FC<AuthCardRightPanelProps> = ({
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const { loginUser, registerUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<string>('SHIPPER');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tradeflow_remember_me');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Form states
  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('tradeflow_remembered_identifier') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [physicalAddress, setPhysicalAddress] = useState<string>('');
  const [tin, setTin] = useState<string>('');
  const [licenseNo, setLicenseNo] = useState<string>('');
  const [tradeLicenseDocName, setTradeLicenseDocName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const handlePickTradeLicense = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        setTradeLicenseDocName(file.name);
        setErrorMsg('');
      }
    };
    input.click();
  };

  // 3 Dedicated Web Public Roles (Used only during Registration)
  const webRoles = [
    {
      key: 'SHIPPER',
      label: 'Shipper',
      sub: 'Cargo Owner',
      icon: Package,
    },
    {
      key: 'FORWARDER',
      label: 'Freight Forwarder',
      sub: 'Logistics Partner',
      icon: Building2,
    },
    {
      key: 'CUSTOMS',
      label: 'Customs Authority',
      sub: 'Inspector / Officer',
      icon: FileCheck,
    },
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'register') {
        const payload = {
          fullName: fullName || email.split('@')[0],
          companyName: companyName || fullName,
          email,
          phone: phone || '+251911000000',
          physicalAddress: physicalAddress || 'Addis Ababa, Ethiopia',
          tin: tin || undefined,
          tradeLicenseNo: licenseNo || undefined,
          tradeLicenseDoc: tradeLicenseDocName || undefined,
          role: selectedRole,
          password,
        };
        const res = await registerUser(payload);
        setLoading(false);
        onAuthSuccess(res?.user?.role || selectedRole);
      } else {
        const res = await loginUser(email, password);
        try {
          if (rememberMe) {
            localStorage.setItem('tradeflow_remembered_identifier', email.trim());
            localStorage.setItem('tradeflow_remember_me', 'true');
          } else {
            localStorage.removeItem('tradeflow_remembered_identifier');
            localStorage.setItem('tradeflow_remember_me', 'false');
          }
        } catch (e) {}
        setLoading(false);
        const resolvedRole = res?.user?.role || 'SHIPPER';
        onAuthSuccess(resolvedRole);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F0F6FB] p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center overflow-y-auto">
      
      {/* Main Floating Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5">
        
        {/* Card Title */}
        <h2 className="text-2xl sm:text-[26px] font-black text-[#0F172A] tracking-tight text-center sm:text-left">
          {mode === 'login' ? 'Log In to TradeFlow' : 'Create TradeFlow Account'}
        </h2>

        {/* Dual Tab Toggle: Log In / Register Pill */}
        <div className="w-full p-1 bg-slate-100 rounded-full flex items-center border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 ${
              mode === 'login'
                ? 'bg-[#111C2D] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 ${
              mode === 'register'
                ? 'bg-[#111C2D] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* ONLY ON REGISTER: Show Role Selection */}
        {mode === 'register' && (
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-2">
              Select Account Type:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {webRoles.map((r) => {
                const IconComp = r.icon;
                const isSelected = selectedRole === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRole(r.key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#0284C7] bg-[#E0F2FE] shadow-sm text-[#0284C7]'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <IconComp className={`w-6 h-6 mb-1.5 ${isSelected ? 'text-[#0284C7]' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-bold leading-tight">
                      {r.label}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">
                      {r.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notifications */}
        {errorMsg ? (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        ) : null}

        {notice ? (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{notice}</span>
          </div>
        ) : null}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          
          {/* Registration specific fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dawit Tadesse"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Ethio Coffee Exporters PLC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    TIN (Tax ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tin}
                    onChange={(e) => setTin(e.target.value)}
                    placeholder="0098473621"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trade License No *
                  </label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="ETH-MOTI-2026-99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Office Address *
                </label>
                <input
                  type="text"
                  required
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  placeholder="e.g. Bole Sub-City, Woreda 03, Addis Ababa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                />
              </div>

              {/* Trade License Document Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trade License / Certificate of Incorporation
                </label>
                <div
                  onClick={handlePickTradeLicense}
                  className={`cursor-pointer p-3 rounded-xl border border-dashed flex items-center justify-between transition-all ${
                    tradeLicenseDocName
                      ? 'border-emerald-400 bg-emerald-50/60'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tradeLicenseDocName ? '✅' : '📄'}</span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">
                        {tradeLicenseDocName || 'Attach Trade License (PDF/Image)'}
                      </div>
                      <div className="text-[9.5px] text-slate-400">
                        {tradeLicenseDocName ? 'File selected for verification' : 'Tap to browse files'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-1 rounded-lg">
                    {tradeLicenseDocName ? 'Replace' : 'Upload'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
                />
              </div>
            </>
          )}

          {/* Email / Phone Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password Row */}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#0284C7] focus:ring-[#0284C7] w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#0284C7] hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D70B8] hover:bg-[#155e9c] active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <span>Log In</span>
            ) : (
              <span>Register Account</span>
            )}
          </button>



          {/* Switch Mode Prompt */}
          <div className="text-center text-xs text-slate-500 pt-0.5">
            {mode === 'login' ? (
              <span>
                New to TradeFlow?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="text-[#0284C7] font-bold hover:underline"
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-[#0284C7] font-bold hover:underline"
                >
                  Log In
                </button>
              </span>
            )}
          </div>

        </form>

      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultEmail={email}
      />
    </div>
  );
};
