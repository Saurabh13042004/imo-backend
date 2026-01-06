import Search from 'lucide-react/dist/esm/icons/search';
import Play from 'lucide-react/dist/esm/icons/play';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Download from 'lucide-react/dist/esm/icons/download';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSearchUrl } from '@/hooks/useSearchUrl';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import React from 'react';

interface HeroSectionProps {
  className?: string;
}

const AnimatedOrb = ({
  delay,
  duration,
  size,
  position,
}: {
  delay: number;
  duration: number;
  size: string;
  position: string;
}) => (
  <div
    className={`absolute ${size} rounded-full blur-3xl opacity-30`}
    style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
      ...Object.fromEntries(
        position.split(' ').map((p, i) => {
          const [key, val] = p.split('-');
          return [i === 0 ? key : `${key}`, val];
        })
      ),
    }}
  />
);

const MemoizedAnimatedOrb = React.memo(AnimatedOrb);

const Counter = ({ 
  from = 0, 
  to, 
  suffix = '', 
}: { 
  from?: number; 
  to: number; 
  suffix?: string; 
}) => {
  return <>{to}{suffix}</>;
};

const MemoizedCounter = React.memo(Counter);

export const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoOpen, setVideoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Lazy load video after component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  // Microsoft Clarity is initialized globally in main.tsx using the NPM package
  // No additional loading needed here

  const handleVideoClick = () => {
    if (videoRef.current && !isVideoPlaying) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const scrollToSection = () => {
    const element = document.getElementById('featured-products');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Animated Background Orbs - Deferred */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MemoizedAnimatedOrb
          delay={0}
          duration={8}
          size="w-96 h-96"
          position="top-20 -left-48"
        />
        <MemoizedAnimatedOrb
          delay={2}
          duration={10}
          size="w-80 h-80"
          position="top-40 right-0"
        />
        <MemoizedAnimatedOrb
          delay={1}
          duration={12}
          size="w-72 h-72"
          position="bottom-20 left-1/3"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Mobile Hero Section */}
      <section
        className="md:hidden relative z-10 px-4 py-8 sm:py-12"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground leading-tight">
            Smart Shopping, One Click Away
          </h1>

          <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-light">
            Your AI shopping assistant that reads thousands of reviews, compares prices across stores, and gives you honest product recommendations—instantly.
          </p>
        </div>

        {/* Mobile Search - Constrained */}
        <form
          onSubmit={handleSearch}
          className="mb-8 w-full"
        >
          <div
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-500" />
            <div className="relative flex items-center bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl p-3">
              <Search className="w-5 h-5 text-primary ml-3 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search any product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent px-3 py-3 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="sm"
                className="mr-2 px-3 bg-primary hover:bg-primary/90"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!user && (
            <div
              className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>No signup • 3 free • 7 days trial</span>
            </div>
          )}
        </form>

        {/* Trust Grid - Mobile (2x2) with Counting Animation */}
        <div
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-card/50 rounded-lg p-4 border border-foreground/10 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              <MemoizedCounter to={10} suffix="K+" />
            </div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-foreground/10 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              <MemoizedCounter to={98} suffix="%" />
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-foreground/10 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              <MemoizedCounter to={500} suffix="+" />
            </div>
            <div className="text-xs text-muted-foreground">Videos</div>
          </div>
          <div className="bg-card/50 rounded-lg p-4 border border-foreground/10 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              <MemoizedCounter to={100} suffix="+" />
            </div>
            <div className="text-xs text-muted-foreground">Retailers</div>
          </div>
        </div>

        {/* Key Features - Mobile */}
        <div
          className="space-y-3 mb-8"
        >
          <div className="flex gap-3 p-3 bg-card/50 rounded-lg border border-foreground/5">
            <div className="text-2xl flex-shrink-0">📊</div>
            <div className="text-sm">
              <div className="font-semibold text-xs mb-1">Comprehensive Analysis</div>
              <div className="text-xs text-muted-foreground">Amazon, Reddit, YouTube, blogs & more</div>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-card/50 rounded-lg border border-foreground/5">
            <div className="text-2xl flex-shrink-0">⚡</div>
            <div className="text-sm">
              <div className="font-semibold text-xs mb-1">AI-Powered</div>
              <div className="text-xs text-muted-foreground">Filters fake reviews & real insights</div>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-card/50 rounded-lg border border-foreground/5">
            <div className="text-2xl flex-shrink-0">🎯</div>
            <div className="text-sm">
              <div className="font-semibold text-xs mb-1">Top 3 Ranked</div>
              <div className="text-xs text-muted-foreground">Best options based on your needs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Hero Section */}
      <section
        className="hidden md:flex relative z-10 min-h-screen flex-col items-center justify-center px-6 pt-20 pb-12"
      >
        {/* Main Heading - Professional and Bold */}
        <h1
          className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-center max-w-5xl leading-tight"
        >
          Smart Shopping, One Click Away
        </h1>

        {/* Subtitle - Informative and Clear */}
        <p
          className="text-xl text-muted-foreground mb-12 text-center max-w-3xl leading-relaxed font-light"
        >
          Your AI shopping assistant that reads thousands of reviews, compares prices across stores, and gives you honest product recommendations—instantly.
        </p>

        {/* Search Bar - Constrained Width */}
        <form
          onSubmit={handleSearch}
          className="mb-8 w-full max-w-3xl"
        >
          <div className="relative group">
            {/* Enhanced glow effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/50 via-blue-500/40 to-purple-500/50 rounded-2xl blur-xl opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse group-hover:animate-none" />
            
            {/* Search input */}
            <div className="relative flex items-center bg-card/95 backdrop-blur-xl border border-primary/40 rounded-2xl p-5 shadow-2xl">
              <Search className="w-6 h-6 text-primary ml-4 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search any product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:outline-none"
              />
              <button
                type="submit"
                className="mr-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Chrome Extension Banner + CTA - Same Line */}
        <div
          className="mt-6 mb-8 flex items-center justify-center gap-6 flex-wrap"
        >
          <a
            href="https://chromewebstore.google.com/detail/imo-ai-shopping-assistant/fapabfddjibejafodhnafpfpelcbddea"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block group hover:scale-105 transition-transform duration-300"
          >
            <img
              src="https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png"
              alt="Available in the Chrome Web Store"
              className="h-14 w-auto drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
            />
          </a>
          {!user && (
            <a
              href="/search"
              className="inline-flex items-center gap-2 px-6 h-14 bg-black hover:bg-gray-900 border border-white/20 rounded-lg font-semibold text-sm text-white transition-all duration-300 shadow-lg hover:shadow-black/40"
            >
              <Zap className="w-4 h-4" />
              <span>Try Free Searches now or free trial</span>
            </a>
          )}
          {user && (
            <a
              href="/search"
              className="inline-flex items-center gap-2 px-6 h-14 bg-primary hover:bg-primary/90 border border-primary/40 rounded-lg font-semibold text-sm text-white transition-all duration-300 shadow-lg hover:shadow-primary/40"
            >
              <Search className="w-4 h-4" />
              <span>Start Searching</span>
            </a>
          )}
        </div>

        {/* Trust Indicators - Clean Grid with Counting Animation */}
        <div
          className="w-full max-w-4xl mb-20 mt-8"
        >
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <MemoizedCounter to={10} suffix="K+" />
              </div>
              <div className="text-sm text-muted-foreground">Reviews Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <MemoizedCounter to={500} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Video Sources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <MemoizedCounter to={98} suffix="%" />
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <MemoizedCounter to={100} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">Retailers</div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div
          className="w-full max-w-4xl mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-foreground">Getting Started in 3 Steps</h2>
            <p className="text-muted-foreground">Quick setup to start using IMO</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Step 1 */}
            <div
              className="group"
            >
              <div className="h-full border-2 border-foreground/10 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 text-white font-bold text-lg group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    1
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground text-lg">Install Extension</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click the button above to install IMO from the Chrome Web Store
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div
              className="group"
            >
              <div className="h-full border-2 border-foreground/10 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 text-white font-bold text-lg group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    2
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground text-lg">Click Extension Icon</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Find the IMO icon in your Chrome extensions bar (top-right corner)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div
              className="group"
            >
              <div className="h-full border-2 border-foreground/10 hover:border-primary/50 bg-gradient-to-br from-card to-muted/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 text-white font-bold text-lg group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    3
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground text-lg">Choose an Option</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Select from the 3 available options to get started
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="w-full max-w-4xl mb-12"
        >
          <div 
            className="relative rounded-xl overflow-hidden shadow-2xl border border-foreground/10 cursor-pointer group"
            onClick={handleVideoClick}
          >
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 relative">
              <video
                ref={videoRef}
                controls={isVideoPlaying}
                muted
                playsInline
                preload="none"
                poster="https://d3tmtixqwd7vky.cloudfront.net/imo-assets/hero-poster.webp"
                className="w-full h-full object-cover"
              >
                <source
                  src="https://d3tmtixqwd7vky.cloudfront.net/imo-assets/IMOVideo-optimized.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            See how IMO works in action
          </p>
        </div>

        {/* Scroll CTA */}
        <button
          onClick={scrollToSection}
          className="mt-4"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      </section>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-white mx-auto mb-4" />
              <p className="text-white text-lg">
                Video Coming Soon
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};