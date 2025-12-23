import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SearchLoadingProps {
	isVisible: boolean;
	isPagination?: boolean;
}

const LOADING_MESSAGES = [
	"🔍 Searching across thousands of products...",
	"✨ Analyzing reviews and ratings...",
	"🎁 Finding the best deals for you...",
	"🤖 IMO AI is comparing prices...",
	"📊 Gathering product insights...",
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

	const currentMessage = LOADING_MESSAGES[messageIndex];

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
				<div className="text-sm md:text-base font-medium text-foreground">
					{currentMessage}
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
