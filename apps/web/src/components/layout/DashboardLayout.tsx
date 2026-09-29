import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../Logo';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Gavel,
  Navigation,
  FileText,
  CreditCard,
  Star,
  Users,
  Layers,
  FileCheck2,
  GitMerge,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ShieldAlert,
  History,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
}

interface DashboardLayoutProps {
  portalRole: 'SHIPPER' | 'FORWARDER' | 'CUSTOMS' | 'ADMIN';
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const isRealAdminNote = (note?: string | null): boolean => {
  if (!note || !note.trim()) return false;
  const lower = note.toLowerCase();
  return (
    !lower.includes('transporter') &&
    !lower.includes('company') &&
    !lower.includes('officially') &&
    !lower.includes('provisioned') &&
    !lower.includes('commissioned') &&
    !lower.includes('updated status') &&
    !lower.includes('default') &&
    !lower.includes('dbu') &&
    !lower.includes('fleet') &&
    !lower.startsWith('drv_')
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  portalRole,
  activeTab,
  onTabChange,
  children,
}) => {
  const { user, logout, isVerifyingSession } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strict Authentication Guard: Redirect to /login if user is not authenticated or deleted from DB
  React.useEffect(() => {
    if (!isVerifyingSession && !user) {
      navigate('/login');
    }
  }, [isVerifyingSession, user, navigate]);

  // User Verification Status State (PENDING | VERIFIED | SUSPENDED)
  const verificationStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' = 
    portalRole === 'ADMIN' ? 'VERIFIED' : (user as any)?.verificationStatus || 'VERIFIED';

  // Navigation Menus structured strictly per SRS
  const getNavItems = (): NavItem[] => {
    switch (portalRole) {
      case 'SHIPPER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Layers },
          { id: 'post-load', label: 'Load Posting', icon: PlusCircle },
          { id: 'consignments', label: 'My Consignments', icon: Package },
          { id: 'bids', label: 'Bid Management', icon: Gavel },
          { id: 'tracking', label: 'Live Tracking Map', icon: Navigation },
          { id: 'documents', label: 'Customs Documents', icon: FileText },
          { id: 'payments', label: 'Payments & TeleBirr', icon: CreditCard },
          { id: 'pricing-contracts', label: 'Contract Rates & Pricing', icon: TrendingUp },
          { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
        ];
      case 'FORWARDER':
        return [
          { id: 'multi-shipper', label: 'Multi-Shipper Dashboard', icon: Users },
          { id: 'consolidation', label: 'Consolidated Loads', icon: Layers },
          { id: 'customs-coord', label: 'Customs Coordination', icon: FileCheck2 },
          { id: 'multimodal', label: 'Multi-Modal Tracking', icon: GitMerge },
        ];
      case 'CUSTOMS':
        return [
          { id: 'review-queue', label: 'Document Review Queue', icon: FileSpreadsheet },
          { id: 'compliance', label: 'Compliance Validation', icon: ShieldCheck },
          { id: 'clearance', label: 'Clearance Status', icon: CheckCircle2 },
        ];
      case 'ADMIN':
        return [
          { id: 'verifications', label: 'Verification Queue', icon: ShieldCheck },
          { id: 'customs-oversight', label: 'Customs & Border Oversight', icon: FileCheck2 },
          { id: 'disputes', label: 'Dispute Resolution', icon: AlertTriangle },
          { id: 'system-health', label: 'System Health', icon: Activity },
          { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert },
          { id: 'audit-logs', label: 'Audit Logs', icon: History },
        ];
    }
  };

  const navItems = getNavItems();

  const getPortalInfo = () => {
    switch (portalRole) {
      case 'SHIPPER':
        return { title: 'Shipper Portal', badge: 'Cargo Owner', color: '#0284C7' };
      case 'FORWARDER':
        return { title: 'Freight Forwarder Portal', badge: 'Logistics Partner', color: '#8B5CF6' };
      case 'CUSTOMS':
        return { title: 'Customs Authority Portal', badge: 'Official Inspector', color: '#059669' };
      case 'ADMIN':
        return { title: 'Administrator Console', badge: 'Super Admin', color: '#DC2626' };
    }
  };

  const portalInfo = getPortalInfo();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-800 overflow-hidden relative">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0F172A] border-r border-slate-800 transition-all duration-300 z-30 select-none ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/90">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-[#38BDF8]" size={28} />
            {sidebarOpen && (
              <span className="text-xl font-bold tracking-tight text-white">
                TradeFlow
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Current Portal & Role Indicator Card */}
        {sidebarOpen && (
          <div className="p-3 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#38BDF8]">
                {portalInfo.badge}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : verificationStatus === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {verificationStatus}
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate">
              {user?.companyName || user?.fullName || 'Active Session'}
            </span>
            <div className="text-[10px] text-slate-400 truncate">
              TIN: {user?.tin || '0098473621'}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1E293B] text-[#38BDF8] shadow-sm border border-slate-700/70'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title={item.label}
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                {sidebarOpen && (
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#0284C7] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Footer: Logout Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-bold transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY & SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#0F172A] h-full flex flex-col z-10 shadow-2xl p-4 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Logo className="w-7 h-7 text-[#38BDF8]" />
                <span className="font-extrabold text-lg">TradeFlow</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Portal Badge */}
            <div className="p-3 my-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#38BDF8]">
                  {portalInfo.badge}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                  {verificationStatus}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate mt-1">
                {user?.fullName || 'Active User'}
              </div>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#1E293B] text-[#38BDF8] border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Drawer Logout */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-sm z-20">
          
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="truncate max-w-[140px] sm:max-w-none">{navItems.find((n) => n.id === activeTab)?.label || 'Portal'}</span>
                <span className="hidden sm:inline-block shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {portalInfo.title}
                </span>
              </h2>
            </div>
          </div>

          {/* Right: Live Corridor Status, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Corridor Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Corridor: Active</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0284C7]" />
            </button>

            {/* User Avatar & Status */}
            <div className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#111C2D] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {(user?.fullName || 'U').charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.fullName || 'User'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {portalRole} • {verificationStatus}
                </div>
              </div>
            </div>

          </div>

        </header>

        {/* Dynamic Page Content Render */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* User Guidance Banner on Verification Status */}
            {portalRole !== 'ADMIN' && verificationStatus === 'PENDING' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs shadow-sm">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-extrabold block">
                    Verification Status: Pending Administrative Review
                  </span>
                  <p className="text-amber-800">
                    Your trade license and TIN documents are currently being validated by platform administrators in the Verification Queue. Full bidding and dispatch features will unlock upon approval.
                  </p>
                  {isRealAdminNote((user as any)?.verificationNotes) && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 font-medium flex items-start gap-2">
                      <span className="font-black text-amber-900 shrink-0">📝 Admin Note:</span>
                      <span>{(user as any).verificationNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {portalRole !== 'ADMIN' && verificationStatus === 'SUSPENDED' && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-extrabold block text-rose-950">
                    Account Suspended: Compliance Review Required
                  </span>
                  <p className="text-rose-800">
                    Your organization account has been temporarily restricted by corridor platform administration.
                  </p>
                  {isRealAdminNote((user as any)?.verificationNotes) && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-950 font-medium flex items-start gap-2">
                      <span className="font-black text-rose-900 shrink-0">📝 Administrator Reason:</span>
                      <span>{(user as any).verificationNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {children}
          </div>
        </main>

      </div>

    </div>
  );
};
