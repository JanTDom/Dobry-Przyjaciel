import { Message, UserProfile } from "@/types";

export interface CompanionResponse {
  text: string;
  moodContext: "peaceful" | "supportive" | "deep_listening" | "grounding" | "celebration";
  detectedLifeFact?: {
    category: "core_value" | "vulnerability" | "goal" | "spark_of_joy" | "relationship";
    title: string;
    detail: string;
  };
  suggestedAction?: {
    type: "sos_breathing" | "open_sanctuary" | "view_memory";
    label: string;
  };
  deepQuestion?: string;
}

// Asynchroniczne wywołanie GPT-4o-mini z płynnym fallbackiem lokalnym
export async function getCompanionReplyAsync(
  userText: string,
  profile: UserProfile,
  history: Message[] = []
): Promise<CompanionResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, profile, history }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        return {
          text: data.reply,
          moodContext: "supportive",
        };
      }
    }
  } catch {
    // Fallback do lokalnego silnika
  }

  return generateCompanionReply(userText, profile, history);
}

export function generateCompanionReply(
  userText: string,
  profile: UserProfile,
  recentHistory: Message[] = []
): CompanionResponse {
  const lower = userText.toLowerCase();

  // 1. Silny lęk, panika, kryzys
  if (
    lower.includes("panik") ||
    lower.includes("nie daję rady") ||
    lower.includes("nie moge oddychac") ||
    lower.includes("nie mogę oddychać") ||
    lower.includes("chcę zniknąć") ||
    lower.includes("wszystko się sypie") ||
    lower.includes("boję się") ||
    lower.includes("trzęsę się")
  ) {
    return {
      text: `${profile.name}, jestem przy tobie. Odłóż na moment wszystko inne. Nic złego się teraz nie stanie. Poczuj grunt pod stopami i weź ze mną jeden powolny, głęboki oddech. Jesteś bezpieczny.`,
      moodContext: "grounding",
      suggestedAction: {
        type: "sos_breathing",
        label: "Oddychaj ze mną (ćwiczenie uziemiające)",
      },
      deepQuestion: "Co czujesz teraz najmocniej w ciele?",
    };
  }

  // 2. Praca, przeciążenie, szef
  if (
    lower.includes("prac") ||
    lower.includes("szef") ||
    lower.includes("marek") ||
    lower.includes("nadgodzin") ||
    lower.includes("projekt") ||
    lower.includes("termin")
  ) {
    return {
      text: `Słyszę, jak wiele energii cię to kosztuje. Pamiętaj o tym, czego nauczyliśmy się wcześniej: twoja wartość nie zależy od tego, ile cudzego chaosu na siebie weźmiesz. Kiedy stawiasz granicę, nie robisz nikomu krzywdy — chronisz siebie, żeby móc dalej funkcjonować.`,
      moodContext: "supportive",
      detectedLifeFact: {
        category: "relationship",
        title: "Napięcia zawodowe i obrona granic",
        detail: "Uczysz się nie brać na siebie całej winy za cudze opóźnienia i chronić swoje wieczory.",
      },
      deepQuestion: "Jaka jedna rzecz pomogłaby ci dzisiaj postawić wyraźną granicę?",
    };
  }

  // 3. Relacje i bliscy
  if (
    lower.includes("kasia") ||
    lower.includes("partnerk") ||
    lower.includes("mama") ||
    lower.includes("rodzin") ||
    lower.includes("kłótn") ||
    lower.includes("rozmow")
  ) {
    return {
      text: `Relacje z ludźmi, na których nam zależy, potrafią dotykać najczulszych miejsc. Dobrze, że o tym mówisz. Czasem pod czyjąś złością lub wycofaniem kryje się po prostu bezradność albo strach. Jak czujesz się po tej sytuacji?`,
      moodContext: "deep_listening",
      deepQuestion: "Czego w tej relacji najbardziej teraz potrzebujesz?",
    };
  }

  // 4. Sukces, radość
  if (
    lower.includes("udało się") ||
    lower.includes("zrobiłem") ||
    lower.includes("zrobiłam") ||
    lower.includes("jestem dumny") ||
    lower.includes("spokój") ||
    lower.includes("dobry dzień")
  ) {
    return {
      text: `Tak bardzo się cieszę! Pamiętasz, jak trudne to było jeszcze niedawno? Zauważ to i pozwól sobie to poczuć. Zapisuję ten moment do twojej kroniki, żebyśmy mogli do niego wrócić, kiedy przyjdą gorsze chwile.`,
      moodContext: "celebration",
      detectedLifeFact: {
        category: "spark_of_joy",
        title: "Kolejny krok do przodu",
        detail: "Zauważasz swoje postępy i pozwalasz sobie na dumę z własnej pracy.",
      },
      suggestedAction: {
        type: "open_sanctuary",
        label: "Zobacz list w twoim skarbcu",
      },
      deepQuestion: "Co w tobie pomogło ci to osiągnąć?",
    };
  }

  // 5. Domyślna odpowiedź
  const reflectiveReplies = [
    `Wsłuchuję się w twoje słowa. Opowiedz mi o tym więcej — co w tej sytuacji dotyka cię najbardziej?`,
    `Jestem z tobą. Często to, co bierzemy za własną słabość, jest po prostu dowodem na to, jak bardzo nam zależy. Jak myślisz, co byłoby dla ciebie teraz najłagodniejszym rozwiązaniem?`,
    `Zauważam, jak dużo o tym myślisz. Pamiętaj, że nie musisz rozwiązywać całego życia w jeden wieczór. Wystarczy jeden krok. Co czujesz, gdy o tym myślisz?`,
    `Cenię naszą rozmowę i to, jak bardzo jesteś ze mną szczery. Każdego dnia poznaję cię coraz lepiej. O czym chciałbyś teraz porozmawiać?`,
  ];

  const picked = reflectiveReplies[Math.floor(Math.random() * reflectiveReplies.length)];

  return {
    text: picked,
    moodContext: "deep_listening",
    deepQuestion: "Co jest dla ciebie dzisiaj najważniejsze?",
  };
}
