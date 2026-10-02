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

// Central High-Risk Indian Account matching visual reference
export const INITIAL_ENTITIES: Record<string, FraudEntity> = {
  'ACC-78291': {
    id: 'ACC-78291',
    name: 'High Risk Account (HDFC Bank BKC)',
    type: 'Account',
    riskScore: 0.92,
    riskCategory: 'High',
    details: {
      accountType: 'Current / Savings (HDFC Bank BKC, Mumbai)',
      customerId: 'CUST-4481 (Rohan Sharma)',
      totalTransactions: 243,
      totalAmount: 1284300, // ₹12,84,300
      linkedDevices: 4,
      linkedIps: 6,
      linkedMerchants: 12,
      createdDate: '2024-03-12',
      lastActive: '2 mins ago',
      email: 'rohan.sharma***@gmail.com',
      phone: '+91 98201 84920'
    },
    shapValues: [
      { factor: 'UPI Transaction Velocity', impact: 24, direction: 'positive' },
      { factor: 'Rooted Android Emulator', impact: 21, direction: 'positive' },
      { factor: 'Mewat/Jamtara Anomaly', impact: 18, direction: 'positive' },
      { factor: 'Razorpay High-Risk Gateway', impact: 15, direction: 'positive' },
      { factor: 'Syndicate Mule Association', impact: 14, direction: 'positive' },
    ]
  },
  'CUST-4481': {
    id: 'CUST-4481',
    name: 'Customer (Rohan Sharma)',
    type: 'Customer',
    riskScore: 0.88,
    riskCategory: 'High',
    details: {
      accountType: 'Tier 1 Individual (Bandra West, Mumbai)',
      customerId: 'CUST-4481',
      totalTransactions: 243,
      totalAmount: 1284300,
      linkedDevices: 4,
      linkedIps: 6,
      linkedMerchants: 12,
      createdDate: '2024-03-10',
      lastActive: 'Just now',
      email: 'rohan.sharma***@gmail.com',
      phone: '+91 98201 84920'
    }
  },
  'DEV-9921': {
    id: 'DEV-9921',
    name: 'Device (OnePlus 12 / Magisk Root)',
    type: 'Device',
    riskScore: 0.89,
    riskCategory: 'High',
    details: {
      deviceModel: 'OnePlus 12 (Rooted Android 14 / Hooked Zygote)',
      os: 'Android 14 (IMEI: 864921048291032)',
      linkedIps: 8,
      linkedMerchants: 15,
      lastActive: '3 mins ago'
    }
  },
  'TXN-784923': {
    id: 'TXN-784923',
    name: 'Transaction (₹1,85,000 Flipkart Digital)',
    type: 'Transaction',
    riskScore: 0.92,
    riskCategory: 'High',
    details: {
      totalAmount: 185000.00,
      merchantCategory: 'Consumer Electronics & Gold Vouchers',
      locationName: 'Mumbai, Maharashtra',
      lastActive: '2 mins ago'
    }
  },
  'MERCH-4091': {
    id: 'MERCH-4091',
    name: 'Merchant (Razorpay / Croma Digital)',
    type: 'Merchant',
    riskScore: 0.76,
    riskCategory: 'Medium',
    details: {
      merchantCategory: 'Digital Goods & Quick Settlements',
      totalTransactions: 1420,
      totalAmount: 8904500,
      locationName: 'Bengaluru, Karnataka'
    }
  },
  'IP-185-220': {
    id: 'IP-185-220',
    name: 'IP Address (103.212.144.18 - Jio Proxy)',
    type: 'IP Address',
    riskScore: 0.95,
    riskCategory: 'High',
    details: {
      ipAddress: '103.212.144.18',
      locationName: 'Mewat / Nuh (Suspicious ISP Proxy ASN)',
      linkedDevices: 14,
      lastActive: '1 min ago'
    }
  },
  'LOC-NY': {
    id: 'LOC-NY',
    name: 'Location (Mumbai & Jamtara Corridor)',
    type: 'Location',
    riskScore: 0.65,
    riskCategory: 'Medium',
    details: {
      locationName: 'Mumbai, Maharashtra & Jamtara, Jharkhand',
      coordinates: [19.0760, 72.8777],
      totalTransactions: 42100
    }
  },
  'ACC-VAULT': {
    id: 'ACC-VAULT',
    name: 'Account (SBI Current Acct / Mule Hub)',
    type: 'Account',
    riskScore: 0.42,
    riskCategory: 'Low',
    details: {
      accountType: 'Corporate Current (State Bank of India, Mumbai)',
      customerId: 'CUST-1029 (Aarav Verma)',
      totalTransactions: 45,
      totalAmount: 320000,
      linkedDevices: 1,
      linkedIps: 1,
      linkedMerchants: 4
    }
  }
};

