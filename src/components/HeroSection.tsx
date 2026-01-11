import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
const heroImage = '/images/hero-political-landscape.png';
export const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToContent = () => {
    const content = document.getElementById('roster-content');
    if (content) {
      content.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0">
        {/* Main hero image with parallax */}
        <div className="absolute inset-0 hero-image-layer" style={{
        transform: `translateY(${scrollY * 0.3}px) scale(1.1)`
      }}>
          <img src={heroImage} alt="Stone elephant, eagle, and donkey on separate peaks overlooking Washington D.C." className="h-full w-full object-cover object-center" />
        </div>

        {/* Fog layer 1 - slow drift */}
        <div className="absolute inset-0 fog-layer-1" style={{
        transform: `translateX(${scrollY * 0.05}px)`
      }} />

        {/* Fog layer 2 - opposite drift */}
        <div className="absolute inset-0 fog-layer-2" style={{
        transform: `translateX(${-scrollY * 0.03}px)`
      }} />

        {/* Vignette overlay */}
        <div className="absolute inset-0 hero-vignette" />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="hero-content-animate" style={{
        transform: `translateY(${scrollY * 0.15}px)`,
        opacity: Math.max(0, 1 - scrollY / 400)
      }}>
          {/* Headline */}
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl hero-title">Mission</h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl md:text-2xl hero-subtitle">A neutral index of elected officials, journalists, and media organizations.
Descriptive metrics. Evidence-linked. No endorsements.

          <span className="block mt-2 text-base sm:text-lg text-white/60">
              USA-only. Descriptive data from primary government sources. Every claim is source-linked.
            </span>
          </p>

          {/* CTA Button */}
          <div className="mt-10 hero-cta">
            <Button onClick={scrollToContent} size="lg" className="bg-white/95 text-primary hover:bg-white px-8 py-6 text-base font-medium shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105">
              Explore the Roster
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator" style={{
        opacity: Math.max(0, 1 - scrollY / 200)
      }}>
          <button onClick={scrollToContent} className="flex flex-col items-center gap-2 text-white/60 transition-colors hover:text-white/90" aria-label="Scroll to content">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>;
};