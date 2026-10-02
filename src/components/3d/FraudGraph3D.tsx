import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EntityType, RiskLevel, GraphNode, GraphEdge } from '../../types/fraud';
import { 
  Maximize2, 
  Search, 
  X,
  Layers,
  Crosshair
} from 'lucide-react';

// Crisp text sprite with crisp typography & clear offset
function createLabelSprite(text: string, isCentral: boolean = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.font = isCentral ? 'bold 34px Inter, system-ui, sans-serif' : 'bold 30px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(isCentral ? 2.1 : 1.7, isCentral ? 0.52 : 0.42, 1);
  sprite.position.y = isCentral ? -1.25 : -1.05;
  return sprite;
}

// 1. Procedural 3D Central Red Cube Nexus
function buildCentralNexusMesh(): { group: THREE.Group; update: () => void } {
  const group = new THREE.Group();

  // Outer Translucent Crimson Crystal Cube
  const outerCubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const outerCubeMat = new THREE.MeshPhysicalMaterial({
    color: 0xef4444,
    emissive: 0x991b1b,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.8,
    transmission: 0.4,
    transparent: true,
    opacity: 0.85
  });
  const outerCube = new THREE.Mesh(outerCubeGeo, outerCubeMat);
  group.add(outerCube);

  // Holographic Wireframe Cage
  const wireGeo = new THREE.BoxGeometry(1.35, 1.35, 1.35);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const wireCube = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireCube);

  // Inner Glowing Octahedron Core
  const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xff2222,
    emissiveIntensity: 2.0,
    roughness: 0.2,
    metalness: 0.9
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Rotating Concentric Cyber Energy Rings
  const ring1Geo = new THREE.TorusGeometry(1.1, 0.02, 16, 64);
  const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.8 });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 2.2;
  group.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(1.28, 0.015, 16, 64);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff6666, transparent: true, opacity: 0.6 });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 2.5;
  group.add(ring2);

  // Pedestal Glow Disc
  const glowGeo = new THREE.RingGeometry(0.7, 1.45, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = Math.PI / 2;
  glow.position.y = -0.75;
  group.add(glow);

  return {
    group,
    update: () => {
      wireCube.rotation.y += 0.008;
      wireCube.rotation.x += 0.004;
      core.rotation.y -= 0.015;
      core.rotation.z += 0.01;
      ring1.rotation.z += 0.012;
      ring2.rotation.z -= 0.009;
    }
  };
}

// 2. Procedural 3D Customer Bust
function buildCustomerMesh(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.7,
    roughness: 0.15,
    metalness: 0.85
  });

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), mat);
  head.position.y = 0.4;
  group.add(head);

  // Floating Halo
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 16, 32), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }));
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.78;
  group.add(halo);

  // Torso / Shoulders
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.48, 0.52, 24), mat);
  torso.position.y = -0.08;
  group.add(torso);

  // Base Pedestal
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 24), mat);
  base.position.y = -0.38;
  group.add(base);

  return group;
}

// 3. Procedural 3D Purple Server Device
function buildDeviceMesh(): THREE.Group {
  const group = new THREE.Group();
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x581c87,
    emissive: 0x3b0764,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.9
  });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });

  // Main Server Tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.82, 0.6), chassisMat);
  group.add(tower);

  // Vertical RGB Drive Strips
  for (let i = -0.25; i <= 0.25; i += 0.16) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.02), ledMat);
    strip.position.set(0, i, 0.31);
    group.add(strip);
  }

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 24), chassisMat);
  base.position.y = -0.45;
  group.add(base);

  return group;
}

// 4. Procedural 3D Golden Transaction Coins
function buildTransactionMesh(): THREE.Group {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.95
  });

  // Stack of 4 Gold Coins
  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 32);
  for (let i = 0; i < 4; i++) {
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.position.y = -0.16 + i * 0.13;
    coin.rotation.y = i * 0.4;
    group.add(coin);
  }

  // Energy Aura Ring
  const aura = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.02, 16, 32), new THREE.MeshBasicMaterial({ color: 0xfde047 }));
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.05;
  group.add(aura);

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 24), goldMat);
  base.position.y = -0.38;
  group.add(base);

  return group;
}