// 3D Graph Nodes radiating from ACC-78291
export const GRAPH_NODES: GraphNode[] = [
  {
    id: 'ACC-78291',
    label: 'High Risk Account',
    sublabel: 'ACC-78291 (HDFC Bank BKC)',
    type: 'Account',
    riskScore: 0.92,
    position: [0, 0, 0],
    color: '#EF4444',
    size: 1.4,
    isCentral: true
  },
  {
    id: 'CUST-4481',
    label: 'Customer',
    sublabel: 'Rohan Sharma (Mumbai)',
    type: 'Customer',
    riskScore: 0.88,
    position: [0, 2.7, 0.2],
    color: '#38BDF8',
    size: 1.1
  },
  {
    id: 'DEV-9921',
    label: 'Device',
    sublabel: 'OnePlus 12 (Rooted)',
    type: 'Device',
    riskScore: 0.89,
    position: [2.65, 1.85, 0],
    color: '#A78BFA',
    size: 1.05
  },
  {
    id: 'TXN-784923',
    label: 'Transaction',
    sublabel: '₹1,85,000 (Flipkart)',
    type: 'Transaction',
    riskScore: 0.92,
    position: [3.35, 0.1, 0.1],
    color: '#F59E0B',
    size: 1.05
  },
  {
    id: 'MERCH-4091',
    label: 'Merchant',
    sublabel: 'Razorpay / Croma',
    type: 'Merchant',
    riskScore: 0.76,
    position: [2.35, -1.95, 0.2],
    color: '#10B981',
    size: 1.05
  },
  {
    id: 'LOC-NY',
    label: 'Location',
    sublabel: 'Mumbai, Maharashtra',
    type: 'Location',
    riskScore: 0.65,
    position: [0, -2.75, 0.2],
    color: '#22D3EE',
    size: 1.1
  },
  {
    id: 'IP-185-220',
    label: 'IP Address',
    sublabel: 'Jio Proxy (Mewat)',
    type: 'IP Address',
    riskScore: 0.95,
    position: [-2.45, -1.95, 0],
    color: '#EF4444',
    size: 1.05
  },
  {
    id: 'ACC-VAULT',
    label: 'Account',
    sublabel: 'SBI Mule Node',
    type: 'Account',
    riskScore: 0.42,
    position: [-2.65, 1.45, 0.1],
    color: '#38BDF8',
    size: 1.05
  }
];

