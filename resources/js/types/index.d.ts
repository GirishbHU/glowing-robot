export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar?: string;
    referral_code?: string;
    subscription_tier?: string;
    merit_level?: string;
    execution_score?: number;
    total_gleams?: number;
    total_alicorns?: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string | any; // Support both string URLs and route() function returns
    icon?: any;
    isActive?: boolean;
}

export interface SharedData extends PageProps {
    sidebarOpen?: boolean;
}
