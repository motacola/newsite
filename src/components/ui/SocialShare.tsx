'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  className?: string;
  showLabels?: boolean;
  variant?: 'horizontal' | 'vertical' | 'floating';
  size?: 'sm' | 'md' | 'lg';
}

interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (params: {
    url: string;
    title: string;
    description: string;
    image?: string;
    hashtags?: string;
  }) => string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'Twitter',
    icon: '𝕏',
    color: 'hover:bg-black hover:text-white',
    shareUrl: ({ url, title, hashtags }) => {
      const text = encodeURIComponent(title);
      const hashtagsStr = hashtags ? encodeURIComponent(hashtags) : '';
      return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}&hashtags=${hashtagsStr}`;
    },
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: 'hover:bg-blue-600 hover:text-white',
    shareUrl: ({ url, title, description }) => {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
    },
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: 'hover:bg-blue-500 hover:text-white',
    shareUrl: ({ url, title, description }) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${title} - ${description}`)}`;
    },
  },
  {
    name: 'WhatsApp',
    icon: '💬',
    color: 'hover:bg-green-500 hover:text-white',
    shareUrl: ({ url, title }) => {
      const text = encodeURIComponent(`${title} - ${url}`);
      return `https://wa.me/?text=${text}`;
    },
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: 'hover:bg-blue-400 hover:text-white',
    shareUrl: ({ url, title }) => {
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    },
  },
  {
    name: 'Reddit',
    icon: '🔴',
    color: 'hover:bg-orange-500 hover:text-white',
    shareUrl: ({ url, title }) => {
      return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    },
  },
];

export function SocialShare({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Christopher Belgrave - AI Innovation & Project Leadership',
  description = 'AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence.',
  image,
  hashtags = ['AI', 'ProjectManagement', 'DigitalTransformation', 'Innovation'],
  className = '',
  showLabels = false,
  variant = 'horizontal',
  size = 'md',
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const handleShare = (platform: SocialPlatform) => {
    const shareUrl = platform.shareUrl({
      url,
      title,
      description,
      image,
      hashtags: hashtags.join(','),
    });
    
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 ${className}`}>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors mb-2"
            aria-label="Share this page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-lg shadow-lg p-4 space-y-2"
              >
                {socialPlatforms.slice(0, 4).map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform)}
                    className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg border border-gray-200 transition-colors ${platform.color}`}
                    title={`Share on ${platform.name}`}
                  >
                    <span>{platform.icon}</span>
                  </button>
                ))}
                
                <button
                  onClick={handleCopyUrl}
                  className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg border border-gray-200 transition-colors hover:bg-gray-100`}
                  title="Copy URL"
                >
                  {copiedUrl ? '✅' : '🔗'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const containerClasses = variant === 'vertical' ? 'flex flex-col space-y-2' : 'flex flex-wrap gap-2';

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg border border-gray-200 transition-colors hover:bg-primary-50 hover:border-primary-200`}
          title="Share"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          {showLabels && <span className="ml-2 text-sm">Share</span>}
        </button>
      )}

      {/* Social Platform Buttons */}
      {socialPlatforms.map((platform) => (
        <button
          key={platform.name}
          onClick={() => handleShare(platform)}
          className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg border border-gray-200 transition-colors ${platform.color}`}
          title={`Share on ${platform.name}`}
        >
          <span>{platform.icon}</span>
          {showLabels && <span className="ml-2 text-sm">{platform.name}</span>}
        </button>
      ))}

      {/* Copy URL Button */}
      <button
        onClick={handleCopyUrl}
        className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg border border-gray-200 transition-colors hover:bg-gray-100 ${copiedUrl ? 'bg-green-50 border-green-200' : ''}`}
        title={copiedUrl ? 'URL Copied!' : 'Copy URL'}
      >
        {copiedUrl ? '✅' : '🔗'}
        {showLabels && <span className="ml-2 text-sm">{copiedUrl ? 'Copied!' : 'Copy URL'}</span>}
      </button>
    </div>
  );
}