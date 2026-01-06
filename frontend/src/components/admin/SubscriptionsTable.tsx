import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Users, Zap, Loader2, Edit2, Trash2, Plus } from "lucide-react";
import { useAdminSubscriptions, useAdminPaymentTransactions } from "@/hooks/useAdminApi";
import {
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  type SubscriptionInput,
} from "@/hooks/useAdminCrud";
import { useToast } from "@/hooks/useToast";
import { SubscriptionEditModal } from "./modals/SubscriptionEditModal";


export const SubscriptionsTable = () => {
  const [filter, setFilter] = useState<"all" | "active" | "cancelled" | "expired">("all");
  const [editingSubscription, setEditingSubscription] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const toast = useToast();
  const { data: subData, isLoading: subsLoading } = useAdminSubscriptions(0, 500, filter !== "all" ? filter : undefined);
  const { data: transData, isLoading: transLoading } = useAdminPaymentTransactions(0, 500);

  const createSubscriptionMutation = useCreateSubscription();
  const updateSubscriptionMutation = useUpdateSubscription();
  const deleteSubscriptionMutation = useDeleteSubscription();

  const handleCreate = async (data: SubscriptionInput) => {
    const toastId = toast.loading("Creating subscription...");
    try {
      await createSubscriptionMutation.mutateAsync(data);
      toast.dismiss(toastId);
      toast.success("Subscription created successfully!");
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || error?.message || "Failed to create subscription";
      toast.error(errorMsg);
      console.error("Failed to create subscription:", error);
    }
  };

  const handleUpdate = async (data: SubscriptionInput) => {
    if (!editingSubscription) return;
    const toastId = toast.loading("Updating subscription...");
    try {
      await updateSubscriptionMutation.mutateAsync({
        subscriptionId: editingSubscription.id,
        data,
      });
      toast.dismiss(toastId);
      toast.success("Subscription updated successfully!");
      setEditingSubscription(null);
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || error?.message || "Failed to update subscription";
      toast.error(errorMsg);
      console.error("Failed to update subscription:", error);
    }
  };

  const handleDelete = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    const toastId = toast.loading("Deleting subscription...");
    try {
      await deleteSubscriptionMutation.mutateAsync(subscriptionId);
      toast.dismiss(toastId);
      toast.success("Subscription deleted successfully!");
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMsg = error?.response?.data?.detail || error?.message || "Failed to delete subscription";
      toast.error(errorMsg);
      console.error("Failed to delete subscription:", error);
    }
  };

  if (subsLoading || transLoading) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const subscriptions = subData?.data || [];
  const transactions = transData?.data || [];

  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const activeTrail = activeSubscriptions.filter(s => s.planType === 'trial').length;
  const activePremium = activeSubscriptions.filter(s => s.planType === 'premium').length;
  const totalActive = activeTrail + activePremium;

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 border-green-300 text-green-700";
      case "cancelled":
        return "bg-red-100 border-red-300 text-red-700";
      case "expired":
        return "bg-slate-100 border-slate-300 text-slate-700";
      default:
        return "bg-slate-100 border-slate-300 text-slate-700";
    }
  };

  const getSubscriptionPrice = (planType: string, billingCycle: string) => {
    if (planType === 'trial') return 0;
    if (planType === 'premium') {
      if (billingCycle === 'yearly') return 6.99;
      return 9.99; // monthly default
    }
    return 0;
  };

  const calculateTotalRevenue = () => {
    return activeSubscriptions.reduce((total, sub) => {
      return total + getSubscriptionPrice(sub.planType, sub.billingCycle || 'monthly');
    }, 0);
  };

  const totalRevenue = calculateTotalRevenue();

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Subscriptions</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Subscription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Active Subscription Total",
            value: totalActive,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Active Trail",
            value: activeTrail,
            icon: Zap,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Monthly Revenue",
            value: `$${totalRevenue.toFixed(2)} USD`,
            icon: Users,
            color: "from-purple-500 to-pink-500",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="bg-white border-slate-200 p-6 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {["all", "active", "cancelled", "expired"].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status as any)}
            variant={filter === status ? "default" : "outline"}
            className={
              filter === status
                ? ""
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="text-slate-900">Customer</TableHead>
                <TableHead className="text-slate-900">Plan Type</TableHead>
                <TableHead className="text-slate-900">Status</TableHead>
                <TableHead className="text-slate-900">Start Date</TableHead>
                <TableHead className="text-slate-900">End Date</TableHead>
                <TableHead className="text-slate-900">Amount</TableHead>
                <TableHead className="text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.slice(0, 5).map((sub, idx) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="text-slate-900 font-medium">{sub.userEmail?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-slate-600">{sub.userEmail || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{sub.planType || 'Standard'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={sub.isActive ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'}
                    >
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {sub.subscriptionStart ? new Date(sub.subscriptionStart).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {sub.subscriptionEnd ? new Date(sub.subscriptionEnd).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    ${getSubscriptionPrice(sub.planType, sub.billingCycle || 'monthly').toFixed(2)} {sub.billingCycle === 'yearly' ? '/ year' : '/ month'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSubscription(sub)}
                        className="border-slate-300 hover:bg-slate-100 text-slate-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleteSubscriptionMutation.isPending}
                        className="border-red-300 hover:bg-red-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      {isCreateModalOpen && (
        <SubscriptionEditModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          isLoading={createSubscriptionMutation.isPending}
          title="Create Subscription"
        />
      )}

      {editingSubscription && (
        <SubscriptionEditModal
          isOpen={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSubmit={handleUpdate}
          initialData={{
            user_id: editingSubscription.userId,
            plan_type: editingSubscription.planType,
            billing_cycle: editingSubscription.billingCycle,
            is_active: editingSubscription.isActive,
            subscription_start: editingSubscription.subscriptionStart,
            subscription_end: editingSubscription.subscriptionEnd,
            trial_start: editingSubscription.trialStart,
            trial_end: editingSubscription.trialEnd,
          }}
          isLoading={updateSubscriptionMutation.isPending}
          title="Edit Subscription"
        />
      )}
    </div>
  );
};
