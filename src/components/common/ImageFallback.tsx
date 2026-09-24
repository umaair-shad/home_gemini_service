import React from 'react';
import { Wrench, Zap, Wind, Hammer, Paintbrush, Cpu, User, CheckCircle, ShieldCheck } from 'lucide-react';

interface ImageFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  categoryIcon?: string;
  type?: 'service' | 'avatar' | 'evidence' | 'hero';
}

export const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  className = '',
  categoryIcon,
  type = 'service',
}) => {
  const [hasError, setHasError] = React.useState(false);

  const getCategoryIconComponent = () => {
    switch (categoryIcon) {
      case 'Zap':
        return <Zap className="w-8 h-8 text-blue-500" />;
      case 'Wind':
        return <Wind className="w-8 h-8 text-cyan-500" />;
      case 'Hammer':
        return <Hammer className="w-8 h-8 text-blue-600" />;
      case 'Paintbrush':
        return <Paintbrush className="w-8 h-8 text-indigo-500" />;
      case 'Cpu':
        return <Cpu className="w-8 h-8 text-sky-500" />;
      default:
        return <Wrench className="w-8 h-8 text-blue-500" />;
    }
  };

  if (hasError || !src) {
    if (type === 'avatar') {
      return (
        <div className={`flex items-center justify-center bg-blue-50 text-blue-700 font-bold border border-blue-200/80 rounded-full select-none ${className}`}>
          <User className="w-1/2 h-1/2 text-blue-600" />
        </div>
      );
    }

    if (type === 'evidence') {
      return (
        <div className={`relative flex flex-col items-center justify-center bg-slate-50 text-slate-700 border border-blue-200/60 rounded-xl p-4 text-center select-none overflow-hidden ${className}`}>
          <div className="absolute inset-0 cyber-grid opacity-30" />
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-black">{alt}</span>
            <span className="text-[10px] text-blue-600 font-mono tracking-wider uppercase font-semibold">QA Digitally Verified</span>
          </div>
        </div>
      );
    }

    // Default service / hero container: Minimalist Futuristic Cyber Aesthetic
    return (
      <div className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-[#07132B] to-[#0A1D44] text-white rounded-2xl p-6 select-none overflow-hidden border border-blue-500/30 shadow-lg ${className}`}>
        <div className="absolute inset-0 cyber-grid-dark opacity-40" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="p-3.5 bg-blue-900/60 rounded-xl backdrop-blur-md border border-blue-400/30 shadow-md shadow-blue-500/20">
            {getCategoryIconComponent()}
          </div>
          <span className="text-sm font-bold text-white tracking-wide font-display">{alt}</span>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 font-semibold tracking-wider uppercase bg-blue-900/50 px-2 py-0.5 rounded border border-blue-500/30">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Smart Home Certified Pro</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
