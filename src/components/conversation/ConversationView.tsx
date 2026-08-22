"use client";

import React, { useRef, useEffect } from "react";
import { Message, UserProfile } from "@/types";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { Sparkles, Compass } from "lucide-react";

interface ConversationViewProps {
  messages: Message[];
  profile: UserProfile;
  onActionClick: (action: string) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  profile,
  onActionClick
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full flex-1 overflow-y-auto px-2 sm:px-4 py-4 flex flex-col space-y-2 custom-scrollbar">
      {/* Intimate Greeting Banner */}
      <div className="text-center my-4 py-3 px-4 rounded-2xl bg-surface-200/50 border border-white/5 max-w-md mx-auto backdrop-blur-md">
        <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>DobryPrzyjaciel.pl &bull; Dzień {profile.daysTogether}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Wszystko, co tu mówisz, zostaje między Wami. {profile.companionName} pamięta Twoją drogę i wspiera Cię w każdym kroku.
        </p>
      </div>

      {messages.map((msg) => (
        <VoiceMessageBubble
          key={msg.id}
          message={msg}
          companionName={profile.companionName}
          onActionClick={onActionClick}
        />
      ))}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
