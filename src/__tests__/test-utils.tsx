import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider';

// Mock PerformanceProvider since it's not critical for most tests
const MockPerformanceProvider = ({ children }: { children: React.ReactNode }) => {
  const mockContext = {
    networkStatus: 'online' as const,
    performanceMonitor: null,
    isServiceWorkerSupported: false,
    isServiceWorkerRegistered: false,
  };
  
  return (
    <div data-testid="performance-provider">
      {children}
    </div>
  );
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccessibilityProvider>
      <MockPerformanceProvider>
        {children}
      </MockPerformanceProvider>
    </AccessibilityProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };