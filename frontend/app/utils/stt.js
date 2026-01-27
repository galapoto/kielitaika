import { Platform } from 'react-native';
import { HTTP_API_BASE } from '../config/backend';

const OPENAI_TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';
const API_BASE = HTTP_API_BASE;

const safeString = (value) => (typeof value === 'string' ? value : '');

function computeConfidenceFromVerboseJson(verboseJson) {
  const segments = Array.isArray(verboseJson?.segments) ? verboseJson.segments : null;
  if (!segments || segments.length === 0) return null;
  const logprobs = segments
    .map((s) => (typeof s?.avg_logprob === 'number' ? s.avg_logprob : null))
    .filter((n) => typeof n === 'number');
  if (!logprobs.length) return null;
  const avg = logprobs.reduce((sum, v) => sum + v, 0) / logprobs.length;
  // avg_logprob is negative; map to a loose 0..1 score.
  // This is a heuristic indicator only (not a real confidence score).
  const normalized = 1 / (1 + Math.exp(-(avg + 1.5)));
  return Math.max(0, Math.min(1, normalized));
}

async function toBlobFromUri(fileUri) {
  const resp = await fetch(fileUri);
  return resp.blob();
}

function filePartFromUri(fileUri, audioFormat) {
  const ext = safeString(audioFormat).trim() || safeString(fileUri?.split('.').pop()).trim() || 'wav';
  const name = `audio.${ext}`;
  // RN FormData file part
  return { uri: fileUri, name, type: `audio/${ext}` };
}

/**
 * Transcribe audio using OpenAI Audio API (preferred) with backend fallback.
 *
 * Returns:
 * {
 *   text: string,
 *   meta: { provider, model, response_format, confidence?, raw? }
 * }
 */
export async function transcribeAudio({
  fileUri,
  audioBlob,
  audioFormat = 'webm',
  language = 'fi',
  model = process.env.EXPO_PUBLIC_OPENAI_STT_MODEL || 'whisper-1',
  responseFormat = 'verbose_json',
} = {}) {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  // If no OpenAI key is configured, fall back to the existing backend STT route.
  if (!apiKey) {
    const blob = audioBlob || (fileUri ? await toBlobFromUri(fileUri) : null);
    if (!blob) {
      throw new Error('STT requires `fileUri` or `audioBlob`');
    }
    const res = await fetch(`${API_BASE}/voice/stt`, {
      method: 'POST',
      headers: {
        'Content-Type': `audio/${audioFormat}`,
        'X-Audio-Format': audioFormat,
      },
      body: blob,
    });
    if (!res.ok) {
      throw new Error(`Backend STT failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return {
      text: safeString(data?.transcript).trim(),
      meta: {
        provider: 'backend',
        model: 'backend-openai',
        response_format: 'json',
      },
    };
  }

  const form = new FormData();
  form.append('model', model);
  form.append('language', language);
  form.append('response_format', responseFormat);

  if (Platform.OS === 'web') {
    const blob = audioBlob || (fileUri ? await toBlobFromUri(fileUri) : null);
    if (!blob) {
      throw new Error('STT requires `fileUri` or `audioBlob`');
    }
    const file = new File([blob], `audio.${audioFormat}`, { type: `audio/${audioFormat}` });
    form.append('file', file);
  } else {
    if (!fileUri) {
      throw new Error('STT on native requires `fileUri`');
    }
    form.append('file', filePartFromUri(fileUri, audioFormat));
  }

  const res = await fetch(OPENAI_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`OpenAI STT failed: ${res.status} ${errorText || res.statusText}`);
  }

  const raw = await res.json();
  const text = safeString(raw?.text).trim();
  const confidence = responseFormat === 'verbose_json' ? computeConfidenceFromVerboseJson(raw) : null;

  return {
    text,
    meta: {
      provider: 'openai',
      model,
      response_format: responseFormat,
      language,
      confidence,
      raw,
    },
  };
}
