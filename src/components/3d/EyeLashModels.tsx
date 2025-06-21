"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';




// Component to load the eyelash curler model
function EyelashCurlerModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/eyelash_curler.glb');
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && state.clock.running) {
      meshRef.current.rotation.y = -state.clock.getElapsedTime() * 0.3;
    }
  });

  // Override materials to ensure visibility
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Override material to ensure it's not black
          child.material = new THREE.MeshStandardMaterial({
            color: '#D3AF37',
            metalness: 0.7,
            roughness: 0.3,
          });
        }
      });
    }
  }, [scene]);

  // Use the original scene, don't clone to reduce memory usage
  return (
    <group ref={meshRef} position={position} scale={0.75}>
      <primitive object={scene} />
    </group>
  );
}

// Component to load the cream tube model
function CreamTubeModel({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/cc0_cream_tube.glb');
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && state.clock.running) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Override materials to ensure visibility
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Override material to ensure it's not black
          child.material = new THREE.MeshStandardMaterial({
            color: '#D3AF37',
            metalness: 0.8,
            roughness: 0.2,
          });
        }
      });
    }
  }, [scene]);

  // Use the original scene, don't clone to reduce memory usage
  return (
    <group ref={meshRef} position={position} scale={15.5}>
      <primitive object={scene} />
    </group>
  );
}

// Fallback while models load - ultra simple
function LoadingFallback() {
  return (
    <>
      <mesh position={[-1.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.3]} />
        <meshBasicMaterial color="#D3AF37" />
      </mesh>
      
      <mesh position={[1.2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
        <meshBasicMaterial color="#D3AF37" />
      </mesh>
    </>
  );
}

// Main scene with your actual models - well-lit and stable
function EyeLashScene() {
  return (
    <>
      {/* Very bright lighting to fix black models */}
      <ambientLight intensity={2.0} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={2.0} 
        color="#ffffff"
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={1.5} 
        color="#ffffff"
      />
      <directionalLight 
        position={[0, -3, 5]} 
        intensity={1.0} 
        color="#ffffff"
      />
      <pointLight position={[3, 5, 3]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-3, 5, 3]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 2, -3]} intensity={1.0} color="#D3AF37" />
      
      {/* Your actual 3D models */}
      <Suspense fallback={<LoadingFallback />}>
        <EyelashCurlerModel position={[-1.2, 0, 0]} />
        <CreamTubeModel position={[1.2, 0, 0]} />
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
useGLTF.preload('/models/eyelash_curler.glb');
useGLTF.preload('/models/cc0_cream_tube.glb'); 