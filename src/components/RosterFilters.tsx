import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { US_STATES } from '@/lib/types';

interface RosterFiltersProps {
  search: string;
  chamber: 'all' | 'Federal' | 'State' | 'Executive' | 'Local';
  state: string;
  party: string;
  onSearchChange: (value: string) => void;
  onChamberChange: (value: 'all' | 'Federal' | 'State' | 'Executive' | 'Local') => void;
  onStateChange: (value: string) => void;
  onPartyChange: (value: string) => void;
}

const PARTIES = [
  { value: 'all', label: 'All Parties' },
  { value: 'republican', label: 'Republican' },
  { value: 'democrat', label: 'Democratic' },
  { value: 'independent', label: 'Independent' },
];

const CHAMBERS = [
  { value: 'all', label: 'All Levels' },
  { value: 'Federal', label: 'Federal (Congress)' },
  { value: 'Executive', label: 'Executive (Governors)' },
  { value: 'State', label: 'State (Legislators)' },
  { value: 'Local', label: 'Local (Mayors)' },
];

export function RosterFilters({
  search,
  chamber,
  state,
  party,
  onSearchChange,
  onChamberChange,
  onStateChange,
  onPartyChange,
}: RosterFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search officials..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Chamber/Level */}
        <Select value={chamber} onValueChange={(v) => onChamberChange(v as 'all' | 'Federal' | 'State' | 'Executive' | 'Local')}>
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {CHAMBERS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State */}
        <Select value={state} onValueChange={onStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {US_STATES.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Party */}
        <Select value={party} onValueChange={onPartyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select party" />
          </SelectTrigger>
          <SelectContent>
            {PARTIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
