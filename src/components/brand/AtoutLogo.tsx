import React, { useId } from 'react';

interface AtoutLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  showWordmark?: boolean;
  className?: string;
}

const SIZES = {
  xs: { mark: 24, text: 'text-sm',   gap: 'gap-1.5' },
  sm: { mark: 28, text: 'text-base', gap: 'gap-2'   },
  md: { mark: 36, text: 'text-xl',   gap: 'gap-2.5' },
  lg: { mark: 48, text: 'text-2xl',  gap: 'gap-3'   },
  xl: { mark: 64, text: 'text-3xl',  gap: 'gap-4'   },
};

/**
 * Atout mark — custom 6-arm asterisk.
 *
 * Three lines crossing at 60° intervals, round-capped ends.
 * A small amber jewel at the center ties it together.
 *
 * Background: deep dark navy (≠ purple) — premium, neutral, distinctive.
 */
export const AtoutMark: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const gId = `atout-g-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Atout"
    >
      <defs>
        {/* Blur filter for soft color blobs */}
        <filter id={`${gId}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        {/* Clip to rounded rect */}
        <clipPath id={`${gId}-clip`}>
          <rect width="40" height="40" rx="10" />
        </clipPath>
      </defs>

      {/* Background: dark base + soft color blobs */}
      <g clipPath={`url(#${gId}-clip)`}>
        {/* Light base */}
        <rect width="40" height="40" fill="#F8F6FF" />
        {/* Color blobs — blurred, overlapping */}
        <g filter={`url(#${gId}-blur)`}>
          <circle cx="4"  cy="6"  r="18" fill="#C4B5FD" fillOpacity="0.9" />
          <circle cx="36" cy="6"  r="15" fill="#67E8F9" fillOpacity="0.85" />
          <circle cx="20" cy="24" r="16" fill="#FED7AA" fillOpacity="0.85" />
          <circle cx="38" cy="36" r="14" fill="#FCA5A5" fillOpacity="0.80" />
        </g>
      </g>

      {/* Subtle inner border */}
      <rect
        x="1" y="1" width="38" height="38" rx="9"
        stroke="white" strokeOpacity="0.09" strokeWidth="1.5" fill="none"
      />

      {/*
        6-arm asterisk — 3 lines crossing at 60° intervals, all through (20,20).
        stroke-linecap="round" → rounded tips (like Linktree).
        stroke-width="5"       → bold, legible at 16px favicon.
      */}
      <g stroke="white" strokeWidth="5" strokeLinecap="round">
        <line x1="20"  y1="8"  x2="20"  y2="32" />
        <line x1="9.6" y1="14" x2="30.4" y2="26" />
        <line x1="9.6" y1="26" x2="30.4" y2="14" />
      </g>

      {/* Amber jewel at center */}
      <circle cx="20" cy="20" r="3.5" fill="#F59E0B" />
    </svg>
  );
};

/** Full Atout logo — mark + wordmark */
const AtoutLogo: React.FC<AtoutLogoProps> = ({
  size = 'sm',
  variant = 'default',
  showWordmark = true,
  className = '',
}) => {
  const s = SIZES[size];

  const textColor =
    variant === 'white' ? 'text-white' :
    variant === 'dark'  ? 'text-[#0F0A1E]' :
    'text-[#0F0A1E]';

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <AtoutMark size={s.mark} />
      {showWordmark && (
        <span className={`font-black tracking-tight ${s.text} ${textColor} leading-none select-none`}>
          atout
        </span>
      )}
    </div>
  );
};

export default AtoutLogo;
