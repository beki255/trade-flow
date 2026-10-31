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
  Check,
  Mail,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import {
  validateEthiopianPhone,
  validatePassword,
  validatePasswordMatch,
  getPasswordStrength,
  validateEthiopianTin,
  validateEthiopianTradeLicense,
} from '../../../utils/validation';

interface RegisterFormProps {
  onAuthSuccess: (role: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onAuthSuccess }) => {
  const { registerUser, sendRegistrationOtp, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<string>('SHIPPER');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Email OTP Step State
  const [otpCode, setOtpCode] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

    // Strict Ethiopian Phone Validation
    const phoneRes = validateEthiopianPhone(phone);
    if (!phoneRes.isValid) {
      setErrorMsg(phoneRes.error || 'Please enter a valid Ethiopian phone number (+251 9... / 09... or +251 7... / 07...).');
      return;
    }

    // Strict Password Validation (8+ chars, letter + number)
    const passRes = validatePassword(password);
    if (!passRes.isValid) {
      setErrorMsg(passRes.error || 'Password must be at least 8 characters and contain at least one letter and one number.');
      return;
    }

    // Password Confirmation Match Validation
    const matchRes = validatePasswordMatch(password, confirmPassword);
    if (!matchRes.isValid) {
      setErrorMsg(matchRes.error || 'Passwords do not match. Please confirm your password.');
      return;
    }

    // Ethiopian TIN Number Validation (10 digits)
    const isBusinessRole = selectedRole === 'SHIPPER' || selectedRole === 'TRANSPORTER' || selectedRole === 'FORWARDER';
    const tinRes = validateEthiopianTin(tin, isBusinessRole);
    if (!tinRes.isValid) {
      setErrorMsg(tinRes.error || 'Please enter a valid 10-digit Ethiopian TIN number.');
      return;
    }

    // Ethiopian Trade License / Registration Number Validation (6-30 alphanumeric + / -)
    const licenseRes = validateEthiopianTradeLicense(licenseNo, isBusinessRole, selectedRole === 'FORWARDER');
    if (!licenseRes.isValid) {
      setErrorMsg(licenseRes.error || 'Please enter a valid Trade License / Registration Number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        fullName: fullName || email.split('@')[0],
        companyName: companyName || fullName,
        email: email.trim().toLowerCase(),
        phone: phoneRes.normalized || phone.trim(),
        physicalAddress: physicalAddress || 'Addis Ababa, Ethiopia',
        tin: tinRes.normalized || undefined,
        tradeLicenseNo: licenseRes.normalized || undefined,
        tradeLicenseDoc: tradeLicenseDocData
          ? JSON.stringify({ name: tradeLicenseDocName, data: tradeLicenseDocData })
          : (tradeLicenseDocName || undefined),
        role: selectedRole,
        password,
      };

      const res = await sendRegistrationOtp(payload);
      setLoading(false);
      setMaskedEmail(res?.maskedEmail || email);
      if (res?.previewOtp) {
        setPreviewOtp(res.previewOtp);
        setOtpCode(res.previewOtp);
      }
      setStep(2);
      startCooldown();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyRegistrationOtp(email, otpCode.trim());
      setLoading(false);
      onAuthSuccess(res?.user?.role || selectedRole);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid or expired verification code. Please check and retry.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setErrorMsg('');
    try {
      const res = await resendRegistrationOtp(email);
      setResendLoading(false);
      if (res?.previewOtp) {
        setPreviewOtp(res.previewOtp);
        setOtpCode(res.previewOtp);
      }
      startCooldown();
    } catch (err: any) {
      setResendLoading(false);
      setErrorMsg(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#F0F6FB] p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center overflow-y-auto">
      {step === 2 ? (
        /* Step 2: Email OTP Verification Card */
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-5 my-8">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setErrorMsg('');
            }}
            className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Edit Details
          </button>

          {/* Header with Mail Icon */}
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284C7] shadow-inner mb-3">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Verify Your Email
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
              We sent a 6-digit confirmation code to{' '}
              <span className="font-semibold text-slate-800">{maskedEmail || email}</span>. Enter the code below to complete your registration.
            </p>
          </div>

          {/* Quick verification helper when cloud email is queued */}
          {previewOtp && (
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-2xs">
              <span>Verification Code:</span>
              <span className="font-mono font-bold tracking-widest text-[#0284C7] text-sm">{previewOtp}</span>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 text-center mb-2">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] font-mono text-3xl font-black py-3.5 px-4 rounded-2xl border-2 border-slate-200 focus:border-[#0284C7] focus:bg-sky-50/20 outline-none transition-all text-slate-900"
              />
            </div>

            {/* Resend Cooldown */}
            <div className="flex items-center justify-center text-xs">
              {resendCooldown > 0 ? (
                <span className="text-slate-400 font-medium">
                  Resend code in <strong className="text-slate-700 font-bold">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-1.5 text-[#0284C7] font-bold hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  Resend Verification Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.trim().length !== 6}
              className="w-full py-3.5 bg-[#111C2D] hover:bg-[#1E293B] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying & Setting Up...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verify & Complete Registration</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Entered the wrong email?{' '}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMsg('');
              }}
              className="font-bold text-[#0284C7] hover:underline"
            >
              Change Email
            </button>
          </div>
        </div>
      ) : (
        /* Main Floating Registration Card */
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Business Phone *
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  🇪🇹 +251 (ET)
                </span>
              </div>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Create Password *
              </label>
              {password ? (
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: getPasswordStrength(password).color }}
                >
                  {getPasswordStrength(password).label}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">8+ chars, letter & number</span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters (letters + numbers)"
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
            {/* Strength meter bars */}
            {password ? (
              <div className="flex gap-1 mt-1.5 px-0.5">
                {[1, 2, 3, 4].map((seg) => {
                  const strength = getPasswordStrength(password);
                  const isFilled = strength.score >= seg;
                  return (
                    <div
                      key={seg}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isFilled ? strength.color : '#E2E8F0',
                      }}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password to verify"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0284C7] outline-none text-xs font-medium text-slate-900 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword === password && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Passwords match</span>
              </div>
            )}
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
    )}
  </div>
);
};
