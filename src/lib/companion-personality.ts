import { UserProfile, Message, MoodType, PersonInLife, LifeMemoryFact, OvercomeCrisis } from "@/types";
import { saveStoredProfile, getStoredProfile } from "./storage";

export interface CompanionReplyResult {
  text: string;
  moodContext: MoodType;
  extractedMemory?: any;
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
      
      // Automatyczna aktualizacja pamięci i relacji w profilu użytkownika
      if (data.extractedMemory) {
        const currentProfile = getStoredProfile() || profile;
        let hasChanges = false;

        // 1. Dodaj lub zaktualizuj osobę
        if (data.extractedMemory.person && data.extractedMemory.person.name) {
          const p = data.extractedMemory.person;
          const existingIdx = (currentProfile.peopleInLife || []).findIndex(
            (item) => item.name.toLowerCase() === p.name.toLowerCase()
          );
          if (existingIdx >= 0) {
            currentProfile.peopleInLife[existingIdx].notes = p.notes;
            currentProfile.peopleInLife[existingIdx].sentiment = p.sentiment || "neutral";
            currentProfile.peopleInLife[existingIdx].lastMentioned = "Dzisiaj";
          } else {
            const newPerson: PersonInLife = {
              id: "p_" + Date.now(),
              name: p.name,
              relation: p.relation || "Bliska osoba",
              sentiment: p.sentiment || "neutral",
              notes: p.notes || "",
              lastMentioned: "Dzisiaj",
            };
            currentProfile.peopleInLife = [...(currentProfile.peopleInLife || []), newPerson];
          }
          hasChanges = true;
        }

        // 2. Dodaj fakt pamięci
        if (data.extractedMemory.memoryFact && data.extractedMemory.memoryFact.title) {
          const f = data.extractedMemory.memoryFact;
          const newFact: LifeMemoryFact = {
            id: "m_" + Date.now(),
            category: f.category || "core_value",
            title: f.title,
            detail: f.detail,
            confidence: 0.95,
            extractedAt: "Dzisiaj",
          };
          currentProfile.memories = [newFact, ...(currentProfile.memories || [])];
          hasChanges = true;
        }

        // 3. Dodaj pokonany kryzys
        if (data.extractedMemory.overcomeCrisis && data.extractedMemory.overcomeCrisis.title) {
          const c = data.extractedMemory.overcomeCrisis;
          const newCrisis: OvercomeCrisis = {
            id: "c_" + Date.now(),
            title: c.title,
            date: "Dzisiaj",
            whatHappened: c.whatHappened,
            howYouSurvived: c.howYouSurvived,
            strengthDemonstrated: c.strengthDemonstrated,
          };
          currentProfile.overcomeCrises = [newCrisis, ...(currentProfile.overcomeCrises || [])];
          hasChanges = true;
        }

        if (hasChanges) {
          saveStoredProfile(currentProfile);
        }
      }

      return {
        text: data.reply || "Jestem przy tobie.",
        moodContext: data.moodContext || "peaceful",
        extractedMemory: data.extractedMemory,
      };
    }
  } catch (err) {
    console.error("Chat API error:", err);
  }

  return {
    text: `Jestem przy tobie, ${profile.name}. Opowiedz mi o tym więcej.`,
    moodContext: "peaceful",
  };
}
