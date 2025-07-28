import { Suspense } from 'react';
import Hero from '@/components/sections/Hero';
import { AIProjects } from '@/components/sections/AIProjects';
import { getAIProjects } from '@/content/ai-projects';
import { generatePortfolioStructuredData } from '@/lib/seo/structured-data';
import { SocialShare } from '@/components/ui/SocialShare';
import { generateShareableUrl } from '@/lib/seo/social-preview';
import { AccessibilityToolbar } from '@/components/ui/AccessibilityToolbar';

export default async function Home() {
  const aiProjects = await getAIProjects();
  const portfolioStructuredData = generatePortfolioStructuredData(aiProjects);
  
  const heroData = {
    title: "Christopher Belgrave",
    subtitle: "AI Innovation & Project Leadership",
    description: "Transforming creative workflows through artificial intelligence and strategic project management. Delivering measurable results in advertising, gaming, and digital experiences.",
    ctaButtons: [
      {
        text: "View AI Projects",
        href: "#projects",
        variant: "accent" as const,
      },
      {
        text: "Download CV",
        href: "/Christopher_Belgrave_CV.pdf",
        variant: "outline" as const,
        external: true,
      },
    ],
    typewriterTexts: [
      "AI Strategy & Implementation",
      "Creative Technology Leadership",
      "Digital Transformation",
      "Project Management Excellence",
      "Innovation & Process Optimization",
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
              title="AI Project Showcase"
              subtitle="Interactive demonstrations of AI-powered solutions that drive real business impact"
              showAll={false}
            />
          </Suspense>
        </section>
        
        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />
        
        {/* Floating Social Share */}
        <SocialShare
          url={generateShareableUrl('/', 'floating', 'home_share')}
          title="Christopher Belgrave - AI Innovation & Project Leadership"
          description="AI Project Manager and Digital Specialist transforming creative workflows through artificial intelligence."
          hashtags={['AI', 'ProjectManagement', 'Innovation', 'DigitalTransformation']}
          variant="floating"
          size="md"
        />
      </main>
    </>
  );
}
