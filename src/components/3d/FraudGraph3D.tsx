import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EntityType, RiskLevel, GraphNode, GraphEdge } from '../../types/fraud';
import { 
  Maximize2, 
  Search, 
  X,
  Layers,
  Crosshair,
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';
import { createStudioHDRI, createPbrNoiseMap } from './environmentMap';
import { 
  createCentralCubeTexture, 
  createEarthTexture, 
  createServerBladeTexture, 
  createCoinTokenTexture, 
  createPedestalRingTexture 
} from './proceduralTextures';

// Crisp text sprite with crisp typography & clear offset
function createLabelSprite(text: string, isCentral: boolean = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.font = isCentral ? 'bold 36px "Inter", system-ui, sans-serif' : 'bold 30px "Inter", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // High contrast drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 12;
  
  // Gradient text fill for central node
  if (isCentral) {
    const grad = ctx.createLinearGradient(128, 0, 384, 0);
    grad.addColorStop(0, '#fca5a5');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, '#fca5a5');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#ffffff';
  }
  
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(isCentral ? 2.3 : 1.8, isCentral ? 0.58 : 0.45, 1);
  sprite.position.y = isCentral ? -1.35 : -1.15;
  return sprite;
}

// 1. Hyperrealistic Central Red Nexus (Multi-layer Crystal Hypercube with PBR Transmission, Gyro Rings, and Core)
function buildHyperrealisticCentralNexus(envMap: THREE.Texture): { group: THREE.Group; update: (t: number) => void } {
  const group = new THREE.Group();
  const cubeTex = createCentralCubeTexture();

  // 1.1 Outer Translucent Ruby Crystal Facet with PBR Clearcoat & Glass Transmission
  const crystalGeo = new THREE.BoxGeometry(1.22, 1.22, 1.22);
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xff1e27,
    emissive: 0x880808,
    emissiveIntensity: 0.5,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.6,
    ior: 1.55,
    thickness: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMap: envMap,
    transparent: true,
    opacity: 0.88
  });
  const crystalCube = new THREE.Mesh(crystalGeo, crystalMat);
  group.add(crystalCube);

  // 1.2 Textured Circuit Face Panels (Overlay with Shield Logo)
  const faceGeo = new THREE.PlaneGeometry(1.18, 1.18);
  const faceMat = new THREE.MeshStandardMaterial({
    map: cubeTex,
    transparent: true,
    opacity: 0.95,
    roughness: 0.15,
    metalness: 0.8,
    emissive: 0x991b1b,
    emissiveIntensity: 0.4,
    envMap: envMap
  });
  
  // Front face
  const frontFace = new THREE.Mesh(faceGeo, faceMat);
  frontFace.position.z = 0.615;
  group.add(frontFace);

  // Back face
  const backFace = new THREE.Mesh(faceGeo, faceMat);
  backFace.position.z = -0.615;
  backFace.rotation.y = Math.PI;
  group.add(backFace);

  // 1.3 Holographic Gold Wireframe Bevel Cage
  const wireGeo = new THREE.BoxGeometry(1.36, 1.36, 1.36);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffe4e6,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });
  const wireCube = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireCube);

  // 1.4 Internal Superheated Laser Plasma Core
  const coreGeo = new THREE.OctahedronGeometry(0.52, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff0022,
    emissiveIntensity: 3.5,
    roughness: 0.1,
    metalness: 0.95,
    envMap: envMap
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // 1.5 Gimbal Gyroscope Energy Rings (Aerospace Grade Titanium with Ruby Neon Tracer)
  const gyroMat1 = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0xef4444,
    emissiveIntensity: 0.8,
    metalness: 0.95,
    roughness: 0.15,
    envMap: envMap
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.024, 16, 64), gyroMat1);
  ring1.rotation.x = Math.PI / 2.2;
  group.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.018, 16, 64), new THREE.MeshBasicMaterial({ color: 0xff8888, transparent: true, opacity: 0.8 }));
  ring2.rotation.y = Math.PI / 2.4;
  group.add(ring2);

  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.014, 16, 64), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.6 }));
  ring3.rotation.z = Math.PI / 3;
  group.add(ring3);

  // 1.6 Ground Projection Holographic Radar Disc
  const discTex = createPedestalRingTexture('#ef4444');
  const discMat = new THREE.MeshBasicMaterial({
    map: discTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.85;
  group.add(disc);

  return {
    group,
    update: (t: number) => {
      wireCube.rotation.y += 0.006;
      wireCube.rotation.x += 0.003;
      core.rotation.y -= 0.018;
      core.rotation.z += 0.012;
      ring1.rotation.z += 0.014;
      ring2.rotation.y -= 0.011;
      ring3.rotation.x += 0.009;
      disc.rotation.z += 0.004;
      
      // Core pulsating emission
      coreMat.emissiveIntensity = 2.8 + Math.sin(t * 4) * 1.4;
      crystalMat.emissiveIntensity = 0.4 + Math.sin(t * 3) * 0.25;
    }
  };
}

// 2. Hyperrealistic Biometric Customer Bust (Polished Chrome & Frosted Glass with Scanning Halo)
function buildHyperrealisticCustomerMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    metalness: 0.92,
    roughness: 0.12,
    envMap: envMap
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transmission: 0.7,
    ior: 1.48,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    envMap: envMap,
    transparent: true,
    opacity: 0.9
  });

  // Frosted Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), glassMat);
  head.position.y = 0.42;
  group.add(head);

  // Chrome Core within Head
  const brain = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), chromeMat);
  brain.position.y = 0.42;
  group.add(brain);

  // Floating Quantum Scanning Halo
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.02, 16, 48), haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.82;
  group.add(halo);

  // Chrome Sculpted Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 0.55, 32), chromeMat);
  torso.position.y = -0.06;
  group.add(torso);

  // Polished Refractive Pedestal
  const baseTex = createPedestalRingTexture('#38bdf8');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.62, 0.08, 32), chromeMat);
  base.position.y = -0.38;
  group.add(base);

  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.42;
  group.add(ringDisc);

  return group;
}

