import React, { useState, useEffect } from "react";
import {
  Watch,
  Activity,
  Heart,
  Flame,
  Footprints,
  Moon,
  Zap,
  RefreshCw,
  CheckCircle2,
  Battery,
  ShieldCheck,
  Radio,
  Sliders
} from "lucide-react";
import { WearableVitals, WearableDeviceType } from "../types";

interface WearableSyncProps {
  wearable: WearableVitals;
  onUpdateWearable: (data: WearableVitals) => void;
}

const SUPPORTED_DEVICES: { type: WearableDeviceType; name: string; brand: string; icon: string }[] = [
  { type: "apple_health", name: "Apple Watch Ultra 2 & HealthKit", brand: "Apple", icon: "🍎" },
  { type: "garmin", name: "Garmin Forerunner 965 & Connect", brand: "Garmin", icon: "🧭" },
  { type: "whoop", name: "Whoop 4.0 Strain & Recovery", brand: "Whoop", icon: "⚡" },
  { type: "fitbit", name: "Fitbit Sense 2 & Google Fit", brand: "Google / Fitbit", icon: "⌚" },
  { type: "oura", name: "Oura Ring Gen 3 Horizon", brand: "Oura", icon: "💍" },
];

export const WearableSync: React.FC<WearableSyncProps> = ({
  wearable,
  onUpdateWearable,
}) => {
  const [isSimulatingLivePulse, setIsSimulatingLivePulse] = useState(true);
  const [bpmWave, setBpmWave] = useState<number[]>([65, 68, 72, 67, 70, 75, 68, 69, 74, 71]);

  // Live heart rate ticker simulation
  useEffect(() => {
    if (!isSimulatingLivePulse) return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.5) * 4;
      const newBpm = Math.min(95, Math.max(56, Math.round(wearable.heartRateCurrent + delta)));
      
      setBpmWave((prev) => [...prev.slice(1), newBpm]);
      onUpdateWearable({
        ...wearable,
        heartRateCurrent: newBpm,
        lastSyncTime: "En vivo (vía BLE)",
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingLivePulse, wearable.heartRateCurrent]);

  const handleDeviceSwitch = (dev: typeof SUPPORTED_DEVICES[0]) => {
    onUpdateWearable({
      ...wearable,
      connectedDevice: dev.type,
      deviceName: dev.name,
      isSyncing: true,
      lastSyncTime: "Sincronizando...",
    });

    setTimeout(() => {
      onUpdateWearable({
        ...wearable,
        connectedDevice: dev.type,
        deviceName: dev.name,
        isSyncing: false,
        lastSyncTime: "Hace 10 segundos",
      });
    }, 900);
  };

  const handleManualSync = () => {
    onUpdateWearable({
      ...wearable,
      isSyncing: true,
      lastSyncTime: "Sincronizando telemetría...",
    });

    setTimeout(() => {
      onUpdateWearable({
        ...wearable,
        isSyncing: false,
        lastSyncTime: "Sincronizado ahora",
        activeCaloriesBurned: wearable.activeCaloriesBurned + Math.floor(Math.random() * 25 + 10),
        stepsCurrent: wearable.stepsCurrent + Math.floor(Math.random() * 200 + 80),
      });
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Telemetría Biométrica en Tiempo Real
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sincronización de Dispositivos Wearables
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Monitorea tus biomarcadores en tiempo real (frecuencia cardíaca, gasto calórico activo, pasos, SpO2 y recuperación del sueño). Los datos ajustan dinámicamente tu gasto energético neto en el diario de nutrición.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={wearable.isSyncing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${wearable.isSyncing ? "animate-spin" : ""}`} />
              <span>{wearable.isSyncing ? "Sincronizando..." : "Sincronizar Telemetría"}</span>
            </button>
          </div>
        </div>

        {/* Live Device Connection Status Strip */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs">
              <Watch className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{wearable.deviceName}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Enlazado & Activo
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Última sincronización: {wearable.lastSyncTime}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-1.5">
              <Battery className="w-4 h-4 text-emerald-600" />
              <span>{wearable.batteryLevel}% Batería</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Canal BLE Cifrado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Selector Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Ecosistema de Dispositivos Compatibles:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SUPPORTED_DEVICES.map((dev) => {
            const isSelected = wearable.connectedDevice === dev.type;
            return (
              <button
                key={dev.type}
                onClick={() => handleDeviceSwitch(dev)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{dev.icon}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                  {dev.brand}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {dev.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vital Telemetry Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Heart Rate Real-Time Card with Pulse Wave */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              Frecuencia Cardíaca
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sensor Óptico PPG
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-900">
              {wearable.heartRateCurrent}
            </span>
            <span className="text-sm font-semibold text-slate-500">lpm (bpm)</span>
          </div>

          {/* SVG Pulse Wave visual */}
          <div className="h-16 w-full bg-slate-950 rounded-xl p-2 flex items-center justify-between overflow-hidden relative">
            <div className="flex items-end h-full w-full gap-1.5 justify-between">
              {bpmWave.map((val, idx) => {
                const heightPercent = Math.min(100, Math.max(20, ((val - 50) / 45) * 100));
                return (
                  <div
                    key={idx}
                    className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-xs transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>
            <span className="absolute top-2 right-2 text-[9px] font-mono text-rose-400 bg-black/60 px-1.5 py-0.5 rounded">
              Tiempo real
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>En reposo: <strong className="text-slate-800">{wearable.restingHeartRate} lpm</strong></span>
            <span>Zona: <strong className="text-emerald-700">Zona 1 (Reposo Activo)</strong></span>
          </div>
        </div>

        {/* Active Energy Burned */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Gasto Calórico Activo
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Ajuste dinámico
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-sky-700">
              {wearable.activeCaloriesBurned}
            </span>
            <span className="text-sm font-semibold text-slate-500">kcal quemadas</span>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-200/70 rounded-xl text-xs text-sky-900 leading-relaxed">
            Este gasto se resta automáticamente en tu diario de nutrición, reflejando tu balance neto exacto.
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Objetivo diario de quema:</span>
            <strong className="text-slate-800 font-mono">600 kcal</strong>
          </div>
        </div>

        {/* Steps & Distance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-600" />
              Pasos & Distancia
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {Math.round((wearable.stepsCurrent / wearable.stepsGoal) * 100)}% de meta
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-900">
              {wearable.stepsCurrent.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500">pasos</span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (wearable.stepsCurrent / wearable.stepsGoal) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Distancia: {wearable.distanceKm} km</span>
              <span>Meta: {wearable.stepsGoal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Cadencia estimada:</span>
            <strong className="text-slate-800 font-mono">112 pasos/min</strong>
          </div>
        </div>

        {/* Sleep & Rest Analysis */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              Arquitectura del Sueño
            </span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Score: {wearable.sleepScore}/100
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-900">
              {wearable.sleepHours}
            </span>
            <span className="text-sm font-semibold text-slate-500">horas descansadas</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Profundo</span>
              <strong className="font-mono text-slate-800">1h 45m</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">REM</span>
              <strong className="font-mono text-slate-800">2h 10m</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Ligero</span>
              <strong className="font-mono text-slate-800">3h 50m</strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Eficiencia del sueño:</span>
            <strong className="text-emerald-700 font-mono">92% (Óptima)</strong>
          </div>
        </div>

        {/* HRV (Heart Rate Variability) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Variabilidad Cardíaca (HRV)
            </span>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Sistema Nervioso Autónomo
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-900">
              {wearable.hrv}
            </span>
            <span className="text-sm font-semibold text-slate-500">ms rMSSD</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            HRV en rango alto indica adecuada recuperación parasimpática y tolerancia metabólica al entrenamiento.
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Estado de recuperación:</span>
            <strong className="text-emerald-700">Listo para entrenar</strong>
          </div>
        </div>

        {/* SpO2 Blood Oxygen */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-600" />
              Saturación de Oxígeno (SpO2)
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Normal Clínico
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-900">
              {wearable.spo2}%
            </span>
            <span className="text-sm font-semibold text-slate-500">oximetría en sangre</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Niveles por encima del 95% garantizan una adecuada oxigenación mitocondrial durante el catabolismo de nutrientes.
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Frecuencia respiratoria:</span>
            <strong className="text-slate-800 font-mono">14 resp/min</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
