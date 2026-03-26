const SOUND_SOURCES = {
  tap: new URL("../assets/sounds/ui/tap_soft.wav", import.meta.url).href,
  error: new URL("../assets/sounds/ui/error.wav", import.meta.url).href,
  success: new URL("../assets/sounds/ui/success_chime.wav", import.meta.url).href,
  micStart: new URL("../assets/sounds/ui/mic_on.wav", import.meta.url).href,
  micStop: new URL("../assets/sounds/ui/mic_off.wav", import.meta.url).href,
  welcome: new URL("../assets/sounds/ui/pop_light.wav", import.meta.url).href,
} as const;

type SoundKey = keyof typeof SOUND_SOURCES;

const players = new Map<SoundKey, HTMLAudioElement>();
const lastPlayedAt = new Map<SoundKey, number>();
const cooldownMs: Record<SoundKey, number> = {
  tap: 80,
  error: 300,
  success: 300,
  micStart: 200,
  micStop: 200,
  welcome: 1000,
};

let initialized = false;
let welcomePlayed = false;

function canUseAudio(): boolean {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

function ensurePlayers(): void {
  if (initialized || !canUseAudio()) {
    return;
  }
  initialized = true;
  for (const [key, source] of Object.entries(SOUND_SOURCES) as Array<[SoundKey, string]>) {
    try {
      const audio = new Audio(source);
      audio.preload = "auto";
      players.set(key, audio);
    } catch {
      // Fail closed: audio is optional and must never block UI behavior.
    }
  }
}

function play(key: SoundKey): void {
  ensurePlayers();
  const player = players.get(key);
  if (!player) {
    return;
  }
  const now = Date.now();
  const last = lastPlayedAt.get(key) || 0;
  if (now - last < cooldownMs[key]) {
    return;
  }
  lastPlayedAt.set(key, now);
  try {
    player.pause();
    player.currentTime = 0;
    void player.play().catch(() => undefined);
  } catch {
    // Audio failures must not affect UI flow.
  }
}

export function preloadAudio(): void {
  ensurePlayers();
  for (const player of players.values()) {
    try {
      player.load();
    } catch {
      // Silent by design.
    }
  }
}

export function playTap(): void {
  play("tap");
}

export function playError(): void {
  play("error");
}

export function playSuccess(): void {
  play("success");
}

export function playMicStart(): void {
  play("micStart");
}

export function playMicStop(): void {
  play("micStop");
}

export function playWelcome(): void {
  if (welcomePlayed) {
    return;
  }
  welcomePlayed = true;
  play("welcome");
}
