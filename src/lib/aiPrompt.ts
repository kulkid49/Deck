import type { PresentationConfig, Presentation } from '../types/presentation';

export const SYSTEM_PROMPT = `You are an elite presentation designer and communication strategist with 20+ years of experience crafting boardroom-ready PowerPoint presentations for Fortune 500 companies, TED speakers, and venture-backed startups. You combine the storytelling mastery of McKinsey, the visual clarity of Apple keynotes, and the persuasive power of top-tier pitch decks.

Your task is to generate a complete, professional presentation structure in strict JSON format.

PRESENTATION DESIGN PRINCIPLES YOU MUST FOLLOW:
1. **The Minto Pyramid**: Lead with the conclusion, support with key insights, back with data. Every slide must have one clear takeaway.
2. **5-Second Rule**: A viewer must grasp the slide's core message in 5 seconds. No wall-of-text slides.
3. **Rule of Three**: Group information in threes whenever possible for memorability.
4. **Visual Hierarchy**: Title → Key insight → Supporting detail. Never more than 5 bullets per slide.
5. **Storytelling Arc**: Opening hook → Problem/Opportunity → Solution → Evidence → Call to Action.
6. **Data Visualization**: When showing numbers, always suggest the right chart type (bar for comparison, line for trends, pie for composition).
7. **Cognitive Load**: Each slide has ONE job. If it's doing two things, split it.

SLIDE VARIETY REQUIREMENTS:
- Start with a powerful title slide that hooks the audience
- Use section headers to divide major chapters
- Mix content layouts: use twoColumn for comparisons, chart slides for data, imageOnly for visual impact
- Include a compelling closing/CTA slide
- Place data/evidence slides in the middle third of the presentation
- End with next steps, not just a summary

QUALITY STANDARDS:
- Bullet points must be crisp, parallel in structure, action-oriented
- Titles should be insight statements, not topic labels (e.g., "Revenue grew 3x in 18 months" not "Revenue")
- Numbers must be specific and credible
- Use active voice always
- No filler content, no vague platitudes

OUTPUT FORMAT - Return ONLY valid JSON matching this exact schema, no markdown fences, no commentary:
{
  "title": "string - compelling presentation title",
  "slides": [
    {
      "id": "unique string id like slide-1",
      "layout": "title | titleAndContent | twoColumn | chart | imageOnly | sectionHeader",
      "title": "string",
      "subtitle": "string (optional, for title/sectionHeader layouts)",
      "bullets": ["string"] (optional, max 5 items, for titleAndContent),
      "bodyText": "string (optional, for descriptive paragraphs)",
      "leftColumn": { "title": "string", "bullets": ["string"] } (optional, for twoColumn),
      "rightColumn": { "title": "string", "bullets": ["string"] } (optional, for twoColumn),
      "chart": {
        "type": "bar | pie | line",
        "title": "string",
        "data": [["label", number], ...]
      } (optional, for chart layout),
      "imagePrompt": "string - detailed image description for AI generation" (optional),
      "notes": "string - speaker notes for presenter" (optional)
    }
  ]
}`;

export function buildUserPrompt(config: PresentationConfig): string {
  return `Create a professional ${config.tone} presentation with the following specifications:

TOPIC/CONTENT: ${config.prompt || config.title}
PRESENTATION TITLE: ${config.title || 'Auto-generate a compelling title'}
TARGET AUDIENCE: ${config.audience}
NUMBER OF SLIDES: ${config.slideCount}
TONE/STYLE: ${config.tone}

SPECIFIC REQUIREMENTS:
- First slide MUST be layout: "title" with compelling subtitle
- Last slide should be a strong CTA/Next Steps slide
- Include at least 1 chart slide with realistic data relevant to the topic
- Include at least 1 twoColumn slide for a key comparison
- Include at least 1 sectionHeader slide to divide major sections
- Remaining slides should be titleAndContent with focused bullet points
- Make ALL data, statistics, and facts realistic and credible for this topic
- Speaker notes should contain 2-3 sentences of additional talking points per slide

AUDIENCE CONTEXT: ${config.audience === 'Investors' ? 'Focus on ROI, market size, competitive moat, and growth metrics.' :
    config.audience === 'Executives' ? 'Focus on strategic impact, KPIs, risk/reward, and executive summary.' :
    config.audience === 'Students' ? 'Focus on learning outcomes, clear explanations, examples, and engagement.' :
    config.audience === 'Technical Team' ? 'Include implementation details, technical specs, and architecture considerations.' :
    config.audience === 'Clients' ? 'Focus on value delivered, case studies, ROI, and next engagement steps.' :
    'Balance insights, engagement, and clear takeaways for a general audience.'}

Now generate the complete presentation JSON:`;
}

export function validatePresentation(data: unknown): Presentation {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response: not an object');
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.title !== 'string') throw new Error('Missing title');
  if (!Array.isArray(obj.slides)) throw new Error('Missing slides array');

  const validLayouts = new Set([
    'title', 'titleAndContent', 'twoColumn', 'chart', 'imageOnly', 'sectionHeader',
  ]);

  const slides = obj.slides.map((s: unknown, i: number) => {
    if (typeof s !== 'object' || s === null) throw new Error(`Slide ${i} not object`);
    const slide = s as Record<string, unknown>;
    
    // Ensure required properties for Slide type
    if (!slide.id) slide.id = `slide-${i + 1}`;
    if (!slide.title) slide.title = '';
    if (!validLayouts.has(slide.layout as string)) {
      slide.layout = 'titleAndContent';
    }
    
    return slide as unknown as Slide;
  });

  return { title: obj.title as string, slides };
}

