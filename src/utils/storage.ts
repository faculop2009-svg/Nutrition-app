import {
  MealEntry,
  DailyNutritionalGoals,
  WearableVitals,
  Challenge,
  Achievement,
  CommunityLeaderboardUser,
  PushNotificationItem,
} from "../types";

const STORAGE_KEY = "nutriscan_pro_secure_vault_v1";

// Helper to get formatted date YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export const DEFAULT_GOALS: DailyNutritionalGoals = {
  calorieTarget: 2150,
  proteinTarget: 140, // 140g
  carbsTarget: 220,   // 220g
  fatTarget: 65,      // 65g
  fiberTarget: 32,    // 32g
  waterTarget: 2800,  // 2800ml
};

export const INITIAL_WEARABLE: WearableVitals = {
  connectedDevice: "apple_health",
  deviceName: "Apple Watch Ultra 2 & HealthKit",
  isSyncing: false,
  lastSyncTime: "Hace 2 minutos",
  heartRateCurrent: 68,
  restingHeartRate: 54,
  activeCaloriesBurned: 540,
  stepsCurrent: 8420,
  stepsGoal: 10000,
  distanceKm: 6.2,
  sleepHours: 7.8,
  sleepScore: 88,
  hrv: 62,
  spo2: 99,
  batteryLevel: 84,
};

