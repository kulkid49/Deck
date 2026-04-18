import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SlidePreview } from './SlidePreview';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  Download, 
  Settings, 
  Sparkles,
  Layout as LayoutIcon,
  Type,
  PieChart,
  Image as ImageIcon,
  Columns,
  Bookmark,
  Loader2
} from 'lucide-react';
import type { SlideLayout, Slide } from '../types/presentation';
import { exportToPptx } from '../lib/exportPptx';
import toast from 'react-hot-toast';

export const Editor: React.FC = () => {
  const { 
    presentation, 
    activeSlideId, 
    setActiveSlideId, 
    updateSlide, 
    deleteSlide, 
    addSlide, 
    reorderSlides,
    config,
    setConfig,
    setStep,
    saveCurrentPresentation
  } = useAppStore();

  const [isExporting, setIsExporting] = useState(false);
  const [showBrandPanel, setShowBrandPanel] = useState(false);

  if (!presentation) return null;

  const activeSlide = presentation.slides.find(s => s.id === activeSlideId) || presentation.slides[0];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPptx(presentation, config.brandColors);
      toast.success('Presentation exported successfully!');
    } catch (err) {
      toast.error('Failed to export presentation');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    saveCurrentPresentation();
    toast.success('Presentation saved to dashboard');
  };

  const handleUpdate = (updates: Partial<Slide>) => {
    updateSlide(activeSlide.id, updates);
  };

  const handleLayoutChange = (layout: SlideLayout) => {
    handleUpdate({ layout });
  };

  const layouts: Array<{ id: SlideLayout; icon: React.ReactNode; label: string }> = [
    { id: 'title', icon: <Type size={16} />, label: 'Title' },
    { id: 'titleAndContent', icon: <LayoutIcon size={16} />, label: 'Content' },
    { id: 'twoColumn', icon: <Columns size={16} />, label: 'Two Column' },
    { id: 'chart', icon: <PieChart size={16} />, label: 'Chart' },
    { id: 'imageOnly', icon: <ImageIcon size={16} />, label: 'Image Only' },
    { id: 'sectionHeader', icon: <Bookmark size={16} />, label: 'Section Header' },
  ];

  return (
    <div className="h-screen flex flex-col bg-surface-950 text-surface-50 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-surface-800 flex items-center justify-between px-6 bg-surface-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setStep('landing')}
            className="p-2 hover:bg-surface-800 rounded-lg transition-colors text-surface-400"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold truncate max-w-[300px]">
            {presentation.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBrandPanel(!showBrandPanel)}
            className={`flex items-center gap-2 px-4 py-2 transition-colors ${showBrandPanel ? 'text-brand-400' : 'text-surface-400 hover:text-surface-50'}`}
          >
            <Settings size={18} />
            <span>Brand</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-surface-50 transition-colors"
          >
            <Sparkles size={18} />
            <span>Save</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 rounded-lg font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Brand Customization Panel */}
        {showBrandPanel && (
          <aside className="w-80 border-r border-surface-800 bg-surface-900/50 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Brand Styling</h2>
                <button onClick={() => setShowBrandPanel(false)} className="text-surface-500 hover:text-surface-300">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-surface-500 uppercase">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-surface-500 font-medium">Primary</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={config.brandColors.primary} 
                        onChange={(e) => setConfig({ brandColors: { ...config.brandColors, primary: e.target.value } })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input 
                        type="text" 
                        value={config.brandColors.primary}
                        onChange={(e) => setConfig({ brandColors: { ...config.brandColors, primary: e.target.value } })}
                        className="flex-1 bg-surface-800 border border-surface-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-surface-500 font-medium">Accent</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={config.brandColors.accent} 
                        onChange={(e) => setConfig({ brandColors: { ...config.brandColors, accent: e.target.value } })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input 
                        type="text" 
                        value={config.brandColors.accent}
                        onChange={(e) => setConfig({ brandColors: { ...config.brandColors, accent: e.target.value } })}
                        className="flex-1 bg-surface-800 border border-surface-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-surface-500 uppercase">Logo</h3>
                <div className="p-8 border-2 border-dashed border-surface-800 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-brand-500/50 cursor-pointer transition-all">
                  <ImageIcon size={32} className="text-surface-700" />
                  <p className="text-xs text-surface-500">Click to upload logo</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Sidebar - Slide List */}
        <aside className="w-64 border-r border-surface-800 flex flex-col bg-surface-900/30">
          <div className="p-4 border-b border-surface-800 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-surface-500">Slides</h2>
            <button 
              onClick={() => {
                const newId = `slide-${Date.now()}`;
                addSlide({ id: newId, layout: 'titleAndContent', title: 'New Slide' });
                setActiveSlideId(newId);
              }}
              className="p-1 hover:bg-surface-800 rounded text-brand-500 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {presentation.slides.map((slide, index) => (
              <div key={slide.id} className="group relative">
                <div 
                  onClick={() => setActiveSlideId(slide.id)}
                  className={`
                    cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden
                    ${activeSlideId === slide.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-transparent hover:border-surface-700'}
                  `}
                >
                  <SlidePreview slide={slide} brandColors={config.brandColors} thumbnail={true} />
                </div>
                <div className="mt-1 flex justify-between items-center px-1">
                  <span className="text-[10px] text-surface-500 font-medium">{index + 1}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => index > 0 && reorderSlides(index, index - 1)}
                      className="p-0.5 hover:bg-surface-800 rounded text-surface-400"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button 
                      onClick={() => index < presentation.slides.length - 1 && reorderSlides(index, index + 1)}
                      className="p-0.5 hover:bg-surface-800 rounded text-surface-400"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button 
                      onClick={() => deleteSlide(slide.id)}
                      className="p-0.5 hover:bg-surface-800 rounded text-red-500/70 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto bg-surface-950 p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-8">
            <SlidePreview 
              slide={activeSlide} 
              brandColors={config.brandColors} 
              className="w-full shadow-2xl rounded-xl" 
            />
            
            {/* Slide Editor Controls */}
            <div className="glass rounded-xl p-6 border border-surface-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings size={18} className="text-brand-500" />
                  Edit Slide
                </h3>
                <div className="flex items-center gap-2 p-1 bg-surface-900 rounded-lg border border-surface-800">
                  {layouts.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleLayoutChange(l.id)}
                      title={l.label}
                      className={`
                        p-2 rounded-md transition-colors
                        ${activeSlide.layout === l.id ? 'bg-brand-500 text-white' : 'text-surface-400 hover:text-surface-100'}
                      `}
                    >
                      {l.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-surface-500 uppercase mb-1.5 block">Slide Title</label>
                  <input 
                    type="text"
                    value={activeSlide.title}
                    onChange={(e) => handleUpdate({ title: e.target.value })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-surface-50 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {activeSlide.layout === 'title' && (
                  <div>
                    <label className="text-xs font-bold text-surface-500 uppercase mb-1.5 block">Subtitle</label>
                    <input 
                      type="text"
                      value={activeSlide.subtitle || ''}
                      onChange={(e) => handleUpdate({ subtitle: e.target.value })}
                      className="w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-surface-50 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                )}

                {(activeSlide.layout === 'titleAndContent' || activeSlide.layout === 'twoColumn') && (
                  <div>
                    <label className="text-xs font-bold text-surface-500 uppercase mb-1.5 block">
                      {activeSlide.layout === 'twoColumn' ? 'Left Column Bullets' : 'Bullet Points'}
                    </label>
                    <div className="space-y-2">
                      {(activeSlide.layout === 'twoColumn' ? activeSlide.leftColumn?.bullets : activeSlide.bullets)?.map((bullet, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              if (activeSlide.layout === 'twoColumn') {
                                const newBullets = [...(activeSlide.leftColumn?.bullets || [])];
                                newBullets[i] = e.target.value;
                                handleUpdate({ leftColumn: { ...activeSlide.leftColumn!, bullets: newBullets } });
                              } else {
                                const newBullets = [...(activeSlide.bullets || [])];
                                newBullets[i] = e.target.value;
                                handleUpdate({ bullets: newBullets });
                              }
                            }}
                            className="flex-1 bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-surface-50 focus:outline-none focus:border-brand-500 transition-colors"
                          />
                          <button 
                            onClick={() => {
                              if (activeSlide.layout === 'twoColumn') {
                                const newBullets = activeSlide.leftColumn?.bullets.filter((_, idx) => idx !== i);
                                handleUpdate({ leftColumn: { ...activeSlide.leftColumn!, bullets: newBullets || [] } });
                              } else {
                                const newBullets = activeSlide.bullets?.filter((_, idx) => idx !== i);
                                handleUpdate({ bullets: newBullets });
                              }
                            }}
                            className="p-2.5 hover:bg-surface-800 rounded-lg text-red-500/70 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          if (activeSlide.layout === 'twoColumn') {
                            handleUpdate({ leftColumn: { ...activeSlide.leftColumn!, bullets: [...(activeSlide.leftColumn?.bullets || []), 'New bullet point'] } });
                          } else {
                            handleUpdate({ bullets: [...(activeSlide.bullets || []), 'New bullet point'] });
                          }
                        }}
                        className="w-full py-2 border-2 border-dashed border-surface-800 rounded-lg text-surface-500 hover:text-brand-500 hover:border-brand-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add Bullet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