export const GRAPH_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'CUST-4481', target: 'ACC-78291', label: 'owns', riskScore: 0.88, type: 'owns', volume: 1284300 },
  { id: 'e2', source: 'ACC-78291', target: 'DEV-9921', label: 'uses', riskScore: 0.89, type: 'uses', volume: 4 },
  { id: 'e3', source: 'ACC-78291', target: 'TXN-784923', label: 'makes', riskScore: 0.92, type: 'makes', volume: 185000 },
  { id: 'e4', source: 'TXN-784923', target: 'MERCH-4091', label: 'pays', riskScore: 0.76, type: 'pays', volume: 185000 },
  { id: 'e5', source: 'ACC-78291', target: 'LOC-NY', label: 'occurs_at', riskScore: 0.65, type: 'occurs_at', volume: 243 },
  { id: 'e6', source: 'ACC-78291', target: 'IP-185-220', label: 'connected_to', riskScore: 0.95, type: 'connected_to', volume: 6 },
  { id: 'e7', source: 'ACC-78291', target: 'ACC-VAULT', label: 'transfers_to', riskScore: 0.42, type: 'connected_to', volume: 450000 },
  { id: 'e8', source: 'DEV-9921', target: 'IP-185-220', label: 'routes_via', riskScore: 0.91, type: 'connected_to', volume: 14 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-784923',
    accountId: 'ACC-78291',
    customerName: 'Rohan Sharma',
    amount: 185000.00,
    merchant: 'Flipkart Digital',
    merchantCategory: 'Consumer Electronics',
    location: 'Mumbai, Maharashtra',
    coordinates: [19.0760, 72.8777],
    riskScore: 0.92,
    status: 'FRAUD',
    timestamp: '2026-10-02T11:32:15Z',
    timeAgo: '2m ago',
    ipAddress: '103.212.144.18',
    deviceId: 'DEV-9921',
    anomalyReasons: ['Mewat proxy IP signature', 'UPI velocity > 3.8x baseline', 'Rooted OnePlus fingerprint']
  },
  {
    id: 'TXN-784922',
    accountId: 'ACC-11832',
    customerName: 'Priya Patel',
    amount: 2450.00,
    merchant: 'Zepto Quick Commerce',
    merchantCategory: 'Groceries & Essentials',
    location: 'Bengaluru, Karnataka',
    coordinates: [12.9716, 77.5946],
    riskScore: 0.18,
    status: 'CLEAN',
    timestamp: '2026-10-02T11:31:02Z',
    timeAgo: '3m ago',
    ipAddress: '49.207.214.12',
    deviceId: 'DEV-1044',
    anomalyReasons: ['Regular behavioral profile']
  },
  {
    id: 'TXN-784921',
    accountId: 'ACC-99213',
    customerName: 'Aarav Verma',
    amount: 85000.00,
    merchant: 'Croma Electronics',
    merchantCategory: 'Retail Electronics',
    location: 'Delhi NCR',
    coordinates: [28.6139, 77.2090],
    riskScore: 0.78,
    status: 'REVIEW',
    timestamp: '2026-10-02T11:29:40Z',
    timeAgo: '4m ago',
    ipAddress: '106.51.78.90',
    deviceId: 'DEV-5541',
    anomalyReasons: ['Unusual midnight high-value transfer', 'New merchant category for account']
  },
  {
    id: 'TXN-784920',
    accountId: 'ACC-44721',
    customerName: 'Neha Gupta',
    amount: 699.00,
    merchant: 'Swiggy Instamart',
    merchantCategory: 'Food & Quick Commerce',
    location: 'Hyderabad, Telangana',
    coordinates: [17.3850, 78.4867],
    riskScore: 0.08,
    status: 'CLEAN',
    timestamp: '2026-10-02T11:28:10Z',
    timeAgo: '6m ago',
    ipAddress: '182.73.190.4',
    deviceId: 'DEV-3209',
    anomalyReasons: ['Recurring UPI payment pattern']
  },
  {
    id: 'TXN-784919',
    accountId: 'ACC-78291',
    customerName: 'Rohan Sharma',
    amount: 240000.00,
    merchant: 'PayTM Payment Gateway',
    merchantCategory: 'P2P Virtual Escrow',
    location: 'Mumbai, Maharashtra',
    coordinates: [19.0760, 72.8777],
    riskScore: 0.96,
    status: 'FRAUD',
    timestamp: '2026-10-02T11:26:55Z',
    timeAgo: '7m ago',
    ipAddress: '103.212.144.18',
    deviceId: 'DEV-9921',
    anomalyReasons: ['High-risk merchant gateway', 'Rapid fund evacuation to mule ring', 'Jamtara syndicate tie']
  },
  {
    id: 'TXN-784918',
    accountId: 'ACC-66120',
    customerName: 'Vikram Malhotra',
    amount: 450000.00,
    merchant: 'Tanishq Jewellers',
    merchantCategory: 'Precious Metals & Jewelry',
    location: 'Jaipur, Rajasthan',
    coordinates: [26.9124, 75.7873],
    riskScore: 0.84,
    status: 'REVIEW',
    timestamp: '2026-10-02T11:24:20Z',
    timeAgo: '10m ago',
    ipAddress: '122.161.42.10',
    deviceId: 'DEV-7711',
    anomalyReasons: ['Inter-state high-value velocity spike', 'First-time transaction above ₹2 Lakh']
  },
  {
    id: 'TXN-784917',
    accountId: 'ACC-38290',
    customerName: 'Ananya Iyer',
    amount: 1450.00,
    merchant: 'Blinkit Groceries',
    merchantCategory: 'Quick Delivery',
    location: 'Chennai, Tamil Nadu',
    coordinates: [13.0827, 80.2707],
    riskScore: 0.11,
    status: 'CLEAN',
    timestamp: '2026-10-02T11:20:15Z',
    timeAgo: '14m ago',
    ipAddress: '157.48.12.98',
    deviceId: 'DEV-4421',
    anomalyReasons: ['Normal user spending pattern']
  },
  {
    id: 'TXN-784916',
    accountId: 'ACC-55102',
    customerName: 'Rajesh Nair',
    amount: 95000.00,
    merchant: 'Reliance Digital',
    merchantCategory: 'Electronics Retail',
    location: 'Pune, Maharashtra',
    coordinates: [18.5204, 73.8567],
    riskScore: 0.62,
    status: 'REVIEW',
    timestamp: '2026-10-02T11:15:30Z',
    timeAgo: '19m ago',
    ipAddress: '115.112.90.34',
    deviceId: 'DEV-8820',
    anomalyReasons: ['Sudden device switch', 'New merchant authorization']
  }
];

