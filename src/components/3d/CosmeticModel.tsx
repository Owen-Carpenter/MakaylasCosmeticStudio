"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Environment } from '@react-three/drei';
import * as THREE from 'three';
import SimpleCosmeticDisplay from './SimpleCosmeticDisplay';

// Cosmetic Bottle Component
function CosmeticBottle() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Bottle Body */}
      <Cylinder args={[0.5, 0.6, 2, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#D3AF37" 
          metalness={0.8} 
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Cylinder>
      
      {/* Bottle Cap */}
      <Cylinder args={[0.4, 0.4, 0.3, 8]} position={[0, 1.15, 0]}>
        <meshStandardMaterial 
          color="#B8860B" 
          metalness={1.0} 
          roughness={0.1}
        />
      </Cylinder>
      
      {/* Pump/Dispenser */}
      <Cylinder args={[0.1, 0.1, 0.5, 8]} position={[0, 1.55, 0]}>
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.5} 
          roughness={0.3}
        />
      </Cylinder>
    </group>
  );
}

// Makeup Compact Component
function MakeupCompact() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = -state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[2, 0, 0]}>
      {/* Compact Base */}
      <Cylinder args={[0.8, 0.8, 0.2, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#D3AF37" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Cylinder>
      
      {/* Compact Mirror */}
      <Cylinder args={[0.7, 0.7, 0.05, 16]} position={[0, 0.15, 0]}>
        <meshStandardMaterial 
          color="#f0f0f0" 
          metalness={1.0} 
          roughness={0.0}
        />
      </Cylinder>
    </group>
  );
}

// Lipstick Component
function Lipstick() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group ref={meshRef} position={[-2, 0, 0]}>
      {/* Lipstick Case */}
      <Cylinder args={[0.2, 0.2, 1.5, 12]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#B8860B" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Cylinder>
      
      {/* Lipstick Tip */}
      <Cylinder args={[0.15, 0.15, 0.3, 12]} position={[0, 0.9, 0]}>
        <meshStandardMaterial 
          color="#d63384" 
          metalness={0.3} 
          roughness={0.7}
        />
      </Cylinder>
    </group>
  );
}

// Main 3D Scene Component
function CosmeticScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#D3AF37" />
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1}
        color="#ffffff"
      />
      
      {/* 3D Models */}
      <CosmeticBottle />
      <MakeupCompact />
      <Lipstick />
      
      {/* Environment for reflections */}
      <Environment preset="studio" />
    </>
  );
}

// Main Component Export
export default function CosmeticModel() {
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
            <p className="text-white/80 text-sm">Loading 3D Model...</p>
          </div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        onCreated={handleCreated}
        onError={handleError}
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
        <CosmeticScene />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
} 