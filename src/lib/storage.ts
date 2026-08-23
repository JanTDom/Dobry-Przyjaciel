import { UserProfile, Message, PersonInLife, LifeMemoryFact, OvercomeCrisis, VictoryLetter } from "@/types";

const STORAGE_KEY_AUTH_EMAIL = "przyjaciel_auth_email_v5";
const STORAGE_KEY_PROFILES = "przyjaciel_all_profiles_v5";
const STORAGE_KEY_ACTIVE_PROFILE = "przyjaciel_active_profile_v5";
const STORAGE_KEY_MESSAGES_PREFIX = "przyjaciel_msgs_v5_";
const STORAGE_KEY_ACCESS_CODE = "przyjaciel_access_code_v1";

export const VALID_ACCESS_CODES = ["A132a132!", "A132a132"];
export const VALID_ACCESS_CODE = "A132a132!";

function sanitizeName(name: string | undefined, email?: string): string {
  const clean = (name || "").trim();
  const lowerEmail = (email || "").toLowerCase();
  const isJan = lowerEmail.includes("jan") || lowerEmail.includes("domaniewski");

  if (!clean || clean === "A132a132!" || clean === "A132a132" || clean.toLowerCase().includes("a132")) {
    return isJan ? "Janek" : "Przyjaciel";
  }
  return clean;
}

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

export function createDefaultProfile(
  name: string = "",
  companionName: string = "",
  companionGender: "female" | "male" | "neutral" = "female",
  email?: string
): UserProfile {
  const isJan = (email || "").toLowerCase().includes("jan") || (email || "").toLowerCase().includes("domaniewski");
  const cleanName = sanitizeName(name || (isJan ? "Janek" : "Przyjaciel"), email);
  
  // Dla Jana domyślnym imieniem przyjaciółki jest Małgosia
  let cleanCompName = companionName.trim();
  if (!cleanCompName) {
    cleanCompName = isJan ? "Małgosia" : (companionGender === "male" ? "Maciej" : "Przyjaciel");
  }

  return {
    id: email ? "user_" + btoa(email).replace(/=/g, "").slice(0, 12) : "user_" + Date.now(),
    email: email ? email.toLowerCase() : undefined,
    name: cleanName,
    companionName: cleanCompName,
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

// Przeszukuje wszystkie wersje localStorage w celu odzyskania profilu i wspomnień
function findLegacyProfile(email: string | null): UserProfile | null {
  if (typeof window === "undefined") return null;

  const profileKeys = [
    STORAGE_KEY_PROFILES,
    "przyjaciel_all_profiles_v4",
    "przyjaciel_all_profiles_v3",
    "przyjaciel_all_profiles_v2",
    "przyjaciel_all_profiles_v1",
    "przyjaciel_all_profiles",
  ];

  const activeKeys = [
    STORAGE_KEY_ACTIVE_PROFILE,
    "przyjaciel_active_profile_v4",
    "przyjaciel_active_profile_v3",
    "przyjaciel_active_profile_v2",
    "przyjaciel_active_profile_v1",
    "przyjaciel_active_profile",
    "przyjaciel_profile",
  ];

  const cleanEmail = email ? email.toLowerCase().trim() : null;

  // 1. Sprawdź tablice profili
  for (const k of profileKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const dict = JSON.parse(raw);
        if (cleanEmail && dict[cleanEmail]) {
          return dict[cleanEmail];
        }
        // Jeśli nie podano emaila, weź pierwszy profil
        if (!cleanEmail && Object.keys(dict).length > 0) {
          const firstKey = Object.keys(dict)[0];
          return dict[firstKey];
        }
      }
    } catch {}
  }

  // 2. Sprawdź pojedyncze profile
  for (const k of activeKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const p = JSON.parse(raw);
        if (!cleanEmail || (p.email && p.email.toLowerCase().trim() === cleanEmail)) {
          return p;
        }
      }
    } catch {}
  }

  return null;
}

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const email = getActiveUserEmail();
    const isJan = (email || "").toLowerCase().includes("jan") || (email || "").toLowerCase().includes("domaniewski");

    // 1. Sprawdź profil w aktualnym lub starszym kluczu
    const found = findLegacyProfile(email);

    if (found) {
      const defaultCompName = isJan ? "Małgosia" : (found.companionGender === "male" ? "Maciej" : "Przyjaciel");
      const finalCompanionName = (found.companionName && found.companionName !== "Agata") 
        ? found.companionName.trim() 
        : (isJan ? "Małgosia" : (found.companionName || defaultCompName));

      const merged: UserProfile = {
        ...createDefaultProfile(found.name, finalCompanionName, found.companionGender || "female", email || found.email),
        ...found,
        name: sanitizeName(found.name, email || found.email),
        companionName: finalCompanionName,
      };

      // Zapisz z powrotem do aktualnego klucza v5
      saveStoredProfile(merged);
      return merged;
    }

    // 2. Jeśli zalogowano jako Jan Domaniewski, a profil był pusty, utwórz z Małgosią
    if (email && isJan) {
      const newJanProfile = createDefaultProfile("Janek", "Małgosia", "female", email);
      saveStoredProfile(newJanProfile);
      return newJanProfile;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const email = profile.email || getActiveUserEmail() || "jan.domaniewski@multinewsroom.pl";
    const isJan = email.toLowerCase().includes("jan") || email.toLowerCase().includes("domaniewski");
    
    const allRaw = localStorage.getItem(STORAGE_KEY_PROFILES);
    const profiles: Record<string, UserProfile> = allRaw ? JSON.parse(allRaw) : {};

    const cleanCompName = (profile.companionName && profile.companionName !== "Agata")
      ? profile.companionName.trim()
      : (isJan ? "Małgosia" : (profile.companionName || "Przyjaciel"));

    const cleanProfile: UserProfile = {
      ...profile,
      email,
      name: sanitizeName(profile.name, email),
      companionName: cleanCompName,
    };

    profiles[email] = cleanProfile;

    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, JSON.stringify(cleanProfile));
    localStorage.setItem(STORAGE_KEY_AUTH_EMAIL, email);
  } catch (err) {
    console.error("Failed to save profile", err);
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH_EMAIL);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_PROFILE);
  } catch (err) {
    console.error("Failed to logout", err);
  }
}

