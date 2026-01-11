import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useInterests } from '@/hooks/useInterests';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, Heart } from 'lucide-react';

// Lazy load Spline to prevent crashes
const Spline = lazy(() => import('@splinetool/react-spline'));

function getPartyColor(party?: string | null): string {
  if (!party) return 'border-gray-300 bg-white/90';
  const p = party.toLowerCase();
  if (p.includes('republican') || p === 'r') return 'border-red-400 bg-red-50/90';
  if (p.includes('democrat') || p === 'd') return 'border-blue-400 bg-blue-50/90';
  if (p.includes('independent') || p === 'i') return 'border-purple-400 bg-purple-50/90';
  return 'border-gray-300 bg-white/90';
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

export default function InterestsPage() {
  const { items, remove, isLoaded } = useInterests();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">
        {/* Spline Background Layer - full coverage */}
        <div className="absolute inset-0 z-0 bg-black">
          <Suspense fallback={
            <div className="w-full h-full bg-gradient-to-br from-civic-navy via-civic-slate to-civic-navy" />
          }>
            <Spline 
              scene="https://prod.spline.design/nRGcGcylZYBvn8YY/scene.splinecode" 
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </div>

        {/* Content floating above Spline */}
        <div className="relative z-10 container py-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roster
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-patriotic-red fill-patriotic-red" />
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-white drop-shadow-lg">
              Your Interests
            </h1>
          </div>

          {!isLoaded ? (
            <div className="text-white/80">Loading...</div>
          ) : items.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 text-center max-w-md mx-auto shadow-lg">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                No saved profiles yet
              </h2>
              <p className="text-muted-foreground mb-4">
                Browse the roster and add officials to your interests to track them here.
              </p>
              <Button asChild>
                <Link to="/">Browse Roster</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-lg border-2 p-4 backdrop-blur-sm shadow-lg transition-transform hover:scale-105 ${getPartyColor(item.party)}`}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                    title="Remove from interests"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Photo or initials */}
                  <div className="flex justify-center mb-3">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold font-serif text-muted-foreground ${item.photoUrl ? 'hidden' : ''}`}>
                      {getInitials(item.name)}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-center font-semibold font-serif text-foreground mb-1 truncate">
                    {item.name}
                  </h3>

                  {/* Role/Type */}
                  {item.role && (
                    <p className="text-center text-xs text-muted-foreground mb-1 truncate">
                      {item.role}
                    </p>
                  )}

                  {/* Jurisdiction/State */}
                  <p className="text-center text-xs text-muted-foreground">
                    {item.jurisdiction || item.state || item.entityType}
                  </p>

                  {/* View profile link */}
                  <Link
                    to={`/official/${item.id}`}
                    className="block text-center text-xs text-primary hover:underline mt-3"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
