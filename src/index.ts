#!/usr/bin/env node

import { TTSCopilot, TTSCopilotFactory } from './tts-copilot';
import { DEFAULT_CONFIG } from './config';

/**
 * Main entry point for TTS Copilot application
 */
async function main() {
  console.log('🎤 TTS Copilot - GitHub Copilot with Text-to-Speech');
  console.log('================================================');

  try {
    // Create TTS Copilot instance
    const ttsCopilot = TTSCopilotFactory.createDefault();
    
    // Initialize the application
    await ttsCopilot.initialize();
    
    // Display configuration
    const config = ttsCopilot.getConfig();
    console.log('Configuration:');
    console.log(`- Voice Pitch: ${config.voice.pitch}`);
    console.log(`- Voice Speed: ${config.voice.speed}`);
    console.log(`- Voice Volume: ${config.voice.volume}`);
    console.log(`- Real-time Enabled: ${config.realTimeEnabled}`);
    console.log(`- Copilot Enabled: ${config.copilot.enabled}`);
    
    // Get available voices
    const voices = await ttsCopilot.getAvailableVoices();
    console.log(`- Available Voices: ${voices.length > 0 ? voices.join(', ') : 'Default system voice'}`);
    
    // Demo functionality
    console.log('\n🔊 Testing TTS functionality...');
    await ttsCopilot.speakText('Hello! TTS Copilot is now running and ready to convert GitHub Copilot suggestions into speech.');
    
    // Start the service
    await ttsCopilot.start();
    
    console.log('\n✅ TTS Copilot is running!');
    console.log('Press Ctrl+C to stop the service.');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Stopping TTS Copilot...');
      ttsCopilot.stop();
      process.exit(0);
    });
    
    // Keep the process running
    setInterval(() => {
      // Check service status
      if (!ttsCopilot.isServiceRunning()) {
        console.log('Service stopped unexpectedly');
        process.exit(1);
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ Error starting TTS Copilot:', (error as Error).message);
    process.exit(1);
  }
}

// Export main components for use as a library
export {
  TTSCopilot,
  TTSCopilotFactory,
  DEFAULT_CONFIG
} from './tts-copilot';

export {
  ConfigManager,
  VoiceConfig,
  TTSCopilotConfig
} from './config';

export {
  TTSEngine,
  TextProcessor,
  ITTSEngine
} from './tts-engine';

export {
  CopilotIntegration,
  ICopilotIntegration,
  CopilotSuggestion
} from './copilot-integration';

// Run main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}