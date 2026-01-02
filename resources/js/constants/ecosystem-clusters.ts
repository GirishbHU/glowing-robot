import {
    Globe, Briefcase, Users, Layers, Brain, AlertTriangle,
    MapPin, Plane, Star, Zap, Activity, BookOpen, GraduationCap, Gavel, Building2,
    DollarSign, Laptop, Stethoscope, Leaf, Microscope, MonitorPlay, Landmark,
    Lightbulb, Rocket, Target, TrendingUp, Award, Crown,
    User, UserPlus, Search, Briefcase as RoleIcon, Building, School, Network,
    Component, BarChart, Scale, Shield, Heart,
    Users2, Flame, TrendingDown, Bug, FileWarning, Shuffle, Lock, HelpCircle
} from "lucide-react";

export const CLUSTER_CATEGORIES = [
    {
        id: "regions",
        title: "9 Regions",
        icon: Globe,
        items: [
            { label: "North America", href: "/region/na", icon: MapPin, hint: "Where the Unicorns roam free (and expensive)." },
            { label: "Latin America", href: "/region/latam", icon: MapPin, hint: "Passion meets scalability." },
            { label: "Western Europe", href: "/region/weu", icon: MapPin, hint: "Old world heritage, new world regulation." },
            { label: "Eastern Europe", href: "/region/eeu", icon: MapPin, hint: "Hard tech, harder work ethic." },
            { label: "MENA", href: "/region/mena", icon: MapPin, hint: "Oasis of innovation in the desert." },
            { label: "Sub-Saharan Africa", href: "/region/ssa", icon: MapPin, hint: "The next great leapfrogging frontier." },
            { label: "Central/South Asia", href: "/region/csa", icon: MapPin, hint: "A billion consumers can't be wrong." },
            { label: "East Asia", href: "/region/ea", icon: MapPin, hint: "Dragons, tigers, and decacorns." },
            { label: "Oceania", href: "/region/oceania", icon: MapPin, hint: "Punching above weight, down under." },
        ]
    },
    {
        id: "sectors",
        title: "9 Super Sectors",
        icon: Briefcase,
        items: [
            { label: "FinTech", href: "/sector/fintech", icon: DollarSign, hint: "Making money move better." },
            { label: "HealthTech", href: "/sector/healthtech", icon: Stethoscope, hint: "Saving lives, one API at a time." },
            { label: "GreenTech", href: "/sector/greentech", icon: Leaf, hint: "Saving the planet, profitably." },
            { label: "DeepTech", href: "/sector/deeptech", icon: Microscope, hint: "Science fiction becoming science fact." },
            { label: "EdTech", href: "/sector/edtech", icon: GraduationCap, hint: "The classroom of the future is here." },
            { label: "PropTech", href: "/sector/proptech", icon: Building2, hint: "Bricks, mortar, and blockchain." },
            { label: "LegalTech", href: "/sector/legaltech", icon: Gavel, hint: "Disrupting the billable hour." },
            { label: "Media/Gaming", href: "/sector/media", icon: MonitorPlay, hint: "Attention is the new currency." },
            { label: "GovTech", href: "/sector/govtech", icon: Landmark, hint: "Bureaucracy, but optimized." },
        ]
    },
    {
        id: "stakeholders",
        title: "9 Stakeholders",
        icon: Users,
        items: [
            { label: "Founder", href: "/role/founder", icon: User, hint: "Chief Everything Officer." },
            { label: "Investor", href: "/role/investor", icon: DollarSign, hint: "Fueled by FOMO and conviction." },
            { label: "Talent", href: "/role/talent", icon: UserPlus, hint: "The real engine of growth." },
            { label: "Mentor", href: "/role/mentor", icon: Star, hint: "Been there, failed that." },
            { label: "Corporate", href: "/role/corporate", icon: Building, hint: "The sleeping giants wake up." },
            { label: "Government", href: "/role/government", icon: Landmark, hint: "Setting the rules of the game." },
            { label: "Academia", href: "/role/academia", icon: School, hint: "From theory to IPO." },
            { label: "Incubator", href: "/role/incubator", icon: Network, hint: "Where eggs become eagles." },
            { label: "Service Provider", href: "/role/provider", icon: Briefcase, hint: "The picks and shovels." },
        ]
    },
    {
        id: "levels",
        title: "9 Levels",
        icon: Layers,
        items: [
            { label: "L1: Idea", href: "/level/1", icon: Lightbulb, hint: "A napkin and a dream." },
            { label: "L2: Validated", href: "/level/2", icon: Search, hint: "Someone actually wants this!" },
            { label: "L3: MVP", href: "/level/3", icon: Laptop, hint: "It works... mostly." },
            { label: "L4: Traction", href: "/level/4", icon: Activity, hint: "The hockey stick begins." },
            { label: "L5: Revenue", href: "/level/5", icon: DollarSign, hint: "Cash flow is king." },
            { label: "L6: Growth", href: "/level/6", icon: TrendingUp, hint: "Pouring gas on the fire." },
            { label: "L7: Scale", href: "/level/7", icon: Rocket, hint: "Global domination mode." },
            { label: "L8: Expansion", href: "/level/8", icon: Plane, hint: "New markets, new problems." },
            { label: "L9: Unicorn", href: "/level/9", icon: Crown, hint: "The mythical status achieved." },
        ]
    },
    {
        id: "dimensions",
        title: "9 Dimensions",
        description: "The Rationale",
        icon: Brain,
        items: [
            { label: "Team", href: "/rationale/team", icon: Users2, hint: "Bet on the jockey, not the horse." },
            { label: "Product", href: "/rationale/product", icon: Component, hint: "Does it delight?" },
            { label: "Market", href: "/rationale/market", icon: Globe, hint: "Is the pond big enough?" },
            { label: "Model", href: "/rationale/model", icon: BarChart, hint: "How do you make money?" },
            { label: "Tech", href: "/rationale/tech", icon: Laptop, hint: "Defensible magic." },
            { label: "Legal", href: "/rationale/legal", icon: Scale, hint: "Crossing t's, dodging lawsuits." },
            { label: "Finance", href: "/rationale/finance", icon: DollarSign, hint: "Runway calculation is survival." },
            { label: "Ops", href: "/rationale/ops", icon: Activity, hint: "Execution eats strategy for breakfast." },
            { label: "Impact", href: "/rationale/impact", icon: Heart, hint: "Doing well by doing good." },
        ]
    },
    {
        id: "eitr",
        title: "9 Elephants",
        description: "Hidden Risks",
        icon: AlertTriangle,
        items: [
            { label: "Co-Founder Conflict", href: "/eitr/conflict", icon: Users2, hint: "Divorce is expensive." },
            { label: "Burn Rate", href: "/eitr/burn", icon: Flame, hint: "Running out of oxygen." },
            { label: "CAC > LTV", href: "/eitr/unit-economics", icon: TrendingDown, hint: "Selling dollars for 90 cents." },
            { label: "Tech Debt", href: "/eitr/tech-debt", icon: Bug, hint: "The interest rate is huge." },
            { label: "Regulatory", href: "/eitr/regulatory", icon: FileWarning, hint: "The stroke of a pen risk." },
            { label: "Market Shift", href: "/eitr/market", icon: Shuffle, hint: "The Black Swan lands." },
            { label: "Key Man Risk", href: "/eitr/key-man", icon: Lock, hint: "What if Mike gets hit by a bus?" },
            { label: "Cap Table", href: "/eitr/cap-table", icon: BarChart, hint: "Dead equity tells no tales." },
            { label: "Culture", href: "/eitr/culture", icon: HelpCircle, hint: "Toxic water kills the fish." },
        ]
    }
];
