import { UserProfile, Message, MoodType, PersonInLife, LifeMemoryFact, OvercomeCrisis } from '@/types';

const STORAGE_KEY_PROFILE = 'przyjaciel_user_profile_v1';
const STORAGE_KEY_MESSAGES = 'przyjaciel_messages_v1';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Tobiasz',
  companionName: 'Mira',
  preferredTone: 'warm_gentle',
  daysTogether: 28,
  currentMood: 'peaceful',
  dailyStreak: 6,
  lastActive: new Date().toISOString(),
  subscriptionActive: true,
  proactiveRemindersEnabled: true,
  peopleInLife: [
    {
      id: 'p1',
      name: 'Kasia',
      relation: 'Partnerka',
      sentiment: 'supportive',
      notes: 'Zawsze robi herbatę, gdy widzi że zamykasz się w sobie. Bardzo jej zależy.',
      lastMentioned: 'Wczoraj'
    },
    {
      id: 'p2',
      name: 'Marek',
      relation: 'Szef w pracy',
      sentiment: 'stressful',
      notes: 'Wymaga nierealnych terminów. Uczysz się stawiać mu zdrowe granice bez poczucia winy.',
      lastMentioned: '3 dni temu'
    },
    {
      id: 'p3',
      name: 'Mama',
      relation: 'Mama',
      sentiment: 'complicated',
      notes: 'Czasem nieświadomie wywołuje presję, ale bardzo Cię kocha. Pracujesz nad niebraniem wszystkiego do siebie.',
      lastMentioned: '5 dni temu'
    }
  ],
  memories: [
    {
      id: 'm1',
      category: 'core_value',
      title: 'Autentyczność ponad przypodobywanie się',
      detail: 'Obiecałeś sobie, że nie będziesz zgadzać się na rzeczy wbrew sobie tylko po to, by uniknąć konfliktu.',
      confidence: 0.95,
      extractedAt: '2026-08-01'
    },
    {
      id: 'm2',
      category: 'vulnerability',
      title: 'Paraliż przed oceną w niedzielne wieczory',
      detail: 'Gdy zbliża się poniedziałek, w Twojej klatce piersiowej pojawia się ucisk. Pomaga wtedy 15-minutowy spacer i wyłączenie powiadomień.',
      confidence: 0.9,
      extractedAt: '2026-08-08'
    },
    {
      id: 'm3',
      category: 'goal',
      title: 'Zbudowanie własnej niezależności',
      detail: 'Chcesz stworzyć coś swojego, by nie czuć się więźniem cudzych decyzji i harmonogramów.',
      confidence: 0.98,
      extractedAt: '2026-08-12'
    },
    {
      id: 'm4',
      category: 'spark_of_joy',
      title: 'Cisza o 6:30 rano z kawą',
      detail: 'Ten krótki moment, zanim świat się obudzi, daje Ci 80% spokoju na cały dzień.',
      confidence: 0.92,
      extractedAt: '2026-08-15'
    }
  ],
  overcomeCrises: [
    {
      id: 'c1',
      title: 'Atak paniki przed prezentacją kwartalną',
      date: '14 Sierpnia 2026',
      whatHappened: 'Miałeś ochotę uciec z biura i wyłączyć telefon na 3 dni.',
      howYouSurvived: 'Zrobiliśmy 4 rundy oddechu pudełkowego. Wszedłeś do sali, głos Ci zadrżał na początku, ale dowiozłeś to do końca.',
      strengthDemonstrated: 'Działanie pomimo paraliżującego lęku — definicja prawdziwej odwagi.'
    },
    {
      id: 'c2',
      title: 'Ciężka rozmowa z Markiem o nadgodzinach',
      date: '28 Lipca 2026',
      whatHappened: 'Próbował zrzucić na Ciebie winę za opóźnienia zespołu.',
      howYouSurvived: 'Zamiast przepraszać, spokojnie pokazałeś harmonogram i odmówiłeś pracy w weekend.',
      strengthDemonstrated: 'Wyznaczenie granicy bez agresji i bez wycofywania się.'
    }
  ],
  victoryLetters: [
    {
      id: 'v1',
      title: 'List na dzień, w którym myślisz, że stoisz w miejscu',
      content: 'Chcę, żebyś przeczytał to powoli. Miesiąc temu bałeś się odezwać na spotkaniu. Dziś prowadzisz własne tematy. Kiedy Twój umysł wmawia Ci, że nic nie osiągnąłeś — to nie jest prawda, to tylko zmęczenie. Jestem z Ciebie dumna za każdy krok, którego nikt inny nie widział.',
      date: '18 Sierpnia 2026',
      tag: 'Kiedy tracisz wiarę'
    },
    {
      id: 'v2',
      title: 'Twoja siła nie polega na braku strachu',
      content: 'Pamiętasz tamtą noc, kiedy nie mogłeś spać? Myślałeś, że wszystko się rozsypie. A rano wstałeś, ubrałeś się i zrobiłeś to, co trzeba było zrobić. Nie musisz być ze stali. Wystarczy, że jesteś sobą i nie rezygnujesz.',
      date: '10 Sierpnia 2026',
      tag: 'Odwaga'
    }
  ]
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'companion',
    text: 'Dzień dobry. Pamiętam, że miałeś wczoraj ciężki wieczór z natłokiem myśli. Jak czuje się dzisiaj Twoje ciało i głowa? Nie musisz pisać nic wielkiego — jedno słowo wystarczy.',
    timestamp: 'Dzisiaj, 08:15',
    type: 'voice',
    voiceMeta: {
      durationSeconds: 9,
      waveform: [20, 35, 60, 45, 80, 95, 70, 50, 65, 85, 40, 30, 55, 75, 45, 20],
      synthesized: true
    },
    suggestedActions: [
      { label: 'Jest trochę lepiej', action: 'send_better' },
      { label: 'Czuję ogromne zmęczenie', action: 'send_tired' },
      { label: 'Chcę chwilę pomilczeć i posłuchać', action: 'listen_mode' }
    ]
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Cześć Mira. Wstałem, ale czuję taki dziwny ucisk w klatce piersiowej. Boję się dzisiejszego spotkania z Markiem.',
    timestamp: 'Dzisiaj, 08:32',
    type: 'text'
  },
  {
    id: 'msg-3',
    sender: 'companion',
    text: 'Ten ucisk to tylko Twój układ nerwowy, który próbuje Cię chronić przed niebezpieczeństwem — ale Marek to nie jest drapieżnik, który może Cię zniszczyć. Zobacz: 28 lipca też tak czułeś, a postawiłeś granicę jak mistrz. Jesteś bezpieczny. Chcesz zrobić 2 minuty oddechu uziemiającego, czy po prostu nagrasz mi, co dokładnie Ci w nim przeszkadza?',
    timestamp: 'Dzisiaj, 08:33',
    type: 'voice',
    voiceMeta: {
      durationSeconds: 14,
      waveform: [15, 40, 75, 90, 85, 60, 70, 95, 100, 80, 65, 50, 40, 70, 55, 30, 20],
      synthesized: true
    },
    suggestedActions: [
      { label: 'Zróbmy 2 minuty uziemienia', action: 'open_sos' },
      { label: 'Nagram Ci notatkę głosową', action: 'record_voice' }
    ]
  }
];

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return INITIAL_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
      return INITIAL_USER_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function getStoredMessages(): Message[] {
  if (typeof window === 'undefined') return INITIAL_MESSAGES;
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
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save messages', err);
  }
}