// 3. Hyperrealistic Server Blade / Hardware Node (Titanium Chassis, Vent Grilles, Blinking LEDs)
function buildHyperrealisticDeviceMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x3b0764,
    emissive: 0x2e1065,
    emissiveIntensity: 0.35,
    metalness: 0.94,
    roughness: 0.18,
    envMap: envMap
  });

  const bladeTex = createServerBladeTexture();

  // Server Tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.88, 0.62), chassisMat);
  group.add(tower);

  // Front Fascia with Micro Ventilation Grilles
  const frontPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.86),
    new THREE.MeshStandardMaterial({ map: bladeTex, metalness: 0.8, roughness: 0.2, envMap: envMap })
  );
  frontPlane.position.z = 0.315;
  group.add(frontPlane);

  // Floating Cybernetic Antenna Array
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), new THREE.MeshBasicMaterial({ color: 0xc084fc }));
  antenna.position.set(0.18, 0.55, -0.15);
  group.add(antenna);

  const baseTex = createPedestalRingTexture('#a855f7');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.08, 32), chassisMat);
  base.position.y = -0.48;
  group.add(base);

  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.52;
  group.add(ringDisc);

  return group;
}

// 4. Hyperrealistic Transaction Bullion Coins (Mirror Finish 24K Gold with Orbiting Energy Rings)
function buildHyperrealisticTransactionMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.5,
    metalness: 0.98,
    roughness: 0.08,
    envMap: envMap
  });

  const coinTex = createCoinTokenTexture();

  // Stack of 4 Minted Coins with Laser Reeding
  const coinGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.09, 48);
  for (let i = 0; i < 4; i++) {
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.position.y = -0.18 + i * 0.12;
    coin.rotation.y = i * 0.5;
    
    // Coin Top Emboss
    const topCap = new THREE.Mesh(new THREE.CircleGeometry(0.43, 32), new THREE.MeshStandardMaterial({ map: coinTex, metalness: 0.95, roughness: 0.1, envMap: envMap }));
    topCap.rotation.x = -Math.PI / 2;
    topCap.position.y = 0.046;
    coin.add(topCap);

    group.add(coin);
  }

  // Orbiting Golden Energy Arcs
  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 16, 48), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
  aura.rotation.x = Math.PI / 2.2;
  aura.position.y = 0.08;
  group.add(aura);

  const baseTex = createPedestalRingTexture('#eab308');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.08, 32), goldMat);
  base.position.y = -0.4;
  group.add(base);

  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.44;
  group.add(ringDisc);

  return group;
}

