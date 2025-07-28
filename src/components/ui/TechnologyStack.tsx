'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface TechnologyStackProps {
  technologies: string[];
  variant?: 'default' | 'compact' | 'detailed';
  showCategories?: boolean;
  interactive?: boolean;
}

// Technology categories and their associated colors/icons
const techCategories = {
  'AI/ML': {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '🤖',
    technologies: ['TensorFlow.js', 'PyTorch', 'Scikit-learn', 'Machine Learning', 'Computer Vision', 'Natural Language Processing', 'Predictive Modeling', 'TensorFlow', 'Deep Learning']
  },
  'Frontend': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '🎨',
    technologies: ['React', 'Next.js', 'Three.js', 'WebGL', 'AR.js', 'JavaScript', 'TypeScript', 'CSS', 'HTML']
  },
  'Backend': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '⚙️',
    technologies: ['Python', 'Node.js', 'REST APIs', 'API Integration', 'Express', 'FastAPI', 'GraphQL']
  },
  'Data/Analytics': {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    borderColor: 'border-orange-200 dark:border-orange-800',
    icon: '📊',
    technologies: ['Data Analytics', 'OpenCV', 'FFmpeg', 'Pandas', 'NumPy', 'Matplotlib', 'D3.js']
  },
  'Infrastructure': {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    borderColor: 'border-gray-200 dark:border-gray-600',
    icon: '☁️',
    technologies: ['Docker', 'Cloud Computing', 'WebRTC', 'AWS', 'Kubernetes', 'CI/CD', 'Nginx']
  },
  'Specialized': {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: '🔬',
    technologies: ['Color Science', 'Audio Processing', 'WebAssembly', 'CUDA', 'OpenGL']
  }
};

function getTechCategory(tech: string): { category: string; color: string; borderColor: string; icon: string } {
  for (const [category, config] of Object.entries(techCategories)) {
    if (config.technologies.includes(tech)) {
      return { 
        category, 
        color: config.color, 
        borderColor: config.borderColor,
        icon: config.icon
      };
    }
  }
  return { 
    category: 'Other', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    borderColor: 'border-gray-200 dark:border-gray-600',
    icon: '🔧'
  };
}

export function TechnologyStack({ 
  technologies, 
  variant = 'default',
  showCategories = false,
  interactive: _interactive = false
}: TechnologyStackProps) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 25
      }
    },
    hovered: {
      scale: 1.05,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 20
      }
    },
    default: {
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 20
      }
    }
  };



  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {technologies.slice(0, 6).map((tech, index) => {
          const { color, borderColor, icon } = getTechCategory(tech);
          return (
            <motion.span
              key={index}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border ${color} ${borderColor} flex items-center gap-1 cursor-default`}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              title={`Technology: ${tech}`}
            >
              <span className="text-xs">{icon}</span>
              {tech}
            </motion.span>
          );
        })}
        {technologies.length > 6 && (
          <motion.span 
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 cursor-default"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            +{technologies.length - 6} more
          </motion.span>
        )}
      </div>
    );
  }

  // Group technologies by category if showCategories is true
  const groupedTechnologies = showCategories 
    ? technologies.reduce((acc, tech) => {
        const { category } = getTechCategory(tech);
        if (!acc[category]) acc[category] = [];
        acc[category].push(tech);
        return acc;
      }, {} as Record<string, string[]>)
    : { 'Technologies': technologies };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        Technology Stack
      </h4>
      
      {Object.entries(groupedTechnologies).map(([category, techs]) => {
        const categoryConfig = Object.entries(techCategories).find(([_, config]) => 
          config.technologies.some(t => techs.includes(t))
        )?.[1];
        
        return (
          <div key={category} className="space-y-3">
            {showCategories && Object.keys(groupedTechnologies).length > 1 && (
              <motion.h5 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {categoryConfig?.icon && <span className="text-base">{categoryConfig.icon}</span>}
                {category}
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {techs.length}
                </span>
              </motion.h5>
            )}
            
            <motion.div
              className="flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {techs.map((tech, index) => {
                const { color, borderColor, icon } = getTechCategory(tech);
                return (
                  <motion.span
                    key={`${category}-${index}`}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-full cursor-pointer border
                      transition-all duration-300 ${color} ${borderColor}
                      hover:shadow-lg hover:shadow-current/20 hover:-translate-y-0.5
                      flex items-center gap-1.5
                    `}
                    variants={itemVariants}
                    whileHover="hovered"
                    animate={hoveredTech === tech ? 'hovered' : 'default'}
                    onHoverStart={() => setHoveredTech(tech)}
                    onHoverEnd={() => setHoveredTech(null)}
                    title={`Technology: ${tech} (${category})`}
                  >
                    <span className="text-xs">{icon}</span>
                    {tech}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
        );
      })}
      
      {variant === 'detailed' && (
        <motion.div 
          className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {technologies.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Technologies
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.keys(groupedTechnologies).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Categories
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.values(groupedTechnologies).reduce((max, techs) => Math.max(max, techs.length), 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Largest Category
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(technologies.length / Object.keys(groupedTechnologies).length)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Avg per Category
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}