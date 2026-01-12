import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useMediaWatch } from '@/hooks/useMediaWatch';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MediaCard } from '@/components/MediaCard';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function MediaWatchPage() {
  const { items, remove, isLoaded } = useMediaWatch();

  const scrollToContent = () => {
    document.getElementById('media-roster-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero section with Spline as subtle background */}
        <section className="relative h-[45vh] min-h-[360px] max-h-[480px] overflow-hidden">
          {/* Spline background - ambient layer only */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              opacity: 0.28,
              filter: 'blur(0.5px) saturate(0.7)',
            }}
          >
            <Suspense fallback={<div className="w-full h-full" />}>
              <Spline 
                scene="https://prod.spline.design/yDqO5GwxPpaBh62X/scene.splinecode" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  background: 'transparent',
                }}
              />
            </Suspense>
          </div>
          
          {/* Subtle gradient overlay for blending */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/60 via-background/40 to-background" />

          {/* Glass-style content panel */}
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <div className="bg-card/85 backdrop-blur-md border border-border/50 rounded-xl px-8 py-10 max-w-xl text-center shadow-lg">
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
                Media Roster
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                A documented record of U.S. media organizations and figures, sourced from public records.
              </p>
              <Button 
                onClick={scrollToContent}
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Explore Media Records
              </Button>
            </div>
          </div>
        </section>

        {/* Media roster content section */}
        <section id="media-roster-content" className="container py-12">
          {!isLoaded ? (
            <div className="text-muted-foreground text-center py-16">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No media entities in your watch list yet.
              </p>
              <Button asChild variant="outline">
                <Link to="/">Browse Media Organizations</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <MediaCard key={item.id} item={item} onRemove={remove} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