// 5. Procedural 3D Emerald Merchant Shop
function buildMerchantMesh(): THREE.Group {
  const group = new THREE.Group();
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x047857,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.8
  });

  // Building Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.52, 0.52), greenMat);
  body.position.y = -0.08;
  group.add(body);

  // Striped Awning Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.3, 4), new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x059669,
    emissiveIntensity: 0.6,
    roughness: 0.3
  }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.32;
  group.add(roof);

  // Front Window
  const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.25), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 }));
  windowPane.position.set(0, -0.08, 0.27);
  group.add(windowPane);

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.08, 24), greenMat);
  base.position.y = -0.38;
  group.add(base);

  return group;
}

// 6. Procedural 3D Earth Globe with Map Pin
function buildLocationMesh(): THREE.Group {
  const group = new THREE.Group();

  // Cyan Earth Globe
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), globeMat);
  group.add(globe);

  // Atmosphere Wireframe Grid
  const grid = new THREE.Mesh(new THREE.SphereGeometry(0.44, 16, 16), new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  }));
  group.add(grid);

  // 3D Red Location Pin on Top
  const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  pinHead.position.set(0, 0.74, 0.08);
  group.add(pinHead);

  const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  pinCone.rotation.x = Math.PI;
  pinCone.position.set(0, 0.56, 0.08);
  group.add(pinCone);

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 24), globeMat);
  base.position.y = -0.48;
  group.add(base);

  return group;
}

// 7. Procedural 3D Red IP Server Blade
function buildIPServerMesh(): THREE.Group {
  const group = new THREE.Group();
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.85
  });

  // 3 Blade Server Units
  for (let i = -0.22; i <= 0.22; i += 0.22) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.15, 0.56), redMat);
    blade.position.y = i;
    group.add(blade);

    // Blinking Red LED dots
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.035, 0.02), new THREE.MeshBasicMaterial({ color: 0xfca5a5 }));
    led.position.set(0.18, i, 0.29);
    group.add(led);
  }

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.08, 24), redMat);
  base.position.y = -0.42;
  group.add(base);

  return group;
}

// 8. Procedural 3D Bank Temple Account
function buildBankTempleMesh(): THREE.Group {
  const group = new THREE.Group();
  const bankMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.8
  });

  // Base Plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.55), bankMat);
  plinth.position.y = -0.3;
  group.add(plinth);

  // 4 Classical Pillars
  const pillarGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.44, 16);
  const xOffsets = [-0.25, -0.08, 0.08, 0.25];
  xOffsets.forEach(x => {
    const pillar = new THREE.Mesh(pillarGeo, bankMat);
    pillar.position.set(x, -0.04, 0.12);
    group.add(pillar);
  });

  // Triangular Roof Pediment
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.26, 4), bankMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.3;
  group.add(roof);

  return group;
}

interface FraudGraph3DProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onOpenFullProfile?: () => void;
}

