import React from 'react';
import { Head } from '@inertiajs/react';
import UnicornQuestWizard from '@/components/value-journey-v2/unicorn-quest-wizard';
import { AssessmentProvider } from '@/contexts/assessment-context';
import { ErrorBoundary } from '@/components/error-boundary';

export default function ValueJourney() {
    return (
        <ErrorBoundary>
            <Head title="Unicorn Quest" />
            <AssessmentProvider>
                <UnicornQuestWizard />
            </AssessmentProvider>
        </ErrorBoundary>
    );
}
