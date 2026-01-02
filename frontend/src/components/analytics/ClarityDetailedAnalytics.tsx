import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Smartphone,
  Monitor,
  Tablet,
  MousePointerClick,
  AlertTriangle,
  Clock,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const CLARITY_API_ENDPOINT = import.meta.env.VITE_CLARITY_API_ENDPOINT;
const CLARITY_TOKEN = import.meta.env.VITE_CLARITY_API_TOKEN;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const DEVICE_COLORS = {
  Mobile: '#3b82f6',
  Tablet: '#8b5cf6',
  PC: '#10b981',
  Other: '#6b7280',
};

interface RawMetricData {
  metricName: string;
  information: Array<any>;
}

interface DetailedAnalytics {
  traffic: Array<{
    device: string;
    totalSessions: number;
    botSessions: number;
    distinctUsers: number;
    pagesPerSession: number;
  }>;
  engagement: Array<{
    device: string;
    totalTime: number;
    activeTime: number;
    engagementRatio: number;
  }>;
  scrollDepth: Array<{
    device: string;
    averageDepth: number;
  }>;
  userBehavior: {
    deadClicks: Array<{ device: string; count: number; percentage: number }>;
    rageClicks: Array<{ device: string; count: number; percentage: number }>;
    errorClicks: Array<{ device: string; count: number; percentage: number }>;
    quickBackClicks: Array<{ device: string; count: number; percentage: number }>;
    scriptErrors: Array<{ device: string; count: number; percentage: number }>;
    excessiveScroll: Array<{ device: string; count: number; percentage: number }>;
  };
  summary: {
    totalSessions: number;
    totalUsers: number;
    totalBots: number;
    totalDeadClicks: number;
    totalRageClicks: number;
    totalErrorClicks: number;
    totalQuickBackClicks: number;
    totalScriptErrors: number;
    totalExcessiveScroll: number;
    avgScrollDepth: number;
    avgEngagementTime: number;
  };
}

