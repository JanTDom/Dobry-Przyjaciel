"use client";

import React from "react";
import { UserProfile } from "@/types";
import { Heart, Calendar, Sparkles, ShieldCheck, Flame, Compass } from "lucide-react";

interface BondOverviewProps {
  profile: UserProfile;
}

export const BondOverview: React.FC<BondOverviewProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
      {/* Metric 1 */}
      <div className="bg-surface-200/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Dni Razem</span>
          <Calendar className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white">{profile.daysTogether}</span>
          <span className="text-xs text-slate-400 ml-1.5">dni</span>
        </div>
        <span className="text-[10px] text-amber-300/80 mt-1">Ciągła obecność</span>
      </div>

      {/* Metric 2 */}
      <div className="bg-surface-200/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Więź & Zaufanie</span>
          <Heart className="w-4 h-4 text-rose-400" />
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white">96%</span>
        </div>
        <span className="text-[10px] text-rose-300/80 mt-1">Głębokie zrozumienie</span>
      </div>

      {/* Metric 3 */}
      <div className="bg-surface-200/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Zapamiętane Fakty</span>
          <Sparkles className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white">{profile.memories.length}</span>
          <span className="text-xs text-slate-400 ml-1.5">kluczy</span>
        </div>
        <span className="text-[10px] text-teal-300/80 mt-1">O Twoim życiu</span>
      </div>

      {/* Metric 4 */}
      <div className="bg-surface-200/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Pokonane Burze</span>
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-bold text-white">{profile.overcomeCrises.length}</span>
          <span className="text-xs text-slate-400 ml-1.5">kryzysy</span>
        </div>
        <span className="text-[10px] text-indigo-300/80 mt-1">Dowody Twojej siły</span>
      </div>
    </div>
  );
};
