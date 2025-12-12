import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, Sparkles, ShoppingCart, Zap } from "lucide-react";

interface SearchLoadingProps {
	isVisible: boolean;
	isPagination?: boolean;
}

const LOADING_MESSAGES = [
	{
		text: "🔍 Searching your products from best sources...",
		icon: Search,
		color: "text-blue-500",
	},
	{
		text: "⚡ Connecting to Amazon & Google Shopping...",
		icon: ShoppingCart,
		color: "text-orange-500",
	},
	{
		text: "✨ AI is crafting the results...",
		icon: Sparkles,
		color: "text-purple-500",
	},
	{
		text: "🚀 Deduplicating & ranking products...",
		icon: Zap,
		color: "text-yellow-500",
	},
	{
		text: "📊 Preparing the best matches for you...",
		icon: Sparkles,
		color: "text-green-500",
	},
];

export const SearchLoading = ({
	isVisible,
	isPagination = false,
}: SearchLoadingProps) => {
	const [messageIndex, setMessageIndex] = useState(0);

	useEffect(() => {
		if (!isVisible) return;

		const interval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
		}, 2000);

		return () => clearInterval(interval);
	}, [isVisible]);

	if (!isVisible) return null;

	const currentMessage = LOADING_MESSAGES[messageIndex];
	const IconComponent = currentMessage.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
			className={`flex flex-col items-center justify-center gap-4 ${
				isPagination ? "py-8" : "py-16"
			}`}
		>
			{/* Main spinner */}
			<div className="relative flex items-center justify-center">
				{/* Outer rotating ring */}
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
					className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50"
					style={{ width: 60, height: 60 }}
				/>

				{/* Inner rotating ring (opposite direction) */}
				<motion.div
					animate={{ rotate: -360 }}
					transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
					className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/30 border-l-primary/50"
					style={{ width: 48, height: 48 }}
				/>

				{/* Center icon with pulse */}
				<motion.div
					animate={{ scale: [1, 1.1, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
					className={`relative z-10 ${currentMessage.color}`}
				>
					<Loader2 className="w-6 h-6 animate-spin" />
				</motion.div>
			</div>

			{/* Changing messages */}
			<motion.div
				key={messageIndex}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{ duration: 0.3 }}
				className="text-center space-y-2"
			>
				<div className="text-sm md:text-base font-medium text-foreground">
					{currentMessage.text}
				</div>

				{/* Progress indicator dots */}
				<div className="flex gap-1 justify-center">
					{[0, 1, 2, 3, 4].map((i) => (
						<motion.div
							key={i}
							animate={{
								scale: i === messageIndex ? 1.2 : 0.8,
								opacity: i === messageIndex ? 1 : 0.4,
							}}
							transition={{ duration: 0.3 }}
							className="w-2 h-2 rounded-full bg-primary"
						/>
					))}
				</div>
			</motion.div>

			{/* Subtext for pagination */}
			{isPagination && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-xs text-muted-foreground mt-2"
				>
					Hold tight, fetching new results...
				</motion.p>
			)}
		</motion.div>
	);
};
