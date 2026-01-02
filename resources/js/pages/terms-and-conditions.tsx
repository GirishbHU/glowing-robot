import { Head } from "@inertiajs/react";
import Footer from "@/components/layout/footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
            <Head title="Terms and Conditions - i2u.ai" />

            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-indigo-500/10 bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors">Back to Home</span>
                    </Link>
                    <div className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                        i2u.ai Legal
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Terms and Conditions</h1>
                <p className="text-slate-400 mb-12">Last Updated: January 2026</p>

                <div className="prose prose-invert prose-lg max-w-none space-y-12">

                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                        <p>Welcome to <strong>i2u.ai</strong> (The Unicorn Protocol). By accessing or using our platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you strictly disagree with any part of these terms, you may not access the service.</p>
                    </section>

                    {/* User Accounts */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. User Identity & Accounts</h2>
                        <ul className="list-disc pl-6 space-y-2 text-slate-300">
                            <li>You are responsible for safeguarding the password that you use to access the service.</li>
                            <li>We reserve the right to suspend or terminate accounts that engage in fraudulent activity or violate community guidelines (e.g., hate speech, spam).</li>
                            <li>The "Merit Score" and "Gleams" are platform-specific metrics and hold no real-world monetary value unless explicitly stated otherwise.</li>
                        </ul>
                    </section>

                    {/* Payments & CashFree */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Payments and Refunds</h2>
                        <p className="mb-4">For users in India, payments are processed via <strong>CashFree Payments India Pvt Ltd</strong>. For international users, payments may be processed via PayPal or Stripe.</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-300">
                            <li><strong>Currency:</strong> Interactions are billed in INR for Indian citizens and USD for international users.</li>
                            <li><strong>Refund Policy:</strong> Startups/Founders may request a refund within <strong>7 days</strong> of purchase if the service (Assessment/Report) was not delivered due to technical failure. No refunds are provided for completed assessments or "Buyer's Remorse".</li>
                            <li><strong>Disputes:</strong> Any payment disputes will be handled in accordance with the regulations of the Reserve Bank of India (RBI) for INR transactions.</li>
                        </ul>
                    </section>

                    {/* Content & IP */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
                        <p>The "Unicorn Protocol" architecture, the "Value Journey" assessment logic, and the platform branding are the exclusive property of i2u.ai. User-generated content (Pulse posts) remains the property of the user, but you grant us a license to display and distribute it on the platform.</p>
                    </section>

                    {/* Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                        <p>i2u.ai is a networking and intelligence platform. We are not a registered investment advisor or broker-dealer. No content on the platform constitutes financial advice. We are not liable for any investment decisions made based on platform data.</p>
                    </section>

                    {/* Contact */}
                    <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
                        <p>If you have any questions about these Terms, please contact us at:</p>
                        <a href="mailto:support@i2u.ai" className="text-indigo-400 hover:text-indigo-300 font-bold block mt-2">support@i2u.ai</a>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
