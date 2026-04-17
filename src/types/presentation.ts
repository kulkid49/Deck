// src/types/presentation.ts

export type SlideLayout =
  | 'title'
  | 'titleAndContent'
  | 'twoColumn'
  | 'chart'
  | 'imageOnly'
  | 'sectionHeader';

export type ChartType = 'bar' | 'pie' | 'line';

export type ToneStyle =
  | 'Professional'
  | 'Corporate'
  | 'Startup Pitch'
  | 'Educational'
  | 'Creative'
  | 'Minimalist';

export type AudienceType =
  | 'Executives'
  | 'Investors'
  | 'Students'
  | 'General Public'
  | 'Technical Team'
  | 'Clients'
  | 'Custom';

export interface ChartData {
  type: ChartType;
  title: string;
  data: Array<[string, number]>;
}

export interface TwoColumnData {
  title: string;
  bullets: string[];
}

export interface Slide {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  bullets?: string[];
  bodyText?: string;
  leftColumn?: TwoColumnData;
  rightColumn?: TwoColumnData;
  chart?: ChartData;
  imagePrompt?: string;
  notes?: string;
}

export interface Presentation {
  title: string;
  slides: Slide[];
}

export interface BrandColors {
  primary: string;
  accent: string;
  background: string;
  text: string;
}

export interface PresentationConfig {
  title: string;
  prompt: string;
  audience: AudienceType | string;
  slideCount: number;
  tone: ToneStyle;
  brandColors: BrandColors;
  logoUrl?: string;
}

export interface ApiSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
}

export type AppStep = 'landing' | 'create' | 'editor';
export type TabView = 'input' | 'editor' | 'settings';
