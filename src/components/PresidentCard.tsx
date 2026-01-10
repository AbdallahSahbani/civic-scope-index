import { useNavigate } from 'react-router-dom';
import { ChevronRight, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Current President - This should be updated when administration changes
const CURRENT_PRESIDENT = {
  id: 'B000589', // Joe Biden's bioguide ID
  name: 'Biden, Joseph R., Jr.',
  displayName: 'Joseph R. Biden Jr.',
  role: 'President of the United States',
  party: 'Democratic',
  state: 'Delaware',
  photoUrl: 'https://www.whitehouse.gov/wp-content/uploads/2021/01/P20210303AS-1901-cropped.jpg',
  term: '46th President (2021–present)',
};

function getInitials(name: string): string {
  // Handle "Last, First" format
  const parts = name.split(',');
  if (parts.length > 1) {
    const first = parts[1].trim().split(' ')[0];
    const last = parts[0].trim();
    return `${first[0]}${last[0]}`.toUpperCase();
  }
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function PresidentCard() {
  const navigate = useNavigate();
  const initials = getInitials(CURRENT_PRESIDENT.name);

  const handleClick = () => {
    navigate(`/official/${CURRENT_PRESIDENT.id}`, { 
      state: { 
        entity: {
          id: CURRENT_PRESIDENT.id,
          name: CURRENT_PRESIDENT.name,
          role: CURRENT_PRESIDENT.role,
          chamber: 'Federal' as const,
          party: CURRENT_PRESIDENT.party,
          state: CURRENT_PRESIDENT.state,
          source: 'congress' as const,
          bioguideId: CURRENT_PRESIDENT.id,
          photoUrl: CURRENT_PRESIDENT.photoUrl,
        }
      } 
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-1">
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
          {/* Photo Avatar */}
          <div className="relative h-14 w-14 rounded-full bg-muted shrink-0 border-2 border-primary/30 overflow-hidden">
            {CURRENT_PRESIDENT.photoUrl ? (
              <img 
                src={CURRENT_PRESIDENT.photoUrl} 
                alt={`Official portrait of ${CURRENT_PRESIDENT.displayName}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground font-serif font-semibold text-lg ${CURRENT_PRESIDENT.photoUrl ? 'hidden' : ''}`}>
              {initials}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                <Landmark className="h-3 w-3 mr-1" />
                Executive Branch
              </Badge>
            </div>

            <h3 className="text-base font-semibold text-foreground font-serif">
              {CURRENT_PRESIDENT.displayName}
            </h3>

            <p className="text-sm text-muted-foreground">
              {CURRENT_PRESIDENT.role}
            </p>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                {CURRENT_PRESIDENT.party}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {CURRENT_PRESIDENT.term}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
        </div>
      </article>
    </div>
  );
}