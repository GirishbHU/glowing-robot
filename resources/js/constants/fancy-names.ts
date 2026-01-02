export const FANCY_NAMES = [
    "🚀 Space Cowboy", "🦄 Unicorn Whisperer", "🔥 Growth Hacker", "💎 Diamond Hands",
    "🛸 Future Surfer", "⚡ Electric Dreamer", "🌟 Stardust Crusader", "🌊 Ocean Architect",
    "🤖 AI Native", "🧠 Neural Navigator", "🦁 Lionheart Founder", "🎯 Sniper Strategist",
    "🎨 Pixel Artisan", "🎻 Code Composer", "🌈 Spectrum Glider", "🐉 Dragon Tamer",
    "👑 Ecosystem King", "🛡️ Guardian of Value", "🧬 Bio Hacker", "🔋 Energy Tycoon",
    "🌌 Nebula Wanderer", "☄️ Comet Chaser", "🎪 Circus Master", "🧙‍♂️ Tech Wizard",
    "🥷 Stealth Mode Ninja", "👽 Martian Resident", "🦖 Legacy Disruptor", "🧊 Ice Breaker",
    "🌋 Volcano Rider", "🎪 Chaos Coordinator",
    // Spicy & Chaotic additions
    "🌶️ Spicy Founder @#$%", "🤬 Raging Disruptor !!!", "💀 Code Reaper", "💩 Shitpost Lord",
    "🤡 Venture Clown", "💸 Cash Burner $$$", "📉 Dip Buyer %%%", "🧨 Boom Goes The Dynamite",
    "🤠 Wild West V.C.", "🦄🌈 Unicorn Vomit", "🔮 Crystal Ball Gazer ???", "🧟‍♂️ Crypto Zombie",
    "🎢 Rollercoaster Tycoon", "🛑 STOP BEING POOR", "🦾 Cyborg CEO", "👁️ All Seeing Eye",
    "🎰 Casino Royalist", "🧼 Wash Trader", "🥊 Heavyweight Champ", "💊 Red Pilled Founder",
    "🕹️ Player One", "👾 8-Bit Hero *&^%", "🎲 High Roller", "🚦 Traffic Control",
    "🚧 Construction Zone", "🏗️ Empire Builder", "🛸 Area 51 Native", "🧬 Mutant Algo",
    "🦠 Viral Vector", "🍄 Magic Mushroom", "👺 Goblin Mode", "🌚 Moon Boi"
];

export const getRandomFancyName = () => {
    return FANCY_NAMES[Math.floor(Math.random() * FANCY_NAMES.length)];
};
