import { describe, it, expect, vi } from 'vitest';
import { generatePresentation } from './openai';
import type { PresentationConfig, ApiSettings } from '../types/presentation';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: 'Mocked Presentation',
                    slides: [{ id: '1', layout: 'title', title: 'Mocked Slide' }]
                  })
                }
              }
            ]
          })
        }
      }
    }))
  };
});

describe('openai', () => {
  describe('generatePresentation', () => {
    it('should generate a presentation successfully', async () => {
      const config: PresentationConfig = {
        title: 'Mock Test',
        prompt: 'Mock test prompt',
        audience: 'General Public',
        slideCount: 1,
        tone: 'Professional',
        brandColors: { primary: '#000', accent: '#fff', background: '#ccc', text: '#000' }
      };
      const apiSettings: ApiSettings = {
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        temperature: 0.7
      };

      const result = await generatePresentation(config, apiSettings);
      expect(result.title).toBe('Mocked Presentation');
      expect(result.slides).toHaveLength(1);
    });

    it('should throw error if apiKey is missing', async () => {
      const config: PresentationConfig = {
        title: 'Mock Test',
        prompt: 'Mock test prompt',
        audience: 'General Public',
        slideCount: 1,
        tone: 'Professional',
        brandColors: { primary: '#000', accent: '#fff', background: '#ccc', text: '#000' }
      };
      const apiSettings: ApiSettings = {
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        temperature: 0.7
      };

      await expect(generatePresentation(config, apiSettings)).rejects.toThrow('No API key configured');
    });
  });
});
