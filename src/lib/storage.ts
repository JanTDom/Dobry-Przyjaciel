import { UserProfile, Message, PersonInLife, LifeMemoryFact, OvercomeCrisis } from "@/types";

const STORAGE_KEY_PROFILE = "przyjaciel_user_profile_v3";
const STORAGE_KEY_MESSAGES = "przyjaciel_messages_v3";

export const INITIAL_USER_PROFILE: UserProfile = {
  id: "default_user",
  name: "Tobiasz",
  companionName: "Mira",
  companionGender: "female",
  companionVoice: "nova",
  preferredTone: "warm_gentle",
  daysTogether: 28,
  currentMood: "peaceful",
  dailyStreak: 6,
  subscriptionActive: true,
  peopleInLife: [
    {
      id: "p1",
      userId: "default_user",
      name: "Kasia",
      relation: "Partnerka",
      sentiment: "supportive",
      notes: "Zawsze robi herbatę, gdy widzi, że zamykasz się w sobie. Bardzo jej zależy.",
      lastMentioned: "Wczoraj",
    },
    {
      id: "p2",
      userId: "default_user",
      name: "Marek",
      relation: "Szef w pracy",
      sentiment: "stressful",
      notes: "Wymaga nierealnych terminów. Uczysz się stawiać mu zdrowe granice bez poczucia winy.",
      lastMentioned: "3 dni temu",
    },
    {
      id: "p3",
      userId: "default_user",
      name: "Mama",
      relation: "Mama",
      sentiment: "complicated",
      notes: "Czasem nieświadomie wywołuje presję, ale bardzo cię kocha. Pracujesz nad niebraniem wszystkiego do siebie.",
      lastMentioned: "5 dni temu",
    },
  ],
  memories: [
    {
      id: "m1",
      userId: "default_user",
      category: "core_value",
      title: "Autentyczność ponad przypodobywanie się",
      detail: "Obiecałeś sobie, że nie będziesz zgadzać się na rzeczy wbrew sobie tylko po to, by uniknąć konfliktu.",
      confidence: 0.95,
      extractedAt: "2026-08-01",
    },
    {
      id: "m2",
      userId: "default_user",
      category: "vulnerability",
      title: "Paraliż przed oceną w niedzielne wieczory",
      detail: "Gdy zbliża się poniedziałek, w twojej klatce piersiowej pojawia się ucisk. Pomaga wtedy 15-minutowy spacer i wyłączenie powiadomień.",
      confidence: 0.9,
      extractedAt: "2026-08-08",
    },
    {
      id: "m3",
      userId: "default_user",
      category: "goal",
      title: "Zbudowanie własnej niezależności",
      detail: "Chcesz stworzyć coś swojego, by nie czuć się więźniem cudzych decyzji i harmonogramów.",
      confidence: 0.98,
      extractedAt: "2026-08-12",
    },
    {
      id: "m4",
      userId: "default_user",
      category: "spark_of_joy",
      title: "Cisza o 6:30 rano z kawą",
      detail: "Ten krótki moment, zanim świat się obudzi, daje ci 80% spokoju na cały dzień.",
      confidence: 0.92,
      extractedAt: "2026-08-15",
    },
  ],
  overcomeCrises: [
    {
      id: "c1",
      userId: "default_user",
      title: "Atak paniki przed prezentacją kwartalną",
      date: "14 sierpnia 2026",
      whatHappened: "Miałeś ochotę uciec z biura i wyłączyć telefon na 3 dni.",
      howYouSurvived: "Zrobiliśmy 4 rundy oddechu pudełkowego. Wszedłeś do sali, głos ci zadrżał na początku, ale dowiozłeś to do końca.",
      strengthDemonstrated: "Działanie pomimo paraliżującego lęku — definicja prawdziwej odwagi.",
    },
    {
      id: "c2",
      userId: "default_user",
      title: "Ciężka rozmowa z Markiem o nadgodzinach",
      date: "28 lipca 2026",
      whatHappened: "Próbował zrzucić na ciebie winę za opóźnienia zespołu.",
      howYouSurvived: "Zamiast przepraszać, spokojnie pokazałeś harmonogram i odmówiłeś pracy w weekend.",
      strengthDemonstrated: "Wyznaczenie granicy bez agresji i bez wycofywania się.",
    },
  ],
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    userId: "default_user",
    sender: "companion",
    text: "Dzień dobry. Pamiętam, że miałeś wczoraj ciężki wieczór z natłokiem myśli. Jak czuje się dzisiaj twoje ciało i głowa? Nie musisz pisać nic wielkiego — jedno słowo wystarczy.",
    messageType: "voice",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg-2",
    userId: "default_user",
    sender: "user",
    text: "Cześć. Wstałem, ale czuję taki dziwny ucisk w klatce piersiowej. Boję się dzisiejszego spotkania z Markiem.",
    messageType: "text",
    createdAt: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "msg-3",
    userId: "default_user",
    sender: "companion",
    text: "Ten ucisk to tylko twój układ nerwowy, który próbuje cię chronić przed niebezpieczeństwem — ale Marek to nie jest drapieżnik, który może cię zniszczyć. Zobacz: 28 lipca też tak czułeś, a postawiłeś granicę jak mistrz. Jesteś bezpieczny. Chcesz zrobić 2 minuty oddechu uziemiającego, czy po prostu opowiesz mi, co dokładnie ci w nim przeszkadza?",
    messageType: "voice",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
];

export function getInitialSeedMessages(): Message[] {
  return INITIAL_MESSAGES;
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
      companionGender: parsed.companionGender || "female",
      companionVoice: parsed.companionVoice || (parsed.companionGender === "male" ? "echo" : "nova"),
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
  if (typeof window === "undefined") return INITIAL_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES;
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
  return profile.memories || INITIAL_USER_PROFILE.memories || [];
}

export function getStoredPeople(): PersonInLife[] {
  const profile = getStoredProfile();
  return profile.peopleInLife || INITIAL_USER_PROFILE.peopleInLife || [];
}

export function getStoredCrises(): OvercomeCrisis[] {
  const profile = getStoredProfile();
  return profile.overcomeCrises || INITIAL_USER_PROFILE.overcomeCrises || [];
}
