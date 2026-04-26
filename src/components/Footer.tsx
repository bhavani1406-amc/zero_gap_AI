import { Link } from "@tanstack/react-router";
import { Linkedin, Mail } from "lucide-react";

export function Footer({ showFounder = false }: { showFounder?: boolean }) {
  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="container mx-auto px-6 py-14">
        {showFounder && (
          <div className="max-w-3xl mx-auto text-center mb-12 pb-12 border-b border-border/40">
            <p className="text-sm text-foreground/80 leading-relaxed">
              <span className="font-medium text-foreground">About the founder.</span>{" "}
              ZeroGap was built by a second-year engineering student in Bengaluru. After watching
              classmates get rejected for roles they were qualified for, I decided to fix the
              broken feedback loop between students and recruiters. This is that fix.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="font-display text-xl mb-3">ZeroGap <span className="text-gradient-cyan">AI</span></div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Bridging the skill gap for Indian students, one resume at a time.
            </p>
            <p className="text-muted-foreground text-xs mt-3">Made with ❤️ in Bengaluru 🇮🇳</p>
            <a href="mailto:hello@zerogap.ai" className="inline-flex items-center gap-1.5 text-xs text-primary mt-3 hover:underline">
              <Mail className="size-3.5" /> hello@zerogap.ai
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-2 ml-3 hover:text-primary">
              <Linkedin className="size-3.5" />
            </a>
          </div>

          <div>
            <div className="font-medium mb-3 text-foreground/90">Product</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/resume-analysis" className="hover:text-primary">Resume Analysis</Link></li>
              <li><Link to="/market-mapping" className="hover:text-primary">Market Mapping</Link></li>
              <li><Link to="/confidence-coach" className="hover:text-primary">Confidence Coach</Link></li>
              <li><Link to="/micro-roadmap" className="hover:text-primary">48H Roadmap</Link></li>
              <li><Link to="/localized-intelligence" className="hover:text-primary">Localized Jobs</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-3 text-foreground/90">Company</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><a href="mailto:hello@zerogap.ai" className="hover:text-primary">Contact</a></li>
              <li><span className="opacity-50 cursor-not-allowed">Careers (soon)</span></li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-3 text-foreground/90">For Colleges</div>
            <p className="text-xs text-muted-foreground mb-2">Get your T&P cell onboarded — free for colleges under 500 students.</p>
            <a href="mailto:campus@zerogap.ai" className="text-xs text-primary hover:underline block mb-3">campus@zerogap.ai</a>
            <Link to="/campus-partnership" className="inline-flex items-center text-xs px-3 py-2 rounded-md gradient-cyan text-primary-foreground hover:opacity-90">
              Request Demo →
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        <span>© 2026 ZeroGap AI. All rights reserved.</span>
        <span className="mx-2">·</span>
        <Link to="/privacy" className="hover:text-primary">Privacy</Link>
        <span className="mx-2">·</span>
        <Link to="/terms" className="hover:text-primary">Terms</Link>
      </div>
    </footer>
  );
}
