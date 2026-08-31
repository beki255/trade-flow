import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '@tradeflow/shared';
import { GoogleAuthButton } from './GoogleAuthButton';
import {
  Package,
  Building2,
  FileCheck,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

interface AuthCardRightPanelProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (role: string) => void;
}

export const AuthCardRightPanel: React.FC<AuthCardRightPanelProps> = ({
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const { loginUser, registerUser, googleAuthUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<string>('SHIPPER');
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>('SHIPPER');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Form states
  const [email, setEmail] = useState<string>('');
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

  // Demo Accounts Quick Select Handler
  const handleSelectDemo = (demoKey: 'SHIPPER' | 'FORWARDER' | 'CUSTOMS' | 'ADMIN') => {
    setSelectedDemoRole(demoKey);
    const demo = DEMO_ACCOUNTS[demoKey];
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMsg('');
    setNotice(`${demo.fullName} demo credentials filled!`);
    setTimeout(() => setNotice(''), 2500);
  };

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
        const res = await loginUser(email, password, selectedDemoRole);
        setLoading(false);
        const resolvedRole = res?.user?.role || selectedDemoRole;
        onAuthSuccess(resolvedRole);
      }
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
        selectedRole,
        mode
      );
      setLoading(false);
      const role = res?.user?.role || selectedRole;
      onAuthSuccess(role);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Google Authentication failed.');
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
                placeholder="••••••••"
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
              <a href="#forgot" className="text-[#0284C7] hover:underline font-semibold">
                Forgot Password?
              </a>
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

          {/* ON LOGIN: One-Click Demo Accounts */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 text-center">
                ⚡ Quick 1-Click Demo Accounts:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDemo('SHIPPER')}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    selectedDemoRole === 'SHIPPER' && email === DEMO_ACCOUNTS.SHIPPER.email
                      ? 'bg-blue-100 border-blue-500 text-blue-900 font-bold'
                      : 'bg-blue-50/80 hover:bg-blue-100 text-blue-900 border-blue-200/60'
                  }`}
                >
                  <div className="text-[11px] font-extrabold flex items-center gap-1">
                    <span>📦 Shipper</span>
                  </div>
                  <div className="text-[9px] text-blue-600 truncate">dawit@miaoda.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo('FORWARDER')}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    selectedDemoRole === 'FORWARDER' && email === DEMO_ACCOUNTS.FORWARDER.email
                      ? 'bg-purple-100 border-purple-500 text-purple-900 font-bold'
                      : 'bg-purple-50/80 hover:bg-purple-100 text-purple-900 border-purple-200/60'
                  }`}
                >
                  <div className="text-[11px] font-extrabold flex items-center gap-1">
                    <span>🏢 Forwarder</span>
                  </div>
                  <div className="text-[9px] text-purple-600 truncate">sara@miaoda.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo('CUSTOMS')}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    selectedDemoRole === 'CUSTOMS' && email === DEMO_ACCOUNTS.CUSTOMS.email
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold'
                      : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border-emerald-200/60'
                  }`}
                >
                  <div className="text-[11px] font-extrabold flex items-center gap-1">
                    <span>🛂 Customs</span>
                  </div>
                  <div className="text-[9px] text-emerald-600 truncate">kebede@miaoda.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo('ADMIN')}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    selectedDemoRole === 'ADMIN' && email === DEMO_ACCOUNTS.ADMIN.email
                      ? 'bg-rose-100 border-rose-500 text-rose-900 font-bold'
                      : 'bg-rose-50/80 hover:bg-rose-100 text-rose-900 border-rose-200/60'
                  }`}
                >
                  <div className="text-[11px] font-extrabold flex items-center gap-1">
                    <span>🛡️ Admin</span>
                  </div>
                  <div className="text-[9px] text-rose-600 truncate">admin@miaoda.com</div>
                </button>
              </div>
            </div>
          )}

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

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-bold">
              or
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Authentication */}
          <GoogleAuthButton mode={mode} selectedRole={selectedRole} onSuccess={handleGoogleSuccess} />

        </form>

      </div>

    </div>
  );
};
