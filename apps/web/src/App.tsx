import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ShipperPortalPage } from './pages/ShipperPortalPage';
import { ForwarderPortalPage } from './pages/ForwarderPortalPage';
import { CustomsPortalPage } from './pages/CustomsPortalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="/register" element={<AuthPage initialMode="register" />} />
            <Route path="/auth" element={<AuthPage initialMode="login" />} />

            {/* Shipper Portal */}
            <Route path="/shipper" element={<ShipperPortalPage />} />

            {/* Freight Forwarder Portal */}
            <Route path="/forwarder" element={<ForwarderPortalPage />} />

            {/* Customs Authority Portal */}
            <Route path="/customs" element={<CustomsPortalPage />} />

            {/* Administrator Console */}
            <Route path="/admin" element={<AdminPortalPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};
