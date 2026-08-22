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

    // Nastrojowe cząsteczki złotego pyłu (Floating Light Motes)
    const particleCount = 36;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * (size * 0.65),
      y: (Math.random() - 0.5) * (size * 0.65),
      radius: 1.2 + Math.random() * 2.8,
      speedY: -0.15 - Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: 0.2 + Math.random() * 0.7,
      decay: 0.002 + Math.random() * 0.004,
      hue: 36 + Math.random() * 18, // Miodowo-złoty bursztyn
    }));

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Słońce jest zawsze idealnie stabilne w centrum (bez uciekania za myszą)
      const targetX = size / 2;
      const targetY = size / 2;

      // Harmoniczny rytm oddechu i reakcja na głos
      const pulseSpeed = isSpeaking ? 3.4 : isListening ? 2.2 : 1.15;
      const basePulse = Math.sin(time * pulseSpeed) * 0.07;
      const voiceReaction = (isSpeaking || isListening ? 0.18 : 0) + intensity * 0.14;
      const scaleFactor = 1 + basePulse + voiceReaction;

      // 1. Zewnętrzna, głęboka aura złotej godziny (Golden Hour Ambient Halo)
      const maxHaloRadius = (size * 0.48) * scaleFactor;
      const haloGrad = ctx.createRadialGradient(
        targetX,
        targetY,
        maxHaloRadius * 0.1,
        targetX,
        targetY,
        maxHaloRadius
      );
      haloGrad.addColorStop(0, "rgba(251, 191, 36, 0.42)");
      haloGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.22)");
      haloGrad.addColorStop(0.7, "rgba(253, 230, 138, 0.09)");
      haloGrad.addColorStop(1, "rgba(250, 247, 242, 0)");

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(targetX, targetY, maxHaloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Nastrojowe promienie słoneczne (Atmospheric Sunbeams)
      const rayCount = 14;
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2 + time * 0.18;
        const waveOffset = Math.sin(time * 2.2 + r * 1.5) * 8;
        const rayLen = (size * 0.41) * scaleFactor + waveOffset;
        const rx = targetX + Math.cos(angle) * rayLen;
        const ry = targetY + Math.sin(angle) * rayLen;

        const rayAlpha = 0.07 + Math.sin(time * 1.5 + r) * 0.05 + (isSpeaking ? 0.08 : 0);
        ctx.strokeStyle = `rgba(251, 191, 36, ${rayAlpha})`;
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // 3. Organiczny, falujący dysk światła (Living Solar Corona)
      const coronaRadius = (size * 0.28) * scaleFactor;
      ctx.beginPath();
      for (let i = 0; i <= Math.PI * 2; i += 0.08) {
        const organicNoise = Math.sin(i * 6 + time * 3.5) * (4 + (isSpeaking ? 7 : 2)) +
                             Math.cos(i * 3 - time * 2) * 3;
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
      coronaGrad.addColorStop(0.35, "rgba(254, 240, 138, 0.96)");
      coronaGrad.addColorStop(0.7, "rgba(245, 158, 11, 0.78)");
      coronaGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      // 4. Lśniące, perłowo-białe jądro (Diamond Pearl Core)
      const coreRadius = (size * 0.13) * scaleFactor;
      const coreGrad = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        coreRadius
      );
      coreGrad.addColorStop(0, "#FFFFFF");
      coreGrad.addColorStop(0.55, "rgba(254, 240, 138, 0.95)");
      coreGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(targetX, targetY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Unoszące się nastrojowe złote drobinki światła
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * 1.2 + p.y * 0.04) * 0.35;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y < -size * 0.45) {
          p.x = (Math.random() - 0.5) * (size * 0.45);
          p.y = (Math.random() * 0.25) * (size * 0.3);
          p.alpha = 0.35 + Math.random() * 0.6;
          p.radius = 1.2 + Math.random() * 2.5;
        }

        ctx.fillStyle = `hsla(${p.hue}, 95%, 55%, ${p.alpha})`;
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
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-transform duration-500 hover:scale-105 golden-light-glow"
      />
    </div>
  );
};
