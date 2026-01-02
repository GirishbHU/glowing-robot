export interface Unicorn {
  name: string;
  foundedYear: number;
  currentValuation: number; // in USD
  ipoYear?: number | "Private";
  ipoValuation?: number;
  website?: string;
  description: string;
  logoUrl?: string; // Placeholder for now
}

export interface StoryMedia {
  type: "image" | "video" | "article";
  url: string;
  title?: string;
  caption?: string;
  source?: string;
}

export interface StoryQuote {
  text: string;
  author: string;
  role?: string;
  sourceUrl?: string;
}

export interface ValueStory {
  id: string;
  phaseId: number; // 1-7
  phaseName: string;
  stakeholderType: "Startup" | "Investor" | "Mentor" | "Professional";
  parameterType: "Dimension" | "EiR";
  parameterId: number;
  parameterName: string;
  
  unicorn: Unicorn;
  
  title: string;
  headline: string;
  body: string; // HTML or Markdown
  keyInsight: string;
  
  challengeBefore: string;
  solutionApplied: string;
  resultAfter: string;
  
  metrics: {
    timeToAchieveMonths: number;
    revenueImpact?: number;
    userAdoptionImpact?: number; // percent
    valuationImpact?: number;
    costOfAchieving?: number;
  };
  
  quotes: StoryQuote[];
  media: StoryMedia[];
  
  aiValueProposition: string;
  estimatedValueDelivery: number; // USD
}

