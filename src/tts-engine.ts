import * as say from 'say';
import { VoiceConfig } from './config';

/**
 * TTS Engine interface for text-to-speech conversion
 */
export interface ITTSEngine {
  speak(text: string): Promise<void>;
  setVoiceConfig(config: VoiceConfig): void;
  getAvailableVoices(): Promise<string[]>;
  stop(): void;
}

/**
 * Text-to-Speech engine implementation using the 'say' library
 */
export class TTSEngine implements ITTSEngine {
  private voiceConfig: VoiceConfig;
  private currentProcess: any = null;

  constructor(initialConfig: VoiceConfig) {
    this.voiceConfig = { ...initialConfig };
  }

  /**
   * Convert text to speech
   * @param text - Text to be spoken
   */
  async speak(text: string): Promise<void> {
    if (!text || text.trim().length === 0) {
      return;
    }

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        // Prepare options for the say library
        const options: any = {
          voice: this.voiceConfig.voice,
          speed: Math.round(this.voiceConfig.speed * 200), // Convert to words per minute
        };

        // Clean the options object - remove undefined values
        Object.keys(options).forEach(key => {
          if (options[key] === undefined) {
            delete options[key];
          }
        });

        // Use say library to speak the text
        this.currentProcess = say.speak(text, options.voice || null, options.speed || 1.0, (error: any) => {
          this.currentProcess = null;
          if (error) {
            reject(new Error(`TTS Error: ${error.message}`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(new Error(`TTS Error: ${(error as Error).message}`));
      }
    });
  }

  /**
   * Update voice configuration
   * @param config - New voice configuration
   */
  setVoiceConfig(config: VoiceConfig): void {
    this.voiceConfig = { ...config };
  }

  /**
   * Get list of available voices on the system
   */
  async getAvailableVoices(): Promise<string[]> {
    return new Promise((resolve) => {
      try {
        (say as any).getInstalledVoices((error: any, voices: any) => {
          if (error || !voices) {
            resolve([]);
          } else {
            resolve(voices);
          }
        });
      } catch (error) {
        resolve([]);
      }
    });
  }

  /**
   * Stop current speech synthesis
   */
  stop(): void {
    if (this.currentProcess) {
      try {
        say.stop();
        this.currentProcess = null;
      } catch (error) {
        // Ignore stop errors
      }
    }
  }

  /**
   * Get current voice configuration
   */
  getVoiceConfig(): VoiceConfig {
    return { ...this.voiceConfig };
  }
}

/**
 * Text processor for parsing and cleaning text before TTS
 */
export class TextProcessor {
  /**
   * Parse and clean text for TTS conversion
   * @param rawText - Raw input text
   * @returns Cleaned text ready for TTS
   */
  static parseText(rawText: string): string {
    if (!rawText) {
      return '';
    }

    // Remove code blocks (markdown style)
    let cleanText = rawText.replace(/```[\s\S]*?```/g, '');
    
    // Remove inline code
    cleanText = cleanText.replace(/`[^`]*`/g, '');
    
    // Remove excessive whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // Remove special characters that might interfere with TTS
    cleanText = cleanText.replace(/[^\w\s.,!?;:()-]/g, '');
    
    return cleanText;
  }

  /**
   * Check if text is suitable for TTS (not too long, contains meaningful content)
   * @param text - Text to validate
   * @returns True if text is suitable for TTS
   */
  static isValidForTTS(text: string): boolean {
    if (!text || text.trim().length === 0) {
      return false;
    }

    // Check length constraints
    if (text.length > 1000) {
      return false;
    }

    // Check if text contains mostly meaningful words
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.length > 0;
  }
}