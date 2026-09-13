import React, { useState, useEffect } from "react";
import {
  AppVaultData,
  loadVaultData,
  saveVaultData,
} from "./utils/storage";
import {
  MealEntry,
  WearableVitals,
  PushNotificationItem,
} from "./types";
import { Navbar } from "./components/Navbar";
import { PhotoScanner } from "./components/PhotoScanner";
import { FoodDiary } from "./components/FoodDiary";
import { BarcodeGlobalScanner } from "./components/BarcodeGlobalScanner";
import { LongevityPlanSuite } from "./components/LongevityPlanSuite";
import { WearableSync } from "./components/WearableSync";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { ChallengesCommunity } from "./components/ChallengesCommunity";
import { SecurityPanel } from "./components/SecurityPanel";
import { NotificationCenter } from "./components/NotificationCenter";
import { OfflineIndicator } from "./components/OfflineIndicator";

export default function App() {
  const [vaultData, setVaultData] = useState<AppVaultData>(() => loadVaultData());
  const [activeTab, setActiveTab] = useState<string>("diary");
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-persist vault data whenever it changes
  useEffect(() => {
    saveVaultData(vaultData);
  }, [vaultData]);

  const showNotificationToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Meal Operations
  const handleAddMeal = (newMeal: MealEntry) => {
    setVaultData((prev) => {
      const currentMeals = Array.isArray(prev.meals) ? prev.meals : [];
      const updatedMeals = [newMeal, ...currentMeals];
      
      // Check for challenge progress: 'photo-logger-pro' or 'macro-balance'
      const currentChallenges = Array.isArray(prev.challenges) ? prev.challenges : [];
      const updatedChallenges = currentChallenges.map((chal) => {
        if (chal.id === "chal-1" && chal.isJoined) {
          return { ...chal, completedDays: Math.min(chal.targetDays, chal.completedDays + 1) };
        }
        return chal;
      });

      // Check achievement: 'ach-photo-1'
      const currentAchievements = Array.isArray(prev.achievements) ? prev.achievements : [];
      const updatedAchievements = currentAchievements.map((ach) => {
        if (ach.id === "ach-photo-1" && !ach.unlocked) {
          return {
            ...ach,
            unlocked: true,
            progress: 1,
            unlockedDate: "Hoy",
          };
        }
        return ach;
      });

      // Add positive motivational push notification
      const newNotif: PushNotificationItem = {
        id: `notif-${Date.now()}`,
        title: "¡Comida Registrada con Éxito!",
        body: `Se han añadido ${newMeal.totalCalories} kcal (${newMeal.foodName}) a tu balance energético de hoy.`,
        timestamp: "Ahora",
        read: false,
        type: "motivation",
      };

      const currentNotifications = Array.isArray(prev.notifications) ? prev.notifications : [];

      return {
        ...prev,
        meals: updatedMeals,
        challenges: updatedChallenges,
        achievements: updatedAchievements,
        notifications: [newNotif, ...currentNotifications],
        lastUpdated: new Date().toISOString(),
      };
    });

    showNotificationToast(`Alimento "${newMeal.foodName}" registrado en tu diario`);
    setActiveTab("diary");
  };

  const handleDeleteMeal = (mealId: string) => {
    setVaultData((prev) => ({
      ...prev,
      meals: (prev.meals || []).filter((m) => m.id !== mealId),
      lastUpdated: new Date().toISOString(),
    }));
    showNotificationToast("Registro eliminado del diario");
  };

  // Water Operations
  const handleUpdateWater = (amount: number) => {
    setVaultData((prev) => ({
      ...prev,
      waterIntakeMl: amount,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Wearable Telemetry Update
  const handleUpdateWearable = (vitals: WearableVitals) => {
    setVaultData((prev) => ({
      ...prev,
      wearable: vitals,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Challenges Toggle
  const handleToggleJoinChallenge = (challengeId: string) => {
    setVaultData((prev) => ({
      ...prev,
      challenges: (prev.challenges || []).map((c) =>
        c.id === challengeId ? { ...c, isJoined: !c.isJoined } : c
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Notifications Operations
  const handleMarkNotificationRead = (id: string) => {
    setVaultData((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const handleSendCustomNotification = (notif: PushNotificationItem) => {
    setVaultData((prev) => ({
      ...prev,
      notifications: [notif, ...(prev.notifications || [])],
      lastUpdated: new Date().toISOString(),
    }));
    showNotificationToast(notif.title);
  };

  const handleRestoreVault = (restored: AppVaultData) => {
    setVaultData(restored);
    showNotificationToast("Bóveda restaurada satisfactoriamente");
  };

  const unreadCount = (vaultData?.notifications || []).filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      
      {/* Top Professional Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotificationsCount={unreadCount}
        notifications={vaultData?.notifications || []}
        onMarkNotificationsRead={() => {
          setVaultData((prev) => ({
            ...prev,
            notifications: (prev.notifications || []).map((n) => ({ ...n, read: true })),
          }));
        }}
        onSyncWearable={() => setActiveTab("wearables")}
        wearable={vaultData?.wearable}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Dynamic Toast Feedback Bar */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Tab 1: AI Photo Scanner */}
        {activeTab === "scan" && (
          <PhotoScanner
            onSaveMeal={handleAddMeal}
            selectedDate={selectedDate}
          />
        )}

        {/* Tab 2: Food Diary */}
        {activeTab === "diary" && (
          <FoodDiary
            meals={vaultData.meals}
            goals={vaultData.goals}
            wearable={vaultData.wearable}
            waterIntakeMl={vaultData.waterIntakeMl}
            onUpdateWater={handleUpdateWater}
            onDeleteMeal={handleDeleteMeal}
            onAddQuickMeal={handleAddMeal}
            selectedDate={selectedDate}
            onNavigateToScan={() => setActiveTab("scan")}
          />
        )}

        {/* Tab 3: Barcode Global Scanner */}
        {activeTab === "barcode" && (
          <BarcodeGlobalScanner
            onAddMealToDiary={handleAddMeal}
            selectedDate={selectedDate}
          />
        )}

        {/* Tab 4: AI Longevity, Glycemic Simulation & Meal Planner Suite */}
        {activeTab === "longevity" && (
          <LongevityPlanSuite
            meals={vaultData.meals}
            goals={vaultData.goals}
            wearable={vaultData.wearable}
            selectedDate={selectedDate}
            onAddMealToDiary={handleAddMeal}
          />
        )}

        {/* Tab 5: Interactive Long-Term Analytics */}
        {activeTab === "analytics" && (
          <AnalyticsDashboard
            meals={vaultData.meals}
            goals={vaultData.goals}
            wearable={vaultData.wearable}
          />
        )}

        {/* Tab 5: Wearables & Real-Time Vitals */}
        {activeTab === "wearables" && (
          <WearableSync
            wearable={vaultData.wearable}
            onUpdateWearable={handleUpdateWearable}
          />
        )}

        {/* Tab 6: Challenges, Leaderboard & Achievements */}
        {activeTab === "challenges" && (
          <ChallengesCommunity
            challenges={vaultData.challenges}
            achievements={vaultData.achievements}
            leaderboard={vaultData.leaderboard}
            onToggleJoinChallenge={handleToggleJoinChallenge}
          />
        )}

        {/* Tab 7: Push Notifications Center */}
        {activeTab === "notifications" && (
          <NotificationCenter
            notifications={vaultData.notifications}
            onMarkRead={handleMarkNotificationRead}
            onSendCustomNotification={handleSendCustomNotification}
          />
        )}

        {/* Tab 8: Security, Encryption & Cloud Architecture */}
        {activeTab === "security" && (
          <SecurityPanel
            vaultData={vaultData}
            onRestoreVault={handleRestoreVault}
          />
        )}

        {/* PWA Offline Mode Indicator */}
        <OfflineIndicator />

      </main>

      {/* Professional Accessible Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight">NutriScan Pro</span>
            <span>•</span>
            <span>Cálculo Calórico Multimodal con IA & Telemetría Wearable</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Cifrado AES-256 Activo</span>
            <span>•</span>
            <span>OpenFoodFacts API Conectada</span>
            <span>•</span>
            <span>Cloud Run SLA 99.99%</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
