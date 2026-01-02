export const STAKEHOLDER_TIERS = {
    talent: {
        id: 'talent',
        name: 'Individual Talent',
        usd: { min: 1.49, max: 14.99 },
        inr: { min: 99, max: 999 },
        description: 'Professionals, Founders & Talent',
        features: ['Personal Profile', 'Skill Verification', 'Job Opportunities']
    },
    stakeholder: {
        id: 'stakeholder',
        name: 'Ecosystem Stakeholder',
        usd: { min: 14.99, max: 149.99 },
        inr: { min: 999, max: 9999 },
        description: 'Investors, Organizations & Enablers',
        features: ['Global Visibility', 'Verified Badge', 'Access to Deal Flow']
    },
    government: {
        id: 'government',
        name: 'Government & NGO',
        usd: { min: 0, max: 0 },
        inr: { min: 0, max: 0 },
        description: 'Public Sector & Non-Profits',
        features: ['Ecosystem Oversight', 'Public Reports', 'Collaboration Hub'],
        isFree: true
    }
};

// Legacy support (redirected to tiers)
export const LISTING_FEES = {
    ecosystem: STAKEHOLDER_TIERS.stakeholder,
    talent: STAKEHOLDER_TIERS.talent
};
