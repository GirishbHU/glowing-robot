import React from 'react';
import { Head } from '@inertiajs/react';

export default function SimpleTest() {
    return (
        <>
            <Head title="Test Page" />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">🦄 Value Journey Quest</h1>
                    <p className="text-xl mb-8">React + Inertia is working!</p>
                    <div className="bg-purple-600 text-white px-6 py-3 rounded-lg inline-block">
                        ✅ Your platform is live!
                    </div>
                </div>
            </div>
        </>
    );
}
