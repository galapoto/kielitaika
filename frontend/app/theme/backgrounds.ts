import { useEffect, useState } from "react";

import type { AppScreen } from "../state/types";
import { isDecorativeBackgroundAllowed } from "../system/ui_invariants";

export type BackgroundScreen = AppScreen | "auth";
export type ColorScheme = "dark" | "light";

type BackgroundConfig = {
  decorative: boolean;
  dark: string | null;
  light: string | null;
};

const BACKGROUND_CLASS_MAP: Record<BackgroundScreen, Record<ColorScheme, string>> = {
  auth: { dark: "app-background-auth-dark", light: "app-background-auth-light" },
  home: { dark: "app-background-home-dark", light: "app-background-home-light" },
  practice: { dark: "app-background-practice-dark", light: "app-background-practice-light" },
  conversation: { dark: "app-background-conversation-dark", light: "app-background-conversation-light" },
  yki_intro: { dark: "app-background-yki-intro-dark", light: "app-background-yki-intro-light" },
  yki_runtime: { dark: "app-background-yki-runtime-dark", light: "app-background-yki-runtime-light" },
  yki_result: { dark: "app-background-yki-result-dark", light: "app-background-yki-result-light" },
  professional: { dark: "app-background-professional-dark", light: "app-background-professional-light" },
  settings: { dark: "app-background-settings-dark", light: "app-background-settings-light" },
  debug: { dark: "app-background-debug-dark", light: "app-background-debug-light" },
};

const BACKGROUND_RULES: Record<BackgroundScreen, BackgroundConfig> = {
  auth: {
    decorative: true,
    dark: new URL("../assets/images/backgrounds/dark/login/login_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/login/login_light.png", import.meta.url).href,
  },
  home: {
    decorative: true,
    dark: new URL("../assets/images/backgrounds/dark/home/home_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/home/home_light.png", import.meta.url).href,
  },
  practice: {
    decorative: false,
    dark: null,
    light: null,
  },
  conversation: {
    decorative: true,
    dark: new URL("../assets/images/backgrounds/dark/conversation/convo_dark.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/conversation/convo_light.png", import.meta.url).href,
  },
  yki_intro: {
    decorative: false,
    dark: null,
    light: null,
  },
  yki_runtime: {
    decorative: false,
    dark: null,
    light: null,
  },
  yki_result: {
    decorative: false,
    dark: null,
    light: null,
  },
  professional: {
    decorative: true,
    dark: new URL("../assets/images/backgrounds/dark/workplace/workplace_light.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/workplace/workplace_light.png", import.meta.url).href,
  },
  settings: {
    decorative: true,
    dark: new URL("../assets/images/backgrounds/dark/misc/misc_dark_01.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/misc/misc_light_01.png", import.meta.url).href,
  },
  debug: {
    decorative: true,
    dark: new URL("../assets/images/backgrounds/dark/misc/misc_dark_01.png", import.meta.url).href,
    light: new URL("../assets/images/backgrounds/light/misc/misc_light_01.png", import.meta.url).href,
  },
} as const;

const BACKGROUND_STYLE_ELEMENT_ID = "kt-background-classes";

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

export function getScreenBackground(screen: BackgroundScreen): BackgroundConfig {
  const config = BACKGROUND_RULES[screen];
  if (!config) {
    throw new Error(`No background rule for screen: ${screen}`);
  }
  if (!isDecorativeBackgroundAllowed(screen) && config.decorative) {
    throw new Error(`Decorative backgrounds are forbidden for screen: ${screen}`);
  }
  return config;
}

function decorativeOverlay(scheme: ColorScheme): string {
  return scheme === "dark"
    ? "radial-gradient(circle at top right, rgba(58, 190, 255, 0.16), transparent 22%), radial-gradient(circle at bottom left, rgba(30, 58, 138, 0.28), transparent 26%)"
    : "radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 22%), radial-gradient(circle at bottom left, rgba(147, 197, 253, 0.24), transparent 26%)";
}

function surfaceBackground(config: BackgroundConfig, scheme: ColorScheme): string {
  const source = config[scheme];
  return source
    ? scheme === "dark"
      ? `linear-gradient(180deg, rgba(3, 8, 18, 0.76), rgba(2, 6, 23, 0.9)), url("${source}")`
      : `linear-gradient(180deg, rgba(248, 252, 255, 0.6), rgba(226, 236, 247, 0.78)), url("${source}")`
    : scheme === "dark"
      ? "linear-gradient(180deg, rgba(6, 11, 22, 0.98), rgba(2, 6, 23, 1))"
      : "linear-gradient(180deg, rgba(246, 249, 252, 0.98), rgba(232, 239, 247, 1))";
}

function buildBackgroundCss(): string {
  return (Object.keys(BACKGROUND_RULES) as BackgroundScreen[])
    .flatMap((screen) =>
      (Object.keys(BACKGROUND_CLASS_MAP[screen]) as ColorScheme[]).map((scheme) => {
        const className = BACKGROUND_CLASS_MAP[screen][scheme];
        const config = getScreenBackground(screen);
        const overlay = config.decorative ? decorativeOverlay(scheme) : "none";
        return `
.app-frame.${className} {
  background-color: #040712;
  background-image: ${surfaceBackground(config, scheme)};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.app-frame.${className}::before {
  background: ${overlay};
}
`;
      }),
    )
    .join("\n");
}

function ensureBackgroundClasses(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(BACKGROUND_STYLE_ELEMENT_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = BACKGROUND_STYLE_ELEMENT_ID;
  style.textContent = buildBackgroundCss();
  document.head.appendChild(style);
}

export function getBackgroundClass(screen: BackgroundScreen, scheme: ColorScheme): string {
  ensureBackgroundClasses();
  return BACKGROUND_CLASS_MAP[screen][scheme];
}
