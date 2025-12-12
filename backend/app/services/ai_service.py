"""AI service for review summarization and sentiment analysis using Google Gemini."""

import logging
from typing import List, Optional, Dict, Any
import json

import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered review analysis using Google Gemini."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.initialized = bool(self.api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash') if self.initialized else None

    async def summarize_reviews(
        self,
        reviews: List[str],
        product_name: str
    ) -> Optional[str]:
        """Generate comprehensive review summary using Google Gemini."""
        if not self.initialized:
            logger.warning("Gemini API key not configured")
            return None

        if not reviews:
            return None

        try:
            # Prepare review text
            review_text = "\n\n".join(reviews[:10])  # Limit to 10 reviews

            prompt = f"""Analyze the following customer reviews for "{product_name}" and provide:
1. A concise summary (2-3 sentences)
2. Key pros (3-5 points)
3. Key cons (3-5 points)
4. Overall recommendation

Reviews:
{review_text}

Please format the response as JSON."""

            response = self.model.generate_content(prompt)
            
            summary = response.text
            logger.info(f"Generated review summary for product: {product_name}")
            return summary

        except Exception as e:
            logger.error(f"Error summarizing reviews: {e}")
            return None

    async def analyze_sentiment(self, review_text: str) -> Optional[str]:
        """Determine review sentiment using Gemini."""
        if not self.initialized:
            logger.warning("Gemini API key not configured")
            return None

        try:
            prompt = f"""Analyze the sentiment of this review and respond with only one word: positive, negative, or neutral.

Review: {review_text[:500]}"""

            response = self.model.generate_content(prompt)
            
            sentiment = response.text.strip().lower()

            if sentiment in ["positive", "negative", "neutral"]:
                return sentiment
            return "neutral"

        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return None

    async def extract_pros_cons(self, reviews: List[str]) -> Optional[Dict[str, Any]]:
        """Extract key pros and cons from reviews using Gemini."""
        if not self.initialized:
            logger.warning("Gemini API key not configured")
            return None

        if not reviews:
            return None

        try:
            review_text = "\n\n".join(reviews[:10])

            prompt = f"""Extract the main pros and cons from these customer reviews.

Reviews:
{review_text}

Please respond in JSON format with 'pros' and 'cons' as arrays of strings."""

            response = self.model.generate_content(prompt)
            
            content = response.text
            # Try to parse as JSON
            result = json.loads(content)
            logger.info("Extracted pros and cons from reviews")
            return result

        except json.JSONDecodeError:
            logger.error("Failed to parse AI response as JSON")
            return None
        except Exception as e:
            logger.error(f"Error extracting pros and cons: {e}")
            return None

    async def generate_title_summary(self, product_title: str, reviews: List[str]) -> Optional[str]:
        """Generate a concise summary for product title using Gemini."""
        if not self.initialized:
            return None

        if not reviews:
            return None

        try:
            review_text = " ".join(reviews[:5])

            prompt = f"""Summarize the main topic of these reviews in one short sentence (max 10 words).
Product: {product_title}
Reviews: {review_text[:300]}"""

            response = self.model.generate_content(prompt)
            
            summary = response.text.strip()
            return summary

        except Exception as e:
            logger.error(f"Error generating title summary: {e}")
            return None

    async def analyze_amazon_product(
        self,
        amazon_data: Dict[str, Any],
        serp_data: Optional[Dict[str, Any]] = None,
        product_title: str = ""
    ) -> Optional[Dict[str, Any]]:
        """Analyze Amazon product using Gemini to generate intelligent insights.
        
        This is the INTELLIGENCE LAYER that compresses raw data into actionable insights.
        
        Args:
            amazon_data: Amazon product data (from Amazon API)
            serp_data: Optional SerpAPI enrichment data (external reviews)
            product_title: Product title for context
            
        Returns:
            Dictionary with AI analysis including pros, cons, sentiment, verdict
        """
        if not self.initialized:
            logger.warning("Gemini API key not configured, skipping AI analysis")
            return None

        try:
            # Extract key information from Amazon data
            reviews = self._extract_reviews(amazon_data)
            rating_distribution = amazon_data.get("rating_stars_distribution", [])
            average_rating = amazon_data.get("rating", 0)
            bullet_points = amazon_data.get("bullet_points", "")
            
            # Extract SerpAPI enrichment if available
            serp_reviews = []
            if serp_data and isinstance(serp_data, dict):
                serp_reviews = serp_data.get("user_reviews", [])
            
            # Build the prompt for Gemini
            prompt = self._build_analysis_prompt(
                title=product_title,
                amazon_reviews=reviews[:10],  # Limit to top 10 for cost
                serp_reviews=serp_reviews[:5],
                rating_distribution=rating_distribution,
                average_rating=average_rating,
                bullet_points=bullet_points
            )
            
            # Call Gemini API
            response = self.model.generate_content(prompt)
            
            if not response:
                logger.warning("Failed to get response from Gemini")
                return None
            
            # Parse Gemini response
            analysis = self._parse_gemini_response(response.text)
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing product with Gemini: {e}", exc_info=True)
            return None

    def _extract_reviews(self, amazon_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract reviews from Amazon data."""
        reviews = []
        if "reviews" in amazon_data and isinstance(amazon_data["reviews"], list):
            for review in amazon_data["reviews"]:
                reviews.append({
                    "title": review.get("title", ""),
                    "rating": review.get("rating", 0),
                    "content": review.get("content", ""),
                    "author": review.get("author", ""),
                    "verified": review.get("is_verified", False)
                })
        return reviews

    def _build_analysis_prompt(
        self,
        title: str,
        amazon_reviews: List[Dict[str, Any]],
        serp_reviews: List[Dict[str, Any]],
        rating_distribution: List[Dict[str, Any]],
        average_rating: float,
        bullet_points: str
    ) -> str:
        """Build the prompt for Gemini analysis."""
        
        amazon_reviews_text = "\n".join([
            f"- [{r['rating']}★] {r['title']}: {r['content'][:300]}"
            for r in amazon_reviews
        ])
        
        serp_reviews_text = "\n".join([
            f"- [{r.get('rating', 'N/A')}★] {r.get('title', r.get('text', '')[:200])}"
            for r in serp_reviews
        ])
        
        rating_dist_text = "\n".join([
            f"- {r['rating']}★: {r['percentage']}%"
            for r in rating_distribution
        ])
        
        prompt = f"""You are analyzing a product to provide intelligent insights for consumers.

PRODUCT: {title}
AVERAGE RATING: {average_rating}/5

RATING DISTRIBUTION:
{rating_dist_text if rating_dist_text else "Not available"}

KEY FEATURES (from manufacturer):
{bullet_points[:500] if bullet_points else "Not available"}

AMAZON REVIEWS (top feedback):
{amazon_reviews_text if amazon_reviews_text else "No reviews available"}

EXTERNAL REVIEWS (from web/forums):
{serp_reviews_text if serp_reviews_text else "No external reviews available"}

TASK - Provide analysis in JSON format:
1. Extract top 5 PROS (things users consistently praise)
2. Extract top 5 CONS (things users consistently complain about)
3. Identify 2-3 deal-breaker issues (if any)
4. Rate overall sentiment (0.0-1.0 scale, based on reviews tone)
5. Give a verdict score (1-10 scale)
6. Who should buy this product
7. Who should avoid this product

IMPORTANT RULES:
- Be specific and cite actual review feedback
- Focus on repeated complaints, not one-off issues
- Ignore marketing language and focus on real user experiences
- If you see conflicting opinions, note that there's disagreement
- Be honest about weaknesses
- Use 0.0-1.0 for sentiment_score (0.5 = neutral)
- Use 1-10 for verdict_score

Return ONLY valid JSON (no markdown, no code blocks):
{{
    "summary": "1-2 sentence product summary based on reviews",
    "pros": ["pro1", "pro2", "pro3", "pro4", "pro5"],
    "cons": ["con1", "con2", "con3", "con4", "con5"],
    "deal_breakers": ["issue1", "issue2"],
    "sentiment_score": 0.8,
    "verdict_score": 8.2,
    "who_should_buy": "specific user types",
    "who_should_avoid": "specific user types that might be disappointed"
}}"""
        
        return prompt

    def _parse_gemini_response(self, response_text: str) -> Optional[Dict[str, Any]]:
        """Parse Gemini response and extract JSON."""
        try:
            # Clean up response - remove markdown code blocks if present
            text = response_text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            # Parse JSON
            analysis = json.loads(text)
            
            # Validate required fields
            required_fields = ["summary", "pros", "cons", "verdict_score"]
            for field in required_fields:
                if field not in analysis:
                    logger.warning(f"Gemini response missing field: {field}")
            
            logger.info("Successfully parsed Gemini product analysis")
            return analysis
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response: {e}")
            logger.debug(f"Raw response: {response_text[:200]}")
            return None
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {e}", exc_info=True)
            return None

