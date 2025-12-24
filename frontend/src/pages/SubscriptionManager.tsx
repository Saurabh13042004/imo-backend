import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionFlow } from '@/hooks/useSubscriptionFlow';

export default function SubscriptionManager() {
  const { user } = useAuth();
  const { hasActiveSubscription, subscription, loading: accessLoading } = useUserAccess();
  const navigate = useNavigate();
  const { manageSubscription, loading: actionLoading } = useSubscriptionFlow();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (isTrialUser) return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Trial Active</Badge>;
    if (isPremiumUser) return <Badge className="bg-green-500 hover:bg-green-600 text-white">Active</Badge>;
    if (subscription?.cancel_at_period_end) return <Badge variant="destructive">Canceled</Badge>;
    if (subscription?.status === 'past_due') return <Badge variant="destructive">Past Due</Badge>;
    return <Badge variant="outline">Free Plan</Badge>;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-2xl">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to view your subscription details.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  const isTrialUser = subscription?.plan_type === 'trial' || user?.subscription_tier === 'trial';
  const isPremiumUser = subscription?.plan_type === 'premium' || (user?.subscription_tier === 'premium' && !isTrialUser);
  const isFreeUser = !hasActiveSubscription && user?.subscription_tier !== 'trial';

  // Debug logging
  console.log('Subscription Manager Debug:', {
    user,
    subscription,
    isTrialUser,
    isPremiumUser,
    isFreeUser,
    hasActiveSubscription
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Subscription Management
          </h1>
          <p className="text-muted-foreground">
            Manage your plan, billing, and payment methods
          </p>
        </div>

        <div className="grid gap-6">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Your subscription details</CardDescription>
                  </div>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Plan Name and Price */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold text-lg">
                    {isTrialUser 
                      ? 'Premium Monthly (Trial)' 
                      : isPremiumUser 
                        ? `Premium ${subscription?.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}`
                        : 'Free'
                    }
                  </span>
                </div>

                {hasActiveSubscription && !isTrialUser && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-semibold">
                        ${subscription?.billing_cycle === 'yearly' ? '83.88/year' : '9.99/month'}
                      </span>
                    </div>
                  </>
                )}

                {/* Trial Price Info */}
                {isTrialUser && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price After Trial</span>
                      <span className="font-semibold">$9.99/month</span>
                    </div>
                  </>
                )}

                {/* Trial Start Date */}
                {isTrialUser && subscription?.trial_start && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Trial Started</span>
                      </div>
                      <span className="font-medium">
                        {formatDate(subscription.trial_start)}
                      </span>
                    </div>
                  </>
                )}

                {/* Trial End Date */}
                {isTrialUser && subscription?.trial_end && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">Trial Ends</span>
                      </div>
                      <span className="font-medium text-blue-600">
                        {formatDate(subscription.trial_end)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Next Billing Date</span>
                      </div>
                      <span className="font-medium">
                        {formatDate(subscription.trial_end)}
                      </span>
                    </div>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        After your free trial ends on <strong>{formatDate(subscription.trial_end)}</strong>, 
                        this service will continue automatically at <strong>$9.99/month</strong>.
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {/* Subscription End Date */}
                {isPremiumUser && subscription?.current_period_end && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          {subscription.cancel_at_period_end ? 'Ends On' : 'Renews On'}
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatDate(subscription.current_period_end)}
                      </span>
                    </div>

                    {subscription.cancel_at_period_end && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your subscription is set to cancel on {formatDate(subscription.current_period_end)}. You'll still have access until then.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                {/* Features List */}
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Plan Features:</p>
                  <div className="space-y-2">
                    {isFreeUser ? (
                      <>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>View top 10 products per search</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Basic AI product insights</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Product ratings and reviews</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Unlimited product searches</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>View all products (no limits)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Priority AI analysis & insights</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Advanced filtering & sorting</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          {(isTrialUser || hasActiveSubscription) && subscription?.payment_method && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Your default payment method</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium capitalize">
                        {subscription.payment_method.brand}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        •••• {subscription.payment_method.last4}
                      </p>
                      {subscription.payment_method.exp_month && subscription.payment_method.exp_year && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires {String(subscription.payment_method.exp_month).padStart(2, '0')}/{subscription.payment_method.exp_year}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={manageSubscription}
                    disabled={actionLoading}
                  >
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Information Card */}
          {(isTrialUser || hasActiveSubscription) && user && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Your account and billing details</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={manageSubscription}
                    disabled={actionLoading}
                  >
                    Update
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <span className="font-medium">{user.full_name || 'Not provided'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>
                Update your plan, payment method, or cancel subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isFreeUser ? (
                <>
                  <Button
                    onClick={() => navigate('/pricing')}
                    disabled={actionLoading}
                    className="w-full"
                    size="lg"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Start 7-Day Free Trial
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    $9.99/month or $83.88/year (save 30%)
                  </p>
                </>
              ) : (
                <Button
                  onClick={manageSubscription}
                  disabled={actionLoading}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Billing Portal
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-xs text-center text-muted-foreground">
                {isFreeUser
                  ? 'Cancel anytime during trial with no charge'
                  : 'Manage billing, update payment method, or cancel subscription'
                }
              </p>
            </CardContent>
          </Card>

          {/* Upgrade Options for Trial Users */}
          {isTrialUser && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>
                  Choose the best plan for your needs after trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Monthly Plan */}
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg mb-1">Premium Monthly</h3>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-3xl font-bold">$9.99</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Price Comparison (Unlimited)</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Price Drop Alerts (Unlimited)</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>AI Powered Sentiment Analysis</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Cross Site Inventory Analysis</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>AI chatbot + review interaction</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={manageSubscription}
                      disabled={actionLoading}
                      className="w-full mb-2"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Billed monthly, cancel anytime
                    </p>
                  </div>

                  {/* Yearly Plan */}
                  <div className="border-2 border-primary rounded-lg p-4 hover:shadow-md transition-shadow relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Save 30%</Badge>
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg mb-1">Premium Yearly</h3>
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-3xl font-bold">$83.88</span>
                        <span className="text-muted-foreground">/year</span>
                      </div>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Only $6.99/month
                      </p>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Price Comparison (Unlimited)</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Price Drop Alerts (Unlimited)</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>AI Powered Sentiment Analysis</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>Cross Site Inventory Analysis</span>
                      </li>
                      <li className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>AI chatbot + review interaction</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={manageSubscription}
                      disabled={actionLoading}
                      className="w-full mb-2 bg-primary hover:bg-primary/90"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Yearly
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Save $36 compared to monthly
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  All plans include: Trust Score, Review Summaries, and Cross-Platform Reviews
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
