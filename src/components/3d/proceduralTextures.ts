import * as THREE from 'three';

// Procedural Canvas Texture Generator for realistic 3D materials

export function createCentralCubeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark ruby red background with cybernetic circuit grid
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#991b1b');
  grad.addColorStop(0.7, '#450a0a');
  grad.addColorStop(1, '#1c0505');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Border bevel highlight
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 492);

  // Inner border
  ctx.strokeStyle = 'rgba(254, 202, 202, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, 456, 456);

  // Circuit lines
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Traces from corners
  ctx.moveTo(30, 100); ctx.lineTo(120, 100); ctx.lineTo(180, 160);
  ctx.moveTo(480, 100); ctx.lineTo(390, 100); ctx.lineTo(330, 160);
  ctx.moveTo(30, 412); ctx.lineTo(120, 412); ctx.lineTo(180, 352);
  ctx.moveTo(480, 412); ctx.lineTo(390, 412); ctx.lineTo(330, 352);
  ctx.stroke();

  // Draw Central Shield & Lightning Bolt Icon (Matching the screenshot!)
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#ffffff';

  // Shield outline
  ctx.beginPath();
  ctx.moveTo(256, 120);
  ctx.lineTo(350, 160);
  ctx.lineTo(350, 270);
  ctx.bezierCurveTo(350, 360, 256, 395, 256, 410);
  ctx.bezierCurveTo(256, 395, 162, 360, 162, 270);
  ctx.lineTo(162, 160);
  ctx.closePath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Shield inner fill
  ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.fill();

  // Sharp Lightning Bolt
  ctx.shadowColor = '#fca5a5';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(270, 165);
  ctx.lineTo(215, 260);
  ctx.lineTo(255, 260);
  ctx.lineTo(235, 360);
  ctx.lineTo(300, 245);
  ctx.lineTo(260, 245);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean gradient
  ctx.fillStyle = '#061a38';
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle longitude & latitude lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
  }

  // Draw stylized glowing continents
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#10b981';

  // Americas
  ctx.beginPath();
  // North America
  ctx.moveTo(180, 80); ctx.lineTo(300, 80); ctx.lineTo(280, 180); ctx.lineTo(220, 220); ctx.lineTo(160, 140); ctx.closePath(); ctx.fill();
  // South America
  ctx.beginPath();
  ctx.moveTo(250, 240); ctx.lineTo(330, 260); ctx.lineTo(300, 420); ctx.lineTo(230, 320); ctx.closePath(); ctx.fill();

  // Europe & Africa
  ctx.beginPath();
  // Europe
  ctx.moveTo(480, 90); ctx.lineTo(580, 80); ctx.lineTo(560, 160); ctx.lineTo(460, 140); ctx.closePath(); ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.moveTo(480, 180); ctx.lineTo(590, 180); ctx.lineTo(570, 360); ctx.lineTo(500, 380); ctx.lineTo(460, 260); ctx.closePath(); ctx.fill();

  // Asia & Australia
  ctx.beginPath();
  // Asia
  ctx.moveTo(590, 80); ctx.lineTo(850, 100); ctx.lineTo(820, 250); ctx.lineTo(650, 240); ctx.closePath(); ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.moveTo(760, 320); ctx.lineTo(860, 330); ctx.lineTo(830, 420); ctx.lineTo(750, 390); ctx.closePath(); ctx.fill();

  // Glowing city clusters (dots)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 15;
  const cities = [
    [260, 140], [280, 130], [240, 150], [520, 120], [530, 110], [560, 130],
    [750, 160], [800, 170], [780, 180], [290, 320], [510, 220]
  ];
  cities.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createServerBladeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark brushed carbon chassis
  ctx.fillStyle = '#0f141c';
  ctx.fillRect(0, 0, 512, 512);

  // Outer frame
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 500, 500);

  // 4 Horizontal Blade Units
  for (let i = 0; i < 4; i++) {
    const y = 30 + i * 115;
    // Blade housing
    ctx.fillStyle = '#18202c';
    ctx.fillRect(20, y, 472, 100);
    ctx.strokeStyle = '#283548';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, y, 472, 100);

    // Honeycomb ventilation holes
    ctx.fillStyle = '#0a0d13';
    for (let hx = 40; hx < 360; hx += 16) {
      for (let hy = y + 15; hy < y + 85; hy += 16) {
        ctx.fillRect(hx, hy, 8, 8);
      }
    }

    // Status LEDs
    ctx.shadowBlur = 8;
    // Power LED (Green)
    ctx.shadowColor = '#22c55e';
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(390, y + 30, 5, 0, Math.PI * 2); ctx.fill();

    // Activity LED (Red - Tor IP Alert!)
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(415, y + 30, 6, 0, Math.PI * 2); ctx.fill();

    // Drive Tray handles
    ctx.fillStyle = '#334155';
    ctx.fillRect(445, y + 20, 30, 60);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createCoinTokenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep brushed metallic gold radial gradient
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.4, '#eab308');
  grad.addColorStop(0.8, '#a16207');
  grad.addColorStop(1, '#713f12');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer coin reeding / rim
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 20;
  ctx.beginPath(); ctx.arc(256, 256, 240, 0, Math.PI * 2); ctx.stroke();

  // Inner ring with milled dots
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(256, 256, 215, 0, Math.PI * 2); ctx.stroke();

  ctx.fillStyle = '#fef08a';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
    const x = 256 + Math.cos(a) * 200;
    const y = 256 + Math.sin(a) * 200;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }

  // Large Currency / Vault Glyph
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 220px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 256, 265);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createPedestalRingTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark reflective glass disc with glowing neon ring
  ctx.fillStyle = 'rgba(10, 15, 24, 0.9)';
  ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.fill();

  ctx.shadowColor = colorHex;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
