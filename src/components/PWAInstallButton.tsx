import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all shadow-xs ${
          compact
            ? "bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5"
            : "bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2"
        }`}
        title="Instalar NutriScan Pro como aplicación nativa en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-emerald-100" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    N
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Instalar en iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Disfruta de escaneo biométrico instantáneo y uso sin conexión agregando NutriScan Pro a tu pantalla de inicio:
              </p>

              <div className="space-y-2.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha arriba) en la barra de Safari.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Desplázate hacia abajo y selecciona <strong>"Agregar a Inicio"</strong> (+).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Pulsa <strong>Agregar</strong> en la esquina superior derecha.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback ambient install guide if browser hasn't fired beforeinstallprompt yet
  return (
    <button
      onClick={() => setShowIOSGuide(true)}
      className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
      title="Instala la aplicación en tu móvil u ordenador para acceso directo y modo offline"
    >
      <Download className="w-3.5 h-3.5 text-emerald-600" />
      <span>Instalar App</span>
    </button>
  );
};
