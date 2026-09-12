import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  PieChart as PieIcon,
  Flame,
  Dna,
  Activity,
  CheckCircle2,
  Download,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { MealEntry, DailyNutritionalGoals, WearableVitals } from "../types";

interface AnalyticsDashboardProps {
  meals: MealEntry[];
  goals: DailyNutritionalGoals;
  wearable: WearableVitals;
}

// 14-day historical trend data for rich interactive visualization
const HISTORICAL_DATA = [
  { day: "01 Sep", ingeridas: 2100, quemadas: 520, meta: 2150, peso: 74.8, proteina: 135, carbos: 210, grasas: 62 },
  { day: "02 Sep", ingeridas: 2050, quemadas: 610, meta: 2150, peso: 74.7, proteina: 142, carbos: 195, grasas: 58 },
  { day: "03 Sep", ingeridas: 2180, quemadas: 540, meta: 2150, peso: 74.6, proteina: 138, carbos: 225, grasas: 66 },
  { day: "04 Sep", ingeridas: 1980, quemadas: 490, meta: 2150, peso: 74.5, proteina: 130, carbos: 190, grasas: 55 },
  { day: "05 Sep", ingeridas: 2240, quemadas: 680, meta: 2150, peso: 74.4, proteina: 148, carbos: 230, grasas: 68 },
  { day: "06 Sep", ingeridas: 2090, quemadas: 550, meta: 2150, peso: 74.3, proteina: 139, carbos: 205, grasas: 61 },
  { day: "07 Sep", ingeridas: 2150, quemadas: 510, meta: 2150, peso: 74.2, proteina: 140, carbos: 215, grasas: 64 },
  { day: "08 Sep", ingeridas: 2020, quemadas: 590, meta: 2150, peso: 74.2, proteina: 136, carbos: 198, grasas: 59 },
  { day: "09 Sep", ingeridas: 2130, quemadas: 530, meta: 2150, peso: 74.1, proteina: 144, carbos: 212, grasas: 63 },
  { day: "10 Sep", ingeridas: 2190, quemadas: 620, meta: 2150, peso: 74.0, proteina: 146, carbos: 220, grasas: 65 },
  { day: "11 Sep", ingeridas: 2080, quemadas: 560, meta: 2150, peso: 73.9, proteina: 141, carbos: 208, grasas: 60 },
  { day: "12 Sep (Hoy)", ingeridas: 1180, quemadas: 540, meta: 2150, peso: 73.8, proteina: 90, carbos: 83, grasas: 46 },
];

const MACRO_PIE_DATA = [
  { name: "Proteína", value: 30, color: "#059669" }, // Emerald
  { name: "Carbohidratos", value: 45, color: "#0284c7" }, // Sky
  { name: "Grasas Saludables", value: 25, color: "#d97706" }, // Amber
];

const MICRONUTRIENT_COMPLIANCE = [
  { nutrient: "Fibra Dietética", cumplido: 96, color: "#059669" },
  { nutrient: "Potasio", cumplido: 88, color: "#0d9488" },
  { nutrient: "Calcio", cumplido: 92, color: "#0284c7" },
  { nutrient: "Hierro", cumplido: 95, color: "#6366f1" },
  { nutrient: "Vitamina C", cumplido: 104, color: "#10b981" },
  { nutrient: "Sodio (Control)", cumplido: 84, color: "#f59e0b" },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  meals,
  goals,
  wearable,
}) => {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Inteligencia Analítica & Progresión Longitudinal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Análisis Nutricional & Tendencias a Largo Plazo
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Monitorea la correlación exacta entre calorías consumidas, gasto calórico activo del wearable, adherencia de macronutrientes y evolución de peso corporal.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {(["7d", "14d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {range === "7d" ? "Últimos 7 días" : range === "14d" ? "14 días" : "30 días"}
              </button>
            ))}
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Promedio Ingesta Diaria
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              2,110 <span className="text-xs text-slate-500 font-medium">kcal</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              98.1% apego a meta
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Gasto Wearable Medio
            </span>
            <span className="text-2xl font-black text-sky-700 font-mono mt-1 block">
              568 <span className="text-xs text-slate-500 font-medium">kcal/día</span>
            </span>
            <span className="text-[11px] text-sky-700 font-semibold block mt-1">
              Constancia deportiva alta
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Proteína Promedio
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              142 <span className="text-xs text-slate-500 font-medium">g/día</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              1.9g / kg de peso magro
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Score Metabólico Global
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
              95.4 <span className="text-xs text-slate-500 font-medium">/100</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              Rango Clínico Óptimo
            </span>
          </div>

        </div>
      </div>

      {/* Main Graph 1: Calories Ingested vs Burned on Wearable */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              Histórico Calórico: Ingesta vs Gasto Activo Wearable
            </h3>
            <p className="text-xs text-slate-500">
              Comparativa diaria de ingesta total frente a gasto activo registrado por Apple Watch / Garmin.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" /> Ingeridas (kcal)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" /> Quemadas Wearable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 inline-block" /> Meta (2,150)
            </span>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HISTORICAL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngeridas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorQuemadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 2600]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              <Area
                type="monotone"
                dataKey="ingeridas"
                name="Calorías Ingeridas"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorIngeridas)"
              />
              <Area
                type="monotone"
                dataKey="quemadas"
                name="Quemadas Wearable"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorQuemadas)"
              />
              <Line
                type="monotone"
                dataKey="meta"
                name="Meta Calórica"
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Macro Distribution Donut & Weight Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Macro Distribution Donut */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Distribución Calórica de Macros
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Últimas 2 semanas</span>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MACRO_PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MACRO_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute text-center pointer-events-none">
              <span className="text-xl font-black font-mono text-slate-900 block">40/35/25</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Ratio Óptimo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-emerald-700 font-bold block">Proteína</span>
              <span className="text-base font-black text-slate-900 font-mono">30%</span>
              <span className="text-[9px] text-slate-400 block">140g objetivo</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-sky-700 font-bold block">Carbohidratos</span>
              <span className="text-base font-black text-slate-900 font-mono">45%</span>
              <span className="text-[9px] text-slate-400 block">220g objetivo</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-amber-700 font-bold block">Grasas</span>
              <span className="text-base font-black text-slate-900 font-mono">25%</span>
              <span className="text-[9px] text-slate-400 block">65g objetivo</span>
            </div>
          </div>
        </div>

        {/* Weight & Body Recomp Trend */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Evolución de Peso Corporal & Recomposición
              </h3>
              <p className="text-xs text-slate-500">
                Pérdida de tejido adiposo gradual con preservación de masa libre de grasa.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              -1.0 kg en 12 días
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[73.5, 75.2]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  name="Peso (kg)"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#059669" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <span>Ritmo de pérdida semanal: <strong>-0.45 kg/semana</strong></span>
            <span className="text-[11px] text-emerald-700 font-medium">Tasa metabólica conservada</span>
          </div>
        </div>

      </div>

      {/* Micronutrient Compliance Index */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Dna className="w-4 h-4 text-teal-600" />
              Índice de Cumplimiento de Micronutrientes Esenciales
            </h3>
            <p className="text-xs text-slate-500">
              Porcentaje alcanzado respecto a la Ingesta Diaria Recomendada (IDR) internacional.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">Meta: ≥100% IDR</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {MICRONUTRIENT_COMPLIANCE.map((item) => (
            <div key={item.nutrient} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{item.nutrient}</span>
                <span className="font-mono font-bold text-slate-900">{item.cumplido}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, item.cumplido)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Densidad óptima</span>
                <span className="text-emerald-700 font-medium">Adecuado</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
