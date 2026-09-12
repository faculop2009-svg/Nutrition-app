import React, { useState } from "react";
import {
  Trophy,
  Users,
  Target,
  Medal,
  Flame,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";
import { Challenge, Achievement, CommunityLeaderboardUser } from "../types";

interface ChallengesCommunityProps {
  challenges: Challenge[];
  achievements: Achievement[];
  leaderboard: CommunityLeaderboardUser[];
  onToggleJoinChallenge: (challengeId: string) => void;
}

export const ChallengesCommunity: React.FC<ChallengesCommunityProps> = ({
  challenges = [],
  achievements = [],
  leaderboard = [],
  onToggleJoinChallenge,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"retos" | "comunidad" | "logros">("retos");

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const safeChallenges = Array.isArray(challenges) ? challenges : [];
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

  const unlockedCount = safeAchievements.filter((a) => a && a.unlocked).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              Retos Semanales & Interacción Comunitaria
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Retos de Salud, Comunidad & Logros
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Participa en desafíos nutricionales respaldados clínicamente, compite de forma anónima y saludable en la tabla comunitaria y desbloquea hitos de constancia metabólica.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab("retos")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === "retos"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Retos Semanales
            </button>
            <button
              onClick={() => setActiveSubTab("comunidad")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === "comunidad"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Comunidad & Ránking
            </button>
            <button
              onClick={() => setActiveSubTab("logros")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === "logros"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Medallero ({unlockedCount}/{safeAchievements.length})
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Weekly Challenges */}
      {activeSubTab === "retos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Desafíos Activos Esta Semana:
            </h3>
            <span className="text-xs text-slate-400 font-medium">Recompensas directas en puntos de salud</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeChallenges.map((chal) => {
              const progressPercent = Math.round((chal.completedDays / chal.targetDays) * 100);
              return (
                <div
                  key={chal.id}
                  className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                    chal.isJoined
                      ? "border-emerald-500/70 shadow-sm ring-1 ring-emerald-500/20"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {chal.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Finaliza: {chal.endDate}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {chal.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {chal.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Progreso acumulado:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {chal.completedDays} de {chal.targetDays} días ({progressPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono font-semibold text-amber-600">
                        <Flame className="w-3.5 h-3.5" /> +{chal.points} pts
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {chal.participantsCount.toLocaleString()} participantes
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleJoinChallenge(chal.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        chal.isJoined
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                          : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                      }`}
                    >
                      {chal.isJoined ? "Reto Activo" : "Unirme al Reto"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Community Leaderboard */}
      {activeSubTab === "comunidad" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Tabla de Posiciones Comunitaria
              </h3>
              <p className="text-xs text-slate-500">
                Basado en consistencia de registro fotográfico, apego a macronutrientes y actividad wearable.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Liga Élite de Salud
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {safeLeaderboard.map((user) => (
              <div
                key={user.id}
                className={`py-3.5 px-4 rounded-xl flex items-center justify-between transition-colors ${
                  user.isCurrentUser
                    ? "bg-emerald-50/70 border border-emerald-300/80 font-bold"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 flex items-center justify-center font-mono font-black text-sm">
                    {user.rank === 1 ? (
                      <span className="text-amber-500 text-lg">🥇</span>
                    ) : user.rank === 2 ? (
                      <span className="text-slate-400 text-lg">🥈</span>
                    ) : user.rank === 3 ? (
                      <span className="text-amber-700 text-lg">🥉</span>
                    ) : (
                      <span className="text-slate-400">#{user.rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white">
                          TÚ
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      País: {user.country} • Racha: <strong className="text-slate-700 font-mono">{user.streakDays} días</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right font-mono">
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">HealthScore</span>
                    <span className="text-xs font-bold text-emerald-700">{user.avgHealthScore}/100</span>
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-black text-slate-900 block">
                      {user.points.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">puntos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Achievements Showcase */}
      {activeSubTab === "logros" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Medallas & Hitos de Constancia Saludable:
            </h3>
            <span className="text-xs text-slate-400 font-mono font-medium">
              Desbloqueados: {unlockedCount} de {safeAchievements.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeAchievements.map((ach) => (
              <div
                key={ach.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex items-start gap-4 ${
                  ach.unlocked
                    ? "border-emerald-200/90 shadow-2xs"
                    : "border-slate-200/70 opacity-60 bg-slate-50/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  ach.unlocked
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-slate-200 text-slate-400"
                }`}>
                  {ach.unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                    {ach.unlocked && (
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {ach.unlockedDate || "Conseguido"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {ach.description}
                  </p>
                  <div className="pt-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
