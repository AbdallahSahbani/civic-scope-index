import { Link } from 'react-router-dom';
import { useInterests } from '@/hooks/useInterests';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Heart, Users, TrendingUp } from 'lucide-react';
import { InterestCard } from '@/components/InterestCard';

export default function InterestsPage() {
  const { items, remove, isLoaded } = useInterests();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
                  Your Interests
                </h1>
                <p className="text-muted-foreground">
                  Track officials and media figures you're following
                </p>
              </div>
            </div>
            
            {/* Stats */}
            {isLoaded && items.length > 0 && (
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{items.length}</span>
                  <span className="text-muted-foreground">Profiles Saved</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated in real-time</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
          {!isLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="bg-card border border-border rounded-xl p-8 text-center max-w-md shadow-lg">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
                  No saved profiles yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Browse the roster and add officials or media figures to your interests to track them here.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg">
                    <Link to="/">Browse Civic Roster</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/media-watch">Browse Media Watch</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
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