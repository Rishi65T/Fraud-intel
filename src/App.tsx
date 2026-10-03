import React, { useState, useEffect } from 'react';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { KpiRow } from './components/analytics/KpiRow';
import { FraudGraph3D } from './components/3d/FraudGraph3D';
import { GlobalFraudGlobe } from './components/3d/GlobalFraudGlobe';
import { TransactionRiskTrend } from './components/analytics/TransactionRiskTrend';
import { TopFraudClusters } from './components/analytics/TopFraudClusters';
import { LiveTransactionStream } from './components/analytics/LiveTransactionStream';
import { RiskScoreBreakdown } from './components/analytics/RiskScoreBreakdown';
import { EntityProfileModal } from './components/modals/EntityProfileModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { AnalystUser, DEMO_ANALYSTS } from './types/auth';
import { 
  RiskAlert, 
  InvestigationCase, 
  FraudCluster, 
  FraudEntity 
} from './types/fraud';
import { fraudApi } from './services/api';

// Dedicated Full Views
import { ClustersView } from './components/views/ClustersView';
import { DataPipelineView } from './components/views/DataPipelineView';
import { EntitiesView } from './components/views/EntitiesView';
import { GeographicIntelView } from './components/views/GeographicIntelView';
import { InvestigationWorkspaceView } from './components/views/InvestigationWorkspaceView';
import { ModelCenterView } from './components/views/ModelCenterView';
import { RiskAlertsView } from './components/views/RiskAlertsView';
import { SettingsView } from './components/views/SettingsView';

import { X } from 'lucide-react';
import { 
  GRAPH_NODES, 
  GRAPH_EDGES, 
  INITIAL_ENTITIES, 
  INITIAL_TRANSACTIONS, 
  FRAUD_CLUSTERS, 
  INITIAL_ALERTS, 
  INITIAL_INVESTIGATIONS, 
  MODEL_METRICS, 
  GEOGRAPHIC_NODES, 
  GEOGRAPHIC_ROUTES 
} from './data/fraudDatabase';

