'use client';

import Link from 'next/link';
import type { Tool } from '@/types';
import { TOOLS } from '@/types';

interface ToolPageHeaderProps {
  toolId: string;
}

const ACCENT: Record<string, string> = {
  fim: 'var(--color-accent-blue)',
  ctk: 'var(--color-accent-green)',
  orbitals: 'var(--color-accent-purple)',
  titration: 'var(--color-accent-pink)',
  miller: 'var(--color-accent-yellow)',
  vdw: 'var(--color-accent-orange)',
};

export default function ToolPageHeader({ toolId }: ToolPageHeaderProps) {
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    return null;
  }

  const accentColor = ACCENT[toolId] || 'var(--color-accent-blue)';

  return (
    <header
      className="animate-fade-up"
      style={{
        background: 'var(--color-bg-primary)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Animated gradient accent bar at the top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(to right, ${accentColor}, transparent)`,
          opacity: 0.8,
          animation: 'gradientFlow 3s ease-in-out infinite',
        }}
      />

      {/* Subtle animated particle/dot pattern background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 50%, ${accentColor} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${accentColor} 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, ${accentColor} 0%, transparent 50%)
          `,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />

      {/* Content container */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: '48px',
          paddingBottom: '48px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        {/* Back to Dashboard link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              'var(--color-text-muted)';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Main content flex container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '32px',
          }}
        >
          {/* Icon with glowing background circle */}
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Glow circle background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                opacity: 0.15,
                animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />

            {/* Accent ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${accentColor}`,
                opacity: 0.3,
              }}
            />

            {/* Icon */}
            <span
              style={{
                fontSize: '64px',
                lineHeight: 1,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {tool.icon}
            </span>
          </div>

          {/* Text content */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Tool name with gradient text */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '12px',
                background: `linear-gradient(135deg, ${accentColor}, #ffffff)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {tool.name}
            </h1>

            {/* Description in muted text */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                marginBottom: '20px',
                maxWidth: '600px',
              }}
            >
              {tool.description}
            </p>

            {/* Tags as glass-effect pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-block',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    color: 'var(--color-text-muted)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 200ms ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = `rgba(255, 255, 255, 0.08)`;
                    el.style.borderColor = `${accentColor}40`;
                    el.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    el.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    el.style.color = 'var(--color-text-muted)';
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes gradientFlow {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out;
        }
      `}</style>
    </header>
  );
}
