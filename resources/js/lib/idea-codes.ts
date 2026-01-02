const PREFIXES = [
  "Project", "Mission", "Operation", "Venture", "Quest", "Spark", "Vision"
];

const CODENAMES = [
  "Phoenix", "Nebula", "Quantum", "Odyssey", "Aurora", "Zenith", "Nova",
  "Cipher", "Apex", "Vector", "Prism", "Vortex", "Nexus", "Pulse", "Titan",
  "Echo", "Blaze", "Storm", "Frost", "Shadow", "Thunder", "Comet"
];

const EMOJIS = ["🚀", "💡", "🦄", "✨", "🔥", "⭐", "🎯", "💎", "🌟", "🔮"];

const GREEK_LETTERS = [
  "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Theta", "Omega"
];

export function generateFunIdeaCode(existingCount: number = 0): string {
  const style = Math.floor(Math.random() * 6);
  const num = existingCount + 1;
  
  switch (style) {
    case 0:
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      return `${emoji} Stealth #${num.toString().padStart(2, '0')}`;
    
    case 1:
      const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
      const letter = String.fromCharCode(65 + (num - 1) % 26);
      return `${prefix} ${letter}-${num.toString().padStart(3, '0')}`;
    
    case 2:
      const codename = CODENAMES[Math.floor(Math.random() * CODENAMES.length)];
      return `🔒 ${codename}`;
    
    case 3:
      const greek = GREEK_LETTERS[Math.floor(Math.random() * GREEK_LETTERS.length)];
      return `💡 ${greek} Idea`;
    
    case 4:
      return `🦄 Mystery Unicorn #${num}`;
    
    default:
      return `🚀 Idea #${num.toString().padStart(3, '0')}`;
  }
}

export function generateQuickPseudonyms(): { name: string; emoji: string }[] {
  return [
    { name: `🚀 Stealth #${Math.floor(Math.random() * 99) + 1}`, emoji: "" },
    { name: `💡 Idea #${Math.floor(Math.random() * 999) + 1}`, emoji: "" },
    { name: `🔒 Project X`, emoji: "" },
    { name: `🦄 Mystery Unicorn`, emoji: "" },
    { name: `✨ ${CODENAMES[Math.floor(Math.random() * CODENAMES.length)]}`, emoji: "" },
    { name: `🎯 ${GREEK_LETTERS[Math.floor(Math.random() * GREEK_LETTERS.length)]} Mission`, emoji: "" },
  ];
}

export const PRIVACY_MESSAGES = {
  hero: "Your Unicorn Idea with You, Always!",
  tagline: "Never share your secrets with anyone. Not even us! 🤫",
  
  noSecrets: [
    "We don't need to know your secrets. Frankly, we don't WANT to know! 🙈",
    "Your NDA stays YOUR NDA. We're here for insights, not your pitch deck!",
    "What happens in your startup, stays in your startup. We just help you level up!",
  ],
  
  magicLink: [
    "Your Magic Link = Your Golden Ticket 🎫",
    "Guard this link like you guard your cap table!",
    "One link to rule them all. Save it, bookmark it, tattoo it (maybe not the last one).",
  ],
  
  startNow: [
    "Start now. Name it later. Or never. Your call! 💪",
    "No login required. No names demanded. Just pure startup assessment goodness.",
    "We auto-generated a super-secret codename. Change it whenever (or never)!",
  ],
  
  dataOwnership: [
    "Your data. Your rules. Export anytime, delete anytime.",
    "We're just the messenger. Your ideas are YOUR ideas. Period.",
    "100% anonymous. 100% yours. 100% in your control.",
  ],
};

export function getRandomPrivacyMessage(category: keyof typeof PRIVACY_MESSAGES): string {
  const messages = PRIVACY_MESSAGES[category];
  if (typeof messages === 'string') return messages;
  return messages[Math.floor(Math.random() * messages.length)];
}

const FANCY_ADJECTIVES = [
  "Cosmic", "Stellar", "Brilliant", "Daring", "Bold", "Swift", "Mighty", "Radiant",
  "Fearless", "Clever", "Wise", "Noble", "Epic", "Legendary", "Mystic", "Dynamic"
];

const FANCY_NOUNS = [
  "Pioneer", "Voyager", "Dreamer", "Builder", "Creator", "Innovator", "Trailblazer",
  "Visionary", "Explorer", "Architect", "Maverick", "Catalyst", "Champion", "Wizard"
];

export function generateFancyName(): string {
  const adjective = FANCY_ADJECTIVES[Math.floor(Math.random() * FANCY_ADJECTIVES.length)];
  const noun = FANCY_NOUNS[Math.floor(Math.random() * FANCY_NOUNS.length)];
  return `${adjective} ${noun}`;
}
