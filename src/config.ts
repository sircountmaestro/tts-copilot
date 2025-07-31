/**
 * Configuration interface for TTS voice parameters
 */
export interface VoiceConfig {
  /** Voice pitch (0.0 - 2.0, default: 1.0) */
  pitch: number;
  
  /** Voice speed/rate (0.1 - 10.0, default: 1.0) */
  speed: number;
  
  /** Voice volume (0.0 - 1.0, default: 1.0) */
  volume: number;
  
  /** Voice name/identifier (system-dependent) */
  voice?: string;
}

/**
 * Configuration for TTS Copilot application
 */
export interface TTSCopilotConfig {
  /** Voice configuration */
  voice: VoiceConfig;
  
  /** Enable/disable real-time text parsing */
  realTimeEnabled: boolean;
  
  /** GitHub Copilot API settings */
  copilot: {
    /** API endpoint URL */
    apiUrl?: string;
    
    /** API key for authentication */
    apiKey?: string;
    
    /** Enable Copilot integration */
    enabled: boolean;
  };
}

/**
 * Default configuration for TTS Copilot
 */
export const DEFAULT_CONFIG: TTSCopilotConfig = {
  voice: {
    pitch: 1.0,
    speed: 1.0,
    volume: 1.0,
  },
  realTimeEnabled: true,
  copilot: {
    enabled: false,
  },
};

/**
 * Configuration manager for TTS Copilot
 */
export class ConfigManager {
  private config: TTSCopilotConfig;

  constructor(initialConfig?: Partial<TTSCopilotConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): TTSCopilotConfig {
    return { ...this.config };
  }

  /**
   * Update voice configuration
   */
  updateVoiceConfig(voiceConfig: Partial<VoiceConfig>): void {
    this.config.voice = { ...this.config.voice, ...voiceConfig };
    this.validateVoiceConfig();
  }

  /**
   * Update Copilot configuration
   */
  updateCopilotConfig(copilotConfig: Partial<TTSCopilotConfig['copilot']>): void {
    this.config.copilot = { ...this.config.copilot, ...copilotConfig };
  }

  /**
   * Set real-time parsing enabled/disabled
   */
  setRealTimeEnabled(enabled: boolean): void {
    this.config.realTimeEnabled = enabled;
  }

  /**
   * Validate voice configuration parameters
   */
  private validateVoiceConfig(): void {
    const { pitch, speed, volume } = this.config.voice;
    
    if (pitch < 0.0 || pitch > 2.0) {
      throw new Error('Pitch must be between 0.0 and 2.0');
    }
    
    if (speed < 0.1 || speed > 10.0) {
      throw new Error('Speed must be between 0.1 and 10.0');
    }
    
    if (volume < 0.0 || volume > 1.0) {
      throw new Error('Volume must be between 0.0 and 1.0');
    }
  }
}