export const FRAUD_CLUSTERS: FraudCluster[] = [
  {
    id: 'CL-001',
    name: 'Jamtara UPI Phishing & Mule Ring',
    entitiesCount: 48,
    accountsCount: 14,
    devicesCount: 8,
    merchantsCount: 19,
    transactionsCount: 382,
    totalVolume: 5124000, // ₹51,24,000 (51.24 Lakhs)
    riskScore: 0.92,
    pattern: 'Synthetic KYC & Rapid UPI Structuring',
    detectedTime: '12m ago',
    status: 'Active',
    description: 'Coordinated syndicate funneling rapid UPI disbursements through compromised mule accounts in HDFC and SBI to P2P virtual payment gateways.'
  },
  {
    id: 'CL-002',
    name: 'Mewat SIM-Box Banking Syndicate',
    entitiesCount: 32,
    accountsCount: 9,
    devicesCount: 12,
    merchantsCount: 7,
    transactionsCount: 1240,
    totalVolume: 1845000, // ₹18.45 Lakhs
    riskScore: 0.87,
    pattern: 'Automated Micro-Debit Testing & OTP Intercept',
    detectedTime: '34m ago',
    status: 'Investigating',
    description: 'High-frequency sub-₹500 micro-debit testing across quick commerce and food delivery merchants originating from suspicious proxy IP blocks.'
  },
  {
    id: 'CL-003',
    name: 'Bengaluru Corporate Mule Network',
    entitiesCount: 28,
    accountsCount: 6,
    devicesCount: 5,
    merchantsCount: 4,
    transactionsCount: 94,
    totalVolume: 3409000, // ₹34.09 Lakhs
    riskScore: 0.79,
    pattern: 'Shell Company Current Account Laundering',
    detectedTime: '1h ago',
    status: 'Active',
    description: 'Fabricated GSTIN shell corporate accounts processing manufactured high-ticket chargebacks with non-existent e-way bills.'
  },
  {
    id: 'CL-004',
    name: 'Mumbai Hawala & P2P Smurfing Loop',
    entitiesCount: 21,
    accountsCount: 7,
    devicesCount: 4,
    merchantsCount: 9,
    transactionsCount: 112,
    totalVolume: 12900000, // ₹1.29 Crores
    riskScore: 0.74,
    pattern: 'PMLA Threshold Splitting (Smurfing)',
    detectedTime: '2h ago',
    status: 'Contained',
    description: 'Compromised Aadhaar OTP verification routing rapid IMPS and RTGS wire requests across Indian metro banking nodes.'
  },
  {
    id: 'CL-005',
    name: 'Delhi-NCR Instant Loan App Syndicate',
    entitiesCount: 19,
    accountsCount: 5,
    devicesCount: 3,
    merchantsCount: 6,
    transactionsCount: 68,
    totalVolume: 928000, // ₹9.28 Lakhs
    riskScore: 0.68,
    pattern: 'Predatory Micro-Disbursement Smurfing',
    detectedTime: '3h ago',
    status: 'Investigating',
    description: 'Unlicensed digital lending apps harvesting contacts and cycling disbursements under the ₹50,000 threshold across 4 Indian states.'
  }
];

