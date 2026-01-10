import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MetricCard } from '@/components/MetricCard';
import { EvidenceAccordion } from '@/components/EvidenceAccordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getEntityById } from '@/lib/mockData';
import { ENTITY_TYPE_LABELS, JURISDICTION_LABELS } from '@/lib/types';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const EntityProfile = () => {
  const { id } = useParams<{ id: string }>();
  const entity = id ? getEntityById(id) : undefined;

  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold font-serif text-foreground">
              Entity Not Found
            </h2>
            <p className="mt-2 text-muted-foreground">
              The requested entity could not be located.
            </p>
            <Link to="/" className="mt-4 inline-block text-primary hover:underline">
              Return to Roster
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = getInitials(entity.name);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roster
          </Link>

          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="initials-avatar h-20 w-20 text-2xl shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold font-serif text-foreground">
                {entity.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant={entity.entityType === 'elected_official' ? 'official' : entity.entityType === 'journalist' ? 'journalist' : 'media'}>
                  {ENTITY_TYPE_LABELS[entity.entityType]}
                </Badge>
                {entity.jurisdiction && (
                  <Badge variant="outline">
                    {JURISDICTION_LABELS[entity.jurisdiction]}
                  </Badge>
                )}
                <Badge variant="outline">{entity.state}</Badge>
              </div>
              {entity.office && (
                <p className="mt-2 text-muted-foreground">{entity.office}</p>
              )}
              {entity.outlet && (
                <p className="mt-2 text-muted-foreground">
                  {entity.outlet}{entity.beat ? ` · ${entity.beat}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Disclosure Banner */}
          <div className="disclosure-banner mb-8">
            <p>
              This profile contains descriptive metrics derived from public data. 
              No endorsement or judgment is expressed. All information is time-bounded 
              and linked to verifiable sources.
            </p>
          </div>

          {/* Metrics Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold font-serif text-foreground mb-4">
              Descriptive Metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard title="Activity" metric={entity.metrics.activity} />
              <MetricCard title="Visibility" metric={entity.metrics.visibility} />
              <MetricCard title="Source Coverage" metric={entity.metrics.sourceCoverage} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Last updated: {entity.metrics.lastUpdated}
            </p>
          </section>

          {/* Evidence Links */}
          <section className="mb-8">
            <EvidenceAccordion links={entity.evidenceLinks} />
          </section>

          {/* Profile Interpreter Button */}
          <section className="border-t pt-8">
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Profile Interpreter
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              The Profile Interpreter allows scoped questions about this entity only. 
              Feature coming soon.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EntityProfile;
