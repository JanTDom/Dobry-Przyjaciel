"use client";

import React from "react";
import { Message, UserProfile } from "@/types";
import { VoiceMessageBubble } from "./VoiceMessageBubble";
import { PhoneCall } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 quiet-surface rounded-surface border border-ink/8 my-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-paper-dark flex items-center justify-center text-warm-amber mb-4">
          <PhoneCall size={20} strokeWidth={1.75} />
        </div>
        <h3 className="font-serif text-2xl text-ink mb-2">
          Twoja bezpieczna przestrzeń
        </h3>
        <p className="font-sans text-xs text-ink-muted leading-relaxed mb-6 max-w-sm">
          Nie musisz być dzisiaj silny. Możesz po prostu porozmawiać ze mną głosem lub napisać to, co leży Ci na sercu.
        </p>
        <button
          onClick={onOpenLiveCall}
          className="presence-btn-primary font-sans font-medium text-xs px-6 py-3 rounded-full flex items-center gap-2 shadow-quiet-sm"
        >
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
