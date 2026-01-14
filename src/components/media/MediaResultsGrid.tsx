import { MediaEntityCard } from './MediaEntityCard';
import type { MediaEntity } from '@/lib/mediaTypes';
import { Loader2, FileSearch } from 'lucide-react';

interface MediaResultsGridProps {
  entities: MediaEntity[];
  isLoading: boolean;
  error: Error | null;
  onViewRecord: (entity: MediaEntity) => void;
}

export function MediaResultsGrid({ entities, isLoading, error, onViewRecord }: MediaResultsGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center">
        <p className="text-destructive">Error loading entities: {error.message}</p>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-12 text-center">
        <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          No Media Entities Found
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No media organizations or figures match your current filters. 
          Try adjusting your search criteria or clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {entities.map((entity) => (
        <MediaEntityCard 
          key={entity.id} 
          entity={entity} 
          onViewRecord={onViewRecord}
        />
      ))}
    </div>
  );
}
