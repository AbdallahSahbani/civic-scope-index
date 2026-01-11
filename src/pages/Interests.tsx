import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useInterests } from '@/hooks/useInterests';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { InterestCard } from '@/components/InterestCard';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function InterestsPage() {
  const { items, remove, isLoaded } = useInterests();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Spline Background Layer - full coverage */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
          }>
            <Spline 
              scene="https://prod.spline.design/nRGcGcylZYBvn8YY/scene.splinecode" 
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </div>

        {/* Content floating above Spline */}
        <div className="relative z-10 container py-12 min-h-[calc(100vh-200px)] flex flex-col">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white text-center mb-12 drop-shadow-lg">
            Interests
          </h1>

          {!isLoaded ? (
            <div className="text-white/80 text-center">Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center max-w-md shadow-2xl">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
                  No saved profiles yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Browse the roster and add officials to your interests to track them here.
                </p>
                <Button asChild size="lg">
                  <Link to="/">Browse Roster</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Cards displayed in a horizontal flex with perspective */
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-8 px-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="transform transition-all duration-500"
                    style={{
                      transform: `perspective(1000px) rotateY(${(index - Math.floor(items.length / 2)) * 5}deg)`,
                    }}
                  >
                    <InterestCard item={item} onRemove={remove} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
