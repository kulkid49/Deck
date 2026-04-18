import React from 'react';
import type { Slide, BrandColors } from '../types/presentation';
import { Layout, Type, PieChart, Image as ImageIcon, Columns, Bookmark } from 'lucide-react';

interface SlidePreviewProps {
  slide: Slide;
  brandColors: BrandColors;
  className?: string;
  thumbnail?: boolean;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ 
  slide, 
  brandColors, 
  className = '', 
  thumbnail = false 
}) => {
  const getLayoutIcon = () => {
    switch (slide.layout) {
      case 'title': return <Type size={thumbnail ? 12 : 24} />;
      case 'titleAndContent': return <Layout size={thumbnail ? 12 : 24} />;
      case 'twoColumn': return <Columns size={thumbnail ? 12 : 24} />;
      case 'chart': return <PieChart size={thumbnail ? 12 : 24} />;
      case 'imageOnly': return <ImageIcon size={thumbnail ? 12 : 24} />;
      case 'sectionHeader': return <Bookmark size={thumbnail ? 12 : 24} />;
      default: return <Layout size={thumbnail ? 12 : 24} />;
    }
  };

  const renderContent = () => {
    switch (slide.layout) {
      case 'title':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <h1 
              className={`${thumbnail ? 'text-[10px]' : 'text-5xl'} font-display font-bold mb-4`}
              style={{ color: brandColors.primary }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className={`${thumbnail ? 'text-[6px]' : 'text-xl'} text-surface-400`}>
                {slide.subtitle}
              </p>
            )}
          </div>
        );

      case 'titleAndContent':
        return (
          <div className="h-full p-8 flex flex-col">
            <h2 className={`${thumbnail ? 'text-[8px]' : 'text-3xl'} font-bold mb-6`} style={{ color: brandColors.primary }}>
              {slide.title}
            </h2>
            <ul className={`space-y-4 ${thumbnail ? 'space-y-1' : ''}`}>
              {slide.bullets?.map((bullet, i) => (
                <li key={i} className={`${thumbnail ? 'text-[5px]' : 'text-lg'} flex items-start`}>
                  <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandColors.accent }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'twoColumn':
        return (
          <div className="h-full p-8 flex flex-col">
            <h2 className={`${thumbnail ? 'text-[8px]' : 'text-3xl'} font-bold mb-6`} style={{ color: brandColors.primary }}>
              {slide.title}
            </h2>
            <div className="flex gap-8 flex-1">
              <div className="flex-1">
                <h3 className={`${thumbnail ? 'text-[6px]' : 'text-xl'} font-semibold mb-3`} style={{ color: brandColors.accent }}>
                  {slide.leftColumn?.title}
                </h3>
                <ul className={`space-y-2 ${thumbnail ? 'space-y-0.5' : ''}`}>
                  {slide.leftColumn?.bullets.map((bullet, i) => (
                    <li key={i} className={`${thumbnail ? 'text-[4px]' : 'text-base'} flex items-start`}>
                      <span className="mr-2 mt-1 w-1 h-1 rounded-full flex-shrink-0 bg-surface-400" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <h3 className={`${thumbnail ? 'text-[6px]' : 'text-xl'} font-semibold mb-3`} style={{ color: brandColors.accent }}>
                  {slide.rightColumn?.title}
                </h3>
                <ul className={`space-y-2 ${thumbnail ? 'space-y-0.5' : ''}`}>
                  {slide.rightColumn?.bullets.map((bullet, i) => (
                    <li key={i} className={`${thumbnail ? 'text-[4px]' : 'text-base'} flex items-start`}>
                      <span className="mr-2 mt-1 w-1 h-1 rounded-full flex-shrink-0 bg-surface-400" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="h-full p-8 flex flex-col">
            <h2 className={`${thumbnail ? 'text-[8px]' : 'text-3xl'} font-bold mb-4`} style={{ color: brandColors.primary }}>
              {slide.title}
            </h2>
            <div className="flex-1 flex items-center justify-center bg-surface-800/50 rounded-xl border border-surface-700/50 p-4 relative">
               {!thumbnail && <PieChart size={64} className="text-surface-600 mb-2" />}
               <div className={`${thumbnail ? 'text-[6px]' : 'text-lg'} font-medium text-surface-400`}>
                 {slide.chart?.title}
               </div>
               {/* Simplified chart representation */}
               <div className="absolute inset-0 flex items-end justify-center gap-2 p-8 pt-16">
                 {slide.chart?.data.map((item, i) => (
                   <div 
                     key={i} 
                     className="w-full bg-brand-500/30 border-t border-brand-500/50 rounded-t-sm"
                     style={{ height: `${(item[1] / Math.max(...slide.chart!.data.map(d => d[1]))) * 80}%` }}
                   />
                 ))}
               </div>
            </div>
          </div>
        );

      case 'sectionHeader':
        return (
          <div className="h-full flex flex-col items-start justify-center p-12 bg-gradient-to-br from-brand-500/10 to-transparent">
             <div className="w-12 h-1 bg-brand-500 mb-6" />
             <h2 className={`${thumbnail ? 'text-[10px]' : 'text-5xl'} font-bold mb-4`} style={{ color: brandColors.primary }}>
               {slide.title}
             </h2>
             {slide.subtitle && (
               <p className={`${thumbnail ? 'text-[6px]' : 'text-xl'} text-surface-400`}>
                 {slide.subtitle}
               </p>
             )}
          </div>
        );

      case 'imageOnly':
        return (
          <div className="h-full relative overflow-hidden bg-surface-800">
             <div className="absolute inset-0 flex items-center justify-center">
               <ImageIcon size={thumbnail ? 20 : 64} className="text-surface-700" />
             </div>
             <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
               <h2 className={`${thumbnail ? 'text-[8px]' : 'text-3xl'} font-bold text-white`}>
                 {slide.title}
               </h2>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`slide-preview bg-surface-900 border border-surface-800 text-surface-50 ${className}`}
      style={{ backgroundColor: brandColors.background }}
    >
      {renderContent()}
      
      {/* Footer / Slide Number */}
      {!thumbnail && (
        <div className="absolute bottom-4 right-8 text-xs text-surface-500 flex items-center gap-2">
          {getLayoutIcon()}
          <span>{slide.layout}</span>
        </div>
      )}
    </div>
  );
};
