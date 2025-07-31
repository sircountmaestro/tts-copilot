import { ConfigManager, TTSCopilotConfig, VoiceConfig, DEFAULT_CONFIG } from './config';
import { TTSEngine, TextProcessor, ITTSEngine } from './tts-engine';
import { CopilotIntegration, ICopilotIntegration, CopilotSuggestion } from './copilot-integration';

/**
 * Main TTS Copilot application class
 * Orchestrates TTS functionality with GitHub Copilot integration
 */
export class TTSCopilot {
  private configManager: ConfigManager;
  private ttsEngine: ITTSEngine;
  private copilotIntegration: ICopilotIntegration;
  private isRunning: boolean = false;

  constructor(initialConfig?: Partial<TTSCopilotConfig>) {
    this.configManager = new ConfigManager(initialConfig);
    const config = this.configManager.getConfig();
    
    this.ttsEngine = new TTSEngine(config.voice);
    this.copilotIntegration = new CopilotIntegration();
  }

  /**
   * Initialize the TTS Copilot application
   */
  async initialize(): Promise<void> {
    const config = this.configManager.getConfig();
    
    try {
      // Initialize Copilot integration if enabled
      if (config.copilot.enabled) {
        await this.copilotIntegration.initialize(config.copilot);
      }
      
      console.log('TTS Copilot initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize TTS Copilot: ${(error as Error).message}`);
    }
  }

  /**
   * Start the TTS Copilot service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    const config = this.configManager.getConfig();
    
    this.isRunning = true;
    
    // Start Copilot listening if enabled and real-time is enabled
    if (config.copilot.enabled && config.realTimeEnabled) {
      this.copilotIntegration.onSuggestion(this.handleCopilotSuggestion.bind(this));
      this.copilotIntegration.startListening();
    }
    
    console.log('TTS Copilot started');
  }

  /**
   * Stop the TTS Copilot service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    // Stop TTS and Copilot services
    this.ttsEngine.stop();
    this.copilotIntegration.stopListening();
    
    console.log('TTS Copilot stopped');
  }

  /**
   * Manually speak text (bypassing Copilot)
   * @param text - Text to speak
   */
  async speakText(text: string): Promise<void> {
    const processedText = TextProcessor.parseText(text);
    
    if (!TextProcessor.isValidForTTS(processedText)) {
      throw new Error('Text is not suitable for TTS conversion');
    }

    await this.ttsEngine.speak(processedText);
  }

  /**
   * Get current configuration
   */
  getConfig(): TTSCopilotConfig {
    return this.configManager.getConfig();
  }

  /**
   * Update voice configuration
   * @param voiceConfig - New voice configuration
   */
  updateVoiceConfig(voiceConfig: Partial<VoiceConfig>): void {
    this.configManager.updateVoiceConfig(voiceConfig);
    this.ttsEngine.setVoiceConfig(this.configManager.getConfig().voice);
  }

  /**
   * Update Copilot configuration
   * @param copilotConfig - New Copilot configuration
   */
  async updateCopilotConfig(copilotConfig: Partial<TTSCopilotConfig['copilot']>): Promise<void> {
    this.configManager.updateCopilotConfig(copilotConfig);
    
    // Reinitialize Copilot integration if needed
    const config = this.configManager.getConfig();
    if (config.copilot.enabled) {
      await this.copilotIntegration.initialize(config.copilot);
    }
  }

  /**
   * Enable or disable real-time processing
   * @param enabled - Whether to enable real-time processing
   */
  setRealTimeEnabled(enabled: boolean): void {
    this.configManager.setRealTimeEnabled(enabled);
    
    if (enabled && this.isRunning) {
      const config = this.configManager.getConfig();
      if (config.copilot.enabled) {
        this.copilotIntegration.startListening();
      }
    } else {
      this.copilotIntegration.stopListening();
    }
  }

  /**
   * Get available voices from the TTS engine
   */
  async getAvailableVoices(): Promise<string[]> {
    return this.ttsEngine.getAvailableVoices();
  }

  /**
   * Get current Copilot suggestions
   */
  async getCurrentSuggestions(): Promise<CopilotSuggestion[]> {
    return this.copilotIntegration.getSuggestions();
  }

  /**
   * Check if Copilot is connected
   */
  isCopilotConnected(): boolean {
    return this.copilotIntegration.isConnected();
  }

  /**
   * Get current running status
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Handle incoming Copilot suggestions
   * @param suggestion - Copilot suggestion to process
   */
  private async handleCopilotSuggestion(suggestion: CopilotSuggestion): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const processedText = TextProcessor.parseText(suggestion.text);
      
      if (TextProcessor.isValidForTTS(processedText)) {
        console.log(`Speaking Copilot suggestion: ${processedText.substring(0, 50)}...`);
        await this.ttsEngine.speak(processedText);
      }
    } catch (error) {
      console.error('Error processing Copilot suggestion:', error);
    }
  }
}

/**
 * Factory for creating TTS Copilot instances
 */
export class TTSCopilotFactory {
  /**
   * Create a new TTS Copilot instance with default configuration
   */
  static createDefault(): TTSCopilot {
    return new TTSCopilot();
  }

  /**
   * Create a new TTS Copilot instance with custom configuration
   * @param config - Initial configuration
   */
  static createWithConfig(config: Partial<TTSCopilotConfig>): TTSCopilot {
    return new TTSCopilot(config);
  }
}

export { TTSCopilotConfig, VoiceConfig, CopilotSuggestion, DEFAULT_CONFIG };