import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, User, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { RosterEntity, EntityDetailResponse, Bill } from '@/lib/schemas';

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

export default function OfficialProfile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get entity from navigation state or fetch it
  const passedEntity = location.state?.entity as RosterEntity | undefined;
  
  const [entity, setEntity] = useState<RosterEntity | null>(passedEntity || null);
  const [details, setDetails] = useState<EntityDetailResponse | null>(null);
  const [loading, setLoading] = useState(!!passedEntity?.bioguideId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      if (!entity?.bioguideId) return;

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase.functions.invoke('entity-data', {
          body: null,
          headers: {},
        });

        // Use query params approach
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/entity-data?bioguide=${entity.bioguideId}&name=${encodeURIComponent(entity.name)}&state=${entity.state}`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch details');
        
        const detailData = await response.json();
        setDetails(detailData);
      } catch (err) {
        console.error('Error fetching entity details:', err);
        setError('Could not load additional details');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [entity]);

  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
              Official Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The official you're looking for could not be found.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roster
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = getInitials(entity.name);
  const partyColorClass = getPartyColor(entity.party);
  const ChamberIcon = entity.chamber === 'Federal' ? Building : User;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roster
        </Button>

        {/* Disclosure Banner */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            This profile contains descriptive data derived from public government sources. 
            No endorsement or judgment is expressed.
          </p>
        </div>

        {/* Profile Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Initials Avatar */}
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-muted text-muted-foreground font-serif font-bold text-2xl shrink-0 border border-border">
              {initials}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-serif font-semibold text-foreground mb-2">
                {entity.name}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-4">
                {entity.role}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-sm">
                  <ChamberIcon className="h-4 w-4 mr-1" />
                  {entity.chamber}
                </Badge>
                <Badge variant="outline" className={`text-sm border ${partyColorClass}`}>
                  {entity.party}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {entity.state}{entity.district ? `-${entity.district}` : ''}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Source: {entity.source === 'congress' ? 'Congress.gov' : 'OpenStates'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State for Details */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading additional details...</span>
          </div>
        )}

        {/* Sponsored Legislation */}
        {details?.bills && details.bills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Sponsored Legislation
            </h2>
            <div className="space-y-3">
              {details.bills.slice(0, 10).map((bill: Bill, index: number) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {bill.type} {bill.number}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bill.title}
                      </p>
                      {bill.latestAction && (
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          Latest: {bill.latestAction.text} ({bill.latestAction.actionDate})
                        </p>
                      )}
                    </div>
                    {bill.url && (
                      <a 
                        href={bill.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FEC Funding Data */}
        {details?.funding && (
          <section className="mb-8">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              Campaign Finance
            </h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground">
                FEC Candidate ID: {details.funding.candidate_id}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Source: Federal Election Commission
              </p>
            </div>
          </section>
        )}

        {/* Source Attribution */}
        <section className="border-t border-border pt-8 mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Data Sources
          </h3>
          <div className="flex flex-wrap gap-2">
            <a 
              href="https://www.congress.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Congress.gov <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="https://openstates.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              OpenStates <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="https://www.fec.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              FEC.gov <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
