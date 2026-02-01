
import React from 'react';

interface ParchmentCardProps {
  children: React.ReactNode;
  className?: string;
  edgeType?: 'torn' | 'zigzag' | 'clean';
  rotation?: string;
}

export const ParchmentCard: React.FC<ParchmentCardProps> = ({ 
  children, 
  className = "", 
  edgeType = 'torn',
  rotation = "rotate-0"
}) => {
  const edgeClass = edgeType === 'zigzag' ? 'zigzag-edge' : edgeType === 'torn' ? 'torn-edge' : 'rounded-sm';
  
  return (
    <div className={`relative ${rotation} transition-all duration-500`}>
      <div className={`paper-texture p-6 shadow-vintage ${edgeClass} border border-black/[0.03] ${className}`}>
        {children}
      </div>
    </div>
  );
};

export const Tape: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute tape w-20 h-7 opacity-70 z-10 pointer-events-none ${className}`} 
       style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 98%, 0% 100%)' }} />
);

export const Stamp: React.FC<{ text: string; subText?: string; className?: string }> = ({ text, subText, className = "" }) => (
  <div className={`border-2 border-vintageRed/80 px-4 py-1.5 rounded-sm text-vintageRed/80 font-retro font-black uppercase tracking-widest flex flex-col items-center rotate-[-5deg] ${className}`}>
    {subText && <span className="text-[7px] tracking-[0.2em] font-mono leading-none mb-0.5">{subText}</span>}
    <span className="text-sm leading-none">{text}</span>
  </div>
);

// Added CinePanel component for specialized film-themed layout sections used in profile and styling views
export const CinePanel: React.FC<{ 
  children: React.ReactNode; 
  variant?: string; 
  color?: string; 
  className?: string; 
}> = ({ children, variant, color = "", className = "" }) => {
  return (
    <div className={`relative ${color} ${className}`}>
      {children}
    </div>
  );
};
