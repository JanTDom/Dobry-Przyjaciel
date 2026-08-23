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

const RING_BAR_COUNT = 36;

export const LivingWarmHearth: React.FC<LivingWarmHearthProps> = ({
  isListening = false,
  isSpeaking = false,
  isRecording = false,
  isThinking = false,
  size = 280,
  intensity = 0.5,
}) => {
  const filterId = useId().replace(/:/g, "_");

  // Wyliczenie dynamicznej intensywności
  const effectiveIntensity = isRecording
    ? 0.95
    : isSpeaking
    ? 0.85
    : isThinking
    ? 0.6
    : isListening
    ? 0.5
    : Math.max(0.3, intensity);

  // Generowanie unoszących się iskier i drobinek ciepłego światła
  const embers = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: 44 + Math.sin(i * 1.5) * 28 + (i % 3) * 4,
        delay: (i * 0.45) % 3.5,
        duration: 2.8 + (i % 4) * 0.7,
        size: 2 + (i % 3) * 1.5,
        drift: ((i % 5) - 2) * 12,
      })),
    []
  );

  // Audio-reaktywny wieniec promieni wokół paleniska
  const bars = useMemo(
    () =>
      Array.from({ length: RING_BAR_COUNT }, (_, i) => ({
        id: i,
        angle: (360 / RING_BAR_COUNT) * i,
        base: 0.4 + (i % 3) * 0.2,
        delay: (i * 0.08) % 1.2,
        duration: 1.1 + (i % 4) * 0.3,
      })),
    []
  );

  const scaleRatio = size / 300;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* 1. Zewnętrzna, głęboka poświata bursztynowo-złota (Volumetric Bloom) */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 1.25,
          height: size * 1.25,
          background: isRecording
            ? "radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(245, 158, 11, 0.20) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(251, 191, 36, 0.20) 45%, rgba(217, 119, 6, 0.08) 65%, transparent 75%)",
          filter: "blur(28px)",
        }}
        animate={{
          scale: isRecording
            ? [1, 1.15, 0.98, 1.12, 1]
            : isSpeaking
            ? [1, 1.12, 0.96, 1.08, 1]
            : isListening
            ? [1, 1.05, 1]
            : [1, 1.03, 1],
          opacity: [0.65, 0.9, 0.65],
        }}
        transition={{
          duration: isRecording ? 1.4 : isSpeaking ? 2.2 : 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Promienisty wieniec reaktywnych słupków światła */}
      <div
        className="absolute pointer-events-none"
        style={{ width: size * 0.9, height: size * 0.9 }}
        aria-hidden
      >
        {bars.map((bar) => (
          <motion.span
            key={bar.id}
            className={`absolute left-1/2 top-1/2 rounded-full ${
              isRecording ? "bg-red-500/70" : "bg-amber-400/60"
            }`}
            style={{
              width: 2.5 * scaleRatio,
              height: 12 * scaleRatio,
              transformOrigin: `50% ${(size * 0.42)}px`,
              transform: `rotate(${bar.angle}deg) translateY(-${size * 0.42}px)`,
            }}
            animate={{
              scaleY: isRecording
                ? [bar.base, bar.base + 1.2, bar.base]
                : isSpeaking
                ? [bar.base, bar.base + 0.9, bar.base]
                : isListening
                ? [bar.base, bar.base + 0.4, bar.base]
                : [bar.base, bar.base + 0.15, bar.base],
              opacity: isRecording
                ? [0.4, 0.95, 0.4]
                : isSpeaking
                ? [0.35, 0.85, 0.35]
                : [0.2, 0.5, 0.2],
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
          borderColor: isRecording ? "rgba(239, 68, 68, 0.4)" : "rgba(251, 191, 36, 0.4)",
          background: isRecording
            ? "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 80%)"
            : "radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, transparent 80%)",
        }}
        animate={{
          scale: isSpeaking ? [1, 1.06, 1] : [1, 1.03, 1],
          opacity: [0.5, 0.85, 0.5],
        }}
        transition={{
          duration: isSpeaking ? 1.8 : 3.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 4. Żywy, organiczny rdzeń ognia z filtrem turbulencji SVG */}
      <motion.div
        className="relative rounded-full pointer-events-none overflow-hidden"
        style={{
          width: size * 0.56,
          height: size * 0.56,
          background: isRecording
            ? "radial-gradient(circle at 50% 45%, #FFFFFF 0%, #FCA5A5 20%, #EF4444 50%, #B91C1C 75%, transparent 100%)"
            : "radial-gradient(circle at 50% 42%, #FFFBEB 0%, #FEF08A 22%, #F59E0B 52%, #D97706 78%, rgba(180, 83, 9, 0.4) 95%, transparent 100%)",
          boxShadow: isRecording
            ? "0 0 50px 10px rgba(239, 68, 68, 0.6), 0 0 90px 30px rgba(245, 158, 11, 0.35)"
            : "0 0 55px 12px rgba(245, 158, 11, 0.65), 0 0 100px 35px rgba(251, 191, 36, 0.4)",
        }}
        animate={{
          scale: isRecording
            ? [1, 1.14, 0.97, 1.08, 1]
            : isSpeaking
            ? [1, 1.09, 0.98, 1.06, 1]
            : isListening
            ? [1, 1.04, 0.99, 1.03, 1]
            : [1, 1.02, 1],
        }}
        transition={{
          duration: isRecording ? 1.6 : isSpeaking ? 2.4 : 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* SVG z organicznym płomieniem i filtrem turbulencji */}
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
                scale="12"
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
            className={`absolute rounded-full pointer-events-none ${
              isRecording ? "bg-white shadow-[0_0_6px_#EF4444]" : "bg-amber-100 shadow-[0_0_8px_#FBBF24]"
            }`}
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
