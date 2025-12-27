import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/config/api';

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  activeTrials: number;
  monthlyRevenue: number;
  totalUrls: number;
  apiCalls: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: string;
  joinDate: string;
  lastActive: string;
  activeSubscription?: string;
}

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  planType: string;
  billingCycle?: string;
  isActive: boolean;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  trialStart?: string;
  trialEnd?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  source: string;
  sourceId: string;
  price?: number;
  currency: string;
  rating?: number;
  reviewCount: number;
  imageUrl?: string;
  createdAt: string;
}

interface Review {
  id: string;
  productTitle?: string;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  author?: string;
  source?: string;
  postedAt?: string;
  fetchedAt?: string;
  createdAt?: string;
}

interface ErrorLog {
  id: string;
  functionName: string;
  errorType: string;
  errorMessage: string;
  createdAt: string;
}

interface BackgroundTask {
  id: string;
  status: string;
  productsAnalyzed: number;
  totalProducts: number;
  startedAt: string;
  completedAt?: string;
}

interface PaymentTransaction {
  id: string;
  userEmail?: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  createdAt: string;
}

// Admin Stats Hook
export function useAdminStats() {
  const { accessToken } = useAuth();
  
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      return response.json() as Promise<AdminStats>;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!accessToken,
  });
}

// Users List Hook
export function useAdminUsers(skip: number = 0, limit: number = 50, search?: string, subscriptionTier?: string) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (subscriptionTier) params.append('subscription_tier', subscriptionTier);

  return useQuery({
    queryKey: ['admin-users', skip, limit, search, subscriptionTier],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return response.json() as Promise<{ data: User[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Subscriptions List Hook
export function useAdminSubscriptions(skip: number = 0, limit: number = 50, status?: string) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);

  return useQuery({
    queryKey: ['admin-subscriptions', skip, limit, status],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/subscriptions?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      return response.json() as Promise<{ data: Subscription[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Contacts List Hook
export function useAdminContacts(skip: number = 0, limit: number = 50) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  return useQuery({
    queryKey: ['admin-contacts', skip, limit],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/contacts?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      return response.json() as Promise<{ data: Contact[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Products List Hook
export function useAdminProducts(skip: number = 0, limit: number = 50, source?: string) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (source) params.append('source', source);

  return useQuery({
    queryKey: ['admin-products', skip, limit, source],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/products?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return response.json() as Promise<{ data: Product[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Reviews List Hook
export function useAdminReviews(skip: number = 0, limit: number = 50) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  return useQuery({
    queryKey: ['admin-reviews', skip, limit],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/reviews?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return response.json() as Promise<{ data: Review[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Error Logs Hook
export function useAdminErrorLogs(skip: number = 0, limit: number = 50) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  return useQuery({
    queryKey: ['admin-error-logs', skip, limit],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/errors?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch error logs');
      }

      return response.json() as Promise<{ data: ErrorLog[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Background Tasks Hook
export function useAdminBackgroundTasks(skip: number = 0, limit: number = 50, status?: string) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);

  return useQuery({
    queryKey: ['admin-background-tasks', skip, limit, status],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/tasks?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch background tasks');
      }

      return response.json() as Promise<{ data: BackgroundTask[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 10 * 1000,
    enabled: !!accessToken,
  });
}

// Payment Transactions Hook
export function useAdminPaymentTransactions(skip: number = 0, limit: number = 50, status?: string) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);

  return useQuery({
    queryKey: ['admin-payment-transactions', skip, limit, status],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/payment-transactions?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment transactions');
      }

      return response.json() as Promise<{ data: PaymentTransaction[]; total: number; skip: number; limit: number }>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

// Update User Role Mutation
export function useUpdateUserRole() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

// Update User Subscription Mutation
export function useUpdateUserSubscription() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, planType }: { userId: string; planType: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan_type: planType }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user subscription');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// Email Template Interfaces
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateCreate {
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  description?: string;
  is_active?: boolean;
}

export interface EmailTemplateUpdate {
  subject?: string;
  body_html?: string;
  body_text?: string;
  description?: string;
  is_active?: boolean;
}

export interface SendEmailRequest {
  template_name?: string;
  recipients: string[];
  subject?: string;
  body_html?: string;
  body_text?: string;
  context?: Record<string, any>;
  recipients_with_names?: Array<{ name: string; email: string }>;
}

// Email Templates Hooks
export function useEmailTemplates(skip: number = 0, limit: number = 50, activeOnly: boolean = false) {
  const { accessToken } = useAuth();
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (activeOnly) params.append('active_only', 'true');

  return useQuery({
    queryKey: ['email-templates', skip, limit, activeOnly],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email/templates?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }

      return response.json() as Promise<EmailTemplate[]>;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!accessToken,
  });
}

export function useEmailTemplate(templateId: string) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['email-template', templateId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email/templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email template');
      }

      return response.json() as Promise<EmailTemplate>;
    },
    enabled: !!accessToken && !!templateId,
  });
}

export function useCreateEmailTemplate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmailTemplateCreate) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to create email template' }));
        throw new Error(error.detail || 'Failed to create email template');
      }

      return response.json() as Promise<EmailTemplate>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: string; data: EmailTemplateUpdate }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to update email template' }));
        throw new Error(error.detail || 'Failed to update email template');
      }

      return response.json() as Promise<EmailTemplate>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template', variables.templateId] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to delete email template' }));
        throw new Error(error.detail || 'Failed to delete email template');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}

export function useSendEmail() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (data: SendEmailRequest) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to send email' }));
        throw new Error(error.detail || 'Failed to send email');
      }

      return response.json();
    },
  });
}