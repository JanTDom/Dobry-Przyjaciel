import { UserProfile, Message, PersonInLife, LifeMemoryFact, OvercomeCrisis, VictoryLetter } from "@/types";

const STORAGE_KEY_AUTH_EMAIL = "przyjaciel_auth_email_v5";
const STORAGE_KEY_PROFILES = "przyjaciel_all_profiles_v5";
const STORAGE_KEY_MESSAGES_PREFIX = "przyjaciel_msgs_v5_";
const STORAGE_KEY_ACCESS_CODE = "przyjaciel_access_code_v1";

export const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];

export function isAccessGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const code = localStorage.getItem(STORAGE_KEY_ACCESS_CODE);
    return Boolean(code && VALID_ACCESS_CODES.includes(code.trim()));
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
  const clean = code.trim();
  if (VALID_ACCESS_CODES.includes(clean)) {
    try {
      localStorage.setItem(STORAGE_KEY_ACCESS_CODE, clean);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function getActiveUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY_AUTH_EMAIL);
  } catch {
    return null;
  }
}

export function setActiveUserEmail(email: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (email) {
      localStorage.setItem(STORAGE_KEY_AUTH_EMAIL, email.trim().toLowerCase());
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_EMAIL);
    }
  } catch (e) {
    console.error("Failed to set active email", e);
  }
}

export function isUserLoggedIn(): boolean {
  return Boolean(getActiveUserEmail() && isAccessGranted());
}

export function createDefaultProfile(name: string = "", companionName: string = "Agata", companionGender: "female" | "male" = "female", email?: string): UserProfile {
  return {
    id: email ? "user_" + btoa(email).replace(/=/g, "").slice(0, 12) : "user_" + Date.now(),
    email: email ? email.toLowerCase() : undefined,
    name: name.trim() || "Przyjaciel",
    companionName: companionName.trim() || (companionGender === "male" ? "Maciej" : "Agata"),
    companionGender,
    companionVoice: companionGender === "male" ? "echo" : "nova",
    preferredTone: "warm_gentle",
    daysTogether: 1,
    currentMood: "peaceful",
    dailyStreak: 1,
    subscriptionActive: true,
    peopleInLife: [],
    memories: [],
    overcomeCrises: [],
    victoryLetters: [],
  };
}

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const email = getActiveUserEmail();
    if (!email) return null;

    const allRaw = localStorage.getItem(STORAGE_KEY_PROFILES);
    const profiles: Record<string, UserProfile> = allRaw ? JSON.parse(allRaw) : {};
    
    if (profiles[email]) {
      return {
        ...createDefaultProfile("", "Agata", "female", email),
        ...profiles[email],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const email = profile.email || getActiveUserEmail() || "default@dobryprzyjaciel.pl";
    const allRaw = localStorage.getItem(STORAGE_KEY_PROFILES);
    const profiles: Record<string, UserProfile> = allRaw ? JSON.parse(allRaw) : {};
    
    profiles[email] = {
      ...profile,
      email,
    };
    
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    localStorage.setItem(STORAGE_KEY_AUTH_EMAIL, email);
  } catch (err) {
    console.error("Failed to save profile", err);
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_EMAIL);
  } catch (err) {
    console.error("Failed to logout", err);
  }
}

export function getStoredMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const email = getActiveUserEmail();
    if (!email) return [];
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES_PREFIX + email);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    const email = getActiveUserEmail();
    if (!email) return;
    localStorage.setItem(STORAGE_KEY_MESSAGES_PREFIX + email, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save messages", err);
  }
}

export function getStoredMemories(): LifeMemoryFact[] {
  const profile = getStoredProfile();
  return profile ? profile.memories || [] : [];
}

export function getStoredPeople(): PersonInLife[] {
  const profile = getStoredProfile();
  return profile ? profile.peopleInLife || [] : [];
}

export function getStoredCrises(): OvercomeCrisis[] {
  const profile = getStoredProfile();
  return profile ? profile.overcomeCrises || [] : [];
}

export function getStoredVictoryLetters(): VictoryLetter[] {
  const profile = getStoredProfile();
  return profile ? profile.victoryLetters || [] : [];
}

export function getDynamicGreeting(profile: UserProfile): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  const userName = profile.name ? profile.name : "przyjacielu";
  const compName = profile.companionName;

  if (hour >= 5 && hour < 11) {
    return {
      title: `Dobrego poranka, ${userName}`,
      subtitle: `Zaparzmy coś ciepłego i zacznijmy ten dzień w spokoju. Jestem przy tobie — jak czujesz się po nocy?`,
    };
  } else if (hour >= 11 && hour < 17) {
    return {
      title: `Dobrego popołudnia, ${userName}`,
      subtitle: `Zrób małą przerwę w codziennym biegu. Jestem ${compName} — opowiedz mi, jak mija twój dzień.`,
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      title: `Dobry wieczór, ${userName}`,
      subtitle: `Zostawmy za drzwiami cały zgiełk dzisiejszego dnia. Usiądź wygodnie, możesz zrzucić ze swoich barków wszystko, co ciąży.`,
    };
  } else {
    return {
      title: `Spokojnej nocy, ${userName}`,
      subtitle: `Jeśli myśli nie dają ci zasnąć, jestem tutaj. Nie musisz być sam ze swoimi emocjami.`,
    };
  }
}
