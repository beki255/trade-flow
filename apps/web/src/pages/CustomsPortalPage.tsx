import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CustomsStats, CustomsDossierItem, ClearanceLedgerItem } from '../modules/customs/types';
import { Bell, ArrowRight, X } from 'lucide-react';

// Modular Tabs
import { ReviewQueueTab } from '../modules/customs/tabs/ReviewQueueTab';
import { ComplianceTab } from '../modules/customs/tabs/ComplianceTab';
import { ClearanceTab } from '../modules/customs/tabs/ClearanceTab';

export const CustomsPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
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
  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);
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

  // Active Pending Dossier for Real-Time Notification Toast Banner
  const pendingDossier = dossiers.find(
    (d) => d.customsStatus === 'SUBMITTED' || d.customsStatus === 'UNDER_REVIEW'
  );
  const showPendingAlert = pendingDossier && pendingDossier.id !== dismissedAlertId;

  return (
    <DashboardLayout
      portalRole="CUSTOMS"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* Real-Time Live Dossier Submission Alert Banner */}
        {showPendingAlert && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 animate-pulse">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    {language === 'AM' ? 'አዲስ የቀረበ ሰነድ' : 'New Shipper Submission'}
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold">{pendingDossier.title} ({pendingDossier.weightTons} Tons)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                  {language === 'AM'
                    ? `ላኪ ${pendingDossier.shipperCompany} ለዚህ ጭነት የተሟሉ የጉምሩክ ሰነዶችን አቅርቧል። የአረንጓዴ መስመር ፈቃድ ለመስጠት ዝግጁ ነው።`
                    : `Shipper ${pendingDossier.shipperCompany} submitted complete transit pre-clearance documents. Recommended: ${pendingDossier.recommendation.replace(/_/g, ' ')}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleSelectDossierForCompliance(pendingDossier)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{language === 'AM' ? 'አሁን መርምር' : 'Inspect Dossier'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlertId(pendingDossier.id)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
