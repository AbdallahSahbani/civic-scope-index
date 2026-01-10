import { Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { US_STATES, ENTITY_TYPE_LABELS, JURISDICTION_LABELS } from '@/lib/types';

interface FilterPanelProps {
  search: string;
  entityType: string;
  state: string;
  jurisdiction: string;
  onSearchChange: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onJurisdictionChange: (value: string) => void;
}

export function FilterPanel({
  search,
  entityType,
  state,
  jurisdiction,
  onSearchChange,
  onEntityTypeChange,
  onStateChange,
  onJurisdictionChange,
}: FilterPanelProps) {
  const showJurisdiction = entityType === 'all' || entityType === 'elected_official';

  return (
    <div className="filter-panel">
      <div className="grid gap-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Name, office, outlet, or beat"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Entity Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Entity Type</Label>
            <Select value={entityType} onValueChange={onEntityTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="elected_official">
                  {ENTITY_TYPE_LABELS.elected_official}
                </SelectItem>
                <SelectItem value="journalist">
                  {ENTITY_TYPE_LABELS.journalist}
                </SelectItem>
                <SelectItem value="media_organization">
                  {ENTITY_TYPE_LABELS.media_organization}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">State</Label>
            <Select value={state} onValueChange={onStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.code === 'ALL' ? 'All States' : `${s.name} (${s.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jurisdiction (only for officials) */}
          {showJurisdiction && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={onJurisdictionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="federal">{JURISDICTION_LABELS.federal}</SelectItem>
                  <SelectItem value="state">{JURISDICTION_LABELS.state}</SelectItem>
                  <SelectItem value="local">{JURISDICTION_LABELS.local}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Helper Text */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            This index includes only entities operating within the United States. All metrics are 
            descriptive and derived from publicly available sources. No recommendations or 
            endorsements are expressed.
          </p>
        </div>
      </div>
    </div>
  );
}
