"use client";

import React, { useState } from "react";
import { Send, PhoneCall } from "lucide-react";

interface LiveVoiceBarProps {
  onSendMessage: (text: string, isVoice?: boolean) => void;
  onOpenLiveCall: () => void;
  isCompanionSpeaking?: boolean;
}

export const LiveVoiceBar: React.FC<LiveVoiceBarProps> = ({
  onSendMessage,
  onOpenLiveCall,
  isCompanionSpeaking = false,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-xl rounded-full p-2 pl-3 flex items-center gap-2 border border-cream-300 shadow-warm-lg focus-within:border-sun-400 focus-within:ring-2 focus-within:ring-sun-400/20 transition-all"
      >
        {/* Przycisk natychmiastowej rozmowy na żywo */}
        <button
          type="button"
          onClick={onOpenLiveCall}
          className="hearth-button flex items-center gap-2 font-sans font-medium text-xs px-4 py-2.5 rounded-full transition-all select-none shadow-md shadow-sun-500/25"
          title="Uruchom pełnoekranową rozmowę głosową na żywo"
        >
          <PhoneCall size={14} className="animate-pulse" />
          <span className="hidden sm:inline">Rozmawiaj na żywo</span>
          <span className="sm:hidden">Głos</span>
        </button>

        {/* Pole wpisywania wiadomości */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Napisz do mnie lub zadaj pytanie..."
          className="flex-1 bg-transparent px-3 py-2 text-sm font-serif text-cream-950 placeholder:text-cream-500 focus:outline-none"
        />

        {/* Przycisk wysłania */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-full bg-cream-100 hover:bg-sun-100 text-sun-700 disabled:opacity-30 disabled:hover:bg-cream-100 transition-all mr-1"
          title="Wyślij wiadomość"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
