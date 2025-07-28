import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../../components/ui/Button';
import { ProjectCard } from '../../components/ui/ProjectCard';
import { ContactForm } from '../../components/ui/ContactForm';

// Mock framer-motion for consistent snapshots
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock OptimizedImage for consistent snapshots
jest.mock('../../components/ui/OptimizedImage', () => {
  return function OptimizedImage({ src, alt, className }: any) {
    return <img src={src} alt={alt} className={className} />;
  };
});

const mockProject = {
  id: '1',
  title: 'AI Analytics Dashboard',
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
};

describe('Visual Regression Tests', () => {
  describe('Button Component', () => {
    it('renders primary button correctly', () => {
      const { container } = render(<Button variant="primary">Primary Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders secondary button correctly', () => {
      const { container } = render(<Button variant="secondary">Secondary Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders outline button correctly', () => {
      const { container } = render(<Button variant="outline">Outline Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders ghost button correctly', () => {
      const { container } = render(<Button variant="ghost">Ghost Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled button correctly', () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders loading button correctly', () => {
      const { container } = render(<Button loading>Loading Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders button with icon correctly', () => {
      const Icon = () => <span>🚀</span>;
      const { container } = render(<Button icon={<Icon />}>Button with Icon</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders small button correctly', () => {
      const { container } = render(<Button size="sm">Small Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders large button correctly', () => {
      const { container } = render(<Button size="lg">Large Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders full width button correctly', () => {
      const { container } = render(<Button fullWidth>Full Width Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('ProjectCard Component', () => {
    it('renders project card correctly', () => {
      const { container } = render(<ProjectCard project={mockProject} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders featured project card correctly', () => {
      const { container } = render(<ProjectCard project={mockProject} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders non-featured project card correctly', () => {
      const nonFeaturedProject = { ...mockProject, featured: false };
      const { container } = render(<ProjectCard project={nonFeaturedProject} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders horizontal layout project card correctly', () => {
      const { container } = render(<ProjectCard project={mockProject} layout="horizontal" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders compact layout project card correctly', () => {
      const { container } = render(<ProjectCard project={mockProject} layout="compact" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders project card with different categories correctly', () => {
      const digitalProject = { ...mockProject, category: 'digital' as const };
      const productionProject = { ...mockProject, category: 'production' as const };

      const { container: digitalContainer } = render(<ProjectCard project={digitalProject} />);
      const { container: productionContainer } = render(<ProjectCard project={productionProject} />);

      expect(digitalContainer.firstChild).toMatchSnapshot('digital-project-card');
      expect(productionContainer.firstChild).toMatchSnapshot('production-project-card');
    });

    it('renders loading project card correctly', () => {
      const { container } = render(<ProjectCard project={mockProject} loading={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('ContactForm Component', () => {
    it('renders contact form correctly', () => {
      const { container } = render(<ContactForm />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders contact form with custom className correctly', () => {
      const { container } = render(<ContactForm className="custom-form" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Responsive Layouts', () => {
    beforeEach(() => {
      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('renders components in mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container: buttonContainer } = render(<Button>Mobile Button</Button>);
      const { container: cardContainer } = render(<ProjectCard project={mockProject} />);

      expect(buttonContainer.firstChild).toMatchSnapshot('mobile-button');
      expect(cardContainer.firstChild).toMatchSnapshot('mobile-project-card');
    });

    it('renders components in tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container: buttonContainer } = render(<Button>Tablet Button</Button>);
      const { container: cardContainer } = render(<ProjectCard project={mockProject} />);

      expect(buttonContainer.firstChild).toMatchSnapshot('tablet-button');
      expect(cardContainer.firstChild).toMatchSnapshot('tablet-project-card');
    });

    it('renders components in desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { container: buttonContainer } = render(<Button>Desktop Button</Button>);
      const { container: cardContainer } = render(<ProjectCard project={mockProject} />);

      expect(buttonContainer.firstChild).toMatchSnapshot('desktop-button');
      expect(cardContainer.firstChild).toMatchSnapshot('desktop-project-card');
    });
  });

  describe('Theme Variations', () => {
    it('renders components with high contrast theme', () => {
      // Mock high contrast theme
      document.documentElement.classList.add('high-contrast');

      const { container: buttonContainer } = render(<Button>High Contrast Button</Button>);
      const { container: cardContainer } = render(<ProjectCard project={mockProject} />);

      expect(buttonContainer.firstChild).toMatchSnapshot('high-contrast-button');
      expect(cardContainer.firstChild).toMatchSnapshot('high-contrast-project-card');

      // Cleanup
      document.documentElement.classList.remove('high-contrast');
    });

    it('renders components with reduced motion preference', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container: buttonContainer } = render(<Button>Reduced Motion Button</Button>);
      const { container: cardContainer } = render(<ProjectCard project={mockProject} />);

      expect(buttonContainer.firstChild).toMatchSnapshot('reduced-motion-button');
      expect(cardContainer.firstChild).toMatchSnapshot('reduced-motion-project-card');
    });
  });

  describe('Error States', () => {
    it('renders components in error states correctly', () => {
      const incompleteProject = {
        id: '1',
        title: 'Incomplete Project',
        category: 'ai' as const,
        description: 'Test description',
        shortDescription: 'Test',
        media: { hero: '', gallery: [] },
        metrics: [],
        technologies: [],
        timeline: '',
        featured: false,
      };

      const { container } = render(<ProjectCard project={incompleteProject} />);
      expect(container.firstChild).toMatchSnapshot('incomplete-project-card');
    });
  });
});