"use client";

import React from "react";
import { MoodType } from "@/types";

interface MoodAtmosphereProps {
  mood: MoodType;
}

export const MoodAtmosphere: React.FC<MoodAtmosphereProps> = ({ mood }) => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-1000">
      {/* Deep atmospheric backdrop */}
      <div className="absolute inset-0 bg-[#07090E]" />

      {/* Dynamic ambient gradients depending on mood */}
      <div
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-25 transition-all duration-1000 ${
          mood === "anxious" || mood === "overwhelmed"
            ? "bg-sky-500/40"
            : mood === "hopeful"
            ? "bg-amber-400/30"
            : mood === "exhausted"
            ? "bg-purple-600/30"
            : "bg-amber-600/25"
        }`}
      />

      <div
        className={`absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full blur-[140px] opacity-20 transition-all duration-1000 ${
          mood === "anxious"
            ? "bg-teal-500/30"
            : "bg-rose-500/20"
        }`}
      />

      {/* Subtle organic noise grid layer */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
};
