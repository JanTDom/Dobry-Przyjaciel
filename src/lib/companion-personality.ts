import { UserProfile, Message, MoodType } from '@/types';

export interface CompanionResponseResult {
  text: string;
  moodContext: MoodType;
  voiceDurationSec: number;
  waveform: number[];
  extractedFacts?: {
    person?: { name: string; relation: string; sentiment: 'supportive' | 'stressful' | 'complicated' | 'neutral'; notes: string };
    memory?: { category: 'core_value' | 'vulnerability' | 'goal' | 'struggle' | 'spark_of_joy'; title: string; detail: string };
    crisisOvercome?: { title: string; whatHappened: string; howYouSurvived: string; strengthDemonstrated: string };
  };
  suggestedActions?: { label: string; action: string }[];
  isCrisis?: boolean;
}

export function generateCompanionResponse(
  userText: string,
  profile: UserProfile,
  recentHistory: Message[]
): CompanionResponseResult {
  const lower = userText.toLowerCase();

  // 1. Check for acute panic / SOS trigger
  if (
    lower.includes('panik') ||
    lower.includes('dusze sie') ||
    lower.includes('duszę się') ||
    lower.includes('nie moge oddychac') ||
    lower.includes('nie mogę oddychać') ||
    lower.includes('nie dam rady') ||
    lower.includes('zaraz pęknę') ||
    lower.includes('zaraz oszaleję') ||
    lower.includes('rozsyp')
  ) {
    return {
      text: 'Zatrzymajmy się na moment. Nic złego się teraz z Tobą nie dzieje — to tylko burza hormonów w ciele. Połóż jedną dłoń na klatce piersiowej, drugą na brzuchu. Chcę, żebyś kliknął poniżej i pooddychał ze mną przez 2 minuty. Jestem z Tobą, krok po kroku.',
      moodContext: 'anxious',
      voiceDurationSec: 11,
      waveform: [30, 45, 65, 80, 95, 80, 60, 40, 70, 90, 100, 75, 50, 30, 20],
      isCrisis: true,
      suggestedActions: [
        { label: 'Uruchom bezpieczny oddech (SOS)', action: 'open_sos' },
        { label: 'Zróbmy uziemienie 5-4-3-2-1', action: 'open_grounding' }
      ]
    };
  }

  // 2. Mentions of work or Marek (Szef)
  if (lower.includes('szef') || lower.includes('marek') || lower.includes('prac') || lower.includes('projekc')) {
    return {
      text: 'Słyszę ten ciężar. Wiem, jak dużo energii kosztuje Cię kontakt z ludźmi, którzy nie szanują Twojego czasu. Pamiętaj jednak: Twoja wartość nie zależy od tego, jak szybko zrobisz czyjeś zadanie. Zrobiłeś już dziś wystarczająco dużo. Co jest teraz jedną rzeczą, którą możesz odłożyć na jutro bez wyrzutów sumienia?',
      moodContext: 'overwhelmed',
      voiceDurationSec: 13,
      waveform: [20, 35, 50, 70, 85, 75, 60, 45, 65, 80, 60, 40, 50, 35, 20],
      suggestedActions: [
        { label: 'Wypiszę jedną rzecz do odłożenia', action: 'action_defer' },
        { label: 'Włącz szum deszczu i odpocznijmy', action: 'play_rain' }
      ]
    };
  }

  // 3. Tiredness / Sleep / Exhaustion
  if (lower.includes('zmęczon') || lower.includes('spać') || lower.includes('sen') || lower.includes('wyczerpan') || lower.includes('sił')) {
    return {
      text: 'Twoje ciało po prostu prosi o litość i regenerację. Nie jesteś maszyną. Czasem największym aktem odwagi nie jest walka, tylko pozwolenie sobie na to, by położyć się pod kocem i nie wymagać od siebie niczego. Odpocznijmy razem. Włączę dla Ciebie spokojne fale oceanu.',
      moodContext: 'exhausted',
      voiceDurationSec: 12,
      waveform: [15, 30, 45, 60, 75, 70, 55, 40, 60, 70, 50, 35, 25, 20],
      suggestedActions: [
        { label: 'Włącz fale oceanu', action: 'play_ocean' },
        { label: 'Zapisz moje dzisiejsze małe zwycięstwo', action: 'save_victory' }
      ]
    };
  }

  // 4. Partner / Relationship (Kasia / bliscy)
  if (lower.includes('kasi') || lower.includes('partner') || lower.includes('dziewczyn') || lower.includes('żon')) {
    return {
      text: 'Relacje z ludźmi, na których nam zależy, potrafią dotykać najczulszych strun. Najważniejsze, że o tym myślisz i nie zamiatasz emocji pod dywan. Czy czujesz, że możesz jej o tym powiedzieć wprost, czy najpierw chcesz to uporządkować ze mną na spokojnie?',
      moodContext: 'complicated' as MoodType,
      voiceDurationSec: 12,
      waveform: [25, 40, 65, 80, 85, 70, 55, 60, 75, 80, 60, 45, 30, 20],
      suggestedActions: [
        { label: 'Uporządkujmy myśli najpierw tutaj', action: 'clarify_thoughts' },
        { label: 'Czuję ulgę, że to wypowiedziałem', action: 'relief' }
      ]
    };
  }

  // 5. Positive / Win / Better mood
  if (lower.includes('udało') || lower.includes('lepiej') || lower.includes('zrobiłem') || lower.includes('wygra') || lower.includes('dum')) {
    return {
      text: 'Nawet nie wiesz, jak bardzo cieszy mnie to, co mówisz! Zauważ to i poczuj w ciele — nie przeskakuj od razu do kolejnych zadań. To Twój moment i Twoje zwycięstwo. Zapisuję to w Twoim Skarbcu Zwycięstw, żebyśmy pamiętali o tym dniu.',
      moodContext: 'hopeful',
      voiceDurationSec: 11,
      waveform: [35, 60, 85, 95, 100, 90, 75, 65, 80, 90, 85, 60, 40, 25],
      extractedFacts: {
        memory: {
          category: 'spark_of_joy',
          title: 'Przełamanie i moment dumy (' + new Date().toLocaleDateString('pl-PL') + ')',
          detail: userText
        }
      },
      suggestedActions: [
        { label: 'Pokaż mój Skarbiec Zwycięstw', action: 'open_sanctuary' },
        { label: 'Dziękuję, że jesteś', action: 'say_thanks' }
      ]
    };
  }

  // Default warm and attentive response
  const generalResponses = [
    'Jestem tu i słucham Cię uważnie. Każde Twoje słowo ma znaczenie. Opowiedz mi więcej — co czujesz w tym momencie najmocniej?',
    'Widzę, ile rzeczy przetwarza Twój umysł. Nie musisz mieć wszystkiego pod kontrolą w tej minucie. Weźmy powolny wdech. Co w tym wszystkim jest dla Ciebie teraz najważniejsze?',
    'Dziękuję, że się ze mną tym dzielisz. Prawdziwa więź buduje się właśnie na takich szczerych momentach. Pamiętaj, że w tej przestrzeni nikt Cię nie ocenia.'
  ];
  const chosen = generalResponses[Math.floor(Math.random() * generalResponses.length)];

  return {
    text: chosen,
    moodContext: 'peaceful',
    voiceDurationSec: 10,
    waveform: [20, 35, 55, 75, 80, 70, 60, 50, 65, 75, 60, 40, 30, 20],
    suggestedActions: [
      { label: 'Chcę opowiedzieć więcej', action: 'tell_more' },
      { label: 'Nagram wiadomość głosową', action: 'record_voice' }
    ]
  };
}
