"use client";

import React, { useState } from "react";
import { Send, PhoneCall, Mic, Radio } from "lucide-react";
import { voiceEngine } from "@/lib/voice-engine";

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
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText("");
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      const text = await voiceEngine.stopManualRecordingAndTranscribe();
      if (text) {
        onSendMessage(text, true);
      }
    } else {
      const started = await voiceEngine.startManualRecording();
      if (started) {
        setIsRecording(true);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-paper-surface/95 backdrop-blur-xl rounded-full p-2 pl-3 flex items-center gap-2 border border-warm-amber/25 shadow-quiet-lg focus-within:border-warm-amber focus-within:ring-1 focus-within:ring-warm-amber/30 transition-all"
      >
        {/* Przycisk natychmiastowej rozmowy na żywo */}
        <button
          type="button"
          onClick={onOpenLiveCall}
          aria-label="Uruchom pełnoekranową rozmowę głosową na żywo"
          className="presence-btn-primary flex items-center gap-2 font-sans font-medium text-xs px-4 py-2.5 min-h-[44px] rounded-full transition-all select-none shadow-quiet-sm flex-shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
          title="Uruchom pełnoekranową rozmowę głosową na żywo"
        >
          <PhoneCall size={14} strokeWidth={1.75} className="animate-pulse text-warm-honey" />
          <span className="hidden sm:inline">Rozmawiaj na żywo</span>
          <span className="sm:hidden">Głos</span>
        </button>

        {/* Pole wpisywania wiadomości (text-base prevents iOS Safari zoom on focus) */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="Wiadomość do Przyjaciela"
          placeholder={isRecording ? "Nagrywam... Dotknij mikrofon, by wysłać" : "Napisz do mnie lub nagraj głos..."}
          className="flex-1 bg-transparent px-3 py-2 text-base sm:text-sm font-sans text-ink placeholder:text-ink-subtle focus:outline-none"
        />

        {/* Przycisk bezpośredniego nagrywania głosu na stronie głównej */}
        <button
          type="button"
          onClick={handleToggleVoiceRecord}
          aria-label={isRecording ? "Zakończ i wyślij nagranie głosowe" : "Nagraj wiadomość głosową"}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60 ${
            isRecording
              ? "bg-red-700 text-white animate-pulse shadow-quiet-sm"
              : "bg-paper-dark hover:bg-warm-amber/15 text-warm-amber border border-warm-amber/20"
          }`}
          title={isRecording ? "Wyślij nagranie" : "Nagraj szybką wiadomość głosową"}
        >
          {isRecording ? <Radio size={16} className="animate-spin" /> : <Mic size={16} strokeWidth={1.75} />}
        </button>

        {/* Przycisk wysłania tekstu */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          aria-label="Wyślij wiadomość tekstową"
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-paper-dark hover:bg-warm-amber/10 text-ink-muted hover:text-warm-amber disabled:opacity-30 transition-all mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber/60"
          title="Wyślij wiadomość"
        >
          <Send size={15} strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
};
