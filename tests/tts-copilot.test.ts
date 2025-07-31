import { TTSCopilot, TTSCopilotFactory } from '../src/tts-copilot';
import { TTSCopilotConfig, VoiceConfig } from '../src/config';

// Mock the say library
jest.mock('say', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getInstalledVoices: jest.fn()
}));

describe('TTSCopilot', () => {
  let ttsCopilot: TTSCopilot;

  beforeEach(() => {
    ttsCopilot = new TTSCopilot();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const config = ttsCopilot.getConfig();
      expect(config.voice.pitch).toBe(1.0);
      expect(config.voice.speed).toBe(1.0);
      expect(config.voice.volume).toBe(1.0);
      expect(config.realTimeEnabled).toBe(true);
      expect(config.copilot.enabled).toBe(false);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<TTSCopilotConfig> = {
        voice: { pitch: 1.5, speed: 0.8, volume: 0.9 },
        realTimeEnabled: false
      };
      
      const customTTSCopilot = new TTSCopilot(customConfig);
      const config = customTTSCopilot.getConfig();
      
      expect(config.voice.pitch).toBe(1.5);
      expect(config.voice.speed).toBe(0.8);
      expect(config.voice.volume).toBe(0.9);
      expect(config.realTimeEnabled).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully with default config', async () => {
      await expect(ttsCopilot.initialize()).resolves.not.toThrow();
    });

    it('should initialize with Copilot enabled', async () => {
      const configWithCopilot = new TTSCopilot({
        copilot: { enabled: true }
      });
      
      await expect(configWithCopilot.initialize()).resolves.not.toThrow();
    });
  });

  describe('start and stop', () => {
    beforeEach(async () => {
      await ttsCopilot.initialize();
    });

    it('should start service', async () => {
      await ttsCopilot.start();
      expect(ttsCopilot.isServiceRunning()).toBe(true);
    });

    it('should stop service', async () => {
      await ttsCopilot.start();
      ttsCopilot.stop();
      expect(ttsCopilot.isServiceRunning()).toBe(false);
    });

    it('should not start if already running', async () => {
      await ttsCopilot.start();
      await ttsCopilot.start(); // Second call should not throw
      expect(ttsCopilot.isServiceRunning()).toBe(true);
    });

    it('should not stop if not running', () => {
      ttsCopilot.stop();
      expect(ttsCopilot.isServiceRunning()).toBe(false);
    });
  });

  describe('speakText', () => {
    const say = require('say');

    beforeEach(() => {
      say.speak.mockImplementation((text: string, voice: string, speed: number, callback: Function) => {
        setTimeout(() => callback(null), 10);
        return {};
      });
    });

    it('should speak valid text', async () => {
      await ttsCopilot.speakText('Hello world');
      expect(say.speak).toHaveBeenCalled();
    });

    it('should reject invalid text', async () => {
      await expect(ttsCopilot.speakText('')).rejects.toThrow(
        'Text is not suitable for TTS conversion'
      );
    });

    it('should reject text that is too long', async () => {
      const longText = 'a'.repeat(1001);
      await expect(ttsCopilot.speakText(longText)).rejects.toThrow(
        'Text is not suitable for TTS conversion'
      );
    });

    it('should process and clean text before speaking', async () => {
      await ttsCopilot.speakText('Code: ```console.log("hello")``` end');
      
      expect(say.speak).toHaveBeenCalledWith(
        'Code: end',
        null,
        200,
        expect.any(Function)
      );
    });
  });

  describe('updateVoiceConfig', () => {
    it('should update voice configuration', () => {
      const newVoiceConfig: Partial<VoiceConfig> = {
        pitch: 1.2,
        speed: 1.5
      };

      ttsCopilot.updateVoiceConfig(newVoiceConfig);
      const config = ttsCopilot.getConfig();

      expect(config.voice.pitch).toBe(1.2);
      expect(config.voice.speed).toBe(1.5);
    });

    it('should validate voice configuration', () => {
      expect(() => {
        ttsCopilot.updateVoiceConfig({ pitch: -0.1 });
      }).toThrow('Pitch must be between 0.0 and 2.0');
    });
  });

  describe('updateCopilotConfig', () => {
    it('should update Copilot configuration', async () => {
      const newCopilotConfig = {
        enabled: true,
        apiUrl: 'https://api.example.com'
      };

      await ttsCopilot.updateCopilotConfig(newCopilotConfig);
      const config = ttsCopilot.getConfig();

      expect(config.copilot.enabled).toBe(true);
      expect(config.copilot.apiUrl).toBe('https://api.example.com');
    });
  });

  describe('setRealTimeEnabled', () => {
    beforeEach(async () => {
      await ttsCopilot.initialize();
    });

    it('should enable real-time processing', () => {
      ttsCopilot.setRealTimeEnabled(true);
      expect(ttsCopilot.getConfig().realTimeEnabled).toBe(true);
    });

    it('should disable real-time processing', () => {
      ttsCopilot.setRealTimeEnabled(false);
      expect(ttsCopilot.getConfig().realTimeEnabled).toBe(false);
    });
  });

  describe('getAvailableVoices', () => {
    const say = require('say');

    it('should return available voices', async () => {
      const mockVoices = ['voice1', 'voice2'];
      (say as any).getInstalledVoices.mockImplementation((callback: Function) => {
        callback(null, mockVoices);
      });

      const voices = await ttsCopilot.getAvailableVoices();
      expect(voices).toEqual(mockVoices);
    });
  });

  describe('getCurrentSuggestions', () => {
    it('should return current suggestions', async () => {
      const suggestions = await ttsCopilot.getCurrentSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('isCopilotConnected', () => {
    it('should return Copilot connection status', () => {
      const connected = ttsCopilot.isCopilotConnected();
      expect(typeof connected).toBe('boolean');
    });
  });

  describe('isServiceRunning', () => {
    it('should return service running status', async () => {
      expect(ttsCopilot.isServiceRunning()).toBe(false);
      
      await ttsCopilot.initialize();
      await ttsCopilot.start();
      expect(ttsCopilot.isServiceRunning()).toBe(true);
      
      ttsCopilot.stop();
      expect(ttsCopilot.isServiceRunning()).toBe(false);
    });
  });
});

describe('TTSCopilotFactory', () => {
  describe('createDefault', () => {
    it('should create TTSCopilot with default configuration', () => {
      const ttsCopilot = TTSCopilotFactory.createDefault();
      const config = ttsCopilot.getConfig();
      
      expect(config.voice.pitch).toBe(1.0);
      expect(config.voice.speed).toBe(1.0);
      expect(config.voice.volume).toBe(1.0);
    });
  });

  describe('createWithConfig', () => {
    it('should create TTSCopilot with custom configuration', () => {
      const customConfig: Partial<TTSCopilotConfig> = {
        voice: { pitch: 1.5, speed: 0.8, volume: 0.9 }
      };
      
      const ttsCopilot = TTSCopilotFactory.createWithConfig(customConfig);
      const config = ttsCopilot.getConfig();
      
      expect(config.voice.pitch).toBe(1.5);
      expect(config.voice.speed).toBe(0.8);
      expect(config.voice.volume).toBe(0.9);
    });
  });
});