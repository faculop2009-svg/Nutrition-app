export type MealType = "desayuno" | "almuerzo" | "cena" | "snack";

export interface MacroBreakdown {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  saturatedFat?: number;
}

export interface MicronutrientBreakdown {
  sodium: number; // mg
  potassium: number; // mg
  calcium: number; // mg
  iron: number; // mg
  vitaminC: number; // mg
  cholesterol?: number; // mg
}

export interface MealItemComponent {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  mealType: MealType;
  foodName: string;
  description: string;
  portion: string;
  totalCalories: number;
  macros: MacroBreakdown;
  micronutrients: MicronutrientBreakdown;
  items: MealItemComponent[];
  dietaryTags: string[];
  confidence: number;
  healthScore: number;
  clinicalNotes?: string;
  imageUrl?: string;
  source: "photo_ai" | "barcode" | "database" | "manual";
}

export interface DailyNutritionalGoals {
  calorieTarget: number;
  proteinTarget: number; // grams
  carbsTarget: number; // grams
  fatTarget: number; // grams
  fiberTarget: number; // grams
  waterTarget: number; // ml
}

export type WearableDeviceType = "apple_health" | "garmin" | "whoop" | "fitbit" | "oura" | "none";

export interface WearableVitals {
  connectedDevice: WearableDeviceType;
  deviceName: string;
  isSyncing: boolean;
  lastSyncTime: string;
  heartRateCurrent: number; // bpm
  restingHeartRate: number; // bpm
  activeCaloriesBurned: number; // kcal
  stepsCurrent: number;
  stepsGoal: number;
  distanceKm: number;
  sleepHours: number;
  sleepScore: number; // 0-100
  hrv: number; // ms
  spo2: number; // %
  batteryLevel: number; // %
}

export interface FoodDatabaseItem {
  barcode: string;
  name: string;
  brand: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  nutriScore: "A" | "B" | "C" | "D" | "E";
  novaGroup: 1 | 2 | 3 | 4;
  category: string;
  dietaryTags: string[];
  imageUrl?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "nutricion" | "actividad" | "hidratacion" | "habitos";
  targetDays: number;
  completedDays: number;
  points: number;
  isJoined: boolean;
  participantsCount: number;
  iconName: string;
  endDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "escaneo" | "racha" | "balance" | "social";
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: string;
  badgeCode: string;
}

export interface CommunityLeaderboardUser {
  id: string;
  rank: number;
  name: string;
  country: string;
  points: number;
  streakDays: number;
  avgHealthScore: number;
  isCurrentUser?: boolean;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message?: string;
  body?: string;
  timestamp: string;
  category?: "reminder" | "motivation" | "hydration" | "wearable" | "achievement" | "streak";
  type?: "reminder" | "motivation" | "hydration" | "wearable" | "achievement" | "streak";
  read: boolean;
  actionUrl?: string;
}
