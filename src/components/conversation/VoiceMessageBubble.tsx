"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Message } from "@/types";
import { voiceEngine } from "@/lib/voice-engine";

interface VoiceMessageBubbleProps {
  message: Message;
  companionName?: string;
  onActionClick?: (action: string) => void;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  message,
  companionName = "Mira",
  onActionClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const isCompanion = message.sender === "companion";
  const hasVoice = Boolean(message.voiceMeta);
  const duration = message.voiceMeta?.durationSeconds || 8;
  const waveform = message.voiceMeta?.waveform || [20, 40, 65, 85, 70, 50, 40, 60, 80, 50, 30];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const step = 100 / (duration * 10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + step;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      voiceEngine?.stop();
      setIsPlaying(false);
      setProgress(0);
    } else {
      setIsPlaying(true);
      setProgress(0);
      if (isCompanion) {
        voiceEngine?.speak(message.text, () => {
          setIsPlaying(false);
          setProgress(0);
        });
      }
    }
  };

  return (
    <div
      className={`flex flex-col mb-4 max-w-2xl transition-all duration-300 ${
        isCompanion ? "self-start mr-auto" : "self-end ml-auto"
      }`}
    >
      {/* Sender Header */}
      <div className={`flex items-center gap-2 mb-1.5 px-1 text-xs ${isCompanion ? "text-warm-300" : "text-slate-400 justify-end"}`}>
        <span className="font-semibold tracking-wide flex items-center gap-1">
          {isCompanion && <Sparkles className="w-3 h-3 text-amber-400" />}
          {isCompanion ? companionName : "Ty"}
        </span>
        <span className="text-[11px] opacity-60">{message.timestamp}</span>
      </div>

      {/* Bubble Container */}
      <div
        className={`relative rounded-2xl p-4 shadow-xl border backdrop-blur-xl transition-all ${
          isCompanion
            ? "bg-surface-100/90 border-white/10 text-slate-100 rounded-tl-sm hover:border-amber-500/30"
            : "bg-amber-600/90 text-amber-50 border-amber-400/30 rounded-tr-sm self-end"
        }`}
      >
        {/* Voice player bar (if voice note) */}
        {hasVoice && (
          <div className="mb-3 pb-3 border-b border-white/10 flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md ${
                isCompanion
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-white text-amber-800 hover:bg-amber-100"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Audio Waveform visualization */}
            <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-surface-300/40 rounded-xl">
              {waveform.map((height, idx) => {
                const barPercent = (idx / waveform.length) * 100;
                const isPlayed = progress >= barPercent;
                return (
                  <div
                    key={idx}
                    style={{ height: `${Math.max(15, height)}%` }}
                    className={`flex-1 rounded-full transition-all duration-150 ${
                      isPlayed
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        : "bg-white/20"
                    }`}
                  />
                );
              })}
            </div>

            <div className="text-[11px] font-mono opacity-70 whitespace-nowrap flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span>{Math.round(duration)}s</span>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="text-[14px] leading-relaxed tracking-normal font-normal text-slate-200">
          {message.text}
        </div>

        {/* Action pills / Quick responses */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap gap-2">
            {message.suggestedActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick && onActionClick(action.action)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
