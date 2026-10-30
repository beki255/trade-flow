import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  ForwarderStats,
  ForwarderClientItem,
  LtlLoadItem,
  ConsolidationDossier,
  MultimodalContainerItem,
} from '../modules/forwarder/types';

// Modular Tabs
import { MultiShipperTab } from '../modules/forwarder/tabs/MultiShipperTab';
import { ConsolidationTab } from '../modules/forwarder/tabs/ConsolidationTab';
import { CustomsCoordinationTab } from '../modules/forwarder/tabs/CustomsCoordinationTab';
import { MultimodalTab } from '../modules/forwarder/tabs/MultimodalTab';
import { TransporterBiddingTab } from '../modules/forwarder/tabs/TransporterBiddingTab';

export const ForwarderPortalPage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const activeTab = tab || 'multi-shipper';

  const handleTabChange = (newTab: string) => {
    navigate(`/forwarder/${newTab}`);
  };

  const [clients, setClients] = useState<ForwarderClientItem[]>([]);
  const [ltlLoads, setLtlLoads] = useState<LtlLoadItem[]>([]);
  const [multimodalContainers, setMultimodalContainers] = useState<MultimodalContainerItem[]>([]);
  const [consolidatedHistory, setConsolidatedHistory] = useState<ConsolidationDossier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [stats, setStats] = useState<ForwarderStats>({
    activeClients: 0,
    totalLoadsManaged: 0,
    activeLoadsManaged: 0,
    averageSavingsPct: 32,
  });

  const fetchForwarderData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Clients
      const clientsRes = await fetch('/api/forwarder/clients');
      if (clientsRes.ok) {
        const clientData = await clientsRes.json();
        if (clientData.clients) setClients(clientData.clients);
        if (clientData.stats) setStats(clientData.stats);
      }

      // 2. Fetch LTL Cargo Queue
      const ltlRes = await fetch('/api/forwarder/ltl-loads');
      if (ltlRes.ok) {
        const ltlData = await ltlRes.json();
        if (ltlData.ltlQueue) setLtlLoads(ltlData.ltlQueue);
      }

      // 3. Fetch Multimodal Containers
      const multiRes = await fetch('/api/forwarder/multimodal');
      if (multiRes.ok) {
        const multiData = await multiRes.json();
        if (multiData.containers) setMultimodalContainers(multiData.containers);
      }
    } catch (err) {
      console.warn('Failed to fetch forwarder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForwarderData();
    const interval = setInterval(fetchForwarderData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConsolidate = async (
    loadIds: string[],
    containerType: string,
    masterTitle: string,
    origin: string,
    destination: string,
    targetCarrierBudgetEtb: number
  ) => {
    const res = await fetch('/api/forwarder/consolidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loadIds,
        containerType,
        masterTitle,
        origin,
        destination,
        targetCarrierBudgetEtb,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to consolidate loads');
    }

    const data = await res.json();
    if (data.consolidatedDossier) {
      setConsolidatedHistory((prev) => [data.consolidatedDossier, ...prev]);
    }
    await fetchForwarderData();
  };

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
            clients={clients}
            loading={loading}
            onRefresh={fetchForwarderData}
            onNavigateConsolidation={() => navigate('/forwarder/consolidation')}
          />
        )}

        {/* 2. CONSOLIDATION WIZARD */}
        {activeTab === 'consolidation' && (
          <ConsolidationTab
            ltlLoads={ltlLoads}
            consolidatedHistory={consolidatedHistory}
            loading={loading}
            onRefresh={fetchForwarderData}
            onConsolidate={handleConsolidate}
          />
        )}

        {/* 3. CUSTOMS COORDINATION */}
        {activeTab === 'customs-coord' && (
          <CustomsCoordinationTab
            clients={clients}
            loading={loading}
            onRefresh={fetchForwarderData}
          />
        )}

        {/* 4. MULTI-MODAL CORRIDOR TRACKING */}
        {activeTab === 'multimodal' && (
          <MultimodalTab
            containers={multimodalContainers}
            loading={loading}
            onRefresh={fetchForwarderData}
          />
        )}

        {/* 5. MASTER TRANSPORTER CORRIDOR BIDDING */}
        {activeTab === 'transporter-bidding' && (
          <TransporterBiddingTab />
        )}
      </div>
    </DashboardLayout>
  );
};
