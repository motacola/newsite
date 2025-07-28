'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import ExperienceTimeline from './ExperienceTimeline';
import experiences from '@/content/experience-data';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import Loading from './Loading';
import { generateCVData } from '@/lib/experienceUtils';
import { CVData } from '@/lib/types';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export interface CVViewerProps {
  initialViewMode?: 'pdf' | 'interactive';
  pdfUrl?: string;
  experiences?: typeof experiences;
}

export default function CVViewer({
  initialViewMode = 'interactive',
  pdfUrl = '/Christopher_Belgrave_CV.pdf',
  experiences: experiencesProp = experiences
}: CVViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'pdf' | 'interactive'>(initialViewMode);
  const [pdfLoaded, setPdfLoaded] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate CV data from experiences
    const result = generateCVData(experiencesProp, pdfUrl);
    if (result.success && result.cvData) {
      setCvData(result.cvData);
    } else {
      setCvData(null);
    }
    
    // Check if we're on mobile
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      // Adjust scale based on screen size
      setScale(isMobileView ? 0.6 : 1.0);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [experiencesProp, pdfUrl]);

  // Reset page number when switching view modes
  useEffect(() => {
    if (viewMode === 'pdf') {
      setPageNumber(1);
    }
  }, [viewMode]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfLoaded(true);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function toggleZoom() {
    setIsZoomed(!isZoomed);
  }

  function adjustScale(amount: number) {
    setScale(prevScale => {
      const newScale = prevScale + amount;
      return Math.max(0.5, Math.min(2.0, newScale));
    });
  }

  function downloadPDF() {
    setIsDownloading(true);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = pdfUrl;
    
    // Extract filename from URL path
    const filename = pdfUrl.split('/').pop() || 'Christopher_Belgrave_CV.pdf';
    link.download = filename;
    link.setAttribute('download', filename);
    
    // For browsers that require the element to be in the DOM
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Show download success feedback
    setTimeout(() => {
      setIsDownloading(false);
    }, 1000);
  }
  
  // Handle keyboard navigation for PDF viewer
  useEffect(() => {
    if (viewMode !== 'pdf') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (pageNumber < (numPages || 1)) nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (pageNumber > 1) previousPage();
      } else if (e.key === '+') {
        adjustScale(0.1);
      } else if (e.key === '-') {
        adjustScale(-0.1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, pageNumber, numPages]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* View mode toggle */}
      <div className="flex justify-center mb-8">
        <div 
          className="inline-flex rounded-md shadow-md" 
          role="group"
          aria-label="CV view mode selection"
        >
          <button
            type="button"
            onClick={() => setViewMode('interactive')}
            className={cn(
              "px-4 py-3 text-sm font-medium rounded-l-lg transition-all duration-300",
              viewMode === 'interactive'
                ? "bg-primary-500 text-white shadow-inner"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
            aria-pressed={viewMode === 'interactive'}
            aria-label="Show interactive timeline view"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Interactive Timeline
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pdf')}
            className={cn(
              "px-4 py-3 text-sm font-medium rounded-r-lg transition-all duration-300",
              viewMode === 'pdf'
                ? "bg-primary-500 text-white shadow-inner"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
            aria-pressed={viewMode === 'pdf'}
            aria-label="Show traditional CV PDF view"
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Traditional CV
            </span>
          </button>
        </div>
      </div>
      
      {/* Last updated info */}
      {cvData && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>Last updated: {cvData.lastUpdated}</p>
        </div>
      )}

      {/* Content container with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        {/* Interactive timeline view */}
        {viewMode === 'interactive' && (
          <motion.div
            key="interactive-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ExperienceTimeline 
              experiences={experiencesProp} 
              layout="vertical" 
              interactive={true} 
            />
            
            {/* Education and certifications section */}
            {cvData && (
              <div className="mt-16 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Education</h3>
                  <div className="space-y-6">
                    {cvData.sections.education.map((edu) => (
                      <div key={edu.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{edu.degree} in {edu.field}</h4>
                        <h5 className="text-lg font-medium text-primary-500 mb-2">{edu.institution}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {edu.duration.start} - {edu.duration.end}
                        </p>
                        {edu.description && (
                          <p className="text-gray-700 dark:text-gray-300">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-12"
                >
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Certifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cvData.sections.certifications.map((cert) => (
                      <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{cert.name}</h4>
                        <h5 className="text-md font-medium text-primary-500 mb-2">{cert.issuer}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Issued: {cert.date}
                        </p>
                        {cert.url && (
                          <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
                          >
                            View Certificate
                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Button 
                onClick={() => setViewMode('pdf')}
                variant="outline"
                className="mr-4"
                aria-label="Switch to traditional CV view"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View Traditional CV
                </span>
              </Button>
              <Button 
                onClick={downloadPDF}
                variant="primary"
                loading={isDownloading}
                aria-label="Download CV as PDF"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CV (PDF)
                </span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* PDF view */}
        {viewMode === 'pdf' && (
          <motion.div
            key="pdf-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div 
              ref={pdfContainerRef}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 w-full max-w-3xl transition-all duration-300",
                isZoomed ? "fixed inset-0 z-50 max-w-none rounded-none overflow-auto" : ""
              )}
            >
              {!pdfLoaded && (
                <div className="flex justify-center items-center h-[600px]">
                  <Loading size="xl" />
                </div>
              )}
              
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="flex justify-center items-center h-[600px]"><Loading size="xl" /></div>}
                error={
                  <div className="text-center py-10">
                    <p className="text-red-500 mb-4">Failed to load PDF.</p>
                    <Button 
                      onClick={() => window.open(pdfUrl, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      Open in new tab
                    </Button>
                  </div>
                }
                className="flex justify-center"
                inputRef={(ref) => {
                  if (ref) {
                    // Add accessibility attributes to the PDF container
                    ref.setAttribute('role', 'document');
                    ref.setAttribute('aria-label', 'Christopher Belgrave CV');
                  }
                }}
                externalLinkTarget="_blank"
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                  cMapPacked: true,
                  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/'
                }}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                  inputRef={(ref) => {
                    if (ref) {
                      // Add accessibility attributes
                      ref.setAttribute('role', 'region');
                      ref.setAttribute('aria-label', `CV Page ${pageNumber} of ${numPages || '?'}`);
                    }
                  }}
                  canvasBackground="transparent"
                />
              </Document>
              
              {pdfLoaded && (
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <div className="flex items-center">
                    <Button
                      disabled={pageNumber <= 1}
                      onClick={previousPage}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      aria-label="Previous page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button
                      disabled={pageNumber >= (numPages || 1)}
                      onClick={nextPage}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      aria-label="Next page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex items-center">
                    <Button
                      onClick={() => adjustScale(-0.1)}
                      variant="outline"
                      size="sm"
                      className="mr-1"
                      aria-label="Zoom out"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </Button>
                    <span className="text-gray-700 dark:text-gray-300 text-sm mx-2">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      onClick={() => adjustScale(0.1)}
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      aria-label="Zoom in"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                    <Button
                      onClick={toggleZoom}
                      variant="outline"
                      size="sm"
                      aria-label={isZoomed ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isZoomed ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <Button 
                onClick={() => setViewMode('interactive')}
                variant="outline"
                aria-label="Switch to interactive timeline view"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View Interactive Timeline
                </span>
              </Button>
              <Button 
                onClick={downloadPDF}
                variant="primary"
                loading={isDownloading}
                aria-label="Download CV as PDF"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CV (PDF)
                </span>
              </Button>
            </div>
            
            {/* Accessibility and mobile help */}
            <div className="mt-6 space-y-2">
              {isMobile && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Pinch to zoom in/out on mobile devices
                  </p>
                </div>
              )}
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Having trouble viewing the PDF? <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline" aria-label="Open CV in a new tab">Open in a new tab</a></p>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  <span className="sr-only">Keyboard shortcuts: </span>
                  <span className="inline-flex items-center mx-1" aria-hidden="true">
                    <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">←</kbd>
                    <span className="mx-1">Previous page</span>
                  </span>
                  <span className="inline-flex items-center mx-1" aria-hidden="true">
                    <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">→</kbd>
                    <span className="mx-1">Next page</span>
                  </span>
                  <span className="inline-flex items-center mx-1" aria-hidden="true">
                    <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">+</kbd>
                    <span className="mx-1">Zoom in</span>
                  </span>
                  <span className="inline-flex items-center mx-1" aria-hidden="true">
                    <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">-</kbd>
                    <span className="mx-1">Zoom out</span>
                  </span>
                </p>
              </div>
              
              {/* Accessibility information */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                <p>
                  This PDF viewer is screen reader compatible. Use keyboard navigation for accessibility.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}