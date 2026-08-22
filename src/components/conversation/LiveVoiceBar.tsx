"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, HeartHandshake, Sparkles, MessageSquare, ShieldAlert } from "lucide-react";

interface LiveVoiceBarProps {
  onSendMessage: (text: string, isVoice: boolean) => void;
  onOpenSos: () => void;
  onOpenSanctuary: () => void;
  disabled?: boolean;
}

export const LiveVoiceBar: React.FC<LiveVoiceBarProps> = ({
  onSendMessage,
  onOpenSos,
  onOpenSanctuary,
  disabled = false
}) => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "pl-PL";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } else {
      // Fallback if browser SpeechRecognition not allowed
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (inputText.trim()) {
      onSendMessage(inputText.trim(), true);
      setInputText("");
    } else {
      onSendMessage("Nagrana notatka głosowa (podzieliłem się swoimi myślami)", true);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSendMessage(inputText.trim(), false);
    setInputText("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2.5">
      {/* Quick Access Emotional Anchors */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all font-medium active:scale-95 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Strefa Uziemienia (SOS)</span>
          </button>

          <button
            onClick={onOpenSanctuary}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Skarbiec Zwycięstw</span>
          </button>
        </div>

        <span className="hidden sm:inline text-slate-400 text-[11px]">
          Rozmawiaj głosem lub pisz swobodnie
        </span>
      </div>

      {/* Input Bar Main Box */}
      <div className="relative bg-surface-100/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 px-3 shadow-2xl flex items-center gap-2 transition-all focus-within:border-amber-500/50">
        {/* Voice Record Action */}
        <button
          type="button"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
            isRecording
              ? "bg-rose-500 text-white animate-pulse shadow-rose-500/40"
              : "bg-surface-50 text-warm-300 hover:bg-amber-500/20 hover:text-amber-300 border border-white/5"
          }`}
          title={isRecording ? "Zatrzymaj i wyślij nagranie" : "Nagraj wiadomość głosową"}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-sm font-medium text-rose-300">
                Nagrywanie notatki ({recordingSeconds}s)...
              </span>
            </div>
            <span className="text-xs text-slate-400">Kliknij mikrofon, aby zakończyć</span>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Napisz do Miry lub nagraj głos... (np. jak się dziś czujesz?)"
              className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-sm px-2 py-1"
              disabled={disabled}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className={`p-2.5 rounded-xl transition-all ${
                inputText.trim()
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md active:scale-95"
                  : "bg-surface-50 text-slate-600 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
