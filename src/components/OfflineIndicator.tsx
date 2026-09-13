import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-fadeIn">
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Modo Offline</span>
      <span className="text-slate-400">•</span>
      <span className="text-emerald-400 flex items-center gap-1 font-normal text-[11px]">
        <Database className="w-3 h-3 inline" />
        Base de Alimentos disponible sin conexión
      </span>
    </div>
  );
};
