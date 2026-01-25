/**
 * SEO Meta Tags Component
 * Updates document head with SEO metadata and JSON-LD structured data
 */

interface ProductJsonLdData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  brand?: string;
  price?: number | string;
  currency?: string;
  url?: string;
  availability?: string;
}

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  canonicalUrl?: string;
  // JSON-LD structured data for rich results
  productData?: ProductJsonLdData;
  aiVerdictScore?: number;
  totalReviews?: number;
}

export const MetaTags = ({
  title = 'Informed Market Opinions - AI-Powered Product Research',
  description = 'Discover the best products with AI-powered analysis of thousands of reviews, expert opinions, and video content.',
  keywords = 'product reviews, AI analysis, product recommendations, best products',
  image = 'https://informedmarketopinions.com/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author = 'Informed Market Opinions',
  canonicalUrl,
  productData,
  aiVerdictScore,
  totalReviews = 0,
}: MetaTagsProps) => {
  // Update document title
  if (typeof document !== 'undefined') {
    document.title = title;

    // Update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let element = document.querySelector(
        isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
      ) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', author);
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph meta tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', type, true);

    // Twitter Card meta tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;

      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }

      canonical.href = canonicalUrl;
    }

    // JSON-LD Structured Data for Rich Results
    // Generates Product schema with AggregateRating for Google Rich Snippets
    if (productData) {
      try {
        // Generate Product + AggregateRating schema
        const productSchema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": productData.title,
          "description": productData.description || productData.title,
          "brand": {
            "@type": "Brand",
            "name": productData.brand || "Unknown Brand"
          },
          "image": productData.image ? [productData.image] : [],
          "url": productData.url || url,
          "offers": {
            "@type": "Offer",
            "url": productData.url || url,
            "priceCurrency": productData.currency || "USD",
            "price": productData.price?.toString() || "0",
            "availability": `https://schema.org/${productData.availability || "InStock"}`
          }
        };

        // Add AI Verdict as AggregateRating if available
        if (aiVerdictScore !== undefined) {
          (productSchema as any).aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": Math.round(aiVerdictScore * 10) / 10,
            "reviewCount": totalReviews,
            "bestRating": 5,
            "worstRating": 1
          };
        }

        // Inject into document head
        let scriptElement = document.getElementById("jsonld-product-main") as HTMLScriptElement;
        if (!scriptElement) {
          scriptElement = document.createElement("script");
          scriptElement.type = "application/ld+json";
          scriptElement.id = "jsonld-product-main";
          document.head.appendChild(scriptElement);
        }
        scriptElement.innerHTML = JSON.stringify(productSchema);

        console.log("[SEO] ✅ Product JSON-LD schema injected");
      } catch (error) {
        console.error("[SEO] ❌ Error injecting JSON-LD schema:", error);
      }
    }
  }

  return null;
};
