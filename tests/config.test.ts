import { ConfigManager, DEFAULT_CONFIG, VoiceConfig, TTSCopilotConfig } from '../src/config';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const config = configManager.getConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<TTSCopilotConfig> = {
        voice: { pitch: 1.5, speed: 0.8, volume: 0.9 },
        realTimeEnabled: false
      };
      
      const customConfigManager = new ConfigManager(customConfig);
      const config = customConfigManager.getConfig();
      
      expect(config.voice.pitch).toBe(1.5);
      expect(config.voice.speed).toBe(0.8);
      expect(config.voice.volume).toBe(0.9);
      expect(config.realTimeEnabled).toBe(false);
    });
  });

  describe('updateVoiceConfig', () => {
    it('should update voice configuration', () => {
      const newVoiceConfig: Partial<VoiceConfig> = {
        pitch: 1.2,
        speed: 1.5
      };

      configManager.updateVoiceConfig(newVoiceConfig);
      const config = configManager.getConfig();

      expect(config.voice.pitch).toBe(1.2);
      expect(config.voice.speed).toBe(1.5);
      expect(config.voice.volume).toBe(DEFAULT_CONFIG.voice.volume); // unchanged
    });

    it('should validate pitch range', () => {
      expect(() => {
        configManager.updateVoiceConfig({ pitch: -0.1 });
      }).toThrow('Pitch must be between 0.0 and 2.0');

      expect(() => {
        configManager.updateVoiceConfig({ pitch: 2.1 });
      }).toThrow('Pitch must be between 0.0 and 2.0');
    });

    it('should validate speed range', () => {
      expect(() => {
        configManager.updateVoiceConfig({ speed: 0.05 });
      }).toThrow('Speed must be between 0.1 and 10.0');

      expect(() => {
        configManager.updateVoiceConfig({ speed: 10.1 });
      }).toThrow('Speed must be between 0.1 and 10.0');
    });

    it('should validate volume range', () => {
      expect(() => {
        configManager.updateVoiceConfig({ volume: -0.1 });
      }).toThrow('Volume must be between 0.0 and 1.0');

      expect(() => {
        configManager.updateVoiceConfig({ volume: 1.1 });
      }).toThrow('Volume must be between 0.0 and 1.0');
    });
  });

  describe('updateCopilotConfig', () => {
    it('should update Copilot configuration', () => {
      const newCopilotConfig = {
        enabled: true,
        apiUrl: 'https://api.example.com',
        apiKey: 'test-key'
      };

      configManager.updateCopilotConfig(newCopilotConfig);
      const config = configManager.getConfig();

      expect(config.copilot.enabled).toBe(true);
      expect(config.copilot.apiUrl).toBe('https://api.example.com');
      expect(config.copilot.apiKey).toBe('test-key');
    });
  });

  describe('setRealTimeEnabled', () => {
    it('should set real-time enabled status', () => {
      configManager.setRealTimeEnabled(false);
      expect(configManager.getConfig().realTimeEnabled).toBe(false);

      configManager.setRealTimeEnabled(true);
      expect(configManager.getConfig().realTimeEnabled).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the configuration', () => {
      const config1 = configManager.getConfig();
      const config2 = configManager.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // different objects
    });
  });
});