
import React, { useState } from 'react';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface RackProps {
  position: [number, number, number];
  id: string;
  onSelectServer: (serverId: string) => void;
}

export const ServerRack: React.FC<RackProps> = ({ position, id, onSelectServer }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  // 模拟机柜中的10个服务器单元
  const units = Array.from({ length: 10 }, (_, i) => ({
    id: `${id}-unit-${i + 1}`,
    index: i,
  }));

  return (
    <group position={position}>
      {/* 机柜框架 - 简洁的长方体 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 8, 3.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* 机柜编号 - 使用默认字体避免加载挂起 */}
      <Text
        position={[0, 4.2, 1.76]}
        fontSize={0.4}
        color="white"
        anchorX="center"
      >
        {`机柜 ${id}`}
      </Text>

      {/* 服务器单元插槽 */}
      {units.map((unit) => {
        const yPos = 3 - unit.index * 0.7;
        const isHovered = hovered === unit.id;

        return (
          <group 
            key={unit.id} 
            position={[0, yPos, 0.2]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(unit.id);
            }}
            onPointerOut={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectServer(unit.id);
            }}
          >
            {/* 服务器面板 - 简洁的高级感面板 */}
            <mesh>
              <boxGeometry args={[2.6, 0.5, 3.2]} />
              <meshStandardMaterial 
                color={isHovered ? "#3b82f6" : "#0f172a"} 
                emissive={isHovered ? "#3b82f6" : "#000000"}
                emissiveIntensity={isHovered ? 0.5 : 0}
              />
            </mesh>
            
            {/* 状态指示灯 - 经典呼吸灯效果 */}
            <mesh position={[-1, 0, 1.61]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                color={Math.random() > 0.1 ? "#22c55e" : "#ef4444"} 
                emissive={Math.random() > 0.1 ? "#22c55e" : "#ef4444"}
                emissiveIntensity={1.5}
              />
            </mesh>
            
            {isHovered && (
              <Html distanceFactor={8} position={[1.5, 0, 0]}>
                <div className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  点击进入服务器 {unit.index + 1}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const DataCenterRoom: React.FC<{ onSelectServer: (id: string) => void }> = ({ onSelectServer }) => {
  return (
    <group>
      {/* 地面 - 简洁的高反射平面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.3} />
      </mesh>
      
      {/* 机柜阵列布局 */}
      <group position={[-6, 0, 0]}>
        {[ -8, -2, 4, 10 ].map((z, i) => (
          <ServerRack key={i} id={`A${i+1}`} position={[0, 0, z]} onSelectServer={onSelectServer} />
        ))}
      </group>
      
      <group position={[6, 0, 0]}>
        {[ -8, -2, 4, 10 ].map((z, i) => (
          <ServerRack key={i} id={`B${i+1}`} position={[0, 0, z]} onSelectServer={onSelectServer} />
        ))}
      </group>
      
      {/* 顶部装饰灯带 */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.5, 0.1, 40]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
      </mesh>

      {/* 补充一点环境光感 */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#3b82f6" />
    </group>
  );
};
