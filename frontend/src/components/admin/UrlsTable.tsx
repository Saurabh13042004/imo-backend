import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, ExternalLink, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

const mockUrls = [
  {
    id: "url_1",
    url: "https://amazon.com/dp/B0CN7F4F8X",
    domain: "amazon.com",
    product: "Sony WH-1000XM5 Headphones",
    clicks: 1240,
    conversions: 320,
    revenue: 1200,
    indexed: true,
    lastCrawled: "2024-12-24",
  },
  {
    id: "url_2",
    url: "https://walmart.com/ip/123456789",
    domain: "walmart.com",
    product: "Samsung 65-inch 4K TV",
    clicks: 890,
    conversions: 210,
    revenue: 950,
    indexed: true,
    lastCrawled: "2024-12-24",
  },
  {
    id: "url_3",
    url: "https://bestbuy.com/site/...",
    domain: "bestbuy.com",
    product: "Apple MacBook Pro 16",
    clicks: 2100,
    conversions: 580,
    revenue: 3200,
    indexed: true,
    lastCrawled: "2024-12-24",
  },
  {
    id: "url_4",
    url: "https://ebay.com/itm/...",
    domain: "ebay.com",
    product: "Nintendo Switch OLED",
    clicks: 560,
    conversions: 140,
    revenue: 420,
    indexed: false,
    lastCrawled: "2024-12-23",
  },
  {
    id: "url_5",
    url: "https://target.com/p/...",
    domain: "target.com",
    product: "iPad Air 11-inch",
    clicks: 1890,
    conversions: 420,
    revenue: 1680,
    indexed: true,
    lastCrawled: "2024-12-24",
  },
];

export const UrlsTable = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"clicks" | "conversions" | "revenue">(
    "revenue"
  );

  const filteredUrls = mockUrls
    .filter((item) => {
      if (!search) return true;
      return (
        item.url.toLowerCase().includes(search.toLowerCase()) ||
        item.product.toLowerCase().includes(search.toLowerCase()) ||
        item.domain.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "clicks":
          return b.clicks - a.clicks;
        case "conversions":
          return b.conversions - a.conversions;
        case "revenue":
          return b.revenue - a.revenue;
        default:
          return 0;
      }
    });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const totalStats = {
    totalUrls: mockUrls.length,
    totalClicks: mockUrls.reduce((sum, u) => sum + u.clicks, 0),
    totalConversions: mockUrls.reduce((sum, u) => sum + u.conversions, 0),
    totalRevenue: mockUrls.reduce((sum, u) => sum + u.revenue, 0),
    avgConversionRate: (
      (mockUrls.reduce((sum, u) => sum + u.conversions, 0) /
        mockUrls.reduce((sum, u) => sum + u.clicks, 0)) *
      100
    ).toFixed(2),
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total URLs", value: totalStats.totalUrls, color: "blue" },
          { label: "Total Clicks", value: totalStats.totalClicks.toLocaleString(), color: "purple" },
          { label: "Conversions", value: totalStats.totalConversions, color: "green" },
          { label: "Revenue", value: `$${totalStats.totalRevenue}`, color: "emerald" },
          { label: "Conversion Rate", value: `${totalStats.avgConversionRate}%`, color: "orange" },
        ].map((stat, idx) => {
          const colorMap: Record<string, string> = {
            blue: "from-blue-500 to-cyan-500",
            purple: "from-purple-500 to-pink-500",
            green: "from-green-500 to-emerald-500",
            emerald: "from-emerald-500 to-teal-500",
            orange: "from-orange-500 to-amber-500",
          };
          return (
            <Card
              key={idx}
              className="bg-white border-slate-200 p-4 text-center"
            >
              <p className="text-slate-600 text-xs mb-2">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <div className={`h-1 w-8 mx-auto mt-2 bg-gradient-to-r ${colorMap[stat.color]} rounded-full`} />
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by URL, product, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2">
          {["clicks", "conversions", "revenue"].map((sort) => (
            <Button
              key={sort}
              onClick={() => setSortBy(sort as any)}
              variant={sortBy === sort ? "default" : "outline"}
              className={
                sortBy === sort
                  ? ""
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }
            >
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="text-slate-900">URL</TableHead>
                <TableHead className="text-slate-900">Domain</TableHead>
                <TableHead className="text-slate-900">Product</TableHead>
                <TableHead className="text-slate-900 text-right">Clicks</TableHead>
                <TableHead className="text-slate-900 text-right">Conversions</TableHead>
                <TableHead className="text-slate-900 text-right">Revenue</TableHead>
                <TableHead className="text-slate-900">Status</TableHead>
                <TableHead className="text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUrls.map((item, idx) => {
                const conversionRate = (
                  (item.conversions / item.clicks) *
                  100
                ).toFixed(2);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 group">
                        <code className="text-xs text-slate-600 group-hover:text-slate-900">
                          {item.url.slice(0, 30)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(item.url)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 border-blue-300 text-blue-700"
                      >
                        {item.domain}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700 max-w-xs">
                      <span title={item.product}>{item.product.slice(0, 20)}...</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.clicks.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600">
                          {item.conversions} conv
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-6 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(parseInt(conversionRate) * 2, 100)}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-slate-900 font-semibold text-sm">
                          {conversionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      ${item.revenue}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.indexed
                            ? "bg-green-100 border-green-300 text-green-700"
                            : "bg-yellow-100 border-yellow-300 text-yellow-700"
                        }
                      >
                        {item.indexed ? "Indexed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-600 hover:text-slate-900"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Last Updated */}
      <Card className="bg-white border-slate-200 p-4 text-center">
        <p className="text-slate-600 text-sm">
          Last updated: {new Date().toLocaleString()}
        </p>
      </Card>
    </div>
  );
};
