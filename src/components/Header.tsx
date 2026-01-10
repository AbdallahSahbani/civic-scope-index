import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          
          <div className="text-center">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground font-serif">
                Civic Roster
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                United States only · sourced · no endorsements
              </p>
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            <Link 
              to="/legal" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Legal & Method
            </Link>
          </div>
        </div>
      </div>
      
      <div className="tricolor-divider" />
    </header>
  );
}
