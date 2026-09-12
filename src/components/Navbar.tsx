import React, { useState } from "react";
import {
  Camera,
  BookOpen,
  BarChart3,
  Barcode,
  Watch,
  Trophy,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { WearableVitals, PushNotificationItem } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wearable?: WearableVitals;
  onSyncWearable?: () => void;
  notifications?: PushNotificationItem[];
  unreadNotificationsCount?: number;
  onMarkNotificationsRead?: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wearable,
  onSyncWearable,
  notifications = [],
  unreadNotificationsCount,
  onMarkNotificationsRead,
  selectedDate,
  setSelectedDate,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const unreadCount = typeof unreadNotificationsCount === "number"
    ? unreadNotificationsCount
    : safeNotifs.filter((n) => n && !n.read).length;

  const navItems = [
    { id: "scan", label: "Escaneo IA", icon: Camera, badge: "Instantáneo" },
    { id: "diary", label: "Diario", icon: BookOpen },
    { id: "barcode", label: "Alimentos & Barras", icon: Barcode },
    { id: "analytics", label: "Análisis", icon: BarChart3 },
    { id: "wearables", label: "Wearables", icon: Watch, live: true },
    { id: "challenges", label: "Retos & Logros", icon: Trophy },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Cifrado & Cloud", icon: ShieldCheck },
  ];

  const deviceLabel = wearable?.deviceName ? wearable.deviceName.split(" ")[0] : "Wearable";
  const hrLabel = wearable?.heartRateCurrent ?? 72;
  const isSyncing = Boolean(wearable?.isSyncing);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("scan")}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  NutriScan<span className="text-emerald-600">.pro</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  IA Grado Clínico
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Visión Computacional & Telemetría Nutricional
              </p>
            </div>
          </div>

          {/* Quick Status Bar (Wearable Sync & Security) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Wearable live chip */}
            <button
              onClick={onSyncWearable}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSyncing
                  ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                  : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 border border-slate-200"
              }`}
              title="Dispositivo wearable enlazado"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Watch className="w-3.5 h-3.5 text-slate-600" />
              <span>{deviceLabel}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {hrLabel} bpm
              </span>
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isSyncing ? "animate-spin" : ""}`} />
            </button>

            {/* Date selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-slate-800 font-medium"
              >
                <option value={new Date().toISOString().split("T")[0]}>Hoy (Registro Activo)</option>
                <option value={new Date(Date.now() - 86400000).toISOString().split("T")[0]}>Ayer</option>
                <option value={new Date(Date.now() - 172800000).toISOString().split("T")[0]}>Hace 2 días</option>
              </select>
            </div>

            {/* AES-256 Vault Status */}
            <div
              onClick={() => setActiveTab("security")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-800 text-xs font-medium cursor-pointer hover:bg-emerald-100/70 transition-colors"
              title="Bóveda de salud con cifrado AES-256 local y arquitectura segura"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cifrado AES-256</span>
            </div>
          </div>

          {/* Right Action: Notifications & Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (!showNotifMenu) onMarkNotificationsRead();
                }}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown menu */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 text-slate-800">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      Notificaciones Inteligentes
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">Motivación y Métricas</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/80">
                    {safeNotifs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-400">Sin notificaciones pendientes</p>
                    ) : (
                      safeNotifs.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-800">{notif.title}</span>
                              <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                    >
                      Cerrar panel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Record CTA for mobile/desktop */}
            <button
              onClick={() => setActiveTab("scan")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Escanear Comida</span>
              <span className="sm:hidden">Escanear</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.live && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
