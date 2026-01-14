import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Building2, User, Mic, ExternalLink, Calendar, MapPin, Heart, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { MediaEntity } from '@/lib/mediaTypes';
import { 
  ENTITY_TYPE_LABELS, 
  PLATFORM_LABELS, 
  OWNERSHIP_TYPE_LABELS,
  DECLARED_SCOPE_LABELS,
  DECLARED_ROLE_LABELS,
  REVENUE_BAND_LABELS,
  AUDIENCE_BAND_LABELS,
} from '@/lib/mediaTypes';
import { useMediaWatch } from '@/hooks/useMediaWatch';
import { 
  useMediaEntityFilings, 
  useMediaEntityLegalRecords,
  useMediaEntityPlatforms,
  useMediaEntityAffiliations,
  useMediaEntitySources 
} from '@/hooks/useMediaEntities';

interface MediaDetailDrawerProps {
  entity: MediaEntity | null;
  open: boolean;
  onClose: () => void;
}

function getEntityIcon(type: string) {
  switch (type) {
    case 'CORPORATE_MEDIA':
      return Building2;
    case 'INDEPENDENT_FIGURE':
      return User;
    case 'HYBRID':
      return Mic;
    default:
      return Building2;
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

export function MediaDetailDrawer({ entity, open, onClose }: MediaDetailDrawerProps) {
  const { add, remove, has } = useMediaWatch();
  const isWatched = entity ? has(entity.id) : false;

  // Fetch related data
  const { data: filings } = useMediaEntityFilings(entity?.id);
  const { data: legalRecords } = useMediaEntityLegalRecords(entity?.id);
  const { data: platforms } = useMediaEntityPlatforms(entity?.id);
  const { data: affiliations } = useMediaEntityAffiliations(entity?.id);
  const { data: sources } = useMediaEntitySources(entity?.id);

  const handleWatchlistToggle = () => {
    if (!entity) return;
    
    if (isWatched) {
      remove(entity.id);
    } else {
      add({
        id: entity.id,
        name: entity.name,
        entityType: entity.entity_type === 'CORPORATE_MEDIA' ? 'organization' : 
                    entity.entity_type === 'INDEPENDENT_FIGURE' ? 'journalist' : 'executive',
        logoUrl: entity.logo_url,
        parentCompany: entity.parent_company,
        headquarters: entity.headquarters_state ? `${entity.headquarters_city || ''}, ${entity.headquarters_state}` : undefined,
      });
    }
  };

  if (!entity) return null;

  const Icon = getEntityIcon(entity.entity_type);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start gap-4">
            {/* Logo/Avatar */}
            {entity.logo_url ? (
              <img 
                src={entity.logo_url} 
                alt={entity.name}
                className="w-16 h-16 rounded-lg object-contain bg-muted"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg initials-avatar text-xl">
                {getInitials(entity.name)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <SheetTitle className="font-serif text-xl text-left">
                {entity.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">
                  <Icon className="h-3 w-3 mr-1" />
                  {ENTITY_TYPE_LABELS[entity.entity_type]}
                </Badge>
                {entity.primary_platforms.slice(0, 2).map((platform) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {PLATFORM_LABELS[platform]}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={isWatched ? 'text-civic-red' : 'text-muted-foreground'}
              onClick={handleWatchlistToggle}
            >
              <Heart className={`h-5 w-5 ${isWatched ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="ownership" className="text-xs">Ownership</TabsTrigger>
            <TabsTrigger value="platforms" className="text-xs">Platforms</TabsTrigger>
            <TabsTrigger value="filings" className="text-xs">Filings</TabsTrigger>
            <TabsTrigger value="legal" className="text-xs">Legal</TabsTrigger>
            <TabsTrigger value="sources" className="text-xs">Sources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {entity.description && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{entity.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {entity.declared_scope && (
                <div className="glass-card rounded-lg p-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Declared Scope</h4>
                  <p className="text-sm font-medium">{DECLARED_SCOPE_LABELS[entity.declared_scope]}</p>
                </div>
              )}
              {entity.declared_role && (
                <div className="glass-card rounded-lg p-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Role</h4>
                  <p className="text-sm font-medium">{DECLARED_ROLE_LABELS[entity.declared_role]}</p>
                </div>
              )}
              {entity.headquarters_state && (
                <div className="glass-card rounded-lg p-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Headquarters</h4>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {entity.headquarters_city && `${entity.headquarters_city}, `}{entity.headquarters_state}
                  </p>
                </div>
              )}
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Status</h4>
                <p className="text-sm font-medium">
                  {entity.active_status ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {entity.last_verified_at && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Last verified: {new Date(entity.last_verified_at).toLocaleDateString()}
              </div>
            )}

            <Button asChild className="w-full mt-4">
              <Link to={`/media/${entity.id}`}>
                View Full Record
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </TabsContent>

          {/* Ownership Tab */}
          <TabsContent value="ownership" className="mt-4 space-y-4">
            {entity.parent_company && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Parent Company</h4>
                <p className="text-sm font-medium">{entity.parent_company}</p>
              </div>
            )}
            {entity.ownership_type && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Ownership Type</h4>
                <p className="text-sm font-medium">{OWNERSHIP_TYPE_LABELS[entity.ownership_type]}</p>
              </div>
            )}
            {entity.revenue_band && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Revenue Band</h4>
                <p className="text-sm font-medium">{REVENUE_BAND_LABELS[entity.revenue_band]}</p>
              </div>
            )}
            {entity.sec_cik && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">SEC CIK</h4>
                <a 
                  href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${entity.sec_cik}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {entity.sec_cik}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Affiliations */}
            {affiliations && 'asEmployee' in affiliations && (affiliations.asEmployee.length > 0 || affiliations.asEmployer.length > 0) && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Affiliations</h4>
                <div className="space-y-2">
                  {affiliations.asEmployee.map((aff: any) => (
                    <div key={aff.id} className="flex items-center justify-between text-sm">
                      <span>{aff.organization?.name}</span>
                      <Badge variant="outline" className="text-xs">{aff.relationship_type}</Badge>
                    </div>
                  ))}
                  {affiliations.asEmployer.map((aff: any) => (
                    <div key={aff.id} className="flex items-center justify-between text-sm">
                      <span>{aff.person?.name}</span>
                      <Badge variant="outline" className="text-xs">{aff.relationship_type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!entity.parent_company && !entity.ownership_type && !(affiliations && 'asEmployee' in affiliations && affiliations.asEmployee.length) && !(affiliations && 'asEmployer' in affiliations && affiliations.asEmployer.length) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No ownership data available
              </p>
            )}
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="mt-4 space-y-4">
            {entity.audience_size_band && (
              <div className="glass-card rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Audience Size</h4>
                <p className="text-sm font-medium">{AUDIENCE_BAND_LABELS[entity.audience_size_band]}</p>
              </div>
            )}

            {platforms && platforms.length > 0 ? (
              <div className="space-y-3">
                {platforms.map((pv: any) => (
                  <div key={pv.id} className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{PLATFORM_LABELS[pv.platform as keyof typeof PLATFORM_LABELS]}</h4>
                        {pv.platform_handle && (
                          <p className="text-xs text-muted-foreground">@{pv.platform_handle}</p>
                        )}
                      </div>
                      {pv.platform_url && (
                        <a 
                          href={pv.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {pv.verified_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Verified: {new Date(pv.verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No platform verification data available
              </p>
            )}
          </TabsContent>

          {/* Filings Tab */}
          <TabsContent value="filings" className="mt-4 space-y-4">
            {filings && filings.length > 0 ? (
              <div className="space-y-3">
                {filings.map((filing: any) => (
                  <div key={filing.id} className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{filing.filing_type}</Badge>
                      {filing.filing_date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(filing.filing_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {filing.description && (
                      <p className="text-sm text-muted-foreground mt-2">{filing.description}</p>
                    )}
                    {filing.filing_url && (
                      <a 
                        href={filing.filing_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        View Source
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No public filings on record
              </p>
            )}
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal" className="mt-4 space-y-4">
            {legalRecords && legalRecords.length > 0 ? (
              <div className="space-y-3">
                {legalRecords.map((record: any) => (
                  <div key={record.id} className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{record.record_type}</Badge>
                      {record.case_exists && (
                        <span className="text-xs text-muted-foreground">Record exists</span>
                      )}
                    </div>
                    {record.jurisdiction && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Jurisdiction: {record.jurisdiction}
                      </p>
                    )}
                    {record.court_name && (
                      <p className="text-sm text-muted-foreground">
                        Court: {record.court_name}
                      </p>
                    )}
                    {record.record_url && (
                      <a 
                        href={record.record_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        View Record
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No legal records on file
              </p>
            )}
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="mt-4 space-y-4">
            <div className="glass-card rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Methodology</h4>
              <p className="text-xs text-muted-foreground">
                All data is sourced from public records including SEC EDGAR, FCC Media Bureau, 
                FEC filings, state business registries, and verified platform APIs. 
                No opinions, rankings, or bias labels are applied.
              </p>
            </div>

            {sources && sources.length > 0 ? (
              <Accordion type="single" collapsible>
                {sources.map((src: any, idx: number) => (
                  <AccordionItem key={src.id} value={`source-${idx}`}>
                    <AccordionTrigger className="text-sm">
                      {src.field_name}: {src.source?.source_type}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        {src.source?.source_url && (
                          <a 
                            href={src.source.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Source
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Retrieved: {new Date(src.source?.retrieved_at).toLocaleDateString()}
                        </p>
                        {src.source?.checksum && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Checksum: {src.source.checksum.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Source documentation available on full record page
              </p>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
