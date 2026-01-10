import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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

      <main className="flex-1">
        <div className="container py-8 space-y-8">
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
