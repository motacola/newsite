import ExperienceTimeline from '@/components/ui/ExperienceTimeline';
import experiences from '@/content/experience-data';
import { Metadata } from 'next';
import Link from 'next/link';
import { generateExperienceMetadata } from '@/lib/seo/metadata';
import { generateExperienceStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo/structured-data';
import { SocialShare } from '@/components/ui/SocialShare';
import { generateShareableUrl } from '@/lib/seo/social-preview';

export const metadata: Metadata = generateExperienceMetadata();

export default function ExperiencePage() {
  const experienceStructuredData = generateExperienceStructuredData(experiences);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Experience', url: '/experience' }
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(experienceStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Professional Experience
          </h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center mb-6">
          My career journey in digital marketing, AI project management, and creative technology leadership.
        </p>
        
        <div className="text-center mb-12">
          <Link 
            href="/cv" 
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-6"
          >
            View my full CV
            <svg 
              className="ml-1 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          
          {/* Social Sharing */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">Share my experience:</p>
              <SocialShare
                url={generateShareableUrl('/experience', 'direct', 'experience_share')}
                title="Christopher Belgrave - Professional Experience & CV"
                description="Comprehensive overview of professional experience in AI project management and digital marketing."
                hashtags={['AI', 'ProjectManagement', 'DigitalMarketing', 'Experience']}
                showLabels={false}
                size="md"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Vertical Timeline
          </h2>
          <ExperienceTimeline 
            experiences={experiences} 
            layout="vertical" 
            interactive={true} 
          />
        </div>
        
        <div className="mt-20 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Horizontal Timeline
          </h2>
          <ExperienceTimeline 
            experiences={experiences} 
            layout="horizontal" 
            interactive={true} 
          />
        </div>
      </div>
    </main>
    </>
  );
}