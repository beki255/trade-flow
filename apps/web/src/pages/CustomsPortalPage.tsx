import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CustomsStats, CustomsDossierItem, ClearanceLedgerItem } from '../modules/customs/types';

// Modular Tabs
import { ReviewQueueTab } from '../modules/customs/tabs/ReviewQueueTab';
import { ComplianceTab } from '../modules/customs/tabs/ComplianceTab';
import { ClearanceTab } from '../modules/customs/tabs/ClearanceTab';

export const CustomsPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'review-queue';

  const handleTabChange = (newTab: string) => {
    navigate(`/customs/${newTab}`);
  };

  const [dossiers, setDossiers] = useState<CustomsDossierItem[]>([]);
  const [ledger, setLedger] = useState<ClearanceLedgerItem[]>([]);
  const [selectedDossier, setSelectedDossier] = useState<CustomsDossierItem | null>(null);
  const [selectedCertShipmentId, setSelectedCertShipmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [stats, setStats] = useState<CustomsStats>({
    totalDossiers: 0,
    pendingReviews: 0,
    greenLineCleared: 0,
    revisionsRequested: 0,
    inspectionRate: '100%',
    averageProcessingMins: 14,
  });

  // Fetch queue dossiers & metrics from backend
  const fetchCustomsData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Inspection Queue
      const queueRes = await fetch('/api/customs/queue');
      if (queueRes.ok) {
        const queueData = await queueRes.json();
        if (queueData.dossiers) {
          setDossiers(queueData.dossiers);
          // Keep selection synchronized if valid
          if (selectedDossier) {
            const updated = queueData.dossiers.find((d: any) => d.id === selectedDossier.id);
            if (updated) setSelectedDossier(updated);
          }
        }
        if (queueData.stats) {
          setStats(queueData.stats);
        }
      }

      // 2. Fetch Clearance Ledger
      const ledgerRes = await fetch('/api/customs/ledger');
      if (ledgerRes.ok) {
        const ledgerData = await ledgerRes.json();
        if (ledgerData.ledger) {
          setLedger(ledgerData.ledger);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch customs authority data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomsData();
    const interval = setInterval(fetchCustomsData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Officer Action: Approve, Request Revision, or Reject
  const handleUpdateClearance = async (
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
          officerNotes,
          clearingStation,
          officerId: user?.fullName ? `${user.fullName} (${user.id?.slice(-4) || 'ECC'})` : user?.id || 'ECC Customs Inspector',
        }),
      });

      if (res.ok) {
        await fetchCustomsData();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Failed to update clearance');
      }
    } catch (err) {
      console.error('Error updating clearance:', err);
    }
  };

  const handleQuickApprove = async (shipmentId: string, station: string) => {
    await handleUpdateClearance(
      shipmentId,
      'CLEARED',
      'Instant Green Line Digital Seal Verified at Border Checkpoint.',
      station
    );
  };

  const handleSelectDossierForCompliance = (dossier: CustomsDossierItem) => {
    setSelectedDossier(dossier);
    navigate('/customs/compliance');
  };

  const handleViewCertificate = (shipmentId: string) => {
    setSelectedCertShipmentId(shipmentId);
    navigate('/customs/clearance');
  };

  return (
    <DashboardLayout
      portalRole="CUSTOMS"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* 1. DOCUMENT REVIEW QUEUE */}
        {activeTab === 'review-queue' && (
          <ReviewQueueTab
            stats={stats}
            dossiers={dossiers}
            loading={loading}
            onRefresh={fetchCustomsData}
            onSelectDossierForCompliance={handleSelectDossierForCompliance}
            onQuickApprove={handleQuickApprove}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {/* 2. COMPLIANCE VALIDATION WORKBENCH */}
        {activeTab === 'compliance' && (
          <ComplianceTab
            dossiers={dossiers}
            selectedDossier={selectedDossier}
            onSelectDossier={setSelectedDossier}
            onUpdateClearance={handleUpdateClearance}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {/* 3. ELECTRONIC CLEARANCE STATUS & LEDGER */}
        {activeTab === 'clearance' && (
          <ClearanceTab
            ledger={ledger}
            loading={loading}
            onRefresh={fetchCustomsData}
            selectedCertificateShipmentId={selectedCertShipmentId}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
