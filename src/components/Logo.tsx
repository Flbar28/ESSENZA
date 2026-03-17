import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, size = 'md' }) => {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', sub: 'text-[6px]' },
    md: { icon: 40, text: 'text-xl', sub: 'text-[8px]' },
    lg: { icon: 60, text: 'text-3xl', sub: 'text-[10px]' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Stylized Perfume Bottle / Drop Symbol */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBF5E6" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#AA8439" />
            <stop offset="75%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FBF5E6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Bottle Body - Elegant Teardrop Shape */}
        <path
          d="M50 12C50 12 22 48 22 68C22 83.5 34.5 96 50 96C65.5 96 78 83.5 78 68C78 48 50 12 50 12Z"
          fill="url(#goldGradient)"
        />
        
        {/* Bottle Neck & Cap */}
        <path
          d="M40 18H60V24C60 26 58 28 56 28H44C42 28 40 26 40 24V18Z"
          fill="url(#goldGradient)"
          opacity="0.9"
        />
        <rect x="44" y="8" width="12" height="8" rx="1" fill="url(#goldGradient)" />
        
        {/* Accent Line */}
        <path
          d="M35 65C35 65 40 85 50 85C60 85 65 65 65 65"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Shine / Light Point */}
        <circle cx="38" cy="58" r="4" fill="white" fillOpacity="0.6" filter="url(#glow)">
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`${currentSize.text} font-serif font-bold tracking-[0.2em] text-gold uppercase`}>
            ESSENZA D'OR
          </span>
          <span className={`${currentSize.sub} font-sans tracking-[0.5em] text-white/50 uppercase font-light`}>
            PERFUMES IMPORTADOS
          </span>
        </div>
      )}
    </div>
  );
};
