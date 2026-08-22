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
      const text = await voiceEngine.stopRecordingAndTranscribe();
      if (text) {
        onSendMessage(text, true);
      }
    } else {
      const started = await voiceEngine.startRecording();
      if (started) {
        setIsRecording(true);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-paper-surface/95 backdrop-blur-xl rounded-full p-2 pl-3 flex items-center gap-2 border border-warm-amber/20 shadow-quiet-lg focus-within:border-warm-amber focus-within:ring-1 focus-within:ring-warm-amber/30 transition-all"
      >
        {/* Przycisk natychmiastowej rozmowy na żywo */}
        <button
          type="button"
          onClick={onOpenLiveCall}
          className="presence-btn-primary flex items-center gap-2 font-sans font-medium text-xs px-4 py-2.5 rounded-full transition-all select-none shadow-quiet-sm flex-shrink-0"
          title="Uruchom pełnoekranową rozmowę głosową na żywo"
        >
          <PhoneCall size={13} strokeWidth={1.75} className="animate-pulse text-warm-honey" />
          <span className="hidden sm:inline">Rozmawiaj na żywo</span>
          <span className="sm:hidden">Głos</span>
        </button>

        {/* Pole wpisywania wiadomości */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRecording ? "Nagrywam... Dotknij mikrofon, by wysłać" : "Napisz do mnie lub nagraj głos..."}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-sans text-ink placeholder:text-ink-subtle focus:outline-none"
        />

        {/* Przycisk bezpośredniego nagrywania głosu na stronie głównej */}
        <button
          type="button"
          onClick={handleToggleVoiceRecord}
          className={`p-2.5 rounded-full transition-all ${
            isRecording
              ? "bg-red-700 text-white animate-pulse"
              : "bg-paper-dark hover:bg-warm-amber/15 text-warm-amber"
          }`}
          title={isRecording ? "Wyślij nagranie" : "Nagraj szybką wiadomość głosową"}
        >
          {isRecording ? <Radio size={14} className="animate-spin" /> : <Mic size={14} strokeWidth={1.75} />}
        </button>

        {/* Przycisk wysłania tekstu */}
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
