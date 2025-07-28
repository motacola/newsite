'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Experience, TimelineProps } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExperienceCardProps {
  experience: Experience;
  index: number;
  isExpanded: boolean;
  toggleExpand: () => void;
  layout: 'horizontal' | 'vertical';
}

const ExperienceCard = ({ 
  experience, 
  index, 
  isExpanded, 
  toggleExpand,
  layout
}: ExperienceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.2 });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.2,
      },
    },
  };

  // Format date range for display
  const formatDateRange = (start: string, end: string) => {
    return `${start} - ${end === 'Present' ? 'Present' : end}`;
  };

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 border-l-4 border-primary-500 transition-all duration-300",
        isExpanded ? "ring-2 ring-primary-500" : "",
        layout === 'horizontal' ? "min-w-[300px] max-w-[400px]" : "w-full"
      )}
    >
      {/* Company logo placeholder */}
      {experience.company && (
        <div className="absolute top-4 right-4 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
          {/* Replace with actual logo if available */}
          <span className="text-sm font-bold">{experience.company.substring(0, 2).toUpperCase()}</span>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{experience.title}</h3>
      <h4 className="text-lg font-medium text-primary-500 mb-2">{experience.company}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {formatDateRange(experience.duration.start, experience.duration.end)}
      </p>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[1000px]" : "max-h-[80px]"
      )}>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{experience.description}</p>
        
        {isExpanded && (
          <>
            {experience.achievements.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Key Achievements</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {experience.achievements.map((achievement, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {experience.skills.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {experience.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <button 
        onClick={toggleExpand}
        className="mt-4 text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
      >
        {isExpanded ? 'Show less' : 'Show more'}
        <svg 
          className={`ml-1 w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </motion.div>
  );
};

// Skill progression visualization component
const SkillProgressBar = ({ skill, level }: { skill: string; level: number }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(progressRef, { once: true });
  
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill}</span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{level}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          ref={progressRef}
          className="bg-primary-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: isInView ? `${level}%` : '0%',
          }}
        />
      </div>
    </div>
  );
};

export default function ExperienceTimeline({ 
  experiences, 
  layout = 'vertical', 
  interactive = true 
}: TimelineProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(timelineRef, { once: true, amount: 0.1 });
  
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Extract unique skills from all experiences for the skills visualization
  const allSkills = experiences.reduce((acc, exp) => {
    exp.skills.forEach(skill => {
      if (!acc.includes(skill)) {
        acc.push(skill);
      }
    });
    return acc;
  }, [] as string[]);

  // Generate mock skill levels (in a real app, these would come from the data)
  const skillLevels = allSkills.reduce((acc, skill) => {
    // Count how many experiences mention this skill to calculate a mock level
    const count = experiences.filter(exp => exp.skills.includes(skill)).length;
    const level = Math.min(100, count * 25 + 50); // Simple formula to generate a level between 50-100
    acc[skill] = level;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div 
      ref={timelineRef}
      className="w-full py-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
      >
        Professional Experience
      </motion.h2>
      
      <div className={cn(
        "relative",
        layout === 'horizontal' 
          ? "flex overflow-x-auto space-x-6 pb-8 px-4" 
          : "space-y-12 px-4 md:px-8"
      )}>
        {/* Timeline line */}
        {layout === 'vertical' && (
          <div className="absolute left-0 md:left-1/2 h-full w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2" />
        )}
        
        {/* Experience cards */}
        {experiences.map((experience, index) => (
          <div 
            key={experience.id} 
            className={cn(
              "relative",
              layout === 'vertical' ? "md:flex" : ""
            )}
          >
            {/* Timeline dot for vertical layout */}
            {layout === 'vertical' && (
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-gray-900" />
            )}
            
            {/* Card container with alternating sides for vertical layout */}
            <div className={cn(
              layout === 'vertical' 
                ? "md:w-1/2 md:pl-8 md:pr-4 md:ml-auto md:text-left" 
                : "",
              index % 2 === 1 && layout === 'vertical'
                ? "md:ml-0 md:mr-auto md:pl-4 md:pr-8 md:text-right"
                : ""
            )}>
              <ExperienceCard 
                experience={experience}
                index={index}
                isExpanded={expandedIds.includes(experience.id)}
                toggleExpand={() => toggleExpand(experience.id)}
                layout={layout}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Skills visualization section */}
      {interactive && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 max-w-3xl mx-auto px-4"
        >
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Skill Progression</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(skillLevels).map(([skill, level]) => (
              <SkillProgressBar key={skill} skill={skill} level={level} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}