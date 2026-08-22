"use client";

import React from "react";
import { Message, UserProfile } from "@/types";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { Flame, Sparkles } from "lucide-react";

interface ConversationViewProps {
  messages: Message[];
  profile: UserProfile;
  onOpenLiveCall: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  profile,
  onOpenLiveCall,
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 sanctuary-card rounded-3xl border border-sanctuary-800/80 my-4 max-w-lg mx-auto">
        <div className="h-12 w-12 rounded-full bg-hearth-500/10 flex items-center justify-center text-hearth-400 mb-4 border border-hearth-500/20">
          <Flame size={24} />
        </div>
        <h3 className="font-serif text-xl text-sanctuary-100 mb-2">
          Twoja przestrzeń spokoju i rozmowy
        </h3>
        <p className="font-sans text-xs text-sanctuary-400 leading-relaxed mb-6 max-w-sm">
          Nie musisz być dzisiaj silny. Możesz po prostu ze mną porozmawiać głosem lub napisać to, co leży ci na sercu.
        </p>
        <button
          onClick={onOpenLiveCall}
          className="hearth-button text-sanctuary-950 font-sans font-medium text-xs px-6 py-3 rounded-full flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>Rozpocznij rozmowę na żywo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-3 max-w-2xl mx-auto w-full px-1">
      {messages.map((msg) => (
        <VoiceMessageBubble
          key={msg.id}
          message={msg}
          companionName={profile.companionName}
        />
      ))}
    </div>
  );
};
