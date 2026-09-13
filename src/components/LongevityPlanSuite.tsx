import React, { useState } from "react";
import {
  Sparkles,
  HeartPulse,
  Brain,
  TrendingUp,
  ShieldCheck,
  Flame,
  Calendar,
  PlusCircle,
  MessageSquare,
  Send,
  RefreshCw,
  Activity,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from "recharts";
import { MealEntry, DailyNutritionalGoals, WearableVitals, MealType } from "../types";

interface LongevityPlanSuiteProps {
  meals: MealEntry[];
  goals: DailyNutritionalGoals;
  wearable: WearableVitals;
  selectedDate: string;
  onAddMealToDiary: (meal: MealEntry) => void;
}

interface ClinicalAuditData {
  longevityScore: number;
  inflammationStatus: string;
  metabolicFlexibility: string;
  glycemicSpikeRisk: string;
  summary: string;
  strengths: string[];
  recommendations: string[];
  biomarkerInsights: {
    fiberScore: number;
    proteinQualityScore: number;
    micronutrientDensityScore: number;
    cardiovascularElectrolyteScore: number;
  };
}

interface MealPlanGenerated {
  totalPlanCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Array<{
    mealType: "Desayuno" | "Almuerzo" | "Merienda" | "Cena";
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    clinicalBenefit: string;
  }>;
}

export const LongevityPlanSuite: React.FC<LongevityPlanSuiteProps> = ({
  meals,
  goals,
  wearable,
  selectedDate,
  onAddMealToDiary,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"audit" | "curve" | "planner" | "chat">("audit");

  // Audit state
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<ClinicalAuditData | null>(null);
  const [auditSource, setAuditSource] = useState<string>("");

  // Helper to map string to MealType
  const mapMealType = (t: string): MealType => {
    const low = t.toLowerCase();
    if (low.includes("desayuno")) return "desayuno";
    if (low.includes("almuerzo")) return "almuerzo";
    if (low.includes("cena")) return "cena";
    return "snack";
  };

  // Plan state
  const [planGoal, setPlanGoal] = useState<string>("Hipertrofia & Rendimiento");
  const [planPref, setPlanPref] = useState<string>("Mediterránea Alta en Proteína");
  const [planCalories, setPlanCalories] = useState<number>(goals.calorieTarget || 2200);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<MealPlanGenerated | null>(null);
  const [planAddedSuccess, setPlanAddedSuccess] = useState<boolean>(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: "¡Hola! Soy tu Nutricionista Clínico y Fisiólogo de NutriScan Pro. Estoy sincronizado con tus comidas registradas hoy y las métricas de tu wearable. ¿En qué puedo orientarte hoy?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Filter day's meals
  const dayMeals = (meals || []).filter((m) => m && m.date === selectedDate);
  const totalCals = dayMeals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
  const totalProt = dayMeals.reduce((acc, m) => acc + (m.macros?.protein || 0), 0);
  const totalCarbs = dayMeals.reduce((acc, m) => acc + (m.macros?.carbs || 0), 0);
  const totalFat = dayMeals.reduce((acc, m) => acc + (m.macros?.fat || 0), 0);
  const totalFiber = dayMeals.reduce((acc, m) => acc + (m.macros?.fiber || 0), 0);

  // Generate or fetch audit
  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/ai/clinical-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: dayMeals,
          goals,
          wearable,
        }),
      });
      const data = await res.json();
      if (data.audit) {
        setAuditData(data.audit);
        setAuditSource(data.source || "gemini");
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Generate Meal Plan
  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    setPlanAddedSuccess(false);
    try {
      const res = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCalories: Number(planCalories),
          goal: planGoal,
          preference: planPref,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setGeneratedPlan(data.plan);
      }
    } catch (err) {
      console.error("Meal plan error:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  // Bulk add entire generated plan to Diary
  const handleApplyPlanToDiary = () => {
    if (!generatedPlan) return;
    generatedPlan.meals.forEach((m, idx) => {
      onAddMealToDiary({
        id: `plan-${Date.now()}-${idx}`,
        date: selectedDate,
        timestamp: new Date().toISOString(),
        mealType: mapMealType(m.mealType),
        foodName: m.name,
        description: `${m.description} • [Generado por IA NutriScan]`,
        portion: "1 porción clínica",
        totalCalories: m.calories,
        macros: {
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          fiber: m.fiber,
          sugar: Math.round(m.carbs * 0.15),
          saturatedFat: Math.round(m.fat * 0.2),
        },
        micronutrients: {
          sodium: 250,
          potassium: 650,
          calcium: 80,
          iron: 2.5,
          vitaminC: 25,
          cholesterol: 30,
        },
        items: [
          {
            name: m.name,
            portion: "1 porción clínica",
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
          },
        ],
        dietaryTags: ["Plan Clínico IA", "Balance Longevidad"],
        clinicalNotes: m.clinicalBenefit,
        confidence: 98,
        healthScore: 95,
        source: "manual",
      });
    });
    setPlanAddedSuccess(true);
  };

  // Chat send
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat-nutritionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.text,
          })),
          userStats: {
            caloriesConsumed: totalCals,
            calorieTarget: goals.calorieTarget,
            proteinConsumed: totalProt,
            proteinTarget: goals.proteinTarget,
            waterIntakeMl: 1800,
            steps: wearable.stepsCurrent,
            activeCalories: wearable.activeCaloriesBurned,
            sleepHours: wearable.sleepHours,
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "He procesado tu consulta. Mantén tu hidratación y balance proteico." },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Hubo una pequeña intermitencia de red, pero recuerda que priorizar proteína magra y vegetales de bajo índice glucémico mantendrá tus niveles de energía estables.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Glycemic Curve Simulation Model
  // Fasting baseline ~85 mg/dL. Peak depends on carbs vs fiber buffer.
  const fiberBuffering = Math.min(0.45, (totalFiber / 35) * 0.4);
  const carbFactor = (totalCarbs / 200);
  const curveData = [
    { time: "07:00", glucose: 84, baseline: 85, optimalLimit: 120 },
    { time: "08:30 (Desayuno)", glucose: Math.round(85 + 32 * carbFactor * (1 - fiberBuffering)), baseline: 85, optimalLimit: 120 },
    { time: "10:00", glucose: Math.round(85 + 16 * carbFactor * (1 - fiberBuffering)), baseline: 85, optimalLimit: 120 },
    { time: "11:30", glucose: 88, baseline: 85, optimalLimit: 120 },
    { time: "13:30 (Almuerzo)", glucose: Math.round(85 + 46 * carbFactor * (1 - fiberBuffering)), baseline: 85, optimalLimit: 120 },
    { time: "15:00", glucose: Math.round(85 + 24 * carbFactor * (1 - fiberBuffering)), baseline: 85, optimalLimit: 120 },
    { time: "17:00", glucose: 89, baseline: 85, optimalLimit: 120 },
    { time: "18:30 (Merienda)", glucose: Math.round(85 + 18 * carbFactor * (1 - fiberBuffering)), baseline: 85, optimalLimit: 120 },
    { time: "21:00 (Cena)", glucose: Math.round(85 + 38 * carbFactor * (1 - fiberBuffering)), baseline: 85, optimalLimit: 120 },
    { time: "23:00 (Reposo)", glucose: 86, baseline: 85, optimalLimit: 120 },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suite Clínica de Longevidad & Nutrición IA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Optimización Metabólica, Planes Personalizados & Asistencia Médica
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Integra algoritmos avanzados de visión computacional y fisiología nutricional para predecir curvas glucémicas, auditar biomarcadores inflamatorios y generar planes dietéticos respaldados por la evidencia científica.
          </p>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Calorías Hoy</span>
              <span className="text-lg font-black">{totalCals} <span className="text-xs font-normal text-slate-300">/ {goals.calorieTarget} kcal</span></span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Proteína Consumida</span>
              <span className="text-lg font-black">{totalProt.toFixed(0)}g <span className="text-xs font-normal text-slate-300">/ {goals.proteinTarget}g</span></span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Fibra Prebiótica</span>
              <span className="text-lg font-black">{totalFiber.toFixed(0)}g <span className="text-xs font-normal text-slate-300">/ 30g meta</span></span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">HRV & Vitalidad</span>
              <span className="text-lg font-black">{wearable.hrv} ms <span className="text-xs font-normal text-emerald-400">Óptimo</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "audit"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Auditoría de Longevidad</span>
        </button>

        <button
          onClick={() => setActiveSubTab("curve")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "curve"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Simulador de Curva Glucémica</span>
        </button>

        <button
          onClick={() => setActiveSubTab("planner")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "planner"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Generador de Planes IA</span>
        </button>

        <button
          onClick={() => setActiveSubTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "chat"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Consulta Nutricionista IA</span>
        </button>
      </div>

      {/* SUB-TAB 1: AUDITORÍA CLÍNICA DE LONGEVIDAD */}
      {activeSubTab === "audit" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Trigger Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Auditoría de Salud Celular e Inflamación</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Examina el impacto de tus {dayMeals.length} comidas registradas en tus biomarcadores: equilibrio de electrolitos (Potasio vs Sodio), amortiguación glicémica con fibra y calidad de proteína.
              </p>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={auditLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {auditLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Analizando con IA Clínica...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{auditData ? "Re-evaluar Auditoría" : "Ejecutar Auditoría Clínica"}</span>
                </>
              )}
            </button>
          </div>

          {/* Audit Results View */}
          {auditData && (
            <div className="space-y-6">
              {/* Top Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 uppercase">Índice Longevidad</span>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{auditData.longevityScore}</span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${auditData.longevityScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 uppercase">Estatus Inflamatorio</span>
                    <Flame className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-lg font-extrabold text-emerald-700 block mt-1">
                    {auditData.inflammationStatus}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-2 block">
                    Optimizado por fitoquímicos y fibra activa.
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 uppercase">Flexibilidad Metabólica</span>
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-lg font-extrabold text-blue-700 block mt-1">
                    {auditData.metabolicFlexibility}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-2 block">
                    Capacidad de alternar sustratos energéticos.
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 uppercase">Riesgo de Pico Glucémico</span>
                    <Activity className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-lg font-extrabold text-teal-700 block mt-1">
                    {auditData.glycemicSpikeRisk}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-2 block">
                    Buffer de fibra y lípidos monoinsaturados.
                  </span>
                </div>
              </div>

              {/* Biomarkers Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Desglose de Pilares Celulares</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Salud Microbiota & Fibra</span>
                      <span className="text-emerald-700 font-mono">{auditData.biomarkerInsights.fiberScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${auditData.biomarkerInsights.fiberScore}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Calidad Proteica & Aminoácidos</span>
                      <span className="text-blue-700 font-mono">{auditData.biomarkerInsights.proteinQualityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${auditData.biomarkerInsights.proteinQualityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Densidad Micronutricional</span>
                      <span className="text-teal-700 font-mono">{auditData.biomarkerInsights.micronutrientDensityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${auditData.biomarkerInsights.micronutrientDensityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Balance Potasio / Sodio</span>
                      <span className="text-indigo-700 font-mono">{auditData.biomarkerInsights.cardiovascularElectrolyteScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${auditData.biomarkerInsights.cardiovascularElectrolyteScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary & Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fortalezas Nutricionales Detectadas</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-emerald-900">
                    {auditData.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span>Prescripciones Clínicas para Optimizar</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {auditData.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SIMULADOR DE CURVA GLUCÉMICA */}
      {activeSubTab === "curve" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Simulación de Glucosa Postprandial & Insulina</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Modelo predictivo continuo basado en tus comidas registradas ({totalCarbs}g carbohidratos amortiguados por {totalFiber}g de fibra).
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Curva Estimada
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-300" /> Línea Base (85 mg/dL)
                </span>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stop-color="#10b981" stop-opacity={0.4} />
                      <stop offset="95%" stop-color="#10b981" stop-opacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis domain={[70, 150]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-xl border border-slate-800">
                            <span className="font-bold block text-emerald-400">{data.time}</span>
                            <span>Glucosa simulada: <strong>{data.glucose} mg/dL</strong></span>
                            <span className="text-[10px] text-slate-400 block">
                              {data.glucose > 130 ? "Pico moderado" : "Zona euglucémica óptima"}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={85} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Basal 85 mg/dL", fill: "#94a3b8", fontSize: 10 }} />
                  <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "Límite Clínico 140", fill: "#f43f5e", fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="glucose"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#glucoseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Physiological Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Amortiguación por Fibra</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {Math.round(fiberBuffering * 100)}% de Atenuación
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  La fibra soluble ralentiza el vaciado gástrico y la absorción de glucosa.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Carga Glucémica Diaria</span>
                <span className="text-base font-extrabold text-slate-900">
                  {totalCarbs > 200 ? "Moderada" : "Controlada y Óptima"}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Previene la fatiga postprandial y favorece la autofagia nocturna.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Sinergia con Wearable</span>
                <span className="text-base font-extrabold text-teal-700">
                  {wearable.stepsCurrent} Pasos
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  La contracción muscular activa transportadores GLUT4 independientes de insulina.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GENERADOR DE PLANES NUTRICIONALES IA */}
      {activeSubTab === "planner" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Planner Configuration Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Generador de Plan Nutricional Clínico</span>
              </h3>
              <p className="text-xs text-slate-500">
                Crea un menú balanceado para 1 día completo con 4 comidas estructuradas, recetas y beneficios metabólicos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Objetivo Fisiológico</label>
                <select
                  value={planGoal}
                  onChange={(e) => setPlanGoal(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Hipertrofia & Rendimiento">Hipertrofia & Rendimiento Muscular</option>
                  <option value="Déficit Calórico & Quema de Grasa">Déficit Calórico & Pérdida Grasa</option>
                  <option value="Longevidad & Antiinflamatorio">Longevidad & Antiinflamatorio</option>
                  <option value="Keto & Cetosis Controlada">Keto & Cetosis Controlada</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Patrón Dietético</label>
                <select
                  value={planPref}
                  onChange={(e) => setPlanPref(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Mediterránea Alta en Proteína">Mediterránea Alta en Proteína</option>
                  <option value="Vegetariana Completa con Legumbres">Vegetariana con Legumbres & Huevos</option>
                  <option value="Omnívora de Alta Densidad de Nutrientes">Omnívora de Alta Densidad</option>
                  <option value="Baja en FODMAPs & Digestiva">Baja en FODMAPs / Anti-hinchazón</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Calorías Diarias Meta</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={planCalories}
                    onChange={(e) => setPlanCalories(Number(e.target.value))}
                    min={1200}
                    max={4500}
                    step={50}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-bold shrink-0">kcal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleGeneratePlan}
                disabled={planLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {planLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Diseñando Plan Nutricional...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Generar Plan Nutricional con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Plan Display */}
          {generatedPlan && (
            <div className="space-y-6">
              {/* Plan Header Bar */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Plan Generado con Éxito</span>
                  <h4 className="text-base font-extrabold">{planGoal} • {planPref}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span>{generatedPlan.totalPlanCalories} kcal</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-bold">P: {generatedPlan.totalProtein}g</span>
                    <span>•</span>
                    <span className="text-blue-300 font-bold">C: {generatedPlan.totalCarbs}g</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">G: {generatedPlan.totalFat}g</span>
                  </div>
                </div>

                <button
                  onClick={handleApplyPlanToDiary}
                  disabled={planAddedSuccess}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                    planAddedSuccess
                      ? "bg-emerald-500 text-white cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  }`}
                >
                  {planAddedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Añadido a tu Diario de Hoy!</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-emerald-200" />
                      <span>Añadir las 4 Comidas al Diario</span>
                    </>
                  )}
                </button>
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedPlan.meals.map((meal, index) => (
                  <div key={index} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {meal.mealType}
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-900">
                        {meal.calories} kcal
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{meal.name}</h5>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{meal.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-emerald-700 font-bold">P: {meal.protein}g</span>
                      <span>•</span>
                      <span className="text-blue-700 font-bold">C: {meal.carbs}g</span>
                      <span>•</span>
                      <span className="text-amber-700 font-bold">G: {meal.fat}g</span>
                      <span>•</span>
                      <span className="text-purple-700 font-bold">Fibra: {meal.fiber}g</span>
                    </div>

                    <div className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{meal.clinicalBenefit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: CONSULTA NUTRICIONISTA IA EN VIVO */}
      {activeSubTab === "chat" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Nutricionista Clínico IA NutriScan</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado con tus comidas de hoy ({totalCals} kcal)
                  </span>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChatInput("¿Qué me sugieres cenar hoy para cumplir mi meta de proteína?")}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  ¿Qué ceno hoy?
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput("¿Cómo está mi ratio de electrolitos y qué alimento me ayuda?")}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  Electrolitos
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none shadow-xs"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 shadow-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>El especialista está redactando su consejo...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu consulta nutricional (ej. ¿Qué merienda me recomiendas ahora?)..."
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
