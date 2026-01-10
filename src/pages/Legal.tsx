import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Legal = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8 max-w-3xl">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roster
          </Link>

          <h1 className="text-3xl font-semibold font-serif text-foreground mb-8">
            Legal & Methodology
          </h1>

          <div className="legal-content space-y-8">
            {/* Purpose */}
            <section>
              <h2>Purpose of the Platform</h2>
              <p>
                Civic Roster is a descriptive index of U.S. elected officials, journalists, 
                and media organizations. The platform aggregates publicly available information 
                to provide citizens with a centralized, evidence-linked resource for civic 
                research and engagement.
              </p>
              <p>
                The platform does not make recommendations, predictions, or value judgments 
                about any entity listed. All metrics are descriptive, time-bounded, and 
                derived from verifiable public sources.
              </p>
            </section>

            {/* USA-Only Scope */}
            <section>
              <h2>United States Scope</h2>
              <p>
                Civic Roster exclusively indexes entities operating within the United States. 
                This includes:
              </p>
              <ul>
                <li>Federal, state, and local elected officials holding office in U.S. jurisdictions</li>
                <li>Journalists primarily covering U.S. domestic affairs or based in the United States</li>
                <li>Media organizations headquartered in or primarily serving U.S. audiences</li>
              </ul>
              <p>
                International entities, even if they cover U.S. affairs, are not included 
                in this index unless they maintain a substantial U.S.-based operation.
              </p>
            </section>

            {/* Descriptive vs Opinions */}
            <section>
              <h2>Descriptive Metrics vs. Opinions</h2>
              <p>
                Civic Roster provides exclusively descriptive metrics. This means:
              </p>
              <ul>
                <li>
                  <strong>Activity metrics</strong> describe the volume or frequency of 
                  documented actions (e.g., bills sponsored, articles published) without 
                  evaluating their quality or impact.
                </li>
                <li>
                  <strong>Visibility metrics</strong> describe media coverage and public 
                  presence without assessing favorability or sentiment.
                </li>
                <li>
                  <strong>Source coverage metrics</strong> describe the breadth of sources 
                  covering an entity without ranking sources by credibility.
                </li>
              </ul>
              <p>
                The platform does not provide opinion scores, bias ratings, trustworthiness 
                assessments, or predictive analytics of any kind.
              </p>
            </section>

            {/* Data Sourcing */}
            <section>
              <h2>Data Sourcing Principles</h2>
              <p>
                All data presented on Civic Roster adheres to the following principles:
              </p>
              <ul>
                <li>
                  <strong>Public availability:</strong> Only information available through 
                  official government records, published media, or other public sources is used.
                </li>
                <li>
                  <strong>Verifiability:</strong> Each metric is linked to its underlying 
                  evidence sources, allowing users to independently verify claims.
                </li>
                <li>
                  <strong>Time-bounded:</strong> All metrics include explicit time periods 
                  to ensure context and prevent misleading interpretations.
                </li>
                <li>
                  <strong>Regular updates:</strong> Data is refreshed periodically, with 
                  last-updated timestamps displayed on each profile.
                </li>
              </ul>
            </section>

            {/* Non-Endorsement */}
            <section>
              <h2>Non-Endorsement Disclaimer</h2>
              <p>
                Civic Roster does not endorse, recommend, or oppose any elected official, 
                journalist, or media organization listed on this platform.
              </p>
              <p>
                The inclusion of an entity in this index does not constitute an endorsement 
                of their views, actions, or coverage. Similarly, the exclusion of an entity 
                does not imply criticism or disapproval.
              </p>
              <p>
                Users are encouraged to use the evidence links provided to form their own 
                informed opinions about the entities presented.
              </p>
            </section>

            {/* No Political Persuasion */}
            <section>
              <h2>Political Neutrality</h2>
              <p>
                Civic Roster is designed and maintained as a politically neutral resource. 
                The platform:
              </p>
              <ul>
                <li>Does not favor any political party, ideology, or viewpoint</li>
                <li>Does not attempt to influence voting behavior or political opinions</li>
                <li>Does not accept paid placements or promotional content</li>
                <li>Applies consistent methodology to all entities regardless of affiliation</li>
              </ul>
              <p>
                Any perceived imbalances in coverage are artifacts of the underlying public 
                data and not intentional editorial decisions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2>Contact</h2>
              <p>
                For questions about methodology, data corrections, or general inquiries, 
                please contact our team. We are committed to maintaining accuracy and 
                transparency in all our processes.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
