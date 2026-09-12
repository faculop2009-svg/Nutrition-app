import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Droplets,
  Flame,
  Watch,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  PieChart,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Apple,
  Info,
  Calendar,
  Search,
  Check
} from "lucide-react";
import {
  MealEntry,
  DailyNutritionalGoals,
  WearableVitals,
  MealType,
} from "../types";
import { EXPANDED_FOODS_DATABASE } from "../data/foods";

interface FoodDiaryProps {
  meals: MealEntry[];
  goals: DailyNutritionalGoals;
  wearable: WearableVitals;
  waterIntakeMl: number;
  onUpdateWater: (amount: number) => void;
  onDeleteMeal: (mealId: string) => void;
  onAddQuickMeal: (meal: MealEntry) => void;
  selectedDate: string;
  onNavigateToScan: () => void;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({
  meals,
  goals,
  wearable,
  waterIntakeMl,
  onUpdateWater,
  onDeleteMeal,
  onAddQuickMeal,
  selectedDate,
  onNavigateToScan,
}) => {
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickMealType, setQuickMealType] = useState<MealType>("desayuno");
  const [quickName, setQuickName] = useState("");
  const [quickCalories, setQuickCalories] = useState(250);
  const [quickProtein, setQuickProtein] = useState(15);
  const [quickCarbs, setQuickCarbs] = useState(25);
  const [quickFat, setQuickFat] = useState(8);
  const [quickImageUrl, setQuickImageUrl] = useState<string | undefined>(undefined);
  const [quickDbSearch, setQuickDbSearch] = useState("");

  // Filter meals for selected date
  const dayMeals = (meals || []).filter((m) => m && m.date === selectedDate);

  // Totals
  const totalCaloriesIngested = dayMeals.reduce((acc, m) => acc + (m?.totalCalories || 0), 0);
  const totalProtein = dayMeals.reduce((acc, m) => acc + (m?.macros?.protein || 0), 0);
  const totalCarbs = dayMeals.reduce((acc, m) => acc + (m?.macros?.carbs || 0), 0);
  const totalFat = dayMeals.reduce((acc, m) => acc + (m?.macros?.fat || 0), 0);
  const totalFiber = dayMeals.reduce((acc, m) => acc + (m?.macros?.fiber || 0), 0);

  // Targets & Dynamic Net Calorie Calculation
  const calorieTarget = goals?.calorieTarget || 2150;
  const proteinTarget = goals?.proteinTarget || 140;
  const carbsTarget = goals?.carbsTarget || 220;
  const fatTarget = goals?.fatTarget || 65;
  const fiberTarget = goals?.fiberTarget || 32;
  const waterTarget = goals?.waterTarget || 2800;

  const activeBurned = wearable?.activeCaloriesBurned ?? 0;
  const deviceName = wearable?.deviceName ? wearable.deviceName.split(" ")[0] : "Wearable";
  const netCalories = totalCaloriesIngested - activeBurned;
  const remainingCalories = calorieTarget - totalCaloriesIngested;

  // Meal sections
  const mealSections: { type: MealType; title: string; icon: any; desc: string }[] = [
    { type: "desayuno", title: "Desayuno", icon: Coffee, desc: "Energía matutina y activación metabólica" },
    { type: "almuerzo", title: "Almuerzo", icon: Sun, desc: "Comida principal rica en nutrientes" },
    { type: "cena", title: "Cena", icon: Moon, desc: "Digestión ligera y reparación nocturna" },
    { type: "snack", title: "Snacks & Colaciones", icon: Cookie, desc: "Control glucémico entre comidas" },
  ];

  const handleCreateQuickMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newMeal: MealEntry = {
      id: `quick-${Date.now()}`,
      date: selectedDate,
      timestamp: new Date().toISOString(),
      mealType: quickMealType,
      foodName: quickName.trim(),
      description: "Registro en diario nutricional",
      portion: "1 porción estándar",
      totalCalories: Number(quickCalories),
      imageUrl: quickImageUrl,
      macros: {
        protein: Number(quickProtein),
        carbs: Number(quickCarbs),
        fat: Number(quickFat),
        fiber: 3.0,
        sugar: 2.0,
        saturatedFat: 1.5,
      },
      micronutrients: {
        sodium: 200,
        potassium: 350,
        calcium: 50,
        iron: 1.5,
        vitaminC: 5.0,
      },
      items: [{ name: quickName.trim(), portion: "1 porción", calories: Number(quickCalories), protein: Number(quickProtein), carbs: Number(quickCarbs), fat: Number(quickFat) }],
      dietaryTags: ["Registro Manual"],
      confidence: 100,
      healthScore: 88,
      source: "manual",
    };

