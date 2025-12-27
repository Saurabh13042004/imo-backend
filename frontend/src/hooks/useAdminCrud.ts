import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { API_BASE_URL } from "@/config/api";

const API_BASE = `${API_BASE_URL}/api/v1/admin/crud`;

// ==================== Types ====================

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  access_level: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInput {
  full_name?: string;
  email?: string;
  subscription_tier?: string;
  access_level?: string;
  avatar_url?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  transaction_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  user_id: string;
  subscription_id?: string;
  transaction_id: string;
  amount: number;
  currency?: string;
  type: string;
  status?: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  metadata_json?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  billing_cycle?: string;
  is_active: boolean;
  subscription_start: string;
  subscription_end?: string;
  trial_start?: string;
  trial_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInput {
  user_id: string;
  plan_type: string;
  billing_cycle?: string;
  is_active?: boolean;
  subscription_start?: string;
  subscription_end?: string;
  trial_start?: string;
  trial_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_product_id?: string;
}

// ==================== Users CRUD ====================

export const useCreateUser = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserInput) => {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to create user" }));
        throw new Error(error.detail || "Failed to create user");
      }

      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useUpdateUser = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UserInput }) => {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to update user" }));
        throw new Error(error.detail || "Failed to update user");
      }

      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useDeleteUser = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to delete user" }));
        throw new Error(error.detail || "Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useGetUser = (userId: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "GET",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      return response.json() as Promise<User>;
    },
    enabled: !!accessToken && !!userId,
  });
};

// ==================== Transactions CRUD ====================

export const useCreateTransaction = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionInput) => {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to create transaction" }));
        throw new Error(error.detail || "Failed to create transaction");
      }

      return response.json() as Promise<Transaction>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-transactions"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: Partial<TransactionInput>;
    }) => {
      const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to update transaction" }));
        throw new Error(error.detail || "Failed to update transaction");
      }

      return response.json() as Promise<Transaction>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-transactions"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to delete transaction" }));
        throw new Error(error.detail || "Failed to delete transaction");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-transactions"] });
    },
  });
};

export const useGetTransaction = (transactionId: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["admin-transaction", transactionId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: "GET",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }

      return response.json() as Promise<Transaction>;
    },
    enabled: !!accessToken && !!transactionId,
  });
};

// ==================== Subscriptions CRUD ====================

export const useCreateSubscription = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubscriptionInput) => {
      const response = await fetch(`${API_BASE}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to create subscription" }));
        throw new Error(error.detail || "Failed to create subscription");
      }

      return response.json() as Promise<Subscription>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
  });
};

export const useUpdateSubscription = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: Partial<SubscriptionInput>;
    }) => {
      const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to update subscription" }));
        throw new Error(error.detail || "Failed to update subscription");
      }

      return response.json() as Promise<Subscription>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
  });
};

export const useDeleteSubscription = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
        method: "DELETE",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to delete subscription" }));
        throw new Error(error.detail || "Failed to delete subscription");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
  });
};

export const useGetSubscription = (subscriptionId: string) => {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["admin-subscription", subscriptionId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/subscriptions/${subscriptionId}`, {
        method: "GET",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      return response.json() as Promise<Subscription>;
    },
    enabled: !!accessToken && !!subscriptionId,
  });
};
