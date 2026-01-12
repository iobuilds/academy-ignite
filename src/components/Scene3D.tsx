import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Line } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function CircuitLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  return <Line points={points} color={color} lineWidth={1.5} opacity={0.6} transparent />;
}

function CircuitNode({ position, size = 0.08 }: { position: [number, number, number]; size?: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
    </mesh>
  );
}

function FloatingShapes() {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

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
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  // Circuit pattern nodes
  const circuitNodes: [number, number, number][] = [
    [-3, 1.5, -1], [-2.5, 1, -0.5], [-2, 1.5, 0], [-1.5, 0.5, -0.5],
    [2.5, -1, -1], [3, -0.5, -0.5], [2, -1.5, 0], [2.5, -0.5, 0.5],
    [-1, -1.5, -0.5], [-0.5, -2, 0], [0, -1.5, 0.5], [0.5, -2, -0.5],
    [1, 2, -0.5], [1.5, 1.5, 0], [2, 2, 0.5], [0.5, 1.5, -1],
  ];

  // Circuit lines connecting nodes
  const circuitLines: { start: [number, number, number]; end: [number, number, number] }[] = [
    { start: [-3, 1.5, -1], end: [-2.5, 1, -0.5] },
    { start: [-2.5, 1, -0.5], end: [-2, 1.5, 0] },
    { start: [-2.5, 1, -0.5], end: [-1.5, 0.5, -0.5] },
    { start: [2.5, -1, -1], end: [3, -0.5, -0.5] },
    { start: [3, -0.5, -0.5], end: [2, -1.5, 0] },
    { start: [2, -1.5, 0], end: [2.5, -0.5, 0.5] },
    { start: [-1, -1.5, -0.5], end: [-0.5, -2, 0] },
    { start: [-0.5, -2, 0], end: [0, -1.5, 0.5] },
    { start: [0, -1.5, 0.5], end: [0.5, -2, -0.5] },
    { start: [1, 2, -0.5], end: [1.5, 1.5, 0] },
    { start: [1.5, 1.5, 0], end: [2, 2, 0.5] },
    { start: [0.5, 1.5, -1], end: [1, 2, -0.5] },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#1e40af" />

      {/* Circuit pattern group */}
      <group ref={groupRef}>
        {circuitNodes.map((pos, i) => (
          <CircuitNode key={i} position={pos} size={0.06} />
        ))}
        {circuitLines.map((line, i) => (
          <CircuitLine key={i} start={line.start} end={line.end} color="#0ea5e9" />
        ))}
      </group>

      {/* Main floating shapes */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={meshRef1} args={[0.8, 64, 64]} position={[-2, 0.5, 0]}>
          <MeshDistortMaterial color="#1e40af" distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <Box ref={meshRef2} args={[0.6, 0.6, 0.6]} position={[2, -0.5, -1]}>
          <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.6} />
        </Box>
      </Float>

      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.8}>
        <Torus ref={meshRef3} args={[0.5, 0.15, 16, 32]} position={[0.5, 1.5, 0.5]}>
          <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.7} />
        </Torus>
      </Float>

      {/* Additional circuit-inspired geometric shapes */}
      <Float speed={1.2} floatIntensity={1}>
        <Box args={[0.15, 0.8, 0.15]} position={[-3.5, 0, 0]}>
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.3} />
        </Box>
      </Float>
      <Float speed={1.4} floatIntensity={1.2}>
        <Box args={[0.8, 0.15, 0.15]} position={[3.5, 0.5, 0]}>
          <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.3} />
        </Box>
      </Float>
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} style={{ background: 'transparent' }}>
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
