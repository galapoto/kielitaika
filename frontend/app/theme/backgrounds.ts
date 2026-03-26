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
  cards: {
    dark: new URL("../assets/images/backgrounds/dark/practice/practice_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/practice/practice_light.png", import.meta.url).href,
  },
  roleplay: {
    dark: new URL("../assets/images/backgrounds/dark/conversation/convo_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/conversation/convo_light.png", import.meta.url).href,
  },
  voice: {
    dark: new URL("../assets/images/backgrounds/dark/workplace/workplace_light.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/workplace/workplace_light.png", import.meta.url).href,
  },
  yki: {
    dark: new URL("../assets/images/backgrounds/dark/yki/yki_read_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/yki/yki_read_light.png", import.meta.url).href,
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
  const overlay =
    scheme === "dark"
      ? "linear-gradient(180deg, rgba(3, 8, 18, 0.76), rgba(2, 6, 23, 0.9))"
      : "linear-gradient(180deg, rgba(248, 252, 255, 0.6), rgba(226, 236, 247, 0.78))";
  return {
    "--app-background-image": `${overlay}, url("${source}")`,
  } as CSSProperties;
}
