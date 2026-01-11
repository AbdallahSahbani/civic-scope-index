import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface InterestCardProps {
  item: {
    id: string;
    name: string;
    role?: string;
    party?: string | null;
    state?: string;
    jurisdiction?: string;
    photoUrl?: string;
    entityType?: string;
  };
  onRemove: (id: string) => void;
}

function getPartyStyles(party?: string | null) {
  if (!party) return { border: 'border-gray-400', bg: 'bg-gray-500', header: 'bg-gray-600', text: 'I' };
  const p = party.toLowerCase();
  if (p.includes('republican') || p === 'r') return { border: 'border-red-500', bg: 'bg-red-600', header: 'bg-red-700', text: 'R' };
  if (p.includes('democrat') || p === 'd') return { border: 'border-blue-500', bg: 'bg-blue-600', header: 'bg-blue-700', text: 'D' };
  if (p.includes('independent') || p === 'i') return { border: 'border-gray-400', bg: 'bg-gray-500', header: 'bg-gray-600', text: 'I' };
  return { border: 'border-gray-400', bg: 'bg-gray-500', header: 'bg-gray-600', text: 'I' };
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

export function InterestCard({ item, onRemove }: InterestCardProps) {
  const partyStyles = getPartyStyles(item.party);

  return (
    <div className={`relative w-64 rounded-xl border-4 ${partyStyles.border} bg-white/95 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300`}>
      {/* Header with name */}
      <div className={`${partyStyles.header} py-3 px-4 text-center`}>
        <h3 className="text-white font-bold text-lg font-serif truncate">{item.name}</h3>
      </div>

      {/* Photo area with flag background */}
      <div className="relative h-48 bg-gradient-to-br from-red-900 via-blue-900 to-red-900 overflow-hidden">
        {/* American flag pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-blue-800" />
          {[...Array(13)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-full h-[7.7%] ${i % 2 === 0 ? 'bg-red-600' : 'bg-white'}`}
              style={{ top: `${i * 7.69}%` }}
            />
          ))}
        </div>

        {/* Photo or initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.name}
              className="w-40 h-40 object-cover rounded-lg border-2 border-white/50 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-40 h-40 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-4xl font-bold font-serif text-white border-2 border-white/50 ${item.photoUrl ? 'hidden' : ''}`}>
            {getInitials(item.name)}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className={`${partyStyles.bg} py-3 px-4`}>
        <p className="text-white font-semibold text-center text-sm">
          {item.role || item.entityType || 'Official'}
        </p>
        <p className="text-white/80 text-center text-xs">
          {item.jurisdiction || item.state || 'United States'}
        </p>
      </div>

      {/* Footer with party badge and remove */}
      <div className="bg-white/90 py-3 px-4 flex items-center justify-between">
        {/* Party badge */}
        <div className={`w-8 h-8 rounded-full ${partyStyles.bg} flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">{partyStyles.text}</span>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-500 hover:text-red-500 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* View Profile overlay on click */}
      <Link
        to={`/official/${item.id}`}
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
