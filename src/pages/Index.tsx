import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FilterPanel } from '@/components/FilterPanel';
import { EntityCard } from '@/components/EntityCard';
import { mockEntities, filterEntities } from '@/lib/mockData';

const Index = () => {
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [state, setState] = useState('ALL');
  const [jurisdiction, setJurisdiction] = useState('all');

  const filteredEntities = useMemo(() => {
    return filterEntities(mockEntities, {
      search,
      entityType,
      state,
      jurisdiction,
    });
  }, [search, entityType, state, jurisdiction]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cinematic Hero Section */}
      <HeroSection />

      <main id="roster-content" className="flex-1">
        <div className="container py-12 space-y-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              Roster
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              USA-only profiles for elected officials, journalists, and media organizations. 
              Descriptive metrics, evidence-linked.
            </p>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            search={search}
            entityType={entityType}
            state={state}
            jurisdiction={jurisdiction}
            onSearchChange={setSearch}
            onEntityTypeChange={setEntityType}
            onStateChange={setState}
            onJurisdictionChange={setJurisdiction}
          />

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredEntities.length} {filteredEntities.length === 1 ? 'entity' : 'entities'} found
          </div>

          {/* Entity List */}
          <div className="space-y-3">
            {filteredEntities.length > 0 ? (
              filteredEntities.map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No entities match your current filters.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Tip */}
          <p className="text-center text-sm text-muted-foreground/70 pt-4">
            Tip: Click a profile, then use the "Profile Interpreter" button to ask scoped questions.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
