import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Entity, ENTITY_TYPE_LABELS, JURISDICTION_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface EntityCardProps {
  entity: Entity;
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

function getEntityBadgeVariant(entityType: Entity['entityType']): 'official' | 'journalist' | 'media' {
  switch (entityType) {
    case 'elected_official':
      return 'official';
    case 'journalist':
      return 'journalist';
    case 'media_organization':
      return 'media';
  }
}

export function EntityCard({ entity }: EntityCardProps) {
  const navigate = useNavigate();
  const initials = getInitials(entity.name);
  const badgeVariant = getEntityBadgeVariant(entity.entityType);

  const handleClick = () => {
    navigate(`/entity/${entity.id}`);
  };

  const getSubtext = () => {
    if (entity.entityType === 'elected_official') {
      return entity.office;
    }
    if (entity.entityType === 'journalist') {
      return `${entity.outlet}${entity.beat ? ` · ${entity.beat}` : ''}`;
    }
    return `Media Organization · ${entity.state}`;
  };

  return (
    <article 
      className="entity-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center gap-4">
        {/* Initials Avatar */}
        <div className="initials-avatar h-12 w-12 text-base shrink-0">
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-medium text-foreground font-serif">
              {entity.name}
            </h3>
            <Badge variant={badgeVariant}>
              {ENTITY_TYPE_LABELS[entity.entityType]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              USA only
            </Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground truncate">
            {getSubtext()}
          </p>

          <p className="mt-2 text-xs text-muted-foreground/70">
            Metrics available · Evidence linked
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
      </div>
    </article>
  );
}
