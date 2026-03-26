import { useEffect, useState, type CSSProperties } from "react";

const backgrounds = {
  auth: {
    dark: new URL("../assets/images/backgrounds/dark/login/login_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/login/login_light.png", import.meta.url).href,
  },
  dashboard: {
    dark: new URL("../assets/images/backgrounds/dark/home/home_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/home/home_light.png", import.meta.url).href,
  },
  practice: {
    dark: null,
    light: null,
  },
  conversation: {
    dark: new URL("../assets/images/backgrounds/dark/conversation/convo_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/conversation/convo_light.png", import.meta.url).href,
  },
  professional: {
    dark: new URL("../assets/images/backgrounds/dark/workplace/workplace_light.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/workplace/workplace_light.png", import.meta.url).href,
  },
  settings: {
    dark: new URL("../assets/images/backgrounds/dark/misc/misc_dark_01.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/misc/misc_light_01.png", import.meta.url).href,
  },
  exam: {
    dark: null,
    light: null,
  },
} as const;

export type BackgroundScreen = keyof typeof backgrounds;
export type ColorScheme = "dark" | "light";

function resolveScheme(): ColorScheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useResolvedColorScheme(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(resolveScheme);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => setScheme(media.matches ? "light" : "dark");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return scheme;
}

export function getBackgroundStyle(screen: BackgroundScreen, scheme: ColorScheme): CSSProperties {
  const source = backgrounds[screen][scheme];
  const decorative = source
    ? scheme === "dark"
      ? "radial-gradient(circle at top right, rgba(58, 190, 255, 0.16), transparent 22%), radial-gradient(circle at bottom left, rgba(30, 58, 138, 0.28), transparent 26%)"
      : "radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 22%), radial-gradient(circle at bottom left, rgba(147, 197, 253, 0.24), transparent 26%)"
    : "none";
  const overlay = source
    ? scheme === "dark"
      ? `linear-gradient(180deg, rgba(3, 8, 18, 0.76), rgba(2, 6, 23, 0.9)), url("${source}")`
      : `linear-gradient(180deg, rgba(248, 252, 255, 0.6), rgba(226, 236, 247, 0.78)), url("${source}")`
    : scheme === "dark"
      ? "linear-gradient(180deg, rgba(6, 11, 22, 0.98), rgba(2, 6, 23, 1))"
      : "linear-gradient(180deg, rgba(246, 249, 252, 0.98), rgba(232, 239, 247, 1))";
  return {
    "--app-background-image": overlay,
    "--app-background-accent": decorative,
  } as CSSProperties;
}
