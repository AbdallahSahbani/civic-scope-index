import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { RosterSection } from '@/components/RosterSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cinematic Hero Section */}
      <HeroSection />

      {/* Real Officials Roster - Data from Congress.gov & OpenStates */}
      <RosterSection />

      <Footer />
    </div>
  );
};

export default Index;
