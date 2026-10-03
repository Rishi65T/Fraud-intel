import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Maximize2, MoreHorizontal, RotateCw } from 'lucide-react';
import { createEarthTexture } from './proceduralTextures';

export const GlobalFraudGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRotatingRef = useRef(true);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 150;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -0.5;
    globeGroup.rotation.x = 0.2;
    scene.add(globeGroup);

    // Textured Photorealistic Earth Core
    const radius = 1.25;
    const earthTex = createEarthTexture();
    const sphereGeo = new THREE.SphereGeometry(radius, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35
    });
    const earth = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earth);

    // Glowing Holographic Wireframe Grid
    const wireGeo = new THREE.SphereGeometry(radius * 1.012, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wire);

    // Outer Atmospheric Rayleigh Glow
    const atmoGeo = new THREE.SphereGeometry(radius * 1.06, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmo);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const latLongToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Major financial centers & cybercrime hubs
    const points = [
      { lat: 40.7128, lon: -74.006, high: true, name: 'New York' },
      { lat: 51.5074, lon: -0.1278, high: false, name: 'London' },
      { lat: 19.0760, lon: 72.8777, high: true, name: 'Mumbai' },
      { lat: 23.9629, lon: 86.8014, high: true, name: 'Jamtara' },
      { lat: 1.3521, lon: 103.8198, high: false, name: 'Singapore' },
      { lat: 25.2048, lon: 55.2708, high: true, name: 'Dubai' }
    ];

    points.forEach(p => {
      const pos = latLongToVector3(p.lat, p.lon, radius * 1.02);
      
      // Pin base
      const pinGeo = new THREE.SphereGeometry(0.048, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: p.high ? 0xef4444 : 0x38bdf8 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      globeGroup.add(pin);

      // Radar Pulse Halo
      const pulseGeo = new THREE.RingGeometry(0.04, 0.09, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: p.high ? 0xef4444 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.position.copy(pos);
      pulse.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(pulse);
    });

    // 3D Glowing Volumetric Flight Arcs
    const animPackets: { curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; progress: number; speed: number }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = latLongToVector3(points[i].lat, points[i].lon, radius * 1.02);
      const end = latLongToVector3(points[i + 1].lat, points[i + 1].lon, radius * 1.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const midDist = start.distanceTo(end);
      mid.normalize().multiplyScalar(radius * 1.02 + midDist * 0.45);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(32);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xef4444 : 0x38bdf8,
        transparent: true,
        opacity: 0.85
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);

      // Travelling Photon Packet
      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      globeGroup.add(pMesh);
      animPackets.push({
        curve,
        mesh: pMesh,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.006
      });
    }

    // Drag to rotate
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      globeGroup.rotation.y += dx * 0.008;
      globeGroup.rotation.x += dy * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isRotatingRef.current && !isDragging) {
        globeGroup.rotation.y += 0.0025;
      }

      animPackets.forEach(p => {
        p.progress = (p.progress + p.speed) % 1;
        p.mesh.position.copy(p.curve.getPoint(p.progress));
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      earthTex.dispose();
      renderer.dispose();
    };
  }, []);

  const toggleRotate = () => {
    isRotatingRef.current = !isRotatingRef.current;
    setIsRotating(isRotatingRef.current);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative h-full min-h-[220px] select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#161E2E] z-10">
        <span className="text-xs font-bold text-white tracking-wide">
          Global Fraud Activity
        </span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={toggleRotate}
            title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
            className="p-1 rounded hover:bg-[#141C2E] hover:text-white transition-colors"
          >
            <RotateCw className={`w-3 h-3 ${isRotating ? 'text-[#38BDF8]' : 'text-slate-500'}`} />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Expand Fullscreen"
            className="p-1 rounded hover:bg-[#141C2E] hover:text-white transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-36 flex items-center justify-center overflow-hidden my-1 cursor-grab active:cursor-grabbing" />

      {/* Bottom Legend matching screenshot */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-[#161E2E] z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
          <span>Low Risk</span>
        </div>
      </div>

    </div>
  );
};
