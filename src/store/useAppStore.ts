import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Presentation,
  PresentationConfig,
  ApiSettings,
  AppStep,
  BrandColors,
  Slide,
} from '../types/presentation';

const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#6272f1',
  accent: '#a855f7',
  background: '#0f172a',
  text: '#f8fafc',
};

const DEFAULT_CONFIG: PresentationConfig = {
  title: '',
  prompt: '',
  audience: 'General Public',
  slideCount: 10,
  tone: 'Professional',
  brandColors: DEFAULT_BRAND_COLORS,
};

const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  baseUrl: 'https://openrouter.ai/api/v1',
  model: 'openai/gpt-4o',
  temperature: 0.7,
};

interface AppState {
  // Navigation
  step: AppStep;
  setStep: (step: AppStep) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Config
  config: PresentationConfig;
  setConfig: (config: Partial<PresentationConfig>) => void;
  resetConfig: () => void;

  // API Settings
  apiSettings: ApiSettings;
  setApiSettings: (settings: Partial<ApiSettings>) => void;

  // Presentation
  presentation: Presentation | null;
  setPresentation: (p: Presentation | null) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  reorderSlides: (from: number, to: number) => void;
  deleteSlide: (id: string) => void;
  addSlide: (slide: Slide, afterId?: string) => void;

  // Active slide
  activeSlideId: string | null;
  setActiveSlideId: (id: string | null) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  generationProgress: number;
  setGenerationProgress: (v: number) => void;

  // Saved presentations
  savedPresentations: Array<{ id: string; title: string; date: string; data: Presentation }>;
  saveCurrentPresentation: () => void;
  loadPresentation: (id: string) => void;
  deleteSavedPresentation: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      step: 'landing',
      setStep: (step) => set({ step }),

      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      config: DEFAULT_CONFIG,
      setConfig: (config) =>
        set((s) => ({ config: { ...s.config, ...config } })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),

      apiSettings: DEFAULT_API_SETTINGS,
      setApiSettings: (settings) =>
        set((s) => ({ apiSettings: { ...s.apiSettings, ...settings } })),

      presentation: null,
      setPresentation: (presentation) => {
        set({ presentation });
        if (presentation?.slides?.length) {
          set({ activeSlideId: presentation.slides[0].id });
        }
      },
      updateSlide: (id, updates) =>
        set((s) => {
          if (!s.presentation) return s;
          return {
            presentation: {
              ...s.presentation,
              slides: s.presentation.slides.map((slide) =>
                slide.id === id ? { ...slide, ...updates } : slide
              ),
            },
          };
        }),
      reorderSlides: (from, to) =>
        set((s) => {
          if (!s.presentation) return s;
          const slides = [...s.presentation.slides];
          const [moved] = slides.splice(from, 1);
          slides.splice(to, 0, moved);
          return { presentation: { ...s.presentation, slides } };
        }),
      deleteSlide: (id) =>
        set((s) => {
          if (!s.presentation) return s;
          const slides = s.presentation.slides.filter((sl) => sl.id !== id);
          return {
            presentation: { ...s.presentation, slides },
            activeSlideId: slides[0]?.id ?? null,
          };
        }),
      addSlide: (slide, afterId) =>
        set((s) => {
          if (!s.presentation) return s;
          const slides = [...s.presentation.slides];
          if (afterId) {
            const idx = slides.findIndex((sl) => sl.id === afterId);
            slides.splice(idx + 1, 0, slide);
          } else {
            slides.push(slide);
          }
          return {
            presentation: { ...s.presentation, slides },
            activeSlideId: slide.id,
          };
        }),

      activeSlideId: null,
      setActiveSlideId: (id) => set({ activeSlideId: id }),

      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),
      generationProgress: 0,
      setGenerationProgress: (v) => set({ generationProgress: v }),

      savedPresentations: [],
      saveCurrentPresentation: () => {
        const { presentation, savedPresentations } = get();
        if (!presentation) return;
        const id = crypto.randomUUID();
        set({
          savedPresentations: [
            ...savedPresentations,
            {
              id,
              title: presentation.title,
              date: new Date().toISOString(),
              data: presentation,
            },
          ],
        });
      },
      loadPresentation: (id) => {
        const { savedPresentations } = get();
        const found = savedPresentations.find((p) => p.id === id);
        if (found) {
          set({
            presentation: found.data,
            activeSlideId: found.data.slides[0]?.id ?? null,
            step: 'editor',
          });
        }
      },
      deleteSavedPresentation: (id) =>
        set((s) => ({
          savedPresentations: s.savedPresentations.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'ai-ppt-forge-store',
      partialize: (state) => ({
        darkMode: state.darkMode,
        apiSettings: state.apiSettings,
        savedPresentations: state.savedPresentations,
        config: state.config,
      }),
    }
  )
);
