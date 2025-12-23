import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SearchLoadingProps {
	isVisible: boolean;
	isPagination?: boolean;
}

const LOADING_MESSAGES = [
	"🔍 IMO is fetching products from Internet...",
	"✨ IMO AI Crafting best shopping experience for you...",
	"🎁 IMO AI fetching all offers for you...",
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
		}, 3000);

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
			{/* Simple Animated Spinner */}
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
				className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
			/>

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
				<div className="flex gap-1 justify-center">
					{[0, 1, 2].map((i) => (
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