    onAddQuickMeal(newMeal);
    setShowQuickModal(false);
    setQuickName("");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Caloric Balance Overview Hero */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Diario de Nutrición
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Fecha: {selectedDate}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Resumen Energético Diario
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              Añadir Rápido
            </button>
            <button
              onClick={onNavigateToScan}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Escanear con Foto
            </button>
          </div>
        </div>

        {/* Dynamic Energy Balance Formula Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          
          {/* Main Caloric Dial */}
          <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Presupuesto Calórico
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400">
                Meta: {goals.calorieTarget} kcal
              </span>
            </div>

            <div className="my-5">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {Math.max(0, remainingCalories)}
              </span>
              <span className="text-sm font-semibold text-emerald-400 ml-2">kcal restantes</span>
              <p className="text-xs text-slate-400 mt-1">
                {remainingCalories >= 0
                  ? `Estás dentro de tu objetivo metabólico para hoy.`
                  : `Superaste la meta en ${Math.abs(remainingCalories)} kcal.`}
              </p>
            </div>

            {/* Calorie Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Consumidas: {totalCaloriesIngested}</span>
                <span>{Math.round((totalCaloriesIngested / calorieTarget) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalCaloriesIngested / calorieTarget) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Equation Breakdown: Ingested - Burned = Net */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Ingested */}
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider">Ingeridas</span>
                <Flame className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {totalCaloriesIngested}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">kcal</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                En {dayMeals.length} registros hoy
              </span>
            </div>

            {/* Burned on Wearable */}
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-semibold uppercase tracking-wider">Quemadas Wearable</span>
                <Watch className="w-4 h-4 text-sky-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-sky-700 font-mono">
                  -{activeBurned}
                </span>
                <span className="text-xs text-slate-500 font-medium ml-1">kcal</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Sincronizado vía {deviceName}
              </span>
            </div>

