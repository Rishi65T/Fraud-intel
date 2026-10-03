export interface AnalystUser {
  id: string;
  name: string;
  email: string;
  role: string;
  clearanceLevel: 'Tier-1 Basic' | 'Tier-2 Investigator' | 'Tier-3 Senior Specialist' | 'Tier-4 Director / Admin';
  department: string;
  avatarUrl: string;
  badgeNumber: string;
  activeCasesCount: number;
  resolvedCasesCount: number;
  savedAmountFormatted: string;
  hardwareTokenId: string;
  ipAddress: string;
  lastLogin: string;
  facility: string;
}

export const DEMO_ANALYSTS: AnalystUser[] = [
  {
    id: 'ANL-9402',
    name: 'Alex Carter',
    email: 'alex.carter@fraudintel.soc',
    role: 'Senior Fraud Analyst',
    clearanceLevel: 'Tier-3 Senior Specialist',
    department: 'Syndicate & Cross-Border Financial Crime',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    badgeNumber: 'FCU-TX-8821',
    activeCasesCount: 4,
    resolvedCasesCount: 142,
    savedAmountFormatted: '$4,280,000',
    hardwareTokenId: 'YubiKey-5C-NFC-9912',
    ipAddress: '192.168.1.42 (Encrypted VPN)',
    lastLogin: 'Today at 08:30 AM',
    facility: 'Global Cyber Defense SOC - Hub Alpha'
  },
  {
    id: 'ANL-8105',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@fraudintel.soc',
    role: 'Lead Graph ML Scientist',
    clearanceLevel: 'Tier-4 Director / Admin',
    department: 'Neural Network Crime Forensics & Threat Hunting',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    badgeNumber: 'ML-DIR-4490',
    activeCasesCount: 2,
    resolvedCasesCount: 310,
    savedAmountFormatted: '$14,920,000',
    hardwareTokenId: 'Titan-Titanium-FIDO2-004',
    ipAddress: '10.240.12.8 (Airgapped Core)',
    lastLogin: 'Today at 07:15 AM',
    facility: 'AI Threat Intelligence Lab - Geneva'
  },
  {
    id: 'ANL-7720',
    name: 'Marcus Vance',
    email: 'marcus.vance@fraudintel.soc',
    role: 'Chief Risk Officer',
    clearanceLevel: 'Tier-4 Director / Admin',
    department: 'Executive Financial Compliance & AML Governance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    badgeNumber: 'CRO-GOV-1001',
    activeCasesCount: 1,
    resolvedCasesCount: 520,
    savedAmountFormatted: '$38,500,000',
    hardwareTokenId: 'RSA-SecurID-Airgap-88',
    ipAddress: '172.16.0.5 (Executive Terminal)',
    lastLogin: 'Yesterday at 06:45 PM',
    facility: 'Enterprise Risk HQ - New York'
  }
];
