import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Play, Eye, ThumbsUp, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useShortVideoReviews } from "@/hooks/useShortVideoReviews";

interface ShortVideoReviewsProps {
  productId: string;
  productTitle?: string;
}

export const ShortVideoReviews = ({ productId, productTitle }: ShortVideoReviewsProps) => {
  const { videos, status, isLoading } = useShortVideoReviews(productId, productTitle);
  const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(videos.length > 3);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getEmbeddableUrl = (url: string, platform: string) => {
    // Convert YouTube Shorts URL to embeddable format
    if (platform.toLowerCase().includes("youtube")) {
      // Handle YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
      const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
      // Handle regular YouTube: https://www.youtube.com/watch?v=VIDEO_ID
      const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
      }
    }
    // For TikTok and Instagram, return the original URL
    return url;
  };

  const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("youtube")) {
      return "bg-red-600";
    } else if (p.includes("tiktok")) {
      return "bg-black";
    } else if (p.includes("instagram")) {
      return "bg-gradient-to-r from-purple-600 to-pink-600";
    }
    return "bg-primary";
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("youtube")) {
      return "▶";
    } else if (p.includes("tiktok")) {
      return "♪";
    } else if (p.includes("instagram")) {
      return "📷";
    }
    return "▶";
  };

  const handleVideoClick = (video: (typeof videos)[0], index: number) => {
    setSelectedVideo(video);
    setActiveIndex(index);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo(null);
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      const prev = videos[activeIndex - 1];
      if (prev) {
        setSelectedVideo(prev);
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  const handleNext = () => {
    if (activeIndex < videos.length - 1) {
      const next = videos[activeIndex + 1];
      if (next) {
        setSelectedVideo(next);
        setActiveIndex(activeIndex + 1);
      }
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 pt-12"
      >
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Fetching quick video opinions…
          </h2>
        </div>
        <p className="text-sm text-muted-foreground/70">
          Searching for YouTube Shorts, TikTok, and Instagram Reels...
        </p>
      </motion.div>
    );
  }

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-12"
      >
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="py-12 text-center">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-lg font-medium mb-2 text-muted-foreground">
              No short video reviews yet
            </h3>
            <p className="text-sm text-muted-foreground/80">
              No quick video opinions found for this product on YouTube, TikTok, or Instagram yet.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="space-y-6 pt-12"
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">📱</span>
        <h2 className="text-2xl font-semibold">Quick Video Opinions</h2>
        <Badge variant="secondary" className="ml-auto">
          {videos.length} video{videos.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="relative group">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 w-48"
            >
              <Card
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 h-full"
                onClick={() => handleVideoClick(video, index)}
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-black">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.creator}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                      <span className="text-3xl">📹</span>
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-red-600 rounded-full p-2">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </div>

                  {/* Platform badge */}
                  <Badge
                    className={`absolute top-2 right-2 text-white border-0 ${getPlatformColor(
                      video.platform
                    )}`}
                  >
                    <span className="mr-1">{getPlatformIcon(video.platform)}</span>
                    <span className="capitalize text-xs">{video.platform}</span>
                  </Badge>

                  {/* Duration badge if available */}
                  {video.duration && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3">
                  <p className="font-medium text-xs line-clamp-1 mb-1">{video.creator}</p>

                  {video.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {video.caption}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {video.views > 0 && (
                        <div className="flex items-center">
                          <Eye className="h-2.5 w-2.5 mr-0.5" />
                          {formatNumber(video.views)}
                        </div>
                      )}
                      {video.likes > 0 && (
                        <div className="flex items-center">
                          <ThumbsUp className="h-2.5 w-2.5 mr-0.5" />
                          {formatNumber(video.likes)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-primary hover:bg-primary/90 text-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Fullscreen Video Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] h-[95vh] p-0 [&>button]:hidden flex flex-col">
          {/* Accessibility: Hidden Title and Description */}
          <DialogTitle className="sr-only">
            {selectedVideo?.creator} - {selectedVideo?.caption}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Video player for {selectedVideo?.platform} short video
          </DialogDescription>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedVideo?.creator}</p>
              {selectedVideo?.caption && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {selectedVideo.caption}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDialog}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center bg-black p-4">
            {selectedVideo?.video_url ? (
              <iframe
                src={getEmbeddableUrl(selectedVideo.video_url, selectedVideo.platform)}
                className="w-full h-full max-w-sm"
                allowFullScreen
                title={`${selectedVideo.creator} - ${selectedVideo.platform}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <span className="text-5xl">📹</span>
                <p className="mt-4">Video unavailable</p>
              </div>
            )}
          </div>

          {/* Footer - Stats & Navigation */}
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {selectedVideo?.views ? (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(selectedVideo.views)}
                </div>
              ) : null}
              {selectedVideo?.likes ? (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {formatNumber(selectedVideo.likes)}
                </div>
              ) : null}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={activeIndex === 0}
              >
                ← Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                {activeIndex + 1} / {videos.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={activeIndex === videos.length - 1}
              >
                Next →
              </Button>
            </div>

            {/* Platform Link */}
            <Button
              size="sm"
              onClick={() =>
                window.open(
                  selectedVideo?.video_url,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Open on {selectedVideo?.platform}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
