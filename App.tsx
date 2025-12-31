
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Sky, Html, Float } from '@react-three/drei';
import { Activity, Cpu, Database, Fan, HardDrive, Info, Layers, Maximize, Settings, ShieldCheck, Thermometer, Zap } from 'lucide-react';
import { Motherboard, CPUCooler, GPU, RAMStick, Chassis } from './components/HardwareModels';
import { INITIAL_HARDWARE_STATE, COLORS } from './constants';
import { HardwareComponent, ViewMode } from './types';

const App: React.FC = () => {
  const [hardware, setHardware] = useState<HardwareComponent[]>(INITIAL_HARDWARE_STATE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.NORMAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selectedComp = hardware.find(h => h.id === selectedId);

  const viewModeMap = {
    [ViewMode.NORMAL]: '常规',
    [ViewMode.XRAY]: 'X光',
    [ViewMode.THERMAL]: '热成像',
    [ViewMode.WIRE]: '网格'
  };

  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden flex flex-col md:flex-row">
      {/* 3D 渲染层 */}
      <div className="flex-grow h-2/3 md:h-full relative">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[12, 8, 15]} fov={50} />
          <Suspense fallback={<Html center><div className="text-slate-600 text-xl animate-pulse">正在初始化数字孪生系统...</div></Html>}>
            <Environment preset="city" />
            <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />

            <group position={[0, 0, 0]}>
              <Chassis viewMode={viewMode} />
              <Motherboard position={[0, 0, 0]} viewMode={viewMode} />
              <CPUCooler 
                position={[0, 0, 3]} 
                temperature={hardware.find(h => h.type === 'CPU')?.temperature || 40} 
                viewMode={viewMode}
              />
              <group position={[3.5, 0.8, 3]}>
                <RAMStick position={[0, 0, -1.2]} viewMode={viewMode} label="内存插槽 1" />
                <RAMStick position={[0.4, 0, -1.2]} viewMode={viewMode} />
                <RAMStick position={[0.8, 0, -1.2]} viewMode={viewMode} />
                <RAMStick position={[1.2, 0, -1.2]} viewMode={viewMode} />
              </group>
              <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                <GPU 
                  position={[-3, 3, 4]} 
                  load={hardware.find(h => h.type === 'GPU')?.load || 0}
                  viewMode={viewMode}
                />
              </Float>
              <mesh position={[5, 1, -4]}>
                <boxGeometry args={[3.5, 3.5, 4]} />
                <meshStandardMaterial color="#cbd5e1" />
                <Html distanceFactor={10} position={[0, 2, 0]} center>
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-200 shadow-sm text-[9px] font-bold text-slate-500">电源模块</div>
                </Html>
              </mesh>
            </group>

            <ContactShadows position={[0, -1.1, 0]} opacity={0.2} scale={20} blur={2.5} far={4.5} />
            <OrbitControls minDistance={5} maxDistance={30} enablePan={true} />
          </Suspense>
        </Canvas>

        {/* 视图模式切换 */}
        <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-1.5 rounded-xl shadow-xl flex gap-1">
            {(Object.values(ViewMode)).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {viewModeMap[mode]}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsAnalyzing(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-xl shadow-indigo-200 transition-all border border-white/20"
          >
            <Activity className="w-4 h-4" />
            AI 组件深度扫描
          </button>
        </div>

        {/* 浮动仪表盘 */}
        <div className="absolute bottom-6 left-6 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-5 rounded-2xl shadow-2xl w-80">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              系统核心运行仪表盘
            </h3>
            <div className="space-y-4">
              {hardware.slice(0, 3).map(comp => (
                <div key={comp.id} className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{comp.name}</span>
                    <span className={comp.temperature > 70 ? 'text-red-500' : 'text-blue-600'}>
                      {comp.temperature.toFixed(1)}°C
                    </span>
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

      {/* 侧边控制面板 */}
      <div className="w-full md:w-[400px] h-1/3 md:h-full bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Database className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">服务器数字孪生 X1</h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 系统在线 · 安全运行
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">环境实时状态</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Thermometer className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-slate-500 text-[10px] font-medium">机房环境温度</p>
                <p className="text-xl font-bold text-slate-800">24.5°C</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                <p className="text-slate-500 text-[10px] font-medium">整机功耗</p>
                <p className="text-xl font-bold text-slate-800">420W</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Fan className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-slate-500 text-[10px] font-medium">风扇转速</p>
                <p className="text-xl font-bold text-slate-800">1,200 CFM</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Activity className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-slate-500 text-[10px] font-medium">连续运行时间</p>
                <p className="text-xl font-bold text-slate-800">14天 2时</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">硬件资产清单</h3>
            <div className="space-y-3">
              {hardware.map(comp => (
                <div 
                  key={comp.id}
                  onClick={() => setSelectedId(comp.id)}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedId === comp.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedId === comp.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {comp.type === 'CPU' && <Cpu className="w-5 h-5" />}
                      {comp.type === 'GPU' && <Maximize className="w-5 h-5" />}
                      {comp.type === 'RAM' && <Layers className="w-5 h-5" />}
                      {comp.type === 'DISK' && <HardDrive className="w-5 h-5" />}
                      {comp.type === 'PSU' && <Settings className="w-5 h-5" />}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-slate-800">{comp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{comp.specs}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-500">{comp.health}% 健康</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 详情模态框 */}
      {selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 pointer-events-none">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] max-w-lg w-full p-8 pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Info className="text-white w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedComp.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {selectedComp.type} 组件
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-900 text-xl">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-[10px] mb-1 font-bold uppercase">实时温度</p>
                <p className="text-2xl font-bold text-orange-500">{selectedComp.temperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-[10px] mb-1 font-bold uppercase">负载率</p>
                <p className="text-2xl font-bold text-blue-600">{selectedComp.load.toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">硬件规格</span>
                <span className="text-slate-900 font-medium">{selectedComp.specs}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">状态检查</span>
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 通过验证
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">固件版本</span>
                <span className="text-slate-700 font-mono">v4.1.2-build88</span>
              </div>
            </div>

            <button 
              className="w-full mt-10 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg"
              onClick={() => setSelectedId(null)}
            >
              返回主面板
            </button>
          </div>
        </div>
      )}

      {/* AI 分析界面 */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-12 text-center">
              <div className="relative mb-8 inline-block">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                  <Activity className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-400 animate-ping opacity-25" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">AI 硬件智能诊断</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Gemini AI 引擎正在实时扫描 3D 几何模型并分析硬件拓扑结构，以验证物理层安全性和运行效率。
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 border border-slate-200">
                <div className="flex items-center gap-3 text-indigo-600 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-widest">诊断分析报告</span>
                </div>
                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>显卡型号识别:</span>
                    <span className="text-slate-900 font-bold">NVIDIA RTX iGame (已验证)</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>散热系统检测:</span>
                    <span className="text-slate-900 font-bold">AMD 选件空冷 (正常运转)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>物理完整性:</span>
                    <span className="text-emerald-600 font-bold">硬件连接最佳</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => setIsAnalyzing(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
              >
                完成诊断并确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
