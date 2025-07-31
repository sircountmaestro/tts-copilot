import { TextProcessor, TTSEngine } from '../src/tts-engine';
import { VoiceConfig } from '../src/config';

// Mock the say library
jest.mock('say', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getInstalledVoices: jest.fn()
}));

describe('TextProcessor', () => {
  describe('parseText', () => {
    it('should return empty string for null/undefined input', () => {
      expect(TextProcessor.parseText('')).toBe('');
      expect(TextProcessor.parseText(null as any)).toBe('');
      expect(TextProcessor.parseText(undefined as any)).toBe('');
    });

    it('should remove code blocks', () => {
      const input = 'Some text ```code block``` more text';
      const result = TextProcessor.parseText(input);
      expect(result).toBe('Some text more text');
    });

    it('should remove inline code', () => {
      const input = 'Use the `console.log()` function here';
      const result = TextProcessor.parseText(input);
      expect(result).toBe('Use the function here');
    });

    it('should normalize whitespace', () => {
      const input = 'Text   with    excessive     whitespace';
      const result = TextProcessor.parseText(input);
      expect(result).toBe('Text with excessive whitespace');
    });

    it('should remove special characters', () => {
      const input = 'Text with @#$% special & characters*';
      const result = TextProcessor.parseText(input);
      expect(result).toBe('Text with  special  characters');
    });

    it('should preserve punctuation', () => {
      const input = 'Hello, world! How are you? Fine.';
      const result = TextProcessor.parseText(input);
      expect(result).toBe('Hello, world! How are you? Fine.');
    });
  });

  describe('isValidForTTS', () => {
    it('should return false for empty or null text', () => {
      expect(TextProcessor.isValidForTTS('')).toBe(false);
      expect(TextProcessor.isValidForTTS('   ')).toBe(false);
      expect(TextProcessor.isValidForTTS(null as any)).toBe(false);
      expect(TextProcessor.isValidForTTS(undefined as any)).toBe(false);
    });

    it('should return false for very long text', () => {
      const longText = 'a'.repeat(1001);
      expect(TextProcessor.isValidForTTS(longText)).toBe(false);
    });

    it('should return true for valid text', () => {
      expect(TextProcessor.isValidForTTS('Hello world')).toBe(true);
      expect(TextProcessor.isValidForTTS('function test() { return true; }')).toBe(true);
    });

    it('should return true for text up to 1000 characters', () => {
      const maxLengthText = 'a'.repeat(1000);
      expect(TextProcessor.isValidForTTS(maxLengthText)).toBe(true);
    });
  });
});

describe('TTSEngine', () => {
  let ttsEngine: TTSEngine;
  let mockVoiceConfig: VoiceConfig;
  const say = require('say');

  beforeEach(() => {
    mockVoiceConfig = {
      pitch: 1.0,
      speed: 1.0,
      volume: 1.0,
      voice: 'default'
    };
    ttsEngine = new TTSEngine(mockVoiceConfig);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with voice configuration', () => {
      const config = ttsEngine.getVoiceConfig();
      expect(config).toEqual(mockVoiceConfig);
    });
  });

  describe('speak', () => {
    it('should not speak empty text', async () => {
      await ttsEngine.speak('');
      expect(say.speak).not.toHaveBeenCalled();
    });

    it('should not speak whitespace-only text', async () => {
      await ttsEngine.speak('   ');
      expect(say.speak).not.toHaveBeenCalled();
    });

    it('should speak valid text', async () => {
      // Mock successful speech
      say.speak.mockImplementation((text: string, voice: string, speed: number, callback: Function) => {
        setTimeout(() => callback(null), 10);
        return {};
      });

      await ttsEngine.speak('Hello world');
      
      expect(say.speak).toHaveBeenCalledWith(
        'Hello world',
        'default',
        200, // 1.0 * 200
        expect.any(Function)
      );
    });

    it('should handle TTS errors', async () => {
      // Mock speech error
      say.speak.mockImplementation((text: string, voice: string, speed: number, callback: Function) => {
        setTimeout(() => callback(new Error('TTS failed')), 10);
        return {};
      });

      await expect(ttsEngine.speak('Hello world')).rejects.toThrow('TTS Error: TTS failed');
    });

    it('should stop current speech before starting new one', async () => {
      // Mock ongoing speech with callback
      say.speak.mockImplementation((text: string, voice: string, speed: number, callback: Function) => {
        setTimeout(() => callback(null), 10);
        return {};
      });

      // Start first speech (don't await)
      ttsEngine.speak('First text');
      
      // Start second speech (this should stop the first)
      await ttsEngine.speak('Second text');
      
      expect(say.stop).toHaveBeenCalled();
    });
  });

  describe('setVoiceConfig', () => {
    it('should update voice configuration', () => {
      const newConfig: VoiceConfig = {
        pitch: 1.5,
        speed: 0.8,
        volume: 0.9,
        voice: 'female'
      };

      ttsEngine.setVoiceConfig(newConfig);
      const config = ttsEngine.getVoiceConfig();
      
      expect(config).toEqual(newConfig);
    });
  });

  describe('getAvailableVoices', () => {
    it('should return available voices', async () => {
      const mockVoices = ['voice1', 'voice2', 'voice3'];
      (say as any).getInstalledVoices.mockImplementation((callback: Function) => {
        callback(null, mockVoices);
      });

      const voices = await ttsEngine.getAvailableVoices();
      expect(voices).toEqual(mockVoices);
    });

    it('should return empty array on error', async () => {
      (say as any).getInstalledVoices.mockImplementation((callback: Function) => {
        callback(new Error('Failed to get voices'), null);
      });

      const voices = await ttsEngine.getAvailableVoices();
      expect(voices).toEqual([]);
    });
  });

  describe('stop', () => {
    it('should stop current speech', () => {
      // Set up a mock current process first
      ttsEngine['currentProcess'] = { mock: 'process' };
      
      ttsEngine.stop();
      expect(say.stop).toHaveBeenCalled();
    });

    it('should handle stop errors gracefully', () => {
      say.stop.mockImplementation(() => {
        throw new Error('Stop failed');
      });

      expect(() => ttsEngine.stop()).not.toThrow();
    });
  });

  describe('getVoiceConfig', () => {
    it('should return a copy of voice configuration', () => {
      const config1 = ttsEngine.getVoiceConfig();
      const config2 = ttsEngine.getVoiceConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // different objects
    });
  });
});