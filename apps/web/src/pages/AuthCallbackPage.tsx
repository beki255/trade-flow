import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, Loader2, UserPlus, ArrowLeft } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorDetails, setErrorDetails] = useState('');
  const [attemptedEmail, setAttemptedEmail] = useState('');
  const [attemptedName, setAttemptedName] = useState('');
  const [attemptedRole, setAttemptedRole] = useState('SHIPPER');

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        // Parse parameters from hash (#access_token=...&id_token=...) or search params (?code=...)
        const hash = location.hash ? location.hash.substring(1) : '';
        const search = location.search ? location.search.substring(1) : '';
        
        const params = new URLSearchParams(hash || search);
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const stateParam = params.get('state');

        let targetRole = 'SHIPPER';
        let authMode: 'login' | 'register' = 'login';
        if (stateParam) {
          try {
            const parsedState = JSON.parse(decodeURIComponent(stateParam));
            if (parsedState.role) targetRole = parsedState.role;
            if (parsedState.mode) authMode = parsedState.mode;
          } catch (e) {
            targetRole = stateParam;
          }
        }
        setAttemptedRole(targetRole);

        let userEmail = '';
        let userName = '';

        if (accessToken) {
          // Fetch Google User Profile via Google API
          const googleUserRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (googleUserRes.ok) {
            const googleProfile = await googleUserRes.json();
            userEmail = googleProfile.email;
            userName = googleProfile.name || googleProfile.given_name || userEmail.split('@')[0];
          }
        } else if (idToken) {
          // Parse JWT ID Token
          try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userEmail = decoded.email;
            userName = decoded.name || userEmail.split('@')[0];
          } catch (e) {
            console.warn('Could not decode idToken payload');
          }
        }

        if (!userEmail) {
          const storedEmail = sessionStorage.getItem('pending_google_email');
          const storedName = sessionStorage.getItem('pending_google_name');
          if (storedEmail) {
            userEmail = storedEmail;
            userName = storedName || userEmail.split('@')[0];
          }
        }

        if (!userEmail) {
          throw new Error('No Google authentication token or email received from Google.');
        }

        setAttemptedEmail(userEmail);
        setAttemptedName(userName);

        // Authenticate with TradeFlow Backend with strict login vs register mode
        const data = await loginWithGoogle({
          email: userEmail,
          fullName: userName,
          role: targetRole,
          mode: authMode,
          credential: idToken || undefined,
        });

        const loggedInUser = data?.user;
        setStatus('success');

        // Route to the appropriate portal
        const role = (loggedInUser?.role || targetRole || '').toUpperCase();
        setTimeout(() => {
          if (role === 'ADMIN' || role.includes('ADMIN')) {
            navigate('/admin');
          } else if (role === 'CUSTOMS' || role === 'CUSTOMS_OFFICER' || role.includes('CUSTOMS')) {
            navigate('/customs');
          } else if (role === 'FORWARDER' || role === 'FREIGHT_FORWARDER' || role.includes('FORWARDER')) {
            navigate('/forwarder');
          } else if (role === 'TRANSPORTER' || role.includes('TRANSPORTER')) {
            navigate('/transporter');
          } else {
            navigate('/shipper');
          }
        }, 500);

      } catch (err: any) {
        console.error('Google Callback Error:', err);
        setStatus('error');
        setErrorDetails(err.message || 'Failed to complete Google Sign-In');
      }
    };

    processGoogleCallback();
  }, [location, navigate, loginWithGoogle]);

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090E17] text-white p-4">
      <div className="w-full max-w-md bg-[#131E31] border border-slate-700/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Verifying Google Account...</h2>
              <p className="text-xs text-slate-400">Checking your account in the TradeFlow Corridor database.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-emerald-400 tracking-tight">Google Authentication Successful!</h2>
              <p className="text-xs text-slate-400">Redirecting to your TradeFlow portal...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-rose-400 tracking-tight">Account Not Registered</h2>
              <p className="text-xs text-slate-300 font-medium">
                {errorDetails.includes('No account found')
                  ? `No registered TradeFlow account found for this Google email (${attemptedEmail}). Please create an account first.`
                  : errorDetails}
              </p>
              <p className="text-[11px] text-slate-400">
                You must create a TradeFlow account first with your chosen role (Shipper, Forwarder, Customs, etc.).
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleGoToRegister}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register with this Google Account</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
