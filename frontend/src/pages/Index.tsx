import { useState, useEffect, lazy, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { useParallax } from "@/hooks/useParallax";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/features/hero";
import { OnboardingFlow } from "@/components/subscription/OnboardingFlow";
import { useUserAccess } from "@/hooks/useUserAccess";
import { useAuth } from "@/hooks/useAuth";
import { getAppConfig } from "@/utils/appConfig";

// Lazy load non-critical sections
const FeaturedProductsSection = lazy(() => import("@/components/home/featured-products").then(m => ({ default: m.FeaturedProductsSection })));
const ProblemStatementSection = lazy(() => import("@/components/home/problem-statement").then(m => ({ default: m.ProblemStatementSection })));
const FeaturesSection = lazy(() => import("@/components/home/features-section").then(m => ({ default: m.FeaturesSection })));
const IMOTestimonials = lazy(() => import("@/components/ui/imo-testimonials").then(m => ({ default: m.IMOTestimonials })));
const ComparisonSection = lazy(() => import("@/components/features/comparison").then(m => ({ default: m.ComparisonSection })));
const FaqSection = lazy(() => import("@/components/home/faq").then(m => ({ default: m.FaqSection })));
const PricingSection = lazy(() => import("@/components/home/pricing").then(m => ({ default: m.PricingSection })));

// Lightweight loading placeholder
const SectionSkeleton = ({ height = "h-96" }: { height?: string }) => (
  <div className={`${height} bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-lg`} />
);

const Index = () => {
  useParallax();
  const { hasActiveSubscription } = useUserAccess();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const initializeOnboarding = async () => {
      if (user) {
        const hasSeenOnboarding = localStorage.getItem(`hasSeenOnboarding_${user.id}`);
        if (!hasSeenOnboarding) {
          // Check backend config to see if onboarding should be shown
          const config = await getAppConfig();
          if (config.showOnboarding) {
            setShowOnboarding(true);
          }
        }
      }
    };

    initializeOnboarding();
  }, [user]);

  const handleOnboardingComplete = () => {
    if (user) {
      // Store user-specific onboarding completion
      localStorage.setItem(`hasSeenOnboarding_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };
  
  return (
    <div style={{
      background: 'linear-gradient(-45deg, rgba(255,255,255,1), rgba(245,245,245,0.9), rgba(230,230,230,0.8), rgba(255,255,255,1))',
      backgroundSize: '400% 400%',
      animation: 'gradient-shift 12s ease infinite'
    }}>
      {/* Main content */}
      <div className="relative">

        {/* Hero Section */}
        <HeroSection />
        
        {/* Mobile App Sections - Card-based Layout */}
        <div className="md:hidden space-y-4 px-4 pb-8">
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <FeaturedProductsSection />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            <ProblemStatementSection />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <FeaturesSection />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <PricingSection />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton height="h-72" />}>
            <IMOTestimonials />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <ComparisonSection />
          </Suspense>
        </div>

        {/* Desktop Sections with Separators */}
        <div className="hidden md:block">
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>
          
          {/* Featured Products */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <FeaturedProductsSection />
          </Suspense>
          
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>

          {/* Problem Statement Section */}
          <Suspense fallback={<SectionSkeleton height="h-80" />}>
            <ProblemStatementSection />
          </Suspense>
          
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>
          
          {/* Features Section */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <FeaturesSection />
          </Suspense>
          
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>
          
          {/* Pricing Section */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <PricingSection />
          </Suspense>
          
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>
          
          {/* Testimonials Section */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<SectionSkeleton height="h-72" />}>
              <IMOTestimonials />
            </Suspense>
          </div>
          
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>
          
          {/* Comparison Section */}
          <Suspense fallback={<SectionSkeleton height="h-96" />}>
            <ComparisonSection />
          </Suspense>
          
          {/* Section Separator */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Separator className="opacity-30" />
          </div>
        </div>
        
        {/* FAQ Section */}
        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <FaqSection />
        </Suspense>
      </div>
      
      <OnboardingFlow
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default Index;
