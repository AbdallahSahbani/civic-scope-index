import { useState } from 'react';
import { useRoster } from '@/hooks/useRoster';
import { RosterCard } from '@/components/RosterCard';
import { RosterFilters } from '@/components/RosterFilters';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RosterSection() {
  const [search, setSearch] = useState('');
  const [chamber, setChamber] = useState<'all' | 'Federal' | 'State'>('all');
  const [state, setState] = useState('ALL');
  const [party, setParty] = useState('all');

  const { entities, loading, error, updatedAt, totalCount, refetch } = useRoster({
    search,
    chamber,
    state,
    party,
  });

  return (
    <section id="roster-content" className="flex-1">
      <div className="container py-12 space-y-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-semibold text-foreground">
            Official Roster
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Authoritative U.S. elected officials sourced from Congress.gov and OpenStates.
            Real data, source-linked.
          </p>
          {updatedAt && (
            <p className="mt-1 text-xs text-muted-foreground/60">
              Last updated: {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Filter Panel */}
        <RosterFilters
          search={search}
          chamber={chamber}
          state={state}
          party={party}
          onSearchChange={setSearch}
          onChamberChange={setChamber}
          onStateChange={setState}
          onPartyChange={setParty}
        />

        {/* Results Count & Refresh */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading officials...
              </span>
            ) : (
              `${totalCount} ${totalCount === 1 ? 'official' : 'officials'} found`
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refetch}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Failed to load roster</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                className="mt-3"
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="bg-card border border-border rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entity List */}
        {!loading && !error && (
          <div className="space-y-3">
            {entities.length > 0 ? (
              entities.map((entity) => (
                <RosterCard key={entity.id} entity={entity} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No officials match your current filters.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tip */}
        <p className="text-center text-sm text-muted-foreground/70 pt-4">
          Tip: Click a profile to view detailed information from official sources.
        </p>
      </div>
    </section>
  );
}
