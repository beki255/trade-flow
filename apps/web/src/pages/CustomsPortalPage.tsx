import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CustomsStats } from '../modules/customs/types';

// Modular Tabs
import { ReviewQueueTab } from '../modules/customs/tabs/ReviewQueueTab';
import { ComplianceTab } from '../modules/customs/tabs/ComplianceTab';
import { ClearanceTab } from '../modules/customs/tabs/ClearanceTab';

export const CustomsPortalPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'review-queue';

  const handleTabChange = (newTab: string) => {
    navigate(`/customs/${newTab}`);
  };

  const [stats, setStats] = useState<CustomsStats>({
    pendingReviews: 0,
    greenLineCleared: 0,
    inspectionRate: '100%',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/portal/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            pendingReviews: data.activeLoads || 0,
            greenLineCleared: data.totalShipments || 0,
            inspectionRate: '100%',
          });
        }
      } catch (err) {
        console.warn('Failed to fetch customs stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout
      portalRole="CUSTOMS"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* 1. DOCUMENT REVIEW QUEUE */}
        {activeTab === 'review-queue' && <ReviewQueueTab stats={stats} />}

        {/* 2. COMPLIANCE VALIDATION */}
        {activeTab === 'compliance' && <ComplianceTab />}

        {/* 3. CLEARANCE STATUS */}
        {activeTab === 'clearance' && <ClearanceTab />}
      </div>
    </DashboardLayout>
  );
};
