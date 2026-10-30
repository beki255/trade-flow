import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from '../Logo';
import { LanguageDropdown } from '../LanguageDropdown';
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
  Route,
  Fuel,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  X,
  ExternalLink,
  Clock,
  TrendingUp,
  Globe,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { UserProfileSettingsModal } from '../profile/UserProfileSettingsModal';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

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
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
          { id: 'dashboard', label: t('dashboard.nav.dashboard'), icon: Layers },
          { id: 'post-load', label: t('dashboard.nav.postLoad'), icon: PlusCircle },
          { id: 'consignments', label: t('dashboard.nav.consignments'), icon: Package },
          { id: 'bids', label: t('dashboard.nav.bids'), icon: Gavel },
          { id: 'tracking', label: t('dashboard.nav.tracking'), icon: Navigation },
          { id: 'route-optimization', label: language === 'AM' ? 'የመስመር ማመቻቸት' : language === 'OM' ? 'Mijeessuu Daandii' : 'Route Optimization', icon: Route },
          { id: 'documents', label: t('dashboard.nav.documents'), icon: FileText },
          { id: 'payments', label: t('dashboard.nav.payments'), icon: CreditCard },
          { id: 'pricing-contracts', label: t('dashboard.nav.pricingContracts'), icon: TrendingUp },
          { id: 'fuel-analytics', label: language === 'AM' ? 'የነዳጅ ትንተና' : language === 'OM' ? 'Xiinxala Boba\'aa' : 'Fuel Analytics', icon: Fuel },
          { id: 'ratings', label: t('dashboard.nav.ratings'), icon: Star },
        ];
      case 'FORWARDER':
        return [
          { id: 'multi-shipper', label: t('dashboard.nav.multiShipper'), icon: Users },
          { id: 'consolidation', label: t('dashboard.nav.consolidation'), icon: Layers },
          { id: 'transporter-bidding', label: language === 'AM' ? 'የአጓጓዥ ጨረታ' : language === 'OM' ? 'Caalbaasii Geejjibaa' : 'Transporter Bidding', icon: Gavel },
          { id: 'customs-coord', label: t('dashboard.nav.customsCoord'), icon: FileCheck2 },
          { id: 'multimodal', label: t('dashboard.nav.multimodal'), icon: GitMerge },
        ];
      case 'CUSTOMS':
        return [
          { id: 'review-queue', label: t('dashboard.nav.reviewQueue'), icon: FileSpreadsheet },
          { id: 'compliance', label: t('dashboard.nav.compliance'), icon: ShieldCheck },
          { id: 'clearance', label: t('dashboard.nav.clearance'), icon: CheckCircle2 },
        ];
      case 'ADMIN':
        return [
          { id: 'verifications', label: t('dashboard.nav.verifications'), icon: ShieldCheck },
          { id: 'customs-oversight', label: t('dashboard.nav.customsOversight'), icon: FileCheck2 },
          { id: 'disputes', label: t('dashboard.nav.disputes'), icon: AlertTriangle },
          { id: 'system-health', label: t('dashboard.nav.systemHealth'), icon: Activity },
          { id: 'fraud', label: t('dashboard.nav.fraud'), icon: ShieldAlert },
          { id: 'audit-logs', label: t('dashboard.nav.auditLogs'), icon: History },
        ];
    }
  };

  const navItems = getNavItems();

  const getPortalInfo = () => {
    switch (portalRole) {
      case 'SHIPPER':
        return { title: t('dashboard.portals.shipperTitle'), badge: t('dashboard.portals.shipperBadge'), color: '#0284C7' };
      case 'FORWARDER':
        return { title: t('dashboard.portals.forwarderTitle'), badge: t('dashboard.portals.forwarderBadge'), color: '#8B5CF6' };
      case 'CUSTOMS':
        return { title: t('dashboard.portals.customsTitle'), badge: t('dashboard.portals.customsBadge'), color: '#059669' };
      case 'ADMIN':
        return { title: t('dashboard.portals.adminTitle'), badge: t('dashboard.portals.adminBadge'), color: '#DC2626' };
    }
  };

  const portalInfo = getPortalInfo();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 overflow-hidden relative">
      
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
              {portalRole !== 'ADMIN' && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : verificationStatus === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {verificationStatus}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-white truncate">
              {user?.companyName || user?.fullName || 'Active Session'}
            </span>
            {portalRole !== 'ADMIN' ? (
              <div className="text-[10px] text-slate-400 truncate">
                TIN: {user?.tin || '0098473621'}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || 'Platform Management & Control'}
              </div>
            )}
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

        {/* Bottom Sidebar Footer: Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
            title={t('dashboard.logout')}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>{t('dashboard.logout')}</span>}
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

            {/* Portal Badge - Clickable to open Profile & Settings */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowProfileModal(true);
              }}
              className="w-full text-left p-3 my-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#38BDF8]">
                  {portalInfo.badge}
                </span>
                {portalRole !== 'ADMIN' && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                    {verificationStatus}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white truncate mt-1 flex items-center justify-between">
                <span>{user?.fullName || 'Active User'}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>

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
                className="w-full py-2.5 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('dashboard.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-sm z-20 transition-colors">
          
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                <span className="truncate">{navItems.find((n) => n.id === activeTab)?.label || 'Portal'}</span>
              </h2>
            </div>
          </div>

          {/* Right: Language Switcher, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Elegant Language Dropdown */}
            <LanguageDropdown dark={isDark} />

            {/* Quick Theme Toggle (Sun / Moon) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center"
              title={isDark ? (language === 'AM' ? 'ወደ ብርሃን ገጽታ ቀይር' : language === 'OM' ? 'Gara Ifaatti Jijjiiri' : 'Switch to Light Mode') : (language === 'AM' ? 'ወደ ጨለማ ገጽታ ቀይር' : language === 'OM' ? 'Gara Dukkanaatti Jijjiiri' : 'Switch to Dark Mode')}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Real-Time Interactive Notification Center */}
            <NotificationDropdown
              role={portalRole}
              userId={user?.id}
              onSelectTab={onTabChange}
              isDark={isDark}
              language={language as any}
            />

            {/* User Avatar & Status - CLICKABLE TRIGGER */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2.5 sm:pl-3 sm:border-l sm:border-slate-200 dark:sm:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 p-1.5 rounded-xl transition cursor-pointer text-left group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Open Profile & Settings"
              aria-label="User Profile and Settings"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#111C2D] dark:bg-[#0284C7] text-white flex items-center justify-center text-xs font-black shadow-sm group-hover:ring-2 group-hover:ring-[#0284C7] transition">
                  {(user?.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#0284C7] dark:group-hover:text-[#38BDF8] transition flex items-center gap-1">
                  <span>{user?.fullName || 'User'}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {portalRole === 'ADMIN' ? 'Platform Administrator' : `${portalRole} • ${verificationStatus}`}
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7] dark:group-hover:text-[#38BDF8] transition hidden sm:block ml-0.5" />
            </button>

          </div>

        </header>

        {/* Dynamic Page Content Render */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors">
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

      {/* 4. USER PROFILE & SETTINGS MODAL */}
      <UserProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        portalRole={portalRole}
      />

    </div>
  );
};
