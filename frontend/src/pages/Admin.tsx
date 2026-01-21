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
  Activity,
  Loader2,
  FileCode,
  Send,
  TrendingUp,
  BookOpen,
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
import { AdminDashboardContent, UsersTable, SubscriptionsTable, TransactionsTable, SubscriptionsView, ServerMonitoring, UrlsTable, EmailTemplateManagement, SendEmail } from "@/components/admin";
import { ClarityDetailedAnalytics } from "@/components/analytics/ClarityDetailedAnalytics";
import BlogManagement from "@/pages/admin/BlogManagement";
import { 
  useAdminPaymentTransactions, 
  useAdminErrorLogs, 
  useAdminReviews, 
  useAdminContacts,
  useAdminBackgroundTasks,
  useAdminDailySearchUsage
} from "@/hooks/useAdminApi";
import type { DailySearchUsage } from "@/hooks/useAdminApi";

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
    description: "Comprehensive analytics & insights",
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
    description: "Payment transactions",
  },
  {
    title: "Subscriptions",
    icon: CreditCard,
    value: "subscriptions",
    description: "User subscriptions",
  },
  {
    title: "Server Monitoring",
    icon: Activity,
    value: "monitoring",
    description: "Docker & Celery health",
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
  {
    title: "Email Templates",
    icon: FileCode,
    value: "email-templates",
    description: "Manage email templates",
  },
  {
    title: "Send Email",
    icon: Send,
    value: "send-email",
    description: "Send emails to users",
  },
  {
    title: "Daily Search Usage",
    icon: TrendingUp,
    value: "daily-search-usage",
    description: "Monitor search usage patterns",
  },
  {
    title: "Blog Management",
    icon: BookOpen,
    value: "blog-management",
    description: "Create and manage blog posts",
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
        return <ClarityDetailedAnalytics />;
      case "users":
        return <UsersTable />;
      case "transactions":
        return <TransactionsTable />;
      case "subscriptions":
        return <SubscriptionsTable />;
      case "monitoring":
        return <ServerMonitoring />;
      case "logs":
        return <LogsView />;
      case "reviews":
        return <ReviewsView />;
      case "contacts":
        return <ContactsView />;
      case "email-templates":
        return <EmailTemplateManagement />;
      case "send-email":
        return <SendEmail />;
      case "daily-search-usage":
        return <DailySearchUsageView />;
      case "blog-management":
        return <BlogManagement />;
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

// Transactions View Component
const TransactionsView = () => {
  const { data: transactionData, isLoading } = useAdminPaymentTransactions(0, 50);

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const transactions = transactionData?.data || [];
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const failedCount = transactions.filter(t => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "bg-green-50 border-green-200" },
          { label: "Total Transactions", value: transactions.length.toString(), color: "bg-blue-50 border-blue-200" },
          { label: "Failed Transactions", value: failedCount.toString(), color: "bg-red-50 border-red-200" },
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((txn, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-700">{txn.id?.substring(0, 8) || `TXN-${1001 + idx}`}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900">${txn.amount?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      txn.status === 'success' ? 'bg-green-100 text-green-700' :
                      txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {txn.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}</td>
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
  const { data: errorData, isLoading } = useAdminErrorLogs(0, 50);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const errorLogs = errorData?.data || [];
  const filteredLogs = filterType === 'all' 
    ? errorLogs 
    : errorLogs.filter((e: any) => e.errorType === filterType);

  const errorTypes = [...new Set(errorLogs.map((e: any) => e.errorType))];

  const getErrorSeverity = (errorType: string): 'critical' | 'warning' | 'info' => {
    if (errorType?.includes('critical') || errorType?.includes('error') || errorType?.includes('Error')) return 'critical';
    if (errorType?.includes('warning') || errorType?.includes('timeout')) return 'warning';
    return 'info';
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-900';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-900';
      default: return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      default: return '🔵';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Errors", value: errorData?.total?.toString() || '0', color: "bg-red-50 border-red-200" },
          { label: "Recent 24h", value: errorLogs.filter((e: any) => {
            const date = new Date(e.createdAt);
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return date > dayAgo;
          }).length.toString(), color: "bg-orange-50 border-orange-200" },
          { label: "Critical", value: errorLogs.filter((e: any) => getErrorSeverity(e.errorType) === 'critical').length.toString(), color: "bg-red-100 border-red-300" },
          { label: "Types", value: errorTypes.length.toString(), color: "bg-purple-50 border-purple-200" },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-lg border ${stat.color} p-6`}>
            <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Filter by Error Type</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            All ({errorLogs.length})
          </button>
          {errorTypes.map((type: any) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterType === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {type} ({errorLogs.filter((e: any) => e.errorType === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Error Logs ({filteredLogs.length})</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log: any, idx: number) => {
            const severity = getErrorSeverity(log.errorType);
            const isExpanded = expandedLog === log.id;
            
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all ${getSeverityColor(severity)}`}
              >
                <button
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{getSeverityIcon(severity)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold truncate">{log.functionName || 'Unknown Function'}</p>
                        <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded whitespace-nowrap font-medium">
                          {log.errorType}
                        </span>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{log.errorMessage}</p>
                      <p className="text-xs text-slate-600 mt-2">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                    <div className="text-slate-500 flex-shrink-0">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-3">
                    {/* Function Name */}
                    <div>
                      <p className="text-xs font-semibold opacity-75 mb-1">Function</p>
                      <p className="text-sm bg-white bg-opacity-40 rounded p-2 font-mono">{log.functionName}</p>
                    </div>

                    {/* Error Type */}
                    <div>
                      <p className="text-xs font-semibold opacity-75 mb-1">Error Type</p>
                      <p className="text-sm bg-white bg-opacity-40 rounded p-2 font-mono">{log.errorType}</p>
                    </div>

                    {/* Error Message */}
                    <div>
                      <p className="text-xs font-semibold opacity-75 mb-1">Error Message</p>
                      <div className="bg-white bg-opacity-40 rounded p-3 max-h-64 overflow-y-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words">{log.errorMessage}</pre>
                      </div>
                    </div>

                    {/* Error Details/Traceback */}
                    {log.errorDetails && (
                      <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">Error Details</p>
                        <div className="bg-white bg-opacity-40 rounded p-3 max-h-64 overflow-y-auto">
                          {typeof log.errorDetails === 'string' ? (
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words">{log.errorDetails}</pre>
                          ) : log.errorDetails.traceback ? (
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words">{log.errorDetails.traceback}</pre>
                          ) : (
                            <pre className="text-xs font-mono whitespace-pre-wrap break-words">{JSON.stringify(log.errorDetails, null, 2)}</pre>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Query Context */}
                    {log.queryContext && (
                      <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">Query Context</p>
                        <p className="text-sm bg-white bg-opacity-40 rounded p-2 font-mono text-xs">{log.queryContext}</p>
                      </div>
                    )}

                    {/* User ID */}
                    {log.userId && (
                      <div>
                        <p className="text-xs font-semibold opacity-75 mb-1">User ID</p>
                        <p className="text-sm bg-white bg-opacity-40 rounded p-2 font-mono text-xs break-all">{log.userId}</p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex gap-2 flex-wrap text-xs">
                      <span className="bg-white bg-opacity-40 rounded px-2 py-1 font-mono">
                        ID: {log.id?.slice(0, 8) || 'N/A'}...
                      </span>
                      <span className="bg-white bg-opacity-40 rounded px-2 py-1">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {filterType === 'all' ? 'No error logs found' : `No logs of type "${filterType}"`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reviews View Component
const ReviewsView = () => {
  const { data: reviewData, isLoading } = useAdminReviews(0, 50);

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const reviews = reviewData?.data || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0';

  const stats = [
    { label: "Total Reviews", value: reviewData?.total?.toString() || '0', icon: "⭐" },
    { label: "Avg. Rating", value: `${avgRating}/5`, icon: "📈" },
    { label: "This Week", value: reviews.filter(r => {
      const date = new Date(r.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date > weekAgo;
    }).length.toString(), icon: "📊" },
    { label: "Pending", value: "0", icon: "⏳" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
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
          {reviews.slice(0, 5).map((review, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900">{review.title || 'Untitled Review'}</p>
                  <p className="text-sm text-slate-600 mt-1">Rating: {review.rating}/5</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < (review.rating || 0) ? "text-yellow-400" : "text-slate-300"}>⭐</span>
                  ))}
                </div>
              </div>
              {review.description && (
                <p className="text-sm text-slate-600 mt-3">{review.description}</p>
              )}
              {review.video_url && (
                <p className="text-xs text-blue-600 mt-2">📹 Has video</p>
              )}
              <p className="text-xs text-slate-500 mt-3">{review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recently'}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-8 text-slate-500">No reviews found</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Contacts View Component
const ContactsView = () => {
  const { data: contactData, isLoading } = useAdminContacts(0, 50);

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const contacts = contactData?.data || [];
  const resolvedCount = contacts.filter(c => c.status === 'resolved').length;
  const pendingCount = contacts.filter(c => c.status !== 'resolved').length;

  const stats = [
    { label: "Total Queries", value: contactData?.total?.toString() || '0', color: "bg-blue-50" },
    { label: "Resolved", value: resolvedCount.toString(), color: "bg-green-50" },
    { label: "Pending", value: pendingCount.toString(), color: "bg-yellow-50" },
    { label: "Response Time", value: "2.3h", color: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-lg border border-slate-200 p-6`}>
            <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">User Queries</h3>
        <div className="space-y-3">
          {contacts.map((contact, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{contact.name || 'Unknown User'}</p>
                  <p className="text-sm text-slate-600 mt-1">Email: {contact.email || 'N/A'}</p>
                  <p className="text-sm text-slate-600">Subject: {contact.subject || 'N/A'}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                  contact.status === 'resolved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {contact.status === 'resolved' ? "Resolved" : "Pending"}
                </span>
              </div>
              {contact.message && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{contact.message}</p>
              )}
              <p className="text-xs text-slate-500 mt-3">{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Recently'}</p>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="text-center py-8 text-slate-500">No contact queries found</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Daily Search Usage View Component
const DailySearchUsageView = () => {
  const { data: searchUsageData, isLoading } = useAdminDailySearchUsage(0, 100);
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'all'>('week');

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  const searchUsage = searchUsageData?.data || [];
  
  // Filter data based on selected period (for table only)
  const getFilteredData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return searchUsage.filter(item => {
      const itemDate = new Date(item.search_date);
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      
      if (filterPeriod === 'week') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return itemDateOnly >= sevenDaysAgo && itemDateOnly <= today;
      } else if (filterPeriod === 'month') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return itemDateOnly >= thirtyDaysAgo && itemDateOnly <= today;
      }
      return true; // 'all'
    });
  };
  
  const filteredSearchUsage = getFilteredData();
  
  // Calculate statistics (ALWAYS from all-time data, not filtered)
  const totalSearches = searchUsage.reduce((sum, item) => sum + (item.search_count || 0), 0);
  
  // Group by date and sum searches per day
  const searchesByDay = new Map<string, number>();
  searchUsage.forEach(item => {
    const date = item.search_date || '';
    const current = searchesByDay.get(date) || 0;
    searchesByDay.set(date, current + (item.search_count || 0));
  });
  
  const dailySearchCounts = Array.from(searchesByDay.values());
  const avgSearchesPerDay = dailySearchCounts.length > 0 
    ? (totalSearches / dailySearchCounts.length).toFixed(2) 
    : '0';
  
  // Total guest searches (where user_id is null)
  const totalGuestSearches = searchUsage
    .filter(item => !item.user_id)
    .reduce((sum, item) => sum + (item.search_count || 0), 0);
  
  // Last 24 hours total searches
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last24HrsSearches = searchUsage
    .filter(item => {
      const itemDate = new Date(item.search_date);
      return itemDate > oneDayAgo && itemDate <= now;
    })
    .reduce((sum, item) => sum + (item.search_count || 0), 0);
  
  const peakSearchDay: DailySearchUsage | undefined = searchUsage.length > 0 
    ? searchUsage.reduce((max, item) => 
        (item.search_count || 0) > (max.search_count || 0) ? item : max)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 font-medium">Total Searches</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalSearches}</p>
          <p className="text-xs text-slate-500 mt-2">Sum of all search_count across all records</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 font-medium">Avg Per Day</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{avgSearchesPerDay}</p>
          <p className="text-xs text-slate-500 mt-2">Total searches ÷ number of unique days</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 font-medium">Total Guest Searches</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalGuestSearches}</p>
          <p className="text-xs text-slate-500 mt-2">Searches from guest/non-authenticated users</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 font-medium">Last 24 Hrs Searches</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{last24HrsSearches}</p>
          <p className="text-xs text-slate-500 mt-2">Total searches in the past 24 hours</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700 mb-3">View Period</p>
        <div className="flex flex-wrap gap-2">
          {(['week', 'month', 'all'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterPeriod === period
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Search Usage Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Daily Search Usage Details</h3>
        </div>

        <div className="overflow-x-auto">
          {filteredSearchUsage.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Session ID</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">Search Count</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSearchUsage.map((item, idx) => {
                  const searchCount = item.search_count || 0;
                  let statusColor = 'bg-blue-50 text-blue-700';
                  let statusLabel = 'Low Activity';

                  if (searchCount > 20) {
                    statusColor = 'bg-red-50 text-red-700';
                    statusLabel = 'High Activity';
                  } else if (searchCount > 10) {
                    statusColor = 'bg-yellow-50 text-yellow-700';
                    statusLabel = 'Medium Activity';
                  }

                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {item.search_date ? new Date(item.search_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.user_id ? item.user_id.substring(0, 8) + '...' : 'Guest'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.session_id ? item.session_id.substring(0, 12) + '...' : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                          {searchCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-medium">No search usage data available</p>
              <p className="text-sm mt-1">Search usage will appear here as users perform searches</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Active Date */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">📊 Most Active Date</h4>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-slate-900">
              {peakSearchDay?.search_count || 0}
            </p>
            <p className="text-sm text-slate-600">
              {peakSearchDay?.search_date ? new Date(peakSearchDay.search_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No data'}
            </p>
          </div>
        </div>

        {/* Usage Trend */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">📈 Usage Trend</h4>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-slate-900">
              {dailySearchCounts.length > 0 ? (totalSearches / dailySearchCounts.length).toFixed(1) : 0} avg
            </p>
            <p className="text-sm text-slate-600">
              searches per tracked day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;