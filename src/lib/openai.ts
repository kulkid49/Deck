import OpenAI from 'openai';
import type { PresentationConfig, Presentation, ApiSettings } from '../types/presentation';
import { SYSTEM_PROMPT, buildUserPrompt, validatePresentation } from './aiPrompt';

export async function generatePresentation(
  config: PresentationConfig,
  apiSettings: ApiSettings,
  onProgress?: (pct: number) => void
): Promise<Presentation> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || apiSettings.apiKey;
  
  if (!apiKey) {
    throw new Error('No API key configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  const client = new OpenAI({
    apiKey,
    baseURL: apiSettings.baseUrl || 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': 'https://kulkid49.github.io/qagentsol',
      'X-OpenRouter-Title': 'QAgent / QGPT',
    },
  });

  onProgress?.(10);

  const userPrompt = buildUserPrompt(config);

  onProgress?.(20);

  // Ensure model ID has a provider prefix for OpenRouter
  let modelId = apiSettings.model || 'openai/gpt-4o';
  if (!modelId.includes('/') && modelId !== 'auto') {
    if (modelId.startsWith('gpt-')) modelId = `openai/${modelId}`;
    else if (modelId.startsWith('claude-')) modelId = `anthropic/${modelId}`;
    else if (modelId.startsWith('gemini-')) modelId = `google/${modelId}`;
  }
  
  // Final safety for OpenRouter
  if (modelId === 'auto') modelId = 'openrouter/auto';

  // Some models on OpenRouter don't support response_format: { type: 'json_object' }
  const supportsJsonMode = 
    modelId.includes('openai/') || 
    modelId.includes('google/') ||
    modelId.includes('gpt-') ||
    modelId === 'openrouter/auto';

  try {
    const response = await client.chat.completions.create({
      model: modelId,
      temperature: apiSettings.temperature ?? 0.7,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      ...(supportsJsonMode ? { response_format: { type: 'json_object' } } : {}),
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
  } catch (error: any) {
    if (error?.status === 400) {
      console.error("❌ 400 Invalid Model ID or Request:", error);
      throw new Error(`OpenRouter Error (400): ${error?.message || "Invalid model ID. Please use a valid ID from openrouter.ai/models"}`);
    }
    throw error;
  }
}

export async function regenerateSlide(
  slideContext: string,
  config: PresentationConfig,
  apiSettings: ApiSettings
): Promise<unknown> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || apiSettings.apiKey;

  if (!apiKey) {
    throw new Error('No API key configured.');
  }

  const client = new OpenAI({
    apiKey,
    baseURL: apiSettings.baseUrl || 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': 'https://kulkid49.github.io/qagentsol',
      'X-OpenRouter-Title': 'QAgent / QGPT',
    },
  });

  // Ensure model ID has a provider prefix for OpenRouter
  let modelId = apiSettings.model || 'openai/gpt-4o';
  if (!modelId.includes('/') && modelId !== 'auto') {
    if (modelId.startsWith('gpt-')) modelId = `openai/${modelId}`;
    else if (modelId.startsWith('claude-')) modelId = `anthropic/${modelId}`;
    else if (modelId.startsWith('gemini-')) modelId = `google/${modelId}`;
  }
  
  if (modelId === 'auto') modelId = 'openrouter/auto';

  const supportsJsonMode = 
    modelId.includes('openai/') || 
    modelId.includes('google/') ||
    modelId.includes('gpt-') ||
    modelId === 'openrouter/auto';

  try {
    const response = await client.chat.completions.create({
      model: modelId,
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
      ...(supportsJsonMode ? { response_format: { type: 'json_object' } } : {}),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');
    return JSON.parse(content);
  } catch (error: any) {
    if (error?.status === 400) {
      console.error("❌ 400 Invalid Model ID or Request:", error);
      throw new Error(`OpenRouter Error (400): ${error?.message || "Invalid model ID. Please use a valid ID from openrouter.ai/models"}`);
    }
    throw error;
  }
}
