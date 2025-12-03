import { useState, useEffect } from "react";
import type { Product } from "@/types/search";

interface SearchProductsParams {
	query: string;
	enabled?: boolean;
	page?: number;
	pageSize?: number;
	sortBy?: "price_low" | "price_high" | "imo_score" | "rating" | "newest" | "most_reviewed";
	priceRange?: [number, number];
	minImoScore?: number;
	minRating?: number;
	zipcode?: string;
}

interface ApiSearchResponse {
	success: boolean;
	keyword: string;
	zipcode: string;
	total_results: number;
	results: any[];
}

interface SearchResponse {
	products: Product[];
	isFromCache: boolean;
	isStaleData?: boolean;
	message: string;
	totalCount: number;
	count: number;
	currentPage: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export function useProductSearch({
	query,
	enabled = true,
	page = 1,
	pageSize = 12,
	sortBy = "newest",
	priceRange,
	minImoScore,
	minRating,
	zipcode = "60607",
}: SearchProductsParams) {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		if (!enabled || !query?.trim()) {
			setProducts([]);
			setTotalCount(0);
			setTotalPages(0);
			return;
		}

		const fetchProducts = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch("http://localhost:8000/api/v1/search", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
					},
					body: JSON.stringify({
						keyword: query.trim(),
						zipcode: zipcode,
					}),
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const data: ApiSearchResponse = await response.json();

				if (!data.success || !data.results) {
					throw new Error("Invalid API response");
				}

				// Transform API results to Product type
				const transformedProducts: Product[] = data.results.map((item: any) => ({
					id: item.id || item.source_id,
					title: item.title,
					description: item.description || item.title,
					price: parseFloat(item.price) || 0,
					image_url: item.image_url || "https://via.placeholder.com/300",
					product_url: item.url || "#",
					source: item.source || "amazon",
					source_id: item.source_id,
					imo_score: 0, // API doesn't provide this
					pros: [],
					cons: [],
					created_at: item.created_at || new Date().toISOString(),
					site_rating: parseFloat(item.rating) || 0,
					reviews_count: parseInt(item.review_count) || 0,
					brand: item.brand || "",
					category: item.category || "",
					availability: item.availability || "In Stock",
					review_count: parseInt(item.review_count) || 0,
					rating: parseFloat(item.rating) || 0,
					url: item.url || "#",
					asin: item.asin,
				}));

				// Apply client-side filters if needed
				let filteredProducts = transformedProducts;

				if (priceRange) {
					filteredProducts = filteredProducts.filter(
						(p) => p.price >= priceRange[0] && p.price <= priceRange[1]
					);
				}

				if (minRating) {
					filteredProducts = filteredProducts.filter((p) => (p.site_rating || 0) >= minRating);
				}

				// Apply sorting
				if (sortBy === "price_low") {
					filteredProducts.sort((a, b) => a.price - b.price);
				} else if (sortBy === "price_high") {
					filteredProducts.sort((a, b) => b.price - a.price);
				} else if (sortBy === "rating") {
					filteredProducts.sort((a, b) => (b.site_rating || 0) - (a.site_rating || 0));
				}

				// Paginate
				const calculatedTotalPages = Math.ceil(filteredProducts.length / pageSize);
				const startIndex = (page - 1) * pageSize;
				const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

				setProducts(paginatedProducts);
				setTotalCount(filteredProducts.length);
				setTotalPages(calculatedTotalPages);
			} catch (err) {
				console.error("Search error:", err);
				setError(err instanceof Error ? err.message : "Failed to fetch products");
				setProducts([]);
				setTotalCount(0);
				setTotalPages(0);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
	}, [query, enabled, page, pageSize, sortBy, priceRange, minRating, zipcode]);

	return {
		products,
		totalCount,
		count: products.length,
		isFromCache: false,
		isStaleData: false,
		message: totalCount > 0 ? `Found ${totalCount} products` : "No products found",
		currentPage: page,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
		isPending: isLoading,
		isAnalyzing: false,
		isLoading,
		isFetching: isLoading,
		isError: !!error,
		error,
		fetchFresh: () => {},
		isFetchingFresh: false,
		refetch: () => {},
		showUpgradeBanner: false,
	};
}

export function useProductDetails(productId?: string) {
	return {
		data: null,
		isLoading: false,
		isError: false,
		error: null,
	};
}