            {/* Net Energy Balance */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-emerald-800 text-xs">
                <span className="font-bold uppercase tracking-wider">Balance Neto</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-800 font-mono">
                  {netCalories}
                </span>
                <span className="text-xs text-emerald-700 font-medium ml-1">kcal netas</span>
              </div>
              <span className="text-[11px] text-emerald-700 block mt-1 font-medium">
                Gasto activo compensado
              </span>
            </div>

          </div>

        </div>

        {/* Macronutrient Status Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          
          {/* Protein */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Proteína</span>
              <span className="font-mono text-emerald-700">
                {totalProtein.toFixed(1)} / {proteinTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalProtein / proteinTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              {Math.max(0, proteinTarget - totalProtein).toFixed(1)}g para alcanzar objetivo
            </span>
          </div>

          {/* Carbs */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Carbohidratos</span>
              <span className="font-mono text-sky-700">
                {totalCarbs.toFixed(1)} / {carbsTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCarbs / carbsTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              {Math.max(0, carbsTarget - totalCarbs).toFixed(1)}g restantes
            </span>
          </div>

          {/* Fat */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Grasas Totales</span>
              <span className="font-mono text-amber-700">
                {totalFat.toFixed(1)} / {fatTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFat / fatTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              {Math.max(0, fatTarget - totalFat).toFixed(1)}g restantes
            </span>
          </div>

          {/* Fiber */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Fibra Dietética</span>
              <span className="font-mono text-teal-700">
                {totalFiber.toFixed(1)} / {fiberTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFiber / fiberTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              {Math.round((totalFiber / fiberTarget) * 100)}% de salud digestiva
            </span>
          </div>

        </div>
      </div>

      {/* Water Intake Tracker Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Hidratación Diaria</h3>
              <span className="text-xs font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {waterIntakeMl} / {waterTarget} ml
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Un nivel óptimo de agua acelera la lipólisis y mantiene la presión osmótica celular.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onUpdateWater(waterIntakeMl + 250)}
            className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all"
          >
            +250 ml (Vaso)
          </button>
          <button
            onClick={() => onUpdateWater(waterIntakeMl + 500)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition-all"
          >
            +500 ml (Botella)
          </button>
          <button
            onClick={() => onUpdateWater(Math.max(0, waterIntakeMl - 250))}
            className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-medium"
            title="Restar 250ml"
          >
            -250ml
          </button>
        </div>
      </div>

      {/* Categorized Meal Sections */}
      <div className="space-y-6">
        {mealSections.map((sec) => {
          const Icon = sec.icon;
          const sectionMeals = dayMeals.filter((m) => m.mealType === sec.type);
          const sectionCalories = sectionMeals.reduce((acc, m) => acc + m.totalCalories, 0);

          return (
            <div key={sec.type} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              
              {/* Section Header */}
              <div className="p-4 sm:p-5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{sec.title}</h3>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {sectionCalories} kcal
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 hidden sm:block">{sec.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setQuickMealType(sec.type);
                      setShowQuickModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200/80 bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Items List in this section */}
              {sectionMeals.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <p>No has registrado alimentos en {sec.title.toLowerCase()} para esta fecha.</p>
                  <button
                    onClick={onNavigateToScan}
                    className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Escanear plato con foto
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {sectionMeals.map((meal) => (
                    <div key={meal.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        {meal.imageUrl ? (
                          <img
                            src={meal.imageUrl}
                            alt={meal.foodName}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <Apple className="w-6 h-6" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{meal.foodName}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                              {meal.portion}
                            </span>
                            {meal.healthScore && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Score: {meal.healthScore}/100
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {meal.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1.5">
                            <span>Proteína: <strong className="text-slate-700">{meal.macros.protein}g</strong></span>
                            <span>Carbos: <strong className="text-slate-700">{meal.macros.carbs}g</strong></span>
                            <span>Grasas: <strong className="text-slate-700">{meal.macros.fat}g</strong></span>
                            {meal.macros.fiber ? <span>Fibra: <strong className="text-slate-700">{meal.macros.fiber}g</strong></span> : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-lg font-black text-slate-900 font-mono block">
                            {meal.totalCalories}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            kcal
                          </span>
                        </div>
                        <button
                          onClick={() => onDeleteMeal(meal.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Quick Meal Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Registro Rápido de Alimento</h3>
              <button
                onClick={() => setShowQuickModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Fast Food Database Search & Autofill */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span>Buscar en Base de Datos de Alimentos (40+ items con foto):</span>
                <span className="text-[10px] text-emerald-600 font-normal">Autocompleta calorías y foto</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={quickDbSearch}
                  onChange={(e) => setQuickDbSearch(e.target.value)}
                  placeholder="Ej. Salmón, Avena, Yogur Griego, Aguacate..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>

              {/* Suggestions List */}
              {quickDbSearch.trim() && (
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
                  {EXPANDED_FOODS_DATABASE.filter(
                    (f) =>
                      f.name.toLowerCase().includes(quickDbSearch.toLowerCase()) ||
                      f.category.toLowerCase().includes(quickDbSearch.toLowerCase()) ||
                      f.brand.toLowerCase().includes(quickDbSearch.toLowerCase())
                  )
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.barcode}
                        onClick={() => {
                          setQuickName(item.name);
                          setQuickCalories(item.calories);
                          setQuickProtein(item.protein);
                          setQuickCarbs(item.carbs);
                          setQuickFat(item.fat);
                          setQuickImageUrl(item.imageUrl);
                          setQuickDbSearch("");
                        }}
                        className="p-2 hover:bg-emerald-50 cursor-pointer flex items-center gap-2.5 transition-colors"
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{item.brand} • {item.serving}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700 shrink-0">
                          {item.calories} kcal
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {quickImageUrl && (
              <div className="flex items-center gap-3 p-2 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
                <img
                  src={quickImageUrl}
                  alt="Alimento seleccionado"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-emerald-300"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Fotografía Vinculada</span>
                  <span className="text-xs font-semibold text-slate-800 truncate block">{quickName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickImageUrl(undefined)}
                  className="text-xs text-slate-400 hover:text-rose-600 px-2"
                >
                  Quitar foto
                </button>
              </div>
            )}

            <form onSubmit={handleCreateQuickMeal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Comida</label>
                <select
                  value={quickMealType}
                  onChange={(e) => setQuickMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="snack">Snack / Colación</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre del alimento o plato</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Batido de Proteína Whey con Plátano"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Calorías (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    value={quickCalories}
                    onChange={(e) => setQuickCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Carbohidratos (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Grasas (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={quickFat}
                    onChange={(e) => setQuickFat(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Guardar Alimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
