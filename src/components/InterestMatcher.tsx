import { useState } from 'react';
import { Search, X, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MatchResult {
  interest: string;
  relevantItems: {
    type: 'bill' | 'vote';
    title: string;
    description?: string;
    date?: string;
    url?: string;
  }[];
  matchCount: number;
}

interface InterestMatcherProps {
  entityName: string;
  bills: any[];
  votes: any[];
}

const SUGGESTED_INTERESTS = [
  'healthcare',
  'education',
  'environment',
  'economy',
  'immigration',
  'infrastructure',
  'defense',
  'technology',
];

export function InterestMatcher({ entityName, bills, votes }: InterestMatcherProps) {
  const [interests, setInterests] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const addInterest = (interest: string) => {
    const trimmed = interest.trim().toLowerCase();
    if (trimmed && !interests.includes(trimmed) && interests.length < 5) {
      setInterests([...interests, trimmed]);
      setInputValue('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSearch = async () => {
    if (interests.length === 0) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interest-match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ interests, bills, votes }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to match interests');
      }

      const data = await response.json();
      setMatches(data.matches);
    } catch (err) {
      console.error('Interest match error:', err);
      setError(err instanceof Error ? err.message : 'Failed to match interests');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Interest Comparison
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        See how {entityName}'s legislative activity relates to topics you care about.
        This is descriptive data only — no recommendations or judgments.
      </p>

      {/* Interest Input */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a topic (e.g., healthcare)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addInterest(inputValue);
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={() => addInterest(inputValue)}
            variant="outline"
            disabled={!inputValue.trim() || interests.length >= 5}
          >
            Add
          </Button>
        </div>

        {/* Suggested Topics */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_INTERESTS.filter(i => !interests.includes(i)).slice(0, 6).map(suggestion => (
            <button
              key={suggestion}
              onClick={() => addInterest(suggestion)}
              className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
            >
              + {suggestion}
            </button>
          ))}
        </div>

        {/* Selected Interests */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <Badge key={interest} variant="secondary" className="gap-1">
                {interest}
                <button onClick={() => removeInterest(interest)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch} 
        disabled={interests.length === 0 || isLoading}
        className="w-full mb-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Find Related Activity
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && !isLoading && (
        <div className="space-y-4">
          {matches.map((match, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground capitalize">{match.interest}</span>
                <Badge variant={match.matchCount > 0 ? 'default' : 'secondary'}>
                  {match.matchCount} {match.matchCount === 1 ? 'item' : 'items'} found
                </Badge>
              </div>

              {match.relevantItems.length > 0 ? (
                <div className="space-y-2">
                  {match.relevantItems.map((item, j) => (
                    <div key={j} className="text-sm bg-muted/50 rounded-lg p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {item.type === 'bill' ? 'Bill' : 'Cosponsored'}
                          </Badge>
                          <p className="text-foreground">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
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
                <p className="text-sm text-muted-foreground">
                  No legislative activity found related to this topic.
                </p>
              )}
            </div>
          ))}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/70 text-center pt-2">
            This comparison shows descriptive data from public records. 
            It does not represent endorsement, recommendation, or judgment of any kind.
          </p>
        </div>
      )}
    </div>
  );
}