// 5. Hyperrealistic Emerald Merchant Storefront (Refractive Emerald Glass & Illuminated Plinth)
function buildHyperrealisticMerchantMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const emeraldMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.5,
    metalness: 0.88,
    roughness: 0.15,
    envMap: envMap
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x6ee7b7,
    transmission: 0.75,
    ior: 1.5,
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1.0,
    envMap: envMap,
    transparent: true,
    opacity: 0.85
  });

  // Store Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.55, 0.55), emeraldMat);
  body.position.y = -0.06;
  group.add(body);

  // Large Refractive Display Window
  const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.36), glassMat);
  windowPane.position.set(0, -0.06, 0.285);
  group.add(windowPane);

  // Neon Awning Canopy
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.32, 4), new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.2,
    envMap: envMap
  }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.36;
  group.add(roof);

  const baseTex = createPedestalRingTexture('#10b981');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.08, 32), emeraldMat);
  base.position.y = -0.38;
  group.add(base);

  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.42;
  group.add(ringDisc);

  return group;
}

// 6. Hyperrealistic Global Earth Location (Procedural Ocean Texture, Atmosphere Glow & Precision Laser Pin)
function buildHyperrealisticLocationMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const earthTex = createEarthTexture();

  // High-Resolution Textured Earth
  const globeGeo = new THREE.SphereGeometry(0.44, 48, 48);
  const globeMat = new THREE.MeshStandardMaterial({
    map: earthTex,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x0369a1,
    emissiveIntensity: 0.45,
    envMap: envMap
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  group.add(globe);

  // Atmospheric Scattering Outer Halo
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
    side: THREE.BackSide
  });
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(0.49, 32, 32), atmoMat);
  group.add(atmo);

  // Precision 3D Laser Location Pin
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  pinHead.position.set(0, 0.78, 0.08);
  group.add(pinHead);

  const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  pinCone.rotation.x = Math.PI;
  pinCone.position.set(0, 0.62, 0.08);
  group.add(pinCone);

  const baseTex = createPedestalRingTexture('#06b6d4');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.64, 0.08, 32), globeMat);
  base.position.y = -0.48;
  group.add(base);

  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.52;
  group.add(ringDisc);

  return group;
}

// 7. Hyperrealistic IP Server Blade (Crimson Alert Anodized Metal with Live Optical Ports)
function buildHyperrealisticIPServerMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x991b1b,
    emissiveIntensity: 0.5,
    metalness: 0.95,
    roughness: 0.15,
    envMap: envMap
  });

  for (let i = -0.22; i <= 0.22; i += 0.22) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.16, 0.6), redMat);
    blade.position.y = i;
    group.add(blade);

    // Blinking Optic Ports
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.03), new THREE.MeshBasicMaterial({ color: 0xfecaca }));
    port.position.set(0.18, i, 0.31);
    group.add(port);
  }

  const baseTex = createPedestalRingTexture('#ef4444');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.08, 32), redMat);
  base.position.y = -0.42;
  group.add(base);

  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.46;
  group.add(ringDisc);

  return group;
}

// 8. Hyperrealistic Classical Bank Vault (Polished Mirror Columns & Illuminated Chamber)
function buildHyperrealisticBankMesh(envMap: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const bankMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.55,
    metalness: 0.92,
    roughness: 0.12,
    envMap: envMap
  });

  // Plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.09, 0.58), bankMat);
  plinth.position.y = -0.3;
  group.add(plinth);

  // 4 Fluted Classical Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.46, 24);
  const xOffsets = [-0.26, -0.09, 0.09, 0.26];
  xOffsets.forEach(x => {
    const pillar = new THREE.Mesh(pillarGeo, bankMat);
    pillar.position.set(x, -0.03, 0.14);
    group.add(pillar);
  });

  // Pediment Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.28, 4), bankMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.32;
  group.add(roof);

  const baseTex = createPedestalRingTexture('#0284c7');
  const ringDisc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: baseTex, transparent: true, side: THREE.DoubleSide }));
  ringDisc.rotation.x = -Math.PI / 2;
  ringDisc.position.y = -0.36;
  group.add(ringDisc);

  return group;
}

interface FraudGraph3DProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onOpenFullProfile?: () => void;
}

interface NodeForensics {
  id: string;
  name: string;
  badge: string;
  badgeBg: string;
  accountType: string;
  customerId: string;
  riskScore: string;
  totalTransactions: string;
  totalAmount: string;
  linkedDevices: string;
  linkedIps: string;
  linkedMerchants: string;
  type: EntityType;
  risk: RiskLevel;
}

