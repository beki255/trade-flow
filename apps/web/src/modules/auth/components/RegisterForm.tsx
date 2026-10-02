import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Package,
  Building2,
  FileCheck,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';

interface RegisterFormProps {
  onAuthSuccess: (role: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onAuthSuccess }) => {
  const { registerUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<string>('SHIPPER');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [physicalAddress, setPhysicalAddress] = useState<string>('');
  const [tin, setTin] = useState<string>('');
  const [licenseNo, setLicenseNo] = useState<string>('');
  const [tradeLicenseDocName, setTradeLicenseDocName] = useState<string>('');
  const [tradeLicenseDocData, setTradeLicenseDocData] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const pickDocument = (
    onSuccess: (name: string, dataUrl: string) => void
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          setErrorMsg('Selected file is too large (maximum 15MB)');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          onSuccess(file.name, reader.result as string);
          setErrorMsg('');
        };
        reader.onerror = () => {
          setErrorMsg('Could not read file. Please try again.');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePickTradeLicense = () => {
    pickDocument((name, data) => {
      setTradeLicenseDocName(name);
      setTradeLicenseDocData(data);
    });
  };

  // Dedicated Web Commercial Roles (Shipper & Freight Forwarder)
  // Note: Transporters & Drivers operate exclusively on the TradeFlow Mobile App
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
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !companyName) {
      setErrorMsg('Please fill all required business identity fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        fullName: fullName || email.split('@')[0],
        companyName: companyName || fullName,
        email,
        phone: phone || '+251911000000',
        physicalAddress: physicalAddress || 'Addis Ababa, Ethiopia',
        tin: tin || undefined,
        tradeLicenseNo: licenseNo || undefined,
        tradeLicenseDoc: tradeLicenseDocData
          ? JSON.stringify({ name: tradeLicenseDocName, data: tradeLicenseDocData })
          : (tradeLicenseDocName || undefined),
        role: selectedRole,
        password,
      };
      const res = await registerUser(payload);
      setLoading(false);
      onAuthSuccess(res?.user?.role || selectedRole);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F0F6FB] p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center overflow-y-auto">
      {/* Main Floating Registration Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5 my-8">
        {/* Card Title */}
        <div>
          <h2 className="text-2xl sm:text-[26px] font-black text-[#0F172A] tracking-tight">
            Create TradeFlow Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Register your enterprise organization for corridor trade.
          </p>
        </div>

        {/* Tab Switcher: Login link, Register active */}
        <div className="w-full p-1 bg-slate-100 rounded-full flex items-center border border-slate-200">
          <Link
            to="/login"
            className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-full text-slate-600 hover:text-slate-900 text-center transition-all"
          >
            Log In
          </Link>
          <span className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#111C2D] text-white text-center shadow-md">
            Register
          </span>
        </div>

        {/* Role Selection */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 mb-2">
            Select Account Role:
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {webRoles.map((r) => {
              const IconComp = r.icon;
              const isSelected = selectedRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setSelectedRole(r.key)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#0284C7] bg-[#E0F2FE] shadow-sm text-[#0284C7]'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <IconComp className={`w-6 h-6 mb-1.5 ${isSelected ? 'text-[#0284C7]' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold leading-tight">
                    {r.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {r.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        {errorMsg ? (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        ) : null}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Legal Representative Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Full Name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Company / Enterprise Legal Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Enterprise or Company Legal Name"
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
                {selectedRole === 'FORWARDER'
                  ? 'EMA Freight Forwarding License No *'
                  : 'Trade License / Reg No *'}
              </label>
              <input
                type="text"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                placeholder={selectedRole === 'FORWARDER' ? 'EMA-FF-2026-08' : 'ETH-MOTI-2026-99'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Trade License File Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Upload Trade License / Registration Certificate
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePickTradeLicense}
                className="flex-1 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#0284C7] bg-slate-50 text-xs font-semibold text-slate-600 hover:text-[#0284C7] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-[#0284C7]" />
                <span className="truncate max-w-[200px]">
                  {tradeLicenseDocName || 'Attach PDF or Scanned Copy'}
                </span>
              </button>
              {tradeLicenseDocName && (
                <button
                  type="button"
                  onClick={() => {
                    setTradeLicenseDocName('');
                    setTradeLicenseDocData('');
                  }}
                  className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Office City / Base *
              </label>
              <input
                type="text"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
                placeholder="Addis Ababa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. logistics@company.et"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Create Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#111C2D] hover:bg-[#1E293B] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Registering Organization...' : 'Create Account & Verify Identity'}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-[#0284C7] hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
