'use client';

import dynamic from 'next/dynamic';
import experiences from '@/content/experience-data';

// Dynamically import CVViewer to avoid server-side rendering issues
const CVViewer = dynamic(() => import('@/components/ui/CVViewer'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Loading CV viewer...</p>
    </div>
  ),
});

export default function CVPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Curriculum Vitae
        </h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center mb-12">
          My professional experience and qualifications in digital marketing, AI project management, and creative technology.
        </p>
        
        <CVViewer 
          initialViewMode="interactive"
          pdfUrl="/Christopher_Belgrave_CV.pdf"
          experiences={experiences}
        />
      </div>
    </main>
  );
}