'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Display, Lead } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Container';
import BackgroundMedia from '@/components/ui/BackgroundMedia';

interface MediaItem {
  type: 'video' | 'image';
  src: string;
  fallback?: string;
  alt?: string;
  poster?: string;
}

interface HeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaButtons: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
    external?: boolean;
  }[];
  typewriterTexts: string[];
  backgroundMedia?: MediaItem[];
  showMediaControls?: boolean;
  // Enhanced BackgroundMedia props
  responsiveBreakpoints?: {
    mobile?: MediaItem[];
    tablet?: MediaItem[];
    desktop?: MediaItem[];
  };
  enableIntersectionObserver?: boolean;
  lazyLoad?: boolean;
  videoQuality?: 'auto' | 'high' | 'medium' | 'low';
  enablePictureInPicture?: boolean;
  enableFullscreen?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  ctaButtons,
  typewriterTexts,
  backgroundMedia,
  showMediaControls = false,
  responsiveBreakpoints,
  enableIntersectionObserver = true,
  lazyLoad = false,
  videoQuality = 'auto',
  enablePictureInPicture = false,
  enableFullscreen = false,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    const currentText = typewriterTexts[currentTextIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentTextIndex, typewriterTexts]);

  // Default background media if none provided
  const defaultBackgroundMedia: MediaItem[] = [
    {
      type: 'image',
      src: '/chris_profile.jpeg',
      alt: 'Christopher Belgrave - AI Expert and Project Manager',
      fallback: '/chris_profile.jpeg'
    }
  ];

  const mediaToUse = backgroundMedia || defaultBackgroundMedia;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Media System */}
      <BackgroundMedia
        media={mediaToUse}
        className="absolute inset-0"
        overlay={true}
        overlayOpacity={0.6}
        controls={showMediaControls}
        autoPlay={true}
        muted={true}
        loop={true}
        preload="metadata"
        priority={true}
        responsiveBreakpoints={responsiveBreakpoints}
        enableIntersectionObserver={enableIntersectionObserver}
        lazyLoad={lazyLoad}
        videoQuality={videoQuality}
        enablePictureInPicture={enablePictureInPicture}
        enableFullscreen={enableFullscreen}
      />

      {/* Fallback Geometric Background (when no media or as overlay) */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <GeometricBackground />
      </div>

      {/* Content */}
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/90 mb-6">
              {subtitle}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Display className="text-white mb-4">
              {title}
            </Display>
          </motion.div>

          {/* Typewriter Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="h-16 flex items-center justify-center"
          >
            <div className="text-2xl md:text-3xl font-semibold text-accent-cyan">
              {displayText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                className="inline-block w-0.5 h-8 bg-accent-cyan ml-1"
              />
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-2xl mx-auto"
          >
            <Lead className="text-white/80">
              {description}
            </Lead>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            {ctaButtons.map((button, index) => (
              <FloatingButton
                key={index}
                href={button.href}
                variant={button.variant}
                external={button.external}
                delay={index * 0.1}
              >
                {button.text}
              </FloatingButton>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ScrollIndicator />
        </motion.div>
      </Container>
    </section>
  );
};

// Floating Button Component with hover effects
const FloatingButton: React.FC<{
  children: React.ReactNode;
  href: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  external?: boolean;
  delay: number;
}> = ({ children, href, variant, external, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button variant={variant} size="lg" className="shadow-glow">
            {children}
          </Button>
        </a>
      ) : (
        <a href={href}>
          <Button variant={variant} size="lg" className="shadow-glow">
            {children}
          </Button>
        </a>
      )}
    </motion.div>
  );
};

// Geometric Background Animation Component
const GeometricBackground: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Animated geometric shapes */}
      {[...Array(6)].map((_, i) => {
        const initialX = Math.random() * dimensions.width;
        const initialY = Math.random() * dimensions.height;
        const targetX = Math.random() * dimensions.width;
        const targetY = Math.random() * dimensions.height;
        const size = 100 + Math.random() * 100;
        
        return (
          <motion.div
            key={i}
            className="absolute opacity-10"
            initial={{ 
              x: initialX,
              y: initialY,
              rotate: 0,
              scale: 0.5
            }}
            animate={{
              x: [initialX, targetX, initialX],
              y: [initialY, targetY, initialY],
              rotate: 360,
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
            style={{
              width: size,
              height: size,
            }}
          >
            <div 
              className={`w-full h-full ${
                i % 3 === 0 ? 'bg-accent-cyan' : 
                i % 3 === 1 ? 'bg-accent-purple' : 'bg-accent-orange'
              } ${
                i % 2 === 0 ? 'rounded-full' : 'rounded-lg'
              }`}
            />
          </motion.div>
        );
      })}

      {/* Particle system */}
      <ParticleSystem />
    </div>
  );
};

// Particle System Component
const ParticleSystem: React.FC = () => {
  const particles = [...Array(50)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Scroll Indicator Component
const ScrollIndicator: React.FC = () => {
  return (
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="flex flex-col items-center text-white/60 cursor-pointer"
    >
      <span className="text-sm mb-2">Scroll to explore</span>
      <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1 h-3 bg-white/60 rounded-full mt-2"
        />
      </div>
    </motion.div>
  );
};

export default Hero;