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
        {/* Background paper texture - lowest layer */}
        <div className="absolute inset-0 z-0" />

        {/* Spline container - constrained height, above texture, below content */}
        <div className="relative w-full h-[420px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Suspense fallback={
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            }>
              <Spline 
                scene="https://prod.spline.design/nRGcGcylZYBvn8YY/scene.splinecode" 
                style={{ width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>
          
          {/* Dark translucent overlay for readability - neutral/gray tint for media */}
          <div className="absolute inset-0 z-10 bg-slate-900/90" />
          
          {/* Title floats above overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-white drop-shadow-lg flex items-center justify-center gap-4">
                <Tv className="h-10 w-10" />
                Media Watch
              </h1>
              <p className="mt-4 text-white/70 text-sm max-w-md mx-auto">
                Track media organizations, executives, and journalists. Separate from elected officials.
              </p>
            </div>
          </div>
        </div>

        {/* Content section - above Spline */}
        <div className="relative z-10 container py-12">
          {!isLoaded ? (
            <div className="text-muted-foreground text-center">Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="glass-card rounded-xl p-8 text-center max-w-md shadow-2xl">
                <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
                  No media entities saved yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Media tracking is separate from elected officials. Add organizations, executives, or journalists to monitor here.
                </p>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/">Back to Roster</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Responsive grid layout for cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <MediaCard key={item.id} item={item} onRemove={remove} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
