import OpenAI from 'openai';
import type { PresentationConfig, Presentation, ApiSettings } from '../types/presentation';
import { SYSTEM_PROMPT, buildUserPrompt, validatePresentation } from './aiPrompt';

export async function generatePresentation(
  config: PresentationConfig,
  apiSettings: ApiSettings,
  onProgress?: (pct: number) => void
): Promise<Presentation> {
  if (!apiSettings.apiKey) {
    throw new Error('No API key configured. Please add your API key in Settings.');
  }

  const client = new OpenAI({
    apiKey: apiSettings.apiKey,
    baseURL: apiSettings.baseUrl || 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': window.location.origin,
      'X-OpenRouter-Title': 'ai-ppt-forge',
    },
  });

  onProgress?.(10);

  const userPrompt = buildUserPrompt(config);

  onProgress?.(20);

  const response = await client.chat.completions.create({
    model: apiSettings.model || 'openai/gpt-4o',
    temperature: apiSettings.temperature ?? 0.7,
    max_tokens: 8000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
  });

  onProgress?.(70);

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('AI returned empty response. Please try again.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Try to extract JSON from response if wrapped in markdown
    const match = content.match(/\{[\s\S]+\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('AI returned invalid JSON. Please try again.');
    }
  }

  onProgress?.(85);

  const presentation = validatePresentation(parsed);

  onProgress?.(100);

  return presentation;
}

export async function regenerateSlide(
  slideContext: string,
  config: PresentationConfig,
  apiSettings: ApiSettings
): Promise<unknown> {
  if (!apiSettings.apiKey) {
    throw new Error('No API key configured.');
  }

  const client = new OpenAI({
    apiKey: apiSettings.apiKey,
    baseURL: apiSettings.baseUrl || 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': window.location.origin,
      'X-OpenRouter-Title': 'ai-ppt-forge',
    },
  });

  const response = await client.chat.completions.create({
    model: apiSettings.model || 'openai/gpt-4o',
    temperature: (apiSettings.temperature ?? 0.7) + 0.1,
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are an expert presentation designer. Regenerate the provided slide with fresh, improved content while keeping the same layout and topic. Return ONLY a valid JSON object for a single slide matching the schema: { id, layout, title, subtitle?, bullets?, bodyText?, leftColumn?, rightColumn?, chart?, imagePrompt?, notes? }`,
      },
      {
        role: 'user',
        content: `Regenerate this slide with better content for a ${config.tone} presentation targeting ${config.audience}:\n\n${slideContext}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');
  return JSON.parse(content);
}
