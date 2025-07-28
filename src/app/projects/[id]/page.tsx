import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAIProjectById } from '@/content/ai-projects';
import { generateProjectMetadata } from '@/lib/seo/metadata';
import { 
  generateProjectStructuredData, 
  generateAICapabilityStructuredData,
  generateBreadcrumbStructuredData 
} from '@/lib/seo/structured-data';
import { Container } from '@/components/ui/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { MetricsDisplay } from '@/components/ui/MetricsDisplay';
import { TechnologyStack } from '@/components/ui/TechnologyStack';
import { InteractiveDemo } from '@/components/ui/InteractiveDemo';
import { SocialShare } from '@/components/ui/SocialShare';
import { generateShareableUrl } from '@/lib/seo/social-preview';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getAIProjectById(params.id);
  
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    };
  }

  return generateProjectMetadata(project);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getAIProjectById(params.id);

  if (!project) {
    notFound();
  }

  const projectStructuredData = generateProjectStructuredData(project);
  const aiCapabilityStructuredData = generateAICapabilityStructuredData(project);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Projects', url: '/projects' },
    { name: project.title, url: `/projects/${project.id}` }
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectStructuredData),
        }}
      />
      {aiCapabilityStructuredData && aiCapabilityStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      <main className="min-h-screen bg-gray-50 pt-20 pb-16">
        <Container>
          {/* Project Header */}
          <AnimatedSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                {project.description}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {project.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Social Sharing */}
              <div className="flex justify-center mb-8">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3 text-center">Share this project:</p>
                  <SocialShare
                    url={generateShareableUrl(`/projects/${project.id}`, 'direct', 'project_share')}
                    title={`${project.title} - AI Project by Christopher Belgrave`}
                    description={project.shortDescription || project.description}
                    hashtags={['AI', 'ProjectManagement', ...project.tags?.slice(0, 3) || []]}
                    showLabels={false}
                    size="md"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Project Details Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Project Card */}
            <AnimatedSection delay={0.2}>
              <ProjectCard project={project} showFullDetails={true} />
            </AnimatedSection>

            {/* Metrics */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Project Impact
                </h2>
                <MetricsDisplay metrics={project.metrics} />
              </div>
            </AnimatedSection>
          </div>

          {/* Technology Stack */}
          <AnimatedSection delay={0.6}>
            <div className="bg-white rounded-lg p-8 shadow-sm mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Technology Stack
              </h2>
              <TechnologyStack technologies={project.technologies} />
            </div>
          </AnimatedSection>

          {/* Interactive Demo */}
          {project.interactive && (
            <AnimatedSection delay={0.8}>
              <div className="bg-white rounded-lg p-8 shadow-sm mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Interactive Demo
                </h2>
                <InteractiveDemo interactive={project.interactive} />
              </div>
            </AnimatedSection>
          )}

          {/* AI Capabilities */}
          {project.aiCapabilities && project.aiCapabilities.length > 0 && (
            <AnimatedSection delay={1.0}>
              <div className="bg-white rounded-lg p-8 shadow-sm mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  AI Capabilities
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {project.aiCapabilities.map((capability, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                        {capability.type.replace('-', ' ')}
                      </h3>
                      <p className="text-gray-600 mb-4">{capability.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Accuracy:</span>
                          <span className="ml-2 text-green-600">{capability.accuracy}%</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Confidence:</span>
                          <span className="ml-2 text-blue-600">{capability.confidence}%</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700">Model:</span>
                          <span className="ml-2 text-gray-600">{capability.modelType}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-700">Processing Time:</span>
                          <span className="ml-2 text-gray-600">{capability.processingTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <AnimatedSection delay={1.2}>
              <div className="bg-gradient-to-r from-primary-50 to-accent-cyan/10 rounded-lg p-8 text-center">
                <blockquote className="text-xl text-gray-700 mb-6 italic">
                  "{project.testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  {project.testimonial.avatar && (
                    <img
                      src={project.testimonial.avatar}
                      alt={project.testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {project.testimonial.author}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {project.testimonial.role} at {project.testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          )}
        </Container>
        
        {/* Floating Social Share */}
        <SocialShare
          url={generateShareableUrl(`/projects/${project.id}`, 'floating', 'project_share')}
          title={`${project.title} - AI Project by Christopher Belgrave`}
          description={project.shortDescription || project.description}
          hashtags={['AI', 'ProjectManagement', ...project.tags?.slice(0, 3) || []]}
          variant="floating"
          size="md"
        />
      </main>
    </>
  );
}