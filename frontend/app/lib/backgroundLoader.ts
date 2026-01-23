/**
 * Background Image Loader
 * 
 * Maps screen/module names to background images in:
 * frontend/app/assets/images/backgrounds/{dark|light}/{folder}/{image}.png
 * 
 * Pattern: folder name + "_screen" = screen name
 * Example: "practice" folder → "practice_screen" or "harjoitus_screen"
 */

type ModuleKey = 
  | "login" 
  | "home" 
  | "conversation" 
  | "practice" 
  | "workplace" 
  | "yki_read" 
  | "yki_write" 
  | "yki_listen" 
  | "yki_speak";

type Theme = "dark" | "light";

/**
 * Maps module key to folder name in backgrounds directory
 */
const moduleToFolder: Record<ModuleKey, string> = {
  login: "login",
  home: "home",
  conversation: "conversation",
  practice: "practice", // maps to harjoitus_screen
  workplace: "workplace", // maps to nursing_screen (if nursing is workplace)
  yki_read: "yki",
  yki_write: "yki",
  yki_listen: "yki",
  yki_speak: "yki",
};

/**
 * Maps YKI module to specific YKI image filename
 */
const ykiImageMap: Record<ModuleKey, string> = {
  yki_read: "yki_read",
  yki_write: "yki_write",
  yki_listen: "yki_listen",
  yki_speak: "yki_speak",
  // Not YKI modules, but required for type safety
  login: "",
  home: "",
  conversation: "",
  practice: "",
  workplace: "",
};

/**
 * Static image mapping - all images loaded at module level to prevent Metro bundling issues
 */
const BACKGROUND_IMAGES = {
  dark: {
    login: require("../assets/images/backgrounds/dark/login/login_dark.png"),
    home: require("../assets/images/backgrounds/dark/home/home_dark.png"),
    conversation: require("../assets/images/backgrounds/dark/conversation/convo_dark.png"),
    practice: require("../assets/images/backgrounds/dark/practice/practice_dark.png"),
    workplace: require("../assets/images/backgrounds/dark/workplace/workplace_light.png"), // Note: filename is workplace_light.png in dark folder
    yki_read: require("../assets/images/backgrounds/dark/yki/yki_read_dark.png"),
    yki_write: require("../assets/images/backgrounds/dark/yki/yki_write_dark.png"),
    yki_listen: require("../assets/images/backgrounds/dark/yki/yki_listen_dark.png"),
    yki_speak: require("../assets/images/backgrounds/dark/yki/yki_speak_dark.png"),
  },
  light: {
    login: require("../assets/images/backgrounds/light/login/login_light.png"),
    home: require("../assets/images/backgrounds/light/home/home_light.png"),
    conversation: require("../assets/images/backgrounds/light/conversation/convo_light.png"),
    practice: require("../assets/images/backgrounds/light/practice/practice_light.png"),
    workplace: require("../assets/images/backgrounds/light/workplace/workplace_light.png"),
    yki_read: require("../assets/images/backgrounds/light/yki/yki_read_light.png"),
    yki_write: require("../assets/images/backgrounds/light/yki/yki_write_light.png"),
    yki_listen: require("../assets/images/backgrounds/light/yki/yki_listen_light.png"),
    yki_speak: require("../assets/images/backgrounds/light/yki/yki_speak_light.png"),
  },
};

/**
 * Get background image path for a module
 * @param module - Module key (e.g., "practice", "conversation")
 * @param theme - "dark" or "light" (required)
 * @returns require() object for the background image
 */
export function getBackgroundImage(
  module: ModuleKey,
  theme: Theme
): any {
  return BACKGROUND_IMAGES[theme][module] || BACKGROUND_IMAGES.dark.home;
}

/**
 * Get background image by screen name (for legacy support)
 * Maps screen names like "practice_screen" → "practice" module
 */
export function getBackgroundByScreenName(
  screenName: string,
  theme: Theme
): any {
  // Remove "_screen" suffix if present
  const moduleName = screenName.replace(/_screen$/, "");
  
  // Map common screen name variations
  const screenToModule: Record<string, ModuleKey> = {
    harjoitus: "practice",
    harjoitus_screen: "practice",
    practice: "practice",
    practice_screen: "practice",
    nursing: "workplace",
    nursing_screen: "workplace",
    workplace: "workplace",
    workplace_screen: "workplace",
    puhu: "conversation",
    puhu_screen: "conversation",
    conversation: "conversation",
    conversation_screen: "conversation",
    home: "home",
    home_screen: "home",
    login: "login",
    login_screen: "login",
    yki_read: "yki_read",
    yki_write: "yki_write",
    yki_listen: "yki_listen",
    yki_speak: "yki_speak",
  };
  
  const module = screenToModule[moduleName] || screenToModule[screenName] || "home";
  return getBackgroundImage(module, theme);
}
