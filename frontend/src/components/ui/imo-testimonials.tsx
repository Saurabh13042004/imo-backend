"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    quote: "IMO saved me 6 hours shopping for a treadmill.",
    author: "Alex P.",
    badge: "Beta User",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    quote: "Flagged a hidden issue and saved me $400.",
    author: "Sarah K.",
    badge: "Beta User",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    quote: "Best way to compare products without wasting hours. Highly recommend!",
    author: "Arik",
    badge: "Alpha User",
    avatar: "https://img.freepik.com/free-psd/medium-shot-smiley-man-posing_23-2150454306.jpg?semt=ais_hybrid&w=740&q=80",
  },
]

export function IMOTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState(testimonials[0].quote)
  const [displayedAuthor, setDisplayedAuthor] = useState(testimonials[0].author)
  const [displayedBadge, setDisplayedBadge] = useState(testimonials[0].badge)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)

    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote)
      setDisplayedAuthor(testimonials[index].author)
      setDisplayedBadge(testimonials[index].badge)
      setActiveIndex(index)
      setTimeout(() => setIsAnimating(false), 400)
    }, 200)
  }

  return (
    <div className="flex flex-col items-center gap-12 py-16 px-4">
      {/* Section Title */}
      <div className="text-center mb-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-3">Real People. Real Results.</h2>
        <p className="text-muted-foreground text-lg">See how IMO helps shoppers make smarter decisions</p>
      </div>

      {/* Quote Container */}
      <div className="relative px-8 max-w-2xl">
        <span className="absolute -left-2 -top-6 text-7xl font-serif text-foreground/[0.06] select-none pointer-events-none">
          "
        </span>

        <p
          className={cn(
            "text-2xl md:text-3xl font-light text-foreground text-center leading-relaxed transition-all duration-400 ease-out",
            isAnimating ? "opacity-0 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100",
          )}
        >
          {displayedQuote}
        </p>

        <span className="absolute -right-2 -bottom-8 text-7xl font-serif text-foreground/[0.06] select-none pointer-events-none">
          "
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 mt-2">
        {/* Author and Badge */}
        <div
          className={cn(
            "transition-all duration-500 ease-out",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
          )}
        >
          <p className="text-lg font-semibold text-foreground text-center">{displayedAuthor}</p>
          <div className="flex justify-center mt-2">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {displayedBadge}
            </span>
          </div>
        </div>

        {/* Avatar Buttons */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {testimonials.map((testimonial, index) => {
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index && !isActive
            const showName = isActive || isHovered

            return (
              <button
                key={testimonial.id}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex items-center gap-0 rounded-full cursor-pointer",
                  "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  isActive ? "bg-primary shadow-lg" : "bg-transparent hover:bg-muted/80",
                  showName ? "pr-4 pl-2 py-2" : "p-0.5",
                )}
              >
                {/* Avatar with smooth ring animation */}
                <div className="relative flex-shrink-0">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className={cn(
                      "w-10 h-10 rounded-full object-cover",
                      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      isActive ? "ring-2 ring-background/30" : "ring-0",
                      !isActive && "hover:scale-105",
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    showName ? "grid-cols-[1fr] opacity-100 ml-2" : "grid-cols-[0fr] opacity-0 ml-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <span
                      className={cn(
                        "text-sm font-medium whitespace-nowrap block",
                        "transition-colors duration-300",
                        isActive ? "text-background" : "text-foreground",
                      )}
                    >
                      {testimonial.author}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