export const INITIAL_MEALS: MealEntry[] = [
  {
    id: "meal-1",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    mealType: "desayuno",
    foodName: "Omelette de Claras con Espinacas, Champiñones y Aguacate",
    description: "Tres claras de huevo camperas con espinaca salteada, champiñones laminados y 50g de aguacate en rebanadas con pan de masa madre.",
    portion: "310g",
    totalCalories: 380,
    macros: {
      protein: 28.5,
      carbs: 24.0,
      fat: 16.0,
      fiber: 6.2,
      sugar: 2.1,
      saturatedFat: 2.8,
    },
    micronutrients: {
      sodium: 380,
      potassium: 620,
      calcium: 85,
      iron: 2.8,
      vitaminC: 15.0,
      cholesterol: 15,
    },
    items: [
      { name: "Claras de huevo con espinacas", portion: "160g", calories: 120, protein: 22, carbs: 2, fat: 1 },
      { name: "Pan de masa madre tostado", portion: "45g", calories: 110, protein: 4.5, carbs: 20, fat: 1 },
      { name: "Aguacate Hass fresco", portion: "50g", calories: 85, protein: 1, carbs: 2, fat: 8 },
      { name: "Aceite de oliva virgen extra", portion: "7g", calories: 65, protein: 0, carbs: 0, fat: 7 }
    ],
    dietaryTags: ["Alto en Proteína", "Bajo Colesterol", "Fibra Digestiva"],
    confidence: 96,
    healthScore: 95,
    clinicalNotes: "Aporte de proteína biodisponible sin grasas saturadas elevadas. Estabiliza el cortisol matutino.",
    source: "photo_ai",
  },
  {
    id: "meal-2",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    mealType: "almuerzo",
    foodName: "Salmón a la Plancha con Arroz Integral y Espárragos Trigueros",
    description: "Filete de salmón noruego con costra de hierbas provenzales, arroz jazmín integral cocido al vapor y espárragos asados.",
    portion: "420g",
    totalCalories: 590,
    macros: {
      protein: 44.0,
      carbs: 45.0,
      fat: 22.0,
      fiber: 7.0,
      sugar: 1.8,
      saturatedFat: 3.8,
    },
    micronutrients: {
      sodium: 410,
      potassium: 910,
      calcium: 90,
      iron: 3.4,
      vitaminC: 12.0,
      cholesterol: 75,
    },
    items: [
      { name: "Salmón Noruego grillado", portion: "180g", calories: 340, protein: 36, carbs: 0, fat: 20 },
      { name: "Arroz integral vapor", portion: "140g", calories: 165, protein: 3.5, carbs: 36, fat: 1.2 },
      { name: "Espárragos trigueros al grill", portion: "100g", calories: 85, protein: 4.5, carbs: 9, fat: 1 }
    ],
    dietaryTags: ["Omega-3 EPA/DHA", "Cardiosaludable", "Antiinflamatorio"],
    confidence: 97,
    healthScore: 96,
    clinicalNotes: "Excelente ratio Omega 3 a 6. Micronutrientes protectores del endotelio vascular.",
    source: "photo_ai",
  },
  {
    id: "meal-3",
    date: getTodayDateString(),
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    mealType: "snack",
    foodName: "Yogur Griego 0% con Arándanos Frescos y Almendras",
    description: "150g de yogur griego desnatado, 50g de arándanos silvestres y 15g de almendras tostadas sin sal.",
    portion: "215g",
    totalCalories: 210,
    macros: {
      protein: 17.5,
      carbs: 14.0,
      fat: 8.5,
      fiber: 3.2,
      sugar: 8.0,
      saturatedFat: 1.1,
    },
    micronutrients: {
      sodium: 65,
      potassium: 280,
      calcium: 190,
      iron: 0.9,
      vitaminC: 7.0,
      cholesterol: 5,
    },
    items: [
      { name: "Yogur Griego Natural 0%", portion: "150g", calories: 86, protein: 15, carbs: 6, fat: 0 },
      { name: "Arándanos silvestres", portion: "50g", calories: 38, protein: 0.5, carbs: 7, fat: 0.3 },
      { name: "Almendras crudas partidas", portion: "15g", calories: 86, protein: 3, carbs: 1, fat: 7.5 }
    ],
    dietaryTags: ["Probióticos", "Antioxidantes Polifenoles", "Magnesio"],
    confidence: 94,
    healthScore: 98,
    clinicalNotes: "Favorece la microbiota intestinal y proporciona saciedad intermedia con bajo impacto glucémico.",
    source: "barcode",
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: "chal-1",
    title: "Reto Verde: 7 Días Cero Ultraprocesados",
    description: "Registra comidas con NutriScore A o B y NOVA 1-2 durante una semana completa para desinflamar el organismo.",
    category: "nutricion",
    targetDays: 7,
    completedDays: 5,
    points: 450,
    isJoined: true,
    participantsCount: 3842,
    iconName: "ShieldCheck",
    endDate: "En 2 días",
  },
  {
    id: "chal-2",
    title: "Hidratación Celular 2.8 Litros",
    description: "Alcanza tu meta de agua diaria durante 5 días seguidos para optimizar tasa metabólica y claridad mental.",
    category: "hidratacion",
    targetDays: 5,
    completedDays: 4,
    points: 300,
    isJoined: true,
    participantsCount: 5210,
    iconName: "Droplets",
    endDate: "En 3 días",
  },
  {
    id: "chal-3",
    title: "Constancia Proteica Matutina",
    description: "Incluye al menos 25g de proteína biodisponible en tu primera comida del día para regular la grelina.",
    category: "nutricion",
    targetDays: 7,
    completedDays: 6,
    points: 400,
    isJoined: true,
    participantsCount: 2980,
    iconName: "Flame",
    endDate: "En 1 día",
  },
  {
    id: "chal-4",
    title: "Sinergia Vital: 10,000 Pasos Wearable",
    description: "Sincroniza tus pasos diarios y quema al menos 450 kcal activas con tu dispositivo de salud.",
    category: "actividad",
    targetDays: 7,
    completedDays: 3,
    points: 500,
    isJoined: false,
    participantsCount: 6410,
    iconName: "Activity",
    endDate: "En 4 días",
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    title: "Visión Clínica Inicial",
    description: "Realiza tu primer escaneo nutricional por IA con foto.",
    category: "escaneo",
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedDate: "Hoy",
    badgeCode: "CAMERA_PRO",
  },
  {
    id: "ach-2",
    title: "Racha de Hierro (7 Días)",
    description: "Registra todas tus comidas diarias ininterrumpidamente durante una semana.",
    category: "racha",
    unlocked: true,
    progress: 7,
    maxProgress: 7,
    unlockedDate: "Ayer",
    badgeCode: "STREAK_GOLD",
  },
  {
    id: "ach-3",
    title: "Maestro de Macronutrientes",
    description: "Mantén tus proporciones de proteína, carbohidratos y grasas con <5% de desvío.",
    category: "balance",
    unlocked: false,
    progress: 4,
    maxProgress: 5,
    badgeCode: "MACRO_BALANCE",
  },
  {
    id: "ach-4",
    title: "Sincronización Total Wearable",
    description: "Conecta tu reloj o anillo inteligente y mantén telemetría en tiempo real por 14 días.",
    category: "escaneo",
    unlocked: false,
    progress: 9,
    maxProgress: 14,
    badgeCode: "WEARABLE_LINK",
  },
  {
    id: "ach-5",
    title: "Explorador de la Base Global",
    description: "Escanea o busca 20 alimentos en la base internacional de códigos de barras.",
    category: "social",
    unlocked: true,
    progress: 20,
    maxProgress: 20,
    unlockedDate: "Hace 3 días",
    badgeCode: "BARCODE_MASTER",
  }
];

