import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatDrawer } from '@/components/ChatDrawer';
import { InterestMatcher } from '@/components/InterestMatcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Building, 
  User, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  FileText,
  Vote,
  DollarSign,
  Quote
} from 'lucide-react';
import { RosterEntity } from '@/lib/schemas';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface EntityDetails {
  member: any;
  bills: any[];
  votes: any[];
  funding: any;
  quotes: any[];
  sources: string[];
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

export default function OfficialProfile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const passedEntity = location.state?.entity as RosterEntity | undefined;
  
  const [entity, setEntity] = useState<RosterEntity | null>(passedEntity || null);
  const [details, setDetails] = useState<EntityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Build context string for the AI chat from all fetched data
  const contextData = useMemo(() => {
    if (!details || !entity) return '';

    const parts: string[] = [];

    // Member info
    if (details.member) {
      parts.push(`MEMBER INFORMATION:`);
      parts.push(`Name: ${entity.name}`);
      parts.push(`Role: ${entity.role}`);
      parts.push(`Party: ${entity.party}`);
      parts.push(`State: ${entity.state}${entity.district ? `, District ${entity.district}` : ''}`);
      parts.push(`Chamber: ${entity.chamber}`);
      if (details.member.birthYear) parts.push(`Birth Year: ${details.member.birthYear}`);
      parts.push('');
    }

    // Bills
    if (details.bills.length > 0) {
      parts.push(`SPONSORED LEGISLATION (${details.bills.length} bills):`);
      details.bills.slice(0, 15).forEach((bill: any) => {
        parts.push(`- ${bill.type}${bill.number}: ${bill.title}`);
        if (bill.latestAction) {
          parts.push(`  Latest Action: ${bill.latestAction.text} (${bill.latestAction.actionDate})`);
        }
      });
      parts.push('');
    }

    // Votes/Cosponsored
    if (details.votes.length > 0) {
      parts.push(`COSPONSORED LEGISLATION (${details.votes.length} items):`);
      details.votes.slice(0, 10).forEach((vote: any) => {
        parts.push(`- ${vote.billNumber}: ${vote.title}`);
      });
      parts.push('');
    }

    // Funding - Enhanced FEC data with financial totals
    if (details.funding) {
      parts.push(`FEC CAMPAIGN FINANCE DATA:`);
      parts.push(`FEC Candidate ID: ${details.funding.candidate_id}`);
      parts.push(`Office: ${details.funding.office || details.funding.office_code}`);
      parts.push(`Party: ${details.funding.party || 'N/A'}`);
      if (details.funding.incumbent_challenge) {
        parts.push(`Status: ${details.funding.incumbent_challenge}`);
      }
      if (details.funding.cycles) {
        parts.push(`Election Cycles: ${Array.isArray(details.funding.cycles) ? details.funding.cycles.join(', ') : details.funding.cycles}`);
      }
      if (details.funding.cycle) {
        parts.push(`Most Recent Cycle: ${details.funding.cycle}`);
      }
      // Financial totals
      if (details.funding.receipts) {
        parts.push(`Total Receipts: $${Number(details.funding.receipts).toLocaleString()}`);
      }
      if (details.funding.disbursements) {
        parts.push(`Total Disbursements: $${Number(details.funding.disbursements).toLocaleString()}`);
      }
      if (details.funding.cash_on_hand) {
        parts.push(`Cash on Hand: $${Number(details.funding.cash_on_hand).toLocaleString()}`);
      }
      if (details.funding.individual_contributions) {
        parts.push(`Individual Contributions: $${Number(details.funding.individual_contributions).toLocaleString()}`);
      }
      if (details.funding.pac_contributions) {
        parts.push(`PAC Contributions: $${Number(details.funding.pac_contributions).toLocaleString()}`);
      }
      if (details.funding.party_contributions) {
        parts.push(`Party Contributions: $${Number(details.funding.party_contributions).toLocaleString()}`);
      }
      if (details.funding.debts) {
        parts.push(`Debts Owed: $${Number(details.funding.debts).toLocaleString()}`);
      }
      if (details.funding.coverage_start_date || details.funding.coverage_end_date) {
        parts.push(`Reporting Period: ${details.funding.coverage_start_date || 'N/A'} to ${details.funding.coverage_end_date || 'N/A'}`);
      }
      parts.push('');
    }

    // Quotes
    if (details.quotes.length > 0) {
      parts.push(`CONGRESSIONAL RECORD APPEARANCES (${details.quotes.length} records):`);
      details.quotes.slice(0, 5).forEach((quote: any) => {
        parts.push(`- ${quote.title} (${quote.dateIssued})`);
      });
      parts.push('');
    }

    parts.push(`DATA SOURCES: ${details.sources.join(', ')}`);

    return parts.join('\n');
  }, [details, entity]);

  useEffect(() => {
    async function fetchDetails() {
      if (!entity?.bioguideId && !id) {
        setLoading(false);
        return;
      }

      const bioguide = entity?.bioguideId || id;

      try {
        // Pass chamber info for correct FEC office resolution (H for House, S for Senate)
        const chamber = entity?.role?.toLowerCase().includes('representative') ? 'House' : 'Senate';
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/entity-data?bioguide=${bioguide}&name=${encodeURIComponent(entity?.name || '')}&state=${entity?.state || ''}&chamber=${chamber}`,
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
        setError('Could not load official details');
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [entity, id]);

  if (!entity && !loading) {
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

  const initials = entity ? getInitials(entity.name) : '';
  const partyColorClass = entity ? getPartyColor(entity.party) : '';
  const ChamberIcon = entity?.chamber === 'Federal' ? Building : User;

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
            This profile contains descriptive metrics derived from public data. 
            No endorsement or judgment is expressed.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading official profile...</span>
          </div>
        ) : entity && (
          <>
            {/* Profile Header */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex items-start gap-6">
                {/* Photo Avatar with Initials Fallback */}
                <div className="relative h-20 w-20 rounded-full bg-muted shrink-0 border border-border overflow-hidden">
                  {(entity.photoUrl || details?.member?.depiction?.imageUrl) ? (
                    <img 
                      src={entity.photoUrl || details?.member?.depiction?.imageUrl} 
                      alt={`Official portrait of ${entity.name}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground font-serif font-bold text-2xl ${(entity.photoUrl || details?.member?.depiction?.imageUrl) ? 'hidden' : ''}`}>
                    {initials}
                  </div>
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

            {/* Error State */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Failed to load details</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}

            {details && (
              <div className="space-y-8">
                {/* Data Sections in Accordion */}
                <Accordion type="multiple" defaultValue={['bills', 'votes']} className="space-y-4">
                  {/* Sponsored Bills */}
                  <AccordionItem value="bills" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Sponsored Legislation</span>
                        <Badge variant="secondary" className="ml-2">
                          {details.bills.length} bills
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {details.bills.length > 0 ? (
                        <div className="space-y-3 pt-2">
                          {details.bills.slice(0, 10).map((bill: any, i: number) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium text-foreground text-sm">
                                    {bill.type}{bill.number}
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
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No sponsored legislation data available.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cosponsored/Votes */}
                  <AccordionItem value="votes" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Vote className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Cosponsored Legislation</span>
                        <Badge variant="secondary" className="ml-2">
                          {details.votes.length} items
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {details.votes.length > 0 ? (
                        <div className="space-y-3 pt-2">
                          {details.votes.slice(0, 10).map((vote: any, i: number) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium text-foreground text-sm">
                                    {vote.billNumber}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {vote.title}
                                  </p>
                                </div>
                                {vote.url && (
                                  <a
                                    href={vote.url}
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
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No cosponsored legislation data available.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* FEC Funding */}
                  <AccordionItem value="funding" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Campaign Finance</span>
                        <Badge variant="secondary" className="ml-2">FEC</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {details.funding ? (
                        <div className="bg-muted/50 rounded-lg p-4 mt-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">FEC Candidate ID</p>
                              <p className="font-medium text-foreground">{details.funding.candidate_id}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Office</p>
                              <p className="font-medium text-foreground">{details.funding.office || details.funding.office_code || 'N/A'}</p>
                            </div>
                            {details.funding.incumbent_challenge && (
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <p className="font-medium text-foreground">{details.funding.incumbent_challenge}</p>
                              </div>
                            )}
                            {details.funding.cycle && (
                              <div>
                                <p className="text-muted-foreground">Cycle</p>
                                <p className="font-medium text-foreground">{details.funding.cycle}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Financial Totals */}
                          {(details.funding.receipts || details.funding.disbursements || details.funding.cash_on_hand) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Financial Summary</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                {details.funding.receipts && (
                                  <div>
                                    <p className="text-muted-foreground">Total Receipts</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.receipts).toLocaleString()}</p>
                                  </div>
                                )}
                                {details.funding.disbursements && (
                                  <div>
                                    <p className="text-muted-foreground">Disbursements</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.disbursements).toLocaleString()}</p>
                                  </div>
                                )}
                                {details.funding.cash_on_hand && (
                                  <div>
                                    <p className="text-muted-foreground">Cash on Hand</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.cash_on_hand).toLocaleString()}</p>
                                  </div>
                                )}
                                {details.funding.individual_contributions && (
                                  <div>
                                    <p className="text-muted-foreground">Individual Contributions</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.individual_contributions).toLocaleString()}</p>
                                  </div>
                                )}
                                {details.funding.pac_contributions && (
                                  <div>
                                    <p className="text-muted-foreground">PAC Contributions</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.pac_contributions).toLocaleString()}</p>
                                  </div>
                                )}
                                {details.funding.party_contributions && (
                                  <div>
                                    <p className="text-muted-foreground">Party Contributions</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.party_contributions).toLocaleString()}</p>
                                  </div>
                                )}
                                {details.funding.debts && Number(details.funding.debts) > 0 && (
                                  <div>
                                    <p className="text-muted-foreground">Debts Owed</p>
                                    <p className="font-medium text-foreground">${Number(details.funding.debts).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                              {details.funding.coverage_end_date && (
                                <p className="text-xs text-muted-foreground/70 mt-3">
                                  Data as of {details.funding.coverage_end_date}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {details.funding.cycles && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-muted-foreground text-sm">Election Cycles</p>
                              <p className="font-medium text-foreground text-sm">
                                {Array.isArray(details.funding.cycles) ? details.funding.cycles.slice(0, 5).join(', ') : details.funding.cycles}
                              </p>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground/70 mt-3">
                            Source: Federal Election Commission (fec.gov)
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No FEC campaign finance data available for this official.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Congressional Record Quotes */}
                  <AccordionItem value="quotes" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Quote className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Congressional Record</span>
                        <Badge variant="secondary" className="ml-2">
                          {details.quotes.length} records
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {details.quotes.length > 0 ? (
                        <div className="space-y-3 pt-2">
                          {details.quotes.slice(0, 5).map((quote: any, i: number) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-medium text-foreground text-sm">
                                    {quote.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {quote.dateIssued}
                                  </p>
                                </div>
                                {quote.url && (
                                  <a
                                    href={quote.url}
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
                          <p className="text-xs text-muted-foreground/70 pt-2">
                            Source: GovInfo Congressional Record (govinfo.gov)
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No Congressional Record appearances found.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Interest Matcher */}
                <InterestMatcher 
                  entityName={entity.name}
                  bills={details.bills}
                  votes={details.votes}
                />

                {/* Source Attribution */}
                <section className="border-t border-border pt-8">
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
                      href="https://www.fec.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      FEC.gov <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a 
                      href="https://www.govinfo.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      GovInfo.gov <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </section>
              </div>
            )}

            {/* Chat Drawer */}
            {entity && contextData && (
              <ChatDrawer
                entityId={entity.id}
                entityName={entity.name}
                contextData={contextData}
                isOpen={chatOpen}
                onOpenChange={setChatOpen}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