const ENTITY_DETAILS_MAP: Record<string, NodeForensics> = {
  'ACC-78291': {
    id: 'ACC-78291',
    name: 'High Risk Account',
    badge: 'High Risk',
    badgeBg: 'bg-[#EF4444]',
    accountType: 'Personal',
    customerId: 'CUST-4481',
    riskScore: '0.92',
    totalTransactions: '243',
    totalAmount: '$128,430',
    linkedDevices: '4',
    linkedIps: '6',
    linkedMerchants: '12',
    type: 'Account',
    risk: 'Critical'
  },
  'CUST-4481': {
    id: 'CUST-4481',
    name: 'Customer Profile',
    badge: 'High Risk',
    badgeBg: 'bg-[#EF4444]',
    accountType: 'Individual Primary',
    customerId: 'CUST-4481',
    riskScore: '0.88',
    totalTransactions: '189',
    totalAmount: '$94,200',
    linkedDevices: '3',
    linkedIps: '4',
    linkedMerchants: '8',
    type: 'Customer',
    risk: 'Critical'
  },
  'DEV-9921': {
    id: 'DEV-9921',
    name: 'Suspicious Device',
    badge: 'High Risk',
    badgeBg: 'bg-[#EF4444]',
    accountType: 'Android 13 / Samsung S23',
    customerId: 'CUST-4481',
    riskScore: '0.94',
    totalTransactions: '76',
    totalAmount: '$61,400',
    linkedDevices: '1',
    linkedIps: '5',
    linkedMerchants: '6',
    type: 'Device',
    risk: 'Critical'
  },
  'TXN-784923': {
    id: 'TXN-784923',
    name: 'Flagged Transaction',
    badge: 'High Risk',
    badgeBg: 'bg-[#EF4444]',
    accountType: 'Card-Not-Present E-Com',
    customerId: 'CUST-4481',
    riskScore: '0.92',
    totalTransactions: '1',
    totalAmount: '$2,450.00',
    linkedDevices: '2',
    linkedIps: '1',
    linkedMerchants: '1',
    type: 'Transaction',
    risk: 'Critical'
  },
  'MERCH-4091': {
    id: 'MERCH-4091',
    name: 'High-Risk Merchant',
    badge: 'Medium Risk',
    badgeBg: 'bg-[#F97316]',
    accountType: 'CryptoEx Digital Liquidity',
    customerId: 'MERCH-4091',
    riskScore: '0.76',
    totalTransactions: '1,420',
    totalAmount: '$840,000',
    linkedDevices: '18',
    linkedIps: '32',
    linkedMerchants: '1',
    type: 'Merchant',
    risk: 'High'
  },
  'LOC-NY': {
    id: 'LOC-NY',
    name: 'Geographic Hotspot',
    badge: 'Medium Risk',
    badgeBg: 'bg-[#F97316]',
    accountType: 'Location Node - New York',
    customerId: 'CUST-4481',
    riskScore: '0.72',
    totalTransactions: '42',
    totalAmount: '$38,200',
    linkedDevices: '3',
    linkedIps: '4',
    linkedMerchants: '6',
    type: 'Location',
    risk: 'High'
  },
  'IP-185-220': {
    id: 'IP-185-220',
    name: 'TOR Exit Node',
    badge: 'High Risk',
    badgeBg: 'bg-[#EF4444]',
    accountType: 'Anonymous Proxy IP',
    customerId: 'CUST-4481',
    riskScore: '0.96',
    totalTransactions: '118',
    totalAmount: '$74,500',
    linkedDevices: '8',
    linkedIps: '1',
    linkedMerchants: '14',
    type: 'IP Address',
    risk: 'Critical'
  },
  'ACC-VAULT': {
    id: 'ACC-VAULT',
    name: 'Linked Mule Account',
    badge: 'High Risk',
    badgeBg: 'bg-[#EF4444]',
    accountType: 'Commercial Escrow Account',
    customerId: 'CUST-8832',
    riskScore: '0.89',
    totalTransactions: '194',
    totalAmount: '$112,000',
    linkedDevices: '3',
    linkedIps: '5',
    linkedMerchants: '9',
    type: 'Account',
    risk: 'Critical'
  }
};

