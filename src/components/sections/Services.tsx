'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const services = [
  {
    id: 'ai-experiences',
    title: 'AI-Powered Experiences',
    description: 'Cutting-edge artificial intelligence solutions that create immersive, personalized digital experiences.',
    icon: '🤖',
    features: [
      'Computer Vision & AR Integration',
      'Natural Language Processing',
      'Predictive Analytics',
      'Real-time Personalization'
    ],
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'interactive-media',
    title: 'Interactive Media Design',
    description: 'Engaging interactive content that captivates audiences and drives meaningful connections.',
    icon: '🎨',
    features: [
      'Interactive Installations',
      'Gamified Experiences',
      'Motion Graphics',
      'WebGL & 3D Experiences'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'digital-campaigns',
    title: 'Digital Campaign Strategy',
    description: 'Strategic digital campaigns that blend creativity with data-driven insights for maximum impact.',
    icon: '📱',
    features: [
      'Multi-platform Campaigns',
      'Performance Analytics',
      'Creative Strategy',
      'Brand Storytelling'
    ],
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'immersive-tech',
    title: 'Immersive Technology',
    description: 'Next-generation AR/VR solutions that transport users into extraordinary digital worlds.',
    icon: '🥽',
    features: [
      'Augmented Reality',
      'Virtual Reality',
      'Mixed Reality',
      'Spatial Computing'
    ],
    color: 'from-green-500 to-teal-500'
  }
];

export function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <section id="services" className="py-20 bg-white">
      <Container>
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 creative-text-gradient">
              Our Creative Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We specialize in creating extraordinary digital experiences that blend cutting-edge technology 
              with creative vision to deliver measurable results.
            </p>
          </div>
        </AnimatedSection>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-creative transition-all duration-300 hover:-translate-y-2">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:animate-creative-pulse`}>
                    {service.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-center text-sm text-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * featureIndex }}
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3 flex-shrink-0`} />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <AnimatedSection delay={0.8}>
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-orange-500 to-purple-500 rounded-2xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Start Your Next Project?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Let's collaborate to create something extraordinary that pushes creative boundaries and delivers exceptional results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  Start a Project
                </a>
                <a
                  href="/showreel"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-300"
                >
                  View Our Work
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}