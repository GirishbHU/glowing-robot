import { Link } from "@inertiajs/react";
import { Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦄</span>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                The Unicorn Protocol
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A decentralized intelligence platform for the global startup ecosystem.
              Connecting ideas, capital, and execution through merit.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li>
                <button
                  onClick={() => window.history.back()}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Back
                </button>
              </li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Town Square</Link></li>
              <li><Link href="/leaderboard" className="hover:text-indigo-400 transition-colors">Leaderboard</Link></li>
              <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Login / Join</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refunds" className="hover:text-indigo-400 transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              &copy; {new Date().getFullYear()} i2u.ai. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
