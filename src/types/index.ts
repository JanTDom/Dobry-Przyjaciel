export type MoodType = 'peaceful' | 'anxious' | 'exhausted' | 'hopeful' | 'sad' | 'overwhelmed' | 'grateful';

export interface PersonInLife {
  id: string;
  name: string;
  relation: string; // e.g. 'Mama', 'Szef (Marek)', 'Partner (Kasia)', 'Przyjaciel z dzieciństwa'
  sentiment: 'supportive' | 'neutral' | 'complicated' | 'stressful';
  notes: string;
  lastMentioned: string;
}

export interface LifeMemoryFact {
  id: string;
  category: 'core_value' | 'vulnerability' | 'goal' | 'struggle' | 'routine' | 'spark_of_joy';
  title: string;
  detail: string;
  confidence: number;
  extractedAt: string;
}

export interface OvercomeCrisis {
  id: string;
  title: string;
  date: string;
  whatHappened: string;
  howYouSurvived: string;
  strengthDemonstrated: string;
}

export interface MessageVoiceMeta {
  durationSeconds: number;
  waveform: number[];
  audioUrl?: string;
  synthesized?: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
  type: 'text' | 'voice' | 'proactive_checkin' | 'sos_anchor' | 'victory_celebration';
  voiceMeta?: MessageVoiceMeta;
  moodContext?: MoodType;
  suggestedActions?: { label: string; action: string }[];
}

export interface UserProfile {
  name: string;
  companionName: string;
  preferredTone: 'warm_gentle' | 'calm_grounding' | 'deep_philosophical' | 'uplifting_coach';
  daysTogether: number;
  currentMood: MoodType;
  dailyStreak: number;
  lastActive: string;
  subscriptionActive: boolean;
  proactiveRemindersEnabled: boolean;
  peopleInLife: PersonInLife[];
  memories: LifeMemoryFact[];
  overcomeCrises: OvercomeCrisis[];
  victoryLetters: {
    id: string;
    title: string;
    content: string;
    date: string;
    tag: string;
  }[];
}

export type AmbientSoundType = 'none' | 'rain' | 'ocean' | 'alpha_drone' | 'night_forest';
