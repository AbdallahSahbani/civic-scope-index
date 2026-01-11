import { useState } from 'react';
import { Send, Loader2, X, FileText, ChevronDown, ChevronUp, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface RosterSearchChatProps {
  onApplyFilters?: (filters: { 
    state?: string; 
    chamber?: string; 
    party?: string;
    searchTerm?: string;
  }) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  filters?: {
    state?: string;
    chamber?: string;
    party?: string;
    district?: string;
  };
}

const EXAMPLE_QUERIES = [
  "I live in Waterbury, CT 06705",
  "Who represents New Haven County?",
  "Show me Texas federal representatives",
  "California Democratic senators",
];

export function RosterSearchChat({ onApplyFilters }: RosterSearchChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Message['filters']>();

  const handleSubmit = async (query?: string) => {
    const message = query || input.trim();
    if (!message || isLoading) return;

    setInput('');
    setIsExpanded(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/roster-search-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
          return;
        }
        if (response.status === 402) {
          toast.error('Service temporarily unavailable. Please try again later.');
          return;
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const filters = data.filterSuggestions;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        filters: filters,
      }]);

      // Auto-apply filters if we got valid suggestions
      if (data.autoApply && filters && onApplyFilters) {
        const hasFilters = filters.state || filters.chamber || filters.party;
        if (hasFilters) {
          setAppliedFilters(filters);
          onApplyFilters({
            state: filters.state || '',
            chamber: filters.chamber || '',
            party: filters.party || '',
            searchTerm: filters.searchTerm || '',
          });
          toast.success(`Filters applied: ${filters.state || ''}${filters.chamber ? ` • ${filters.chamber}` : ''}`, {
            icon: <Filter className="h-4 w-4" />,
          });
        }
      }
    } catch (error) {
      console.error('Search chat error:', error);
      toast.error('Failed to process your query. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsExpanded(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            AI Interpreter
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            — Query the public record
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="space-y-2">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {msg.content.split('\n').map((line, j) => (
                            <p key={j} className="mb-1 last:mb-0">
                              {line.startsWith('**') ? (
                                <strong>{line.replace(/\*\*/g, '')}</strong>
                              ) : line.startsWith('- ') ? (
                                <span className="block pl-2">• {line.slice(2)}</span>
                              ) : (
                                line
                              )}
                            </p>
                          ))}
                        </div>
                        {msg.filters && (msg.filters.state || msg.filters.chamber || msg.filters.party) && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                            {msg.filters.state && (
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {msg.filters.state}
                              </Badge>
                            )}
                            {msg.filters.chamber && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.filters.chamber}
                              </Badge>
                            )}
                            {msg.filters.party && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.filters.party}
                              </Badge>
                            )}
                            {msg.filters.district && (
                              <Badge variant="outline" className="text-xs">
                                District {msg.filters.district}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Example Queries (shown when no messages) */}
          {messages.length === 0 && (
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Ask questions about the public record. Answers are limited to sourced data.
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleSubmit(query)}
                    className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/70">
                This AI does not provide opinions or predictions.
              </p>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border bg-background">
            <div className="flex gap-2">
            <Input
                placeholder='e.g., "What bills has this official sponsored?"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                size="icon" 
                variant="secondary"
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
              {messages.length > 0 && (
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Input */}
      {!isExpanded && (
        <div className="p-3">
          <div className="flex gap-2">
            <Input
              placeholder='e.g., "I live in New Haven, CT" or "Texas senators"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              size="icon" 
              variant="secondary"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}