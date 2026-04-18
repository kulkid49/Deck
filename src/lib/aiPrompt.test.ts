import { describe, it, expect } from 'vitest';
import { buildUserPrompt, validatePresentation } from './aiPrompt';
import type { PresentationConfig } from '../types/presentation';

describe('aiPrompt', () => {
  describe('buildUserPrompt', () => {
    it('should generate a prompt with the correct title and tone', () => {
      const config: PresentationConfig = {
        title: 'Test Presentation',
        prompt: 'About tests',
        audience: 'General Public',
        slideCount: 5,
        tone: 'Professional',
        brandColors: { primary: '#000', accent: '#fff', background: '#ccc', text: '#000' }
      };
      const prompt = buildUserPrompt(config);
      expect(prompt).toContain('Test Presentation');
      expect(prompt).toContain('Professional');
      expect(prompt).toContain('5');
    });
  });

  describe('validatePresentation', () => {
    it('should validate a correct presentation object', () => {
      const data = {
        title: 'Valid Presentation',
        slides: [
          {
            id: '1',
            layout: 'title',
            title: 'Welcome'
          }
        ]
      };
      const validated = validatePresentation(data);
      expect(validated.title).toBe('Valid Presentation');
      expect(validated.slides).toHaveLength(1);
    });

    it('should throw error for invalid presentation', () => {
      const data = { title: 'Invalid' };
      expect(() => validatePresentation(data)).toThrow();
    });
  });
});
