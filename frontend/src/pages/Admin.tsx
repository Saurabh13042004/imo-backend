import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  Users,
  CreditCard,
  FileText,
  Star,
  Mail,
  Loader2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AdminDashboardContent, UsersTable, SubscriptionsTable, UrlsTable } from "@/components/admin";

const menuItems = [
  {
    title: "Home",
    icon: Home,
    value: "home",
    description: "Dashboard overview",
  },
  {
    title: "Activity & Analytics",
    icon: BarChart3,
    value: "analytics",
    description: "Daily search usage & interactions",
  },
  {
    title: "Users",
    icon: Users,
    value: "users",
    description: "Users & user activity",
  },
  {
    title: "Transactions",
    icon: CreditCard,
    value: "transactions",
    description: "Subscriptions & events",
  },
  {
    title: "Logs",
    icon: FileText,
    value: "logs",
    description: "Background tasks & errors",
  },
  {
    title: "Reviews",
    icon: Star,
    value: "reviews",
    description: "User reviews",
  },
  {
    title: "Contacts",
    icon: Mail,
    value: "contacts",
    description: "User queries",
  },
];

const Admin = () => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { isAdmin, loading: adminCheckLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("home");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (adminCheckLoading) {
      return;
    }

    if (!isAdmin) {
      navigate("/");
      return;
    }

    setLoading(false);
  }, [isAuthenticated, isAdmin, adminCheckLoading, navigate]);

  if (loading || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-slate-900 mb-4" />
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "home":
        return <AdminDashboardContent />;
      case "analytics":
        return <ActivityAnalyticsView />;
      case "users":
        return <UsersTable />;
      case "transactions":
        return <TransactionsView />;
      case "logs":
        return <LogsView />;
      case "reviews":
        return <ReviewsView />;
      case "contacts":
        return <ContactsView />;
      default:
        return <AdminDashboardContent />;
    }
  };

  const currentMenuItem = menuItems.find((item) => item.value === activeMenu);

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar className="bg-white border-r border-slate-200">
          <SidebarHeader className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">IMO Admin</h2>
                <p className="text-xs text-slate-500">Control Panel</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-6">
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.value;

                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => setActiveMenu(item.value)}
                      className={`transition-all duration-200 rounded-lg ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-900"}`}>
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{currentMenuItem?.title}</h1>
                  <p className="text-slate-600 mt-1">{currentMenuItem?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Welcome back</p>
                  <p className="font-semibold text-slate-900">{user?.full_name}</p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Analytics View Component
const ActivityAnalyticsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Daily Searches", value: "12.4K", change: "+5.2%", icon: "📊" },
          { label: "Active Users", value: "2,345", change: "+12.1%", icon: "👥" },
          { label: "Avg. Session", value: "8m 42s", change: "+2.3%", icon: "⏱️" },
          { label: "User Interactions", value: "45.2K", change: "+8.4%", icon: "🔗" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className="text-xs text-green-600 font-semibold mt-2">{stat.change}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Trends (Last 7 Days)</h3>
        <div className="h-80 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 border-dashed">
          <p className="text-slate-500">Chart visualization goes here</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Search Queries</h3>
          <div className="space-y-3">
            {["iPhone 15 Pro", "Samsung Galaxy", "MacBook Pro", "iPad Air", "AirPods Pro"].map((query, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                <span className="text-slate-700">{query}</span>
                <span className="text-sm font-semibold text-slate-600">{1200 - idx * 150}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Engagement</h3>
          <div className="space-y-4">
            {[
              { label: "Page Views", value: 85 },
              { label: "Avg. Time on Site", value: 72 },
              { label: "Conversion Rate", value: 58 },
              { label: "Return Users", value: 91 },
            ].map((metric, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{metric.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Transactions View Component
const TransactionsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: "$12,450.00", color: "bg-green-50 border-green-200" },
          { label: "Active Subscriptions", value: "324", color: "bg-blue-50 border-blue-200" },
          { label: "Failed Transactions", value: "12", color: "bg-red-50 border-red-200" },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-lg border ${stat.color} p-6`}>
            <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <SubscriptionsTable />

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Transaction ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-700">TXN-{1001 + idx}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">User {idx + 1}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900">${99.99 * (idx + 1)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">Dec {24 - idx}, 2025</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Logs View Component
const LogsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Background Tasks</h3>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">All Running</span>
        </div>
        <div className="space-y-3">
          {[
            { task: "Email Notifications", status: "running", progress: 95 },
            { task: "Database Backup", status: "running", progress: 60 },
            { task: "Cache Optimization", status: "running", progress: 100 },
            { task: "Log Cleanup", status: "scheduled", progress: 0 },
          ].map((log, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">{log.task}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  log.status === "running" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {log.status}
                </span>
              </div>
              {log.progress > 0 && (
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${log.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Error Logs</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {[
            { severity: "error", message: "Failed to process payment for user #1234" },
            { severity: "warning", message: "High memory usage detected on server" },
            { severity: "error", message: "Email service timeout after 30 seconds" },
            { severity: "info", message: "User backup completed successfully" },
          ].map((log, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${
              log.severity === "error" ? "bg-red-50 border-red-200" : 
              log.severity === "warning" ? "bg-yellow-50 border-yellow-200" : 
              "bg-blue-50 border-blue-200"
            }`}>
              <div className="flex items-start gap-3">
                <span className={`text-lg ${
                  log.severity === "error" ? "text-red-600" :
                  log.severity === "warning" ? "text-yellow-600" :
                  "text-blue-600"
                }`}>
                  {log.severity === "error" ? "❌" : log.severity === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    log.severity === "error" ? "text-red-900" :
                    log.severity === "warning" ? "text-yellow-900" :
                    "text-blue-900"
                  }`}>
                    {log.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Just now</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reviews View Component
const ReviewsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: "1,234", icon: "⭐" },
          { label: "Avg. Rating", value: "4.7/5", icon: "📈" },
          { label: "This Week", value: "127", icon: "📊" },
          { label: "Pending", value: "23", icon: "⏳" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Reviews</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900">User {idx + 1}</p>
                  <p className="text-sm text-slate-600">Reviewed: iPhone 15 Pro</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < 4 ? "text-yellow-400" : "text-slate-300"}>⭐</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3">Great product! Exceeded my expectations. Highly recommended for everyone.</p>
              <p className="text-xs text-slate-500 mt-3">2 days ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Contacts View Component
const ContactsView = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Queries", value: "567", color: "bg-blue-50" },
          { label: "Resolved", value: "489", color: "bg-green-50" },
          { label: "Pending", value: "45", color: "bg-yellow-50" },
          { label: "Response Time", value: "2.3h", color: "bg-purple-50" },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-lg border border-slate-200 p-6`}>
            <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">User Queries</h3>
        <div className="space-y-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Query #{1001 + idx}</p>
                  <p className="text-sm text-slate-600 mt-1">Subject: Issue with subscription billing</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  idx % 2 === 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}>
                  {idx % 2 === 0 ? "Pending" : "Resolved"}
                </span>
              </div>
              <p className="text-sm text-slate-600">Customer is experiencing issues with their subscription renewal...</p>
              <p className="text-xs text-slate-500 mt-3">{1 + idx} day ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
