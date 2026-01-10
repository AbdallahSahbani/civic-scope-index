import { ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EvidenceLink } from '@/lib/types';

interface EvidenceAccordionProps {
  links: EvidenceLink[];
}

export function EvidenceAccordion({ links }: EvidenceAccordionProps) {
  // Group by category
  const grouped = links.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, EvidenceLink[]>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold font-serif text-foreground">
        Evidence Links
      </h3>
      
      <Accordion type="multiple" className="space-y-2">
        {Object.entries(grouped).map(([category, categoryLinks]) => (
          <AccordionItem 
            key={category} 
            value={category}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              {category} ({categoryLinks.length})
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-3 pt-2">
                {categoryLinks.map((link) => (
                  <li key={link.id} className="text-sm">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 opacity-50 group-hover:opacity-100" />
                      <div>
                        <span className="block">{link.title}</span>
                        <span className="text-xs text-muted-foreground/70">
                          {link.source} · Accessed {link.dateAccessed}
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
