import { Link } from 'react-router-dom';
import { useMediaWatch } from '@/hooks/useMediaWatch';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tv } from 'lucide-react';
import { MediaCard } from '@/components/MediaCard';

export default function MediaWatchPage() {
  const { items, remove, isLoaded } = useMediaWatch();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 relative">
        {/* Hero section with dark gradient background */}
        <div className="relative w-full h-[320px] overflow-hidden">
          {/* Multi-layer dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          
          {/* Radial glow accent */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(100,116,139,0.15)_0%,_transparent_70%)]" />
          
          {/* Title centered */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-white drop-shadow-lg flex items-center justify-center gap-4">
                <Tv className="h-10 w-10 text-slate-400" />
                Media Watch
              </h1>
              <p className="mt-4 text-slate-400 text-sm max-w-md mx-auto">
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
