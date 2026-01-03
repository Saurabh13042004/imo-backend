import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Download from "lucide-react/dist/esm/icons/download";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Star from "lucide-react/dist/esm/icons/star";
import Clock from "lucide-react/dist/esm/icons/clock";
import Brain from "lucide-react/dist/esm/icons/brain";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Users from "lucide-react/dist/esm/icons/users";
import Zap from "lucide-react/dist/esm/icons/zap";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";

const ExtensionGuide = () => {
  const [enableAnimations, setEnableAnimations] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setEnableAnimations(true));
    } else {
      setTimeout(() => setEnableAnimations(true), 0);
    }
  }, []);

  const features = [
    {
      number: "01",
      title: "Get AI Shopping Results",
      icon: Zap,
      description: "Scan products and get personalized links to IMO where you can see comprehensive search results from different stores.",
      details: [
        "Product search results from different stores",
        "Tons of reviews from verified buyers",
        "Video and short video reviews",
        "Store comparison (availability, delivery, offers, pricing)",
        "IMO AI verdict and score",
        "Pros and cons analysis",
        "IMO AI chatbot assistance",
        "Community access"
      ]
    },
    {
      number: "02",
      title: "Documentation & How to Use",
      icon: BookOpen,
      description: "Access detailed documentation on how to use our Chrome extension effectively.",
      details: [
        "Step-by-step usage guides",
        "Feature tutorials",
        "Tips and tricks",
        "Best practices",
        "Video tutorials coming soon"
      ]
    },
    {
      number: "03",
      title: "Contact Us",
      icon: MessageCircle,
      description: "Have any issues, bugs, or questions? Reach out to our team and we'll get back to you within 24 hours.",
      details: [
        "Bug reports",
        "Feature requests",
        "General inquiries",
        "Technical support",
        "24-hour response guarantee"
      ]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Get all product information in one place instead of hopping between multiple websites",
      color: "from-blue-500/10 to-blue-400/5"
    },
    {
      icon: Brain,
      title: "Smart AI Analysis",
      description: "Our AI analyzes thousands of reviews to give you actionable insights",
      color: "from-purple-500/10 to-purple-400/5"
    },
    {
      icon: BarChart3,
      title: "Price Comparison",
      description: "Compare prices and offers across different stores instantly",
      color: "from-green-500/10 to-green-400/5"
    },
    {
      icon: Users,
      title: "Community Insights",
      description: "Access real reviews, videos, and community feedback from verified users",
      color: "from-orange-500/10 to-orange-400/5"
    },
    {
      icon: Zap,
      title: "One Click Away",
      description: "Get insights without leaving your current page",
      color: "from-amber-500/10 to-amber-400/5"
    },
    {
      icon: RefreshCw,
      title: "Always Updated",
      description: "Real-time pricing and availability information from multiple retailers",
      color: "from-cyan-500/10 to-cyan-400/5"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section - Clean & Simple */}
        <motion.section
          className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={enableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <Badge className="px-4 py-2 text-sm font-medium text-foreground border border-primary/30 bg-primary/5">
                <Star className="w-3 h-3 mr-2 fill-yellow-400 text-yellow-400" />
                Chrome Extension
              </Badge>
            </motion.div>

            {/* Heading + Subheading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mb-10"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight">
                Smart Shopping, One Click Away
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Your AI shopping assistant that reads thousands of reviews, compares prices across stores, and gives you honest product recommendations—instantly.
              </p>
            </motion.div>

            {/* Install + Guide Buttons in One Line */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            >
              {/* Chrome Web Store Badge Button */}
              <a
                href="https://chromewebstore.google.com/detail/imo-ai-shopping-assistant/fapabfddjibejafodhnafpfpelcbddea"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group hover:scale-105 transition-transform duration-300"
              >
                <motion.img
                  src="https://developer.chrome.com/static/docs/webstore/branding/image/iNEddTyWiMfLSwFD6qGq.png?authuser=6"
                  alt="Available in the Chrome Web Store"
                  className="h-16 sm:h-20 w-auto drop-shadow-lg group-hover:drop-shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                />
              </a>

              {/* Guide Button */}
              <Button
                size="lg"
                className="gap-2 text-base h-16 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all font-semibold"
                asChild
              >
                <a href="#features">
                  Extension Guide
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Installation Steps */}
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          initial={{ opacity: 0 }}
          whileInView={enableAnimations ? { opacity: 1 } : { opacity: 0 }}
          viewport={{ once: true }}
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Getting Started in 3 Steps</h2>
              <p className="text-muted-foreground text-lg">Quick setup to start using IMO</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  step: "1",
                  title: "Install Extension",
                  description: "Click the button above to install IMO from the Chrome Web Store"
                },
                {
                  step: "2",
                  title: "Click Extension Icon",
                  description: "Find the IMO icon in your Chrome extensions bar (top-right corner)"
                },
                {
                  step: "3",
                  title: "Choose an Option",
                  description: "Select from the 3 available options to get started"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView={enableAnimations ? "visible" : "hidden"}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="pt-8 pb-8">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 text-white font-bold text-xl group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                          {item.step}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Quick Start Guide Section */}
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          variants={containerVariants}
          id="how-to-use"
          initial="hidden"
          whileInView={enableAnimations ? "visible" : "hidden"}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How to Use IMO Extension</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Simple steps to get AI-powered shopping insights</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Step 1 - How to Use */}
              <motion.div
                variants={itemVariants}
                className="group"
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl bg-gradient-to-br from-background via-background to-blue-500/5">
                  <CardHeader className="bg-gradient-to-r from-blue-500/15 to-blue-400/5 border-b border-border/50 pb-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                          Step 1
                        </Badge>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">Get AI Shopping Results</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 pb-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-foreground">When visiting any product page:</h4>
                        <ol className="space-y-3 text-sm text-muted-foreground">
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 font-bold flex-shrink-0 text-xs">1</span>
                            <span>Click on the IMO extension icon in your browser toolbar</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 font-bold flex-shrink-0 text-xs">2</span>
                            <span>Click on <strong>"Get AI Shopping Results"</strong> button</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 font-bold flex-shrink-0 text-xs">3</span>
                            <span>A popup will appear on the left side with a unique IMO link</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 font-bold flex-shrink-0 text-xs">4</span>
                            <span>Click the redirect button to see comprehensive product analysis on IMO</span>
                          </li>
                        </ol>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="font-semibold text-sm mb-2 text-foreground">You'll get access to:</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-muted-foreground">10,000+ reviews analyzed</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-muted-foreground">Video & short video reviews</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-muted-foreground">Store comparison (pricing, offers, delivery)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-600 font-bold">✓</span>
                            <span className="text-muted-foreground">AI verdict, pros & cons, community insights</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Step 2 - Contact Support */}
              <motion.div
                variants={itemVariants}
                className="group"
              >
                <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl bg-gradient-to-br from-background via-background to-purple-500/5">
                  <CardHeader className="bg-gradient-to-r from-purple-500/15 to-purple-400/5 border-b border-border/50 pb-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
                          Support
                        </Badge>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/20 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">Report Issues & Get Help</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 pb-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-foreground">If you encounter any issues or bugs:</h4>
                        <ol className="space-y-3 text-sm text-muted-foreground">
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 font-bold flex-shrink-0 text-xs">1</span>
                            <span>Click on the IMO extension icon in your browser toolbar</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 font-bold flex-shrink-0 text-xs">2</span>
                            <span>Select the IMO extension from the dropdown menu</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 font-bold flex-shrink-0 text-xs">3</span>
                            <span>Click on <strong>"Contact Us"</strong> button</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 font-bold flex-shrink-0 text-xs">4</span>
                            <span>You'll be redirected to IMO help desk</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 font-bold flex-shrink-0 text-xs">5</span>
                            <span>Fill out the contact form with your issue</span>
                          </li>
                        </ol>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="font-semibold text-sm mb-3 text-foreground">We're here to help with:</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600 font-bold">✓</span>
                            <span className="text-muted-foreground">Bug reports</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600 font-bold">✓</span>
                            <span className="text-muted-foreground">Feature requests</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600 font-bold">✓</span>
                            <span className="text-muted-foreground">General inquiries</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-purple-600 font-bold">✓</span>
                            <span className="text-muted-foreground"><strong>24-hour response guarantee</strong></span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Why IMO Section - Professional Design */}
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/50 bg-gradient-to-b from-transparent via-primary/2 to-muted/50"
          initial={{ opacity: 0 }}
          whileInView={enableAnimations ? { opacity: 1 } : { opacity: 0 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Use IMO Chrome Extension?</h2>
              <p className="text-muted-foreground text-lg">Everything you need for smarter shopping</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView={enableAnimations ? "visible" : "hidden"}
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className={`relative p-8 rounded-2xl border-2 border-border/50 bg-gradient-to-br ${benefit.color} hover:border-primary/50 transition-all duration-300 hover:shadow-lg overflow-hidden h-full`}>
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300" />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <BenefitIcon className="w-8 h-8 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                          {benefit.description}
                        </p>
                      </div>

                      {/* Decorative element */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section - Redesigned */}
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          viewport={{ once: true }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -ml-48" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Main CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={enableAnimations ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 p-12 sm:p-16 lg:p-20 hover:border-primary/50 transition-all duration-300 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    Get Started Now
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Install IMO from the Chrome Web Store and start getting AI-powered shopping insights in seconds.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button
                      asChild
                      size="xl"
                      className="gap-3 text-lg h-16 px-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                      <a
                        href="https://chromewebstore.google.com/detail/imo-ai-shopping-assistant/fapabfddjibejafodhnafpfpelcbddea"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-6 h-6" />
                        Install Now
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="xl"
                      className="gap-3 text-lg h-16 px-10 border-2 hover:bg-muted/50 hover:border-primary/50 font-semibold"
                      asChild
                    >
                      <a href="/contact">
                        <MessageCircle className="w-6 h-6" />
                        Need Help?
                      </a>
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-6">
                    ✓ Free to install • ✓ No credit card required • ✓ Works instantly
                  </p>
                </div>

                {/* Right - Chrome Web Store Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={enableAnimations ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-shrink-0"
                >
                  <a
                    href="https://chromewebstore.google.com/detail/imo-ai-shopping-assistant/fapabfddjibejafodhnafpfpelcbddea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative">
                      <img
                        src="https://developer.chrome.com/static/docs/webstore/branding/image/YT2Grfi9vEBa2wAPzhWa.png"
                        alt="Available in the Chrome Web Store"
                        className="h-24 sm:h-28 w-auto drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                      />
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-primary whitespace-nowrap">
                        Click to Install
                      </div>
                    </div>
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Trust & Support Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: Star,
                  title: "Chrome Store Verified",
                  description: "Officially listed and verified by Google"
                },
                {
                  icon: Zap,
                  title: "Instant Setup",
                  description: "One-click installation, works right away"
                },
                {
                  icon: MessageCircle,
                  title: "24/7 Support",
                  description: "Quick response guaranteed within 24 hours"
                }
              ].map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trademark Attribution - Subtle */}
            <div className="mt-8 text-center text-xs text-muted-foreground/70">
              <p>Chrome is a trademark of Google LLC. IMO AI Shopping Assistant is available in the Chrome Web Store.</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ExtensionGuide;
