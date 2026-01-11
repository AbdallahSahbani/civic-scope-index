import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useMediaWatch } from '@/hooks/useMediaWatch';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tv } from 'lucide-react';
import { MediaCard } from '@/components/MediaCard';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function MediaWatchPage() {
  const { items, remove, isLoaded } = useMediaWatch();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 relative">
        {/* Unified section with Spline background */}
        <div className="relative min-h-[700px]">
          {/* Spline background - lowest layer */}
          <div className="absolute inset-0 z-0">
            <Suspense fallback={
              <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
            }>
              <Spline 
                scene="https://prod.spline.design/3zobtZIyTeANayj1/scene.splinecode" 
                style={{ width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>
          
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 z-[1] bg-black/40" />

          {/* Content - above Spline */}
          <div className="relative z-10 container py-12">
            {/* Badge animation with Explore button */}
            <div className="flex flex-col items-center justify-center py-16">
              {/* Spline badge animation */}
              <div className="w-[400px] h-[200px] overflow-hidden mb-6">
                <Suspense fallback={
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse rounded-xl" />
                }>
                  <Spline
                    scene="https://prod.spline.design/yDqO5GwxPpaBh62X/scene.splinecode"
                    style={{ width: '100%', height: '100%' }}
                  />
                </Suspense>
              </div>
              
              {/* Explore button */}
              <Button asChild size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                <Link to="/">Explore</Link>
              </Button>
            </div>

            {/* Cards content - only show if there are items */}
            {!isLoaded ? (
              <div className="text-muted-foreground text-center">Loading...</div>
            ) : items.length > 0 && (
              /* Responsive grid layout for cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <MediaCard key={item.id} item={item} onRemove={remove} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
