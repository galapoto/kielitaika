// frontend/app/services/tts.ts

import { WS_API_BASE } from "../config/backend";
import { playAudioBuffer, stopPlaybackImmediately } from "../components/AudioPlayer";

let activeSocket: WebSocket | null = null;
let isSpeaking = false;

/**
 * HARD GUARANTEES
 * - One TTS stream at a time
 * - Playback lifecycle strictly bounded
 * - Socket always closed
 */

export async function speak(
  text: string,
  voice: "professional" | "friendly" = "professional",
  {
    onStart,
    onEnd,
    onError,
  }: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
) {
  if (!text || !text.trim()) return;

  if (isSpeaking) {
    await forceStopSpeaking();
  }

  isSpeaking = true;

  const wsUrl = `${WS_API_BASE}/voice/tts-stream`;
  let audioChunks: Uint8Array[] = [];

  if (__DEV__) {
    console.log("[TTS] WebSocket URL:", wsUrl);
  }

  try {
    const ws = new WebSocket(wsUrl);
    activeSocket = ws;
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      if (__DEV__) console.log("[TTS] WebSocket onOpen");
      ws.send(JSON.stringify({ text, voice }));
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);

        if (msg.type === "tts_start") {
          if (__DEV__) console.log("[TTS] tts_start", msg);
          onStart?.();
        }

        if (msg.type === "tts_error") {
          throw new Error(msg.message || "TTS backend error");
        }

        if (msg.type === "tts_end") {
          if (__DEV__) console.log("[TTS] tts_end");
          await flushAndPlay();
          return;
        }
      }

      if (event.data instanceof ArrayBuffer) {
        audioChunks.push(new Uint8Array(event.data));
        if (__DEV__) console.log("[TTS] chunk bytes", event.data.byteLength);
      }
    };

    ws.onerror = (err) => {
      throw err;
    };

    ws.onclose = (e) => {
      if (__DEV__) console.log("[TTS] WebSocket onClose", e.code, e.reason);
    };

    async function flushAndPlay() {
      if (!audioChunks.length) {
        cleanup();
        onEnd?.();
        return;
      }

      const merged = mergeChunks(audioChunks);
      audioChunks = [];

      await playAudioBuffer(merged, {
        onStart: () => {
          if (__DEV__) console.log("[TTS] Playback started");
        },
        onEnd: async () => {
          cleanup();
          onEnd?.();
        },
        onError: async (err) => {
          cleanup();
          onError?.(err);
        },
      });
    }
  } catch (err) {
    cleanup();
    onError?.(err);
  }
}

export async function forceStopSpeaking() {
  cleanup();
  await stopPlaybackImmediately();
}

function cleanup() {
  if (activeSocket) {
    try {
      activeSocket.close();
    } catch {}
    activeSocket = null;
  }
  isSpeaking = false;
}

function mergeChunks(chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
}

export function isCurrentlySpeaking() {
  return isSpeaking;
}

