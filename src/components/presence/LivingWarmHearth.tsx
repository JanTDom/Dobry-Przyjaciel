"use client";

import React, { useEffect, useRef } from "react";

interface LivingWarmHearthProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  intensity?: number;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const LivingWarmHearth: React.FC<LivingWarmHearthProps> = ({
  isListening = false,
  isSpeaking = false,
  intensity = 0.5,
  size = 300,
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

    // Nastrojowe cząsteczki złotego pyłu słonecznego (Golden Sun Motes)
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * (size * 0.7),
      y: (Math.random() - 0.5) * (size * 0.7),
      radius: 1.2 + Math.random() * 2.6,
      speedY: -0.15 - Math.random() * 0.4,
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: 0.3 + Math.random() * 0.7,
      decay: 0.002 + Math.random() * 0.004,
      hue: 40 + Math.random() * 12, // Świetliste słoneczne złoto (40-52)
    }));

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Słońce jest zawsze idealnie stabilne w centrum
      const targetX = size / 2;
      const targetY = size / 2;

      // Harmoniczny rytm oddechu i reakcja na głos
      const pulseSpeed = isSpeaking ? 3.6 : isListening ? 2.4 : 1.2;
      const basePulse = Math.sin(time * pulseSpeed) * 0.08;
      const voiceReaction = (isSpeaking || isListening ? 0.20 : 0) + intensity * 0.16;
      const scaleFactor = 1 + basePulse + voiceReaction;

      // 1. Zewnętrzna, świetlista aura ciepła (Radiant Amber & Honey Sun Glow)
      const maxHaloRadius = (size * 0.48) * scaleFactor;
      const haloGrad = ctx.createRadialGradient(
        targetX,
        targetY,
        maxHaloRadius * 0.10,
        targetX,
        targetY,
        maxHaloRadius
      );
      haloGrad.addColorStop(0, "rgba(254, 215, 170, 0.65)");
      haloGrad.addColorStop(0.35, "rgba(251, 191, 36, 0.32)");
      haloGrad.addColorStop(0.70, "rgba(245, 158, 11, 0.12)");
      haloGrad.addColorStop(1, "rgba(254, 243, 199, 0)");

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(targetX, targetY, maxHaloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Ciepłe, złote promienie słoneczne (Luminous Amber Solar Rays)
      const rayCount = 14;
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2 + time * 0.15;
        const waveOffset = Math.sin(time * 2.0 + r * 1.5) * 8;
        const rayLen = (size * 0.40) * scaleFactor + waveOffset;
        const rx = targetX + Math.cos(angle) * rayLen;
        const ry = targetY + Math.sin(angle) * rayLen;

        const rayAlpha = 0.12 + Math.sin(time * 1.4 + r) * 0.06 + (isSpeaking ? 0.10 : 0);
        ctx.strokeStyle = `rgba(245, 158, 11, ${rayAlpha})`;
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // 3. Organiczna, falująca korona słońca (Living Sun Corona)
      const coronaRadius = (size * 0.27) * scaleFactor;
      ctx.beginPath();
      for (let i = 0; i <= Math.PI * 2; i += 0.08) {
        const organicNoise = Math.sin(i * 6 + time * 3.0) * (4 + (isSpeaking ? 6 : 1.5)) +
                             Math.cos(i * 4 - time * 2.0) * 2.5;
        const r = coronaRadius + organicNoise;
        const cx = targetX + Math.cos(i) * r;
        const cy = targetY + Math.sin(i) * r;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.closePath();

      const coronaGrad = ctx.createRadialGradient(
        targetX,
        targetY,
        coronaRadius * 0.05,
        targetX,
        targetY,
        coronaRadius * 1.05
      );
      coronaGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      coronaGrad.addColorStop(0.30, "rgba(254, 240, 138, 0.98)");
      coronaGrad.addColorStop(0.65, "rgba(251, 191, 36, 0.85)");
      coronaGrad.addColorStop(0.90, "rgba(245, 158, 11, 0.55)");
      coronaGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      // 4. Lśniące, perłowo-słoneczne jądro (Radiant Diamond Core)
      const coreRadius = (size * 0.12) * scaleFactor;
      const coreGrad = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        coreRadius
      );
      coreGrad.addColorStop(0, "#FFFFFF");
      coreGrad.addColorStop(0.45, "#FFFBEB");
      coreGrad.addColorStop(0.85, "rgba(253, 224, 71, 0.95)");
      coreGrad.addColorStop(1, "rgba(245, 158, 11, 0.3)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(targetX, targetY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Cząsteczki unoszącego się złotego pyłu (Floating Sun Sparks)
      particles.forEach((p) => {
        p.y += p.speedY * (isSpeaking ? 1.8 : 1);
        p.x += p.speedX;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -size * 0.4) {
          p.x = (Math.random() - 0.5) * (size * 0.55);
          p.y = (Math.random() - 0.5) * (size * 0.35) + 15;
          p.alpha = 0.4 + Math.random() * 0.6;
        }

        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        const maxDist = size * 0.45;
        const edgeFade = Math.max(0, 1 - dist / maxDist);

        ctx.fillStyle = `hsla(${p.hue}, 95%, 60%, ${p.alpha * edgeFade})`;
        ctx.beginPath();
        ctx.arc(targetX + p.x, targetY + p.y, p.radius, 0, Math.PI * 2);
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
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-transform duration-700 hover:scale-[1.03] pointer-events-none drop-shadow-[0_8px_30px_rgba(245,158,11,0.25)]"
      />
    </div>
  );
};
