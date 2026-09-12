import React, { useState } from "react";
import {
  Bell,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Flame,
  Droplets,
  Heart,
  Calendar,
  Volume2
} from "lucide-react";
import { PushNotificationItem } from "../types";

interface NotificationCenterProps {
  notifications?: PushNotificationItem[];
  onMarkRead: (id: string) => void;
  onSendCustomNotification: (notif: PushNotificationItem) => void;
}

const MOTIVATIONAL_TEMPLATES = [
  {
    title: "¡Ventana Anabólica Activa!",
    body: "Tu Apple Watch detectó 420 kcal de entrenamiento de fuerza. Es el momento ideal para aportar 30g de proteína de absorción rápida.",
    type: "motivation" as const,
  },
  {
    title: "Balance Hídrico Óptimo",
    body: "Llevas 3 horas sin registrar agua. Mantén la volemia y el rendimiento cognitivo bebiendo 350 ml de agua fresca.",
    type: "reminder" as const,
  },
  {
    title: "¡Racha de 7 Días Completada!",
    body: "Tu adherencia calórica se sitúa en un 98.4%. La disciplina metabólica de esta semana ha sido extraordinaria.",
    type: "achievement" as const,
  },
  {
    title: "Cena Ligera y Reparadora",
    body: "Te quedan 480 kcal disponibles. Prioriza vegetales ricos en magnesio y pescado azul para optimizar el sueño profundo.",
    type: "streak" as const,
  },
];

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onMarkRead,
  onSendCustomNotification,
}) => {
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const [customTitle, setCustomTitle] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sentToast, setSentToast] = useState<string | null>(null);

  const handleSendPreset = (template: typeof MOTIVATIONAL_TEMPLATES[0]) => {
    const newNotif: PushNotificationItem = {
      id: `notif-${Date.now()}`,
      title: template.title,
      body: template.body,
      timestamp: "Ahora mismo",
      read: false,
      type: template.type,
    };
    onSendCustomNotification(newNotif);
    setSentToast(`Notificación push enviada: "${template.title}"`);
    setTimeout(() => setSentToast(null), 3500);

    // Browser Notification API if supported and granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(template.title, { body: template.body, icon: "/favicon.ico" });
    }
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) return;

    const newNotif: PushNotificationItem = {
      id: `notif-${Date.now()}`,
      title: customTitle.trim(),
      body: customBody.trim(),
      timestamp: "Ahora mismo",
      read: false,
      type: "motivation",
    };
    onSendCustomNotification(newNotif);
    setSentToast(`Notificación personalizada enviada al dispositivo.`);
    setTimeout(() => setSentToast(null), 3500);
    setCustomTitle("");
    setCustomBody("");
  };

  const requestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("NutriScan Pro Activo", {
          body: "Notificaciones push motivacionales habilitadas en este navegador.",
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              Notificaciones Push Motivacionales Personalizadas
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Motor de Motivación & Recordatorios Adaptativos
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Recibe avisos inteligentes en los momentos óptimos del día: recordatorios de hidratación, refuerzo positivo tras entrenar con tu wearable y estrategias para cenar sin romper tu déficit.
            </p>
          </div>

          <button
            onClick={requestBrowserPermission}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span>Habilitar Notificaciones de Sistema</span>
          </button>
        </div>

        {sentToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sentToast}</span>
          </div>
        )}
      </div>

      {/* Preset Motivational Triggers */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Disparadores Inteligentes de Motivación Inmediata:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOTIVATIONAL_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-500/60 transition-all"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  {tmpl.type === "achievement" ? "Logro" : tmpl.type === "reminder" ? "Recordatorio" : "Motivación"}
                </span>
                <h4 className="text-xs font-bold text-slate-900">{tmpl.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                  {tmpl.body}
                </p>
              </div>

              <button
                onClick={() => handleSendPreset(tmpl)}
                className="w-full py-2 bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Simular Envío Push</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Notifications History & Custom Push Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Push Notifications Feed */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Bandeja de Alertas Enviadas al Dispositivo
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {safeNotifs.length} registros
            </span>
          </div>

          <div className="space-y-3">
            {safeNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  n.read
                    ? "bg-white border-slate-200/80 opacity-70"
                    : "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                </div>

                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(n.id);
                    }}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline shrink-0"
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Custom Push Message Composer */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Crear Notificación Personalizada
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Envía un mensaje de estímulo enfocado en tu objetivo actual.
            </p>
          </div>

          <form onSubmit={handleSendCustom} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Título del Aviso
              </label>
              <input
                type="text"
                required
                placeholder="Ej. ¡Excelente elección proteica!"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Cuerpo del Mensaje
              </label>
              <textarea
                required
                rows={4}
                placeholder="Ej. Has completado tus requerimientos de aminoácidos del almuerzo. Mantén esa inercia en la tarde..."
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Push Inmediata</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
