// Type definitions for the 'say' library
declare module 'say' {
  interface SayCallbackOptions {
    voice?: string;
    speed?: number;
  }

  interface SayCallback {
    (error?: Error | null): void;
  }

  interface VoicesCallback {
    (error?: Error | null, voices?: string[]): void;
  }

  export function speak(text: string, voice?: string | null, speed?: number, callback?: SayCallback): any;
  export function stop(): void;
  export function getInstalledVoices(callback: VoicesCallback): void;
}