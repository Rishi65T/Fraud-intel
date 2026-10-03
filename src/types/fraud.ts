export type EntityType = 
  | 'Customer' 
  | 'Account' 
  | 'Transaction' 
  | 'Device' 
  | 'Merchant' 
  | 'IP Address' 
  | 'Location';

export type RiskLevel = 'All' | 'Critical' | 'High' | 'Medium' | 'Low';

export type TransactionStatus = 'FRAUD' | 'REVIEW' | 'CLEAN';

export interface FraudEntity {
  id: string;
  name: string;
  type: EntityType;
  riskScore: number;
  riskCategory: 'Critical' | 'High' | 'Medium' | 'Low';
  details: {
    accountType?: string;
    customerId?: string;
    totalTransactions?: number;
    totalAmount?: number;
    linkedDevices?: number;
    linkedIps?: number;
    linkedMerchants?: number;
    email?: string;
    phone?: string;
    ipAddress?: string;
    locationName?: string;
    coordinates?: [number, number]; // lat, lng
    deviceModel?: string;
    os?: string;
    merchantCategory?: string;
    createdDate?: string;
    lastActive?: string;
  };
  shapValues?: {
    factor: string;
    impact: number; // percentage, e.g. 24
    direction: 'positive' | 'negative';
  }[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  sublabel?: string;
  riskScore: number;
  position: [number, number, number]; // 3D coordinates
  color: string;
  icon?: string;
  size?: number;
  isCentral?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  riskScore: number;
  volume?: number;
  type: 'owns' | 'uses' | 'makes' | 'pays' | 'occurs_at' | 'connected_to';
}

export interface Transaction {
  id: string;
  accountId: string;
  customerName: string;
  amount: number;
  merchant: string;
  merchantCategory: string;
  location: string;
  coordinates: [number, number];
  riskScore: number;
  status: TransactionStatus;
  timestamp: string;
  timeAgo: string;
  ipAddress: string;
  deviceId: string;
  anomalyReasons?: string[];
}

export interface FraudCluster {
  id: string;
  name: string;
  entitiesCount: number;
  accountsCount: number;
  devicesCount: number;
  merchantsCount: number;
  transactionsCount: number;
  totalVolume: number;
  riskScore: number;
  pattern: string;
  detectedTime: string;
  status: 'Active' | 'Investigating' | 'Contained';
  description: string;
}

export interface RiskAlert {
  id: string;
  title: string;
  entityId: string;
  entityType: EntityType;
  riskScore: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  timeAgo: string;
  description: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  assignedAnalyst?: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  primaryEntityId: string;
  riskScore: number;
  status: 'In Review' | 'Escalated' | 'Resolved' | 'Closed';
  priority: 'Critical' | 'High' | 'Medium';
  assignedAnalyst: string;
  createdDate: string;
  lastUpdated: string;
  summary: string;
  keyFindings: string[];
  evidenceEntities: string[];
  aiAnalysis?: string;
  timeline: {
    time: string;
    event: string;
    user: string;
    type: 'alert' | 'system' | 'analyst' | 'ai';
  }[];
  notes: {
    id: string;
    author: string;
    timestamp: string;
    content: string;
  }[];
}

export interface ModelMetric {
  id: string;
  name: string;
  version: string;
  type: 'Supervised' | 'Graph Neural Net' | 'Unsupervised' | 'Ensemble';
  dataset: string;
  trainingDate: string;
  precision: number;
  recall: number;
  f1: number;
  prAuc: number;
  rocAuc: number;
  status: 'Production' | 'Challenger' | 'Shadow' | 'Archived';
  latencyMs: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  featureImportance: {
    feature: string;
    importance: number;
  }[];
  description: string;
}

export interface GeographicRiskNode {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // lat, lng
  riskLevel: 'High' | 'Medium' | 'Low';
  riskScore: number;
  transactionCount: number;
  fraudCount: number;
  activeSyndicates: number;
}

export interface GeographicRoute {
  id: string;
  fromName: string;
  toName: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  riskLevel: 'High' | 'Medium' | 'Low';
  volume: number;
}
