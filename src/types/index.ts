export type MoodType =
  | "peaceful"
  | "anxious"
  | "exhausted"
  | "hopeful"
  | "sad"
  | "overwhelmed"
  | "grateful"
  | "celebration"
  | "deep_listening"
  | "grounding"
  | "supportive";

export interface PersonInLife {
  id: string;
  userId?: string;
  name: string;
  relation: string;
  sentiment: "supportive" | "neutral" | "complicated" | "stressful";
  notes: string;
  lastMentioned: string;
}

export interface LifeMemoryFact {
  id: string;
  userId?: string;
  category: "core_value" | "vulnerability" | "goal" | "struggle" | "routine" | "spark_of_joy" | "relationship";
  title: string;
  detail: string;
  confidence: number;
  extractedAt: string;
}

export interface OvercomeCrisis {
  id: string;
  userId?: string;
  title: string;
  date: string;
  whatHappened: string;
  howYouSurvived: string;
  strengthDemonstrated: string;
}

export interface VictoryLetter {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: string;
  audioUrl?: string;
}

export interface MessageVoiceMeta {
  durationSeconds: number;
  waveform: number[];
  audioUrl?: string;
  synthesized?: boolean;
}

export interface Message {
  id: string;
  userId?: string;
  sender: "user" | "companion";
  text: string;
  timestamp?: string;
  createdAt?: string;
  type?: "text" | "voice" | "proactive_checkin" | "sos_anchor" | "victory_celebration";
  messageType?: "text" | "voice" | "proactive_checkin" | "sos_anchor" | "victory_celebration";
  voiceMeta?: MessageVoiceMeta;
  moodContext?: MoodType;
  suggestedActions?: { label: string; action: string }[];
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  companionName: string;
  companionGender: "female" | "male" | "neutral";
  companionVoice: string; // "nova" (Agata) | "shimmer" (Paula) | "echo" (Maciej) | "onyx" (Paweł)
  preferredTone: "warm_gentle" | "calm_grounding" | "deep_philosophical" | "uplifting_coach";
  daysTogether: number;
  currentMood: MoodType;
  dailyStreak: number;
  lastActive?: string;
  subscriptionActive: boolean;
  proactiveRemindersEnabled?: boolean;
  peopleInLife: PersonInLife[];
  memories: LifeMemoryFact[];
  overcomeCrises: OvercomeCrisis[];
  victoryLetters: VictoryLetter[];
}

export type SoundscapeType = "fireplace" | "rain" | "ocean" | "alpha_waves" | "forest";

export interface ExtractedPersonData {
  name: string;
  relation?: string;
  sentiment?: "supportive" | "neutral" | "complicated" | "stressful";
  notes?: string;
}

export interface ExtractedMemoryFactData {
  title: string;
  detail?: string;
  category?: "core_value" | "vulnerability" | "goal" | "struggle" | "routine" | "spark_of_joy" | "relationship";
}

export interface ExtractedCrisisData {
  title: string;
  whatHappened?: string;
  howYouSurvived?: string;
  strengthDemonstrated?: string;
}

export interface ExtractedMemoryPayload {
  person?: ExtractedPersonData | null;
  memoryFact?: ExtractedMemoryFactData | null;
  overcomeCrisis?: ExtractedCrisisData | null;
}

export interface ChatApiRequest {
  message: string;
  profile?: Partial<UserProfile>;
  history?: Message[];
  accessCode?: string;
}

export interface ChatApiResponse {
  reply: string;
  moodContext: MoodType;
  companionNameUpdate?: string | null;
  userNameUpdate?: string | null;
  extractedMemory?: ExtractedMemoryPayload | null;
  error?: string;
  details?: string;
}

