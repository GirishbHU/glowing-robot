// Explicit page imports for production builds
// This bypasses Vite's glob pattern issues
export const pageComponents: Record<string, () => Promise<any>> = {
    'welcome': () => import('./pages/welcome'),
    'Welcome': () => import('./pages/welcome'),
    'value-journey': () => import('./pages/value-journey'),
    'ValueJourney': () => import('./pages/value-journey'),
    'dashboard': () => import('./pages/dashboard'),
    'Dashboard': () => import('./pages/dashboard'),
    'profile/edit': () => import('./pages/profile/edit-profile'),
    'auth/forgot-password': () => import('./pages/auth/forgot-password'),
    'auth/reset-password': () => import('./pages/auth/reset-password'),
    'auth/login': () => import('./pages/auth/login'),
    'auth/register': () => import('./pages/auth/register'),
    'auth/confirm-password': () => import('./pages/auth/confirm-password'),
    'landing-page': () => import('./pages/landing-page'),
    'hubs/ecosystem-hub': () => import('./pages/hubs/ecosystem-hub'),
};
