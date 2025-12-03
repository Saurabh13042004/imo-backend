import { useQuery } from "@tanstack/react-query";
import { getProductBasic, getProductReviews, getProductVideos } from "@/integrations/fastapi";

export const useProductBasic = (productId?: string) => {
	return useQuery({
		queryKey: ["product-basic", productId],
		queryFn: async ({ signal }) => {
			if (!productId) throw new Error("Product ID is required");

			// Validate productId format before making the API call
			if (
				productId === "undefined" ||
				productId === "null" ||
				!productId.trim()
			) {
				throw new Error("Invalid product ID format");
			}

			// Basic UUID format validation
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (!uuidRegex.test(productId)) {
				throw new Error("Product ID must be a valid UUID");
			}

			try {
				const data: any = await getProductBasic(productId);
				return data;
			} catch (error: any) {
				throw new Error(error.message || "Failed to fetch product");
			}
		},
		enabled: !!productId && productId !== "undefined" && productId !== "null",
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		placeholderData: (previousData) => previousData,
	});
};

export const useProductReviews = (
	productId?: string,
	enabled: boolean = true,
) => {
	return useQuery({
		queryKey: ["product-reviews", productId],
		queryFn: async ({ signal }) => {
			if (!productId) throw new Error("Product ID is required");

			// Validate productId format
			if (
				productId === "undefined" ||
				productId === "null" ||
				!productId.trim()
			) {
				throw new Error("Invalid product ID format");
			}

			try {
				const data: any = await getProductReviews(productId);
				return data;
			} catch (error: any) {
				throw new Error(error.message || "Failed to fetch reviews");
			}
		},
		enabled:
			!!productId &&
			enabled &&
			productId !== "undefined" &&
			productId !== "null",
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		placeholderData: (previousData) => previousData,
	});
};

export const useProductVideos = (
	productId?: string,
	enabled: boolean = true,
) => {
	return useQuery({
		queryKey: ["product-videos", productId],
		queryFn: async ({ signal }) => {
			if (!productId) throw new Error("Product ID is required");

			// Validate productId format
			if (
				productId === "undefined" ||
				productId === "null" ||
				!productId.trim()
			) {
				throw new Error("Invalid product ID format");
			}

			try {
				const data: any = await getProductVideos(productId);
				return data;
			} catch (error: any) {
				throw new Error(error.message || "Failed to fetch videos");
			}
		},
		enabled:
			!!productId &&
			enabled &&
			productId !== "undefined" &&
			productId !== "null",
		staleTime: 15 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		placeholderData: (previousData) => previousData,
	});
};
