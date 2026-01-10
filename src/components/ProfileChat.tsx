import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProfileChatProps {
  entityName: string;
  contextData: string;
}

export function ProfileChat({ entityName, contextData }: ProfileChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/entity-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            question: userMessage,
            context: contextData,
            entityName,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (response.status === 402) {
          throw new Error('Service quota exceeded. Please try again later.');
        }
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    `What bills has ${entityName} sponsored?`,
    `What is ${entityName}'s campaign finance summary?`,
    `Show me ${entityName}'s recent legislative activity.`,
    `What committees does ${entityName} serve on?`,
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Profile Interpreter</h3>
          <Badge variant="secondary" className="ml-auto text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ask questions about this official's public record. Answers are sourced exclusively from government data.
        </p>
      </div>

      {/* Messages Area */}
      <div className="h-64 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

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
              {msg.content}
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

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 text-xs text-muted-foreground/70 text-center border-t border-border bg-muted/30">
        Responses are based solely on public government data. No endorsement or judgment is expressed.
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this official's record..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