export function getStoredMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const email = getActiveUserEmail() || "default";

    // Sprawdź bieżące i starsze klucze wiadomości
    const messageKeys = [
      STORAGE_KEY_MESSAGES_PREFIX + email,
      "przyjaciel_msgs_v4_" + email,
      "przyjaciel_msgs_v3_" + email,
      "przyjaciel_msgs_v2_" + email,
      "przyjaciel_msgs_v1_" + email,
      "przyjaciel_msgs_" + email,
      "przyjaciel_messages_" + email,
      "przyjaciel_msgs_v5_default",
      "przyjaciel_msgs_default",
    ];

    for (const k of messageKeys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const msgs = JSON.parse(raw);
        if (Array.isArray(msgs) && msgs.length > 0) {
          // Przepisz do aktualnego klucza
          localStorage.setItem(STORAGE_KEY_MESSAGES_PREFIX + email, JSON.stringify(msgs));
          return msgs;
        }
      }
    }

    return [];
  } catch {
    return [];
  }
}

export function saveStoredMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    const email = getActiveUserEmail() || "default";
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
  const compName = profile.companionName || "Przyjaciel";

  if (hour >= 5 && hour < 11) {
    return {
      title: `Dobrego poranka, ${userName}`,
      subtitle: `Zaparzmy coś ciepłego i zacznijmy ten dzień w spokoju. Jestem ${compName} — jak czujesz się po nocy?`,
    };
  } else if (hour >= 11 && hour < 17) {
    return {
      title: `Dobrego popołudnia, ${userName}`,
      subtitle: `Zrób małą przerwę w codziennym biegu. Jestem ${compName} — opowiedz mi, jak mija Twój dzień.`,
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      title: `Dobry wieczór, ${userName}`,
      subtitle: `Zostawmy za drzwiami cały zgiełk dzisiejszego dnia. Jestem ${compName} — usiądź wygodnie, możesz zrzucić ze swoich barków wszystko, co ciąży.`,
    };
  } else {
    return {
      title: `Spokojnej nocy, ${userName}`,
      subtitle: `Jeśli myśli nie dają Ci zasnąć, jestem tutaj. Jestem ${compName} — nie musisz być sam ze swoimi emocjami.`,
    };
  }
}
