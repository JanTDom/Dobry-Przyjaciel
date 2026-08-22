"use client";

import React, { useState, useEffect } from "react";
import { BondOverview } from "@/components/memory/BondOverview";
import { PeopleGraph } from "@/components/memory/PeopleGraph";
import { GrowthTracker } from "@/components/memory/GrowthTracker";
import { getStoredProfile, saveStoredProfile, INITIAL_USER_PROFILE } from "@/lib/storage";
import { UserProfile, LifeMemoryFact } from "@/types";
import { Heart, Sparkles, Plus, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function MemoryPage() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [newFactTitle, setNewFactTitle] = useState("");
  const [newFactDetail, setNewFactDetail] = useState("");
  const [isAddingFact, setIsAddingFact] = useState(false);

  useEffect(() => {
    setProfile(getStoredProfile());
  }, []);

  const handleAddCustomFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactTitle.trim() || !newFactDetail.trim()) return;

    const newFact: LifeMemoryFact = {
      id: `custom-m-${Date.now()}`,
      category: "core_value",
      title: newFactTitle.trim(),
      detail: newFactDetail.trim(),
      confidence: 1.0,
      extractedAt: new Date().toISOString().split("T")[0]
    };

    const updated = {
      ...profile,
      memories: [newFact, ...profile.memories]
    };
    setProfile(updated);
    saveStoredProfile(updated);
    setNewFactTitle("");
    setNewFactDetail("");
    setIsAddingFact(false);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Powrót do Przyjaciela</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Heart className="w-7 h-7 text-amber-400" />
          Żywy Graf Pamięci i Więzi
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          To tutaj gromadzi się cała wiedza o Tobie: Twoje wartości, relacje z bliskimi i dowody na pokonane trudności.
        </p>
      </div>

      {/* Metrics Row */}
      <BondOverview profile={profile} />

      {/* People in Life */}
      <PeopleGraph people={profile.peopleInLife} />

      {/* Core Memories / Facts Grid */}
      <div className="w-full bg-surface-200/90 border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-bold text-white">Co {profile.companionName} o Tobie pamięta</h3>
          </div>

          <button
            onClick={() => setIsAddingFact(!isAddingFact)}
            className="px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-white/10 text-xs text-slate-300 border border-white/5 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Dodaj ważną zasadę</span>
          </button>
        </div>

        {isAddingFact && (
          <form onSubmit={handleAddCustomFact} className="mb-6 p-4 rounded-2xl bg-surface-100/90 border border-amber-500/30 space-y-3 animate-in fade-in">
            <h4 className="text-xs uppercase font-bold text-amber-400">Nowa zasada lub wartość do zapamiętania</h4>
            <input
              type="text"
              placeholder="Tytuł (np. Nie pracuję po 19:00)"
              value={newFactTitle}
              onChange={(e) => setNewFactTitle(e.target.value)}
              className="w-full bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
            />
            <textarea
              placeholder="Dlaczego to dla Ciebie ważne..."
              value={newFactDetail}
              onChange={(e) => setNewFactDetail(e.target.value)}
              rows={2}
              className="w-full bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingFact(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
              >
                Zapisz w pamięci
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {profile.memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-surface-100/90 border border-white/5 rounded-2xl p-4 hover:border-teal-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                    {mem.category.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-500">{mem.extractedAt}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-2">{mem.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{mem.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overcome Crises Tracker */}
      <GrowthTracker crises={profile.overcomeCrises} />
    </div>
  );
}
