import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Link, Code, Mic, X, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface IMOAIChatProps {
  productTitle?: string;
  productDescription?: string;
}

export const IMOAIChat: React.FC<IMOAIChatProps> = ({ 
  productTitle = "Product",
  productDescription = ""
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting message
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: '1',
        type: 'bot',
        content: `Hey 👋 I'm IMO AI, your personal shopping assistant!\n\nI'm here to help you research about "${productTitle}". You can ask me anything about:\n\n• Product features & specifications\n• Price comparisons\n• User reviews & ratings\n• Whether this product is right for you\n• Alternatives & similar products\n• Best places to buy\n\nWhat would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [isChatOpen, productTitle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setCharCount(0);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateAIResponse(message, productTitle),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
  };

  const generateAIResponse = (userMessage: string, productTitle: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return `Based on my analysis of "${productTitle}", here's what I found about pricing:\n\n• Average price: Check product details above ⬆️\n• Price range: Varies by retailer\n• Best deals: Usually available on major platforms\n• My tip: Set a price alert to get notified when prices drop! 🔔`;
    }

    if (lowerMessage.includes('review') || lowerMessage.includes('rating')) {
      return `Reviews for "${productTitle}":\n\n✅ User ratings are displayed above\n✅ Real customer feedback available\n✅ Check short video reviews section\n\nWould you like me to summarize the pros and cons based on reviews?`;
    }

    if (lowerMessage.includes('alternative') || lowerMessage.includes('similar')) {
      return `Looking for alternatives to "${productTitle}"?\n\nI can help you find similar products! Let me know:\n• Your budget range\n• Specific features you need\n• Brand preferences\n\nThis will help me recommend better alternatives! 🎯`;
    }

    if (lowerMessage.includes('feature') || lowerMessage.includes('spec')) {
      return `Key features of "${productTitle}" are listed in the product information above ⬆️\n\nWould you like me to:\n• Explain any specific feature?\n• Compare it with competitors?\n• Help you decide if it's right for you?`;
    }

    if (lowerMessage.includes('buy') || lowerMessage.includes('where')) {
      return `You can purchase "${productTitle}" from multiple retailers shown in the product details.\n\nTips for buying:\n✓ Compare prices across stores\n✓ Check return policies\n✓ Look for promotional codes\n✓ Set price alerts for better deals\n\nAny specific retailer you prefer? 🛍️`;
    }

    // Default helpful response
    return `Great question about "${productTitle}"! 🤔\n\nI'm analyzing the product information to give you the best answer. Here's what I can help with:\n\n• Tell me about specific features\n• Compare prices and retailers\n• Explain pros and cons\n• Help you decide if it's right for you\n• Find alternatives\n\nTry asking me about any of these! What interests you most? 💡`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        if (!(event.target as HTMLElement).closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating 3D Glowing AI Button */}
      <motion.button
        className="floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500"
        onClick={() => setIsChatOpen(!isChatOpen)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(124, 58, 237, 0.5), 0 0 60px rgba(109, 40, 217, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* 3D effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>

        {/* AI Icon */}
        <div className="relative z-10">
          {isChatOpen ? <X className="w-8 h-8 text-white" /> : <Bot className="w-8 h-8 text-white" />}
        </div>

        {/* Glowing animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-500 opacity-20"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        ></motion.div>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            ref={chatRef}
            className="absolute bottom-20 right-0 w-[420px] sm:w-[480px] h-[65vh] max-h-[700px] min-h-[500px]"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="relative flex flex-col h-full rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 border border-zinc-500/50 shadow-2xl backdrop-blur-3xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2 bg-gradient-to-r from-zinc-800/50 to-zinc-900/50">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  ></motion.div>
                  <span className="text-xs font-medium text-zinc-400">IMO AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-zinc-800/60 text-zinc-300 rounded-2xl">
                    Shopping Expert
                  </span>
                  <motion.button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-700/50 transition-colors"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </motion.button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                            : 'bg-zinc-700/50 text-zinc-100 rounded-bl-none border border-zinc-600/50'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-zinc-700/50 text-zinc-100 rounded-2xl rounded-bl-none border border-zinc-600/50 px-4 py-2">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-zinc-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        ></motion.div>
                        <motion.div
                          className="w-2 h-2 bg-zinc-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        ></motion.div>
                        <motion.div
                          className="w-2 h-2 bg-zinc-400 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <div className="border-t border-zinc-700/50 p-4 bg-zinc-900/50">
                <div className="relative overflow-hidden mb-3">
                  <textarea
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl outline-none resize-none text-sm leading-relaxed text-zinc-100 placeholder-zinc-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    placeholder="Ask about this product... (e.g., 'Is it worth buying?', 'How does it compare to...')"
                  />
                </div>

                {/* Action Buttons and Send */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 rounded-lg transition-colors"
                      title="Attach files"
                    >
                      <Paperclip className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 rounded-lg transition-colors"
                      title="Add web link"
                    >
                      <Link className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 rounded-lg transition-colors"
                      title="Voice input"
                    >
                      <Mic className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="text-xs text-zinc-500">
                    {charCount}/{maxChars}
                  </div>

                  <motion.button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Footer Info */}
                <div className="mt-2 pt-2 border-t border-zinc-800/50 text-xs text-zinc-500">
                  <span>💡 Tip: Press Shift + Enter for new line</span>
                </div>
              </div>

              {/* Floating Overlay */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent, rgba(168,85,247,0.05))',
                }}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IMOAIChat;
