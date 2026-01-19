import { Official } from '@/lib/geocoderTypes';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Phone, Mail, Building2, Landmark, MapPin } from 'lucide-react';

interface RepresentativeCardProps {
  official: Official;
}

function getPartyColor(party?: string): string {
  if (!party) return 'bg-muted text-muted-foreground';
  const p = party.toLowerCase();
  if (p.includes('democrat') || p === 'd') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  if (p.includes('republican') || p === 'r') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return 'bg-muted text-muted-foreground';
}

function getLevelIcon(level: 'federal' | 'state' | 'local') {
  switch (level) {
    case 'federal':
      return <Landmark className="h-4 w-4" />;
    case 'state':
      return <Building2 className="h-4 w-4" />;
    case 'local':
      return <MapPin className="h-4 w-4" />;
  }
}

function getLevelLabel(level: 'federal' | 'state' | 'local'): string {
  switch (level) {
    case 'federal':
      return 'Federal';
    case 'state':
      return 'State';
    case 'local':
      return 'Local';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function RepresentativeCard({ official }: RepresentativeCardProps) {
  const initials = getInitials(official.name);
  const partyClass = getPartyColor(official.party);

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Initials Avatar */}
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-foreground">{official.name}</h4>
            {official.party && (
              <Badge className={partyClass} variant="secondary">
                {official.party}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {official.title}
            {official.district && ` · ${official.district}`}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs gap-1">
              {getLevelIcon(official.level)}
              {getLevelLabel(official.level)}
            </Badge>
            {official.chamber && (
              <Badge variant="outline" className="text-xs">
                {official.chamber}
              </Badge>
            )}
          </div>

          {/* Contact Links */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            {official.contactUrl && (
              <a
                href={official.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Website
              </a>
            )}
            {official.phone && (
              <a
                href={`tel:${official.phone}`}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Phone className="h-3 w-3" />
                {official.phone}
              </a>
            )}
            {official.email && (
              <a
                href={`mailto:${official.email}`}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
