import * as THREE from 'three';

/**
 * Procedurally generates an ultra-realistic HDRI studio environment map
 * with key, fill, and rim light softboxes and converts it using Three.js PMREMGenerator
 * to deliver true PBR physical reflections, Fresnel effects, and clearcoat highlights.
 */
export function createStudioHDRI(renderer: THREE.WebGLRenderer): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian/navy studio ambient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#060a12');
  bgGrad.addColorStop(0.4, '#0c1322');
  bgGrad.addColorStop(0.7, '#080d17');
  bgGrad.addColorStop(1, '#020408');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Softbox 1: Overhead key softbox (Intense cool white/cyan studio panel)
  const keyGrad = ctx.createRadialGradient(280, 120, 10, 280, 120, 180);
  keyGrad.addColorStop(0, '#ffffff');
  keyGrad.addColorStop(0.2, '#e0f2fe');
  keyGrad.addColorStop(0.5, '#38bdf8');
  keyGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = keyGrad;
  ctx.fillRect(80, 0, 400, 260);

  // Softbox 2: Lateral fill panel (Vibrant electric purple / magenta accent)
  const fillGrad = ctx.createRadialGradient(780, 180, 15, 780, 180, 200);
  fillGrad.addColorStop(0, '#ffffff');
  fillGrad.addColorStop(0.25, '#e9d5ff');
  fillGrad.addColorStop(0.6, '#a78bfa');
  fillGrad.addColorStop(1, 'rgba(167, 139, 250, 0)');
  ctx.fillStyle = fillGrad;
  ctx.fillRect(580, 40, 400, 280);

  // Softbox 3: Under-rim crimson/ruby spotlight (For high-risk reflections)
  const redGrad = ctx.createRadialGradient(512, 380, 20, 512, 380, 190);
  redGrad.addColorStop(0, '#ffffff');
  redGrad.addColorStop(0.2, '#fca5a5');
  redGrad.addColorStop(0.55, '#ef4444');
  redGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = redGrad;
  ctx.fillRect(312, 250, 400, 250);

  // Overhead ambient strip lights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(100, 20, 824, 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  // Use Three.js PMREMGenerator for calibrated PBR radiance and irradiance
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envMap = pmrem.fromEquirectangular(texture).texture;
  pmrem.dispose();
  texture.dispose();

  return envMap;
}

/**
 * Creates a micro-surface procedural roughness and metallic noise map
 * for ultra-realistic physical reflections on metals and plastics.
 */
export function createPbrNoiseMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Micro-scratches and subtle noise
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 120 + Math.floor(Math.random() * 45);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}
