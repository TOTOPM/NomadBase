export const questions = [
  {
    id: 'experience',
    question: "Let's start easy — have you ever lived as a digital nomad before?",
    options: [
      { label: "No, this would be my first time", value: 'first' },
      { label: "I've tried it briefly (1–3 months)", value: 'beginner' },
      { label: "Yes, I've been doing it for a while", value: 'experienced' },
    ],
  },
  {
    id: 'budget',
    question: "What's your monthly budget for everything — rent, food, transport, co-working?",
    options: [
      { label: "Under $1,500 — keeping it lean", value: 'low' },
      { label: "$1,500 – $3,000 — comfortable", value: 'mid' },
      { label: "Over $3,000 — quality first", value: 'high' },
    ],
  },
  {
    id: 'region',
    question: "Any part of the world calling to you?",
    options: [
      { label: "Asia", value: 'asia' },
      { label: "Europe", value: 'europe' },
      { label: "Latin America", value: 'latam' },
      { label: "Surprise me — no preference!", value: 'any' },
    ],
  },
  {
    id: 'priority',
    question: "When you picture your ideal day as a nomad, what does it look like?",
    options: [
      { label: "Meeting nomads, co-working, community events", value: 'community' },
      { label: "Mountains, beaches, trekking, outdoor adventures", value: 'nature' },
      { label: "Urban energy, great food, art & culture", value: 'city' },
      { label: "A bit of everything — keep my options open", value: 'mix' },
    ],
  },
  {
    id: 'weather',
    question: "Sun chaser or mild-weather person?",
    options: [
      { label: "Hot & tropical — give me the heat", value: 'hot' },
      { label: "Mild & pleasant — not too hot, not too cold", value: 'mild' },
      { label: "I genuinely don't mind either way", value: 'any' },
    ],
  },
  {
    id: 'wifi',
    question: "How dependent is your work on a fast, reliable internet connection?",
    options: [
      { label: "Mission critical — I need it everywhere", value: 'critical' },
      { label: "Important, but co-working spaces cover it", value: 'important' },
      { label: "Pretty flexible — async work mostly", value: 'flexible' },
    ],
  },
];
