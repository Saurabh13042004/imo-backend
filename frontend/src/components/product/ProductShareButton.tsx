import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface ProductShareButtonProps {
  productTitle: string;
  productUrl?: string;
  productPrice?: number | string;
}

export const ProductShareButton = ({ 
  productTitle, 
  productUrl,
  productPrice 
}: ProductShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Use current page URL if productUrl not provided
  const shareUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `Check out ${productTitle}${productPrice ? ` - ${productPrice}` : ''} on IMO - Informed Market Opinions`;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank');
    setIsOpen(false);
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setIsOpen(false);
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
    setIsOpen(false);
  };

  const handleEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.location.href = mailtoUrl;
    setIsOpen(false);
  };

  const handleTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    setIsOpen(false);
  };

  const handleReddit = () => {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(productTitle)}`;
    window.open(redditUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Share Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        title="Share this product"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {/* Share Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Share Product</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{productTitle}</p>
          </div>

          {/* Share Options */}
          <div className="py-2">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.982 1.313c-1.536.906-2.859 2.197-3.759 3.78-1.537 2.777-.468 6.354 2.386 8.27 1.538.912 3.287 1.282 5.036 1.067 1.404-.166 2.744-.65 3.839-1.493.581-.448 1.095-1.021 1.514-1.67.657-1.051.973-2.298.987-3.603-.01-2.761-2.293-5.054-5.117-5.064zm0-2.032c3.418 0 6.295 2.793 6.319 6.211-.02 3.37-2.901 6.155-6.319 6.175-1.809-.046-3.523-.55-4.95-1.496-2.812-1.832-4.248-5.324-3.225-8.522.961-2.93 3.725-4.77 6.747-4.73 1.067 0 2.115.197 3.127.588l.073-.04" />
              </svg>
              <span>WhatsApp</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleLinkedIn}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.811 0-9.728h3.554v1.375c.425-.654 1.185-1.586 2.882-1.586 2.105 0 3.685 1.375 3.685 4.331v5.608zM5.337 5.129c-1.141 0-1.886-.755-1.886-1.699 0-.943.745-1.699 1.886-1.699 1.141 0 1.886.756 1.886 1.699 0 .944-.745 1.699-1.886 1.699zm1.586 15.323H3.751V8.724h3.172v11.728zM22.224 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.224 0z" />
              </svg>
              <span>LinkedIn</span>
            </button>

            {/* Twitter */}
            <button
              onClick={handleTwitter}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span>Twitter/X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>Email</span>
            </button>

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-slate-700 my-2"></div>

            {/* More Options */}
            <button
              onClick={handleTelegram}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.879-.535 1.17-.99 1.201-.842.074-1.482-.494-2.29-.971-.612-.387-1.012-.628-1.639-1.008-.662-.42-.236-.654.144-1.03.366-.38.822-.761 1.242-1.123.2-.19.394-.384.581-.584.10-.11.023-.256-.2-.386-.22-.13-.497-.1-.71.027-.214.135-3.969 2.663-5.538 3.622-.235.158-.435.327-.898.317-.293-.01-.86-.138-1.281-.338-.939-.341-1.684-.993-1.685-2.054-.001-1.062.658-1.891 1.61-1.891.282 0 .564.045.85.141 1.4.466 5.461 2.335 6.93 3.009.5.168 1.173.325 1.756.325.96 0 1.734-.294 1.744-1.914.007-.782-.165-1.32-.266-1.521-.1-.2-.299-.286-.567-.381-.27-.097-.506-.135-1.518-.291z" />
              </svg>
              <span>Telegram</span>
            </button>

            {/* Reddit */}
            <button
              onClick={handleReddit}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .766 1.79c0 1.694-1.666 2.556-4.592 2.556-2.926 0-4.592-.862-4.592-2.556 0-.963.303-1.434.766-1.79a1.74 1.74 0 0 1-1.01-1.614c0-.968.786-1.754 1.754-1.754.477 0 .899.182 1.207.491 1.194-.856 2.849-1.418 4.674-1.488l.598-2.8.928.16c.66-.164 1.36-.3 2.02-.3.748 0 1.456.147 2.11.432l-.99-4.61c-.672-.019-1.304-.559-1.304-1.249 0-.687.56-1.249 1.25-1.249zm-5.193 8.667a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0zm5.25 0a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0z" />
              </svg>
              <span>Reddit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
