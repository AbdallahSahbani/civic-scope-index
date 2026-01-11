import { Link } from 'react-router-dom';
import { Building2, User, Mic } from 'lucide-react';
import type { MediaEntityType } from '@/hooks/useMediaWatch';

interface MediaCardProps {
  item: {
    id: string;
    name: string;
    entityType: MediaEntityType;
    logoUrl?: string;
    parentCompany?: string;
    foundedYear?: number;
    headquarters?: string;
    reach?: string;
  };
  onRemove: (id: string) => void;
}

function getEntityIcon(type: MediaEntityType) {
  switch (type) {
    case 'organization':
      return Building2;
    case 'executive':
      return User;
    case 'journalist':
      return Mic;
    default:
      return Building2;
  }
}

function getEntityLabel(type: MediaEntityType) {
  switch (type) {
    case 'organization':
      return 'Media Organization';
    case 'executive':
      return 'Media Executive';
    case 'journalist':
      return 'Journalist';
    default:
      return 'Media Entity';
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

export function MediaCard({ item, onRemove }: MediaCardProps) {
  const Icon = getEntityIcon(item.entityType);
  const label = getEntityLabel(item.entityType);

  return (
    <div className="relative w-full max-w-[280px] mx-auto rounded-xl border-4 border-slate-500 bg-card shadow-xl overflow-hidden transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
      {/* Header with name */}
      <div className="bg-slate-700 py-3 px-4 text-center">
        <h3 className="text-white font-bold text-lg font-serif truncate">{item.name}</h3>
      </div>

      {/* Logo/Image area */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Logo or initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          {item.logoUrl ? (
            <img
              src={item.logoUrl}
              alt={item.name}
              className="w-40 h-40 object-contain rounded-lg bg-white/10 p-2 border-2 border-white/30 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-40 h-40 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-4xl font-bold font-serif text-white border-2 border-white/30 ${item.logoUrl ? 'hidden' : ''}`}>
            {getInitials(item.name)}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="bg-slate-600 py-3 px-4">
        <p className="text-white font-semibold text-center text-sm flex items-center justify-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </p>
        <p className="text-white/80 text-center text-xs">
          {item.parentCompany || item.headquarters || 'United States'}
        </p>
      </div>

      {/* Footer with type badge and stats */}
      <div className="bg-white/90 py-3 px-4 flex items-center justify-between">
        {/* Type badge */}
        <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>

        {/* Stats or year */}
        <div className="text-right">
          {item.foundedYear && (
            <span className="text-xs text-gray-600">Est. {item.foundedYear}</span>
          )}
          {item.reach && (
            <span className="text-xs text-gray-600 ml-2">{item.reach}</span>
          )}
        </div>
      </div>

      {/* View Profile overlay on click */}
      <Link
        to={`/media/${item.id}`}
        className="absolute inset-0 z-10"
        title="View Profile"
      />

      {/* Remove button needs to be above the link */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute bottom-3 right-4 z-20 text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
