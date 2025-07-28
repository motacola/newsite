import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ProjectCard } from '../ProjectCard';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
  },
}));

// Mock OptimizedImage
jest.mock('../OptimizedImage', () => {
  return function OptimizedImage({ src, alt, className }: any) {
    return <img src={src} alt={alt} className={className} />;
  };
});

const mockProject = {
  id: '1',
  title: 'AI-Powered Analytics Dashboard',
  client: 'TechCorp Inc.',
  category: 'ai' as const,
  description: 'A comprehensive analytics dashboard powered by machine learning algorithms.',
  shortDescription: 'ML-powered analytics dashboard',
  media: {
    hero: '/project-hero.jpg',
    gallery: ['/gallery1.jpg', '/gallery2.jpg'],
    video: '/project-demo.mp4',
  },
  metrics: [
    { label: 'Performance Improvement', value: '40%', improvement: '+40%' },
    { label: 'Processing Speed', value: '2.5x', improvement: '+150%' },
  ],
  technologies: ['React', 'Python', 'TensorFlow', 'AWS'],
  timeline: '6 months',
  featured: true,
  interactive: {
    type: 'demo' as const,
    url: 'https://demo.example.com',
  },
};

describe('ProjectCard', () => {
  describe('Rendering', () => {
    it('renders project information correctly', () => {
      render(<ProjectCard project={mockProject} />);
      
      expect(screen.getByText(mockProject.title)).toBeInTheDocument();
      expect(screen.getByText(mockProject.client)).toBeInTheDocument();
      expect(screen.getByText(mockProject.shortDescription)).toBeInTheDocument();
      expect(screen.getByText(mockProject.timeline)).toBeInTheDocument();
    });

    it('renders project image with correct alt text', () => {
      render(<ProjectCard project={mockProject} />);
      
      const image = screen.getByAltText(mockProject.title);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockProject.media.hero);
    });

    it('renders technology tags', () => {
      render(<ProjectCard project={mockProject} />);
      
      mockProject.technologies.forEach(tech => {
        expect(screen.getByText(tech)).toBeInTheDocument();
      });
    });

    it('renders metrics when provided', () => {
      render(<ProjectCard project={mockProject} />);
      
      mockProject.metrics.forEach(metric => {
        expect(screen.getByText(metric.label)).toBeInTheDocument();
        expect(screen.getByText(metric.value)).toBeInTheDocument();
      });
    });

    it('shows featured badge for featured projects', () => {
      render(<ProjectCard project={mockProject} />);
      
      expect(screen.getByText(/featured/i)).toBeInTheDocument();
    });

    it('does not show featured badge for non-featured projects', () => {
      const nonFeaturedProject = { ...mockProject, featured: false };
      render(<ProjectCard project={nonFeaturedProject} />);
      
      expect(screen.queryByText(/featured/i)).not.toBeInTheDocument();
    });

    it('renders interactive demo button when available', () => {
      render(<ProjectCard project={mockProject} />);
      
      expect(screen.getByText(/view demo/i)).toBeInTheDocument();
    });

    it('does not render demo button when not available', () => {
      const projectWithoutDemo = { ...mockProject, interactive: undefined };
      render(<ProjectCard project={projectWithoutDemo} />);
      
      expect(screen.queryByText(/view demo/i)).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles card click events', async () => {
      const onCardClick = jest.fn();
      render(<ProjectCard project={mockProject} onCardClick={onCardClick} />);
      
      const card = screen.getByRole('article');
      await userEvent.click(card);
      
      expect(onCardClick).toHaveBeenCalledWith(mockProject);
    });

    it('handles demo button click', async () => {
      const onDemoClick = jest.fn();
      render(<ProjectCard project={mockProject} onDemoClick={onDemoClick} />);
      
      const demoButton = screen.getByText(/view demo/i);
      await userEvent.click(demoButton);
      
      expect(onDemoClick).toHaveBeenCalledWith(mockProject);
    });

    it('prevents card click when demo button is clicked', async () => {
      const onCardClick = jest.fn();
      const onDemoClick = jest.fn();
      render(
        <ProjectCard 
          project={mockProject} 
          onCardClick={onCardClick}
          onDemoClick={onDemoClick}
        />
      );
      
      const demoButton = screen.getByText(/view demo/i);
      await userEvent.click(demoButton);
      
      expect(onDemoClick).toHaveBeenCalledWith(mockProject);
      expect(onCardClick).not.toHaveBeenCalled();
    });

    it('handles keyboard navigation', async () => {
      const onCardClick = jest.fn();
      render(<ProjectCard project={mockProject} onCardClick={onCardClick} />);
      
      const card = screen.getByRole('article');
      card.focus();
      
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onCardClick).toHaveBeenCalledWith(mockProject);
      
      fireEvent.keyDown(card, { key: ' ' });
      expect(onCardClick).toHaveBeenCalledTimes(2);
    });

    it('shows hover effects on mouse enter/leave', async () => {
      render(<ProjectCard project={mockProject} />);
      
      const card = screen.getByRole('article');
      
      fireEvent.mouseEnter(card);
      // Hover effects would be tested through visual regression or CSS class changes
      
      fireEvent.mouseLeave(card);
      // Return to normal state
    });
  });

  describe('Layout Variants', () => {
    it('renders in horizontal layout', () => {
      render(<ProjectCard project={mockProject} layout="horizontal" />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('flex-row');
    });

    it('renders in vertical layout (default)', () => {
      render(<ProjectCard project={mockProject} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('flex-col');
    });

    it('renders in compact layout', () => {
      render(<ProjectCard project={mockProject} layout="compact" />);
      
      // Compact layout should have reduced spacing and smaller elements
      expect(screen.getByText(mockProject.title)).toBeInTheDocument();
      expect(screen.queryByText(mockProject.description)).not.toBeInTheDocument();
    });
  });

  describe('Category Styling', () => {
    it('applies AI category styling', () => {
      render(<ProjectCard project={mockProject} />);
      
      const categoryBadge = screen.getByText('AI');
      expect(categoryBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('applies digital category styling', () => {
      const digitalProject = { ...mockProject, category: 'digital' as const };
      render(<ProjectCard project={digitalProject} />);
      
      const categoryBadge = screen.getByText('Digital');
      expect(categoryBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('applies production category styling', () => {
      const productionProject = { ...mockProject, category: 'production' as const };
      render(<ProjectCard project={productionProject} />);
      
      const categoryBadge = screen.getByText('Production');
      expect(categoryBadge).toHaveClass('bg-purple-100', 'text-purple-800');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ProjectCard project={mockProject} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper semantic structure', () => {
      render(<ProjectCard project={mockProject} />);
      
      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view demo/i })).toBeInTheDocument();
    });

    it('has proper focus management', () => {
      render(<ProjectCard project={mockProject} />);
      
      const card = screen.getByRole('article');
      card.focus();
      
      expect(card).toHaveFocus();
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('has descriptive aria-labels', () => {
      render(<ProjectCard project={mockProject} />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockProject.title));
    });

    it('has proper heading hierarchy', () => {
      render(<ProjectCard project={mockProject} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent(mockProject.title);
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when loading prop is true', () => {
      render(<ProjectCard project={mockProject} loading={true} />);
      
      expect(screen.getByTestId('project-card-skeleton')).toBeInTheDocument();
      expect(screen.queryByText(mockProject.title)).not.toBeInTheDocument();
    });

    it('handles image loading states', () => {
      render(<ProjectCard project={mockProject} />);
      
      const image = screen.getByAltText(mockProject.title);
      
      // Simulate image load error
      fireEvent.error(image);
      
      // Should show fallback or placeholder
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<ProjectCard project={mockProject} className="custom-card" />);
      
      const card = screen.getByRole('article');
      expect(card).toHaveClass('custom-card');
    });

    it('forwards additional props', () => {
      render(<ProjectCard project={mockProject} data-testid="custom-project-card" />);
      
      expect(screen.getByTestId('custom-project-card')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing project data gracefully', () => {
      const incompleteProject = {
        id: '1',
        title: 'Test Project',
        category: 'ai' as const,
        description: 'Test description',
        shortDescription: 'Test',
        media: { hero: '/test.jpg', gallery: [] },
        metrics: [],
        technologies: [],
        timeline: '1 month',
        featured: false,
      };
      
      render(<ProjectCard project={incompleteProject} />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByText(/view demo/i)).not.toBeInTheDocument();
    });

    it('handles empty metrics array', () => {
      const projectWithoutMetrics = { ...mockProject, metrics: [] };
      render(<ProjectCard project={projectWithoutMetrics} />);
      
      expect(screen.getByText(mockProject.title)).toBeInTheDocument();
      // Should not crash and should render without metrics section
    });

    it('handles empty technologies array', () => {
      const projectWithoutTech = { ...mockProject, technologies: [] };
      render(<ProjectCard project={projectWithoutTech} />);
      
      expect(screen.getByText(mockProject.title)).toBeInTheDocument();
      // Should not crash and should render without technology tags
    });
  });
});