export const INITIAL_LEADERBOARD: CommunityLeaderboardUser[] = [
  { id: "u-1", rank: 1, name: "Dra. Valeria M. (Nutrióloga)", country: "España", points: 3480, streakDays: 42, avgHealthScore: 98 },
  { id: "u-2", rank: 2, name: "Carlos Mendoza (Triatleta)", country: "México", points: 3210, streakDays: 35, avgHealthScore: 96 },
  { id: "u-current", rank: 3, name: "Tú (Usuario NutriScan Pro)", country: "España", points: 2950, streakDays: 14, avgHealthScore: 95, isCurrentUser: true },
  { id: "u-4", rank: 4, name: "Lucía Fernández", country: "Argentina", points: 2840, streakDays: 28, avgHealthScore: 93 },
  { id: "u-5", rank: 5, name: "Alejandro Silva", country: "Chile", points: 2610, streakDays: 19, avgHealthScore: 91 },
  { id: "u-6", rank: 6, name: "Sofia De La Peña", country: "Colombia", points: 2490, streakDays: 16, avgHealthScore: 90 },
];

export const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: "notif-1",
    title: "Hidratación recomendada",
    message: "Llevas 1,800 ml registrados hoy. Bebe un vaso de agua mineral para mantener tu metabolismo celular óptimo.",
    timestamp: "Hace 20 min",
    category: "hydration",
    read: false,
  },
  {
    id: "notif-2",
    title: "Sincronización Wearable completada",
    message: "Tu Apple Watch reportó 540 kcal activas. Tu presupuesto calórico se ajustó automáticamente a 2,690 kcal.",
    timestamp: "Hace 1 hora",
    category: "wearable",
    read: false,
  },
  {
    id: "notif-3",
    title: "Objetivo de Proteína alcanzado al 64%",
    message: "Has consumido 90g de 140g. Una cena con salmón, pavo o tofu completará tu síntesis muscular diaria.",
    timestamp: "Hace 3 horas",
    category: "reminder",
    read: true,
  },
  {
    id: "notif-4",
    title: "¡Racha de 14 días activa!",
    message: "Tu constancia está en el 5% superior de la comunidad NutriScan. ¡Sigue con este excelente ritmo!",
    timestamp: "Hoy, 08:30",
    category: "motivation",
    read: true,
  }
];

// Simulated AES-256 Vault Encryption
export interface AppVaultData {
  version: string;
  encryptionAlgorithm: string;
  isEncrypted: boolean;
  vaultKeyHash: string;
  lastUpdated: string;
  meals: MealEntry[];
  goals: DailyNutritionalGoals;
  wearable: WearableVitals;
  waterIntakeMl: number;
  challenges: Challenge[];
  achievements: Achievement[];
  leaderboard: CommunityLeaderboardUser[];
  notifications: PushNotificationItem[];
}

export function loadSecureVault(): AppVaultData {
  const defaultVault: AppVaultData = {
    version: "1.4.0-enterprise",
    encryptionAlgorithm: "AES-GCM-256 (WebCrypto Spec)",
    isEncrypted: true,
    vaultKeyHash: "sha256:8f2a99c0d12e8b...verified",
    lastUpdated: new Date().toISOString(),
    meals: INITIAL_MEALS,
    goals: DEFAULT_GOALS,
    wearable: INITIAL_WEARABLE,
    waterIntakeMl: 1800,
    challenges: INITIAL_CHALLENGES,
    achievements: INITIAL_ACHIEVEMENTS,
    leaderboard: INITIAL_LEADERBOARD,
    notifications: INITIAL_NOTIFICATIONS,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...defaultVault,
          ...parsed,
          meals: Array.isArray(parsed.meals) ? parsed.meals : INITIAL_MEALS,
          goals: parsed.goals ? { ...DEFAULT_GOALS, ...parsed.goals } : DEFAULT_GOALS,
          wearable: parsed.wearable ? { ...INITIAL_WEARABLE, ...parsed.wearable } : INITIAL_WEARABLE,
          challenges: Array.isArray(parsed.challenges) ? parsed.challenges : INITIAL_CHALLENGES,
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : INITIAL_ACHIEVEMENTS,
          leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : INITIAL_LEADERBOARD,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
        };
      }
    }
  } catch (err) {
    console.warn("Could not read local vault, using baseline data:", err);
  }

  saveSecureVault(defaultVault);
  return defaultVault;
}

export function saveSecureVault(data: AppVaultData): void {
  try {
    const serialized = JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Failed to persist secure vault data:", err);
  }
}

export const loadVaultData = loadSecureVault;
export const saveVaultData = saveSecureVault;
