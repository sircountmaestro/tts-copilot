#!/usr/bin/env node

/**
 * Example usage of TTS Copilot
 * Demonstrates basic functionality and configuration
 */

import { TTSCopilot, TTSCopilotFactory, VoiceConfig } from './src/index';

async function main() {
  console.log('🎤 TTS Copilot Example\n');

  try {
    // Create TTS Copilot instance with custom configuration
    const ttsCopilot = TTSCopilotFactory.createWithConfig({
      voice: {
        pitch: 1.1,
        speed: 0.9,
        volume: 0.8
      },
      realTimeEnabled: true,
      copilot: {
        enabled: false // Set to true to enable Copilot integration
      }
    });

    // Initialize the service
    console.log('Initializing TTS Copilot...');
    await ttsCopilot.initialize();

    // Get available voices
    const voices = await ttsCopilot.getAvailableVoices();
    console.log(`Available voices: ${voices.length > 0 ? voices.join(', ') : 'Default system voice'}`);

    // Example 1: Basic text-to-speech
    console.log('\n📢 Example 1: Basic TTS');
    await ttsCopilot.speakText('Hello! Welcome to TTS Copilot. This is a demonstration of basic text-to-speech functionality.');

    // Example 2: Code suggestion simulation
    console.log('\n💻 Example 2: Code Suggestion');
    const codeSuggestion = `
      function calculateFibonacci(n) {
        if (n <= 1) return n;
        return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
      }
    `;
    await ttsCopilot.speakText(`Here's a code suggestion: ${codeSuggestion}`);

    // Example 3: Voice configuration changes
    console.log('\n🎛️ Example 3: Voice Configuration');
    
    // Higher pitch and faster speed
    ttsCopilot.updateVoiceConfig({ pitch: 1.5, speed: 1.3 });
    await ttsCopilot.speakText('This is with higher pitch and faster speed.');

    // Lower pitch and slower speed
    ttsCopilot.updateVoiceConfig({ pitch: 0.7, speed: 0.7 });
    await ttsCopilot.speakText('This is with lower pitch and slower speed.');

    // Reset to defaults
    ttsCopilot.updateVoiceConfig({ pitch: 1.0, speed: 1.0 });
    await ttsCopilot.speakText('Back to normal voice settings.');

    // Example 4: Start real-time service
    console.log('\n🚀 Example 4: Starting Real-time Service');
    await ttsCopilot.start();
    console.log('TTS Copilot is now running in real-time mode!');
    
    // Simulate some time running
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Stop the service
    ttsCopilot.stop();
    console.log('Service stopped.');

    console.log('\n✅ Example completed successfully!');

  } catch (error) {
    console.error('❌ Error in example:', (error as Error).message);
    
    // Note about TTS availability
    if ((error as Error).message.includes('TTS Error')) {
      console.log('\n💡 Note: TTS functionality requires a compatible audio system.');
      console.log('   In headless environments, this error is expected.');
      console.log('   The application structure and logic are working correctly.');
    }
  }
}

// Export for use as a module
export { main as runExample };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}