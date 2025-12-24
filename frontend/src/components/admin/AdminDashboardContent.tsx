import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const revenueData = [
  { month: "Jan", revenue: 3200, subscriptions: 240 },
  { month: "Feb", revenue: 3800, subscriptions: 280 },
  { month: "Mar", revenue: 4500, subscriptions: 320 },
  { month: "Apr", revenue: 4200, subscriptions: 310 },
  { month: "May", revenue: 5100, subscriptions: 380 },
  { month: "Jun", revenue: 5900, subscriptions: 420 },
];

const systemHealthData = [
  { name: "API Time", value: 87, target: 100 },
  { name: "DB Uptime", value: 99.98, target: 100 },
  { name: "Cache Hit", value: 94, target: 100 },
  { name: "Memory", value: 72, target: 100 },
];

const recentActivities = [
  {
    event: "New Premium Subscription",
    user: "john@example.com",
    time: "2 hours ago",
    type: "success",
    icon: TrendingUp,
  },
  {
    event: "Trial Conversion",
    user: "sarah@example.com",
    time: "4 hours ago",
    type: "success",
    icon: Activity,
  },
  {
    event: "User Signup",
    user: "mike@example.com",
    time: "6 hours ago",
    type: "info",
    icon: Activity,
  },
  {
    event: "Payment Failed",
    user: "jane@example.com",
    time: "8 hours ago",
    type: "warning",
    icon: AlertCircle,
  },
  {
    event: "API Rate Limit Alert",
    user: "system@imo.com",
    time: "12 hours ago",
    type: "warning",
    icon: AlertCircle,
  },
];

export const AdminDashboardContent = () => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Revenue and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% this month
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#0f172a" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0f766e"
                strokeWidth={2}
                dot={{ fill: "#0f766e", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#0369a1"
                strokeWidth={2}
                dot={{ fill: "#0369a1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* System Health */}
        <Card className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            System Health
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={systemHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#0f172a" }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#0f766e"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="target"
                fill="#cbd5e1"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "API Response Time",
            value: "87ms",
            target: "100ms",
            status: "good",
          },
          {
            label: "Database Uptime",
            value: "99.98%",
            target: "100%",
            status: "excellent",
          },
          {
            label: "Cache Hit Rate",
            value: "94%",
            target: "100%",
            status: "good",
          },
          {
            label: "Active Users",
            value: "1,250",
            target: "2,000",
            status: "normal",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            onMouseEnter={() => setHoveredMetric(stat.label)}
            onMouseLeave={() => setHoveredMetric(null)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`bg-white border p-4 transition-all cursor-pointer ${
                hoveredMetric === stat.label
                  ? "border-slate-900 shadow-md"
                  : "border-slate-200"
              }`}
            >
              <p className="text-xs text-slate-600 mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Target: {stat.target}
                  </p>
                </div>
                <Badge
                  className={
                    stat.status === "excellent"
                      ? "bg-green-100 text-green-700"
                      : stat.status === "good"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {stat.status}
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h3>
          <Badge variant="outline" className="text-slate-600">
            <Clock className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>

        <div className="space-y-3">
          {recentActivities.map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "success"
                        ? "bg-green-100"
                        : activity.type === "warning"
                        ? "bg-yellow-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        activity.type === "success"
                          ? "text-green-700"
                          : activity.type === "warning"
                          ? "text-yellow-700"
                          : "text-blue-700"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.event}
                    </p>
                    <p className="text-xs text-slate-500">{activity.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
