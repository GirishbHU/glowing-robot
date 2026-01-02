import generatedImage1 from '@assets/generated_images/enterprise_cloud_infrastructure_abstract_geometric_shapes.png';
import generatedImage2 from '@assets/generated_images/ai_neural_network_nodes_connecting_global_map_gold_and_navy.png';
import generatedImage3 from '@assets/generated_images/futuristic_humanoid_robot_hand_touching_digital_interface.png';
import generatedImage4 from '@assets/generated_images/abstract_quantum_computing_visualization_deep_blue_and_purple.png';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  imageUrl?: string;
  content: string;
  readTime: string;
  source: "LinkedIn" | "Blog" | "External" | "RSS";
  sourceUrl?: string;
  attribution?: string;
}

const linkedInArticles = [
  {
    title: "IBM Under Non-Watson Leadership: The Transistor Transition and Competitive Challenges (1971-'93)",
    date: "14 hours ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image1.jpeg"
  },
  {
    title: "Learning from the Real World: Embodied AI as the Bridge Between Simulation and Genuine Intelligence",
    date: "22 hours ago",
    category: "AI Research",
    image: "https://i2u.ai/article-images/image2.jpeg"
  },
  {
    title: "Thomas Watson Jr. and the Post-War Era: The System/360 Revolution (1956–1971)",
    date: "1 day ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image3.png"
  },
  {
    title: "Danny Auble: The Architect of Open-Source HPC Innovation Leading SchedMD into the NVIDIA Era",
    date: "2 hours ago",
    category: "HPC & AI",
    image: "https://i2u.ai/article-images/image4.jpeg"
  },
  {
    title: "Genesis of IBM and Thomas Watson Sr.: From Computing-Tabulating-Recording to Computing Dominance (1896–1956)",
    date: "18 hours ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image5.png"
  },
  {
    title: "Beyond Labels: Weak and Self-Supervised Learning as the Path to Unlimited Data and Scalable AI",
    date: "1 day ago",
    category: "AI Research",
    image: "https://i2u.ai/article-images/image6.png"
  },
  {
    title: "DevRev: Bridging the Developer-Customer Gap and Reshaping the Enterprise CRM Market",
    date: "2 hours ago",
    category: "Enterprise Software",
    image: "https://i2u.ai/article-images/image7.jpeg"
  },
  {
    title: "Zeroth Principles Extended Series",
    date: "11 hours ago",
    category: "Philosophy of AI",
    image: "https://i2u.ai/article-images/image8.png"
  },
  {
    title: "The Seven-Year-Old Test: Building Artificial Common Sense as the Foundation for General Intelligence",
    date: "1 day ago",
    category: "AGI Research",
    image: "https://i2u.ai/article-images/image9.png"
  },
  {
    title: "Niccolo de Masi: The Physicist-CEO Leading IonQ's Quantum Revolution",
    date: "2 days ago",
    category: "Quantum Computing",
    image: "https://i2u.ai/article-images/image10.png"
  },
  {
    title: "From Prediction to Understanding: Causal Inference as the Gateway to True AI",
    date: "3 days ago",
    category: "AI Research",
    image: "https://i2u.ai/article-images/image11.jpeg"
  },
  {
    title: "Dheeraj Pandey: The Architect of Hybrid Cloud Infrastructure and the Visionary Reshaping Enterprise IT",
    date: "4 days ago",
    category: "Leadership",
    image: "https://i2u.ai/article-images/image12.png"
  },
  {
    title: "Zeroth Principles - Part Two: AI as Spectacle, Humanity's Infinite Mirror",
    date: "4 days ago",
    category: "Philosophy of AI",
    image: "https://i2u.ai/article-images/image13.jpeg"
  },
  {
    title: "Meta's AI Present and Future: Llama, AGI, and the 2025-'30 Vision",
    date: "5 days ago",
    category: "AI Strategy",
    image: "https://i2u.ai/article-images/image14.png"
  },
  {
    title: "Zeroth Principles - Part One: The Insight Precedes the Invention",
    date: "5 days ago",
    category: "Philosophy of AI",
    image: "https://i2u.ai/article-images/image15.jpeg"
  },
  {
    title: "Meta's Mobile Revolution and Advertising Dominance (2012-'18)",
    date: "6 days ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image16.png"
  },
  {
    title: "Building Artificial Minds: World Models and Cognitive Development as the Path to AGI",
    date: "6 days ago",
    category: "AGI Research",
    image: "https://i2u.ai/article-images/image17.jpeg"
  },
  {
    title: "Meta's Metaverse Pivot and Reality Labs Investment (2019-'23)",
    date: "1 week ago",
    category: "Tech Strategy",
    image: "https://i2u.ai/article-images/image18.png"
  },
  {
    title: "Physics-Informed Machine Learning: Embedding the Laws of Nature into AI",
    date: "1 week ago",
    category: "AI Research",
    image: "https://i2u.ai/article-images/image19.jpeg"
  },
  {
    title: "Meta's Genesis: From Harvard Dorm to Social Media Empire (2004-2012)",
    date: "1 week ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image20.jpeg"
  },
  {
    title: "The AI Spring and the Lingering Winter: Beyond Pattern Recognition to Understanding Unknown Laws",
    date: "1 week ago",
    category: "AI History",
    image: "https://i2u.ai/article-images/image21.jpeg"
  },
  {
    title: "Entertainment in the AI Era: Generative Content, Personalization, and Future Models (2025-'30)",
    date: "1 week ago",
    category: "Future of Media",
    image: "https://i2u.ai/article-images/image22.jpeg"
  },
  {
    title: "Streaming Wars, Password Sharing Crackdown, and Profitability Focus (2015-2025)",
    date: "1 week ago",
    category: "Media Strategy",
    image: "https://i2u.ai/article-images/image23.png"
  },
  {
    title: "Netflix Origins and DVD Disruption (1997-2005)",
    date: "1 week ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image24.png"
  },
  {
    title: "Netflix Acquires Warner Bros. Discovery: The Entertainment Industry Consolidation Catalyst (December 2025)",
    date: "1 week ago",
    category: "Market Analysis",
    image: "https://i2u.ai/article-images/image25.jpeg"
  },
  {
    title: "Jacob DeWitte & Caroline Cochran: Building the Nuclear Renaissance Through Oklo Inc.",
    date: "1 week ago",
    category: "Clean Tech",
    image: "https://i2u.ai/article-images/image26.jpeg"
  },
  {
    title: "Monte Carlo Simulation and Its Impact on AI",
    date: "1 week ago",
    category: "AI Methods",
    image: "https://i2u.ai/article-images/image27.jpeg"
  },
  {
    title: "Rajeeb (Raj) Hazra: The Architect Behind Quantinuum's Quantum Revolution",
    date: "1 week ago",
    category: "Quantum Computing",
    image: "https://i2u.ai/article-images/image28.jpeg"
  },
  {
    title: "Microsoft's AI Future: Copilot Integration, Quantum Computing, AI Infrastructure, and Path to AGI (2025-2035)",
    date: "1 week ago",
    category: "AI Strategy",
    image: "https://i2u.ai/article-images/image29.png"
  },
  {
    title: "Satya Nadella Era Part 2: From Cloud Leader to AI Powerhouse (2017-2025)",
    date: "1 week ago",
    category: "Leadership",
    image: "https://i2u.ai/article-images/image30.jpeg"
  },
  {
    title: "Satya Nadella Era Part 1: The Transformation Begins (2014-2017)",
    date: "1 week ago",
    category: "Leadership",
    image: "https://i2u.ai/article-images/image31.png"
  },
  {
    title: "The Steve Ballmer and Interim Leadership Era: From Consolidation to Cloud Skepticism (2000-2013)",
    date: "1 week ago",
    category: "Tech History",
    image: "https://i2u.ai/article-images/image32.jpeg"
  }
];

