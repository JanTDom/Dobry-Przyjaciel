"use client";

import React, { useState, useEffect } from "react";
import { LivingPresenceOrb } from "@/components/presence/LivingPresenceOrb";
import { AmbientSoundscape } from "@/components/presence/AmbientSoundscape";
import { ConversationView } from "@/components/conversation/ConversationView";
import { LiveVoiceBar } from "@/components/conversation/LiveVoiceBar";
import { SubscriptionModal } from "@/components/pricing/SubscriptionModal";
import {
  getStoredProfile,
  getStoredMessages,
  saveStoredMessages,
  saveStoredProfile
} from "@/lib/storage";
import { generateCompanionResponse } from "@/lib/companion-personality";
import { voiceEngine } from "@/lib/voice-engine";
import { Message, UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import { Sparkles, Heart, Shield, RefreshCw } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    const loadedProfile = getStoredProfile();
    const loadedMsgs = getStoredMessages();
    setProfile(loadedProfile);
    setMessages(loadedMsgs);

    voiceEngine?.registerStateListener((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  const handleSendMessage = (text: string, isVoice: boolean) => {
    const now = new Date();
    const timeStr = `Dzisiaj, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const userMessage: Message = {
      id: `msg-u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: timeStr,
      type: isVoice ? "voice" : "text",
      voiceMeta: isVoice
        ? {
            durationSeconds: Math.max(3, Math.min(15, Math.round(text.length / 10))),
            waveform: [25, 45, 70, 85, 90, 75, 60, 40, 30, 50, 70, 55, 30]
          }
        : undefined
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    saveStoredMessages(updated);

    // Generate Companion response
    setTimeout(() => {
      const responseResult = generateCompanionResponse(text, profile, updated);
      const companionTime = `Dzisiaj, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const companionMessage: Message = {
        id: `msg-c-${Date.now()}`,
        sender: "companion",
        text: responseResult.text,
        timestamp: companionTime,
        type: "voice",
        voiceMeta: {
          durationSeconds: responseResult.voiceDurationSec,
          waveform: responseResult.waveform,
          synthesized: true
        },
        moodContext: responseResult.moodContext,
        suggestedActions: responseResult.suggestedActions
      };

      const finalMsgs = [...updated, companionMessage];
      setMessages(finalMsgs);
      saveStoredMessages(finalMsgs);

      // Speak response automatically
      voiceEngine?.speak(responseResult.text);

      // If facts were extracted, update profile memories
      if (responseResult.extractedFacts?.memory) {
        const newMemory = {
          id: `m-${Date.now()}`,
          category: responseResult.extractedFacts.memory.category,
          title: responseResult.extractedFacts.memory.title,
          detail: responseResult.extractedFacts.memory.detail,
          confidence: 0.95,
          extractedAt: new Date().toISOString().split("T")[0]
        };
        const updatedProfile = {
          ...profile,
          currentMood: responseResult.moodContext,
          memories: [newMemory, ...profile.memories]
        };
        setProfile(updatedProfile);
        saveStoredProfile(updatedProfile);
      }
    }, 650);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "open_sos":
      case "open_grounding":
        router.push("/sos");
        break;
      case "open_sanctuary":
        router.push("/sanctuary");
        break;
      case "send_better":
        handleSendMessage("Dziś jest odrobinę lepiej, dziękuję że pytasz.", false);
        break;
      case "send_tired":
        handleSendMessage("Czuję ogromne wyczerpanie i brak sił na cokolwiek.", false);
        break;
      case "listen_mode":
        voiceEngine?.speak("Jestem tutaj. Po prostu zamknij na chwilę oczy i pooddychajmy razem.");
        break;
      case "record_voice":
        // triggers user prompt to speak
        break;
      default:
        handleSendMessage(action.replace(/_/g, " "), false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-4">
      {/* Top Ambient Soundscape Controls */}
      <AmbientSoundscape />

      {/* Main Split Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 items-stretch">
        {/* Left Column: Living Presence Orb & Anchor Status */}
        <div className="lg:col-span-5 bg-surface-200/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          {/* Top Info pill */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Obecność Żywa
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              Dzień {profile.daysTogether} razem
            </span>
          </div>

          {/* Living Orb Centerpiece */}
          <div className="my-auto flex flex-col items-center justify-center py-4">
            <LivingPresenceOrb
              isSpeaking={isSpeaking}
              mood={profile.currentMood}
              onClick={() => {
                if (!isSpeaking) {
                  voiceEngine?.speak("Jestem z Tobą. Słucham każdego Twojego słowa.");
                }
              }}
            />
            <p className="text-center text-xs text-slate-400 max-w-xs mt-6 leading-relaxed">
              Dotknij obecności lub nagraj wiadomość poniżej. Twoja przestrzeń spokoju i regeneracji.
            </p>
          </div>

          {/* Quick Grounding Status */}
          <div className="w-full grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
            <button
              onClick={() => router.push("/sos")}
              className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 flex flex-col items-center gap-1 text-xs font-medium transition-all"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Oddech & SOS</span>
            </button>

            <button
              onClick={() => router.push("/memory")}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 flex flex-col items-center gap-1 text-xs font-medium transition-all"
            >
              <Heart className="w-4 h-4 text-amber-400" />
              <span>Twoja Kronika</span>
            </button>
          </div>
        </div>

        {/* Right Column: Intimate Conversation Feed & Voice Input */}
        <div className="lg:col-span-7 bg-surface-200/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl min-h-[500px]">
          <ConversationView
            messages={messages}
            profile={profile}
            onActionClick={handleActionClick}
          />

          <div className="pt-3 border-t border-white/10">
            <LiveVoiceBar
              onSendMessage={handleSendMessage}
              onOpenSos={() => router.push("/sos")}
              onOpenSanctuary={() => router.push("/sanctuary")}
            />
          </div>
        </div>
      </div>

      <SubscriptionModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
}
