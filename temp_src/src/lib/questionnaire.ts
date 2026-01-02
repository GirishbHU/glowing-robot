export interface Question {
  id: string;
  code: string;
  text: string;
  category: "Dimension" | "EiR"; // Dimensions = Growth/Value, EiR = Risk/Friction
  phaseId: number;
  stakeholderType: string;
}

export interface AssessmentResult {
  score: number;
  riskScore: number;
  dimensionScore: number;
  summary: string;
  recommendedStories: string[];
  phaseMax: number;
  formattedDimensionScore: string;
  formattedThriveScore: string;
  formattedTotalScore: string;
}

// Exponential phase scaling: 100 for Phase 1, 10X increase per phase, reaching 10^9 at Phase 7
export const PHASE_SCALE: Record<number, number> = {
  1: 100,           // 10^2 - Idea Validation
  2: 1000,          // 10^3 - Product Development
  3: 10000,         // 10^4 - Market Entry
  4: 100000,        // 10^5 - Growth & Scaling
  5: 1000000,       // 10^6 - Maturity & Profitability
  6: 10000000,      // 10^7 - Leadership & Innovation
  7: 1000000000,    // 10^9 - Unicorn & Beyond
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toString();
};

export const questions: Question[] = [
  // --- Phase 1: Idea Validation (Pre-Seed) ---
  {
    id: "q-1-101",
    code: "1D1",
    text: "Do you have a clear understanding of the specific customer pain point you're solving?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-102",
    code: "1D2",
    text: "Does your solution uniquely address the problem better than existing alternatives?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-103",
    code: "1D3",
    text: "How does the founding team's background, experience, and passion align with the problem domain?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-104",
    code: "1D4",
    text: "Can you articulate your unique value proposition in one sentence that resonates with your target customer?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-105",
    code: "1D5",
    text: "Do you have clarity on your revenue model, cost structure, and key assumptions?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-106",
    code: "1D6",
    text: "Do you have any proprietary technology, data, or IP? How will you protect it?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-107",
    code: "1D7",
    text: "What early signs of traction (e.g., waitlist, LOIs, pilot users) do you have?",
    category: "Dimension",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-1",
    code: "1EiR1",
    text: "Are you aware of data that contradicts your assumptions and actively stress-testing your hypothesis?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-2",
    code: "1EiR2",
    text: "Have you identified potential regulatory barriers in your operating or target markets?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-3",
    code: "1EiR3",
    text: "How are you ensuring alignment, equity, and conflict resolution among co-founders?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-4",
    code: "1EiR4",
    text: "Is there a well-funded or incumbent player that could replicate your idea quickly? How do you stay ahead?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-5",
    code: "1EiR5",
    text: "Have you stress-tested your burn rate under 12–18 months of no follow-on funding?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-6",
    code: "1EiR6",
    text: "Do you have a plan to mitigate technical hurdles that could delay MVP development?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },
  {
    id: "q-1-eir-7",
    code: "1EiR7",
    text: "Do you feel confident in your ability to persevere through setbacks and uncertainty?",
    category: "EiR",
    phaseId: 1,
    stakeholderType: "Startup"
  },

  // --- Phase 2: Product Development (Seed) ---
  {
    id: "q-2-201",
    code: "2D1",
    text: "Is your MVP clearly designed to test core assumptions with defined success metrics?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-202",
    code: "2D2",
    text: "Have you incorporated user feedback into your UX/UI design?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-203",
    code: "2D3",
    text: "Is your architecture modular, cloud-native, and capable of handling 10x scale?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-204",
    code: "2D4",
    text: "Do your early metrics suggest you're approaching product-market fit?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-205",
    code: "2D5",
    text: "Do you have a clear process for prioritizing features?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-206",
    code: "2D6",
    text: "Does your revenue model align with user behavior and willingness to pay?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-207",
    code: "2D7",
    text: "What channels will you use to reach early adopters, and what’s your CAC hypothesis?",
    category: "Dimension",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-1",
    code: "2EiR1",
    text: "Are you confident your MVP has all critical functionality needed for adoption?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-2",
    code: "2EiR2",
    text: "Do you understand and address the top drop-off points in your funnel?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-3",
    code: "2EiR3",
    text: "Are you relying on fragile third-party APIs or legacy systems that could break at scale?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-4",
    code: "2EiR4",
    text: "Have you tested your UX across diverse user segments (e.g., low-bandwidth, non-English)?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-5",
    code: "2EiR5",
    text: "Could early traction be from a niche group not representative of your broader market?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-6",
    code: "2EiR6",
    text: "How are you managing team dynamics as you grow from 5 to 15 people?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },
  {
    id: "q-2-eir-7",
    code: "2EiR7",
    text: "How would a 30% increase in cloud or talent costs impact your runway?",
    category: "EiR",
    phaseId: 2,
    stakeholderType: "Startup"
  },

  // --- Phase 3: Market Entry (Series A) ---
  {
    id: "q-3-301",
    code: "3D1",
    text: "Do you have clarity on your CAC by channel and their scalability?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-302",
    code: "3D2",
    text: "Do you have a balanced go-to-market strategy across digital, partnerships, and direct sales?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-303",
    code: "3D3",
    text: "Do you have a well-considered pricing strategy?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-304",
    code: "3D4",
    text: "Are you effectively building brand credibility in a crowded market?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-305",
    code: "3D5",
    text: "Are you effectively tracking and acting on customer satisfaction metrics?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-306",
    code: "3D6",
    text: "Is your sales team well-structured and incentivized for long-term growth?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-307",
    code: "3D7",
    text: "Do you have a defensible competitive moat?",
    category: "Dimension",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-1",
    code: "3EiR1",
    text: "Are you overly reliant on one acquisition channel (e.g. Meta ads) vulnerable to algorithm changes?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-2",
    code: "3EiR2",
    text: "Could aggressive discounting erode brand value or margins long-term?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-3",
    code: "3EiR3",
    text: "Have you tested how your brand is perceived across different demographics or regions?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-4",
    code: "3EiR4",
    text: "How quickly do you close the loop between customer complaints and product fixes?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-5",
    code: "3EiR5",
    text: "How are you responding to a sudden increase in competitor funding or market share?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-6",
    code: "3EiR6",
    text: "Are there gaps in lead qualification or pipeline management?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },
  {
    id: "q-3-eir-7",
    code: "3EiR7",
    text: "Are you underestimating churn or overestimating repeat purchases in your LTV model?",
    category: "EiR",
    phaseId: 3,
    stakeholderType: "Startup"
  },

  // --- Phase 4: Growth & Scaling (Series B/C) ---
  {
    id: "q-4-401",
    code: "4D1",
    text: "Is growth driven by new customers, upsells, or new geographies? What’s the YoY CAGR?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-402",
    code: "4D2",
    text: "Are your retention and unit economics metrics healthy?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-403",
    code: "4D3",
    text: "Do you have strong visibility into your unit economics by segment?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-404",
    code: "4D4",
    text: "How are you using automation, AI, or lean processes to improve efficiency (e.g., fulfillment, support)?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-405",
    code: "4D5",
    text: "Do you have a solid hiring roadmap while maintaining culture?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-406",
    code: "4D6",
    text: "Are you managing capital efficiency with clear visibility on burn and runway?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-407",
    code: "4D7",
    text: "Do you have a clear expansion strategy for new markets?",
    category: "Dimension",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-1",
    code: "4EiR1",
    text: "Where are you seeing infrastructure, talent, or process constraints?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-2",
    code: "4EiR2",
    text: "Is rising competition increasing your CAC? How are you optimizing for organic and referral growth?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-3",
    code: "4EiR3",
    text: "Are employees aligned with the mission? What cultural KPIs are you tracking?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-4",
    code: "4EiR4",
    text: "How far off were your last financial projections, and what caused the variance?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-5",
    code: "4EiR5",
    text: "Are growth rates slowing in core markets? What’s your plan to avoid plateauing?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-6",
    code: "4EiR6",
    text: "How are you competing for top talent in high-demand roles (e.g., AI, cybersecurity)?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },
  {
    id: "q-4-eir-7",
    code: "4EiR7",
    text: "Are your growth timelines realistic vs. investor pressure for hyper-scaling?",
    category: "EiR",
    phaseId: 4,
    stakeholderType: "Startup"
  },

  // --- Phase 5: Maturity & Profitability (Series C+) ---
  {
    id: "q-5-501",
    code: "5D1",
    text: "Are you on a clear path to profitability?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-502",
    code: "5D2",
    text: "Do you effectively manage working capital and liquidity?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-503",
    code: "5D3",
    text: "Do you use scenario planning, sensitivity analysis, and real-time dashboards?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-504",
    code: "5D4",
    text: "Do you have robust risk management processes in place?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-505",
    code: "5D5",
    text: "Do you have a board, independent directors, and compliance policies (e.g., data, audit)?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-506",
    code: "5D6",
    text: "Do you have a clear exit strategy and path forward?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-507",
    code: "5D7",
    text: "Are you effectively engaging stakeholders on a regular basis?",
    category: "Dimension",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-1",
    code: "5EiR1",
    text: "What cost drivers (e.g., logistics, cloud, talent) are squeezing margins?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-2",
    code: "5EiR2",
    text: "How do you manage seasonality or large capex cycles?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-3",
    code: "5EiR3",
    text: "Are you prepared for new laws (e.g., AI Act, DSA, carbon reporting)?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-4",
    code: "5EiR4",
    text: "How would a recession impact your customer spend and funding access?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-5",
    code: "5EiR5",
    text: "Are you grooming successors for key roles?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-6",
    code: "5EiR6",
    text: "Are teams focused on efficiency over innovation? How do you prevent stagnation?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },
  {
    id: "q-5-eir-7",
    code: "5EiR7",
    text: "Are investors concerned about delayed returns? How are you managing expectations?",
    category: "EiR",
    phaseId: 5,
    stakeholderType: "Startup"
  },

  // --- Phase 6: Leadership & Innovation (Pre-IPO) ---
  {
    id: "q-6-601",
    code: "6D1",
    text: "How are you developing future leaders through mentorship, rotation, and training?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-602",
    code: "6D2",
    text: "Do you have dedicated R&D, hackathons, or innovation labs driving breakthroughs?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-603",
    code: "6D3",
    text: "What strategies attract top global talent? What’s your DEI progress?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-604",
    code: "6D4",
    text: "Is your structure enabling speed, accountability, and cross-functional collaboration?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-605",
    code: "6D5",
    text: "Do strategic alliances significantly amplify your capabilities?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-606",
    code: "6D6",
    text: "Are you prepared for international expansion?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-607",
    code: "6D7",
    text: "Are you committed to sustainability and ethical practices?",
    category: "Dimension",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-1",
    code: "6EiR1",
    text: "Are decisions slowing due to hierarchy or unclear ownership?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-2",
    code: "6EiR2",
    text: "Are teams burned out from constant pivots or feature launches?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-3",
    code: "6EiR3",
    text: "What’s your turnover rate in critical roles? How are you addressing it?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-4",
    code: "6EiR4",
    text: "Are joint goals, KPIs, and communication clear with strategic allies?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-5",
    code: "6EiR5",
    text: "What regulatory, cultural, or logistical hurdles have emerged?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-6",
    code: "6EiR6",
    text: "Are your sustainability claims backed by data and third-party audits?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },
  {
    id: "q-6-eir-7",
    code: "6EiR7",
    text: "Is the original startup culture being lost as you professionalize?",
    category: "EiR",
    phaseId: 6,
    stakeholderType: "Startup"
  },

  // --- Phase 7: Unicorn & Beyond (Post-IPO/Acquisition) ---
  {
    id: "q-7-701",
    code: "7D1",
    text: "Do you have strong market position and a strategy to defend against disruptors?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-702",
    code: "7D2",
    text: "Are you shaping standards, policy, or open-source ecosystems?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-703",
    code: "7D3",
    text: "Do you effectively manage your brand narrative across channels?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-704",
    code: "7D4",
    text: "Are your CSR initiatives delivering measurable impact?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-705",
    code: "7D5",
    text: "Do you have strong programs to retain top talent and leaders?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-706",
    code: "7D6",
    text: "Do you have a formal, transparent process for CEO and board succession?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-707",
    code: "7D7",
    text: "Do you have a clear vision for your long-term impact on the industry?",
    category: "Dimension",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-1",
    code: "7EiR1",
    text: "How are you managing pressure for quarterly growth vs. long-term vision?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-2",
    code: "7EiR2",
    text: "What emerging tech (e.g., AI agents, decentralized commerce) could threaten your model?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-3",
    code: "7EiR3",
    text: "Do you have strong crisis management capabilities and learnings from past challenges?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-4",
    code: "7EiR4",
    text: "Have stakeholders questioned the authenticity of your social/environmental claims?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-5",
    code: "7EiR5",
    text: "Have leadership transitions caused strategic drift or cultural misalignment?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-6",
    code: "7EiR6",
    text: "Is rapid scaling diluting your core values or customer focus?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  },
  {
    id: "q-7-eir-7",
    code: "7EiR7",
    text: "Are new entrants or agile startups overtaking your innovation pace?",
    category: "EiR",
    phaseId: 7,
    stakeholderType: "Startup"
  }
];

export const calculateResult = (answers: Record<string, number>, phaseId: number): AssessmentResult => {
  const phaseQuestions = questions.filter(q => q.phaseId === phaseId);
  const dimensionQuestions = phaseQuestions.filter(q => q.category === "Dimension");
  const eirQuestions = phaseQuestions.filter(q => q.category === "EiR");
  
  // Get phase-specific max score
  const phaseMax = PHASE_SCALE[phaseId] || 100;

  // Calculate Growth Potential (Dimension score) - normalized 0-1 then scaled
  let dimensionTotal = 0;
  let dimensionCount = 0;
  dimensionQuestions.forEach(q => {
    if (answers[q.id] !== undefined) {
      dimensionTotal += answers[q.id];
      dimensionCount++;
    }
  });
  const dimensionRatio = dimensionCount > 0 ? dimensionTotal / (dimensionCount * 5) : 0;
  const scaledDimensionScore = dimensionRatio * phaseMax;

  // Calculate Thrive Factor (EiR score) - additive/positive, scaled
  let eirTotal = 0;
  let eirCount = 0;
  eirQuestions.forEach(q => {
    if (answers[q.id] !== undefined) {
      eirTotal += answers[q.id];
      eirCount++;
    }
  });
  const thriveRatio = eirCount > 0 ? eirTotal / (eirCount * 5) : 0;
  const scaledThriveScore = thriveRatio * phaseMax;

  // Total score is the sum of both (additive)
  const totalScore = scaledDimensionScore + scaledThriveScore;
  const totalMax = phaseMax * 2; // Max possible is both at 100%

  // Percentage for summary evaluation
  const overallPercentage = ((dimensionRatio + thriveRatio) / 2) * 100;

  let summary = "";

  if (overallPercentage > 80) {
    summary = "Unicorn Potential: You are demonstrating exceptional tenacity and strategic clarity. Your growth dimensions and thrive capacity are top-tier.";
  } else if (overallPercentage > 50) {
    summary = "Solid Foundation: You have strong fundamentals with room to strengthen your capacity to thrive. Focus on building resilience.";
  } else {
    summary = "Growth Opportunity: There are areas to develop in both growth dimensions and your ability to overcome challenges. Consider targeted improvements.";
  }

  return {
    score: totalScore,
    riskScore: scaledThriveScore,
    dimensionScore: scaledDimensionScore,
    summary,
    recommendedStories: [],
    phaseMax,
    formattedDimensionScore: formatLargeNumber(scaledDimensionScore),
    formattedThriveScore: formatLargeNumber(scaledThriveScore),
    formattedTotalScore: formatLargeNumber(totalScore)
  };
};
