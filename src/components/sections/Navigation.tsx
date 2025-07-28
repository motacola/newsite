'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { useScrollSpy, useSmoothScroll } from '@/lib/hooks/useScrollSpy';

interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '/experience' },
  { label: 'CV', href: '/cv' },
  { label: 'Showreel', href: '#showreel' },
  { label: 'Contact', href: '/contact' },
];

const sectionIds = navigationItems.map(item => item.href.replace('#', ''));

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use custom hooks
  const activeSection = useScrollSpy({ sectionIds, offset: 100 });
  const { scrollToSection } = useSmoothScroll();

  // Handle scroll behavior for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation clicks
  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href.replace('#', ''));
    } else if (typeof window !== 'undefined') {
      window.location.href = href;
    }
    setIsOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById('mobile-nav');
      if (nav && !nav.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-soft border-b border-gray-200/50'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavClick('#home')}
              className="text-xl lg:text-2xl font-bold text-gray-900 hover:text-primary-500 transition-colors duration-300"
            >
              Christopher Belgrave
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative',
                    activeSection === item.href.replace('#', '')
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                  {activeSection === item.href.replace('#', '') && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden lg:block">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavClick('/contact')}
              className="shadow-soft hover:shadow-medium"
            >
              Get In Touch
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'p-2 rounded-lg transition-all duration-300',
                isOpen
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
              )}
              aria-label="Toggle navigation menu"
            >
              <div className="w-6 h-6 relative">
                <span
                  className={cn(
                    'absolute block h-0.5 w-6 bg-current transform transition-all duration-300',
                    isOpen ? 'rotate-45 top-3' : 'top-1'
                  )}
                />
                <span
                  className={cn(
                    'absolute block h-0.5 w-6 bg-current transform transition-all duration-300 top-3',
                    isOpen ? 'opacity-0' : 'opacity-100'
                  )}
                />
                <span
                  className={cn(
                    'absolute block h-0.5 w-6 bg-current transform transition-all duration-300',
                    isOpen ? '-rotate-45 top-3' : 'top-5'
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-nav"
          className={cn(
            'lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-medium transition-all duration-300 transform',
            isOpen
              ? 'opacity-100 translate-y-0 visible'
              : 'opacity-0 -translate-y-4 invisible'
          )}
        >
          <div className="px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  'block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300',
                  activeSection === item.href.replace('#', '')
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-500 hover:bg-gray-50'
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleNavClick('/contact')}
                className="w-full"
              >
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};