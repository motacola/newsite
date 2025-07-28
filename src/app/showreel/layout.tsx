import { Metadata } from 'next';
import { generateShowreelMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbStructuredData } from '@/lib/seo/structured-data';

export const metadata: Metadata = generateShowreelMetadata();

export default function ShowreelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: '/' },
    { name: 'Showreel', url: '/showreel' }
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      {children}
    </>
  );
}