export const FraudGraph3D: React.FC<FraudGraph3DProps> = ({
  selectedNodeId,
  onSelectNode,
  onOpenFullProfile
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<EntityType[]>([
    'Customer', 'Account', 'Transaction', 'Device', 'Merchant', 'IP Address', 'Location'
  ]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('All Levels');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [searchEntityText, setSearchEntityText] = useState('');

  // Floating Panel Visibility States (with close buttons matching screenshot)
  const [showEntityTypeCard, setShowEntityTypeCard] = useState(true);
  const [showRiskLevelCard, setShowRiskLevelCard] = useState(true);
  const [showTimeRangeCard, setShowTimeRangeCard] = useState(true);
  const [showAccountDetails, setShowAccountDetails] = useState(true);

  // Active Selected Entity for the Right Details Card
  const [activeEntityId, setActiveEntityId] = useState<string>(selectedNodeId || 'ACC-78291');

  // Three.js References for Interactive Controls
  const graphGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshMapRef = useRef<Map<string, { group: THREE.Group; tube: THREE.Mesh; packet: THREE.Mesh; type: EntityType; risk: RiskLevel }>>(new Map());
  const showLayersRef = useRef<boolean>(true);

  const currentDetails = ENTITY_DETAILS_MAP[activeEntityId] || ENTITY_DETAILS_MAP['ACC-78291'];

  // Sync selectedNodeId prop
  useEffect(() => {
    if (selectedNodeId && ENTITY_DETAILS_MAP[selectedNodeId]) {
      setActiveEntityId(selectedNodeId);
      setShowAccountDetails(true);
    }
  }, [selectedNodeId]);

  // Update 3D node visibility when filters change
  useEffect(() => {
    nodeMeshMapRef.current.forEach((item) => {
      const typeMatches = selectedEntityTypes.includes(item.type);
      let riskMatches = true;

      if (selectedRiskLevel === 'High Risk') {
        riskMatches = item.risk === 'Critical';
      } else if (selectedRiskLevel === 'Medium Risk') {
        riskMatches = item.risk === 'High' || item.risk === 'Medium';
      } else if (selectedRiskLevel === 'Low Risk') {
        riskMatches = item.risk === 'Low';
      }

      const isVisible = typeMatches && riskMatches;
      item.group.visible = isVisible;
      item.tube.visible = isVisible;
      item.packet.visible = isVisible;
    });
  }, [selectedEntityTypes, selectedRiskLevel]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04070e);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 10.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Generate Studio PBR Environment Map
    const envMap = createStudioHDRI(renderer);
    scene.environment = envMap;

    // Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-8, -4, -6);
    scene.add(rimLight);

    const centralRubyLight = new THREE.PointLight(0xff1122, 8, 30);
    centralRubyLight.position.set(0, 0, 1.5);
    scene.add(centralRubyLight);

    // Cyber Starfield Particles (350+ Points)
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;

      const isCyan = Math.random() > 0.45;
      particleColors[i * 3] = isCyan ? 0.22 : 0.95;
      particleColors[i * 3 + 1] = isCyan ? 0.74 : 0.25;
      particleColors[i * 3 + 2] = isCyan ? 0.97 : 0.25;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const starfield = new THREE.Points(particleGeo, particleMat);
    scene.add(starfield);

    // Floor Cyber Holographic Grid Group
    const gridGroup = new THREE.Group();
    gridGroup.position.set(0, -0.45, -0.6);
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // Floor Concentric Web Rings
    for (let r = 0.9; r <= 4.4; r += 0.7) {
      const circleGeo = new THREE.RingGeometry(r - 0.012, r, 64);
      const circleMat = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(circleGeo, circleMat);
      ring.rotation.x = Math.PI / 2.3;
      gridGroup.add(ring);
    }

    // Floor Radial Scanning Lines
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 4.6, 0, Math.sin(angle) * 4.6)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.4 });
      const line = new THREE.Line(lineGeo, lineMat);
      line.rotation.x = Math.PI / 2.3;
      gridGroup.add(line);
    }

    // Graph Root Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);
    graphGroupRef.current = graphGroup;

    const animList: ((t: number) => void)[] = [];
    nodeMeshMapRef.current.clear();

    // --- 1. BUILD HYPERREALISTIC CENTRAL RED NEXUS ---
    const centralNexus = buildHyperrealisticCentralNexus(envMap);
    centralNexus.group.position.set(0, -0.05, 0);
    centralNexus.group.userData = { nodeId: 'ACC-78291' };
    const centralLabel = createLabelSprite('High Risk Account', true);
    centralNexus.group.add(centralLabel);
    graphGroup.add(centralNexus.group);
    animList.push(centralNexus.update);

    // --- 2. BUILD THE 7 HYPERREALISTIC SURROUNDING ENTITY NODES ---
    const outerNodes: { id: string; label: string; type: EntityType; risk: RiskLevel; pos: [number, number, number]; build: () => THREE.Group }[] = [
      { id: 'CUST-4481', label: 'Customer', type: 'Customer', risk: 'Critical', pos: [0, 2.25, 0], build: () => buildHyperrealisticCustomerMesh(envMap) },
      { id: 'DEV-9921', label: 'Device', type: 'Device', risk: 'Critical', pos: [1.9, 1.48, 0], build: () => buildHyperrealisticDeviceMesh(envMap) },
      { id: 'TXN-784923', label: 'Transaction', type: 'Transaction', risk: 'Critical', pos: [2.25, 0.18, 0], build: () => buildHyperrealisticTransactionMesh(envMap) },
      { id: 'MERCH-4091', label: 'Merchant', type: 'Merchant', risk: 'High', pos: [1.8, -1.38, 0], build: () => buildHyperrealisticMerchantMesh(envMap) },
      { id: 'LOC-NY', label: 'Location', type: 'Location', risk: 'High', pos: [0.38, -2.1, 0], build: () => buildHyperrealisticLocationMesh(envMap) },
      { id: 'IP-185-220', label: 'IP Address', type: 'IP Address', risk: 'Critical', pos: [-1.65, -1.48, 0], build: () => buildHyperrealisticIPServerMesh(envMap) },
      { id: 'ACC-VAULT', label: 'Account', type: 'Account', risk: 'Critical', pos: [-2.0, 0.88, 0], build: () => buildHyperrealisticBankMesh(envMap) }
    ];

    outerNodes.forEach((node) => {
      const nodeMesh = node.build();
      nodeMesh.position.set(node.pos[0], node.pos[1], node.pos[2]);
      nodeMesh.userData = { nodeId: node.id };

      // Tag all children for raycasting
      nodeMesh.traverse((child) => {
        child.userData = { nodeId: node.id };
      });

      const label = createLabelSprite(node.label, false);
      nodeMesh.add(label);
      graphGroup.add(nodeMesh);

      // Levitation Physics
      const initY = node.pos[1];
      const offset = Math.random() * Math.PI * 2;
      animList.push((t: number) => {
        const osc = t * 1.8 + offset;
        nodeMesh.position.y = initY + Math.sin(osc) * 0.04;
        nodeMesh.rotation.y = Math.sin(osc * 0.6) * 0.14;
      });

      // 3D Volumetric Glowing Laser Conduit
      const centralPos = new THREE.Vector3(0, -0.05, 0);
      const outerPos = new THREE.Vector3(node.pos[0], node.pos[1], node.pos[2]);
      const midPoint = new THREE.Vector3().addVectors(centralPos, outerPos).multiplyScalar(0.5);
      midPoint.z += 0.25;

      const curve = new THREE.CatmullRomCurve3([centralPos, midPoint, outerPos]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.016, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xff3344,
        transparent: true,
        opacity: 0.85
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      graphGroup.add(tube);

      // Flowing Photon Energy Packets
      const packetGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const packetMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      graphGroup.add(packet);

      let progress = Math.random();
      const speed = 0.007 + Math.random() * 0.006;
      animList.push(() => {
        progress = (progress + speed) % 1;
        const pt = curve.getPoint(1 - progress);
        packet.position.copy(pt);
      });

      // Save references for filter toggling
      nodeMeshMapRef.current.set(node.id, {
        group: nodeMesh,
        tube,
        packet,
        type: node.type,
        risk: node.risk
      });
    });

    // Smooth Drag Rotation & Click Raycasting
    let isDragging = false;
    let dragDistance = 0;
    let prevMouse = { x: 0, y: 0 };
    let startMouse = { x: 0, y: 0 };
    let animId: number;

    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDistance = 0;
      prevMouse = { x: e.clientX, y: e.clientY };
      startMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      graphGroup.rotation.y += dx * 0.004;
      graphGroup.rotation.x += dy * 0.004;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;

      // If user clicked without dragging, perform Raycast Node Selection
      if (dragDistance < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseCoord, camera);
        const intersects = raycaster.intersectObjects(graphGroup.children, true);

        if (intersects.length > 0) {
          let foundId: string | null = null;
          for (const hit of intersects) {
            let curr: THREE.Object3D | null = hit.object;
            while (curr && curr !== graphGroup) {
              if (curr.userData && curr.userData.nodeId) {
                foundId = curr.userData.nodeId;
                break;
              }
              curr = curr.parent;
            }
            if (foundId) break;
          }

          if (foundId && ENTITY_DETAILS_MAP[foundId]) {
            setActiveEntityId(foundId);
            setShowAccountDetails(true);
            onSelectNode(foundId);
          }
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation loop with continuous time
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Starfield slow drift
      starfield.rotation.y = elapsed * 0.015;

      if (!isDragging) {
        graphGroup.rotation.y = Math.sin(elapsed * 0.35) * 0.06;
      }

      animList.forEach(fn => fn(elapsed));
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      envMap.dispose();
      renderer.dispose();
    };
  }, [onSelectNode]);

  // Handle entity type checkbox toggle
  const toggleEntityType = (type: EntityType) => {
    setSelectedEntityTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Re-center 3D graph camera and rotation
  const handleResetCamera = () => {
    if (graphGroupRef.current) {
      graphGroupRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.1, 10.6);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  // Toggle visual layers (radar rings & labels)
  const handleToggleLayers = () => {
    showLayersRef.current = !showLayersRef.current;
    if (gridGroupRef.current) {
      gridGroupRef.current.visible = showLayersRef.current;
    }
  };

  // Toggle Fullscreen on container
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Entity search within 3D graph
  const handleSearchEntity = () => {
    const q = searchEntityText.trim().toLowerCase();
    if (!q) return;

    const match = Object.keys(ENTITY_DETAILS_MAP).find(id => {
      const ent = ENTITY_DETAILS_MAP[id];
      return id.toLowerCase().includes(q) ||
        ent.name.toLowerCase().includes(q) ||
        ent.type.toLowerCase().includes(q) ||
        ent.customerId.toLowerCase().includes(q);
    });

    if (match) {
      setActiveEntityId(match);
      setShowAccountDetails(true);
      onSelectNode(match);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[530px] lg:min-h-[570px] bg-[#04070e] select-none overflow-hidden rounded-xl border border-[#161E2E] shadow-2xl"
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ========================================================
          LEFT COLUMN FLOATING CARDS (Matching Screenshot Exactly)
          ======================================================== */}
      <div className="absolute top-4 left-4 flex flex-col gap-2.5 z-20 pointer-events-auto">

        {/* 1. Entity Type Card */}
        {showEntityTypeCard && (
          <div className="bg-[#0A0E18]/92 backdrop-blur-md border border-[#161E2E] rounded-xl p-3 shadow-xl w-44 text-xs transition-all animate-in fade-in">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-2 pb-1 border-b border-[#161E2E]">
              <span className="text-[11px] font-sans text-slate-200">Entity Type</span>
              <button
                type="button"
                onClick={() => setShowEntityTypeCard(false)}
                className="text-slate-500 hover:text-white transition-colors"
                title="Hide Entity Types"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                'Customer',
                'Account',
                'Transaction',
                'Device',
                'Merchant',
                'IP Address',
                'Location'
              ].map((type) => {
                const checked = selectedEntityTypes.includes(type as EntityType);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white text-[11px] select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEntityType(type as EntityType)}
                      className="w-3.5 h-3.5 rounded bg-[#101726] border-[#2A374F] text-[#6366F1] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#6366F1]"
                    />
                    <span className={checked ? 'text-slate-200' : 'text-slate-500'}>
                      {type}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Risk Level Card */}
        {showRiskLevelCard && (
          <div className="bg-[#0A0E18]/92 backdrop-blur-md border border-[#161E2E] rounded-xl p-3 shadow-xl w-44 text-xs transition-all animate-in fade-in">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-2 pb-1 border-b border-[#161E2E]">
              <span className="text-[11px] font-sans text-slate-200">Risk Level</span>
              <button
                type="button"
                onClick={() => setShowRiskLevelCard(false)}
                className="text-slate-500 hover:text-white transition-colors"
                title="Hide Risk Levels"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { id: 'All Levels', dotColor: 'bg-[#38BDF8]' },
                { id: 'High Risk', dotColor: 'bg-[#EF4444]' },
                { id: 'Medium Risk', dotColor: 'bg-[#F97316]' },
                { id: 'Low Risk', dotColor: 'bg-[#475569]' }
              ].map((lvl) => {
                const active = selectedRiskLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setSelectedRiskLevel(lvl.id)}
                    className={`w-full flex items-center gap-2 text-left text-[11px] py-1 px-1.5 rounded transition-colors ${
                      active ? 'text-white font-semibold bg-[#162032]' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${lvl.dotColor} shrink-0`} />
                    <span>{lvl.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Time Range Card */}
        {showTimeRangeCard && (
          <div className="bg-[#0A0E18]/92 backdrop-blur-md border border-[#161E2E] rounded-xl p-3 shadow-xl w-44 text-xs transition-all animate-in fade-in">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-2 pb-1 border-b border-[#161E2E]">
              <span className="text-[11px] font-sans text-slate-200">Time Range</span>
              <button
                type="button"
                onClick={() => setShowTimeRangeCard(false)}
                className="text-slate-500 hover:text-white transition-colors"
                title="Hide Time Range"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full bg-[#0E1422] border border-[#1C263A] hover:border-[#2C3B58] focus:border-[#38BDF8] rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none cursor-pointer"
              >
                <option value="Last 24 Hours">Last 24 Hours</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>
        )}

        {/* Restore Hidden Left Panels Button */}
        {(!showEntityTypeCard || !showRiskLevelCard || !showTimeRangeCard) && (
          <button
            type="button"
            onClick={() => {
              setShowEntityTypeCard(true);
              setShowRiskLevelCard(true);
              setShowTimeRangeCard(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#0E1422]/90 border border-[#1C263A] text-[10px] text-[#38BDF8] hover:bg-[#162032] transition-colors shadow-md w-fit"
          >
            + Show Left Filters
          </button>
        )}

      </div>

      {/* ========================================================
          TOP RIGHT CONTROLS HUD (Search + 3 Icon Buttons)
          ======================================================== */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2.5 z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          {/* Search Entities Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchEntityText}
              onChange={(e) => setSearchEntityText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchEntity();
                }
              }}
              className="w-48 bg-[#0A0E18]/92 backdrop-blur-md border border-[#1C263A] hover:border-[#2C3B58] focus:border-[#38BDF8] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* 3 Toolbar Icon Buttons */}
          <button
            type="button"
            onClick={handleToggleLayers}
            title="Toggle Visual Layers"
            className="p-1.5 rounded-lg bg-[#0A0E18]/92 backdrop-blur-md border border-[#1C263A] text-slate-400 hover:text-white hover:bg-[#141C2E] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            title="Re-center 3D Graph"
            className="p-1.5 rounded-lg bg-[#0A0E18]/92 backdrop-blur-md border border-[#1C263A] text-slate-400 hover:text-white hover:bg-[#141C2E] transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-[#0A0E18]/92 backdrop-blur-md border border-[#1C263A] text-slate-400 hover:text-white hover:bg-[#141C2E] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ========================================================
            RIGHT COLUMN FLOATING CARD: Account Details
            ======================================================== */}
        {showAccountDetails && (
          <div className="bg-[#0A0E18]/92 backdrop-blur-md border border-[#161E2E] rounded-xl p-3.5 shadow-2xl w-64 text-xs transition-all animate-in fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#161E2E] mb-2.5">
              <span className="font-semibold text-slate-200 text-xs">Account Details</span>
              <button
                type="button"
                onClick={() => setShowAccountDetails(false)}
                className="text-slate-500 hover:text-white transition-colors"
                title="Hide Details"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Entity ID & Risk Badge matching screenshot */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white tracking-wide font-mono">
                {currentDetails.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${currentDetails.badgeBg}`}>
                {currentDetails.badge}
              </span>
            </div>

            {/* Key-Value Metrics List */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Type</span>
                <span className="text-slate-200 font-medium">{currentDetails.accountType}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Customer ID</span>
                <span className="text-slate-200 font-medium font-mono">{currentDetails.customerId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Risk Score</span>
                <span className="text-[#EF4444] font-bold font-mono text-xs">{currentDetails.riskScore}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Transactions</span>
                <span className="text-slate-200 font-mono">{currentDetails.totalTransactions}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Amount</span>
                <span className="text-slate-100 font-mono font-semibold">{currentDetails.totalAmount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Linked Devices</span>
                <span className="text-slate-200 font-mono">{currentDetails.linkedDevices}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Linked IPs</span>
                <span className="text-slate-200 font-mono">{currentDetails.linkedIps}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Linked Merchants</span>
                <span className="text-slate-200 font-mono">{currentDetails.linkedMerchants}</span>
              </div>
            </div>

            {/* Blue View Full Profile Button */}
            <button
              type="button"
              onClick={onOpenFullProfile}
              className="w-full mt-3 py-2 bg-[#1D4ED8] hover:bg-[#2563EB] active:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center cursor-pointer"
            >
              View Full Profile
            </button>
          </div>
        )}

        {/* Restore Hidden Details Card Button */}
        {!showAccountDetails && (
          <button
            type="button"
            onClick={() => setShowAccountDetails(true)}
            className="px-2.5 py-1 rounded-lg bg-[#0E1422]/90 border border-[#1C263A] text-[10px] text-[#38BDF8] hover:bg-[#162032] transition-colors shadow-md"
          >
            + Show Account Details
          </button>
        )}

      </div>
    </div>
  );
};

