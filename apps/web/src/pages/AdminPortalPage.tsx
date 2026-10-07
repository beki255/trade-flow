import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  VerificationUser,
  DocumentPreviewData,
  AuditLogItem,
  AdminStats,
  DisputeTicketItem,
  DisputeStats,
} from '../modules/admin/types';

import { ArrowLeft } from 'lucide-react';

// Modular Tabs
import { VerificationQueueTab } from '../modules/admin/tabs/VerificationQueueTab';
import { DisputesTab } from '../modules/admin/tabs/DisputesTab';
import { SystemHealthTab } from '../modules/admin/tabs/SystemHealthTab';
import { FraudDetectionTab } from '../modules/admin/tabs/FraudDetectionTab';
import { AuditLogsTab } from '../modules/admin/tabs/AuditLogsTab';
import { ReviewQueueTab } from '../modules/customs/tabs/ReviewQueueTab';
import { ComplianceTab } from '../modules/customs/tabs/ComplianceTab';
import { ClearanceTab } from '../modules/customs/tabs/ClearanceTab';
import { CustomsStats, CustomsDossierItem, ClearanceLedgerItem } from '../modules/customs/types';

// Modular Modals
import { UserInspectionModal } from '../modules/admin/components/UserInspectionModal';
import { DocumentPreviewModal } from '../modules/admin/components/DocumentPreviewModal';