const blogspotArticles = [
  {
    title: "The Architecture of Understanding: Why Nomenclature, Symbols, and Meta-Levels Matter",
    date: "2 Aug 2025",
    category: "Cognitive Science",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/08/the-architecture-of-understanding-why.html"
  },
  {
    title: "The AI Era: Humanity's Multiverse Bang",
    date: "31 Jul 2025",
    category: "AI Evolution",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/08/the-ai-era-humanitys-multiverse-bang.html"
  },
  {
    title: "Beyond the Known: Humanity’s Quest for Holistic Intelligence",
    date: "28 Jul 2025",
    category: "Philosophy of AI",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/beyond-known-humanitys-quest-for.html"
  },
  {
    title: "Perplexity, the AI Era David?",
    date: "25 Jul 2025",
    category: "Market Disruption",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/the-dawn-of-democratized-intelligence.html"
  },
  {
    title: "Pragmatic Progress: The Dawn of Democratized Abundance",
    date: "25 Jul 2025",
    category: "Future of Work",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/pragmatic-progress-dawn-of-democratized.html"
  },
  {
    title: "Roadmap Ahead for Democratized Abundance!",
    date: "24 Jul 2025",
    category: "Future Roadmap",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/roadmap-ahead-for-democratized-abundance.html"
  },
  {
    title: "The Abundant Future: How AI Unlocks Democratized Opportunities",
    date: "23 Jul 2025",
    category: "Future of Work",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/the-abundant-future-how-ai-unlocks_23.html"
  },
  {
    title: "The Abundant Future: How AI Unlocks Humanity’s Next Great Leap",
    date: "21 Jul 2025",
    category: "Human Evolution",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/the-abundant-future-how-ai-unlocks.html"
  },
  {
    title: "Breaking the Intelligence Singularity",
    date: "20 Jul 2025",
    category: "AI Theory",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/breaking-intelligence-singularity-from.html"
  },
  {
    title: "Beyond Computation: Humanity’s Intellectual Evolution",
    date: "15 Jul 2025",
    category: "Philosophy of Mind",
    sourceUrl: "https://adventuresinbmterrain.blogspot.com/2025/07/beyond-computation-humanitys.html"
  }
];