export const INITIAL_ALERTS: RiskAlert[] = [
  {
    id: 'ALT-1092',
    title: 'High-Velocity UPI Transfers on HDFC Account',
    entityId: 'ACC-78291',
    entityType: 'Account',
    riskScore: 0.92,
    severity: 'Critical',
    timestamp: '2026-10-02T11:32:15Z',
    timeAgo: '2m ago',
    description: 'Account ACC-78291 initiated 3 high-value outbound transfers (₹1,85,000, ₹2,40,000) routed via suspicious Mewat proxy IP 103.212.144.18.',
    status: 'Open',
    assignedAnalyst: 'Aryan Mehra'
  },
  {
    id: 'ALT-1091',
    title: 'Rooted Device & Fake GPS Signature Detected',
    entityId: 'DEV-9921',
    entityType: 'Device',
    riskScore: 0.89,
    severity: 'High',
    timestamp: '2026-10-02T11:31:00Z',
    timeAgo: '3m ago',
    description: 'Hooked Zygote and Magisk root detected on OnePlus 12 device fingerprint tied to 4 synthetic UPI accounts.',
    status: 'Investigating',
    assignedAnalyst: 'Aryan Mehra'
  },
  {
    id: 'ALT-1090',
    title: 'New Jamtara Phishing Syndicate (CL-001) Identified',
    entityId: 'CL-001',
    entityType: 'Customer',
    riskScore: 0.92,
    severity: 'Critical',
    timestamp: '2026-10-02T11:29:00Z',
    timeAgo: '5m ago',
    description: 'Graph clustering detected 48 interconnected mule entities with high modularity score in Jamtara UPI Phishing Syndicate.',
    status: 'Open',
    assignedAnalyst: 'Aryan Mehra'
  },
  {
    id: 'ALT-1089',
    title: 'Impossible Travel Anomaly (Mumbai to Kolkata in 15m)',
    entityId: 'ACC-99213',
    entityType: 'Account',
    riskScore: 0.78,
    severity: 'Medium',
    timestamp: '2026-10-02T11:25:00Z',
    timeAgo: '9m ago',
    description: 'Account logged in from Kolkata 15 minutes after physical ATM withdrawal in Mumbai (effective speed > 5,000 km/h).',
    status: 'Open',
    assignedAnalyst: 'Aryan Mehra'
  }
];

export const INITIAL_INVESTIGATIONS: InvestigationCase[] = [
  {
    id: 'INV-2026-9042',
    title: 'Jamtara UPI Smurfing & Mule Ring in ACC-78291',
    primaryEntityId: 'ACC-78291',
    riskScore: 0.92,
    status: 'In Review',
    priority: 'Critical',
    assignedAnalyst: 'Aryan Mehra',
    createdDate: '2026-10-02 10:15 IST',
    lastUpdated: '5m ago',
    summary: 'Multi-hop UPI laundering ring utilizing synthetic customer profiles, rooted Android emulators, and Mewat proxy IP nodes to route ₹12,84,300 across 12 e-commerce merchants and P2P virtual payment gateways.',
    keyFindings: [
      'Account opened with forged PAN/Aadhaar document match probability 0.94',
      'OnePlus device DEV-9921 tied to 4 distinct customer accounts in past 48 hours',
      'Immediate cash-out via Razorpay & PayTM gateways following large inbound IMPS credits',
      'Graph centrality metrics place ACC-78291 as primary hub for Cluster CL-001'
    ],
    evidenceEntities: ['ACC-78291', 'CUST-4481', 'DEV-9921', 'IP-185-220', 'TXN-784923', 'MERCH-4091'],
    timeline: [
      { time: '10:15 IST', event: 'Anomaly triggered by XGBoost Indian Banking Model (Score 0.92)', user: 'Risk Engine', type: 'system' },
      { time: '10:22 IST', event: 'Case auto-opened and routed to FIU-IND Priority Triage Queue', user: 'Rule Engine', type: 'alert' },
      { time: '10:45 IST', event: 'Analyst Aryan Mehra assigned and initiated 3D graph exploration', user: 'Aryan Mehra', type: 'analyst' },
      { time: '11:15 IST', event: 'GraphSAGE GNN isolated 48-node Jamtara syndicate ring topology', user: 'AI Forensic Core', type: 'ai' }
    ],
    notes: [
      {
        id: 'n1',
        author: 'Aryan Mehra',
        timestamp: '11:10 IST',
        content: 'Placed debit freeze on HDFC Account ACC-78291 under Section 102 CrPC. Drafted STR (Suspicious Transaction Report) for Financial Intelligence Unit - India (FIU-IND) and reported to National Cybercrime Helpline (1930).'
      }
    ]
  }
];

