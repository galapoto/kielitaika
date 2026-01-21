import { HTTP_API_BASE } from '../config/backend';

// Uploads an audio recording to the backend STT endpoint and returns JSON { transcript }
export async function transcribeAudio(uri) {
  if (!uri) throw new Error('No audio URI provided');
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  });

  const res = await fetch(`${HTTP_API_BASE}/voice/stt`, {
    method: 'POST',
    body: formData, // Don't set Content-Type header, browser will set it with boundary
  });
  
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`STT failed: ${detail || res.statusText}`);
  }
  
  return res.json();
}
