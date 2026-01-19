import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { MediaFilters, MediaEntityType, MediaPlatform, AudienceSizeBand } from '@/lib/mediaTypes';
import { ENTITY_TYPE_LABELS, PLATFORM_LABELS, AUDIENCE_BAND_LABELS } from '@/lib/mediaTypes';

interface MediaFilterPanelProps {
  filters: MediaFilters;
  onFiltersChange: (filters: MediaFilters) => void;
}

export function MediaFilterPanel({ filters, onFiltersChange }: MediaFilterPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    entityType: true,
    platform: true,
    audience: false,
    status: false,
    data: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEntityTypeChange = (type: MediaEntityType, checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, entityType: type });
    } else if (filters.entityType === type) {
      onFiltersChange({ ...filters, entityType: 'all' });
    }
  };

  const handlePlatformChange = (platform: MediaPlatform, checked: boolean) => {
    const newPlatforms = checked
      ? [...filters.platforms, platform]
      : filters.platforms.filter(p => p !== platform);
    onFiltersChange({ ...filters, platforms: newPlatforms });
  };

  const handleAudienceChange = (band: AudienceSizeBand, checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, audienceBand: band });
    } else if (filters.audienceBand === band) {
      onFiltersChange({ ...filters, audienceBand: 'all' });
    }
  };

  const handleStatusChange = (status: 'active' | 'inactive', checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, activeStatus: status });
    } else if (filters.activeStatus === status) {
      onFiltersChange({ ...filters, activeStatus: 'all' });
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({
      entityType: 'all',
      platforms: [],
      audienceBand: 'all',
      revenueBand: 'all',
      activeStatus: 'all',
      hasFilings: null,
      search: '',
    });
  };

  const hasActiveFilters = 
    filters.entityType !== 'all' ||
    filters.platforms.length > 0 ||
    filters.audienceBand !== 'all' ||
    filters.activeStatus !== 'all' ||
    filters.hasFilings !== null ||
    filters.search.length > 0;

  return (
    <div className="filter-panel space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search entities..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearFilters}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}

      {/* Entity Type Filter */}
      <Collapsible open={openSections.entityType} onOpenChange={() => toggleSection('entityType')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground py-2 border-b border-border">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Entity Type
          </span>
          {openSections.entityType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {(Object.entries(ENTITY_TYPE_LABELS) as [MediaEntityType, string][]).map(([type, label]) => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
              <Checkbox
                checked={filters.entityType === type}
                onCheckedChange={(checked) => handleEntityTypeChange(type, checked === true)}
              />
              {label}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Platform Filter */}
      <Collapsible open={openSections.platform} onOpenChange={() => toggleSection('platform')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground py-2 border-b border-border">
          <span>Platform</span>
          {openSections.platform ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {(Object.entries(PLATFORM_LABELS) as [MediaPlatform, string][]).map(([platform, label]) => (
            <label key={platform} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
              <Checkbox
                checked={filters.platforms.includes(platform)}
                onCheckedChange={(checked) => handlePlatformChange(platform, checked === true)}
              />
              {label}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Audience Size Filter */}
      <Collapsible open={openSections.audience} onOpenChange={() => toggleSection('audience')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground py-2 border-b border-border">
          <span>Organization Size</span>
          {openSections.audience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {(Object.entries(AUDIENCE_BAND_LABELS) as [AudienceSizeBand, string][]).map(([band, label]) => (
            <label key={band} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
              <Checkbox
                checked={filters.audienceBand === band}
                onCheckedChange={(checked) => handleAudienceChange(band, checked === true)}
              />
              {label}
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Status Filter */}
      <Collapsible open={openSections.status} onOpenChange={() => toggleSection('status')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground py-2 border-b border-border">
          <span>Status</span>
          {openSections.status ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
            <Checkbox
              checked={filters.activeStatus === 'active'}
              onCheckedChange={(checked) => handleStatusChange('active', checked === true)}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
            <Checkbox
              checked={filters.activeStatus === 'inactive'}
              onCheckedChange={(checked) => handleStatusChange('inactive', checked === true)}
            />
            Inactive
          </label>
        </CollapsibleContent>
      </Collapsible>

      {/* Data Availability Filter */}
      <Collapsible open={openSections.data} onOpenChange={() => toggleSection('data')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground py-2 border-b border-border">
          <span>Data Availability</span>
          {openSections.data ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
            <Checkbox
              checked={filters.hasFilings === true}
              onCheckedChange={(checked) => onFiltersChange({ ...filters, hasFilings: checked === true ? true : null })}
            />
            Has FEC filings
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground text-muted-foreground">
            <Checkbox
              checked={false}
              disabled
            />
            Has SEC data (coming soon)
          </label>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
