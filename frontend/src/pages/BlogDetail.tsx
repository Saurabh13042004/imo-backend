import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Calendar,
  User as UserIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import axios from "axios";

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
  content: string;
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [enableAnimations, setEnableAnimations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => setEnableAnimations(true));
    } else {
      setTimeout(() => setEnableAnimations(true), 0);
    }
  }, []);

  // Fetch blog details from API
  useEffect(() => {
    const fetchBlogDetail = async () => {
      if (!slug) {
        setError("Blog slug not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/blogs/${slug}`
        );
        setArticle(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog post");
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            {error || "Article Not Found"}
          </h1>
          <p className="text-muted-foreground mb-8">
            Sorry, the article you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/blog/${article.slug}`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(article.title);
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        return;
      default:
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="border-b px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          <motion.div
            initial={
              enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary">{article.category || "Blog"}</Badge>
              <span className="text-sm text-muted-foreground">
                {article.read_time ? `${article.read_time} min read` : "Read"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-muted-foreground">
              <div className="hidden md:block">•</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      <motion.section
        initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative h-96 rounded-xl overflow-hidden bg-muted border">
            <img
              src={article.featured_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <motion.section
        initial={
          enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-base prose-p:leading-7 prose-p:mb-6
              [&_p]:min-h-[1.5em]
              [&_p:empty]:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:font-semibold
              prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
              prose-li:mb-2
            "
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </motion.section>

      {/* Share Section */}
      <motion.section
        initial={
          enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
        }
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="border-t border-b px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Share This Article</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("facebook")}
              className="gap-2"
            >
              <Facebook className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("twitter")}
              className="gap-2"
            >
              <Twitter className="h-4 w-4" />
              Tweet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("linkedin")}
              className="gap-2"
            >
              <Linkedin className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare("email")}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>

          <div className="mt-6 flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="text-sm bg-muted/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section
        initial={
          enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
        }
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="max-w-2xl mx-auto bg-muted/50 rounded-2xl p-8 md:p-12 border">
          <Sparkles className="h-12 w-12 text-primary mb-4 opacity-80" />
          <h3 className="text-2xl font-bold tracking-tight mb-2">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-muted-foreground mb-6">
            Get the latest insights and resources delivered to your inbox every
            week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1"
            />
            <Button className="flex-shrink-0">Subscribe</Button>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      {/* <motion.section
        initial={
          enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
        }
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-4 sm:px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Apply the insights from this article to enhance your product
            research journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Start Free Trial</Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </motion.section> */}
    </div>
  );
};

export default BlogDetail;
