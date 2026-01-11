import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Scale, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  Heart,
  HeartOff,
  Tv,
  Globe,
  Calendar
} from 'lucide-react';
import { useMediaWatch, MediaWatchEntity } from '@/hooks/useMediaWatch';

// Placeholder data structure - will be fetched from edge function in production
const mockMediaData: Record<string, MediaWatchEntity & {
  description?: string;
  website?: string;
  ownership?: string;
  leadership?: { name: string; role: string }[];
  revenueModel?: string;
  politicalDonations?: string;
  legalActions?: { title: string; date: string; status: string }[];
  flagshipContent?: string[];
  sources?: { title: string; url: string }[];
}> = {};

export default function MediaProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { add, remove, has } = useMediaWatch();
  
  // In production, this would fetch from an edge function
  const entity = id ? mockMediaData[id] : null;
  const isSaved = id ? has(id) : false;

  const handleToggleSave = () => {
    if (!id) return;
    if (isSaved) {
      remove(id);
    } else {
      add({
        id,
        name: entity?.name || 'Unknown Entity',
        entityType: entity?.entityType || 'organization',
        logoUrl: entity?.logoUrl,
        parentCompany: entity?.parentCompany,
        foundedYear: entity?.foundedYear,
        headquarters: entity?.headquarters,
        reach: entity?.reach,
      });
    }
  };

  // Show placeholder for now since we don't have real data yet
  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <Link to="/media-watch" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Media Watch
          </Link>
          
          <div className="glass-card rounded-xl p-8 text-center max-w-2xl mx-auto">
            <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold mb-4">Media Profile Coming Soon</h1>
            <p className="text-muted-foreground mb-6">
              Media entity profiles are under development. This feature will include ownership structure, 
              leadership, financial context, legal actions, and influential content — all sourced from 
              public records (SEC, FEC, court filings).
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <Badge variant="outline">SEC EDGAR</Badge>
              <Badge variant="outline">FEC Records</Badge>
              <Badge variant="outline">Court Filings</Badge>
              <Badge variant="outline">Wikidata</Badge>
              <Badge variant="outline">ProPublica 990s</Badge>
            </div>
            <Button asChild variant="secondary">
              <Link to="/media-watch">Back to Media Watch</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        {/* Back link */}
        <Link to="/media-watch" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Media Watch
        </Link>

        {/* Identity Header */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {entity.logoUrl ? (
                <img src={entity.logoUrl} alt={entity.name} className="w-24 h-24 object-contain rounded-lg bg-white/10" />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-slate-600 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
              )}
              <div>
                <Badge variant="secondary" className="mb-2">
                  {entity.entityType === 'organization' ? 'Media Organization' : 
                   entity.entityType === 'executive' ? 'Media Executive' : 'Journalist'}
                </Badge>
                <h1 className="text-3xl font-serif font-bold">{entity.name}</h1>
                {entity.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">{entity.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {entity.foundedYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Est. {entity.foundedYear}
                    </span>
                  )}
                  {entity.headquarters && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {entity.headquarters}
                    </span>
                  )}
                  {entity.website && (
                    <a href={entity.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant={isSaved ? "destructive" : "default"}
              onClick={handleToggleSave}
              className="shrink-0"
            >
              {isSaved ? (
                <>
                  <HeartOff className="h-4 w-4 mr-2" />
                  Remove from Watch
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Watch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leadership & Ownership */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leadership & Ownership
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.ownership && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Ownership Structure</p>
                  <p>{entity.ownership}</p>
                </div>
              )}
              {entity.leadership && entity.leadership.length > 0 ? (
                <div className="space-y-2">
                  {entity.leadership.map((person, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <span className="font-medium">{person.name}</span>
                      <Badge variant="outline">{person.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Leadership data not yet available.</p>
              )}
            </CardContent>
          </Card>

          {/* Financial & Funding */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial & Funding Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.revenueModel && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Revenue Model</p>
                  <p>{entity.revenueModel}</p>
                </div>
              )}
              {entity.politicalDonations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Political Donations</p>
                  <p>{entity.politicalDonations}</p>
                </div>
              )}
              {!entity.revenueModel && !entity.politicalDonations && (
                <p className="text-muted-foreground text-sm">Financial data not yet available.</p>
              )}
            </CardContent>
          </Card>

          {/* Legal Context */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Legal & Regulatory Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.legalActions && entity.legalActions.length > 0 ? (
                <div className="space-y-3">
                  {entity.legalActions.map((action, i) => (
                    <div key={i} className="py-2 border-b border-border/50 last:border-0">
                      <p className="font-medium">{action.title}</p>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{action.date}</span>
                        <Badge variant="outline">{action.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No legal actions on record.</p>
              )}
            </CardContent>
          </Card>

          {/* Influential Content */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Influential Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entity.flagshipContent && entity.flagshipContent.length > 0 ? (
                <ul className="space-y-2">
                  {entity.flagshipContent.map((content, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{content}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Content data not yet available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sources Panel */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entity.sources && entity.sources.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {entity.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {source.title}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sources will include: SEC EDGAR, FEC records, CourtListener, Wikidata, ProPublica Nonprofit Explorer
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
