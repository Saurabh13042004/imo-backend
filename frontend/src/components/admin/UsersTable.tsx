import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, ChevronUp, ChevronDown } from "lucide-react";

const mockUsers = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    subscriptionTier: "premium",
    joinDate: "2024-01-15",
    lastActive: "2024-12-24",
    searches: 450,
  },
  {
    id: "2",
    email: "sarah@example.com",
    name: "Sarah Smith",
    subscriptionTier: "trial",
    joinDate: "2024-12-20",
    lastActive: "2024-12-24",
    searches: 25,
  },
  {
    id: "3",
    email: "mike@example.com",
    name: "Mike Johnson",
    subscriptionTier: "free",
    joinDate: "2024-12-01",
    lastActive: "2024-12-23",
    searches: 8,
  },
  {
    id: "4",
    email: "jane@example.com",
    name: "Jane Wilson",
    subscriptionTier: "premium",
    joinDate: "2024-06-10",
    lastActive: "2024-12-24",
    searches: 1200,
  },
  {
    id: "5",
    email: "alex@example.com",
    name: "Alex Brown",
    subscriptionTier: "free",
    joinDate: "2024-12-18",
    lastActive: "2024-12-20",
    searches: 3,
  },
];

export const UsersTable = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "searches">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredUsers = mockUsers
    .filter((user) => {
      if (filter !== "all" && user.subscriptionTier !== filter) return false;
      if (!search) return true;
      return (
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
        case "searches":
          comparison = a.searches - b.searches;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getTierBadgeStyles = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-purple-100 border-purple-300 text-purple-700";
      case "trial":
        return "bg-orange-100 border-orange-300 text-orange-700";
      default:
        return "bg-slate-100 border-slate-300 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white border-slate-200 text-slate-900">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="text-slate-900">User</TableHead>
                <TableHead className="text-slate-900">Tier</TableHead>
                <TableHead
                  className="text-slate-900 cursor-pointer hover:text-slate-700"
                  onClick={() => {
                    setSortBy("date");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  <div className="flex items-center gap-2">
                    Join Date
                    {sortBy === "date" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-slate-900">Last Active</TableHead>
                <TableHead
                  className="text-slate-900 cursor-pointer hover:text-slate-700"
                  onClick={() => {
                    setSortBy("searches");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  <div className="flex items-center gap-2">
                    Searches
                    {sortBy === "searches" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div>
                      <p className="text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getTierBadgeStyles(user.subscriptionTier)}
                    >
                      {user.subscriptionTier.charAt(0).toUpperCase() +
                        user.subscriptionTier.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((user.searches / 1000) * 100, 100)}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-slate-900 font-semibold">
                        {user.searches}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-100 text-slate-900"
                    >
                      View
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users Shown", value: filteredUsers.length },
          {
            label: "Total Searches",
            value: filteredUsers.reduce((sum, u) => sum + u.searches, 0),
          },
          {
            label: "Avg Searches/User",
            value: Math.round(
              filteredUsers.reduce((sum, u) => sum + u.searches, 0) /
                filteredUsers.length
            ),
          },
        ].map((stat, idx) => (
          <Card
            key={idx}
            className="bg-white border-slate-200 p-4 text-center"
          >
            <p className="text-slate-600 text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
