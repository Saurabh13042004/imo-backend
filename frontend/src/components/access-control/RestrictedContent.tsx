import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';
// Restricted content component
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RestrictedContentProps {
  children: ReactNode;
  requiresSubscription?: boolean;
  requiredCategory?: string;
  className?: string;
  showUpgradePrompt?: boolean;
}

export function RestrictedContent({
  children,
  requiresSubscription = false,
  requiredCategory,
  className = '',
  showUpgradePrompt = true,
}: RestrictedContentProps) {
  const { canAccessCategory, canAccessPremiumFeatures, hasActiveSubscription } = useUserAccess();
  const { session } = useAuth();
  const { toast } = useToast();

  // Check access permissions
  const hasAccess = (() => {
    if (requiresSubscription && !canAccessPremiumFeatures()) return false;
    if (requiredCategory && !canAccessCategory(requiredCategory)) return false;
    return true;
  })();

  const handleUpgrade = async (type: 'subscription' | 'unlock') => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please log in to access premium features.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Demo mode: show message instead of calling Supabase
      toast({
        title: "Demo Mode",
        description: "Checkout functionality is disabled in demo mode.",
        variant: "default",
      });
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show restricted content overlay
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <Card className="max-w-sm mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              {requiresSubscription ? (
                <Crown className="h-12 w-12 text-yellow-500" />
              ) : (
                <Lock className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {requiresSubscription ? 'Premium Feature' : `Unlock ${requiredCategory}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {requiresSubscription
                  ? 'This feature requires a premium subscription'
                  : `Unlock the ${requiredCategory} category to view this content`
                }
              </p>
            </div>

            {showUpgradePrompt && (
              <div className="space-y-2">
                {!hasActiveSubscription && (
                  <>
                    <Button 
                      onClick={() => handleUpgrade('subscription')}
                      className="w-full"
                      size="sm"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium - $10.99/month
                    </Button>
                    
                    {requiredCategory && !requiresSubscription && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleUpgrade('unlock')}
                        className="w-full"
                        size="sm"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Unlock {requiredCategory} - $4.99
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}