import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ShipperPortalPage } from './pages/ShipperPortalPage';
import { ForwarderPortalPage } from './pages/ForwarderPortalPage';
import { CustomsPortalPage } from './pages/CustomsPortalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/auth/callback" element={<Navigate to="/login" replace />} />

            {/* Shipper Portal */}
            <Route path="/shipper" element={<ShipperPortalPage />} />
            <Route path="/shipper/:tab" element={<ShipperPortalPage />} />

            {/* Freight Forwarder Portal */}
            <Route path="/forwarder" element={<ForwarderPortalPage />} />
            <Route path="/forwarder/:tab" element={<ForwarderPortalPage />} />

            {/* Customs Authority Portal */}
            <Route path="/customs" element={<CustomsPortalPage />} />
            <Route path="/customs/:tab" element={<CustomsPortalPage />} />

            {/* Administrator Console */}
            <Route path="/admin" element={<AdminPortalPage />} />
            <Route path="/admin/:tab" element={<AdminPortalPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
};