export const AdminPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'verifications';

  const handleTabChange = (newTab: string) => {
    if (newTab !== 'customs-oversight') {
      setCustomsSubView('queue');
    }
    navigate(`/admin/${newTab}`);
  };
  const [verificationList, setVerificationList] = useState<VerificationUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Filtering & Search State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected User for Detailed Inspection Modal
  const [inspectUser, setInspectUser] = useState<VerificationUser | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');

  // Selected Document for Inspection Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);

  const [stats, setStats] = useState<AdminStats>({
    pendingVerifications: 0,
    verifiedUsers: 0,
    systemHealth: '100%',
    fraudAlerts: 0,
  });

  const [disputeTickets, setDisputeTickets] = useState<DisputeTicketItem[]>([]);
  const [disputeStats, setDisputeStats] = useState<DisputeStats>({
    totalDisputes: 0,
    openCases: 0,
    resolvedCases: 0,
    refundedCases: 0,
    totalFrozenAmountEtb: 0,
    mediationSuccessRatePct: 100,
    averageResolutionHours: 18,
  });
  const [disputesLoading, setDisputesLoading] = useState<boolean>(false);

  // Customs Oversight State
  const [customsDossiers, setCustomsDossiers] = useState<CustomsDossierItem[]>([]);
  const [customsLedger, setCustomsLedger] = useState<ClearanceLedgerItem[]>([]);
  const [selectedCustomsDossier, setSelectedCustomsDossier] = useState<CustomsDossierItem | null>(null);
  const [selectedCertShipmentId, setSelectedCertShipmentId] = useState<string | null>(null);
  const [customsSubView, setCustomsSubView] = useState<'queue' | 'compliance' | 'clearance'>('queue');
  const [customsStats, setCustomsStats] = useState<CustomsStats>({
    totalDossiers: 0,
    pendingReviews: 0,
    greenLineCleared: 0,
    revisionsRequested: 0,
    inspectionRate: '100%',
    averageProcessingMins: 14,
  });
  const [customsLoading, setCustomsLoading] = useState<boolean>(false);

  const fetchCustomsData = async () => {
    try {
      setCustomsLoading(true);
      const queueRes = await fetch('/api/customs/queue');
      if (queueRes.ok) {
        const queueData = await queueRes.json();
        if (queueData.dossiers) {
          setCustomsDossiers(queueData.dossiers);
          if (selectedCustomsDossier) {
            const updated = queueData.dossiers.find((d: any) => d.id === selectedCustomsDossier.id);
            if (updated) setSelectedCustomsDossier(updated);
          }
        }
        if (queueData.stats) setCustomsStats(queueData.stats);
      }
      const ledgerRes = await fetch('/api/customs/ledger');
      if (ledgerRes.ok) {
        const ledgerData = await ledgerRes.json();
        if (ledgerData.ledger) {
          setCustomsLedger(ledgerData.ledger);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch customs dossiers in admin:', err);
    } finally {
      setCustomsLoading(false);
    }
  };

  const handleUpdateCustomsClearance = async (
    shipmentId: string,
    clearanceStatus: 'CLEARED' | 'REVISION_REQUESTED' | 'REJECTED',
    officerNotes: string,
    clearingStation: string
  ) => {
    try {
      const res = await fetch(`/api/customs/shipments/${shipmentId}/clearance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearanceStatus,
          officerNotes: officerNotes || 'Admin Regulatory Oversight Clearance Action',
          clearingStation,
          officerId: user?.email ? `ADMIN (${user.email})` : 'ADMIN-SUPERVISOR',
        }),
      });
      if (res.ok) {
        await fetchCustomsData();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Failed to update clearance');
      }
    } catch (err) {
      console.error('Error updating customs clearance in admin:', err);
    }
  };

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/portal/verifications');
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setVerificationList(data.users);
          const pendingCount = data.users.filter((u: any) => u.verificationStatus === 'PENDING').length;
          const verifiedCount = data.users.filter((u: any) => u.verificationStatus === 'VERIFIED').length;
          setStats((prev) => ({
            ...prev,
            pendingVerifications: pendingCount,
            verifiedUsers: verifiedCount,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch verification list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/portal/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) {
          setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    }
  };

  const fetchDisputes = async () => {
    try {
      setDisputesLoading(true);
      const res = await fetch('/api/payments/disputes');
      if (res.ok) {
        const data = await res.json();
        if (data.tickets) {
          setDisputeTickets(data.tickets);
        }
        if (data.stats) {
          setDisputeStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch dispute tickets:', err);
    } finally {
      setDisputesLoading(false);
    }
  };

  const handleArbitrate = async (
    paymentId: string,
    verdict: 'REFUND_SHIPPER' | 'RELEASE_TRANSPORTER' | 'PARTIAL_SPLIT',
    refundAmountEtb: number,
    transporterPayoutEtb: number,
    adminResolutionNotes: string
  ) => {
    const res = await fetch(`/api/payments/disputes/${paymentId}/arbitrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verdict,
        refundAmountEtb,
        transporterPayoutEtb,
        adminResolutionNotes,
        mediatorAdminId: user?.email || 'ADMIN-SUPERVISOR-01',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to execute arbitration');
    }
    await fetchDisputes();
    await fetchAuditLogs();
  };

  const fetchHealthAndFraudStats = async () => {
    try {
      const [healthRes, fraudRes] = await Promise.all([
        fetch('/api/portal/system-health'),
        fetch('/api/portal/fraud-alerts'),
      ]);
      if (healthRes.ok && fraudRes.ok) {
        const healthData = await healthRes.json();
        const fraudData = await fraudRes.json();
        setStats((prev) => ({
          ...prev,
          systemHealth: `${healthData.overallUptimePct}%`,
          fraudAlerts: fraudData.stats?.criticalAlerts ?? fraudData.alerts?.length ?? 0,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch health and fraud stats:', e);
    }
  };

  useEffect(() => {
    fetchVerifications();
    fetchAuditLogs();
    fetchDisputes();
    fetchCustomsData();
    fetchHealthAndFraudStats();

    const interval = setInterval(() => {
      fetchVerifications();
      fetchAuditLogs();
      fetchDisputes();
      fetchCustomsData();
      fetchHealthAndFraudStats();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (
    userId: string,
    newStatus: 'VERIFIED' | 'SUSPENDED' | 'REJECTED'
  ) => {
    try {
      const res = await fetch('/api/portal/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: newStatus,
          adminId: user?.email || 'ADMIN-CORRIDOR-01',
          notes: (inspectUser?.id === userId && adminNotes.trim()) ? adminNotes.trim() : null,
        }),
      });

      if (res.ok) {
        setActionSuccess(`User status successfully updated to ${newStatus}!`);
        setAdminNotes('');
        fetchVerifications();
        fetchAuditLogs();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Filtered Users computation
  const filteredUsers = verificationList.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.verificationStatus === statusFilter;
    const matchesRole =
      roleFilter === 'ALL' ||
      item.role === roleFilter ||
      (roleFilter === 'CUSTOMS' && (item.role === 'CUSTOMS_OFFICER' || item.role === 'CUSTOMS')) ||
      (roleFilter === 'CUSTOMS_OFFICER' && (item.role === 'CUSTOMS_OFFICER' || item.role === 'CUSTOMS')) ||
      (roleFilter === 'FORWARDER' && (item.role === 'FREIGHT_FORWARDER' || item.role === 'FORWARDER')) ||
      (roleFilter === 'FREIGHT_FORWARDER' && (item.role === 'FREIGHT_FORWARDER' || item.role === 'FORWARDER'));
    const matchesSearch =
      !searchQuery ||
      item.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone?.includes(searchQuery) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driverProfile?.driverLicenseNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesRole && matchesSearch;
  });

  const pendingCount = verificationList.filter((u) => u.verificationStatus === 'PENDING').length;
  const verifiedCount = verificationList.filter((u) => u.verificationStatus === 'VERIFIED').length;
  const suspendedCount = verificationList.filter((u) => u.verificationStatus === 'SUSPENDED').length;

  return (
    <DashboardLayout
      portalRole="ADMIN"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* 1. VERIFICATION QUEUE */}
        {activeTab === 'verifications' && (
          <VerificationQueueTab
            stats={stats}
            actionSuccess={actionSuccess}
            filteredUsers={filteredUsers}
            totalUsersCount={verificationList.length}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
            onRefresh={fetchVerifications}
            onInspectUser={(u) => {
              setInspectUser(u);
              const note = (u.verificationNotes || '').trim();
              const lower = note.toLowerCase();
              const isDefaultOrSystem =
                !note ||
                lower.includes('transporter') ||
                lower.includes('company') ||
                lower.includes('officially') ||
                lower.includes('provisioned') ||
                lower.includes('commissioned') ||
                lower.includes('updated status') ||
                lower.includes('default') ||
                lower.includes('dbu') ||
                lower.includes('fleet') ||
                lower.startsWith('drv_');
              setAdminNotes(isDefaultOrSystem ? '' : note);
            }}
            onUpdateStatus={handleUpdateStatus}
            pendingCount={pendingCount}
            verifiedCount={verifiedCount}
            suspendedCount={suspendedCount}
          />
        )}

        {/* 1.1 CUSTOMS & BORDER OVERSIGHT */}
        {activeTab === 'customs-oversight' && (
          <div className="space-y-4">
            {customsSubView !== 'queue' && (
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setCustomsSubView('queue')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>
                    {language === 'AM'
                      ? 'ወደ ወረፋ ተመለስ'
                      : language === 'OM'
                      ? 'Gara Tarree Deebi\'i'
                      : 'Back to Queue'}
                  </span>
                </button>

                <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  {customsSubView === 'compliance'
                    ? language === 'AM'
                      ? 'የተገዢነት ክትትል'
                      : language === 'OM'
                      ? 'Hordoffii Qulqullinaa'
                      : 'Admin Compliance Inspection'
                    : language === 'AM'
                    ? 'የኤሌክትሮኒክስ ፍቃድ ሰነድ'
                    : language === 'OM'
                    ? 'Waraqaa Hayyamaa'
                    : 'Clearance Certificate'}
                </div>
              </div>
            )}

            {customsSubView === 'queue' && (
              <ReviewQueueTab
                stats={customsStats}
                dossiers={customsDossiers}
                loading={customsLoading}
                onRefresh={fetchCustomsData}
                onSelectDossierForCompliance={(dossier) => {
                  setSelectedCustomsDossier(dossier);
                  setCustomsSubView('compliance');
                }}
                onQuickApprove={async (shipmentId, station) => {
                  await handleUpdateCustomsClearance(
                    shipmentId,
                    'CLEARED',
                    'Super-Admin Expedited Green Line Clearance Approved',
                    station
                  );
                }}
                onViewCertificate={(shipmentId) => {
                  setSelectedCertShipmentId(shipmentId);
                  setCustomsSubView('clearance');
                }}
              />
            )}

            {customsSubView === 'compliance' && (
              <ComplianceTab
                dossiers={customsDossiers}
                selectedDossier={selectedCustomsDossier}
                onSelectDossier={(dossier) => setSelectedCustomsDossier(dossier)}
                onUpdateClearance={handleUpdateCustomsClearance}
                onViewCertificate={(shipmentId) => {
                  setSelectedCertShipmentId(shipmentId);
                  setCustomsSubView('clearance');
                }}
              />
            )}

            {customsSubView === 'clearance' && (
              <ClearanceTab
                ledger={customsLedger}
                loading={customsLoading}
                onRefresh={fetchCustomsData}
                selectedCertificateShipmentId={selectedCertShipmentId}
              />
            )}
          </div>
        )}

        {/* 2. DISPUTE RESOLUTION */}
        {activeTab === 'disputes' && (
          <DisputesTab
            tickets={disputeTickets}
            stats={disputeStats}
            loading={disputesLoading}
            onRefresh={fetchDisputes}
            onArbitrate={handleArbitrate}
          />
        )}

        {/* 3. SYSTEM HEALTH */}
        {activeTab === 'system-health' && <SystemHealthTab />}

        {/* 4. FRAUD DETECTION */}
        {activeTab === 'fraud' && <FraudDetectionTab />}

        {/* 5. AUDIT LOGS */}
        {activeTab === 'audit-logs' && (
          <AuditLogsTab
            auditLogs={auditLogs}
            onRefresh={fetchAuditLogs}
          />
        )}

        {/* USER DETAILS & COMPLIANCE MODAL */}
        <UserInspectionModal
          inspectUser={inspectUser}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          onClose={() => {
            setInspectUser(null);
            setAdminNotes('');
          }}
          onOpenDocPreview={(doc) => setPreviewDoc(doc)}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* DOCUMENT PREVIEW MODAL */}
        <DocumentPreviewModal
          previewDoc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      </div>
    </DashboardLayout>
  );
};
