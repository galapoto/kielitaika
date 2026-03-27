import { useEffect, useRef } from "react";

import { resolveApiUrl } from "../../config/env";

type Props = {
  src: string;
  autoPlay?: boolean;
};

function resolveSource(src: string): string {
  return resolveApiUrl(src);
}

export default function AudioPlayer({ src, autoPlay = false }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = resolveSource(src);
    audio.load();

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.pause();
    };
  }, [autoPlay, src]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: 64,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
      }}
    >
      <audio ref={ref} controls className="audio-player" />
    </div>
  );
}
