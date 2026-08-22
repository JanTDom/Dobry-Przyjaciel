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

    // Radosne, złote drobinki światła i promienie
    const sparklesCount = 28;
    const sparkles = Array.from({ length: sparklesCount }, () => ({
      x: (Math.random() - 0.5) * (size * 0.5),
      y: (Math.random() - 0.5) * (size * 0.5),
      radius: 1.5 + Math.random() * 2.5,
      speedY: -0.2 - Math.random() * 0.6,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: 0.3 + Math.random() * 0.6,
      decay: 0.003 + Math.random() * 0.005,
      hue: 38 + Math.random() * 16, // Złoty słoneczny bursztyn
    }));

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const centerX = size / 2;
      const centerY = size / 2;

      // Pulsacja oddechu i reakcja na głos
      const pulseSpeed = isSpeaking ? 3.2 : isListening ? 2.2 : 1.1;
      const basePulse = Math.sin(time * pulseSpeed) * 0.06;
      const voiceReaction = (isSpeaking || isListening ? 0.15 : 0) + intensity * 0.12;
      const scaleFactor = 1 + basePulse + voiceReaction;

      // 1. Zewnętrzna, słoneczna miękka poświata
      const outerRadius = (size * 0.44) * scaleFactor;
      const outerGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        outerRadius * 0.15,
        centerX,
        centerY,
        outerRadius
      );
      outerGrad.addColorStop(0, "rgba(251, 191, 36, 0.45)");
      outerGrad.addColorStop(0.35, "rgba(245, 158, 11, 0.25)");
      outerGrad.addColorStop(0.7, "rgba(253, 230, 138, 0.12)");
      outerGrad.addColorStop(1, "rgba(250, 247, 242, 0)");

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Miękkie, organiczne promienie słońca
      const rayCount = 12;
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2 + time * 0.25;
        const rayLen = (size * 0.38) * scaleFactor * (1 + Math.sin(time * 2 + r) * 0.1);
        const rx = centerX + Math.cos(angle) * rayLen;
        const ry = centerY + Math.sin(angle) * rayLen;

        ctx.strokeStyle = `rgba(251, 191, 36, ${0.08 + Math.sin(time + r) * 0.04})`;
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // 3. Ciepłe, pulsujące serce światła (Golden Honey Core)
      const midRadius = (size * 0.26) * scaleFactor;
      ctx.beginPath();
      for (let i = 0; i <= Math.PI * 2; i += 0.1) {
        const offset = Math.sin(i * 5 + time * 3) * (3 + (isSpeaking ? 5 : 1.5));
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
      midGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      midGrad.addColorStop(0.3, "rgba(254, 240, 138, 0.95)");
      midGrad.addColorStop(0.65, "rgba(245, 158, 11, 0.75)");
      midGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
      ctx.fillStyle = midGrad;
      ctx.fill();

      // 4. Lśniący, słoneczny środek
      const coreRadius = (size * 0.12) * scaleFactor;
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius
      );
      coreGrad.addColorStop(0, "#FFFFFF");
      coreGrad.addColorStop(0.5, "#FEF08A");
      coreGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Radosne, unoszące się iskry światła
      sparkles.forEach((sparkle) => {
        sparkle.y += sparkle.speedY;
        sparkle.x += sparkle.speedX + Math.sin(time + sparkle.y * 0.05) * 0.3;
        sparkle.alpha -= sparkle.decay;

        if (sparkle.alpha <= 0 || sparkle.y < -size * 0.45) {
          sparkle.x = (Math.random() - 0.5) * (size * 0.35);
          sparkle.y = (Math.random() * 0.2) * (size * 0.2);
          sparkle.alpha = 0.4 + Math.random() * 0.5;
          sparkle.radius = 1.5 + Math.random() * 2;
        }

        ctx.fillStyle = `hsla(${sparkle.hue}, 95%, 55%, ${sparkle.alpha})`;
        ctx.beginPath();
        ctx.arc(centerX + sparkle.x, centerY + sparkle.y, sparkle.radius, 0, Math.PI * 2);
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
        className="transition-transform duration-500 hover:scale-105 drop-shadow-md"
      />
    </div>
  );
};
