import { Link } from 'react-router-dom';
import { Building2, User, Mic, Tv, Radio, Globe, Podcast, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MediaEntity, MediaPlatform, MediaEntityType } from '@/lib/mediaTypes';
import { ENTITY_TYPE_LABELS, PLATFORM_LABELS } from '@/lib/mediaTypes';
import { useMediaWatch } from '@/hooks/useMediaWatch';

interface MediaEntityCardProps {
  entity: MediaEntity;
}

function getEntityIcon(type: MediaEntityType) {
  switch (type) {
    case 'CORPORATE_MEDIA':
      return Building2;
    case 'INDEPENDENT_FIGURE':
      return User;
    case 'HYBRID':
      return Mic;
    default:
      return Building2;
  }
}

function getPlatformIcon(platform: MediaPlatform) {
  switch (platform) {
    case 'TV':
      return Tv;
    case 'RADIO':
      return Radio;
    case 'DIGITAL':
      return Globe;
    case 'PODCAST':
      return Podcast;
    case 'SOCIAL':
      return User;
    default:
      return Globe;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function MediaEntityCard({ entity }: MediaEntityCardProps) {
  const Icon = getEntityIcon(entity.entity_type);
  const { add, remove, has } = useMediaWatch();
  const isWatched = has(entity.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWatched) {
      remove(entity.id);
    } else {
      add({
        id: entity.id,
        name: entity.name,
        entityType: entity.entity_type === 'CORPORATE_MEDIA' ? 'organization' : 
                    entity.entity_type === 'INDEPENDENT_FIGURE' ? 'journalist' : 'executive',
        logoUrl: entity.logo_url,
        parentCompany: entity.parent_company,
        headquarters: entity.headquarters_state ? `${entity.headquarters_city || ''}, ${entity.headquarters_state}` : undefined,
      });
    }
  };

  return (
    <div className="entity-card group relative">
      <Link to={`/media/${entity.id}`} className="block">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo/Avatar */}
          {entity.logo_url ? (
            <img 
              src={entity.logo_url} 
              alt={entity.name}
              className="w-14 h-14 rounded-lg object-contain bg-muted"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg initials-avatar text-lg">
              {getInitials(entity.name)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {entity.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {ENTITY_TYPE_LABELS[entity.entity_type]}
              </Badge>
              {!entity.active_status && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {entity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {entity.description}
          </p>
        )}

        {/* Platform Icons */}
        {entity.primary_platforms.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {entity.primary_platforms.slice(0, 4).map((platform) => {
              const PlatformIcon = getPlatformIcon(platform);
              return (
                <div 
                  key={platform}
                  className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
                  title={PLATFORM_LABELS[platform]}
                >
                  <PlatformIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              );
            })}
            {entity.primary_platforms.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{entity.primary_platforms.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {entity.last_verified_at && (
              <span>Verified: {new Date(entity.last_verified_at).toLocaleDateString()}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {entity.headquarters_state && (
              <span>{entity.headquarters_city ? `${entity.headquarters_city}, ` : ''}{entity.headquarters_state}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Watchlist button (absolute positioned) */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-3 right-3 h-8 w-8 ${isWatched ? 'text-civic-red' : 'text-muted-foreground'} hover:text-civic-red`}
        onClick={handleWatchlistToggle}
        title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Heart className={`h-4 w-4 ${isWatched ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
}
