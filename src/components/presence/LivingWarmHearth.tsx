"use client";

import React, { useMemo, useId } from "react";
import { motion } from "framer-motion";

interface LivingWarmHearthProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isRecording?: boolean;
  isThinking?: boolean;
  size?: number;
  intensity?: number;
}

const RING_BAR_COUNT = 32;

export const LivingWarmHearth: React.FC<LivingWarmHearthProps> = ({
  isListening = false,
  isSpeaking = false,
  isRecording = false,
  isThinking = false,
  size = 280,
  intensity = 0.5,
}) => {
  const filterId = useId().replace(/:/g, "_");

  // Generowanie unoszących się iskier i drobinek ciepłego światła
  const embers = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 45 + Math.sin(i * 1.5) * 24 + (i % 3) * 4,
        delay: (i * 0.5) % 4,
        duration: 3.2 + (i % 4) * 0.8,
        size: 2 + (i % 3) * 1.5,
        drift: ((i % 5) - 2) * 10,
      })),
    []
  );

  // Wieniec promieni wokół paleniska
  const bars = useMemo(
    () =>
      Array.from({ length: RING_BAR_COUNT }, (_, i) => ({
        id: i,
        angle: (360 / RING_BAR_COUNT) * i,
        base: 0.4 + (i % 3) * 0.15,
        delay: (i * 0.09) % 1.5,
        duration: 1.4 + (i % 4) * 0.4,
      })),
    []
  );

  const scaleRatio = size / 300;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* 1. Zewnętrzna, głęboka poświata ciepłego bursztynu (Zawsze spójna, bez agresywnego czerwonego błysku) */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.25,
          height: size * 1.25,
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.30) 0%, rgba(251, 191, 36, 0.16) 45%, rgba(217, 119, 6, 0.05) 65%, transparent 75%)",
          filter: "blur(26px)",
        }}
        animate={{
          scale: isSpeaking
            ? [1, 1.10, 0.98, 1.08, 1]
            : isRecording
            ? [1, 1.06, 1]
            : isThinking
            ? [1, 1.04, 1]
            : [1, 1.02, 1],
          opacity: isSpeaking ? [0.75, 0.95, 0.75] : [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: isSpeaking ? 2.6 : isRecording ? 1.8 : 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Promienisty wieniec ciepłych słupków światła */}
      <div
        className="absolute pointer-events-none"
        style={{ width: size * 0.9, height: size * 0.9 }}
        aria-hidden
      >
        {bars.map((bar) => (
          <motion.span
            key={bar.id}
            className="absolute left-1/2 top-1/2 rounded-full bg-amber-400/60"
            style={{
              width: 2.5 * scaleRatio,
              height: 12 * scaleRatio,
              transformOrigin: `50% ${size * 0.42}px`,
              transform: `rotate(${bar.angle}deg) translateY(-${size * 0.42}px)`,
            }}
            animate={{
              scaleY: isSpeaking
                ? [bar.base, bar.base + 0.8, bar.base]
                : isRecording
                ? [bar.base, bar.base + 0.4, bar.base]
                : [bar.base, bar.base + 0.15, bar.base],
              opacity: isSpeaking
                ? [0.35, 0.85, 0.35]
                : isRecording
                ? [0.3, 0.65, 0.3]
                : [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: bar.duration,
              delay: bar.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3. Środkowy pierścień aury z delikatną złotą obwódką */}
      <motion.div
        aria-hidden
        className="absolute rounded-full border pointer-events-none"
        style={{
          width: size * 0.68,
          height: size * 0.68,
          borderColor: "rgba(251, 191, 36, 0.35)",
          background: "radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 80%)",
        }}
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : [1, 1.02, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{
          duration: isSpeaking ? 2.4 : 3.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 4. Organiczny rdzeń ciepłego ognia z filtrem turbulencji SVG */}
      <motion.div
        className="relative rounded-full pointer-events-none overflow-hidden"
        style={{
          width: size * 0.56,
          height: size * 0.56,
          background:
            "radial-gradient(circle at 50% 42%, #FFFBEB 0%, #FEF08A 22%, #F59E0B 52%, #D97706 78%, rgba(180, 83, 9, 0.4) 95%, transparent 100%)",
          boxShadow:
            "0 0 50px 12px rgba(245, 158, 11, 0.55), 0 0 90px 30px rgba(251, 191, 36, 0.35)",
        }}
        animate={{
          scale: isSpeaking
            ? [1, 1.08, 0.98, 1.05, 1]
            : isRecording
            ? [1, 1.04, 0.99, 1.03, 1]
            : [1, 1.02, 1],
        }}
        transition={{
          duration: isSpeaking ? 2.4 : 3.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 160 160"
        >
          <defs>
            <filter id={`hearth-flame-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.04"
                numOctaves="2"
                seed="5"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur={isSpeaking ? "4s" : "7s"}
                  values="0.015 0.04;0.022 0.06;0.015 0.04"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="10"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <radialGradient id={`flame-grad-${filterId}`} cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="90%" stopColor="#D97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#92400E" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g filter={`url(#hearth-flame-${filterId})`}>
            <ellipse
              cx="80"
              cy="80"
              rx="65"
              ry="65"
              fill={`url(#flame-grad-${filterId})`}
            />
            <ellipse
              cx="80"
              cy="74"
              rx="40"
              ry="38"
              fill="#FFFFFF"
              fillOpacity="0.5"
            />
          </g>
        </svg>

        {/* 5. Unoszące się iskrzące drobiny (Floating Embers) */}
        {embers.map((ember) => (
          <motion.span
            key={ember.id}
            className="absolute rounded-full pointer-events-none bg-amber-100 shadow-[0_0_8px_#FBBF24]"
            style={{
              left: `${ember.left}%`,
              bottom: "15%",
              width: ember.size * scaleRatio,
              height: ember.size * scaleRatio,
            }}
            animate={{
              y: [0, -size * 0.45, -size * 0.7],
              x: [0, ember.drift, ember.drift * 1.6],
              opacity: [0, 0.95, 0],
              scale: [0.6, 1.2, 0.4],
            }}
            transition={{
              duration: ember.duration,
              delay: ember.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