async function fetchDetailedClarityData(): Promise<DetailedAnalytics> {
  try {
    if (!CLARITY_API_ENDPOINT || !CLARITY_TOKEN) {
      throw new Error('Clarity API endpoint or token not configured');
    }

    const params = new URLSearchParams({
      numOfDays: '1',
      dimension1: 'Device',
    });

    const url = `${CLARITY_API_ENDPOINT}?${params}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLARITY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const rawData: RawMetricData[] = await response.json();
    const metricsMap = new Map<string, any[]>();
    
    rawData.forEach((metric) => {
      metricsMap.set(metric.metricName, metric.information || []);
    });

    // Extract Traffic Data
    const trafficData = metricsMap.get('Traffic') || [];
    const traffic = trafficData.map((item: any) => ({
      device: item.Device || 'Unknown',
      totalSessions: parseInt(item.totalSessionCount || '0', 10),
      botSessions: parseInt(item.totalBotSessionCount || '0', 10),
      distinctUsers: parseInt(item.distinctUserCount || '0', 10),
      pagesPerSession: parseFloat(item.pagesPerSessionPercentage || '0'),
    }));

    // Extract Engagement Data
    const engagementData = metricsMap.get('EngagementTime') || [];
    const engagement = engagementData.map((item: any) => ({
      device: item.Device || 'Unknown',
      totalTime: parseInt(item.totalTime || '0', 10),
      activeTime: parseInt(item.activeTime || '0', 10),
      engagementRatio:
        parseInt(item.totalTime || '0', 10) > 0
          ? Math.round(
              (parseInt(item.activeTime || '0', 10) /
                parseInt(item.totalTime || '0', 10)) *
                100
            )
          : 0,
    }));

    // Extract Scroll Depth
    const scrollData = metricsMap.get('ScrollDepth') || [];
    const scrollDepth = scrollData.map((item: any) => ({
      device: item.Device || 'Unknown',
      averageDepth: parseFloat(item.averageScrollDepth || '0'),
    }));

    // Extract User Behavior Issues
    const deadClicksData = metricsMap.get('DeadClickCount') || [];
    const rageClicksData = metricsMap.get('RageClickCount') || [];
    const errorClicksData = metricsMap.get('ErrorClickCount') || [];
    const quickBackData = metricsMap.get('QuickbackClick') || [];
    const scriptErrorsData = metricsMap.get('ScriptErrorCount') || [];
    const excessiveScrollData = metricsMap.get('ExcessiveScroll') || [];

    const createBehaviorArray = (data: any[]) =>
      data.map((item: any) => ({
        device: item.Device || 'Unknown',
        count: parseInt(item.subTotal || '0', 10),
        percentage: parseFloat(item.sessionsWithMetricPercentage || '0'),
      }));

    const userBehavior = {
      deadClicks: createBehaviorArray(deadClicksData),
      rageClicks: createBehaviorArray(rageClicksData),
      errorClicks: createBehaviorArray(errorClicksData),
      quickBackClicks: createBehaviorArray(quickBackData),
      scriptErrors: createBehaviorArray(scriptErrorsData),
      excessiveScroll: createBehaviorArray(excessiveScrollData),
    };

    // Calculate summaries
    const summary = {
      totalSessions: traffic.reduce((sum, t) => sum + t.totalSessions, 0),
      totalUsers: traffic.reduce((sum, t) => sum + t.distinctUsers, 0),
      totalBots: traffic.reduce((sum, t) => sum + t.botSessions, 0),
      totalDeadClicks: userBehavior.deadClicks.reduce((sum, d) => sum + d.count, 0),
      totalRageClicks: userBehavior.rageClicks.reduce((sum, d) => sum + d.count, 0),
      totalErrorClicks: userBehavior.errorClicks.reduce((sum, d) => sum + d.count, 0),
      totalQuickBackClicks: userBehavior.quickBackClicks.reduce((sum, d) => sum + d.count, 0),
      totalScriptErrors: userBehavior.scriptErrors.reduce((sum, d) => sum + d.count, 0),
      totalExcessiveScroll: userBehavior.excessiveScroll.reduce((sum, d) => sum + d.count, 0),
      avgScrollDepth:
        scrollDepth.length > 0
          ? Math.round(
              scrollDepth.reduce((sum, s) => sum + s.averageDepth, 0) / scrollDepth.length
            )
          : 0,
      avgEngagementTime:
        engagement.length > 0
          ? Math.round(engagement.reduce((sum, e) => sum + e.totalTime, 0) / engagement.length)
          : 0,
    };

    return {
      traffic,
      engagement,
      scrollDepth,
      userBehavior,
      summary,
    };
  } catch (error) {
    console.error('Error fetching detailed Clarity data:', error);
    throw error;
  }
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-600',
}: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  bgColor?: string;
  textColor?: string;
}) => (
  <Card className={`${bgColor} hover:shadow-lg transition-shadow`}>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center justify-between">
        <span>{title}</span>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
      {trend && (
        <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend.value)}%
        </p>
      )}
    </CardContent>
  </Card>
);

const DeviceBreakdownSection = ({ analytics }: { analytics: DetailedAnalytics }) => {
  const deviceTableData = analytics.traffic.map((t) => ({
    device: t.device,
    sessions: t.totalSessions,
    users: t.distinctUsers,
    bots: t.botSessions,
    pagesPerSession: t.pagesPerSession.toFixed(2),
    botPercentage:
      t.totalSessions > 0 ? Math.round((t.botSessions / t.totalSessions) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Device Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceTableData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessions" fill={DEVICE_COLORS.Mobile} name="Sessions" />
              <Bar dataKey="users" fill={DEVICE_COLORS.PC} name="Users" />
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Device</th>
                  <th className="text-right py-2 px-3 font-semibold">Sessions</th>
                  <th className="text-right py-2 px-3 font-semibold">Users</th>
                  <th className="text-right py-2 px-3 font-semibold">Bot %</th>
                  <th className="text-right py-2 px-3 font-semibold">Pages/Session</th>
                </tr>
              </thead>
              <tbody>
                {deviceTableData.map((row) => (
                  <tr key={row.device} className="border-b hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <Badge variant="outline">{row.device}</Badge>
                    </td>
                    <td className="text-right py-2 px-3 font-medium">{row.sessions.toLocaleString()}</td>
                    <td className="text-right py-2 px-3">{row.users.toLocaleString()}</td>
                    <td className="text-right py-2 px-3">
                      <span className={row.botPercentage > 0 ? 'text-red-600 font-medium' : ''}>
                        {row.botPercentage}%
                      </span>
                    </td>
                    <td className="text-right py-2 px-3">{row.pagesPerSession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UserBehaviorIssuesSection = ({ analytics }: { analytics: DetailedAnalytics }) => {
  const issuesData = [
    {
      name: 'Dead Clicks',
      icon: MousePointerClick,
      data: analytics.userBehavior.deadClicks,
      total: analytics.summary.totalDeadClicks,
      color: '#ef4444',
    },
    {
      name: 'Rage Clicks',
      icon: AlertTriangle,
      data: analytics.userBehavior.rageClicks,
      total: analytics.summary.totalRageClicks,
      color: '#f97316',
    },
    {
      name: 'Error Clicks',
      icon: AlertCircle,
      data: analytics.userBehavior.errorClicks,
      total: analytics.summary.totalErrorClicks,
      color: '#ec4899',
    },
    {
      name: 'Quick Back Clicks',
      icon: TrendingDown,
      data: analytics.userBehavior.quickBackClicks,
      total: analytics.summary.totalQuickBackClicks,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {issuesData.map((issue) => {
          const Icon = issue.icon;
          const maxCount = Math.max(...issue.data.map((d) => d.count), 1);
          return (
            <Card key={issue.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: issue.color }} />
                  {issue.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold" style={{ color: issue.color }}>
                    {issue.total.toLocaleString()}
                  </div>
                  <div className="space-y-2">
                    {issue.data.map((item) => (
                      <div key={item.device}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-slate-600">{item.device}</span>
                          <span className="text-xs font-semibold text-slate-900">{item.count}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(item.count / maxCount) * 100}%`,
                              backgroundColor: issue.color,
                            }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{item.percentage.toFixed(2)}% of sessions</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Script Errors and Excessive Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Script Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-4">
              {analytics.summary.totalScriptErrors.toLocaleString()}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.userBehavior.scriptErrors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              Excessive Scroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 mb-4">
              {analytics.summary.totalExcessiveScroll.toLocaleString()}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.userBehavior.excessiveScroll}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Excessive Scrolls" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EngagementTimeSection = ({ analytics }: { analytics: DetailedAnalytics }) => {
  const engagementChartData = analytics.engagement.map((e) => ({
    device: e.device,
    'Total Time': e.totalTime,
    'Active Time': e.activeTime,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Engagement Time by Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total Time" fill="#8b5cf6" name="Total Time (min)" />
              <Bar dataKey="Active Time" fill="#3b82f6" name="Active Time (min)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Ratio by Device</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.engagement.map((e) => (
              <div key={e.device}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-900">{e.device}</span>
                  <span className="text-sm font-semibold text-purple-600">{e.engagementRatio}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                    style={{ width: `${e.engagementRatio}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {e.activeTime} active / {e.totalTime} total minutes
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ScrollDepthSection = ({ analytics }: { analytics: DetailedAnalytics }) => {
  const scrollChartData = analytics.scrollDepth;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Average Scroll Depth by Device
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scrollChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="device" type="category" width={80} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="averageDepth" fill="#3b82f6" name="Scroll Depth %" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scrollChartData.map((item) => (
              <div key={item.device} className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{item.device}</p>
                <div className="text-2xl font-bold text-blue-600">{item.averageDepth.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ClarityDetailedAnalytics() {
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['clarity-detailed-analytics'],
    queryFn: fetchDetailedClarityData,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading('Refreshing analytics...');
    try {
      await refetch();
      toast.dismiss(toastId);
      toast.success('Analytics refreshed');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900">Failed to load detailed analytics</h3>
            <p className="text-sm text-red-700 mt-2">Unable to fetch data from Microsoft Clarity.</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">Loading detailed analytics...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detailed Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive Clarity insights for {currentDate}</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Sessions"
          value={analytics.summary.totalSessions.toLocaleString()}
          subtitle={`${analytics.summary.totalUsers.toLocaleString()} unique users`}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          icon={Users}
          title="Unique Users"
          value={analytics.summary.totalUsers.toLocaleString()}
          subtitle={`${((analytics.summary.totalBots / analytics.summary.totalSessions) * 100 || 0).toFixed(1)}% bots`}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          icon={Clock}
          title="Avg Engagement"
          value={`${analytics.summary.avgEngagementTime}m`}
          subtitle="Average time on site"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard
          icon={Eye}
          title="Avg Scroll Depth"
          value={`${analytics.summary.avgScrollDepth}%`}
          subtitle="Average page scroll"
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
      </div>

      {/* Issues Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={MousePointerClick}
          title="Dead Clicks"
          value={analytics.summary.totalDeadClicks.toLocaleString()}
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Rage Clicks"
          value={analytics.summary.totalRageClicks.toLocaleString()}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        <StatCard
          icon={AlertCircle}
          title="Error Clicks"
          value={analytics.summary.totalErrorClicks.toLocaleString()}
          bgColor="bg-pink-50"
          textColor="text-pink-600"
        />
        <StatCard
          icon={TrendingDown}
          title="Quick Backs"
          value={analytics.summary.totalQuickBackClicks.toLocaleString()}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
        <StatCard
          icon={AlertCircle}
          title="Script Errors"
          value={analytics.summary.totalScriptErrors.toLocaleString()}
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
        <StatCard
          icon={Eye}
          title="Excessive Scroll"
          value={analytics.summary.totalExcessiveScroll.toLocaleString()}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
      </div>

      {/* Detailed Sections */}
      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="scroll">Scroll Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <DeviceBreakdownSection analytics={analytics} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <UserBehaviorIssuesSection analytics={analytics} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementTimeSection analytics={analytics} />
        </TabsContent>

        <TabsContent value="scroll" className="space-y-6">
          <ScrollDepthSection analytics={analytics} />
        </TabsContent>
      </Tabs>

      {/* Data Delay Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 text-sm">Note: Data Delay</h4>
            <p className="text-xs text-amber-800 mt-1">
              This data is from Microsoft Clarity and may have a delay of 24-48 hours. For real-time insights,
              visit the{' '}
              <a
                href="https://clarity.microsoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-amber-700"
              >
                Clarity Dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
