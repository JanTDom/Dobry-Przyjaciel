"use client";

import React, { useState } from "react";
import { Mic, Send, PhoneCall, Sparkles } from "lucide-react";

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
        className="sanctuary-card rounded-2xl p-2.5 flex items-center gap-2 border border-sanctuary-700/60 shadow-2xl focus-within:border-hearth-500/50 transition-all"
      >
        {/* Przycisk natychmiastowej rozmowy na żywo */}
        <button
          type="button"
          onClick={onOpenLiveCall}
          className="hearth-button flex items-center gap-2 text-sanctuary-950 font-sans font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all select-none"
          title="Uruchom pełnoekranową rozmowę głosową na żywo"
        >
          <PhoneCall size={15} className="animate-pulse" />
          <span className="hidden sm:inline">Rozmawiaj na żywo</span>
          <span className="sm:hidden">Głos</span>
        </button>

        {/* Pole wpisywania wiadomości */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Napisz do mnie lub zadaj pytanie..."
          className="flex-1 bg-transparent px-3 py-2 text-sm font-serif text-sanctuary-100 placeholder:text-sanctuary-500 focus:outline-none"
        />

        {/* Przycisk wysłania */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-sanctuary-800 hover:bg-sanctuary-700 text-hearth-300 disabled:opacity-30 disabled:hover:bg-sanctuary-800 transition-all"
          title="Wyślij wiadomość"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
