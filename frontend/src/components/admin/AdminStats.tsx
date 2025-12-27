import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Activity,
  Database,
  Zap 
} from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalSubscriptions: number;
    activeTrials: number;
    monthlyRevenue: number;
    totalUrls: number;
    apiCalls: number;
  };
}

const statItems = [
  {
    title: "Total Users",
    key: "totalUsers",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    lightColor: "text-blue-600",
    bgLight: "bg-blue-50",
    borderLight: "border-blue-200",
  },
  {
    title: "Premium Subscriptions",
    key: "totalSubscriptions",
    icon: ShoppingCart,
    color: "from-purple-500 to-pink-500",
    lightColor: "text-purple-600",
    bgLight: "bg-purple-50",
    borderLight: "border-purple-200",
  },
  {
    title: "Active Trials",
    key: "activeTrials",
    icon: Activity,
    color: "from-orange-500 to-red-500",
    lightColor: "text-orange-600",
    bgLight: "bg-orange-50",
    borderLight: "border-orange-200",
  },
  {
    title: "Monthly Revenue",
    key: "monthlyRevenue",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    lightColor: "text-green-600",
    bgLight: "bg-green-50",
    borderLight: "border-green-200",
    format: (val: number) => `$${val.toLocaleString()}`,
  },
  {
    title: "Total URLs",
    key: "totalUrls",
    icon: Database,
    color: "from-indigo-500 to-purple-500",
    lightColor: "text-indigo-600",
    bgLight: "bg-indigo-50",
    borderLight: "border-indigo-200",
  },
  {
    title: "API Calls",
    key: "apiCalls",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    lightColor: "text-yellow-600",
    bgLight: "bg-yellow-50",
    borderLight: "border-yellow-200",
    format: (val: number) => `${(val / 1000000).toFixed(1)}M`,
  },
];

export const AdminStats = ({ stats }: AdminStatsProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof typeof stats];
        const formattedValue = item.format ? item.format(value as number) : value;

        return (
          <motion.div key={item.key} variants={itemVariants}>
            <Card className={`relative overflow-hidden bg-white border ${item.borderLight} ${item.bgLight} p-6 hover:shadow-md transition-all duration-300`}>
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 opacity-0 hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${item.color}`}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {item.title.includes("Revenue") && (
                    <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-300">
                      ↑ 12%
                    </div>
                  )}
                </div>

                <p className={`${item.lightColor} text-sm mb-2 font-medium`}>{item.title}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {typeof formattedValue === 'number' ? formattedValue.toLocaleString() : formattedValue}
                </p>

                {/* Animated bar */}
                <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${item.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-100/20 to-transparent rounded-full blur-2xl" />
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