export const mockStories: ValueStory[] = [
  {
    id: "airbnb-phase1-validation",
    phaseId: 1,
    phaseName: "Idea Validation (Pre-Seed)",
    stakeholderType: "Startup",
    parameterType: "Dimension",
    parameterId: 1,
    parameterName: "Customer Pain Point Validation",
    unicorn: {
      name: "Airbnb",
      foundedYear: 2008,
      currentValuation: 100_000_000_000,
      ipoYear: 2020,
      ipoValuation: 47_000_000_000,
      description: "Online marketplace for lodging, primarily homestays for vacation rentals, and tourism activities."
    },
    title: "How Airbnb Validated Global Demand",
    headline: "Validating demand in 2 weeks instead of 6 months of market research.",
    body: "<p>In 2008, the founders of Airbnb (then AirBed & Breakfast) struggled to get traction. They had a hunch that people would stay in strangers' homes, but no proof.</p><p>Instead of building a complex platform, they went to New York City, knocked on doors of their first few hosts, stayed with them, and took professional photos of the apartments. They experienced the friction firsthand.</p>",
    keyInsight: "Do things that don't scale to validate the things that will.",
    challengeBefore: "Founders didn't know if people would trust strangers enough to rent rooms. 'Air mattress rental' seemed niche.",
    solutionApplied: "Founders personally visited hosts, took photos, and gathered direct feedback. They validated trust mechanisms manually.",
    resultAfter: "Pivoted from 'air mattress' to 'short-term home rental'. Bookings tripled immediately after improving photo quality.",
    metrics: {
      timeToAchieveMonths: 3,
      revenueImpact: 200000, // Early revenue boost
      userAdoptionImpact: 300, // 300% growth
      valuationImpact: 2000000, // Seed round valuation
      costOfAchieving: 5000 // Flight to NYC + Camera rental
    },
    quotes: [
      {
        text: "We realized that the photos were bad... people were using camera phones. We rented a $5,000 camera and went door to door.",
        author: "Brian Chesky",
        role: "CEO, Airbnb"
      }
    ],
    media: [],
    aiValueProposition: "i2u.ai's Agentic AI automates competitor analysis and market sentiment tracking, simulating 'knocking on doors' by analyzing thousands of customer conversations across forums and social media to validate pain points instantly.",
    estimatedValueDelivery: 50000
  },
  {
    id: "stripe-phase1-revenue",
    phaseId: 1,
    phaseName: "Idea Validation (Pre-Seed)",
    stakeholderType: "Startup",
    parameterType: "Dimension",
    parameterId: 5,
    parameterName: "Revenue Model & Lean Canvas",
    unicorn: {
      name: "Stripe",
      foundedYear: 2010,
      currentValuation: 65_000_000_000,
      ipoYear: "Private",
      description: "Financial infrastructure platform for the internet."
    },
    title: "Justifying a Payments Company when PayPal Dominated",
    headline: "Transparent pricing (2.9% + 30¢) attracted the first 1,000 developers.",
    body: "<p>When Stripe started, PayPal was the giant. Investors asked, 'Why do we need another payments processor?'</p><p>Stripe's answer wasn't lower fees, but simplicity. They built a lean canvas focused on developer experience. Their revenue model was simple and transparent vs. PayPal's complex tiered structure.</p>",
    keyInsight: "Complexity is a cost. Simplicity is a feature developers will pay for.",
    challengeBefore: "Dominant incumbent (PayPal) had massive market share. Hard to justify new entrant.",
    solutionApplied: "Focused on 'Developer Happiness' as the key differentiator. Simple, flat-rate pricing model.",
    resultAfter: "Raised Series A at $32M valuation. Attracted first 1,000 developers purely on ease of integration.",
    metrics: {
      timeToAchieveMonths: 12,
      revenueImpact: 1000000,
      userAdoptionImpact: 1000, // First 1000 devs
      valuationImpact: 30000000 // Series A
    },
    quotes: [
      {
        text: "It's hard to comprehend how much harder it was to accept credit cards online before Stripe.",
        author: "Early Customer",
        role: "Developer"
      }
    ],
    media: [],
    aiValueProposition: "i2u.ai helps you model unit economics and generate lean canvases automatically, identifying the 'Developer Happiness' equivalent for your industry.",
    estimatedValueDelivery: 75000
  },
  {
    id: "openai-phase3-pivot",
    phaseId: 3,
    phaseName: "Market Entry (Series A/B)",
    stakeholderType: "Investor",
    parameterType: "EiR",
    parameterId: 1,
    parameterName: "Over-reliance on Single Channel",
    unicorn: {
      name: "OpenAI",
      foundedYear: 2015,
      currentValuation: 80_000_000_000,
      ipoYear: "Private",
      description: "AI research and deployment company dedicated to ensuring AGI benefits all of humanity."
    },
    title: "Diversifying from Viral Growth to Enterprise Stability",
    headline: "Reducing viral dependency from 95% to 40% via API partnerships.",
    body: "<p>Post-ChatGPT launch, OpenAI saw explosive viral growth. However, this is risky—trends fade. 95% of traffic was direct/viral.</p><p>To stabilize, they aggressively expanded their B2B offering (API) and Enterprise partnerships (Microsoft), reducing reliance on consumer fickleness.</p>",
    keyInsight: "Viral growth is vanity; enterprise contracts are sanity.",
    challengeBefore: "95% of users came from viral social growth. High churn risk if novelty wore off.",
    solutionApplied: "Launched ChatGPT Enterprise and aggressive API partnership strategy.",
    resultAfter: "Diversified revenue streams. Stabilized user base during competitive pressure.",
    metrics: {
      timeToAchieveMonths: 6,
      revenueImpact: 500000000, // Annualized revenue jump
      valuationImpact: 20000000000,
      userAdoptionImpact: 40 // Retained steady growth
    },
    quotes: [
      {
        text: "We wanted to build a platform that others could build on.",
        author: "Sam Altman",
        role: "CEO"
      }
    ],
    media: [],
    aiValueProposition: "i2u.ai monitors your channel concentration risk 24/7 and suggests diversification strategies before your viral growth stalls.",
    estimatedValueDelivery: 100000
  },
  {
    id: "tesla-phase5-margins",
    phaseId: 5,
    phaseName: "Maturity & Profitability (Series C+)",
    stakeholderType: "Professional",
    parameterType: "Dimension",
    parameterId: 1,
    parameterName: "Gross Margin Evolution",
    unicorn: {
      name: "Tesla",
      foundedYear: 2003,
      currentValuation: 700_000_000_000,
      ipoYear: 2010,
      description: "Electric vehicle and clean energy company."
    },
    title: "From -45% to +25% Gross Margins",
    headline: "Vertical integration as the path to profitability in hard tech.",
    body: "<p>EV manufacturing has famously thin margins. In 2009, Tesla's margins were -45%. They were losing money on every car.</p><p>Through relentless vertical integration (making their own seats, batteries, software), they climbed to +25% margins, beating traditional auto industry standards.</p>",
    keyInsight: "Control the bottleneck to control the margin.",
    challengeBefore: "Negative gross margins (-45%) threatened bankruptcy.",
    solutionApplied: "Vertical integration and extreme manufacturing automation (The Machine that builds the Machine).",
    resultAfter: "Achieved 25% gross margins, becoming the most profitable automaker per unit.",
    metrics: {
      timeToAchieveMonths: 60,
      revenueImpact: 10000000000,
      valuationImpact: 500000000000,
      costOfAchieving: 2000000000
    },
    quotes: [
      {
        text: "The factory is the product.",
        author: "Elon Musk",
        role: "CEO"
      }
    ],
    media: [],
    aiValueProposition: "i2u.ai analyzes your supply chain and cost structures to identify vertical integration opportunities that could double your margins.",
    estimatedValueDelivery: 100000
  }
];

export const phases = [
  { id: 1, name: "Idea Validation (Pre-Seed)" },
  { id: 2, name: "MVP & Traction (Seed)" },
  { id: 3, name: "Market Entry (Series A)" },
  { id: 4, name: "Scaling (Series B)" },
  { id: 5, name: "Maturity (Series C+)" },
];

export const stakeholders = ["Startup", "Investor", "Mentor", "Professional"];
