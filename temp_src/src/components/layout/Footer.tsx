import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Check if we are in embed mode
  const isEmbedded = typeof window !== 'undefined' && window.location.search.includes('embed=true');

  if (isEmbedded) return null;

  return (
    <footer className="bg-background border-t border-white/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <a href="https://i2u.ai/" className="flex items-center gap-2 mb-4 group cursor-pointer">
                <span className="text-2xl font-bold font-heading tracking-tight text-foreground">
                  i2u<span className="text-primary">.ai</span>
                </span>
            </a>
            <p className="text-muted-foreground max-w-sm mb-6">
              Empowering startups with AI-driven insights, validation, and growth strategies. 
              From ideas to unicorns, we're with you every step of the journey.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-foreground">Value Hub</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/value-stories" className="hover:text-primary transition-colors">Latest Insights</Link></li>
              <li><Link href="/value-stories/calculator" className="hover:text-primary transition-colors">Unicorn Assessment</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
              <li><span className="cursor-not-allowed opacity-50">Privacy Policy</span></li>
              <li><span className="cursor-not-allowed opacity-50">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} i2u.ai Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