export default function App() {
  // Authentication & Analyst Profile State
  const [currentUser, setCurrentUser] = useState<AnalystUser | null>(DEMO_ANALYSTS[0]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);

  // Live Database State
  const [kpiData, setKpiData] = useState<any>(null);
  const [liveAlerts, setLiveAlerts] = useState<RiskAlert[]>(INITIAL_ALERTS);
  const [liveInvestigations, setLiveInvestigations] = useState<InvestigationCase[]>(INITIAL_INVESTIGATIONS);
  const [liveClusters, setLiveClusters] = useState<FraudCluster[]>(FRAUD_CLUSTERS);
  const [liveEntities, setLiveEntities] = useState<Record<string, FraudEntity>>(INITIAL_ENTITIES);

  // Fetch real telemetry from SQLite / Backend database on mount
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const analytics = await fraudApi.getAnalytics();
        if (analytics && analytics.kpis) {
          setKpiData(analytics.kpis);
        }
        const alerts = await fraudApi.getAlerts();
        if (alerts && alerts.length > 0) {
          setLiveAlerts(alerts);
        }
        const clusters = await fraudApi.getClusters();
        if (clusters && clusters.length > 0) {
          setLiveClusters(clusters);
        }
        const investigations = await fraudApi.getInvestigations();
        if (investigations && investigations.length > 0) {
          setLiveInvestigations(investigations);
        }
        const entities = await fraudApi.getEntities();
        if (entities && Object.keys(entities).length > 0) {
          setLiveEntities(entities);
        }
      } catch (err) {
        console.warn("Backend database telemetry load note:", err);
      }
    };
    fetchTelemetry();
  }, []);

  // Default to 'graph' or 'overview'
  const [activeView, setActiveView] = useState<NavView>('graph');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ACC-78291');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [showLiveStream, setShowLiveStream] = useState<boolean>(true);

  const selectedEntity = liveEntities[selectedEntityId] || liveEntities['ACC-78291'] || INITIAL_ENTITIES['ACC-78291'];

  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
  };

  const handleOpenEntityProfile = (id?: string) => {
    if (id) setSelectedEntityId(id);
    setIsProfileModalOpen(true);
  };

  // Full Login Screen if not authenticated
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsLocked(false);
        }}
      />
    );
  }

  // Fast Biometric / PIN Lock Screen if terminal locked
  if (isLocked) {
    return (
      <LoginScreen
        lockedUser={currentUser}
        onUnlock={() => setIsLocked(false)}
        onSwitchUser={() => {
          setIsLocked(false);
          setCurrentUser(null);
        }}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsLocked(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-[#060911] text-[#F8FAFC]">
      
      {/* 1. Header Navigation matching screenshot */}
      <Header 
        currentUser={currentUser}
        onSearchSelect={(q) => {
          setSelectedEntityId(q);
          setActiveView('graph');
        }}
        onNotificationClick={() => setActiveView('alerts')}
        onNavigateView={(v) => setActiveView(v as NavView)}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
        onLockTerminal={() => setIsLocked(true)}
        onSignOut={() => setCurrentUser(null)}
      />

      {/* Main Body: Sidebar + Main Dashboard Stage */}
      <div className="flex flex-1 w-full min-w-0">
        
        {/* 2. Left Sidebar Navigation matching screenshot */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
        />

        {/* 3. Main Stage Content */}
        <main className="flex-1 min-w-0 p-5 space-y-4">

          {/* MAIN SCREENSHOT DASHBOARD (Visible on 'graph' & 'overview') */}
          {(activeView === 'graph' || activeView === 'overview') && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Top Title Row + Live Stream Widget matching screenshot */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Left Title & Subtitle */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-sans">
                    Fraud Pattern Discovery
                  </h1>
                  <p className="text-xs font-semibold text-[#38BDF8] mt-1">
                    AI-Powered Financial Crime Intelligence
                  </p>
                </div>

                {/* Right Live Stream Widget matching screenshot */}
                {showLiveStream ? (
                  <div className="w-full sm:w-64 bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3 shadow-sm shrink-0 transition-all animate-in fade-in select-none">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 pb-1.5 border-b border-[#161E2E]">
                      <span className="text-[11px]">Live Stream</span>
                      <button 
                        type="button"
                        onClick={() => setShowLiveStream(false)}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Dismiss Live Stream"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5 mt-2 text-[10px]">
                      {/* Event 1 */}
                      <button 
                        type="button"
                        onClick={() => handleOpenEntityProfile('TXN-784923')}
                        className="w-full flex items-center justify-between text-left p-1 rounded hover:bg-[#121929] transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                          <span className="truncate max-w-[150px]">New high-risk transaction</span>
                        </div>
                        <span className="text-slate-500 font-mono">2m ago</span>
                      </button>

                      {/* Event 2 */}
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedEntityId('DEV-9921');
                          setActiveView('graph');
                        }}
                        className="w-full flex items-center justify-between text-left p-1 rounded hover:bg-[#121929] transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="truncate max-w-[150px]">Suspicious device detected</span>
                        </div>
                        <span className="text-slate-500 font-mono">3m ago</span>
                      </button>

                      {/* Event 3 */}
                      <button 
                        type="button"
                        onClick={() => setActiveView('clusters')}
                        className="w-full flex items-center justify-between text-left p-1 rounded hover:bg-[#121929] transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                          <span className="truncate max-w-[150px]">New cluster identified</span>
                        </div>
                        <span className="text-slate-500 font-mono">5m ago</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLiveStream(true)}
                    className="text-xs text-[#38BDF8] bg-[#0A0E18] border border-[#161E2E] px-3 py-1.5 rounded-lg hover:bg-[#141C2E] transition-colors self-start"
                  >
                    + Restore Live Stream
                  </button>
                )}

              </div>

              {/* Row 1: 4 Top KPI Cards */}
              <KpiRow
                kpis={kpiData || {
                  totalTransactions: '5,000',
                  totalTransactionsChange: '↑ 14%',
                  riskTransactions: '240',
                  riskTransactionsChange: '↑ 22%',
                  activeAlerts: `${liveAlerts.length}`,
                  activeAlertsChange: '↑ 8%',
                  fraudClusters: `${liveClusters.length}`,
                  fraudClustersChange: '↑ 12%'
                }}
              />

              {/* Row 2: Central 3D Interactive Holographic Graph Canvas with Floating Panels */}
              <div className="w-full h-[530px] lg:h-[570px] bg-[#060911] border border-[#161E2E] rounded-xl overflow-hidden shadow-2xl relative">
                <FraudGraph3D
                  nodes={GRAPH_NODES}
                  edges={GRAPH_EDGES}
                  selectedNodeId={selectedEntityId}
                  onSelectNode={(id) => setSelectedEntityId(id)}
                  onOpenFullProfile={() => setIsProfileModalOpen(true)}
                />
              </div>

              {/* Row 3: 3 Analytics Cards (Global Fraud Activity, Transaction Risk Trend, Top Fraud Clusters) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <GlobalFraudGlobe />
                <TransactionRiskTrend />
                <TopFraudClusters 
                  onSelectCluster={(cid) => {
                    setSelectedEntityId('ACC-78291');
                    setActiveView('clusters');
                  }}
                />
              </div>

              {/* Row 4: 2 Tables (Live Transaction Stream + Risk Score Breakdown) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
                <div className="lg:col-span-8">
                  <LiveTransactionStream 
                    onSelectEntity={(accId) => {
                      setSelectedEntityId(accId);
                      setIsProfileModalOpen(true);
                    }}
                    onOpenProfile={() => setIsProfileModalOpen(true)}
                  />
                </div>
                <div className="lg:col-span-4">
                  <RiskScoreBreakdown />
                </div>
              </div>

              {/* Bottom Glowing Banner matching screenshot */}
              <div className="pt-2 pb-6 flex items-center justify-center">
                <div className="relative w-full max-w-lg flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#EC4899]/30 to-transparent blur-xl" />
                  <div className="w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0C101C] via-[#1E1528] to-[#0C101C] border border-[#EC4899]/40 shadow-[0_0_25px_rgba(236,72,153,0.35)] flex items-center justify-center text-center">
                    <span className="text-sm lg:text-base font-extrabold tracking-[0.2em] text-white uppercase font-sans">
                      FRAUD PATTERN DISCOVERY
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* DEDICATED FULL VIEWS (When navigating to other tabs) */}
          {activeView === 'transactions' && (
            <div className="space-y-4 animate-in fade-in">
              <LiveTransactionStream 
                onSelectEntity={(accId) => {
                  setSelectedEntityId(accId);
                  setIsProfileModalOpen(true);
                }}
                onOpenProfile={() => setIsProfileModalOpen(true)}
              />
            </div>
          )}

          {activeView === 'investigate' && (
            <div className="animate-in fade-in">
              <InvestigationWorkspaceView
                cases={liveInvestigations}
                onSelectEntity={(id) => {
                  setSelectedEntityId(id);
                  setIsProfileModalOpen(true);
                }}
                onUpdateCase={() => {}}
                onCreateNewCase={() => {}}
              />
            </div>
          )}

          {activeView === 'alerts' && (
            <div className="animate-in fade-in">
              <RiskAlertsView
                alerts={liveAlerts}
                onSelectEntity={(id) => setSelectedEntityId(id)}
                onResolveAlert={() => {}}
                onAssignAlert={() => {}}
              />
            </div>
          )}

          {activeView === 'entities' && (
            <div className="animate-in fade-in">
              <EntitiesView
                entities={liveEntities}
                onSelectEntity={(id) => setSelectedEntityId(id)}
                onOpenFullProfile={() => setIsProfileModalOpen(true)}
              />
            </div>
          )}

          {activeView === 'clusters' && (
            <div className="animate-in fade-in">
              <ClustersView
                clusters={liveClusters}
                onSelectCluster={() => setSelectedEntityId('ACC-78291')}
                onInspectInGraph={() => setActiveView('graph')}
              />
            </div>
          )}

          {activeView === 'geographic' && (
            <div className="animate-in fade-in">
              <GeographicIntelView
                nodes={GEOGRAPHIC_NODES}
                routes={GEOGRAPHIC_ROUTES}
                onSelectLocation={() => {}}
              />
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TransactionRiskTrend />
                <RiskScoreBreakdown />
              </div>
              <TopFraudClusters />
            </div>
          )}

          {activeView === 'models' && (
            <div className="animate-in fade-in">
              <ModelCenterView models={MODEL_METRICS} />
            </div>
          )}

          {activeView === 'data' && (
            <div className="animate-in fade-in">
              <DataPipelineView />
            </div>
          )}

          {activeView === 'settings' && (
            <div className="animate-in fade-in">
              <SettingsView />
            </div>
          )}

        </main>

      </div>

      {/* Full Entity Profile Modal */}
      {isProfileModalOpen && selectedEntity && (
        <EntityProfileModal
          entity={selectedEntity}
          transactions={INITIAL_TRANSACTIONS}
          onClose={() => setIsProfileModalOpen(false)}
          onRunAiInvestigation={() => {}}
        />
      )}

      {/* Full Analyst Identity & Security Credentials Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isUserProfileModalOpen}
          onClose={() => setIsUserProfileModalOpen(false)}
          onLockTerminal={() => {
            setIsUserProfileModalOpen(false);
            setIsLocked(true);
          }}
          onSignOut={() => {
            setIsUserProfileModalOpen(false);
            setCurrentUser(null);
          }}
          onSwitchUser={(u) => setCurrentUser(u)}
        />
      )}

    </div>
  );
}
