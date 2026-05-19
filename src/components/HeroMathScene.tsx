"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type HeroMathSceneProps = {
  reducedMotion?: boolean;
  staticScene?: boolean;
};

type ShapeProps = {
  color: string;
  position: [number, number, number];
  speed: number;
  variant: "torus" | "octahedron" | "icosahedron";
  reducedMotion?: boolean;
  staticScene?: boolean;
};

function FloatingShape({ color, position, speed, variant, reducedMotion, staticScene }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || reducedMotion || staticScene) return;
    const elapsed = state.clock.elapsedTime;
    meshRef.current.rotation.x = elapsed * speed;
    meshRef.current.rotation.y = elapsed * speed * 0.72;
    meshRef.current.position.y = position[1] + Math.sin(elapsed * speed + position[0]) * 0.18;
  });

  return (
    <mesh ref={meshRef} position={position}>
      {variant === "torus" && <torusGeometry args={[0.72, 0.035, 18, 96]} />}
      {variant === "octahedron" && <octahedronGeometry args={[0.56, 0]} />}
      {variant === "icosahedron" && <icosahedronGeometry args={[0.5, 0]} />}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.26} metalness={0.2} transparent opacity={0.78} />
    </mesh>
  );
}

function OrbitCurve({ reducedMotion, staticScene }: HeroMathSceneProps) {
  const lineRef = useRef<THREE.Line>(null);
  const line = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 2.65, 1.15, 0, Math.PI * 2, false, 0.18);
    const points = curve.getPoints(160).map((point) => new THREE.Vector3(point.x, point.y, -0.35));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#a78bfa", transparent: true, opacity: 0.62 });
    return new THREE.Line(geometry, material);
  }, []);

  useFrame((state) => {
    if (!lineRef.current || reducedMotion || staticScene) return;
    lineRef.current.rotation.z = state.clock.elapsedTime * 0.08;
    lineRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.24) * 0.12;
  });

  return <primitive ref={lineRef} object={line} />;
}

function FormulaNodes({ reducedMotion, staticScene }: HeroMathSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodes: Array<[number, number, number]> = [
    [-2.5, 0.85, -0.1],
    [-1.2, -1.05, 0.2],
    [0.35, 1.2, -0.15],
    [1.45, -0.75, 0.28],
    [2.35, 0.42, -0.18],
  ];

  useFrame((state) => {
    if (!groupRef.current || reducedMotion || staticScene) return;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((position, index) => (
        <mesh key={position.join(",")} position={position}>
          <sphereGeometry args={[index % 2 === 0 ? 0.055 : 0.04, 16, 16]} />
          <meshStandardMaterial color={index % 2 === 0 ? "#c4b5fd" : "#38bdf8"} emissive={index % 2 === 0 ? "#7c3aed" : "#0284c7"} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function HeroMathScene({ reducedMotion = false, staticScene = true }: HeroMathSceneProps) {
  const sceneRef = useRef<THREE.Group>(null);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 opacity-90">
      <Canvas dpr={[1, 1.65]} camera={{ position: [0, 0, 5.2], fov: 44 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.3} />
        <pointLight position={[2.4, 2.8, 3.4]} intensity={18} color="#a78bfa" />
        <pointLight position={[-2.2, -1.8, 2.4]} intensity={8} color="#38bdf8" />
        <group ref={sceneRef}>
          <OrbitCurve reducedMotion={reducedMotion} staticScene={staticScene} />
          <FormulaNodes reducedMotion={reducedMotion} staticScene={staticScene} />
          <FloatingShape color="#8b5cf6" position={[-2.15, 0.2, 0.05]} speed={0.35} variant="torus" reducedMotion={reducedMotion} staticScene={staticScene} />
          <FloatingShape color="#38bdf8" position={[2.1, 0.64, -0.25]} speed={0.25} variant="octahedron" reducedMotion={reducedMotion} staticScene={staticScene} />
          <FloatingShape color="#c4b5fd" position={[0.9, -1.15, 0.12]} speed={0.3} variant="icosahedron" reducedMotion={reducedMotion} staticScene={staticScene} />
        </group>
      </Canvas>
    </div>
  );
}
