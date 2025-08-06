import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AIProjects } from '@/components/sections/AIProjects';
import { Services } from '@/components/sections/Services';
import { getAIProjectsSync } from '@/content/ai-projects';
import { generatePortfolioStructuredData } from '@/lib/seo/structured-data';
import { SocialShare } from '@/components/ui/SocialShare';
import { generateShareableUrl } from '@/lib/seo/social-preview';
import { AccessibilityToolbar } from '@/components/ui/AccessibilityToolbar';

// Dynamically import Hero to prevent hydration mismatch
const Hero = dynamic(() => import('@/components/sections/Hero'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-white/60 text-sm">Loading...</span>
      </div>
    </div>
  )
});

export default async function Home() {
  const aiProjects = getAIProjectsSync();
  const portfolioStructuredData = generatePortfolioStructuredData(aiProjects);
  
  const heroData = {
    title: "Christopher Belgrave",
    subtitle: "Creative Technologist & Digital Innovator",
    description: "Crafting extraordinary digital experiences through cutting-edge technology and creative vision. Specializing in AI-powered solutions for advertising, gaming, and immersive media.",
    ctaButtons: [
      {
        text: "Explore Our Work",
        href: "#projects",
        variant: "accent" as const,
      },
      {
        text: "Start a Project",
        href: "/contact",
        variant: "outline" as const,
      },
    ],
    typewriterTexts: [
      "Creative Technology Solutions",
      "Immersive Digital Experiences",
      "AI-Powered Innovations",
      "Interactive Media Design",
      "Next-Generation Campaigns",
    ],
    // Enhanced background media with video support and responsive breakpoints
    backgroundMedia: [
      {
        type: 'video' as const,
        src: '/hero-background.mp4',
        sources: [
          {
            src: '/hero-background.webm',
            type: 'video/webm',
            media: '(min-width: 1024px)'
          },
          {
            src: '/hero-background.mp4',
            type: 'video/mp4'
          }
        ],
        poster: '/chris_profile.jpeg',
        fallback: '/chris_profile.jpeg',
        alt: 'Christopher Belgrave - AI Expert and Project Manager',
        ariaLabel: 'Background video showcasing Christopher Belgrave\'s AI expertise',
        quality: 'high',
        preload: 'metadata',
        priority: true,
        loading: 'eager',
        aspectRatio: '16/9',
        duration: 30,
        cacheControl: 'public, max-age=31536000'
      },
      {
        type: 'image' as const,
        src: '/chris_profile.jpeg',
        srcSet: '/chris_profile.jpeg 1x, /chris_profile@2x.jpeg 2x',
        sizes: '100vw',
        alt: 'Christopher Belgrave - AI Expert and Project Manager',
        ariaLabel: 'Professional portrait of Christopher Belgrave',
        fallback: '/chris_profile.jpeg',
        quality: 'high',
        preload: 'auto',
        priority: true,
        loading: 'eager',
        aspectRatio: '16/9',
        cacheControl: 'public, max-age=31536000'
      }
    ],
    // Responsive breakpoints for different screen sizes with optimized media
    responsiveBreakpoints: {
      desktop: [
        {
          type: 'video' as const,
          src: '/hero-background-desktop.mp4',
          sources: [
            {
              src: '/hero-background-desktop.webm',
              type: 'video/webm',
              media: '(min-width: 1024px)'
            },
            {
              src: '/hero-background-desktop.hevc.mp4',
              type: 'video/mp4; codecs="hvc1"',
              media: '(min-width: 1024px)'
            },
            {
              src: '/hero-background-desktop.mp4',
              type: 'video/mp4'
            }
          ],
          poster: '/chris_profile-desktop.jpeg',
          fallback: '/chris_profile-desktop.jpeg',
          alt: 'Christopher Belgrave - AI Expert and Project Manager',
          ariaLabel: 'High-quality background video for desktop viewing',
          quality: 'high',
          preload: 'metadata',
          priority: true,
          loading: 'eager',
          aspectRatio: '16/9',
          duration: 30,
          cacheControl: 'public, max-age=31536000'
        }
      ],
      tablet: [
        {
          type: 'video' as const,
          src: '/hero-background-tablet.mp4',
          sources: [
            {
              src: '/hero-background-tablet.webm',
              type: 'video/webm',
              media: '(min-width: 768px) and (max-width: 1023px)'
            },
            {
              src: '/hero-background-tablet.mp4',
              type: 'video/mp4'
            }
          ],
          poster: '/chris_profile-tablet.jpeg',
          fallback: '/chris_profile-tablet.jpeg',
          alt: 'Christopher Belgrave - AI Expert and Project Manager',
          ariaLabel: 'Optimized background video for tablet viewing',
          quality: 'medium',
          preload: 'metadata',
          loading: 'lazy',
          aspectRatio: '16/9',
          duration: 30,
          cacheControl: 'public, max-age=31536000'
        }
      ],
      mobile: [
        {
          type: 'image' as const,
          src: '/chris_profile-mobile.jpeg',
          srcSet: '/chris_profile-mobile.jpeg 1x, /chris_profile-mobile@2x.jpeg 2x',
          sizes: '(max-width: 767px) 100vw',
          alt: 'Christopher Belgrave - AI Expert and Project Manager',
          ariaLabel: 'Mobile-optimized portrait of Christopher Belgrave',
          fallback: '/chris_profile.jpeg',
          quality: 'medium',
          preload: 'metadata',
          priority: true,
          loading: 'eager',
          aspectRatio: '4/3',
          cacheControl: 'public, max-age=31536000'
        }
      ]
    },
    showMediaControls: true, // Enable controls to demonstrate new features
    enableIntersectionObserver: true,
    lazyLoad: false, // Hero should load immediately
    enablePictureInPicture: false, // Not needed for background media
    enableFullscreen: true
  };

  return (
    <>
      {/* Portfolio Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portfolioStructuredData),
        }}
      />
      
      <main id="main-content" role="main">
        <Hero {...heroData} />
        <section id="projects" aria-labelledby="projects-heading">
          <Suspense fallback={
            <div className="py-20 text-center" role="status" aria-live="polite">
              <span className="sr-only">Loading projects...</span>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          }>
            <AIProjects 
              projects={aiProjects}
              title="Featured Work"
              subtitle="Cutting-edge digital experiences that blend creativity with advanced technology"
              showAll={false}
            />
          </Suspense>
        </section>
        
        {/* Services Section */}
        <Suspense fallback={
          <div className="py-20 text-center" role="status" aria-live="polite">
            <span className="sr-only">Loading services...</span>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        }>
          <Services />
        </Suspense>
        
        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />
        
        {/* Floating Social Share */}
        <SocialShare
          url={generateShareableUrl('/', 'floating', 'home_share')}
          title="Christopher Belgrave - Creative Technologist & Digital Innovator"
          description="Award-winning creative technologist crafting extraordinary digital experiences through cutting-edge technology."
          hashtags={['CreativeTech', 'DigitalInnovation', 'AI', 'InteractiveMedia']}
          variant="floating"
          size="md"
        />
      </main>
    </>
  );
}
