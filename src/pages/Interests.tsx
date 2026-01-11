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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 relative">
        {/* Background paper texture - lowest layer */}
        <div className="absolute inset-0 z-0" />

        {/* Spline container - constrained height, above texture, below content */}
        <div className="relative w-full h-[420px] overflow-hidden">
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
          
          {/* Dark translucent overlay for readability */}
          <div className="absolute inset-0 z-10 bg-black/85" />
          
          {/* Title floats above overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-white drop-shadow-lg">
              Interests
            </h1>
          </div>
        </div>

        {/* Content section - above Spline */}
        <div className="relative z-10 container py-12">
          {!isLoaded ? (
            <div className="text-muted-foreground text-center">Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="glass-card rounded-xl p-8 text-center max-w-md shadow-2xl">
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
            /* Responsive grid layout for cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <InterestCard key={item.id} item={item} onRemove={remove} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
