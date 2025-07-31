# TTS Copilot

**TTS Copilot** is a Node.js application that integrates GitHub Copilot-like functionality with text-to-speech (TTS) capabilities. The app converts code suggestions into audible speech, enhancing accessibility and providing a unique development experience.

## Features

- **Real-time Text-to-Speech**: Convert GitHub Copilot suggestions into audible speech
- **Configurable Voice Parameters**: Adjust pitch, speed, and volume of TTS output
- **GitHub Copilot Integration**: Seamless integration with GitHub Copilot API (placeholder implementation)
- **Modular Architecture**: Well-structured, maintainable codebase with clear separation of concerns
- **Comprehensive Testing**: Full test coverage for all core functionalities
- **TypeScript Support**: Type-safe development with full TypeScript support

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager
- Compatible TTS engine (automatically detected by the `say` library)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/sircountmaestro/tts-copilot.git
cd tts-copilot
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Running the Application

Start the TTS Copilot service:

```bash
npm start
```

Or for development with hot reload:

```bash
npm run dev
```

### Basic Usage

```typescript
import { TTSCopilot, TTSCopilotFactory } from 'tts-copilot';

// Create a TTS Copilot instance
const ttsCopilot = TTSCopilotFactory.createDefault();

// Initialize the service
await ttsCopilot.initialize();

// Start listening for Copilot suggestions
await ttsCopilot.start();

// Manually speak text
await ttsCopilot.speakText('Hello, this is TTS Copilot!');

// Configure voice parameters
ttsCopilot.updateVoiceConfig({
  pitch: 1.2,
  speed: 0.9,
  volume: 0.8
});
```

### Configuration

#### Voice Configuration

```typescript
const voiceConfig = {
  pitch: 1.0,    // Range: 0.0 - 2.0
  speed: 1.0,    // Range: 0.1 - 10.0  
  volume: 1.0,   // Range: 0.0 - 1.0
  voice: 'Alex'  // System-specific voice name (optional)
};

ttsCopilot.updateVoiceConfig(voiceConfig);
```

#### GitHub Copilot Integration

```typescript
const copilotConfig = {
  enabled: true,
  apiUrl: 'https://api.github.com/copilot',
  apiKey: 'your-api-key-here'
};

await ttsCopilot.updateCopilotConfig(copilotConfig);
```

## API Reference

### Core Classes

#### `TTSCopilot`

Main orchestration class that manages TTS and Copilot integration.

**Methods:**
- `initialize()`: Initialize the TTS Copilot service
- `start()`: Start listening for Copilot suggestions
- `stop()`: Stop the service
- `speakText(text: string)`: Manually convert text to speech
- `updateVoiceConfig(config: Partial<VoiceConfig>)`: Update voice settings
- `updateCopilotConfig(config: Partial<CopilotConfig>)`: Update Copilot settings
- `getAvailableVoices()`: Get list of available system voices

#### `TTSEngine`

Handles text-to-speech conversion and voice management.

**Methods:**
- `speak(text: string)`: Convert text to speech
- `stop()`: Stop current speech
- `setVoiceConfig(config: VoiceConfig)`: Update voice configuration
- `getAvailableVoices()`: Get available voices

#### `TextProcessor`

Utility class for text processing and cleaning.

**Static Methods:**
- `parseText(text: string)`: Clean and prepare text for TTS
- `isValidForTTS(text: string)`: Check if text is suitable for TTS

#### `CopilotIntegration`

Manages GitHub Copilot API integration (placeholder implementation).

**Methods:**
- `initialize(config)`: Initialize Copilot connection
- `startListening()`: Start listening for suggestions
- `stopListening()`: Stop listening
- `getSuggestions()`: Get current suggestions

### Configuration Interfaces

#### `VoiceConfig`
```typescript
interface VoiceConfig {
  pitch: number;     // 0.0 - 2.0
  speed: number;     // 0.1 - 10.0
  volume: number;    // 0.0 - 1.0
  voice?: string;    // Optional voice name
}
```

#### `TTSCopilotConfig`
```typescript
interface TTSCopilotConfig {
  voice: VoiceConfig;
  realTimeEnabled: boolean;
  copilot: {
    apiUrl?: string;
    apiKey?: string;
    enabled: boolean;
  };
}
```

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Run in development mode with hot reload
- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues automatically

### Project Structure

```
src/
├── config.ts              # Configuration management
├── tts-engine.ts          # Text-to-speech engine
├── copilot-integration.ts # GitHub Copilot integration
├── tts-copilot.ts        # Main orchestration class
├── index.ts              # Entry point and exports
└── types/
    └── say.d.ts          # Type definitions for say library

tests/
├── config.test.ts        # Configuration tests
├── tts-engine.test.ts    # TTS engine tests
├── copilot-integration.test.ts # Copilot integration tests
└── tts-copilot.test.ts   # Main class tests
```

### Testing

The project includes comprehensive tests for all core functionalities:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- config.test.ts
```

### Code Quality

- **TypeScript**: Full type safety and IntelliSense support
- **ESLint**: Code linting and style enforcement
- **Jest**: Testing framework with coverage reporting
- **Modular Design**: Clear separation of concerns

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Roadmap

- [ ] Real GitHub Copilot API integration
- [ ] VS Code extension
- [ ] Web interface for configuration
- [ ] Multiple TTS engine support
- [ ] Voice recognition for commands
- [ ] Custom voice models
- [ ] Audio effects and processing

## Support

For support, please open an issue on the GitHub repository or contact the maintainers.

---

**Note**: This is a demonstration project with a placeholder GitHub Copilot integration. In a production environment, you would need to implement actual GitHub Copilot API authentication and integration.