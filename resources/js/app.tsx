import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

import { pageComponents } from './pages';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './contexts/theme-context';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page = pageComponents[name];
        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }
        return page();
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <TooltipProvider>
                        <App {...props} />
                        <Toaster />
                    </TooltipProvider>
                </ThemeProvider>
            </QueryClientProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
