"use client";

import React, { useState } from "react";
import { Play, Pause, Flame, Sparkles } from "lucide-react";
import { Message } from "@/types";
import { voiceEngine } from "@/lib/voice-engine";

interface VoiceMessageBubbleProps {
  message: Message;
  companionName?: string;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  message,
  companionName = "Mira",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isCompanion = message.sender === "companion";

  const handlePlayVoice = () => {
    if (isPlaying) {
      voiceEngine.stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      voiceEngine.speak(message.text, () => {
        setIsPlaying(false);
      });
    }
  };

  const timeString = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : message.timestamp || "Teraz";

  return (
    <div
      className={`flex flex-col gap-2 max-w-xl w-full ${
        isCompanion ? "items-start" : "items-end ml-auto"
      }`}
    >
      {/* Informacja o nadawcy */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-sans text-sanctuary-400 font-medium">
          {isCompanion ? companionName : "Ty"}
        </span>
        <span className="text-[10px] text-sanctuary-500 font-sans">
          {timeString}
        </span>
      </div>

      {/* Ciało wiadomości */}
      <div
        className={`p-4 md:p-5 rounded-2xl relative transition-all ${
          isCompanion
            ? "sanctuary-card border-sanctuary-700/60 text-sanctuary-100 rounded-tl-sm"
            : "bg-gradient-to-br from-hearth-800/60 to-hearth-900/80 border border-hearth-600/30 text-sanctuary-100 rounded-tr-sm"
        }`}
      >
        <p className="font-serif text-base leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {/* Odtwarzacz głosu przyjaciela */}
        {isCompanion && (
          <div className="mt-3 pt-3 border-t border-sanctuary-800/80 flex items-center justify-between gap-3">
            <button
              onClick={handlePlayVoice}
              className="flex items-center gap-2 text-xs font-sans text-hearth-300 hover:text-hearth-200 bg-hearth-500/10 hover:bg-hearth-500/20 px-3 py-1.5 rounded-full border border-hearth-500/30 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause size={13} className="animate-pulse text-hearth-400" />
                  <span>Zatrzymaj głos</span>
                </>
              ) : (
                <>
                  <Play size={13} className="text-hearth-400" />
                  <span>Odsłuchaj głosem</span>
                </>
              )}
            </button>

            {/* Wizualizacja fali dźwiękowej */}
            <div className="flex items-center gap-1">
              {[4, 12, 8, 16, 10, 6, 14, 8].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-hearth-400 animate-pulse"
                      : "bg-sanctuary-700"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(4, h * (i % 2 === 0 ? 1.4 : 0.8))}px` : "6px",
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