export const DEMO_PRESENTATION: Presentation = {
  title: 'AI in 2026: The Intelligence Revolution',
  slides: [
    {
      id: 'slide-1',
      layout: 'title',
      title: 'AI in 2026: The Intelligence Revolution',
      subtitle: 'How Artificial Intelligence is Reshaping Every Industry, Every Career, and Every Business',
      notes: 'Open with a powerful question: "What if every employee had the world\'s most capable AI working alongside them?" This sets the tone for the transformative narrative ahead.',
    },
    {
      id: 'slide-2',
      layout: 'sectionHeader',
      title: 'Chapter 1: Where We Stand Today',
      subtitle: 'The AI Landscape in 2026',
      notes: 'Transition into the current state of AI adoption. Ground the audience in reality before painting the vision.',
    },
    {
      id: 'slide-3',
      layout: 'titleAndContent',
      title: 'AI Has Crossed the Chasm Into Mainstream Adoption',
      bullets: [
        '78% of Fortune 500 companies have deployed AI in core operations (McKinsey, 2026)',
        'Global AI market exceeds $1.2 trillion, growing at 38% CAGR',
        'AI-native startups now represent 34% of all VC-backed companies',
        'Average knowledge worker uses 4+ AI tools daily',
        'Productivity gains of 40–60% documented across professional services',
      ],
      notes: 'Emphasize the "crossing the chasm" metaphor—AI is no longer experimental. These are operational, revenue-generating deployments at scale.',
    },
    {
      id: 'slide-4',
      layout: 'chart',
      title: 'AI Investment Has Accelerated Faster Than Any Technology in History',
      chart: {
        type: 'bar',
        title: 'Global AI Investment by Year ($B)',
        data: [
          ['2020', 41],
          ['2021', 93],
          ['2022', 91],
          ['2023', 185],
          ['2024', 420],
          ['2025', 780],
          ['2026', 1200],
        ],
      },
      notes: 'The compound growth here is staggering. Point out that 2026 investment exceeds the entire previous decade combined. This isn\'t a trend—it\'s a tectonic shift.',
    },
    {
      id: 'slide-5',
      layout: 'twoColumn',
      title: 'Two Types of Companies Will Exist in 2027',
      leftColumn: {
        title: '🚀 AI-First Organizations',
        bullets: [
          '3–5x faster product development cycles',
          'AI handles 60%+ of routine decision-making',
          'Hyper-personalized customer experiences at scale',
          'Operating costs reduced by 35% year-over-year',
          'Attract top talent with cutting-edge tools',
        ],
      },
      rightColumn: {
        title: '⚠️ AI-Laggard Organizations',
        bullets: [
          'Struggle to compete on speed and cost',
          'Manual processes create bottlenecks',
          'Losing market share to leaner competitors',
          'Top talent migrates to AI-native peers',
          'Facing structural irrelevance by 2028',
        ],
      },
      notes: 'This is the critical fork-in-the-road moment. Make it visceral—the difference between these two paths will determine which companies become the new blue chips.',
    },
    {
      id: 'slide-6',
      layout: 'sectionHeader',
      title: 'Chapter 2: The Breakthrough Technologies',
      subtitle: 'What\'s Actually Driving the Revolution',
      notes: 'Pivot to the "how"—the specific technological breakthroughs that are enabling this transformation.',
    },
    {
      id: 'slide-7',
      layout: 'titleAndContent',
      title: 'Five Technologies Converging to Create Super-Intelligence',
      bullets: [
        '🧠 Multimodal LLMs — Models that see, hear, code, and reason simultaneously',
        '🤖 Autonomous AI Agents — AI that plans, executes multi-step tasks without supervision',
        '⚡ Neuromorphic Chips — 1000x energy efficiency enabling edge AI everywhere',
        '🔗 AI-to-AI Collaboration — Networks of specialized agents solving complex problems',
        '🧬 Synthetic Data Generation — Unlimited training data solving the scarcity bottleneck',
      ],
      notes: 'These five forces are individually powerful. The compound effect of all five converging simultaneously is what makes 2026 different from any prior AI moment.',
    },
    {
      id: 'slide-8',
      layout: 'chart',
      title: 'AI Capabilities Are Doubling Every 8 Months',
      chart: {
        type: 'line',
        title: 'AI Benchmark Performance vs Human Baseline (Index: Human = 100)',
        data: [
          ['Q1 2023', 67],
          ['Q3 2023', 82],
          ['Q1 2024', 101],
          ['Q3 2024', 134],
          ['Q1 2025', 178],
          ['Q3 2025', 224],
          ['Q1 2026', 289],
        ],
      },
      notes: 'The inflection point was Q1 2024—when AI surpassed human baseline across standard cognitive benchmarks. We are now firmly in super-human AI territory for most knowledge tasks.',
    },
    {
      id: 'slide-9',
      layout: 'sectionHeader',
      title: 'Chapter 3: Industry Transformation',
      subtitle: 'No Sector Is Untouched',
    },
    {
      id: 'slide-10',
      layout: 'twoColumn',
      title: 'AI Is Rewriting the Rules Across Every Sector',
      leftColumn: {
        title: '🏥 Healthcare',
        bullets: [
          'AI diagnostics outperform radiologists by 23%',
          'Drug discovery time cut from 12 years to 18 months',
          'Personalized treatment plans at scale',
          '$280B in annual cost savings projected',
        ],
      },
      rightColumn: {
        title: '💼 Finance & Legal',
        bullets: [
          'AI handles 85% of routine contract review',
          'Fraud detection accuracy at 99.7%',
          'Algorithmic trading generates 72% of all volume',
          'Compliance costs reduced by 60%',
        ],
      },
      notes: 'Use concrete numbers—they land harder than abstract claims. The healthcare example is especially powerful for mixed audiences because everyone has a personal connection to it.',
    },
  ],
};
