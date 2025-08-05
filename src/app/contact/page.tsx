import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { ContactForm } from '@/components/ui/ContactForm';
import { ContactInfo } from '@/components/ui/ContactInfo';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { generateContactMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbStructuredData } from '@/lib/seo/structured-data';
import { SocialShare } from '@/components/ui/SocialShare';
import { generateShareableUrl } from '@/lib/seo/social-preview';

export const metadata: Metadata = generateContactMetadata();

export default function ContactPage() {
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' }
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-orange-50 via-purple-50 to-cyan-50">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-purple-500/5" />
        <Container>
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Let's Create{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">
                  Something Amazing
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Ready to push creative boundaries? Let's discuss your vision and craft an extraordinary digital experience together.
              </p>
              
              {/* Social Sharing */}
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3 text-center">Share this page:</p>
                  <SocialShare
                    url={generateShareableUrl('/contact', 'direct', 'contact_share')}
                    title="Contact Christopher Belgrave - AI & Digital Transformation Expert"
                    description="Get in touch for AI project management and digital transformation consulting opportunities."
                    hashtags={['AI', 'Consulting', 'ProjectManagement', 'Contact']}
                    showLabels={false}
                    size="md"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Information */}
            <AnimatedSection delay={0.2}>
              <ContactInfo />
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection delay={0.4}>
              <ContactForm />
            </AnimatedSection>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-700">
        <Container>
          <AnimatedSection>
            <div className="text-center text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Looking for My Work?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Check out my showreel and experience to see what I can bring to your project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/showreel"
                  className="inline-flex items-center justify-center px-8 py-4 bg-accent-cyan text-white font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors duration-300"
                >
                  View Showreel
                </a>
                <a
                  href="/experience"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-900 transition-colors duration-300"
                >
                  About Me
                </a>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </main>
    </>
  );
}