import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Current Vice President - This should be updated when administration changes
const CURRENT_VP = {
  id: 'V000068', // JD Vance's bioguide ID
  name: 'Vance, JD',
  displayName: 'JD Vance',
  role: 'Vice President of the United States',
  party: 'Republican',
  state: 'Ohio',
  photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/JD_Vance_118th_Congress_portrait_%28cropped%29.jpg/440px-JD_Vance_118th_Congress_portrait_%28cropped%29.jpg',
  term: '50th Vice President • Elected 2024',
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

export function VicePresidentCard() {
  const navigate = useNavigate();
  const initials = getInitials(CURRENT_VP.name);

  const handleClick = () => {
    navigate(`/official/${CURRENT_VP.id}`, { 
      state: { 
        entity: {
          id: CURRENT_VP.id,
          name: CURRENT_VP.name,
          role: CURRENT_VP.role,
          chamber: 'Federal' as const,
          party: CURRENT_VP.party,
          state: CURRENT_VP.state,
          source: 'congress' as const,
          bioguideId: CURRENT_VP.id,
          photoUrl: CURRENT_VP.photoUrl,
        }
      } 
    });
  };

  return (
    <div className="relative">
      {/* Premium silver/platinum gradient border */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-slate-400 via-zinc-300 to-slate-500 rounded-xl opacity-90" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-slate-300 via-zinc-200 to-slate-400 rounded-xl blur-sm opacity-50" />
      
      <article 
        className="relative bg-gradient-to-br from-slate-50/80 via-white to-zinc-50/60 border-0 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
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
          <Star className="h-5 w-5 text-slate-500" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Photo Avatar with silver ring */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-400 via-zinc-300 to-slate-500 rounded-full" />
            <div className="relative h-16 w-16 rounded-full bg-muted shrink-0 overflow-hidden ring-2 ring-white">
              {CURRENT_VP.photoUrl ? (
                <img 
                  src={CURRENT_VP.photoUrl} 
                  alt={`Official portrait of ${CURRENT_VP.displayName}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 font-serif font-semibold text-lg ${CURRENT_VP.photoUrl ? 'hidden' : ''}`}>
                {initials}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className="text-xs bg-gradient-to-r from-slate-500 to-zinc-500 text-white border-0 shadow-sm">
                <Shield className="h-3 w-3 mr-1" />
                President of the Senate
              </Badge>
            </div>

            <h3 className="text-lg font-bold text-foreground font-serif">
              {CURRENT_VP.displayName}
            </h3>

            <p className="text-sm text-muted-foreground font-medium">
              {CURRENT_VP.role}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                {CURRENT_VP.party}
              </Badge>
              <span className="text-xs text-slate-700 font-medium">
                {CURRENT_VP.term}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-600 transition-colors shrink-0" />
        </div>
      </article>
    </div>
  );
}
