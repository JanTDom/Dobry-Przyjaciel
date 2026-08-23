"use client";

import React, { useEffect, useRef } from "react";

interface Mote {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
}

export const AmbientSunMotes: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          active: true,
        };
      }
    };

    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    // Tworzenie cząsteczek ciepłego światła
    const count = Math.min(32, Math.floor((width * height) / 35000));
    const motes: Mote[] = [];
    const colors = [
      "rgba(245, 158, 11, ", // Amber
      "rgba(251, 191, 36, ", // Honey
      "rgba(253, 230, 138, ", // Light sun
      "rgba(217, 119, 6, ",  // Deep gold
    ];

    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.5 + Math.random() * 3.5,
        baseAlpha: 0.15 + Math.random() * 0.35,
        alpha: 0.2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.45, // Delikatne unoszenie się w górę
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];

        // Falowanie pulsowania światła
        m.alpha = m.baseAlpha + Math.sin(time * m.pulseSpeed + m.pulseOffset) * 0.12;

        // Reakcja na kursor / dotyk
        if (mousePos.current.active) {
          const dx = m.x - mousePos.current.x;
          const dy = m.y - mousePos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const force = (140 - dist) / 140;
            m.x += (dx / dist) * force * 1.8;
            m.y += (dy / dist) * force * 1.8;
          }
        }

        m.x += m.vx;
        m.y += m.vy;

        // Zapętlenie
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        // Rysowanie drobiny światła z delikatną poświatą
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 2.8);
        grad.addColorStop(0, `${m.color}${Math.max(0.05, m.alpha)})`);
        grad.addColorStop(0.5, `${m.color}${Math.max(0.02, m.alpha * 0.4)})`);
        grad.addColorStop(1, `${m.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Jasny rdzeń
        ctx.fillStyle = `rgba(255, 253, 240, ${Math.max(0.1, m.alpha * 1.2)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
};
