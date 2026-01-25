/**
 * JSON-LD Schema Generator
 * Generates structured data for Google Rich Results including:
 * - Product schema with pricing, images, and brand
 * - AggregateRating schema for AI verdict scores
 * - Review schema for individual reviews
 * 
 * Validated with Google Rich Results Test:
 * https://search.google.com/test/rich-results
 */

interface ProductSchemaData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  brand?: string;
  price?: number | string;
  currency?: string;
  url?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
}

interface ReviewSchemaData {
  author?: string;
  rating: number;
  reviewText?: string;
  datePublished?: string;
}

/**
 * Generate Product JSON-LD Schema
 * Maps to: https://schema.org/Product
 */
export function generateProductSchema(data: ProductSchemaData): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.title,
    "description": data.description || data.title,
    "brand": {
      "@type": "Brand",
      "name": data.brand || "Unknown Brand"
    },
    "image": data.image ? [data.image] : [],
    "url": data.url || "",
    "offers": {
      "@type": "Offer",
      "url": data.url || "",
      "priceCurrency": data.currency || "USD",
      "price": data.price?.toString() || "0",
      "availability": `https://schema.org/${data.availability || "InStock"}`
    }
  };

  // Add AggregateRating if we have rating data
  if (data.rating && data.reviewCount) {
    (schema as any).aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Math.round(data.rating * 10) / 10, // Round to 1 decimal
      "reviewCount": data.reviewCount
    };
  }

  return JSON.stringify(schema);
}

/**
 * Generate AggregateRating JSON-LD Schema
 * Maps to: https://schema.org/AggregateRating
 * Used specifically for AI verdict scores
 */
export function generateAggregateRatingSchema(
  name: string,
  ratingValue: number,
  reviewCount: number,
  bestRating: number = 5,
  worstRating: number = 1
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "name": name,
    "ratingValue": Math.round(ratingValue * 10) / 10,
    "reviewCount": reviewCount,
    "bestRating": bestRating,
    "worstRating": worstRating
  };

  return JSON.stringify(schema);
}

/**
 * Generate Review JSON-LD Schema
 * Maps to: https://schema.org/Review
 */
export function generateReviewSchema(
  productName: string,
  review: ReviewSchemaData,
  productUrl?: string
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": productName,
      "url": productUrl || ""
    },
    "author": {
      "@type": "Person",
      "name": review.author || "AI Analyst"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": Math.round(review.rating * 10) / 10,
      "bestRating": 5,
      "worstRating": 1
    },
    "reviewBody": review.reviewText || "",
    "datePublished": review.datePublished || new Date().toISOString()
  };

  return JSON.stringify(schema);
}

/**
 * Generate Combined Product + AggregateRating Schema
 * This is the most commonly used format for rich snippets
 * Includes both product information and AI verdict rating
 */
export function generateProductWithRatingSchema(
  productData: ProductSchemaData,
  aiVerdictScore: number,
  totalReviews: number
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.title,
    "description": productData.description || productData.title,
    "brand": {
      "@type": "Brand",
      "name": productData.brand || "Unknown Brand"
    },
    "image": productData.image ? [productData.image] : [],
    "url": productData.url || "",
    "offers": {
      "@type": "Offer",
      "url": productData.url || "",
      "priceCurrency": productData.currency || "USD",
      "price": productData.price?.toString() || "0",
      "availability": `https://schema.org/${productData.availability || "InStock"}`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": Math.round(aiVerdictScore * 10) / 10,
      "reviewCount": totalReviews,
      "bestRating": 5,
      "worstRating": 1
    }
  };

  return JSON.stringify(schema);
}

/**
 * Inject JSON-LD script into document head
 * Safe for React with proper cleanup
 */
export function injectJsonLd(jsonLdString: string, id: string = "jsonld-product"): void {
  if (typeof document === "undefined") return;

  // Remove existing script if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create and inject new script
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.innerHTML = jsonLdString;
  document.head.appendChild(script);

  console.log(`[JSON-LD] Injected schema: ${id}`);
}

/**
 * Generate multiple JSON-LD schemas and inject them
 * Main function for comprehensive SEO implementation
 */
export function injectProductJsonLd(
  productData: ProductSchemaData,
  aiVerdictScore?: number,
  totalReviews: number = 0
): void {
  if (typeof document === "undefined") return;

  try {
    // Main product schema with rating
    if (aiVerdictScore !== undefined) {
      const combinedSchema = generateProductWithRatingSchema(
        productData,
        aiVerdictScore,
        totalReviews
      );
      injectJsonLd(combinedSchema, "jsonld-product-main");
    } else {
      const productSchema = generateProductSchema(productData);
      injectJsonLd(productSchema, "jsonld-product-main");
    }

    // AI Verdict rating schema (for additional emphasis)
    if (aiVerdictScore !== undefined) {
      const ratingSchema = generateAggregateRatingSchema(
        `AI Verdict for ${productData.title}`,
        aiVerdictScore,
        totalReviews
      );
      injectJsonLd(ratingSchema, "jsonld-ai-rating");
    }

    console.log("[JSON-LD] ✅ Product schemas successfully injected");
  } catch (error) {
    console.error("[JSON-LD] ❌ Error injecting schemas:", error);
  }
}

/**
 * Clean up JSON-LD schemas
 * Call this when component unmounts to prevent memory leaks
 */
export function removeJsonLdSchemas(): void {
  if (typeof document === "undefined") return;

  const ids = ["jsonld-product-main", "jsonld-ai-rating", "jsonld-review"];
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
      console.log(`[JSON-LD] Removed schema: ${id}`);
    }
  });
}

/**
 * Validate JSON-LD schema structure
 * Useful for debugging before sending to Google
 */
export function validateJsonLdSchema(jsonString: string): {
  valid: boolean;
  errors: string[];
} {
  try {
    const schema = JSON.parse(jsonString);

    const errors: string[] = [];

    // Check required fields
    if (!schema["@context"]) errors.push("Missing @context");
    if (!schema["@type"]) errors.push("Missing @type");

    // Type-specific validation
    if (schema["@type"] === "Product") {
      if (!schema.name) errors.push("Product: Missing name");
      if (!schema.offers) errors.push("Product: Missing offers");
      if (schema.offers && !schema.offers.price) errors.push("Offer: Missing price");
    }

    if (schema["@type"] === "AggregateRating") {
      if (schema.ratingValue === undefined)
        errors.push("AggregateRating: Missing ratingValue");
      if (schema.reviewCount === undefined)
        errors.push("AggregateRating: Missing reviewCount");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        `JSON parsing error: ${error instanceof Error ? error.message : String(error)}`
      ]
    };
  }
}