const images = [generatedImage1, generatedImage2, generatedImage3, generatedImage4];
const authors = ["Girish Hukkeri"];

// Helper to generate a consistent hash-based index
const getConsistentIndex = (str: string, max: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

// Map LinkedIn articles
const mappedLinkedInPosts: BlogPost[] = linkedInArticles.map((article, index) => ({
  id: `linkedin-${index}`,
  title: article.title,
  excerpt: "Deep dive into the technology innovations, leadership strategies, and market dynamics shaping the future of digital infrastructure and unicorn growth.",
  author: "Girish Hukkeri",
  date: article.date,
  category: article.category,
  imageUrl: article.image || images[getConsistentIndex(article.title, images.length)],
  content: `<p>${article.title} - Full analysis available on LinkedIn.</p>`,
  readTime: `${5 + (index % 5)} min read`,
  source: "LinkedIn",
  attribution: "Originally published on LinkedIn"
}));

// Map Blogspot articles
const mappedBlogspotPosts: BlogPost[] = blogspotArticles.map((article, index) => ({
  id: `blog-${index}`,
  title: article.title,
  excerpt: "Exploring the philosophical and practical implications of AI, intelligence, and the future of human potential.",
  author: "Girish Hukkeri",
  date: article.date,
  category: article.category,
  imageUrl: images[getConsistentIndex(article.title, images.length)],
  content: `<p>${article.title} - Full article available at Adventures in BM Terrain.</p>`,
  readTime: `${6 + (index % 4)} min read`,
  source: "Blog",
  attribution: "Adventures in BM Terrain",
  sourceUrl: article.sourceUrl
}));

export const blogPosts: BlogPost[] = [
  ...mappedLinkedInPosts,
  ...mappedBlogspotPosts
];
