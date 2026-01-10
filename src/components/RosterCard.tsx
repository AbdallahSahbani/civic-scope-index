import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building, User } from 'lucide-react';
import { RosterEntity } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';

interface RosterCardProps {
  entity: RosterEntity;
  compact?: boolean;
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

function getPartyColor(party: string): string {
  const partyLower = party.toLowerCase();
  if (partyLower.includes('republican')) return 'bg-red-100 text-red-800 border-red-200';
  if (partyLower.includes('democrat')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (partyLower.includes('independent')) return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-muted text-muted-foreground border-border';
}

function getChamberIcon(chamber: 'Federal' | 'State' | 'Executive' | 'Local') {
  if (chamber === 'Federal') return Building;
  if (chamber === 'Executive') return Building;
  return User;
}

export function RosterCard({ entity, compact = false }: RosterCardProps) {
  const navigate = useNavigate();
  const initials = getInitials(entity.name);
  const partyColorClass = getPartyColor(entity.party);
  const ChamberIcon = getChamberIcon(entity.chamber);

  const handleClick = () => {
    // Navigate to entity profile with source-specific ID
    navigate(`/official/${entity.id}`, { state: { entity } });
  };

  // Compact grid card layout
  if (compact) {
    return (
      <article 
        className="group relative bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
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
        <div className="flex items-center gap-3 mb-3">
          {/* Photo Avatar with Initials Fallback */}
          <div className="relative h-10 w-10 rounded-full bg-muted shrink-0 border border-border overflow-hidden">
            {entity.photoUrl ? (
              <img 
                src={entity.photoUrl} 
                alt={`Official portrait of ${entity.name}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground font-serif font-semibold text-sm ${entity.photoUrl ? 'hidden' : ''}`}>
              {initials}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground font-serif truncate">
              {entity.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {entity.state}{entity.district ? `-${entity.district}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-auto">
          <Badge variant="outline" className="text-xs">
            <ChamberIcon className="h-3 w-3 mr-1" />
            {entity.chamber}
          </Badge>
          <Badge variant="outline" className={`text-xs border ${partyColorClass}`}>
            {entity.party}
          </Badge>
        </div>

        <ChevronRight className="absolute top-4 right-3 h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </article>
    );
  }

  // Default list card layout
  return (
    <article 
      className="group relative bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer"
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
        {/* Photo Avatar with Initials Fallback */}
        <div className="relative h-12 w-12 rounded-full bg-muted shrink-0 border border-border overflow-hidden">
          {entity.photoUrl ? (
            <img 
              src={entity.photoUrl} 
              alt={`Official portrait of ${entity.name}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Hide image on error, show initials
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground font-serif font-semibold text-base ${entity.photoUrl ? 'hidden' : ''}`}>
            {initials}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-medium text-foreground font-serif truncate">
              {entity.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-xs">
              <ChamberIcon className="h-3 w-3 mr-1" />
              {entity.chamber}
            </Badge>
            <Badge variant="outline" className={`text-xs border ${partyColorClass}`}>
              {entity.party}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {entity.state}{entity.district ? `-${entity.district}` : ''}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground truncate">
            {entity.role}
          </p>

          <p className="mt-1 text-xs text-muted-foreground/70">
            Source: {entity.source === 'congress' ? 'Congress.gov' : entity.source === 'openstates' ? 'OpenStates' : 'Official Records'}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
      </div>
    </article>
  );
}
