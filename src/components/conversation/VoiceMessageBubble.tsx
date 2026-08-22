"use client";

import React, { useState } from "react";
import { Play, Pause, Sun, Sparkles } from "lucide-react";
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
      className={`flex flex-col gap-1.5 max-w-xl w-full ${
        isCompanion ? "items-start" : "items-end ml-auto"
      }`}
    >
      {/* Informacja o nadawcy */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-sans text-cream-600 font-medium">
          {isCompanion ? companionName : "Ty"}
        </span>
        <span className="text-[10px] text-cream-500 font-sans">
          {timeString}
        </span>
      </div>

      {/* Ciało wiadomości */}
      <div
        className={`p-4 md:p-5 rounded-3xl relative transition-all shadow-warm-sm ${
          isCompanion
            ? "bg-white border border-amber-200/90 text-cream-900 rounded-tl-sm"
            : "bg-gradient-to-br from-sun-100 to-amber-100 border border-sun-200 text-cream-950 rounded-tr-sm"
        }`}
      >
        <p className="font-serif text-base leading-relaxed whitespace-pre-wrap text-cream-900">
          {message.text}
        </p>

        {/* Odtwarzacz głosu przyjaciela */}
        {isCompanion && (
          <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between gap-3">
            <button
              onClick={handlePlayVoice}
              className="flex items-center gap-2 text-xs font-sans text-sun-900 bg-sun-100 hover:bg-sun-200 px-3.5 py-1.5 rounded-full border border-sun-300 transition-all font-medium"
            >
              {isPlaying ? (
                <>
                  <Pause size={13} className="animate-pulse text-sun-600" />
                  <span>Zatrzymaj głos</span>
                </>
              ) : (
                <>
                  <Play size={13} className="text-sun-600" />
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
                      ? "bg-sun-500 animate-pulse"
                      : "bg-cream-300"
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
