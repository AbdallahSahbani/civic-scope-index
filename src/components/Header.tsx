import { Link, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Heart, Tv, Landmark } from 'lucide-react';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

export function Header() {
  const location = useLocation();
  const isMediaWatch = location.pathname === '/media-watch';

  return (
    <header className="relative overflow-hidden min-h-[180px] bg-gradient-to-br from-civic-navy via-civic-slate to-civic-navy">
      {/* Spline background animation - auto-plays continuously */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-civic-navy via-civic-slate to-civic-navy animate-pulse" />
        }>
          <Spline
            scene="https://prod.spline.design/i4aI4hOVrzzRTC52/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>
      
      {/* Black box to cover "Built with Spline" watermark */}
      <Link 
        to="/legal" 
        className="absolute z-20 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-black/90 transition-colors flex items-center gap-2"
        style={{ bottom: '22px', right: '8px', minWidth: '160px', justifyContent: 'center' }}
      >
        Legal & Method
      </Link>
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      
      <div className="container py-8 relative z-10">
        <div className="flex items-center justify-between">
          {/* Navigation links - Interests & Toggle */}
          <div className="flex-1 flex items-center gap-3">
            <Link 
              to="/interests" 
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40"
            >
              <Heart className="h-4 w-4" />
              Interests
            </Link>
            {/* Toggle between Civic Roster and Media Watch */}
            {isMediaWatch ? (
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40"
              >
                <Landmark className="h-4 w-4" />
                Civic Roster
              </Link>
            ) : (
              <Link 
                to="/media-watch" 
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 hover:border-white/40"
              >
                <Tv className="h-4 w-4" />
                Media Watch
              </Link>
            )}
          </div>
          
          <div className="text-center">
            {isMediaWatch ? (
              /* Media Watch Spline logo */
              <div className="w-full max-w-[600px] h-[140px] mx-auto overflow-hidden">
                <Suspense fallback={
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
                }>
                  <Spline
                    scene="https://prod.spline.design/yDqO5GwxPpaBh62X/scene.splinecode"
                    style={{ width: '100%', height: '100%' }}
                  />
                </Suspense>
              </div>
            ) : (
              <Link to="/" className="inline-block group">
                {/* Cool animated title */}
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-white font-serif drop-shadow-2xl">
                  <span className="inline-block animate-[fade-in_0.6s_ease-out] bg-gradient-to-r from-white via-civic-paper to-white bg-clip-text text-transparent">
                    CIVIC'S
                  </span>
                  <span className="inline-block ml-3 animate-[fade-in_0.8s_ease-out] text-patriotic-red drop-shadow-lg">
                    Roster
                  </span>
                </h1>
                <p className="mt-3 text-sm text-white/80 tracking-widest uppercase animate-[fade-in_1s_ease-out]">
                  United States only · sourced · no endorsements
                </p>
              </Link>
            )}
          </div>
          
          <div className="flex-1" />
        </div>
      </div>
      
      <div className="tricolor-divider relative z-10" />
    </header>
  );
}
