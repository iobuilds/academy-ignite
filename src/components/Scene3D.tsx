import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FloatingShapes() {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef1.current) {
      meshRef1.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef1.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef2.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />

      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={meshRef1} args={[1, 64, 64]} position={[-2, 0.5, 0]}>
          <MeshDistortMaterial
            color="#1e40af"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <Box ref={meshRef2} args={[0.8, 0.8, 0.8]} position={[2, -0.5, -1]}>
          <meshStandardMaterial
            color="#0ea5e9"
            roughness={0.3}
            metalness={0.6}
          />
        </Box>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.8}>
        <Torus ref={meshRef3} args={[0.6, 0.2, 16, 32]} position={[0.5, 1.5, 0.5]}>
          <meshStandardMaterial
            color="#1e3a8a"
            roughness={0.4}
            metalness={0.7}
          />
        </Torus>
      </Float>
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
