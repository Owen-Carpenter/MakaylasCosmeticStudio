"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';


// Component to load the eyelashes model
function EyelashesModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/eyelashes.glb');
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && state.clock.running) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Use the original scene, don't clone to reduce memory usage
  return (
    <group ref={meshRef} position={position} scale={2}>
      <primitive object={scene} />
    </group>
  );
}

// Component to load the eyelash curler model
function EyelashCurlerModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/eyelash_curler.glb');
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && state.clock.running) {
      meshRef.current.rotation.y = -state.clock.getElapsedTime() * 0.3;
    }
  });

  // Use the original scene, don't clone to reduce memory usage
  return (
    <group ref={meshRef} position={position} scale={1.5}>
      <primitive object={scene} />
    </group>
  );
}

// Fallback while models load - ultra simple
function LoadingFallback() {
  return (
    <>
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#D3AF37" />
      </mesh>
      
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color="#D3AF37" />
      </mesh>
    </>
  );
}

// Main scene with your actual models - ultra-conservative for stability
function EyeLashScene() {
  return (
    <>
      {/* Minimal lighting to prevent context loss */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[2, 2, 2]} 
        intensity={0.5} 
        color="#ffffff"
      />
      
      {/* Your actual 3D models */}
      <Suspense fallback={<LoadingFallback />}>
        <EyelashesModel position={[0.8, 0, 0]} />
        <EyelashCurlerModel position={[-0.8, 0, 0]} />
      </Suspense>
    </>
  );
}

// Main Component
export default function EyeLashModels() {
  const [isLoading, setIsLoading] = React.useState(true);

  const handleCreated = () => {
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/80 text-sm">Loading Eyelash Models...</p>
          </div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        onCreated={handleCreated}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: false,
          stencil: false,
          depth: false,
          premultipliedAlpha: false,
          logarithmicDepthBuffer: false,
        }}
        dpr={[0.5, 1]}
        performance={{ min: 0.5 }}
        frameloop="always"
      >
        <EyeLashScene />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.1}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}

// Preload the models for better performance
useGLTF.preload('/models/eyelashes.glb');
useGLTF.preload('/models/eyelash_curler.glb'); 