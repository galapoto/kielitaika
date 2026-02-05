import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

import { playAudioBuffer, stopPlaybackImmediately } from "../components/AudioPlayer";
import {
  updateAiLiveTranscript,
  finalizeAiTranscript,
} from "../utils/speakingAttempts";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const WS_BASE = API_BASE ? API_BASE.replace(/^http/, "ws") : null;

/**
 * TTS STATE (module-local, single stream at a time)
 */
let ws: WebSocket | null = null;
let isSpeaking = false;
let audioChunks: Uint8Array[] = [];
let activeSessionId: string | null = null;
let activeTurnIndex: number | null = null;

/**
 * Hard reset of all TTS state
 */
function resetState() {
  ws = null;
  isSpeaking = false;
  audioChunks = [];
  activeSessionId = null;
  activeTurnIndex = null;
}

/**
 * Convert Uint8Array chunks → base64 wav/opus URI
 */
async function chunksToPlayableUri(chunks: Uint8Array[]): Promise<string> {
  const combined = chunks.reduce((acc, cur) => {
    const merged = new Uint8Array(acc.length + cur.length);
    merged.set(acc, 0);
    merged.set(cur, acc.length);
    return merged;
  }, new Uint8Array());

  const fileUri =
    FileSystem.cacheDirectory +
    `tts-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`;

  await FileSystem.writeAsStringAsync(
    fileUri,
    Buffer.from(combined).toString("base64"),
    { encoding: FileSystem.EncodingType.Base64 }
  );

  return fileUri;
}

/**
 * Speak AI text (streaming TTS)
 */
export async function speakAiText({
  text,
  sessionId,
  turnIndex,
  voice = "professional",
}: {
  text: string;
  sessionId: string;
  turnIndex: number;
  voice?: string;
}) {
  if (!text || !WS_BASE) return;
  if (isSpeaking) return;

  resetState();
  isSpeaking = true;
  activeSessionId = sessionId;
  activeTurnIndex = turnIndex;

  updateAiLiveTranscript(sessionId, turnIndex, text);

  try {
    ws = new WebSocket(`${WS_BASE}/voice/tts-stream`);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      ws?.send(
        JSON.stringify({
          text,
          voice,
        })
      );
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "tts_start") {
            // no-op (marker only)
          }
          if (msg.type === "tts_error") {
            throw new Error(msg.message || "TTS backend error");
          }
        } catch {
          // ignore malformed control frames
        }
        return;
      }

      // binary audio chunk
      audioChunks.push(new Uint8Array(event.data));
    };

    ws.onerror = () => {
      throw new Error("TTS WebSocket error");
    };

    ws.onclose = async () => {
      try {
        if (audioChunks.length > 0) {
          const uri = await chunksToPlayableUri(audioChunks);
          await playAudioBuffer(uri, {
            onStart: () => {},
            onEnd: () => {},
          });
        }
      } finally {
        finalizeAiTranscript(sessionId, turnIndex, text);
        resetState();
      }
    };
  } catch {
    finalizeAiTranscript(sessionId, turnIndex, text);
    resetState();
  }
}

/**
 * Emergency stop (navigation / unmount)
 */
export async function stopAiSpeechImmediately() {
  try {
    if (ws) {
      ws.close();
    }
  } catch {
    // ignore
  } finally {
    await stopPlaybackImmediately();
    resetState();
  }
}

/**
 * Status helpers
 */
export function isAiSpeaking() {
  return isSpeaking;
}

