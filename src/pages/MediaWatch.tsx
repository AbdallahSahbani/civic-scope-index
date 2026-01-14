import { useState, Suspense, lazy } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MediaFilterPanel } from '@/components/media/MediaFilterPanel';
import { MediaResultsGrid } from '@/components/media/MediaResultsGrid';
import { MediaDetailDrawer } from '@/components/media/MediaDetailDrawer';
import { useMediaEntities } from '@/hooks/useMediaEntities';
import type { MediaFilters, MediaEntity } from '@/lib/mediaTypes';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

const defaultFilters: MediaFilters = {
  entityType: 'all',
  platforms: [],
  audienceBand: 'all',
  activeStatus: 'all',
  hasFilings: null,
  search: '',
};

export default function MediaWatchPage() {
  const [filters, setFilters] = useState<MediaFilters>(defaultFilters);
  const [selectedEntity, setSelectedEntity] = useState<MediaEntity | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: entities = [], isLoading, error } = useMediaEntities({ filters });

  const scrollToContent = () => {
    document.getElementById('media-roster-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewRecord = (entity: MediaEntity) => {
    setSelectedEntity(entity);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEntity(null);
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

        {/* Media roster content section - 3-column layout */}
        <section id="media-roster-content" className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Left: Filter Panel */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5">
                <h2 className="font-serif text-lg font-medium text-foreground mb-4">Filters</h2>
                <MediaFilterPanel 
                  filters={filters} 
                  onFiltersChange={setFilters} 
                />
              </div>
            </aside>

            {/* Center: Results Grid */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-xl font-medium text-foreground">
                    Media Entities
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isLoading ? 'Loading...' : `${entities.length} ${entities.length === 1 ? 'record' : 'records'} found`}
                  </p>
                </div>
              </div>

              <MediaResultsGrid 
                entities={entities} 
                isLoading={isLoading} 
                error={error as Error | null}
                onViewRecord={handleViewRecord}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Detail Drawer */}
      <MediaDetailDrawer 
        entity={selectedEntity} 
        open={drawerOpen} 
        onClose={handleCloseDrawer} 
      />

      <Footer />
    </div>
  );
}
