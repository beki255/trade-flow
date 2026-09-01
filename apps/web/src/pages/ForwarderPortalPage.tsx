import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ForwarderStats } from '../modules/forwarder/types';

// Modular Tabs
import { MultiShipperTab } from '../modules/forwarder/tabs/MultiShipperTab';
import { ConsolidationTab } from '../modules/forwarder/tabs/ConsolidationTab';
import { CustomsCoordinationTab } from '../modules/forwarder/tabs/CustomsCoordinationTab';
import { TransporterBiddingTab } from '../modules/forwarder/tabs/TransporterBiddingTab';

export const ForwarderPortalPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'multi-shipper';

  const handleTabChange = (newTab: string) => {
    navigate(`/forwarder/${newTab}`);
  };

  const [stats, setStats] = useState<ForwarderStats>({
    activeClients: 0,
    consolidatedLoads: 0,
    savingsPercentage: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/portal/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            activeClients: data.verifiedUsers || 0,
            consolidatedLoads: data.activeLoads || 0,
            savingsPercentage: data.activeLoads > 0 ? 32 : 0,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch real portal stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout
      portalRole="FORWARDER"
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      <div className="space-y-6">
        {/* 1. MULTI-SHIPPER DASHBOARD */}
        {activeTab === 'multi-shipper' && (
          <MultiShipperTab
            stats={stats}
            onNavigateConsolidation={() => navigate('/forwarder/consolidation')}
          />
        )}

        {/* 2. CONSOLIDATION WIZARD */}
        {activeTab === 'consolidation' && <ConsolidationTab />}

        {/* 3. CUSTOMS COORDINATION */}
        {activeTab === 'customs-coord' && <CustomsCoordinationTab />}

        {/* 4. MASTER TRANSPORTER BIDDING */}
        {activeTab === 'transporter-bidding' && <TransporterBiddingTab />}
      </div>
    </DashboardLayout>
  );
};
