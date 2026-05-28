export const questions = [
  {
    id: 'experience',
    question: "First things first — have you ever lived as a digital nomad before?",
    options: [
      { label: "No, this would be my first time", value: 'first' },
      { label: "I've tried it briefly (1–3 months)", value: 'beginner' },
      { label: "Yes, I've been doing it for a while", value: 'experienced' },
    ],
  },
  {
    id: 'budget',
    question: "What's your monthly budget for living expenses — accommodation, food, transport, and co-working?",
    options: [
      { label: "Under $1,500", value: 'low' },
      { label: "$1,500 – $3,000", value: 'mid' },
      { label: "Over $3,000", value: 'high' },
    ],
  },
  {
    id: 'region',
    question: "Do you have a region in mind?",
    options: [
      { label: "Asia 🌏", value: 'asia' },
      { label: "Europe 🌍", value: 'europe' },
      { label: "Latin America 🌎", value: 'latam' },
      { label: "No preference — surprise me!", value: 'any' },
    ],
  },
  {
    id: 'priority',
    question: "What matters most to you in your next destination?",
    options: [
      { label: "Community & meeting other nomads", value: 'community' },
      { label: "Nature, outdoors & adventure", value: 'nature' },
      { label: "City life, culture & food", value: 'city' },
      { label: "A balanced mix of everything", value: 'mix' },
    ],
  },
  {
    id: 'weather',
    question: "What's your ideal weather?",
    options: [
      { label: "Hot & tropical 🌴", value: 'hot' },
      { label: "Mild & pleasant ☀️", value: 'mild' },
      { label: "I don't really care", value: 'any' },
    ],
  },
  {
    id: 'wifi',
    question: "How critical is fast, reliable internet for your work?",
    options: [
      { label: "Mission critical — I need it everywhere", value: 'critical' },
      { label: "Important, but co-working spaces are fine", value: 'important' },
      { label: "Pretty flexible on this one", value: 'flexible' },
    ],
  },
];