export const MODEL_METRICS: ModelMetric[] = [
  {
    id: 'MDL-XGB-24',
    name: 'NPCI UPI Anomaly Classifier (XGBoost)',
    version: 'v2.4.1-prod',
    type: 'Supervised',
    dataset: 'NPCI UPI Real-Time Fraud Benchmark (1.4M transactions)',
    trainingDate: '2026-09-28',
    precision: 0.962,
    recall: 0.941,
    f1: 0.951,
    prAuc: 0.978,
    rocAuc: 0.994,
    status: 'Production',
    latencyMs: 3.8,
    confusionMatrix: {
      truePositive: 4620,
      falsePositive: 182,
      trueNegative: 279400,
      falseNegative: 290
    },
    featureImportance: [
      { feature: 'upi_velocity_1h', importance: 0.28 },
      { feature: 'sim_binding_trust_score', importance: 0.22 },
      { feature: 'inter_state_distance_ratio', importance: 0.17 },
      { feature: 'proxy_mewat_risk', importance: 0.14 },
      { feature: 'merchant_mcc_fraud_rate', importance: 0.11 },
      { feature: 'account_age_days', importance: 0.08 }
    ],
    description: 'Primary real-time inference model optimizing for UPI and IMPS fraud prevention with sub-4ms latency.'
  },
  {
    id: 'MDL-GNN-SAGE',
    name: 'Indian Banking GraphSAGE GNN',
    version: 'v2.1.0',
    type: 'Graph Neural Net',
    dataset: 'I4C Cybercrime HeteroGraph (1.2M nodes)',
    trainingDate: '2026-09-25',
    precision: 0.948,
    recall: 0.965,
    f1: 0.956,
    prAuc: 0.969,
    rocAuc: 0.989,
    status: 'Production',
    latencyMs: 14.8,
    confusionMatrix: {
      truePositive: 4740,
      falsePositive: 260,
      trueNegative: 278900,
      falseNegative: 170
    },
    featureImportance: [
      { feature: '2_hop_mule_neighbor_risk', importance: 0.32 },
      { feature: 'subgraph_density', importance: 0.25 },
      { feature: 'eigenvector_centrality', importance: 0.20 },
      { feature: 'shared_device_degree', importance: 0.15 },
      { feature: 'bipartite_clustering_coeff', importance: 0.08 }
    ],
    description: 'Inductive node representation learning detecting multi-hop mule networks, shell companies, and circular transaction flows across Indian banks.'
  },
  {
    id: 'MDL-LGBM-03',
    name: 'IMPS/NEFT LightGBM Candidate',
    version: 'v3.3.0-rc2',
    type: 'Supervised',
    dataset: 'RBI Digital Payment Risk Stream (850k records)',
    trainingDate: '2026-09-30',
    precision: 0.958,
    recall: 0.938,
    f1: 0.948,
    prAuc: 0.972,
    rocAuc: 0.991,
    status: 'Challenger',
    latencyMs: 2.9,
    confusionMatrix: {
      truePositive: 4590,
      falsePositive: 201,
      trueNegative: 279320,
      falseNegative: 310
    },
    featureImportance: [
      { feature: 'amount_rolling_24h', importance: 0.26 },
      { feature: 'device_fingerprint_entropy', importance: 0.24 },
      { feature: 'pos_terminal_frequency', importance: 0.19 },
      { feature: 'mcc_risk_tier', importance: 0.18 },
      { feature: 'ip_asn_reputation', importance: 0.13 }
    ],
    description: 'Fast leaf-wise gradient boosting candidate running in shadow mode with ultra-low 2.9ms P99 inference latency.'
  },
  {
    id: 'MDL-ISO-FOREST',
    name: 'Isolation Forest Anomaly Core',
    version: 'v1.4.2',
    type: 'Unsupervised',
    dataset: 'Unlabeled Indian Payment Stream (5M events)',
    trainingDate: '2026-10-01',
    precision: 0.884,
    recall: 0.912,
    f1: 0.898,
    prAuc: 0.902,
    rocAuc: 0.945,
    status: 'Production',
    latencyMs: 2.8,
    confusionMatrix: {
      truePositive: 4320,
      falsePositive: 567,
      trueNegative: 278600,
      falseNegative: 420
    },
    featureImportance: [
      { feature: 'multidimensional_mahalanobis', importance: 0.35 },
      { feature: 'time_between_txns_delta', importance: 0.29 },
      { feature: 'location_speed_vector', importance: 0.22 },
      { feature: 'payload_entropy', importance: 0.14 }
    ],
    description: 'Zero-day unknown fraud discovery mechanism isolating behavioral outliers without requiring historical labeled training samples.'
  }
];