export const FraudGraph3D: React.FC<FraudGraph3DProps> = ({
  onSelectNode,
  onOpenFullProfile
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<EntityType[]>([
    'Customer', 'Account', 'Transaction', 'Device', 'Merchant', 'IP Address', 'Location'
  ]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel>('All');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [searchEntityText, setSearchEntityText] = useState('');
  const [showAccountDetails, setShowAccountDetails] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.08, 10.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient + Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const redCenterLight = new THREE.PointLight(0xff2222, 6, 25);
    redCenterLight.position.set(0, 0, 2);
    scene.add(redCenterLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 3, 15);
    cyanLight.position.set(-3, 2, 2);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 15);
    purpleLight.position.set(3, 2, 2);
    scene.add(purpleLight);

    // Floor Cyber Grid Group
    const gridGroup = new THREE.Group();
    gridGroup.position.set(0, -0.4, -0.6);
    scene.add(gridGroup);

    // Floor Web Rings
    for (let r = 1.0; r <= 4.2; r += 0.85) {
      const circleGeo = new THREE.RingGeometry(r - 0.015, r, 64);
      const circleMat = new THREE.MeshBasicMaterial({
        color: 0x1d283e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      const ring = new THREE.Mesh(circleGeo, circleMat);
      ring.rotation.x = Math.PI / 2.3;
      gridGroup.add(ring);
    }

    // Floor Radial Lines
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const pts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 4.4, 0, Math.sin(angle) * 4.4)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x141f32, transparent: true, opacity: 0.4 });
      const line = new THREE.Line(lineGeo, lineMat);
      line.rotation.x = Math.PI / 2.3;
      gridGroup.add(line);
    }

    // Floor Glowing Red and Cyan Data Dots
    const floorParticleGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const blueMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.6 + Math.random() * 3.4;
      const particle = new THREE.Mesh(floorParticleGeo, Math.random() > 0.4 ? redMat : blueMat);
      particle.position.set(Math.cos(angle) * dist, -0.4 + Math.sin(angle) * 0.4, -0.3 + (Math.random() - 0.5) * 0.5);
      gridGroup.add(particle);
    }

    // Graph Root Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    const animList: (() => void)[] = [];

    // --- 1. BUILD CENTRAL RED NEXUS ---
    const centralNexus = buildCentralNexusMesh();
    centralNexus.group.position.set(0, -0.05, 0);
    const centralLabel = createLabelSprite('High Risk Account', true);
    centralNexus.group.add(centralLabel);
    graphGroup.add(centralNexus.group);
    animList.push(centralNexus.update);

    // --- 2. BUILD THE 7 SURROUNDING 3D ENTITY NODES (Centered & Non-overlapping) ---
    const outerNodes = [
      { id: 'CUST-4481', label: 'Customer', pos: [0, 2.2, 0], build: buildCustomerMesh },
      { id: 'DEV-9921', label: 'Device', pos: [1.85, 1.45, 0], build: buildDeviceMesh },
      { id: 'TXN-784923', label: 'Transaction', pos: [2.2, 0.15, 0], build: buildTransactionMesh },
      { id: 'MERCH-4091', label: 'Merchant', pos: [1.75, -1.35, 0], build: buildMerchantMesh },
      { id: 'LOC-NY', label: 'Location', pos: [0.35, -2.05, 0], build: buildLocationMesh },
      { id: 'IP-185-220', label: 'IP Address', pos: [-1.6, -1.45, 0], build: buildIPServerMesh },
      { id: 'ACC-VAULT', label: 'Account', pos: [-1.95, 0.85, 0], build: buildBankTempleMesh }
    ];

    outerNodes.forEach((node) => {
      const nodeMesh = node.build();
      nodeMesh.position.set(node.pos[0], node.pos[1], node.pos[2]);

      const label = createLabelSprite(node.label, false);
      nodeMesh.add(label);

      graphGroup.add(nodeMesh);

      // Floating gentle animation
      const initY = node.pos[1];
      const offset = Math.random() * Math.PI * 2;
      animList.push(() => {
        const t = Date.now() * 0.002 + offset;
        nodeMesh.position.y = initY + Math.sin(t) * 0.035;
        nodeMesh.rotation.y = Math.sin(t * 0.5) * 0.12;
      });

      // Neon Laser Line Connection
      const centralPos = new THREE.Vector3(0, -0.05, 0);
      const outerPos = new THREE.Vector3(node.pos[0], node.pos[1], node.pos[2]);

      const pts = [centralPos, outerPos];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xff3333,
        transparent: true,
        opacity: 0.85,
        linewidth: 2.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);

      // Glowing Travelling Energy Packets
      const packet = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      graphGroup.add(packet);

      let progress = Math.random();
      const speed = 0.008 + Math.random() * 0.006;
      animList.push(() => {
        progress = (progress + speed) % 1;
        packet.position.lerpVectors(centralPos, outerPos, progress);
      });
    });

    // Smooth Drag Rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let animId: number;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      graphGroup.rotation.y += dx * 0.004;
      graphGroup.rotation.x += dy * 0.004;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };
    const onClick = () => { onSelectNode('ACC-78291'); };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);

    // Animation loop
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        graphGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.05;
      }

      animList.forEach(fn => fn());
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, []);

  const toggleEntityType = (type: EntityType) => {
    setSelectedEntityTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="relative w-full h-full min-h-[530px] lg:min-h-[570px] bg-[#060911] select-none overflow-hidden rounded-xl">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Right Floating Toolbar */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchEntityText}
            onChange={(e) => setSearchEntityText(e.target.value)}
            className="w-40 bg-[#0A0F1D]/80 backdrop-blur-md border border-[#1E283D] focus:border-[#38BDF8] focus:outline-none rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500"
          />
        </div>

        <button 
          type="button" 
          aria-label="Layers filter" 
          className="p-1.5 rounded-lg bg-[#0A0F1D]/80 backdrop-blur-md border border-[#1E283D] text-slate-300 hover:text-white"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button" 
          aria-label="Crosshair target" 
          className="p-1.5 rounded-lg bg-[#0A0F1D]/80 backdrop-blur-md border border-[#1E283D] text-slate-300 hover:text-white"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button" 
          aria-label="Maximize view" 
          className="p-1.5 rounded-lg bg-[#0A0F1D]/80 backdrop-blur-md border border-[#1E283D] text-slate-300 hover:text-white"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Left Floating Controls Panels */}
      <div className="absolute top-3.5 left-3.5 z-20 space-y-2.5 w-36 text-xs pointer-events-auto">
        
        {/* 1. Entity Type Card */}
        <div className="bg-[#0A0F1D]/85 backdrop-blur-md border border-[#1C2538] rounded-xl p-2.5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
            <span>Entity Type</span>
            <X className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>
          <div className="space-y-1 text-[11px]">
            {(['Customer', 'Account', 'Transaction', 'Device', 'Merchant', 'IP Address', 'Location'] as EntityType[]).map(type => (
              <label key={type} className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEntityTypes.includes(type)}
                  onChange={() => toggleEntityType(type)}
                  className="rounded border-[#22304A] bg-[#070A12] text-[#6366F1] focus:ring-0 w-3 h-3"
                />
                <span className="text-[10px] truncate">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Risk Level Card */}
        <div className="bg-[#0A0F1D]/85 backdrop-blur-md border border-[#1C2538] rounded-xl p-2.5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
            <span>Risk Level</span>
            <X className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>
          <div className="space-y-1 text-[11px]">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="risk"
                checked={selectedRiskLevel === 'All'}
                onChange={() => setSelectedRiskLevel('All')}
                className="text-[#38BDF8] focus:ring-0 w-3 h-3"
              />
              <span className="text-[10px]">All Levels</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="risk"
                checked={selectedRiskLevel === 'High'}
                onChange={() => setSelectedRiskLevel('High')}
                className="text-[#EF4444] focus:ring-0 w-3 h-3"
              />
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span>High Risk</span>
              </span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="risk"
                checked={selectedRiskLevel === 'Medium'}
                onChange={() => setSelectedRiskLevel('Medium')}
                className="text-[#F59E0B] focus:ring-0 w-3 h-3"
              />
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span>Medium Risk</span>
              </span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="risk"
                checked={selectedRiskLevel === 'Low'}
                onChange={() => setSelectedRiskLevel('Low')}
                className="text-[#38BDF8] focus:ring-0 w-3 h-3"
              />
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span>Low Risk</span>
              </span>
            </label>
          </div>
        </div>

        {/* 3. Time Range Card */}
        <div className="bg-[#0A0F1D]/85 backdrop-blur-md border border-[#1C2538] rounded-xl p-2.5 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
            <span>Time Range</span>
            <X className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full bg-[#070A12] border border-[#22304A] rounded-lg px-1.5 py-1 text-[10px] text-slate-200 focus:outline-none"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 24 Hours">Last 24 Hours</option>
          </select>
        </div>

      </div>

      {/* Right Floating Card: Account Details */}
      {showAccountDetails && (
        <div className="absolute top-12 right-3.5 z-20 w-60 bg-[#0A0F1D]/90 backdrop-blur-md border border-[#1E283D] rounded-xl p-3.5 shadow-2xl text-xs space-y-2.5 pointer-events-auto">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#1E283D]">
            <span className="text-xs font-bold text-white tracking-wide">Account Details</span>
            <button onClick={() => setShowAccountDetails(false)} className="text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-white tracking-tight">ACC-78291</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EF4444] text-white">
              High Risk
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Account Type</span>
              <span className="text-slate-200">Personal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer ID</span>
              <span className="font-mono text-slate-200">CUST-4481</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Score</span>
              <span className="font-mono font-bold text-[#EF4444]">0.92</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Transactions</span>
              <span className="font-mono text-slate-200">243</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Amount</span>
              <span className="font-mono font-bold text-white">$128,430</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Linked Devices</span>
              <span className="font-mono text-slate-200">4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Linked IPs</span>
              <span className="font-mono text-slate-200">6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Linked Merchants</span>
              <span className="font-mono text-slate-200">12</span>
            </div>
          </div>

          <button
            onClick={() => onOpenFullProfile && onOpenFullProfile()}
            className="w-full py-1.5 bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-medium rounded-lg text-xs shadow-md transition-colors text-center"
          >
            View Full Profile
          </button>

        </div>
      )}

    </div>
  );
};
