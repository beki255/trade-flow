import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import {
  VerificationUser,
  DocumentPreviewData,
  AuditLogItem,
  AdminStats,
} from '../modules/admin/types';

// Modular Tabs
import { VerificationQueueTab } from '../modules/admin/tabs/VerificationQueueTab';
import { DisputesTab } from '../modules/admin/tabs/DisputesTab';
import { SystemHealthTab } from '../modules/admin/tabs/SystemHealthTab';
import { FraudDetectionTab } from '../modules/admin/tabs/FraudDetectionTab';
import { AuditLogsTab } from '../modules/admin/tabs/AuditLogsTab';

// Modular Modals
import { UserInspectionModal } from '../modules/admin/components/UserInspectionModal';
import { DocumentPreviewModal } from '../modules/admin/components/DocumentPreviewModal';

export const AdminPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'verifications';

  const handleTabChange = (newTab: string) => {
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

  useEffect(() => {
    fetchVerifications();
    fetchAuditLogs();

    const interval = setInterval(() => {
      fetchVerifications();
      fetchAuditLogs();
    }, 4000);

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
          notes: adminNotes || `Updated status to ${newStatus} on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (res.ok) {
        setActionSuccess(`User status successfully updated to ${newStatus}!`);
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
    const matchesRole = roleFilter === 'ALL' || item.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      item.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone?.includes(searchQuery) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
              setAdminNotes(u.verificationNotes || '');
            }}
            onUpdateStatus={handleUpdateStatus}
            pendingCount={pendingCount}
            verifiedCount={verifiedCount}
            suspendedCount={suspendedCount}
          />
        )}

        {/* 2. DISPUTE RESOLUTION */}
        {activeTab === 'disputes' && <DisputesTab />}

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
          onClose={() => setInspectUser(null)}
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
