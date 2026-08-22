import { UserProfile, Message, MoodType, PersonInLife, LifeMemoryFact, OvercomeCrisis } from "@/types";
import { saveStoredProfile, getStoredProfile } from "./storage";

export interface CompanionReplyResult {
  text: string;
  moodContext: MoodType;
  extractedMemory?: any;
  updatedProfile?: UserProfile;
}

export async function getCompanionReplyAsync(
  userText: string,
  profile: UserProfile,
  history: Message[] = []
): Promise<CompanionReplyResult> {
  try {
    const storedCode = typeof window !== "undefined" ? localStorage.getItem("przyjaciel_access_code_v1") || "A132a132!" : "A132a132!";
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-access-code": storedCode,
      },
      body: JSON.stringify({ message: userText, profile, history, accessCode: storedCode }),
    });

    if (res.ok) {
      const data = await res.json();
      const currentProfile = getStoredProfile() || profile;
      let hasChanges = false;

      // 1. Zmiana imienia przyjaciela na życzenie użytkownika (np. "Chcę żebyś miała na imię Małgosia")
      if (data.companionNameUpdate && typeof data.companionNameUpdate === "string" && data.companionNameUpdate.trim().length > 1) {
        currentProfile.companionName = data.companionNameUpdate.trim();
        hasChanges = true;
      }

      // 2. Zmiana imienia użytkownika (np. "Nazywam się Janek")
      if (data.userNameUpdate && typeof data.userNameUpdate === "string" && data.userNameUpdate.trim().length > 1) {
        currentProfile.name = data.userNameUpdate.trim();
        hasChanges = true;
      }

      // 3. Automatyczna ekstrakcja pamięci, osób i trudności
      if (data.extractedMemory) {
        const mem = data.extractedMemory;

        // A. Dodaj lub zaktualizuj osobę w życiu
        if (mem.person && mem.person.name && mem.person.name.trim().length > 0) {
          const p = mem.person;
          const cleanName = p.name.trim();
          const existingIdx = (currentProfile.peopleInLife || []).findIndex(
            (item) => item.name.toLowerCase() === cleanName.toLowerCase()
          );

          if (existingIdx >= 0) {
            currentProfile.peopleInLife[existingIdx].notes = p.notes || currentProfile.peopleInLife[existingIdx].notes;
            currentProfile.peopleInLife[existingIdx].sentiment = p.sentiment || currentProfile.peopleInLife[existingIdx].sentiment;
            currentProfile.peopleInLife[existingIdx].relation = p.relation || currentProfile.peopleInLife[existingIdx].relation;
            currentProfile.peopleInLife[existingIdx].lastMentioned = "Dzisiaj";
          } else {
            const newPerson: PersonInLife = {
              id: "p_" + Date.now(),
              name: cleanName,
              relation: p.relation || "Bliska osoba",
              sentiment: p.sentiment || "neutral",
              notes: p.notes || "",
              lastMentioned: "Dzisiaj",
            };
            currentProfile.peopleInLife = [newPerson, ...(currentProfile.peopleInLife || [])];
          }
          hasChanges = true;
        }

        // B. Dodaj fakt pamięci
        if (mem.memoryFact && mem.memoryFact.title && mem.memoryFact.title.trim().length > 0) {
          const f = mem.memoryFact;
          const newFact: LifeMemoryFact = {
            id: "m_" + Date.now(),
            category: f.category || "core_value",
            title: f.title.trim(),
            detail: f.detail || f.title,
            confidence: 0.95,
            extractedAt: "Dzisiaj",
          };
          currentProfile.memories = [newFact, ...(currentProfile.memories || [])];
          hasChanges = true;
        }

        // C. Dodaj pokonany kryzys
        if (mem.overcomeCrisis && mem.overcomeCrisis.title && mem.overcomeCrisis.title.trim().length > 0) {
          const c = mem.overcomeCrisis;
          const newCrisis: OvercomeCrisis = {
            id: "c_" + Date.now(),
            title: c.title.trim(),
            date: "Dzisiaj",
            whatHappened: c.whatHappened || "",
            howYouSurvived: c.howYouSurvived || "",
            strengthDemonstrated: c.strengthDemonstrated || "Odwaga i spokój",
          };
          currentProfile.overcomeCrises = [newCrisis, ...(currentProfile.overcomeCrises || [])];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        saveStoredProfile(currentProfile);
      }

      return {
        text: data.reply || "Jestem przy Tobie.",
        moodContext: data.moodContext || "peaceful",
        extractedMemory: data.extractedMemory,
        updatedProfile: currentProfile,
      };
    }
  } catch (err) {
    console.error("Chat API error:", err);
  }

  return {
    text: `Jestem przy Tobie, ${profile.name}. Opowiedz mi o tym więcej.`,
    moodContext: "peaceful",
  };
}
