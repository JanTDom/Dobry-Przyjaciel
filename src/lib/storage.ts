import { UserProfile, Message, PersonInLife, LifeMemoryFact, OvercomeCrisis } from "@/types";

const STORAGE_KEY_PROFILE = "przyjaciel_user_profile_clean_v4";
const STORAGE_KEY_MESSAGES = "przyjaciel_messages_clean_v4";
const STORAGE_KEY_ACCESS_CODE = "przyjaciel_access_code_v1";

export const VALID_ACCESS_CODE = "A132a132";

export const INITIAL_USER_PROFILE: UserProfile = {
  id: "user_primary",
  name: "Tobiasz",
  companionName: "Mira",
  companionGender: "female",
  companionVoice: "nova",
  preferredTone: "warm_gentle",
  daysTogether: 1,
  currentMood: "peaceful",
  dailyStreak: 1,
  subscriptionActive: true,
  peopleInLife: [],
  memories: [],
  overcomeCrises: [],
};

export const INITIAL_MESSAGES: Message[] = [];

export function getInitialSeedMessages(): Message[] {
  return [];
}

export function getStoredProfile(): UserProfile {
  if (typeof window === "undefined") return INITIAL_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
      return INITIAL_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_USER_PROFILE,
      ...parsed,
      peopleInLife: parsed.peopleInLife || [],
      memories: parsed.memories || [],
      overcomeCrises: parsed.overcomeCrises || [],
    };
  } catch {
    return INITIAL_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile", err);
  }
}

export function getStoredMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save messages", err);
  }
}

export function getStoredMemories(): LifeMemoryFact[] {
  const profile = getStoredProfile();
  return profile.memories || [];
}

export function getStoredPeople(): PersonInLife[] {
  const profile = getStoredProfile();
  return profile.peopleInLife || [];
}

export function getStoredCrises(): OvercomeCrisis[] {
  const profile = getStoredProfile();
  return profile.overcomeCrises || [];
}

export function isAccessGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const code = localStorage.getItem(STORAGE_KEY_ACCESS_CODE);
    return code === VALID_ACCESS_CODE;
  } catch {
    return false;
  }
}

export function getStoredAccessCode(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS_CODE) || "";
  } catch {
    return "";
  }
}

export function saveAccessCode(code: string): boolean {
  if (typeof window === "undefined") return false;
  if (code.trim() === VALID_ACCESS_CODE) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCESS_CODE, VALID_ACCESS_CODE);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
