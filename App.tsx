
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Sky, Html, Float } from '@react-three/drei';
import { Activity, Cpu, Database, Fan, HardDrive, Info, Layers, Maximize, Settings, ShieldCheck, Thermometer, Zap, ChevronRight, LayoutGrid } from 'lucide-react';
import { Motherboard, CPUCooler, GPU, RAMStick, Chassis } from './components/HardwareModels';
import { DataCenterRoom } from './components/DataCenterModels';
import { INITIAL_HARDWARE_STATE } from './constants';
import { HardwareComponent, ViewMode, SceneLevel } from './types';

const App: React.FC = () => {
  const [sceneLevel, setSceneLevel] = useState<SceneLevel>(SceneLevel.DATACENTER);
  const [hardware, setHardware] = useState<HardwareComponent[]>(INITIAL_HARDWARE_STATE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.NORMAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHardware(prev => prev.map(comp => ({
        ...comp,
        temperature: Math.min(85, Math.max(30, comp.temperature + (Math.random() - 0.5) * 2)),
        load: Math.min(100, Math.max(0, comp.load + (Math.random() - 0.5) * 5))
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectServer = (serverId: string) => {
    setActiveServerId(serverId);
    setSceneLevel(SceneLevel.SERVER_DETAIL);
  };

  const selectedComp = hardware.find(h => h.id === selectedId);

  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden flex flex-col md:flex-row">
      {/* 顶部导航面包屑 */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSceneLevel(SceneLevel.DATACENTER)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              sceneLevel === SceneLevel.DATACENTER ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>机房全景</span>
          </button>
          {sceneLevel === SceneLevel.SERVER_DETAIL && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
                <Database className="w-4 h-4" />
                <span>服务器 {activeServerId}</span>
              </div>
            </>
          )}
        </div>
        <div className="hidden md:block text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          Digital Twin Realtime Engine
        </div>
      </div>

      {/* 3D 渲染区域 */}
      <div className="flex-grow h-2/3 md:h-full relative bg-slate-900">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <PerspectiveCamera 
            makeDefault 
            position={sceneLevel === SceneLevel.DATACENTER ? [20, 15, 25] : [10, 8, 12]} 
            fov={50} 
          />
          
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[512, 512]}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.8} color="#3b82f6" />

          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-3xl shadow-2xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="text-slate-900 font-black text-xl tracking-tight">初始化 3D 引擎...</div>
              </div>
            </Html>
          }>
            {sceneLevel === SceneLevel.DATACENTER ? (
              <DataCenterRoom onSelectServer={handleSelectServer} />
            ) : (
              <group position={[0, 0, 0]}>
                <Chassis viewMode={viewMode} />
                <Motherboard position={[0, 0, 0]} viewMode={viewMode} />
                <CPUCooler 
                  position={[0, 0, 3]} 
                  temperature={hardware.find(h => h.type === 'CPU')?.temperature || 40} 
                  viewMode={viewMode}
                />
                <group position={[3.5, 0.8, 3]}>
                  <RAMStick position={[0, 0, -1.2]} viewMode={viewMode} label="RAM 1" />
                  <RAMStick position={[0.4, 0, -1.2]} viewMode={viewMode} />
                  <RAMStick position={[0.8, 0, -1.2]} viewMode={viewMode} />
                  <RAMStick position={[1.2, 0, -1.2]} viewMode={viewMode} />
                </group>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <GPU 
                    position={[-3, 3, 4]} 
                    load={hardware.find(h => h.type === 'GPU')?.load || 0}
                    viewMode={viewMode}
                  />
                </Float>
                <mesh position={[5, 1, -4]}>
                  <boxGeometry args={[3.5, 3.5, 4]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.2} />
                </mesh>
              </group>
            )}

            <ContactShadows position={[0, -4.1, 0]} opacity={0.4} scale={50} blur={2} far={10} />
            <OrbitControls minDistance={5} maxDistance={60} enableDamping />
          </Suspense>
        </Canvas>

        {/* 交互提示 */}
        {sceneLevel === SceneLevel.DATACENTER && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="bg-slate-900/90 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse border border-slate-700">
              <Maximize className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm">选择一个服务器进入微观视图</span>
            </div>
          </div>
        )}

        {/* 悬浮监测信息 */}
        <div className="absolute bottom-6 left-6 pointer-events-none z-20">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-5 rounded-2xl shadow-xl w-72">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              实时指标
            </h3>
            <div className="space-y-4">
              {hardware.slice(0, 3).map(comp => (
                <div key={comp.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{comp.name}</span>
                    <span className={comp.temperature > 70 ? 'text-red-500' : 'text-blue-600'}>{comp.temperature.toFixed(0)}°C</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${comp.load > 80 ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${comp.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 侧边信息控制台 */}
      <div className="w-full md:w-[400px] bg-white border-l border-slate-200 flex flex-col pt-16 z-10 overflow-y-auto">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Database className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">管理控制中心</h1>
              <p className="text-emerald-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 系统同步就绪
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">环境参数</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '平均室温', val: '24.5°C', icon: Thermometer, color: 'text-orange-500' },
                { label: '集群功耗', val: '42.8 kW', icon: Zap, color: 'text-yellow-500' },
                { label: '冷却风压', val: '1,200', icon: Fan, color: 'text-blue-500' },
                { label: '资源利用', val: '68%', icon: Activity, color: 'text-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <item.icon className={`w-5 h-5 ${item.color} mb-3`} />
                  <p className="text-slate-500 text-[10px] font-bold">{item.label}</p>
                  <p className="text-lg font-black text-slate-800">{item.val}</p>
                </div>
              ))}
            </div>
          </section>

          {sceneLevel === SceneLevel.SERVER_DETAIL ? (
            <section className="animate-in fade-in duration-500">
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">节点硬件拓扑</h3>
              <div className="space-y-3">
                {hardware.map(comp => (
                  <div 
                    key={comp.id}
                    onClick={() => setSelectedId(comp.id)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      selectedId === comp.id ? 'bg-blue-600 border-blue-600 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedId === comp.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {comp.type === 'CPU' ? <Cpu className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedId === comp.id ? 'text-white' : 'text-slate-800'}`}>{comp.name}</p>
                      <p className={`text-[9px] uppercase font-mono ${selectedId === comp.id ? 'text-white/70' : 'text-slate-400'}`}>{comp.specs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">操作日志</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-700">
                  正在监听所有 A 区与 B 区机柜的实时传感器反馈。
                </div>
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-[11px] text-orange-700">
                  警告：机柜 A4 的第 7 个单元风扇转速异常，请关注。
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      {selectedComp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{selectedComp.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">温度</p>
                <p className="text-2xl font-black text-orange-500">{selectedComp.temperature.toFixed(0)}°C</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">负载</p>
                <p className="text-2xl font-black text-blue-600">{selectedComp.load.toFixed(0)}%</p>
              </div>
            </div>
            <button 
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-colors"
              onClick={() => setSelectedId(null)}
            >
              确定并返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
