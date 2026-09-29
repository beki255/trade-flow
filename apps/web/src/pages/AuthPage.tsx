import React from 'react';
import { CorridorMapLeftPanel } from '../components/auth/CorridorMapLeftPanel';
import { AuthCardRightPanel } from '../components/auth/AuthCardRightPanel';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();

  const handleAuthSuccess = (rawRole: string) => {
    const role = (rawRole || '').toUpperCase();

    // Map Prisma enum / standard roles to exact portal routes
    if (role === 'ADMIN' || role.includes('ADMIN')) {
      navigate('/admin');
    } else if (role === 'CUSTOMS' || role === 'CUSTOMS_OFFICER' || role.includes('CUSTOMS')) {
      navigate('/customs');
    } else if (role === 'FORWARDER' || role === 'FREIGHT_FORWARDER' || role.includes('FORWARDER')) {
      navigate('/forwarder');
    } else if (role === 'TRANSPORTER' || role.includes('TRANSPORTER') || role === 'DRIVER' || role.includes('DRIVER')) {
      alert('Transporters and Drivers operate exclusively on the TradeFlow Mobile App (Android / iOS). Please log in via the mobile application.');
      navigate('/');
    } else {
      navigate('/shipper');
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#090E17]">
      {/* Left 50% Panel: Night Corridor Map & Telematics HUD */}
      <div className="hidden lg:block lg:col-span-6 h-screen sticky top-0">
        <CorridorMapLeftPanel />
      </div>

      {/* Right 50% Panel: Clean Floating Auth Card with Google & Demo Login */}
      <div className="col-span-12 lg:col-span-6 min-h-screen flex items-center justify-center">
        <AuthCardRightPanel
          initialMode={initialMode}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};
