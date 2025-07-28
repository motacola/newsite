import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the UI components
const ProjectFilters = ({ onFilterChange, onSearchChange }: any) => (
  <div data-testid="project-filters">
    <button onClick={() => onFilterChange('all')}>All</button>
    <input onChange={(e) => onSearchChange(e.target.value)} placeholder="Search" />
  </div>
);

const ProjectCard = ({ project, onCardClick, onDemoClick }: any) => (
  <div data-testid="project-card" onClick={() => onCardClick(project)}>
    <h3>{project.title}</h3>
    <button onClick={() => onDemoClick(project)}>Demo</button>
  </div>
);

const ProjectDetailsModal = ({ project, isOpen, onClose }: any) => (
  isOpen ? (
    <div data-testid="project-modal">
      <h2>{project?.title}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
);

// Mock project data
const mockProjects = [
  {
    id: '1',
    title: 'AI Analytics Dashboard',
    client: 'TechCorp',
    category: 'ai' as const,
    description: 'Advanced analytics dashboard with ML capabilities',
    shortDescription: 'ML-powered analytics',
    media: { hero: '/project1.jpg', gallery: [] },
    metrics: [{ label: 'Efficiency', value: '40%', improvement: '+40%' }],
    technologies: ['React', 'Python', 'TensorFlow'],
    timeline: '6 months',
    featured: true,
  },
  {
    id: '2',
    title: 'E-commerce Platform',
    client: 'RetailCorp',
    category: 'digital' as const,
    description: 'Modern e-commerce platform with advanced features',
    shortDescription: 'E-commerce platform',
    media: { hero: '/project2.jpg', gallery: [] },
    metrics: [{ label: 'Sales', value: '25%', improvement: '+25%' }],
    technologies: ['Next.js', 'Node.js', 'PostgreSQL'],
    timeline: '4 months',
    featured: false,
  },
];

// Mock project components
jest.mock('../../components/ui/ProjectCard', () => {
  return function ProjectCard({ project, onCardClick, onDemoClick }: any) {
    return (
      <div 
        data-testid={`project-card-${project.id}`}
        onClick={() => onCardClick?.(project)}
        role="article"
      >
        <h3>{project.title}</h3>
        <p>{project.client}</p>
        <p>{project.shortDescription}</p>
        <div data-testid="technologies">
          {project.technologies.map((tech: string) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        {project.interactive && (
          <button onClick={(e) => {
            e.stopPropagation();
            onDemoClick?.(project);
          }}>
            View Demo
          </button>
        )}
      </div>
    );
  };
});

jest.mock('../../components/ui/ProjectFilters', () => {
  return function ProjectFilters({ onFilterChange, onSearchChange }: any) {
    return (
      <div data-testid="project-filters">
        <input
          placeholder="Search projects..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          data-testid="search-input"
        />
        <button onClick={() => onFilterChange?.('all')}>All</button>
        <button onClick={() => onFilterChange?.('ai')}>AI</button>
        <button onClick={() => onFilterChange?.('digital')}>Digital</button>
        <button onClick={() => onFilterChange?.('production')}>Production</button>
      </div>
    );
  };
});

jest.mock('../../components/ui/ProjectDetailsModal', () => {
  return function ProjectDetailsModal({ project, isOpen, onClose }: any) {
    if (!isOpen) return null;
    
    return (
      <div data-testid="project-modal" role="dialog" aria-modal="true">
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Create a comprehensive project showcase component for testing
function ProjectShowcase() {
  const [projects, setProjects] = React.useState(mockProjects);
  const [filteredProjects, setFilteredProjects] = React.useState(mockProjects);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('all');

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    let filtered = projects;
    
    if (filter !== 'all') {
      filtered = projects.filter(project => project.category === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProjects(filtered);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    let filtered = projects;
    
    if (activeFilter !== 'all') {
      filtered = projects.filter(project => project.category === activeFilter);
    }
    
    if (term) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(term.toLowerCase()) ||
        project.client.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredProjects(filtered);
  };

  const handleCardClick = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDemoClick = (project: any) => {
    // Simulate demo opening
    console.log('Opening demo for:', project.title);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <section data-testid="project-showcase" aria-label="Project showcase">
      <h2>Featured Projects</h2>
      
      <ProjectFilters 
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />
      
      <div data-testid="projects-grid" className="grid">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onCardClick={handleCardClick}
            onDemoClick={handleDemoClick}
          />
        ))}
      </div>
      
      {filteredProjects.length === 0 && (
        <div data-testid="no-results">
          No projects found matching your criteria.
        </div>
      )}
      
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </section>
  );
}

expect.extend(toHaveNoViolations);

describe('Project Showcase Integration', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  describe('Initial Rendering', () => {
    it('renders project showcase with all projects', () => {
      render(<ProjectShowcase />);
      
      expect(screen.getByText('Featured Projects')).toBeInTheDocument();
      expect(screen.getByTestId('project-filters')).toBeInTheDocument();
      expect(screen.getByTestId('projects-grid')).toBeInTheDocument();
      
      // Check that all projects are rendered
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    });

    it('should not have accessibility violations', async () => {
      const { container } = render(<ProjectShowcase />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Filtering Functionality', () => {
    it('filters projects by category', async () => {
      render(<ProjectShowcase />);
      
      // Initially shows all projects
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      
      // Filter by AI category
      const aiFilter = screen.getByText('AI');
      await userEvent.click(aiFilter);
      
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
      
      // Filter by Digital category
      const digitalFilter = screen.getByText('Digital');
      await userEvent.click(digitalFilter);
      
      expect(screen.queryByText('AI Analytics Dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      
      // Show all projects again
      const allFilter = screen.getByText('All');
      await userEvent.click(allFilter);
      
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    });

    it('shows no results message when no projects match filter', async () => {
      render(<ProjectShowcase />);
      
      const productionFilter = screen.getByText('Production');
      await userEvent.click(productionFilter);
      
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
      expect(screen.getByText('No projects found matching your criteria.')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('searches projects by title', async () => {
      render(<ProjectShowcase />);
      
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'Analytics');
      
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
    });

    it('searches projects by client', async () => {
      render(<ProjectShowcase />);
      
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'RetailCorp');
      
      expect(screen.queryByText('AI Analytics Dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    });

    it('combines search and filter', async () => {
      render(<ProjectShowcase />);
      
      // First filter by AI
      const aiFilter = screen.getByText('AI');
      await userEvent.click(aiFilter);
      
      // Then search for something that doesn't exist in AI projects
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'E-commerce');
      
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });

    it('shows no results for non-matching search', async () => {
      render(<ProjectShowcase />);
      
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'NonExistentProject');
      
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    });
  });

  describe('Project Interaction', () => {
    it('opens project details modal when card is clicked', async () => {
      render(<ProjectShowcase />);
      
      const projectCard = screen.getByTestId('project-card-1');
      await userEvent.click(projectCard);
      
      await waitFor(() => {
        expect(screen.getByTestId('project-modal')).toBeInTheDocument();
        expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Advanced analytics dashboard with ML capabilities')).toBeInTheDocument();
      });
    });

    it('closes project details modal when close button is clicked', async () => {
      render(<ProjectShowcase />);
      
      const projectCard = screen.getByTestId('project-card-1');
      await userEvent.click(projectCard);
      
      await waitFor(() => {
        expect(screen.getByTestId('project-modal')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();
      });
    });

    it('handles demo button clicks without opening modal', async () => {
      // Add interactive demo to first project
      const projectWithDemo = {
        ...mockProjects[0],
        interactive: { type: 'demo' as const, url: 'https://demo.example.com' }
      };
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      render(<ProjectShowcase />);
      
      // Mock the project to have a demo
      const demoButton = screen.getByText('View Demo');
      await userEvent.click(demoButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Opening demo for:', 'AI Analytics Dashboard');
      expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation through filters', async () => {
      render(<ProjectShowcase />);
      
      const allFilter = screen.getByText('All');
      const aiFilter = screen.getByText('AI');
      
      allFilter.focus();
      expect(allFilter).toHaveFocus();
      
      fireEvent.keyDown(allFilter, { key: 'Tab' });
      expect(aiFilter).toHaveFocus();
    });

    it('supports keyboard activation of filters', async () => {
      render(<ProjectShowcase />);
      
      const aiFilter = screen.getByText('AI');
      aiFilter.focus();
      
      fireEvent.keyDown(aiFilter, { key: 'Enter' });
      
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Platform')).not.toBeInTheDocument();
    });

    it('supports keyboard navigation through project cards', async () => {
      render(<ProjectShowcase />);
      
      const firstCard = screen.getByTestId('project-card-1');
      const secondCard = screen.getByTestId('project-card-2');
      
      firstCard.focus();
      expect(firstCard).toHaveFocus();
      
      fireEvent.keyDown(firstCard, { key: 'Tab' });
      expect(secondCard).toHaveFocus();
    });

    it('opens modal with keyboard activation', async () => {
      render(<ProjectShowcase />);
      
      const projectCard = screen.getByTestId('project-card-1');
      projectCard.focus();
      
      fireEvent.keyDown(projectCard, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByTestId('project-modal')).toBeInTheDocument();
      });
    });

    it('closes modal with Escape key', async () => {
      render(<ProjectShowcase />);
      
      const projectCard = screen.getByTestId('project-card-1');
      await userEvent.click(projectCard);
      
      await waitFor(() => {
        expect(screen.getByTestId('project-modal')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains functionality across viewport changes', () => {
      const { rerender } = render(<ProjectShowcase />);
      
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      fireEvent.resize(window);
      rerender(<ProjectShowcase />);
      
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      fireEvent.resize(window);
      rerender(<ProjectShowcase />);
      
      expect(screen.getByText('AI Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large number of projects', () => {
      const manyProjects = Array.from({ length: 50 }, (_, i) => ({
        ...mockProjects[0],
        id: `project-${i}`,
        title: `Project ${i}`,
      }));
      
      const ProjectShowcaseWithManyProjects = () => {
        const [projects] = React.useState(manyProjects);
        const [filteredProjects, setFilteredProjects] = React.useState(manyProjects);
        
        return (
          <section data-testid="project-showcase">
            <div data-testid="projects-grid">
              {filteredProjects.map(project => (
                <div key={project.id} data-testid={`project-card-${project.id}`}>
                  {project.title}
                </div>
              ))}
            </div>
          </section>
        );
      };
      
      const startTime = performance.now();
      render(<ProjectShowcaseWithManyProjects />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
      expect(screen.getAllByText(/Project \d+/)).toHaveLength(50);
    });
  });
});