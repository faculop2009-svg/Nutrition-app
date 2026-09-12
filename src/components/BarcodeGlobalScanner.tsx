import React, { useState, useEffect, useMemo } from "react";
import {
  Barcode,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Flame,
  Check,
  Package,
  Layers,
  HeartPulse,
  Filter,
  SlidersHorizontal,
  Eye,
  ArrowUpDown,
  X,
  Scale,
  Zap,
  Info
} from "lucide-react";
import { FoodDatabaseItem, MealEntry, MealType } from "../types";
import { EXPANDED_FOODS_DATABASE, FOOD_CATEGORIES } from "../data/foods";

interface BarcodeGlobalScannerProps {
  onAddMealToDiary: (meal: MealEntry) => void;
  selectedDate: string;
}

export const BarcodeGlobalScanner: React.FC<BarcodeGlobalScannerProps> = ({
  onAddMealToDiary,
  selectedDate,
}) => {
  // Navigation between Catalog and Barcode Scanner
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "scanner">("catalog");

  // Barcode search / scan state
  const [barcodeInput, setBarcodeInput] = useState("8480000164210");
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<FoodDatabaseItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("desayuno");
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Catalog search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<"default" | "calories_asc" | "calories_desc" | "protein_desc" | "nutriscore">("default");
  const [activeNutriFilter, setActiveNutriFilter] = useState<string | null>(null);

  // Modal inspection & portion adjuster
  const [inspectedFood, setInspectedFood] = useState<FoodDatabaseItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [customGrams, setCustomGrams] = useState<number | null>(null);

  // Initial load
  useEffect(() => {
    lookupBarcode("8480000164210");
  }, []);

  const lookupBarcode = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setAddedSuccess(false);

    try {
      // First check local database
      const foundInDb = EXPANDED_FOODS_DATABASE.find(
        (item) => item.barcode === code.trim()
      );
      if (foundInDb) {
        setProductData(foundInDb);
        return;
      }

      const res = await fetch(`/api/barcode/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (res.ok && data.product) {
        setProductData(data.product);
      } else {
        throw new Error(data.error || "Producto no encontrado en la base global");
      }
    } catch (err: any) {
      console.warn("Barcode lookup error:", err);
      // Fallback to first matching item or safe generic
      const fallback = EXPANDED_FOODS_DATABASE.find((b) => b.barcode.startsWith(code.trim().slice(0, 4)));
      if (fallback) {
        setProductData(fallback);
      } else {
        setErrorMessage(
          `Código de barras "${code}" no hallado. Puedes seleccionar un alimento del catálogo ampliado.`
        );
        setProductData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScan = () => {
    setIsScanningSimulated(true);
    setActiveSubTab("scanner");
    const sampleItems = EXPANDED_FOODS_DATABASE.slice(0, 10);
    const randomPreset = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    setBarcodeInput(randomPreset.barcode);

    setTimeout(() => {
      setIsScanningSimulated(false);
      lookupBarcode(randomPreset.barcode);
    }, 1100);
  };

  const handleOpenInspector = (item: FoodDatabaseItem) => {
    setInspectedFood(item);
    setPortionMultiplier(1);
    setCustomGrams(null);
    setAddedSuccess(false);
  };

  const handleAddInspectedToDiary = () => {
    if (!inspectedFood) return;

    const mult = customGrams ? customGrams / 100 : portionMultiplier;
    const finalCalories = Math.round(inspectedFood.calories * mult);
    const finalProtein = Number((inspectedFood.protein * mult).toFixed(1));
    const finalCarbs = Number((inspectedFood.carbs * mult).toFixed(1));
    const finalFat = Number((inspectedFood.fat * mult).toFixed(1));
    const finalFiber = Number((inspectedFood.fiber * mult).toFixed(1));

    const portionLabel = customGrams
      ? `${customGrams}g`
      : portionMultiplier === 1
      ? inspectedFood.serving
      : `${Math.round(portionMultiplier * 100)}% de porción (${inspectedFood.serving})`;

    const newMeal: MealEntry = {
      id: `food-${Date.now()}`,
      date: selectedDate,
      timestamp: new Date().toISOString(),
      mealType: selectedMealType,
      foodName: `${inspectedFood.name} (${inspectedFood.brand})`,
      description: `${inspectedFood.category} • Nutri-Score ${inspectedFood.nutriScore} • NOVA ${inspectedFood.novaGroup}`,
      portion: portionLabel,
      totalCalories: finalCalories,
      imageUrl: inspectedFood.imageUrl,
      macros: {
        protein: finalProtein,
        carbs: finalCarbs,
        fat: finalFat,
        fiber: finalFiber,
        sugar: inspectedFood.sugar ? Number((inspectedFood.sugar * mult).toFixed(1)) : undefined,
        saturatedFat: Math.round(finalFat * 0.25 * 10) / 10,
      },
      micronutrients: {
        sodium: Math.round(inspectedFood.sodium * mult),
        potassium: Math.round(inspectedFood.potassium * mult),
        calcium: Math.round(inspectedFood.calcium * mult),
        iron: Number((inspectedFood.iron * mult).toFixed(1)),
        vitaminC: Number((inspectedFood.vitaminC * mult).toFixed(1)),
      },
      items: [
        {
          name: inspectedFood.name,
          portion: portionLabel,
          calories: finalCalories,
          protein: finalProtein,
          carbs: finalCarbs,
          fat: finalFat,
        },
      ],
      dietaryTags: inspectedFood.dietaryTags || ["Alimento Certificado"],
      confidence: 99,
      healthScore: inspectedFood.nutriScore === "A" ? 95 : inspectedFood.nutriScore === "B" ? 85 : 75,
      source: "database",
    };

    onAddMealToDiary(newMeal);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setInspectedFood(null);
    }, 1600);
  };

  const handleAddDirectToDiary = (item: FoodDatabaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newMeal: MealEntry = {
      id: `food-direct-${Date.now()}`,
      date: selectedDate,
      timestamp: new Date().toISOString(),
      mealType: selectedMealType,
      foodName: `${item.name} (${item.brand})`,
      description: `${item.category} • EAN ${item.barcode}`,
      portion: item.serving,
      totalCalories: item.calories,
      imageUrl: item.imageUrl,
      macros: {
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        sugar: item.sugar,
        saturatedFat: Math.round(item.fat * 0.25 * 10) / 10,
      },
      micronutrients: {
        sodium: item.sodium,
        potassium: item.potassium,
        calcium: item.calcium,
        iron: item.iron,
        vitaminC: item.vitaminC,
      },
      items: [
        {
          name: item.name,
          portion: item.serving,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        },
      ],
      dietaryTags: item.dietaryTags,
      confidence: 99,
      healthScore: item.nutriScore === "A" ? 95 : item.nutriScore === "B" ? 85 : 75,
      source: "database",
    };

    onAddMealToDiary(newMeal);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Filter and Sort Catalog Items
  const filteredCatalog = useMemo(() => {
    let list = EXPANDED_FOODS_DATABASE;

    if (selectedCategory && selectedCategory !== "Todos") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (activeNutriFilter) {
      list = list.filter((item) => item.nutriScore === activeNutriFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.barcode.includes(q) ||
          item.dietaryTags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    const sorted = [...list];
    if (sortBy === "calories_asc") {
      sorted.sort((a, b) => a.calories - b.calories);
    } else if (sortBy === "calories_desc") {
      sorted.sort((a, b) => b.calories - a.calories);
    } else if (sortBy === "protein_desc") {
      sorted.sort((a, b) => b.protein - a.protein);
    } else if (sortBy === "nutriscore") {
      sorted.sort((a, b) => a.nutriScore.localeCompare(b.nutriScore));
    }

    return sorted;
  }, [searchQuery, selectedCategory, activeNutriFilter, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Navigation & Mode Switcher */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              Base de Datos Clínica de Alimentos & EAN-13 Internacional
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alimentos Verificados & Códigos de Barras
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Explora más de 40 alimentos certificados con fotografías de alta resolución, macronutrientes clínicos, clasificación NOVA, o escanea directamente cualquier envase mediante lectura óptica EAN-13.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* View Tab Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setActiveSubTab("catalog")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === "catalog"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Catálogo con Fotos ({EXPANDED_FOODS_DATABASE.length})
              </button>
              <button
                onClick={() => setActiveSubTab("scanner")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === "scanner"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                Escáner Láser EAN
              </button>
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={isScanningSimulated}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Barcode className="w-4 h-4 text-emerald-100" />
              <span>{isScanningSimulated ? "Escaneando..." : "Simular Escaneo"}</span>
            </button>
          </div>
        </div>

        {/* Global Toast if item was added */}
        {addedSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Alimento registrado exitosamente en tu diario nutricional!</span>
          </div>
        )}

        {/* Optical Scanning Simulation Overlay */}
        {isScanningSimulated && (
          <div className="mt-6 p-6 bg-slate-950 rounded-2xl border border-emerald-500/40 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
            <div className="relative w-72 h-20 border-2 border-emerald-400/80 rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-1.5 opacity-60">
                <div className="w-1 h-12 bg-white" />
                <div className="w-2 h-12 bg-white" />
                <div className="w-0.5 h-12 bg-white" />
                <div className="w-3 h-12 bg-white" />
                <div className="w-1.5 h-12 bg-white" />
                <div className="w-1 h-12 bg-white" />
                <div className="w-2 h-12 bg-white" />
                <div className="w-3 h-12 bg-white" />
              </div>
              <div className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
            </div>
            <span className="text-xs font-mono text-emerald-400 mt-3 animate-pulse">
              Decodificando simbología óptica EAN/UPC...
            </span>
          </div>
        )}
      </div>

      {/* Target Meal Type Selector Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">Comida Destino en tu Diario:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["desayuno", "almuerzo", "cena", "snack"] as MealType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedMealType === type
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: CATALOG OF FOODS WITH HIGH-RES PHOTOGRAPHY */}
      {activeSubTab === "catalog" && (
        <div className="space-y-6">
          
          {/* Filter Bar & Search Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 space-y-4">
            
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar entre 40+ alimentos por nombre, marca o propiedad (ej. Salmón, Chía, Avena, Proteico)..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/70 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full md:w-auto px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none"
                >
                  <option value="default">Orden Sugerido</option>
                  <option value="protein_desc">Mayor Proteína</option>
                  <option value="calories_asc">Menor Calorías (Ligero)</option>
                  <option value="calories_desc">Mayor Calorías (Energético)</option>
                  <option value="nutriscore">Mejor Nutri-Score (A → E)</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Categoría:
              </span>
              {FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Nutri-Score Quick Filter Badges */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
                Filtro Nutri-Score:
              </span>
              <button
                onClick={() => setActiveNutriFilter(null)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                  activeNutriFilter === null
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Todos
              </button>
              {["A", "B", "C", "D"].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setActiveNutriFilter(activeNutriFilter === grade ? null : grade)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono transition-all ${
                    activeNutriFilter === grade
                      ? grade === "A" ? "bg-emerald-600 text-white"
                        : grade === "B" ? "bg-lime-600 text-white"
                        : grade === "C" ? "bg-amber-500 text-white"
                        : "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Nutri-Score {grade}
                </button>
              ))}
              <span className="text-xs text-slate-400 font-mono ml-auto">
                {filteredCatalog.length} alimentos encontrados
              </span>
            </div>

          </div>

          {/* Catalog Cards Grid with Photography */}
          {filteredCatalog.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No se encontraron alimentos</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Prueba buscando con otro término o selecciona "Todos" en las categorías.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                  setActiveNutriFilter(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCatalog.map((item) => (
                <div
                  key={item.barcode}
                  onClick={() => handleOpenInspector(item)}
                  className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Food Photo Container */}
                    <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                          <Package className="w-12 h-12" />
                        </div>
                      )}

                      {/* Calories badge */}
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white font-mono text-xs font-black shadow-xs">
                        {item.calories} <span className="text-[10px] text-emerald-400 font-semibold">kcal</span>
                      </div>

                      {/* Nutri-Score & NOVA Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black font-mono shadow-xs ${
                            item.nutriScore === "A" ? "bg-emerald-600"
                              : item.nutriScore === "B" ? "bg-lime-600"
                              : item.nutriScore === "C" ? "bg-amber-500"
                              : "bg-rose-600"
                          }`}
                        >
                          {item.nutriScore}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-mono font-semibold">
                          NOVA {item.novaGroup}
                        </span>
                      </div>

                      {/* Category tag */}
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold shadow-xs">
                        {item.category}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {item.brand} • {item.serving}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {/* Macros Bar Preview */}
                      <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Prot</span>
                          <strong className="text-emerald-700">{item.protein}g</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Carb</span>
                          <strong className="text-sky-700">{item.carbs}g</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Grasa</span>
                          <strong className="text-amber-700">{item.fat}g</strong>
                        </div>
                      </div>

                      {/* Dietary Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {item.dietaryTags?.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenInspector(item)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      Ver Detalles
                    </button>
                    <button
                      onClick={(e) => handleAddDirectToDiary(item, e)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
                      title="Añadir ración estándar a tu diario"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                      Añadir
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: DEDICATED OPTICAL SCANNER & EAN LOOKUP */}
      {activeSubTab === "scanner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Code Input & Quick Barcodes */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-emerald-600" />
                Lectura de Código EAN / UPC
              </h3>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">
                  Introduce los 13 dígitos del código de barras:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Ej. 8480000164210"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50 text-slate-800"
                  />
                  <button
                    onClick={() => lookupBarcode(barcodeInput)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Consultando..." : "Buscar"}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Quick Presets with Thumbnails */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Alimentos verificados de acceso directo:
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {EXPANDED_FOODS_DATABASE.slice(0, 8).map((item) => (
                  <div
                    key={item.barcode}
                    onClick={() => {
                      setBarcodeInput(item.barcode);
                      setProductData(item);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      productData?.barcode === item.barcode
                        ? "border-emerald-500 bg-emerald-50/40"
                        : "border-slate-200/80 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        EAN: {item.barcode} • {item.serving}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 shrink-0">
                      {item.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Detailed Product Result Card */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center min-h-[380px] space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-500 font-mono">Decodificando base clínica...</p>
              </div>
            ) : productData ? (
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
                
                {/* Header with Photo and Scores */}
                <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-slate-100">
                  {productData.imageUrl && (
                    <img
                      src={productData.imageUrl}
                      alt={productData.name}
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-semibold">
                        EAN: {productData.barcode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {productData.category}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {productData.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Marca: {productData.brand} • Porción declarada: {productData.serving}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-sans">Nutri-Score</span>
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-white ${
                          productData.nutriScore === "A" ? "bg-emerald-600"
                            : productData.nutriScore === "B" ? "bg-lime-600"
                            : productData.nutriScore === "C" ? "bg-amber-500"
                            : "bg-rose-600"
                        }`}>
                          {productData.nutriScore}
                        </span>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-sans">NOVA</span>
                        <span className="text-slate-800">Grupo {productData.novaGroup}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macros Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-slate-900 text-white rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Calorías</span>
                    <span className="text-2xl font-black text-white font-mono">{productData.calories}</span>
                    <span className="text-xs text-emerald-400 font-semibold ml-1">kcal</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Proteína</span>
                    <span className="text-xl font-bold text-emerald-700 font-mono">{productData.protein}g</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Carbohidratos</span>
                    <span className="text-xl font-bold text-sky-700 font-mono">{productData.carbs}g</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Grasas</span>
                    <span className="text-xl font-bold text-amber-700 font-mono">{productData.fat}g</span>
                  </div>
                </div>

                {/* Micronutrients */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Minerales y Electrolitos Certificados:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">Sodio</span>
                      <span className="font-mono font-bold text-slate-800">{productData.sodium} mg</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">Potasio</span>
                      <span className="font-mono font-bold text-slate-800">{productData.potassium} mg</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">Calcio</span>
                      <span className="font-mono font-bold text-slate-800">{productData.calcium} mg</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">Hierro</span>
                      <span className="font-mono font-bold text-slate-800">{productData.iron} mg</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">Vitamina C</span>
                      <span className="font-mono font-bold text-slate-800">{productData.vitaminC} mg</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="text-slate-500">Fibra</span>
                      <span className="font-mono font-bold text-slate-800">{productData.fiber} g</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Se añadirá a: <strong className="capitalize text-slate-800">{selectedMealType}</strong>
                  </span>
                  <button
                    onClick={(e) => handleAddDirectToDiary(productData, e)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar en mi Diario
                  </button>
                </div>

              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* DETAILED NUTRITION & PORTION ADJUSTER MODAL */}
      {inspectedFood && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                {inspectedFood.imageUrl && (
                  <img
                    src={inspectedFood.imageUrl}
                    alt={inspectedFood.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {inspectedFood.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                      EAN: {inspectedFood.barcode}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {inspectedFood.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Marca: {inspectedFood.brand} • Porción base: {inspectedFood.serving}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectedFood(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Portion Adjuster Slider */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  Ajuste de Porción Consumida:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {portionMultiplier}x ({Math.round(portionMultiplier * 100)}% de porción)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 1.5, 2].map((factor) => (
                  <button
                    key={factor}
                    onClick={() => {
                      setPortionMultiplier(factor);
                      setCustomGrams(null);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      portionMultiplier === factor && !customGrams
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {factor}x porción
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Calculated Macros Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calorías</span>
                <span className="text-2xl font-black text-white font-mono">
                  {Math.round(inspectedFood.calories * (customGrams ? customGrams / 100 : portionMultiplier))}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold block">kcal</span>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Proteína</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  {(inspectedFood.protein * (customGrams ? customGrams / 100 : portionMultiplier)).toFixed(1)}g
                </span>
              </div>

              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-sky-800 block">Carbohidratos</span>
                <span className="text-xl font-black text-sky-800 font-mono">
                  {(inspectedFood.carbs * (customGrams ? customGrams / 100 : portionMultiplier)).toFixed(1)}g
                </span>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Grasas</span>
                <span className="text-xl font-black text-amber-800 font-mono">
                  {(inspectedFood.fat * (customGrams ? customGrams / 100 : portionMultiplier)).toFixed(1)}g
                </span>
              </div>
            </div>

            {/* Micronutrient Details */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Perfil de Micronutrientes:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500 font-sans">Sodio</span>
                  <strong>{Math.round(inspectedFood.sodium * portionMultiplier)} mg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500 font-sans">Potasio</span>
                  <strong>{Math.round(inspectedFood.potassium * portionMultiplier)} mg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500 font-sans">Calcio</span>
                  <strong>{Math.round(inspectedFood.calcium * portionMultiplier)} mg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500 font-sans">Hierro</span>
                  <strong>{(inspectedFood.iron * portionMultiplier).toFixed(1)} mg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500 font-sans">Vitamina C</span>
                  <strong>{(inspectedFood.vitaminC * portionMultiplier).toFixed(1)} mg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500 font-sans">Fibra Activa</span>
                  <strong>{(inspectedFood.fiber * portionMultiplier).toFixed(1)} g</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-700">Comida:</span>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                  className="px-3 py-2 text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="snack">Snack / Colación</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInspectedFood(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleAddInspectedToDiary}
                  disabled={addedSuccess}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      ¡Guardado en tu Diario!
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-white" />
                      Añadir Alimento al Diario
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
