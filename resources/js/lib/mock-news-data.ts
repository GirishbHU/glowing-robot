import { Handshake, Target, Rocket, Users, BarChart3, Globe, Zap, Trophy, Brain } from "lucide-react";

export interface Author {
  name: string;
  avatar: string;
  role?: string;
}

export interface Story {
  id: string;
  title: string;
  image: string;
  summary: string;
  category: string;
  readTime: string;
  author: Author;
  publishDate: string;
  externalLink?: string; // Added for LinkedIn links
}

// Helper to cycle through nice images so every card looks distinct
const storyImages = [
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop", // Tech/Team
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop", // Meeting
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop", // Brainstorm
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop", // Presenting
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop", // Success
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Collab
];

export const mockStories: Story[] = [
  {
    id: "1",
    title: "Founder Led Sales: The 0 to 1 Journey",
    summary: "Why founders must lead the initial sales charge to find true Product-Market Fit.",
    category: "Founder Led Sales",
    image: storyImages[0],
    readTime: "5 min read",
    publishDate: "Dec 10, 2024",
    author: { name: "You", avatar: "https://github.com/shadcn.png" },
    externalLink: "https://www.linkedin.com/pulse/founder-led-sales-finding-product-market-fit-venkat-nanduri-mvqnc/?trackingId=eF%2BvK%2BKGTdi8vV72o2vPqA%3D%3D"
  },
  {
    id: "2",
    title: "Stop Selling, Start Solving",
    summary: "The mindset shift required to close enterprise deals: moving from pitching to partnering.",
    category: "Sales Strategy",
    image: storyImages[1],
    readTime: "4 min read",
    publishDate: "Dec 15, 2024",
    author: { name: "You", avatar: "https://github.com/shadcn.png" },
    externalLink: "https://www.linkedin.com/pulse/founder-led-sales-stop-selling-start-solving-venkat-nanduri-x10hc/?trackingId=eF%2BvK%2BKGTdi8vV72o2vPqA%3D%3D"
  },
  {
    id: "3",
    title: "The Art of the Discovery Call",
    summary: "How to uncover deep pain points that make your solution the only logical choice.",
    category: "Tactical Sales",
    image: storyImages[2],
    readTime: "6 min read",
    publishDate: "Dec 20, 2024",
    author: { name: "You", avatar: "https://github.com/shadcn.png" },
    externalLink: "https://www.linkedin.com/pulse/founder-led-sales-art-discovery-venkat-nanduri-0d2fc/?trackingId=eF%2BvK%2BKGTdi8vV72o2vPqA%3D%3D"
  },
  {
    id: "4",
    title: "Building Your First Sales Playbook",
    summary: "Documenting your winning moves so you can scale beyond the founder.",
    category: "Scaling",
    image: storyImages[3],
    readTime: "7 min read",
    publishDate: "Dec 22, 2024",
    author: { name: "You", avatar: "https://github.com/shadcn.png" },
    externalLink: "https://www.linkedin.com/pulse/founder-led-sales-building-playbook-venkat-nanduri-816tc/?trackingId=eF%2BvK%2BKGTdi8vV72o2vPqA%3D%3D"
  },
  {
    id: "5",
    title: "Hiring Your First Sales Leader",
    summary: "When to let go of the reins and what to look for in your first VP of Sales.",
    category: "Team Building",
    image: storyImages[4],
    readTime: "5 min read",
    publishDate: "Dec 28, 2024",
    author: { name: "You", avatar: "https://github.com/shadcn.png" },
    externalLink: "https://www.linkedin.com/pulse/founder-led-sales-hiring-your-first-sales-leader-venkat-nanduri-xryqc/?trackingId=eF%2BvK%2BKGTdi8vV72o2vPqA%3D%3D"
  },
  {
    id: "6",
    title: "The Metrics That Matter",
    summary: "Vanity metrics vs. Reality: What you should actually be tracking in early-stage sales.",
    category: "Metrics & Data",
    image: storyImages[5],
    readTime: "4 min read",
    publishDate: "Dec 30, 2024",
    author: { name: "You", avatar: "https://github.com/shadcn.png" },
    externalLink: "https://www.linkedin.com/pulse/founder-led-sales-metrics-matter-venkat-nanduri-g4eoc/?trackingId=eF%2BvK%2BKGTdi8vV72o2vPqA%3D%3D"
  }
];