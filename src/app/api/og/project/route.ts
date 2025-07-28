import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || 'AI Project';
    const client = searchParams.get('client') || 'Christopher Belgrave';
    const category = searchParams.get('category') || 'ai';
    const technologies = searchParams.get('technologies') || '';
    const type = searchParams.get('type') || 'og'; // 'og' or 'twitter'
    
    // Determine dimensions based on type
    const width = type === 'twitter' ? 1200 : 1200;
    const height = type === 'twitter' ? 600 : 630;
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #06b6d4 0%, transparent 50%)
              `,
              opacity: 0.1,
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {/* Category Badge */}
            <div
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {category.toUpperCase()} PROJECT
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: '800',
                color: 'white',
                margin: '0 0 16px 0',
                lineHeight: '1.1',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>
            
            {/* Client */}
            <p
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                margin: '0 0 32px 0',
                fontWeight: '500',
              }}
            >
              for {client}
            </p>
            
            {/* Technologies */}
            {technologies && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                  marginBottom: '32px',
                }}
              >
                {technologies.split(', ').map((tech, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      padding: '6px 16px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            
            {/* Author */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '32px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                CB
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: 'white',
                  }}
                >
                  Christopher Belgrave
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#94a3b8',
                  }}
                >
                  AI Project Manager & Digital Specialist
                </span>
              </div>
            </div>
          </div>
          
          {/* Bottom Gradient */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)',
            }}
          />
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}