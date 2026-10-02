import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Maximize2, Share2 } from 'lucide-react';

export const GlobalFraudGlobe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e18);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -0.5;
    globeGroup.rotation.x = 0.2;
    scene.add(globeGroup);

    // Dark Earth core
    const radius = 1.25;
    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x071124,
      roughness: 0.9,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earth);

    // Glowing Wireframe Grid
    const wireGeo = new THREE.SphereGeometry(radius * 1.008, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wire);

    // Outer glow rim
    const atmoGeo = new THREE.SphereGeometry(radius * 1.05, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmo);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const latLongToVector3 = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Add nodes & arcs
    const points = [
      { lat: 40.7128, lon: -74.006, high: true }, // NY
      { lat: 41.8781, lon: -87.6298, high: false }, // Chicago
      { lat: 37.7749, lon: -122.4194, high: true }, // SF
      { lat: 51.5074, lon: -0.1278, high: true }, // London
      { lat: 28.6139, lon: 77.2090, high: true }, // Delhi
      { lat: 1.3521, lon: 103.8198, high: false } // SG
    ];

    points.forEach(p => {
      const pos = latLongToVector3(p.lat, p.lon, radius * 1.02);
      const pinGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: p.high ? 0xef4444 : 0x38bdf8 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      globeGroup.add(pin);
    });

    // Add glowing arcs
    for (let i = 0; i < points.length - 1; i++) {
      const start = latLongToVector3(points[i].lat, points[i].lon, radius * 1.02);
      const end = latLongToVector3(points[i + 1].lat, points[i + 1].lon, radius * 1.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const midDist = start.distanceTo(end);
      mid.normalize().multiplyScalar(radius * 1.02 + midDist * 0.4);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xef4444 : 0x38bdf8,
        transparent: true,
        opacity: 0.85
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-[#0A0E18] border border-[#161E2E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative h-full min-h-[220px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#161E2E] z-10">
        <span className="text-xs font-bold text-white tracking-wide">
          Global Fraud Activity
        </span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Share2 className="w-3 h-3 hover:text-white cursor-pointer" />
          <Maximize2 className="w-3 h-3 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-36 flex items-center justify-center overflow-hidden my-1" />

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
