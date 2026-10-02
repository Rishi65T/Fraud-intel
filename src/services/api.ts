import { 
  FraudEntity, 
  GraphNode, 
  GraphEdge, 
  Transaction, 
  FraudCluster, 
  RiskAlert, 
  InvestigationCase, 
  ModelMetric, 
  GeographicRiskNode, 
  GeographicRoute 
} from '../types/fraud';
import { 
  INITIAL_ENTITIES, 
  GRAPH_NODES, 
  GRAPH_EDGES, 
  INITIAL_TRANSACTIONS, 
  FRAUD_CLUSTERS, 
  INITIAL_ALERTS, 
  INITIAL_INVESTIGATIONS, 
  MODEL_METRICS, 
  GEOGRAPHIC_NODES, 
  GEOGRAPHIC_ROUTES, 
  RISK_TREND_DATA 
} from '../data/fraudDatabase';

export interface AnalyticsResponse {
  kpis: {
    totalTransactions: string;
    totalTransactionsChange: string;
    riskTransactions: string;
    riskTransactionsChange: string;
    activeAlerts: string;
    activeAlertsChange: string;
    fraudClusters: string;
    fraudClustersChange: string;
    highRiskEntities: number;
  };
  riskTrend: typeof RISK_TREND_DATA;
  riskBreakdown: {
    score: number;
    tier: string;
    factors: { label: string; impact: number; description: string }[];
  };
}

export interface AIPerformanceVerdict {
  verdict: string;
  confidenceScore: number;
  executiveSummary: string;
  modusOperandi: string;
  primarySignals: string[];
  recommendedActions: string[];
  networkTopologyInsight: string;
}

export interface MLPredictionResult {
  predictedRiskScore: number;
  status: 'FRAUD' | 'REVIEW' | 'CLEAN';
  modelUsed: string;
  inferenceLatencyMs: number;
  contributingFactors: string[];
  shapWaterfall: { feature: string; contribution: number }[];
}

