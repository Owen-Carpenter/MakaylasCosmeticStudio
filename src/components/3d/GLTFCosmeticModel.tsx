"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float } from '@react-three/drei';
import SimpleCosmeticDisplay from './SimpleCosmeticDisplay';

// Component to load a single GLTF model (uncomment when you have model files)
/*
function GLTFModel({ url, position, scale = 1 }: { 
  url: string; 
  position: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={meshRef} position={position} scale={scale}>
        <primitive object={scene.clone()} />
      </group>
    </Float>
  );
}
*/

// Fallback models if GLTF files don't exist
function FallbackModels() {
  return (
    <>
      {/* Simple geometric cosmetic representations */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 1.8, 16]} />
          <meshPhysicalMaterial 
            color="#D3AF37"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            transparent
            opacity={0.95}
          />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[-1.5, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 12]} />
          <meshPhysicalMaterial 
            color="#D3AF37"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.25}>
        <mesh position={[1.5, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.15, 20]} />
          <meshPhysicalMaterial 
            color="#D3AF37"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>
    </>
  );
}

// Main scene with model loading
function GLTFCosmeticScene() {
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
      />
      <pointLight position={[-10, 0, -10]} intensity={0.6} color="#D3AF37" />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.4} 
        penumbra={1} 
        intensity={1}
      />
      
      {/* Try to load GLTF models, fallback to simple models */}
      <Suspense fallback={<FallbackModels />}>
        {/* You can replace these with your actual model files */}
        <FallbackModels />
        
        {/* Uncomment these when you have actual model files:
        <GLTFModel url="/models/cosmetic-bottle.glb" position={[0, 0, 0]} scale={2} />
        <GLTFModel url="/models/lipstick.glb" position={[-1.5, 0, 0]} scale={2} />
        <GLTFModel url="/models/compact.glb" position={[1.5, 0, 0]} scale={2} />
        */}
      </Suspense>
      
      {/* Environment for realistic reflections */}
      <Environment preset="studio" />
    </>
  );
}

// Main Component
export default function GLTFCosmeticModel() {
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
        }}
        dpr={[1, 2]}
      >
        <GLTFCosmeticScene />
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

// Preload models for better performance
useGLTF.preload('/models/cosmetic-bottle.glb');
useGLTF.preload('/models/lipstick.glb');
useGLTF.preload('/models/compact.glb'); 