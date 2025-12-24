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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

const mockSubscriptions = [
  {
    id: "sub_1",
    user: "John Doe",
    email: "john@example.com",
    plan: "Premium Annual",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    amount: 99.99,
    paymentMethod: "Stripe",
  },
  {
    id: "sub_2",
    user: "Sarah Smith",
    email: "sarah@example.com",
    plan: "Trial 14 Days",
    status: "active",
    startDate: "2024-12-20",
    endDate: "2025-01-03",
    amount: 0,
    paymentMethod: "Trial",
  },
  {
    id: "sub_3",
    user: "Jane Wilson",
    email: "jane@example.com",
    plan: "Premium Monthly",
    status: "active",
    startDate: "2024-11-24",
    endDate: "2025-01-24",
    amount: 9.99,
    paymentMethod: "Stripe",
  },
  {
    id: "sub_4",
    user: "Mike Johnson",
    email: "mike@example.com",
    plan: "Premium Monthly",
    status: "cancelled",
    startDate: "2024-10-01",
    endDate: "2024-11-01",
    amount: 9.99,
    paymentMethod: "Stripe",
  },
  {
    id: "sub_5",
    user: "Alex Brown",
    email: "alex@example.com",
    plan: "Premium Annual",
    status: "expired",
    startDate: "2023-12-24",
    endDate: "2024-12-24",
    amount: 99.99,
    paymentMethod: "Stripe",
  },
];

const chartData = [
  { date: "Dec 18", active: 420, trials: 85, revenue: 3200 },
  { date: "Dec 19", active: 425, trials: 92, revenue: 3400 },
  { date: "Dec 20", active: 430, trials: 110, revenue: 3600 },
  { date: "Dec 21", active: 435, trials: 115, revenue: 3800 },
  { date: "Dec 22", active: 440, trials: 118, revenue: 4000 },
  { date: "Dec 23", active: 445, trials: 120, revenue: 4300 },
  { date: "Dec 24", active: 450, trials: 120, revenue: 4500 },
];

export const SubscriptionsTable = () => {
  const [filter, setFilter] = useState<"all" | "active" | "cancelled" | "expired">(
    "all"
  );

  const filteredSubscriptions =
    filter === "all"
      ? mockSubscriptions
      : mockSubscriptions.filter((sub) => sub.status === filter);

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

  const stats = {
    activeSubscriptions: mockSubscriptions.filter((s) => s.status === "active")
      .length,
    totalRevenue: mockSubscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.amount, 0),
    cancellationRate: (
      (mockSubscriptions.filter((s) => s.status === "cancelled").length /
        mockSubscriptions.length) *
      100
    ).toFixed(1),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Active Subscriptions",
            value: stats.activeSubscriptions,
            icon: TrendingUp,
            color: "from-green-500 to-emerald-500",
          },
          {
            label: "Monthly Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            icon: Calendar,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Cancellation Rate",
            value: `${stats.cancellationRate}%`,
            icon: TrendingUp,
            color: "from-orange-500 to-red-500",
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

      {/* Chart */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Subscription Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
              labelStyle={{ color: "#0f172a" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="active"
              stroke="#059669"
              strokeWidth={2}
              name="Active Subs"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="trials"
              stroke="#d97706"
              strokeWidth={2}
              name="Trials"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

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
                <TableHead className="text-slate-900">Plan</TableHead>
                <TableHead className="text-slate-900">Status</TableHead>
                <TableHead className="text-slate-900">Start Date</TableHead>
                <TableHead className="text-slate-900">End Date</TableHead>
                <TableHead className="text-slate-900">Amount</TableHead>
                <TableHead className="text-slate-900">Payment</TableHead>
                <TableHead className="text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((sub, idx) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="text-slate-900 font-medium">{sub.user}</p>
                      <p className="text-xs text-slate-600">{sub.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{sub.plan}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeStyles(sub.status)}
                    >
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(sub.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    ${sub.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 border-blue-300 text-blue-700"
                    >
                      {sub.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-100 text-slate-900"
                    >
                      Manage
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