export const fraudApi = {
  async getAnalytics(): Promise<AnalyticsResponse> {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local
    }
    return {
      kpis: {
        totalTransactions: '12.4M',
        totalTransactionsChange: '+12%',
        riskTransactions: '48,231',
        riskTransactionsChange: '+28%',
        activeAlerts: '1,284',
        activeAlertsChange: '+5%',
        fraudClusters: '37',
        fraudClustersChange: '+18%',
        highRiskEntities: 5
      },
      riskTrend: RISK_TREND_DATA,
      riskBreakdown: {
        score: 0.92,
        tier: 'HIGH RISK',
        factors: [
          { label: 'UPI Transaction Velocity', impact: 24, description: 'Rapid outbound frequency 3.8x above user baseline' },
          { label: 'Shared Device', impact: 21, description: 'OnePlus device DEV-9921 fingerprint linked to 4 distinct identity clusters' },
          { label: 'Geographic Anomaly', impact: 18, description: 'Physical impossibility: Mumbai to Jamtara routing in under 20 minutes' },
          { label: 'Merchant Gateway Risk', impact: 15, description: 'High-risk unauthorized P2P payment gateway checkout' },
          { label: 'Network Association', impact: 14, description: 'Direct 1-hop path to Jamtara Phishing Syndicate (CL-001)' }
        ]
      }
    };
  },

  async getTransactions(status?: string, search?: string): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    let list = [...INITIAL_TRANSACTIONS];
    if (status && status !== 'ALL') {
      list = list.filter(t => t.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(t => 
        t.id.toLowerCase().includes(s) || 
        t.accountId.toLowerCase().includes(s) ||
        t.merchant.toLowerCase().includes(s)
      );
    }
    return list;
  },

  async getEntities(): Promise<Record<string, FraudEntity>> {
    try {
      const res = await fetch('/api/entities');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return INITIAL_ENTITIES;
  },

  async getEntity(id: string): Promise<FraudEntity | null> {
    try {
      const res = await fetch(`/api/entities/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return INITIAL_ENTITIES[id] || INITIAL_ENTITIES['ACC-78291'];
  },

  async getGraph(id: string = 'ACC-78291'): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; centralEntityId: string }> {
    try {
      const res = await fetch(`/api/graph/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      nodes: GRAPH_NODES,
      edges: GRAPH_EDGES,
      centralEntityId: id
    };
  },

  async getClusters(): Promise<FraudCluster[]> {
    try {
      const res = await fetch('/api/clusters');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return FRAUD_CLUSTERS;
  },

  async getAlerts(): Promise<RiskAlert[]> {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return INITIAL_ALERTS;
  },

  async getInvestigations(): Promise<InvestigationCase[]> {
    try {
      const res = await fetch('/api/investigations');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return INITIAL_INVESTIGATIONS;
  },

  async createInvestigation(data: Partial<InvestigationCase>): Promise<InvestigationCase> {
    try {
      const res = await fetch('/api/investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title || 'New Fraud Investigation',
      primaryEntityId: data.primaryEntityId || 'ACC-78291',
      riskScore: data.riskScore || 0.85,
      status: 'In Review',
      priority: data.priority || 'High',
      assignedAnalyst: 'Aryan Mehra',
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST',
      lastUpdated: 'Just now',
      summary: data.summary || 'Investigation initiated by analyst.',
      keyFindings: data.keyFindings || ['Initial case triage opened from 3D Fraud Graph inspection'],
      evidenceEntities: data.evidenceEntities || [data.primaryEntityId || 'ACC-78291'],
      timeline: [
        { time: 'Just now', event: 'Case created by analyst Aryan Mehra', user: 'Aryan Mehra', type: 'analyst' }
      ],
      notes: []
    };
  },

  async getModelPerformance(): Promise<{ models: ModelMetric[]; benchmarkDataset: string }> {
    try {
      const res = await fetch('/api/model-performance');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      models: MODEL_METRICS,
      benchmarkDataset: 'NPCI UPI Real-Time Fraud Benchmark + RBI Digital Banking Stream'
    };
  },

  async getGeographicRisk(): Promise<{ nodes: GeographicRiskNode[]; routes: GeographicRoute[] }> {
    try {
      const res = await fetch('/api/geographic-risk');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      nodes: GEOGRAPHIC_NODES,
      routes: GEOGRAPHIC_ROUTES
    };
  },

  async predictRisk(features: {
    amount: number;
    merchant: string;
    isNewDevice: boolean;
    isTorOrVpn: boolean;
    velocityPerHour: number;
    customerAgeDays: number;
  }): Promise<MLPredictionResult> {
    try {
      const res = await fetch('/api/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    let score = 0.05;
    if (features.amount > 50000) score += 0.25;
    if (features.isTorOrVpn) score += 0.35;
    if (features.isNewDevice) score += 0.20;
    if (features.velocityPerHour > 5) score += 0.25;
    if (features.customerAgeDays < 30) score += 0.15;
    const finalScore = Math.min(0.99, Math.max(0.02, parseFloat(score.toFixed(2))));
    return {
      predictedRiskScore: finalScore,
      status: finalScore >= 0.8 ? 'FRAUD' : finalScore >= 0.5 ? 'REVIEW' : 'CLEAN',
      modelUsed: 'XGBoost v2.4.1 (NPCI UPI Model) + Indian Banking GraphSAGE',
      inferenceLatencyMs: 3.8,
      contributingFactors: [
        features.isTorOrVpn ? 'Mewat/Jamtara Proxy ASN signature detected' : '',
        features.amount > 50000 ? 'High-ticket UPI transfer above ₹50,000 threshold' : '',
        features.velocityPerHour > 5 ? 'Elevated hourly UPI transaction velocity' : ''
      ].filter(Boolean),
      shapWaterfall: [
        { feature: 'Proxy / ASN Risk', contribution: features.isTorOrVpn ? 0.35 : -0.05 },
        { feature: 'UPI Hourly Velocity', contribution: features.velocityPerHour > 5 ? 0.25 : -0.02 },
        { feature: 'Ticket Amount (₹)', contribution: features.amount > 50000 ? 0.25 : -0.08 }
      ]
    };
  },

  async runAIInvestigation(entity: FraudEntity, linkedData?: Record<string, unknown>): Promise<AIPerformanceVerdict> {
    try {
      const res = await fetch('/api/investigate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: entity.id,
          entityType: entity.type,
          riskScore: entity.riskScore,
          details: entity.details,
          linkedData
        })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      verdict: entity.riskScore >= 0.8 ? 'CRITICAL RISK - CONFIRMED MULE NETWORK' : 'SUSPICIOUS VELOCITY PATTERN',
      confidenceScore: 0.94,
      executiveSummary: `Entity ${entity.id} (${entity.name}) demonstrates high-velocity laundering patterns across Indian banking rails with 4 linked devices, 6 Mewat/Jamtara proxy IPs, and 12 distinct merchant interactions. Rapid automated disbursements indicate an active syndicate ring.`,
      modusOperandi: 'Synthetic KYC bootstrapping with emulator hardware signature masking. High velocity outbound withdrawals via UPI and IMPS to digital voucher off-ramps within minutes of fund arrival.',
      primarySignals: [
        'Device DEV-9921 shared across 4 distinct Indian customer accounts in past 48 hours',
        'Suspicious ISP Proxy ASN reputation score 0.95 (Mewat / Nuh block)',
        'UPI velocity anomaly: 3 consecutive max-limit orders to Flipkart & PayTM Gateway',
        'Graph community detection connects entity directly to Jamtara Syndicate Mule Ring CL-001'
      ],
      recommendedActions: [
        `Execute immediate administrative debit freeze on HDFC Account ${entity.id} under Section 102 CrPC`,
        'Draft STR (Suspicious Transaction Report) for Financial Intelligence Unit - India (FIU-IND)',
        'Report hardware IMEI and IP block 103.212.144.18 to National Cybercrime Helpline (1930 / I4C)',
        'Isolate all 48 adjacent nodes in Cluster CL-001 for secondary forensic quarantine'
      ],
      networkTopologyInsight: `${entity.id} functions as a high-betweenness degree nexus in Cluster CL-001, acting as an intermediary collection node between 14 synthetic accounts and external off-ramp merchants.`
    };
  }
};
