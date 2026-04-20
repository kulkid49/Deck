import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Editor } from './components/Editor';
import { generatePresentation } from './lib/openai';
import { 
  Sparkles, 
  Settings as SettingsIcon, 
  Plus, 
  History, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Layout as LayoutIcon,
  Trash2
} from 'lucide-react';

const App: React.FC = () => {
  const { 
    step, 
    setStep, 
    config, 
    setConfig, 
    apiSettings, 
    setApiSettings,
    setPresentation,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    savedPresentations
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!apiSettings.apiKey) {
      setError('Please add your OpenRouter API key in Settings.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      const result = await generatePresentation(
        config,
        apiSettings,
        (pct) => setGenerationProgress(pct)
      );
      setPresentation(result);
      setStep('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === 'editor') {
    return <Editor />;
  }

  return (
    <div className="min-h-screen bg-surface-950 text-surface-50 font-sans selection:bg-brand-500/30">
      {/* Navigation / Header */}
      <nav className="h-16 border-b border-surface-900 flex items-center justify-between px-8 bg-surface-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">ai-ppt-forge</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setStep('landing')}
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${step === 'landing' ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setStep('create')}
            className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${step === 'create' ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-100'}`}
          >
            Create
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {step === 'landing' && (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display font-extrabold mb-3">Welcome back</h1>
                <p className="text-surface-400 text-lg">Your creative hub for professional slide decks.</p>
              </div>
              <button 
                onClick={() => setStep('create')}
                className="flex items-center gap-2 px-6 py-3 gradient-brand rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-500/25"
              >
                <Plus size={20} />
                Create New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl border border-surface-900 flex flex-col items-center text-center group hover:border-brand-500/30 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">AI Generator</h3>
                <p className="text-surface-400 text-sm">Turn any prompt into a complete presentation in seconds.</p>
              </div>
              <div className="glass p-6 rounded-2xl border border-surface-900 flex flex-col items-center text-center group hover:border-accent-500/30 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center text-accent-500 mb-4 group-hover:scale-110 transition-transform">
                  <History size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Templates</h3>
                <p className="text-surface-400 text-sm">Choose from a library of professionally designed layouts.</p>
              </div>
              <div className="glass p-6 rounded-2xl border border-surface-900 flex flex-col items-center text-center group hover:border-surface-700 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center text-surface-400 mb-4 group-hover:scale-110 transition-transform">
                  <SettingsIcon size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Brand Assets</h3>
                <p className="text-surface-400 text-sm">Manage your logos, colors, and font pairings.</p>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold">Recent Projects</h2>
                <button className="text-sm font-medium text-brand-500 hover:text-brand-400 transition-colors flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              {savedPresentations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedPresentations.map((pres) => (
                    <div 
                      key={pres.id} 
                      className="group cursor-pointer"
                      onClick={() => useAppStore.getState().loadPresentation(pres.id)}
                    >
                      <div className="aspect-video bg-surface-900 rounded-xl border border-surface-800 overflow-hidden mb-3 group-hover:border-brand-500/50 transition-all relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 flex items-center justify-center text-surface-800">
                           <LayoutIcon size={48} />
                         </div>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             useAppStore.getState().deleteSavedPresentation(pres.id);
                           }}
                           className="absolute top-2 right-2 p-1.5 bg-surface-950/80 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                      <h4 className="font-bold truncate group-hover:text-brand-400 transition-colors">{pres.title}</h4>
                      <p className="text-xs text-surface-500">
                        {new Date(pres.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 rounded-2xl border-2 border-dashed border-surface-900 flex flex-col items-center justify-center text-surface-500 gap-3">
                  <LayoutIcon size={32} />
                  <p className="font-medium">No projects yet. Start by creating one!</p>
                </div>
              )}
            </section>
          </div>
        )}

        {step === 'create' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-display font-bold mb-4">Forge your presentation</h1>
              <p className="text-surface-400">Provide a topic and let our AI handle the rest.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-500 uppercase tracking-wider px-1">Presentation Title</label>
                <input 
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ title: e.target.value })}
                  placeholder="e.g., Q3 Marketing Strategy"
                  className="w-full bg-surface-900 border border-surface-800 rounded-2xl p-4 text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-500 uppercase tracking-wider px-1">Detailed Prompt</label>
                <textarea 
                  value={config.prompt}
                  onChange={(e) => setConfig({ prompt: e.target.value })}
                  placeholder="Describe what you want to achieve, key points to cover, and overall message..."
                  className="w-full h-40 bg-surface-900 border border-surface-800 rounded-2xl p-4 text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-surface-500 uppercase tracking-wider px-1">Target Audience</label>
                  <select 
                    value={config.audience}
                    onChange={(e) => setConfig({ audience: e.target.value as any })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-2xl p-4 text-surface-50 focus:outline-none focus:border-brand-500 transition-all appearance-none"
                  >
                    <option>Investors</option>
                    <option>Executives</option>
                    <option>Students</option>
                    <option>Technical Team</option>
                    <option>Clients</option>
                    <option>General Public</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-surface-500 uppercase tracking-wider px-1">Slide Count</label>
                  <input 
                    type="number"
                    min={3}
                    max={20}
                    value={config.slideCount}
                    onChange={(e) => setConfig({ slideCount: parseInt(e.target.value) })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-2xl p-4 text-surface-50 focus:outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* API Key Field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-surface-500 uppercase tracking-wider px-1">OpenRouter API Key</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={apiSettings.apiKey}
                    onChange={(e) => setApiSettings({ apiKey: e.target.value })}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-surface-900 border border-surface-800 rounded-2xl p-4 text-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all pl-12"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">
                    <SettingsIcon size={20} />
                  </div>
                </div>
                <p className="text-xs text-surface-600 px-1">Your key is stored locally and never sent to our servers.</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 gradient-brand rounded-2xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Forging Slides ({generationProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      <span>Generate Presentation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