export const GEOGRAPHIC_NODES: GeographicRiskNode[] = [
  { id: 'geo-mum', name: 'Mumbai', country: 'Maharashtra, India', coordinates: [19.0760, 72.8777], riskLevel: 'High', riskScore: 0.92, transactionCount: 421000, fraudCount: 8420, activeSyndicates: 4 },
  { id: 'geo-del', name: 'Delhi NCR', country: 'Delhi, India', coordinates: [28.6139, 77.2090], riskLevel: 'High', riskScore: 0.89, transactionCount: 384000, fraudCount: 7120, activeSyndicates: 5 },
  { id: 'geo-blr', name: 'Bengaluru', country: 'Karnataka, India', coordinates: [12.9716, 77.5946], riskLevel: 'Medium', riskScore: 0.68, transactionCount: 565400, fraudCount: 4100, activeSyndicates: 2 },
  { id: 'geo-jam', name: 'Jamtara', country: 'Jharkhand, India', coordinates: [23.9629, 86.8028], riskLevel: 'High', riskScore: 0.96, transactionCount: 38900, fraudCount: 6200, activeSyndicates: 6 },
  { id: 'geo-hyd', name: 'Hyderabad', country: 'Telangana, India', coordinates: [17.3850, 78.4867], riskLevel: 'Low', riskScore: 0.38, transactionCount: 252000, fraudCount: 940, activeSyndicates: 1 },
  { id: 'geo-mew', name: 'Mewat / Nuh', country: 'Haryana, India', coordinates: [28.1130, 77.0010], riskLevel: 'High', riskScore: 0.91, transactionCount: 29400, fraudCount: 5120, activeSyndicates: 4 },
  { id: 'geo-kol', name: 'Kolkata', country: 'West Bengal, India', coordinates: [22.5726, 88.3639], riskLevel: 'Medium', riskScore: 0.62, transactionCount: 178100, fraudCount: 2420, activeSyndicates: 2 },
  { id: 'geo-ahd', name: 'Ahmedabad', country: 'Gujarat, India', coordinates: [23.0225, 72.5714], riskLevel: 'Medium', riskScore: 0.58, transactionCount: 234100, fraudCount: 2980, activeSyndicates: 2 }
];

export const GEOGRAPHIC_ROUTES: GeographicRoute[] = [
  { id: 'r1', fromName: 'Jamtara', toName: 'Mumbai', fromCoords: [23.9629, 86.8028], toCoords: [19.0760, 72.8777], riskLevel: 'High', volume: 8420000 },
  { id: 'r2', fromName: 'Mewat', toName: 'Delhi NCR', fromCoords: [28.1130, 77.0010], toCoords: [28.6139, 77.2090], riskLevel: 'High', volume: 6204000 },
  { id: 'r3', fromName: 'Bengaluru', toName: 'Hyderabad', fromCoords: [12.9716, 77.5946], toCoords: [17.3850, 78.4867], riskLevel: 'Medium', volume: 4190000 },
  { id: 'r4', fromName: 'Mumbai', toName: 'Kolkata (Hawala Ring)', fromCoords: [19.0760, 72.8777], toCoords: [22.5726, 88.3639], riskLevel: 'High', volume: 12400000 },
  { id: 'r5', fromName: 'Ahmedabad', toName: 'Surat', fromCoords: [23.0225, 72.5714], toCoords: [21.1702, 72.8311], riskLevel: 'Low', volume: 2180000 }
];

export const RISK_TREND_DATA = [
  { month: 'Jan', normal: 18.2, risk: 2.1 },
  { month: 'Feb', normal: 21.4, risk: 2.8 },
  { month: 'Mar', normal: 19.8, risk: 2.4 },
  { month: 'Apr', normal: 24.5, risk: 3.6 },
  { month: 'May', normal: 22.1, risk: 3.1 },
  { month: 'Jun', normal: 27.8, risk: 4.8 },
  { month: 'Jul', normal: 26.4, risk: 4.2 }
];
