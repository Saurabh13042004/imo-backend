import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  ArrowRight,
  FileText,
  BookOpen,
  Newspaper,
  Video,
  FileUp,
  Sparkles,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import axios from "axios";

const resourceCategories = [
  { label: "Blog", value: "Blog", icon: BookOpen },
  { label: "Case Studies", value: "Case Studies", icon: FileText },
  { label: "News", value: "News", icon: Newspaper },
  { label: "Videos", value: "Videos", icon: Video },
  { label: "Whitepapers", value: "Whitepapers", icon: FileUp },
];

const ITEMS_PER_PAGE = 6;

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  featured_image?: string;
  read_time?: number;
  created_at: string;
  user_id: string;
  published: boolean;
}

const Blog = () => {
  const [enableAnimations, setEnableAnimations] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => setEnableAnimations(true));
    } else {
      setTimeout(() => setEnableAnimations(true), 0);
    }
  }, []);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/blogs/public/list?limit=100`
        );
        const publishedBlogs = response.data.blogs.filter(
          (blog: BlogArticle) => blog.published
        );
        setBlogs(publishedBlogs);
        setError(null);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter articles based on category and search query
  const filteredArticles = useMemo(() => {
    return blogs.filter((article) => {
      const matchesCategory =
        !selectedCategory || article.category === selectedCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, blogs]);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Blog & Resources</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Insights & Expertise
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover articles, case studies, and resources to help you make smarter purchasing decisions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Article Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Badge variant="outline" className="mb-4">Featured</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Resources</h2>
          </div>

          {/* Featured Articles Grid */}
          <motion.div
            initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {filteredArticles.slice(0, 3).map((article, index) => (
              <motion.div
                key={article.id}
                initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/blog/${article.slug}`}>
                  <Card className="h-full overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer">
                    <div className="relative h-40 overflow-hidden bg-muted">
                      <img
                        src={article.featured_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 right-3" variant="secondary">
                        {article.category || "Blog"}
                      </Badge>
                    </div>
                    <CardContent className="pt-4 pb-4">
                      <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt || "No description available"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{article.read_time ? `${article.read_time} min read` : "Read"}</span>
                        <span className="text-right">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Browse Resources Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div>
              <div className="space-y-3 sticky top-24">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-6">
                  Filter by Type
                </h3>
                <Button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  size="sm"
                >
                  All Resources
                </Button>
                {resourceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setCurrentPage(1);
                      }}
                      variant={
                        selectedCategory === category.value ? "default" : "ghost"
                      }
                      className="w-full justify-start text-left"
                      size="sm"
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{category.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <motion.div
                initial={enableAnimations ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative mb-8"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by title, author, topic..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-11 text-base bg-muted/50 border-0"
                />
              </motion.div>

              {/* Articles Grid */}
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center py-16"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </motion.div>
              ) : error ? (
                <div className="text-center py-16">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-base">{error}</p>
                </div>
              ) : (
                <motion.div
                  initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {paginatedArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link to={`/blog/${article.slug}`}>
                        <Card className="h-full overflow-hidden hover:border-primary/50 transition-all duration-300 group cursor-pointer flex flex-col">
                          <div className="relative h-36 overflow-hidden bg-muted">
                            <img
                              src={article.featured_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge className="absolute top-3 right-3" variant="secondary">
                              {article.category || "Blog"}
                            </Badge>
                          </div>
                          <CardContent className="flex-1 pt-4 pb-4 flex flex-col">
                            <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                              {article.excerpt || "No description available"}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.read_time ? `${article.read_time} min` : "Read"}
                              </span>
                              <span>
                                {new Date(article.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!loading && paginatedArticles.length === 0 && (
                <div className="text-center py-16">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-base">
                    No articles found matching your criteria.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={page === currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-muted/50 rounded-2xl p-8 md:p-12 border"
        >
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Stay in the Loop
          </h2>
          <p className="text-muted-foreground mb-6 text-base">
            Get expert insights and resources delivered directly to your inbox every week
          </p>
          <Button className="w-full sm:w-auto">
            Subscribe to Newsletter
          </Button>
        </motion.div>
      </section> */}
    </div>
  );
};

export default Blog;
