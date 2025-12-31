
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, Text, Float, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ViewMode } from '../types';

interface ComponentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  viewMode: ViewMode;
  isSelected?: boolean;
  label?: string;
  subLabel?: string;
}

const ComponentLabel: React.FC<{ name: string; status?: string }> = ({ name, status }) => (
  <Html distanceFactor={10} position={[0, 1.5, 0]} center>
    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 shadow-lg whitespace-nowrap pointer-events-none">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter">{name}</span>
        {status && <span className="text-[9px] text-slate-400 border-l border-slate-200 pl-2">{status}</span>}
      </div>
    </div>
  </Html>
);

export const Motherboard: React.FC<ComponentProps> = ({ position, viewMode }) => {
  return (
    <group position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial 
          color={viewMode === ViewMode.XRAY ? '#001122' : '#0a1a0a'} 
          opacity={viewMode === ViewMode.XRAY ? 0.3 : 1}
          transparent={viewMode === ViewMode.XRAY}
          roughness={0.8}
        />
      </mesh>
      <gridHelper args={[11, 20, '#115511', '#0a2a0a']} position={[0, 0.11, 0]} />
      <ComponentLabel name="主板" status="系统总线正常" />
    </group>
  );
};

export const CPUCooler: React.FC<ComponentProps & { temperature: number }> = ({ position, temperature, viewMode }) => {
  const fanRef = useRef<THREE.Group>(null);
  const speed = 0.1 + (temperature / 100);

  useFrame(() => {
    if (fanRef.current) fanRef.current.rotation.y += speed;
  });

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.4, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <group ref={fanRef} position={[0, 1.25, 0]}>
        <mesh>
          <cylinderGeometry args={[1.4, 1.4, 0.05, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} transparent opacity={0.6} />
        </mesh>
      </group>
      <Text position={[0, 1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} color="white">
        AMD RYZEN
      </Text>
      <pointLight position={[0, 1.5, 0]} color="#ef4444" intensity={2} distance={5} />
      <ComponentLabel name="CPU 处理器" status={`${temperature.toFixed(1)}°C`} />
    </group>
  );
};

export const GPU: React.FC<ComponentProps & { load: number }> = ({ position, rotation, load, viewMode }) => {
  const fansRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (fansRef.current) {
      fansRef.current.children.forEach((fan) => {
        fan.rotation.y += 0.05 + (load / 1000);
      });
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[10, 2, 1.5]} radius={0.1} smoothness={4}>
        <meshStandardMaterial 
          color={viewMode === ViewMode.XRAY ? '#220033' : '#1a1a1a'} 
          metalness={0.8} roughness={0.2}
          transparent={viewMode === ViewMode.XRAY}
          opacity={viewMode === ViewMode.XRAY ? 0.3 : 1}
        />
      </RoundedBox>
      <group ref={fansRef} position={[0, 0, 0.8]}>
        {[ -3, 0, 3 ].map((x, i) => (
          /* Move rotation from cylinderGeometry to mesh */
          <mesh key={i} position={[x, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
      </group>
      <Text position={[0, 0.5, 0.8]} fontSize={0.4} color="white" fontWeight="bold">
        GEFORCE RTX
      </Text>
      <ComponentLabel name="GPU 显卡" status={`负载: ${load.toFixed(0)}%`} />
    </group>
  );
};

export const RAMStick: React.FC<ComponentProps> = ({ position, viewMode, label }) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 1.5, 4]} />
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.06, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.2, 3.8]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} />
      </mesh>
      {label && <ComponentLabel name={label} />}
    </group>
  );
};

export const Chassis: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
  return (
    <group>
      <mesh position={[0, 5, -6.1]}>
        <boxGeometry args={[14, 12, 0.2]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.2} />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[14, 0.2, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.2} />
      </mesh>
      <mesh position={[0, 5, 6.1]}>
        <boxGeometry args={[14, 12, 0.1]} />
        <meshPhysicalMaterial 
          transparent opacity={viewMode === ViewMode.XRAY ? 0.05 : 0.1} 
          roughness={0} metalness={0.1} transmission={0.9} thickness={0.5}
        />
      </mesh>
    </group>
  );
};
