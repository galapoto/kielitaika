// Import API base URLs
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';
const API_BASE_ALT = 'http://localhost:8001';

// Uploads an audio recording to the backend STT endpoint and returns JSON { transcript }
export async function transcribeAudio(uri) {
  if (!uri) throw new Error('No audio URI provided');
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  });

  // For FormData, we need to try both ports manually
  const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:8000';
  const API_BASE_ALT = 'http://localhost:8001';
  
  let res;
  try {
    res = await fetch(`${API_BASE}/voice/stt`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header, browser will set it with boundary
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    // Try alternate port
  }
  
  try {
    res = await fetch(`${API_BASE_ALT}/voice/stt`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`STT failed: ${detail || res.statusText}`);
    }
    return res.json();
  } catch (e) {
    throw new Error(`STT failed: ${e.message}`);
  }
}
