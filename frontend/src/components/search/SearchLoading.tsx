import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Gift from "lucide-react/dist/esm/icons/gift";
import Zap from "lucide-react/dist/esm/icons/zap";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";

interface SearchLoadingProps {
	isVisible: boolean;
	isPagination?: boolean;
}

const LOADING_MESSAGES = [
	{ text: "Searching across thousands of products...", icon: Search },
	{ text: "Analyzing reviews and ratings...", icon: Sparkles },
	{ text: "Finding the best deals for you...", icon: Gift },
	{ text: "IMO AI is comparing prices...", icon: Zap },
	{ text: "Gathering product insights...", icon: BarChart3 },
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
		}, 2500);

		return () => clearInterval(interval);
	}, [isVisible]);

	if (!isVisible) return null;

	const currentMessageObj = LOADING_MESSAGES[messageIndex];
	const IconComponent = currentMessageObj.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.4 }}
			className={`flex flex-col items-center justify-center gap-8 ${
				isPagination ? "py-8" : "py-16"
			}`}
		>
			{/* Improved Animated Spinner */}
			<div className="relative">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
					className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
				/>
				<motion.div
					animate={{ rotate: -360 }}
					transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
					className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-secondary/40 rounded-full"
				/>
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
				<div className="text-sm md:text-base font-medium text-foreground flex items-center justify-center gap-2">
					<IconComponent className="h-5 w-5 text-primary" />
					{currentMessageObj.text}
				</div>

				{/* Progress indicator dots */}
				<div className="flex gap-1.5 justify-center">
					{[0, 1, 2, 3, 4].map((i) => (
						<motion.div
							key={i}
							animate={{
								scale: i === messageIndex ? 1.3 : 0.7,
								opacity: i === messageIndex ? 1 : 0.3,
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
