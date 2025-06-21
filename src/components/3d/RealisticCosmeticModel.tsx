"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import SimpleCosmeticDisplay from './SimpleCosmeticDisplay';

// Individual model components
function CosmeticBottleModel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef} position={position}>
        {/* Realistic Bottle Shape */}
        <mesh>
          <cylinderGeometry args={[0.4, 0.5, 1.8, 16]} />
          <meshPhysicalMaterial 
            color="#D3AF37"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0}
            transparent
            opacity={0.95}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Bottle Neck */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
          <meshPhysicalMaterial 
            color="#D3AF37"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
        
        {/* Cap */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshPhysicalMaterial 
            color="#B8860B"
            metalness={1}
            roughness={0.05}
          />
        </mesh>
        
        {/* Pump */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
    </Float>
  );
}

function LipstickModel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = -state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={meshRef} position={position}>
        {/* Lipstick Case */}
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 12]} />
          <meshPhysicalMaterial 
            color="#D3AF37"
            metalness={0.8}
            roughness={0.2}
            clearcoat={0.8}
          />
        </mesh>
        
        {/* Lipstick Bullet */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
          <meshStandardMaterial 
            color="#dc2626"
            roughness={0.6}
          />
        </mesh>
        
        {/* Lipstick Tip */}
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.12, 0.2, 12]} />
          <meshStandardMaterial 
            color="#dc2626"
            roughness={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

function CompactModel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Compact Base */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.15, 20]} />
        <meshPhysicalMaterial 
          color="#D3AF37"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Mirror Surface */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.02, 20]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          metalness={1}
          roughness={0}
          clearcoat={1}
          reflectivity={1}
        />
      </mesh>
      
      {/* Compact Lid (slightly open) */}
      <mesh position={[0, 0.2, -0.3]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 20]} />
        <meshPhysicalMaterial 
          color="#D3AF37"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// Main 3D Scene
function RealisticCosmeticScene() {
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 0, -10]} intensity={0.5} color="#D3AF37" />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.8}
        castShadow
      />
      
      {/* 3D Models */}
      <CosmeticBottleModel position={[0, 0, 0]} />
      <LipstickModel position={[-1.5, 0, 0]} />
      <CompactModel position={[1.5, 0, 0]} />
      
      {/* Environment for realistic reflections */}
      <Environment preset="studio" />
      
      {/* Ground plane for shadows */}
      <mesh receiveShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </>
  );
}

// Main Component
export default function RealisticCosmeticModel() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleCreated = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    console.error('WebGL Error: Context lost or rendering failed');
    setError('3D rendering not supported on this device');
    setIsLoading(false);
  };

  if (error) {
    return <SimpleCosmeticDisplay />;
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/80 text-sm">Loading 3D Models...</p>
          </div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        onCreated={handleCreated}
        onError={handleError}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <RealisticCosmeticScene />
        </Suspense>
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
} 