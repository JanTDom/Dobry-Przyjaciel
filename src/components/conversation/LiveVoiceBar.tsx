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
        className="bg-paper-surface/95 backdrop-blur-xl rounded-full p-2 pl-3 flex items-center gap-2 border border-ink/10 shadow-quiet-lg focus-within:border-warm-amber/60 focus-within:ring-1 focus-within:ring-warm-amber/30 transition-all"
      >
        {/* Przycisk natychmiastowej rozmowy na żywo */}
        <button
          type="button"
          onClick={onOpenLiveCall}
          className="presence-btn-primary flex items-center gap-2 font-sans font-medium text-xs px-4 py-2.5 rounded-full transition-all select-none shadow-quiet-sm"
          title="Uruchom pełnoekranową rozmowę głosową na żywo"
        >
          <PhoneCall size={13} strokeWidth={1.75} className="animate-pulse" />
          <span className="hidden sm:inline">Rozmawiaj na żywo</span>
          <span className="sm:hidden">Głos</span>
        </button>

        {/* Pole wpisywania wiadomości */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Napisz do mnie..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-sans text-ink placeholder:text-ink-subtle focus:outline-none"
        />

        {/* Przycisk wysłania */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-full bg-paper-dark hover:bg-warm-amber/10 text-ink-muted hover:text-warm-amber disabled:opacity-30 transition-all mr-1"
          title="Wyślij wiadomość"
        >
          <Send size={14} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
};
