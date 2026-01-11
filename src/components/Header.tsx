import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

export function Header() {
  return (
    <header className="border-b bg-card relative overflow-hidden">
      {/* Spline background animation - lazy loaded with error boundary */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <Suspense fallback={null}>
          <Spline
            scene="https://prod.spline.design/i4aI4hOVrzzRTC52/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>
      
      <div className="container py-6 relative z-10">
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
      
      <div className="tricolor-divider relative z-10" />
    </header>
  );
}
