"use client";

import React, { useEffect, useRef } from "react";
import { MoodType } from "@/types";

interface LivingPresenceOrbProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  mood?: MoodType;
  className?: string;
  onClick?: () => void;
}

export const LivingPresenceOrb: React.FC<LivingPresenceOrbProps> = ({
  isSpeaking = false,
  isListening = false,
  mood = "peaceful",
  className = "",
  onClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.025;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Mood-based color palette
      let primaryColor = "rgba(217, 119, 6, "; // Warm amber
      let secondaryColor = "rgba(244, 114, 182, "; // Soft rose
      let accentColor = "rgba(20, 184, 166, "; // Calm teal

      if (mood === "anxious" || mood === "overwhelmed") {
        primaryColor = "rgba(14, 165, 233, "; // Soothing sky blue
        secondaryColor = "rgba(99, 102, 241, "; // Indigo
        accentColor = "rgba(45, 212, 191, "; // Sage
      } else if (mood === "hopeful") {
        primaryColor = "rgba(245, 158, 11, ";
        secondaryColor = "rgba(251, 191, 36, ";
        accentColor = "rgba(236, 72, 153, ";
      } else if (mood === "exhausted") {
        primaryColor = "rgba(139, 92, 246, "; // Purple dream
        secondaryColor = "rgba(59, 130, 246, ";
        accentColor = "rgba(167, 139, 250, ";
      }

      // Dynamic scale factors
      const breathScale = 1 + 0.08 * Math.sin(t * 0.8);
      const voiceEnergy = isSpeaking ? (1 + 0.22 * Math.sin(t * 4.5) * Math.cos(t * 2)) : (isListening ? 1.15 : 1);
      const radius = (width * 0.28) * breathScale * voiceEnergy;

      // 1. Outermost soft aura
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius * 1.85
      );
      auraGradient.addColorStop(0, primaryColor + "0.32)");
      auraGradient.addColorStop(0.5, secondaryColor + "0.14)");
      auraGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.85, 0, Math.PI * 2);
      ctx.fill();

      // 2. Middle breathing organic wave layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const layerRadius = radius * (0.85 + layer * 0.12);
        const points = 12;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const waveOffset = Math.sin(angle * 3 + t * (1.2 + layer * 0.4)) * (8 + layer * 4) * (isSpeaking ? 2 : 1);
          const r = layerRadius + waveOffset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fillStyle = (layer === 0 ? secondaryColor : layer === 1 ? primaryColor : accentColor) + "0.22)";
        ctx.fill();
      }

      // 3. Core luminous light center
      const coreGradient = ctx.createRadialGradient(
        centerX - radius * 0.15 * Math.sin(t),
        centerY - radius * 0.15 * Math.cos(t),
        0,
        centerX,
        centerY,
        radius * 0.95
      );
      coreGradient.addColorStop(0, "#FFFFFF");
      coreGradient.addColorStop(0.2, primaryColor + "0.95)");
      coreGradient.addColorStop(0.6, secondaryColor + "0.7)");
      coreGradient.addColorStop(1, accentColor + "0.1)");

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 4. Subtle starlight sparkle particles around core
      for (let p = 0; p < 5; p++) {
        const pAngle = t * 0.5 + (p * Math.PI * 2) / 5;
        const pDist = radius * 1.15 + Math.sin(t * 2 + p) * 12;
        const px = centerX + Math.cos(pAngle) * pDist;
        const py = centerY + Math.sin(pAngle) * pDist;

        ctx.fillStyle = "rgba(255, 255, 255, " + (0.3 + 0.3 * Math.sin(t * 3 + p)) + ")";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening, mood]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-52 h-52 sm:w-68 sm:h-68 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute -bottom-2 px-3.5 py-1 rounded-full bg-surface-100/90 backdrop-blur-md border border-white/10 text-xs text-warm-100 shadow-xl flex items-center gap-2 pointer-events-none transition-all">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-amber-400 animate-ping" : isListening ? "bg-emerald-400 animate-pulse" : "bg-warm-400"}`} />
        <span className="font-medium tracking-wide">
          {isSpeaking ? "Mówi do Ciebie..." : isListening ? "Słucha z uwagą..." : "Obecna przy Tobie"}
        </span>
      </div>
    </div>
  );
};
