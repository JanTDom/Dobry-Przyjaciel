"use client";

import React, { useState } from "react";
import { Play, Pause } from "lucide-react";
import { Message } from "@/types";
import { voiceEngine } from "@/lib/voice-engine";

interface VoiceMessageBubbleProps {
  message: Message;
  companionName?: string;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  message,
  companionName = "Agata",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isCompanion = message.sender === "companion";

  const handlePlayVoice = () => {
    if (isPlaying) {
      voiceEngine.stopSpeaking();
      setIsPlaying(false);
    } else {
      voiceEngine.unlock();
      setIsPlaying(true);
      voiceEngine.speak(
        message.text,
        () => {
          setIsPlaying(false);
        },
        "nova",
        true
      );
    }
  };

  const timeString = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : message.timestamp || "Teraz";

  return (
    <div
      className={`flex flex-col gap-1 max-w-xl w-full ${
        isCompanion ? "items-start" : "items-end ml-auto"
      }`}
    >
      {/* Informacja o nadawcy */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-sans text-ink-muted font-medium">
          {isCompanion ? companionName : "Ty"}
        </span>
        <span className="text-[10px] text-ink-subtle font-sans">
          {timeString}
        </span>
      </div>

      {/* Ciało wiadomości */}
      <div
        className={`p-4 md:p-5 rounded-2xl relative transition-all shadow-quiet-sm ${
          isCompanion
            ? "bg-paper-surface border border-ink/10 text-ink rounded-tl-none"
            : "bg-paper-dark border border-ink/8 text-ink rounded-tr-none"
        }`}
      >
        <p className="font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-ink">
          {message.text}
        </p>

        {/* Odtwarzacz głosu przyjaciela */}
        {isCompanion && (
          <div className="mt-3 pt-3 border-t border-ink/8 flex items-center justify-between gap-3">
            <button
              onClick={handlePlayVoice}
              className="presence-btn-secondary flex items-center gap-1.5 text-xs font-sans px-3 py-1 rounded-full font-medium"
            >
              {isPlaying ? (
                <>
                  <Pause size={12} className="animate-pulse text-warm-amber" />
                  <span>Zatrzymaj</span>
                </>
              ) : (
                <>
                  <Play size={12} className="text-warm-amber" />
                  <span>Odsłuchaj</span>
                </>
              )}
            </button>

            {/* Wizualizacja fali dźwiękowej */}
            <div className="flex items-center gap-1">
              {[4, 10, 7, 14, 9, 5, 12, 7].map((h, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-warm-amber animate-pulse"
                      : "bg-ink/20"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(4, h * (i % 2 === 0 ? 1.3 : 0.8))}px` : "5px",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
