import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar,
  User,
  Radio,
  Share2,
  Mic,
  Monitor,
  TrendingUp,
  Briefcase,
  CreditCard,
  PiggyBank,
  Receipt,
  Loader2
} from 'lucide-react';
import { useMediaWatch } from '@/hooks/useMediaWatch';
import { 
  useMediaEntity, 
  useMediaEntityFilings, 
  useMediaEntityLegalRecords, 
  useMediaEntityAffiliations,
  useMediaEntitySources,
  useMediaEntityPlatforms
} from '@/hooks/useMediaEntities';
import { 
  ENTITY_TYPE_LABELS, 
  PLATFORM_LABELS, 
  AUDIENCE_BAND_LABELS,
  DECLARED_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
  type MediaPlatform
} from '@/lib/mediaTypes';

function getEntityIcon(type: string) {
  switch (type) {
    case 'CORPORATE_MEDIA': return Building2;
    case 'INDEPENDENT_FIGURE': return User;
    case 'HYBRID': return Users;
    default: return Tv;
  }
}

function getPlatformIcon(platform: MediaPlatform) {
  switch (platform) {
    case 'TV': return Tv;
    case 'RADIO': return Radio;
    case 'PODCAST': return Mic;
    case 'DIGITAL': return Monitor;
    case 'SOCIAL': return Share2;
    default: return Globe;
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

export default function MediaProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { add, remove, has } = useMediaWatch();
  
  const { data: entity, isLoading: entityLoading } = useMediaEntity(id);
  const { data: filings = [] } = useMediaEntityFilings(id);
  const { data: legalRecords = [] } = useMediaEntityLegalRecords(id);
  const { data: affiliations } = useMediaEntityAffiliations(id);
  const { data: entitySources = [] } = useMediaEntitySources(id);
  const { data: platforms = [] } = useMediaEntityPlatforms(id);
  
  const isSaved = id ? has(id) : false;

  const handleToggleSave = () => {
    if (!id || !entity) return;
    if (isSaved) {
      remove(id);
    } else {
      add({
        id,
        name: entity.name,
        entityType: entity.entity_type === 'CORPORATE_MEDIA' ? 'organization' : 
                    entity.entity_type === 'INDEPENDENT_FIGURE' ? 'journalist' : 'organization',
        logoUrl: entity.logo_url,
        parentCompany: entity.parent_company,
        headquarters: entity.headquarters_city && entity.headquarters_state 
          ? `${entity.headquarters_city}, ${entity.headquarters_state}` 
          : entity.headquarters_city || entity.headquarters_state,
      });
    }
  };

  // Loading state
  if (entityLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  // Entity not found
  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <Link to="/media-watch" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Media Watch
          </Link>
          
          <div className="bg-card border border-border rounded-xl p-8 text-center max-w-2xl mx-auto">
            <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold mb-4">Media Entity Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The media entity you're looking for doesn't exist or may have been removed.
            </p>
            <Button asChild variant="secondary">
              <Link to="/media-watch">Back to Media Watch</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const EntityIcon = getEntityIcon(entity.entity_type);

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
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              {entity.logo_url ? (
                <img 
                  src={entity.logo_url} 
                  alt={entity.name} 
                  className="w-24 h-24 object-cover rounded-xl bg-muted border border-border" 
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
                  <span className="text-3xl font-bold text-foreground">{getInitials(entity.name)}</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {ENTITY_TYPE_LABELS[entity.entity_type] || entity.entity_type}
                  </Badge>
                  {entity.declared_role && (
                    <Badge variant="outline" className="text-xs">
                      {DECLARED_ROLE_LABELS[entity.declared_role] || entity.declared_role}
                    </Badge>
                  )}
                  {entity.active_status ? (
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-serif font-bold text-foreground">{entity.name}</h1>
                {entity.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">{entity.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {entity.headquarters_city && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {entity.headquarters_city}{entity.headquarters_state ? `, ${entity.headquarters_state}` : ''}
                    </span>
                  )}
                  {entity.audience_size_band && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {AUDIENCE_BAND_LABELS[entity.audience_size_band]} reach
                    </span>
                  )}
                </div>
                
                {/* Platforms */}
                {entity.primary_platforms && entity.primary_platforms.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    {entity.primary_platforms.map((platform) => {
                      const Icon = getPlatformIcon(platform);
                      return (
                        <div key={platform} className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                          <Icon className="h-3 w-3" />
                          {PLATFORM_LABELS[platform] || platform}
                        </div>
                      );
                    })}
                  </div>
                )}
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

        {/* Tabs for different sections */}
        <Tabs defaultValue="finances" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="finances">Finances & Monetization</TabsTrigger>
            <TabsTrigger value="affiliations">Affiliations</TabsTrigger>
            <TabsTrigger value="legal">Legal Records</TabsTrigger>
            <TabsTrigger value="filings">Public Filings</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          {/* Finances Tab */}
          <TabsContent value="finances" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Monetization Methods */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Revenue Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {entity.monetization_methods && entity.monetization_methods.length > 0 ? (
                    <div className="space-y-2">
                      {entity.monetization_methods.map((method, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{method}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No monetization data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Band */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PiggyBank className="h-5 w-5 text-blue-500" />
                    Revenue Scale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {entity.revenue_band ? (
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-foreground">
                        {entity.revenue_band === 'UNDER_100M' && 'Under $100M'}
                        {entity.revenue_band === 'BETWEEN_100M_1B' && '$100M - $1B'}
                        {entity.revenue_band === 'OVER_1B' && 'Over $1B'}
                      </div>
                      <p className="text-sm text-muted-foreground">Annual revenue estimate</p>
                    </div>
                  ) : entity.audience_size_band ? (
                    <div className="space-y-3">
                      <div className="text-xl font-semibold text-foreground">
                        {AUDIENCE_BAND_LABELS[entity.audience_size_band]}
                      </div>
                      <p className="text-sm text-muted-foreground">Estimated audience reach</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Financial data not available</p>
                  )}
                </CardContent>
              </Card>

              {/* Business Entity */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                    Business Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entity.business_entity && entity.business_entity !== 'UNKNOWN' ? (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {entity.business_entity}
                      </Badge>
                    ) : entity.ownership_type ? (
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {entity.ownership_type === 'PUBLIC' ? 'Publicly Traded' :
                         entity.ownership_type === 'PRIVATE' ? 'Private' : 'Subsidiary'}
                      </Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground">Structure not disclosed</p>
                    )}
                    {entity.legal_name && (
                      <p className="text-sm text-muted-foreground">
                        Legal name: {entity.legal_name}
                      </p>
                    )}
                    {entity.parent_company && (
                      <p className="text-sm text-muted-foreground">
                        Parent: {entity.parent_company}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FEC/SEC Identifiers */}
            {(entity.sec_cik || entity.fcc_license_id) && (
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-5 w-5 text-orange-500" />
                    Regulatory Identifiers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entity.sec_cik && (
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">SEC CIK</p>
                        <a 
                          href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${entity.sec_cik}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
                        >
                          {entity.sec_cik}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {entity.fcc_license_id && (
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">FCC License</p>
                        <span className="text-sm font-mono">{entity.fcc_license_id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Affiliations Tab */}
          <TabsContent value="affiliations" className="space-y-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Professional Affiliations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {affiliations && !Array.isArray(affiliations) && (affiliations.asEmployee.length > 0 || affiliations.asEmployer.length > 0) ? (
                  <div className="space-y-6">
                    {affiliations.asEmployee.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Organizations</h4>
                        <div className="space-y-2">
                          {affiliations.asEmployee.map((aff: any) => (
                            <div key={aff.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                              <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{aff.organization?.name || 'Unknown Organization'}</span>
                              </div>
                              <Badge variant="outline">{aff.relationship_type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {affiliations.asEmployer.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Associated People</h4>
                        <div className="space-y-2">
                          {affiliations.asEmployer.map((aff: any) => (
                            <div key={aff.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{aff.person?.name || 'Unknown Person'}</span>
                              </div>
                              <Badge variant="outline">{aff.relationship_type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No documented affiliations on record.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Records Tab */}
          <TabsContent value="legal" className="space-y-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Legal & Regulatory Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {legalRecords.length > 0 ? (
                  <div className="space-y-3">
                    {legalRecords.map((record: any) => (
                      <div key={record.id} className="p-4 bg-muted/50 rounded border border-border/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{record.record_type}</p>
                            {record.court_name && (
                              <p className="text-sm text-muted-foreground">{record.court_name}</p>
                            )}
                            {record.jurisdiction && (
                              <p className="text-xs text-muted-foreground mt-1">{record.jurisdiction}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {record.record_date && (
                              <p className="text-sm text-muted-foreground">
                                {new Date(record.record_date).toLocaleDateString()}
                              </p>
                            )}
                            {record.record_url && (
                              <a 
                                href={record.record_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                View Record <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No legal records on file.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Public Filings Tab */}
          <TabsContent value="filings" className="space-y-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Public Filings (SEC/FEC/IRS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filings.length > 0 ? (
                  <div className="space-y-3">
                    {filings.map((filing: any) => (
                      <div key={filing.id} className="p-4 bg-muted/50 rounded border border-border/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">{filing.filing_type}</Badge>
                            {filing.description && (
                              <p className="text-sm">{filing.description}</p>
                            )}
                            {filing.filing_id && (
                              <p className="text-xs text-muted-foreground mt-1">ID: {filing.filing_id}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {filing.filing_date && (
                              <p className="text-sm text-muted-foreground">
                                {new Date(filing.filing_date).toLocaleDateString()}
                              </p>
                            )}
                            {filing.filing_url && (
                              <a 
                                href={filing.filing_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                View Filing <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No public filings on record.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entitySources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {entitySources.map((entitySource: any) => {
                      const source = entitySource.source;
                      if (!source) return null;
                      return (
                        <a
                          key={entitySource.id}
                          href={source.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded border border-border/50 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex-1">
                            <Badge variant="outline" className="text-xs mb-1">
                              {SOURCE_TYPE_LABELS[source.source_type as keyof typeof SOURCE_TYPE_LABELS] || source.source_type}
                            </Badge>
                            <p className="text-sm font-medium">{source.source_title || source.source_url}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Retrieved: {new Date(source.retrieved_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm mb-2">No external sources linked yet.</p>
                    <p className="text-xs text-muted-foreground">
                      Sources may include: SEC EDGAR, FEC.gov, IRS Form 990, CourtListener
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}