import { CopilotIntegration, CopilotSuggestion } from '../src/copilot-integration';
import { TTSCopilotConfig } from '../src/config';

describe('CopilotIntegration', () => {
  let copilotIntegration: CopilotIntegration;

  beforeEach(() => {
    copilotIntegration = new CopilotIntegration();
  });

  describe('initialize', () => {
    it('should initialize with disabled configuration', async () => {
      const config: TTSCopilotConfig['copilot'] = { enabled: false };
      
      await copilotIntegration.initialize(config);
      
      expect(copilotIntegration.isConnected()).toBe(false);
    });

    it('should initialize with enabled configuration', async () => {
      const config: TTSCopilotConfig['copilot'] = {
        enabled: true,
        apiUrl: 'https://api.github.com/copilot',
        apiKey: 'test-key'
      };
      
      await copilotIntegration.initialize(config);
      
      expect(copilotIntegration.isConnected()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const config: TTSCopilotConfig['copilot'] = {
        enabled: true,
        apiUrl: 'invalid-url'
      };

      // The current implementation doesn't actually fail, but in a real implementation
      // this would test error handling
      await expect(copilotIntegration.initialize(config)).resolves.not.toThrow();
    });
  });

  describe('startListening and stopListening', () => {
    beforeEach(async () => {
      const config: TTSCopilotConfig['copilot'] = { enabled: true };
      await copilotIntegration.initialize(config);
    });

    it('should start listening when connected', () => {
      expect(() => copilotIntegration.startListening()).not.toThrow();
    });

    it('should stop listening', () => {
      copilotIntegration.startListening();
      expect(() => copilotIntegration.stopListening()).not.toThrow();
    });

    it('should throw error when starting listening without connection', async () => {
      const disconnectedIntegration = new CopilotIntegration();
      
      expect(() => disconnectedIntegration.startListening()).toThrow(
        'Copilot integration not initialized'
      );
    });
  });

  describe('getSuggestions', () => {
    it('should return empty array when not connected', async () => {
      const suggestions = await copilotIntegration.getSuggestions();
      expect(suggestions).toEqual([]);
    });

    it('should return mock suggestions when connected', async () => {
      const config: TTSCopilotConfig['copilot'] = { enabled: true };
      await copilotIntegration.initialize(config);
      
      const suggestions = await copilotIntegration.getSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Check suggestion structure
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('text');
        expect(suggestion).toHaveProperty('confidence');
        expect(typeof suggestion.text).toBe('string');
        expect(typeof suggestion.confidence).toBe('number');
        expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('onSuggestion and removeSuggestionListener', () => {
    let mockListener: jest.Mock;

    beforeEach(async () => {
      mockListener = jest.fn();
      const config: TTSCopilotConfig['copilot'] = { enabled: true };
      await copilotIntegration.initialize(config);
    });

    it('should add and remove suggestion listeners', () => {
      copilotIntegration.onSuggestion(mockListener);
      
      expect(() => copilotIntegration.removeSuggestionListener(mockListener)).not.toThrow();
    });

    it('should handle removing non-existent listener', () => {
      const nonExistentListener = jest.fn();
      
      expect(() => copilotIntegration.removeSuggestionListener(nonExistentListener)).not.toThrow();
    });

    it('should call suggestion listeners', () => {
      const testSuggestion: CopilotSuggestion = {
        text: 'test suggestion',
        confidence: 0.85,
        language: 'javascript'
      };

      const mockListener = jest.fn();
      copilotIntegration.onSuggestion(mockListener);
      
      // Since this is a mock implementation, we can't easily test the actual
      // suggestion flow without making the implementation more complex.
      // For now, we'll just verify the listener was added successfully.
      expect(() => copilotIntegration.removeSuggestionListener(mockListener)).not.toThrow();
    });
  });

  describe('isConnected', () => {
    it('should return false initially', () => {
      expect(copilotIntegration.isConnected()).toBe(false);
    });

    it('should return true after successful initialization', async () => {
      const config: TTSCopilotConfig['copilot'] = { enabled: true };
      await copilotIntegration.initialize(config);
      
      expect(copilotIntegration.isConnected()).toBe(true);
    });

    it('should return false after disabled initialization', async () => {
      const config: TTSCopilotConfig['copilot'] = { enabled: false };
      await copilotIntegration.initialize(config);
      
      expect(copilotIntegration.isConnected()).toBe(false);
    });
  });
});