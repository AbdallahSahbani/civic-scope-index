import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/legal" className="hover:text-foreground transition-colors">
            Methodology
          </Link>
          <span className="hidden sm:inline text-border">·</span>
          <Link to="/legal" className="hover:text-foreground transition-colors">
            Data Sources
          </Link>
          <span className="hidden sm:inline text-border">·</span>
          <Link to="/legal" className="hover:text-foreground transition-colors">
            Disclaimer
          </Link>
          <span className="hidden sm:inline text-border">·</span>
          <Link to="/legal" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>
        
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Civic Roster provides descriptive metrics derived from public data. No endorsement or judgment is expressed.
        </p>
      </div>
    </footer>
  );
}
