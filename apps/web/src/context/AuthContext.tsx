import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, VerificationStatus, DEMO_ACCOUNTS } from '@tradeflow/shared';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  token: string | null;
  loginAsRole: (roleKey: string) => void;
  loginUser: (identifier: string, password: string, role?: string) => Promise<any>;
  registerUser: (userData: any) => Promise<any>;
  googleAuthUser: (email: string, fullName: string, role: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tradeflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('tradeflow_token');
  });

  const saveAuthSession = (userObj: User, jwtToken: string) => {
    setCurrentUser(userObj);
    setToken(jwtToken);
    localStorage.setItem('tradeflow_user', JSON.stringify(userObj));
    localStorage.setItem('tradeflow_token', jwtToken);
  };

  // Check if credentials match a standard Demo Account
  const checkDemoAccount = (identifier: string, password: string) => {
    const id = (identifier || '').toLowerCase().trim();
    if (id === DEMO_ACCOUNTS.SHIPPER.email.toLowerCase()) {
      if (password === DEMO_ACCOUNTS.SHIPPER.password) return { role: 'SHIPPER', demo: DEMO_ACCOUNTS.SHIPPER };
      throw new Error('Incorrect password for Shipper demo account.');
    }
    if (id === DEMO_ACCOUNTS.FORWARDER.email.toLowerCase()) {
      if (password === DEMO_ACCOUNTS.FORWARDER.password) return { role: 'FORWARDER', demo: DEMO_ACCOUNTS.FORWARDER };
      throw new Error('Incorrect password for Forwarder demo account.');
    }
    if (id === DEMO_ACCOUNTS.CUSTOMS.email.toLowerCase()) {
      if (password === DEMO_ACCOUNTS.CUSTOMS.password) return { role: 'CUSTOMS', demo: DEMO_ACCOUNTS.CUSTOMS };
      throw new Error('Incorrect password for Customs demo account.');
    }
    if (id === DEMO_ACCOUNTS.ADMIN.email.toLowerCase()) {
      if (password === DEMO_ACCOUNTS.ADMIN.password) return { role: 'ADMIN', demo: DEMO_ACCOUNTS.ADMIN };
      throw new Error('Incorrect password for Administrator account.');
    }
    if (id === DEMO_ACCOUNTS.TRANSPORTER.email.toLowerCase()) {
      if (password === DEMO_ACCOUNTS.TRANSPORTER.password) return { role: 'TRANSPORTER', demo: DEMO_ACCOUNTS.TRANSPORTER };
      throw new Error('Incorrect password for Transporter demo account.');
    }
    if (id === DEMO_ACCOUNTS.DRIVER.email.toLowerCase()) {
      if (password === DEMO_ACCOUNTS.DRIVER.password) return { role: 'DRIVER', demo: DEMO_ACCOUNTS.DRIVER };
      throw new Error('Incorrect password for Driver demo account.');
    }
    return null;
  };

  // Real Database & Demo Login
  const loginUser = async (identifier: string, password: string, role?: string) => {
    // 1. Check Demo Accounts first
    const demoMatch = checkDemoAccount(identifier, password);
    if (demoMatch) {
      loginAsRole(demoMatch.role);
      return { user: { email: identifier, role: demoMatch.role } };
    }

    // 2. Query Database API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password, role }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data?.user) {
        saveAuthSession(data.user, data.token);
        return data;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      throw new Error('User not found. Please check your credentials or register.');
    } catch (err: any) {
      throw new Error(err.message || 'User not found. Please check your credentials or register.');
    }
  };

  // Real Database Registration with Custom User Identity
  const registerUser = async (userData: any) => {
    const rawRole = (userData.role || 'SHIPPER').toUpperCase();
    let mappedRole: UserRole = UserRole.SHIPPER;
    if (rawRole.includes('FORWARDER') || rawRole === 'FREIGHT_FORWARDER') mappedRole = UserRole.FREIGHT_FORWARDER;
    else if (rawRole.includes('CUSTOMS') || rawRole === 'CUSTOMS_OFFICER') mappedRole = UserRole.CUSTOMS_OFFICER;
    else if (rawRole.includes('TRANSPORTER')) mappedRole = UserRole.TRANSPORTER;
    else if (rawRole.includes('ADMIN')) mappedRole = UserRole.ADMIN;
    else if (rawRole.includes('DRIVER')) mappedRole = UserRole.DRIVER;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data?.user) {
        saveAuthSession(data.user, data.token);
        return data;
      }

      if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
    }

    // Fallback: Create actual registered user profile with the exact inputted data (NOT demo names!)
    const registeredUserObj: User = {
      id: `user-reg-${Date.now()}`,
      email: userData.email,
      username: userData.email.split('@')[0],
      fullName: userData.fullName,
      companyName: userData.companyName || userData.fullName,
      phone: userData.phone || '+251911000000',
      tin: userData.tin || null,
      tradeLicenseNo: userData.tradeLicenseNo || null,
      role: mappedRole,
      verificationStatus: VerificationStatus.PENDING,
      ratingAvg: 5.0,
      totalRatingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveAuthSession(registeredUserObj, 'jwt-reg-token');
    return { user: registeredUserObj };
  };

  // Google OAuth
  const googleAuthUser = async (email: string, fullName: string, role: string) => {
    const rawRole = (role || 'SHIPPER').toUpperCase();
    let mappedRole: UserRole = UserRole.SHIPPER;
    if (rawRole.includes('FORWARDER') || rawRole === 'FREIGHT_FORWARDER') mappedRole = UserRole.FREIGHT_FORWARDER;
    else if (rawRole.includes('CUSTOMS') || rawRole === 'CUSTOMS_OFFICER') mappedRole = UserRole.CUSTOMS_OFFICER;
    else if (rawRole.includes('TRANSPORTER')) mappedRole = UserRole.TRANSPORTER;
    else if (rawRole.includes('ADMIN')) mappedRole = UserRole.ADMIN;
    else if (rawRole.includes('DRIVER')) mappedRole = UserRole.DRIVER;

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, role }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok && data?.user) {
        saveAuthSession(data.user, data.token);
        return data;
      }
    } catch (err) {}

    const googleUserObj: User = {
      id: `user-google-${Date.now()}`,
      email: email,
      username: email.split('@')[0],
      fullName: fullName,
      companyName: fullName,
      phone: '+251911000000',
      tin: null,
      tradeLicenseNo: null,
      role: mappedRole,
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 5.0,
      totalRatingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveAuthSession(googleUserObj, 'jwt-google-token');
    return { user: googleUserObj };
  };

  const loginAsRole = (roleKey: string) => {
    const key = (roleKey || '').toUpperCase();
    let demo = DEMO_ACCOUNTS.SHIPPER;
    let role = UserRole.SHIPPER;

    if (key.includes('TRANSPORTER')) {
      demo = DEMO_ACCOUNTS.TRANSPORTER;
      role = UserRole.TRANSPORTER;
    } else if (key.includes('FORWARDER') || key === 'FREIGHT_FORWARDER') {
      demo = DEMO_ACCOUNTS.FORWARDER;
      role = UserRole.FREIGHT_FORWARDER;
    } else if (key.includes('CUSTOMS') || key === 'CUSTOMS_OFFICER') {
      demo = DEMO_ACCOUNTS.CUSTOMS;
      role = UserRole.CUSTOMS_OFFICER;
    } else if (key.includes('ADMIN')) {
      demo = DEMO_ACCOUNTS.ADMIN;
      role = UserRole.ADMIN;
    } else if (key.includes('DRIVER')) {
      demo = DEMO_ACCOUNTS.DRIVER;
      role = UserRole.DRIVER;
    } else {
      demo = DEMO_ACCOUNTS.SHIPPER;
      role = UserRole.SHIPPER;
    }

    const userObj: User = {
      id: `user-${key.toLowerCase()}-001`,
      email: demo.email,
      username: demo.username,
      fullName: demo.fullName,
      phone: '+251911223344',
      role: role,
      companyName: demo.fullName,
      tin: demo.tin,
      tradeLicenseNo: demo.tradeLicenseNo,
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.9,
      totalRatingsCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveAuthSession(userObj, 'mock-jwt-token');
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('tradeflow_user');
    localStorage.removeItem('tradeflow_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        token,
        loginAsRole,
        loginUser,
        registerUser,
        googleAuthUser,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
