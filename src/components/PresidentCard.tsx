import { useNavigate } from 'react-router-dom';
import { ChevronRight, Crown, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Current President - Official White House data (January 20, 2025 - Present)
// Source: https://www.whitehouse.gov/administration/president-trump/
const CURRENT_PRESIDENT = {
  id: 'T000523',
  name: 'Trump, Donald J.',
  displayName: 'Donald J. Trump',
  role: 'President of the United States',
  party: 'Republican',
  state: 'Florida',
  // Official portrait from Wikimedia Commons (Public Domain)
  photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/220px-Donald_Trump_official_portrait.jpg',
  term: '47th President • Inaugurated January 20, 2025',
  sourceUrl: 'https://www.whitehouse.gov/administration/president-trump/',
};

function getInitials(name: string): string {
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
    <div className="relative">
      {/* Premium gold gradient border */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-xl opacity-90" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 rounded-xl blur-sm opacity-50" />
      
      <article 
        className="relative bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/60 border-0 rounded-xl p-5 hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-300 cursor-pointer"
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
        {/* Corner accents */}
        <div className="absolute top-2 right-2">
          <Crown className="h-5 w-5 text-amber-500" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Photo Avatar with gold ring */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full" />
            <div className="relative h-16 w-16 rounded-full bg-muted shrink-0 overflow-hidden ring-2 ring-white">
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
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 font-serif font-semibold text-lg ${CURRENT_PRESIDENT.photoUrl ? 'hidden' : ''}`}>
                {initials}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-sm">
                <Shield className="h-3 w-3 mr-1" />
                Commander-in-Chief
              </Badge>
            </div>

            <h3 className="text-lg font-bold text-foreground font-serif">
              {CURRENT_PRESIDENT.displayName}
            </h3>

            <p className="text-sm text-muted-foreground font-medium">
              {CURRENT_PRESIDENT.role}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                {CURRENT_PRESIDENT.party}
              </Badge>
              <span className="text-xs text-amber-700 font-medium">
                {CURRENT_PRESIDENT.term}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-amber-500 group-hover:text-amber-600 transition-colors shrink-0" />
        </div>
      </article>
    </div>
  );
}