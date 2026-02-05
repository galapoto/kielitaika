// frontend/app/services/tts.ts

import * as FileSystem from 'expo-file-system';
import { playAudioFromUri } from '../audio/AudioPlayer';
import { updateAiLiveTranscript, finalizeAiTranscript } from '../utils/speakingAttempts';

const WS_BASE = process.env.EXPO_PUBLIC_API_BASE
  ? process.env.EXPO_PUBLIC_API_BASE.replace(/^http/, 'ws')
  : 'ws://localhost:8000';

export async function speakText({
  sessionId,
  turnIndex,
  text,
  onPlaybackEnd
}) {
  if (!text) return;

  updateAiLiveTranscript(sessionId, turnIndex, text);

  const ws = new WebSocket(`${WS_BASE}/voice/tts-stream`);
  const chunks: Uint8Array[] = [];

  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    ws.send(JSON.stringify({ text }));
  };

  ws.onmessage = evt => {
    if (typeof evt.data !== 'string') {
      chunks.push(new Uint8Array(evt.data));
    }
  };

  ws.onerror = () => {
    finalizeAiTranscript(sessionId, turnIndex, text);
    onPlaybackEnd?.();
  };

  ws.onclose = async () => {
    try {
      const buffer = concatChunks(chunks);
      const fileUri = FileSystem.cacheDirectory + `tts-${Date.now()}.opus`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(buffer).toString('base64'),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      await playAudioFromUri(fileUri, {
        onEnd: onPlaybackEnd
      });

    } catch {
      onPlaybackEnd?.();
    }

    finalizeAiTranscript(sessionId, turnIndex, text);
  };
}

function concatChunks(chunks: Uint8Array[]) {
  const size = chunks.reduce((a, c) => a + c.length, 0);
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    buffer.set(c, offset);
    offset += c.length;
  }
  return buffer;
}

