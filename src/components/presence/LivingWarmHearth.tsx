"use client";

import React, { useEffect, useRef } from "react";

interface LivingWarmHearthProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  intensity?: number; // 0 to 1
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const LivingWarmHearth: React.FC<LivingWarmHearthProps> = ({
  isListening = false,
  isSpeaking = false,
  intensity = 0.5,
  size = 280,
  className = "",
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // Organic ember particles
    const emberCount = 32;
    const embers = Array.from({ length: emberCount }, () => ({
      x: (Math.random() - 0.5) * (size * 0.45),
      y: (Math.random() - 0.5) * (size * 0.45),
      radius: 1 + Math.random() * 2.5,
      speedY: -0.3 - Math.random() * 0.7,
      speedX: (Math.random() - 0.5) * 0.4,
      alpha: 0.2 + Math.random() * 0.6,
      decay: 0.003 + Math.random() * 0.006,
      hue: 30 + Math.random() * 25, // warm amber to gold
    }));

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = size / 2;
      const centerY = size / 2;

      // Base pulse calculation
      const pulseSpeed = isSpeaking ? 3.5 : isListening ? 2.5 : 1.2;
      const basePulse = Math.sin(time * pulseSpeed) * 0.08;
      const voiceReaction = (isSpeaking || isListening ? 0.2 : 0) + intensity * 0.15;
      const scaleFactor = 1 + basePulse + voiceReaction;

      // 1. Soft atmospheric outer glow
      const outerRadius = (size * 0.42) * scaleFactor;
      const outerGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        outerRadius * 0.15,
        centerX,
        centerY,
        outerRadius
      );
      outerGrad.addColorStop(0, "rgba(245, 158, 11, 0.22)");
      outerGrad.addColorStop(0.4, "rgba(217, 119, 6, 0.12)");
      outerGrad.addColorStop(0.7, "rgba(180, 83, 9, 0.05)");
      outerGrad.addColorStop(1, "rgba(9, 7, 6, 0)");

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Mid hearth warmth aura (organic undulating layers)
      const midRadius = (size * 0.28) * scaleFactor;
      ctx.beginPath();
      for (let i = 0; i <= Math.PI * 2; i += 0.08) {
        const offset =
          Math.sin(i * 4 + time * 2) * (4 + (isSpeaking ? 7 : 2)) +
          Math.cos(i * 3 - time * 1.5) * 3;
        const r = midRadius + offset;
        const x = centerX + Math.cos(i) * r;
        const y = centerY + Math.sin(i) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const midGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        midRadius * 0.1,
        centerX,
        centerY,
        midRadius
      );
      midGrad.addColorStop(0, "rgba(254, 243, 199, 0.75)");
      midGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.55)");
      midGrad.addColorStop(0.7, "rgba(217, 119, 6, 0.25)");
      midGrad.addColorStop(1, "rgba(180, 83, 9, 0)");
      ctx.fillStyle = midGrad;
      ctx.fill();

      // 3. Core golden heart (intimate candle flame center)
      const coreRadius = (size * 0.13) * (scaleFactor * 0.95);
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius
      );
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      coreGrad.addColorStop(0.3, "rgba(254, 243, 199, 0.9)");
      coreGrad.addColorStop(0.65, "rgba(245, 158, 11, 0.6)");
      coreGrad.addColorStop(1, "rgba(217, 119, 6, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Floating warm embers
      embers.forEach((ember) => {
        ember.y += ember.speedY;
        ember.x += ember.speedX + Math.sin(time + ember.y * 0.05) * 0.2;
        ember.alpha -= ember.decay;

        if (ember.alpha <= 0 || ember.y < -size * 0.45) {
          ember.x = (Math.random() - 0.5) * (size * 0.3);
          ember.y = (Math.random() * 0.1) * (size * 0.2);
          ember.alpha = 0.3 + Math.random() * 0.5;
          ember.radius = 1 + Math.random() * 2;
        }

        ctx.fillStyle = `hsla(${ember.hue}, 90%, 65%, ${ember.alpha})`;
        ctx.beginPath();
        ctx.arc(centerX + ember.x, centerY + ember.y, ember.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isListening, isSpeaking, intensity, size]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
};
