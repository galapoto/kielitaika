import fs from "node:fs";
import path from "node:path";

import {
  FORBIDDEN_GLOBAL_PATTERNS,
  REQUIRED_APP_SCREEN_MARKERS,
  REQUIRED_CARD_RUNTIME_MARKERS,
  REQUIRED_GLOBAL_WIDTH_RULES,
  REQUIRED_MOBILE_RULES,
  REQUIRED_SCAFFOLD_RULES,
  SCREEN_BACKGROUND_SCENARIOS,
} from "./ui_regression_tests";
import { UI_INVARIANTS } from "./ui_invariants";

const FRONTEND_ROOT = path.resolve(__dirname, "../..");
const APP_ROOT = path.join(FRONTEND_ROOT, "app");
const BACKGROUNDS_FILE = path.join(APP_ROOT, "theme", "backgrounds.ts");
const GLOBAL_CSS_FILE = path.join(APP_ROOT, "theme", "global.css");
const APP_FILE = path.join(APP_ROOT, "App.tsx");
const CARDS_FILE = path.join(APP_ROOT, "screens", "CardsScreen.tsx");
const CARDS_SERVICE_FILE = path.join(APP_ROOT, "services", "cardsService.ts");
const UI_INVARIANTS_FILE = path.join(APP_ROOT, "system", "ui_invariants.ts");

type Violation = {
  file: string;
  reason: string;
};

function walkFiles(root: string): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return fullPath;
  });
}

function read(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function relative(filePath: string): string {
  return path.relative(FRONTEND_ROOT, filePath).replace(/\\/g, "/");
}

function validateSingleScreenRendering(): Violation[] {
  const source = read(APP_FILE);
  const violations: Violation[] = [];

  if (!UI_INVARIANTS.SINGLE_ACTIVE_SCREEN) {
    violations.push({ file: relative(APP_FILE), reason: "UI_INVARIANTS.SINGLE_ACTIVE_SCREEN must remain enabled." });
  }

  for (const marker of REQUIRED_APP_SCREEN_MARKERS) {
    if (!source.includes(marker)) {
      violations.push({ file: relative(APP_FILE), reason: `App.tsx is missing required single-screen marker: ${marker}` });
    }
  }

  const screenOutletCount = (source.match(/\{screen\}/g) || []).length;
  if (screenOutletCount !== 1) {
    violations.push({ file: relative(APP_FILE), reason: "App.tsx must render exactly one top-level screen outlet." });
  }

  if (!source.includes('className={`app-frame ${getBackgroundClass(backgroundScreen, colorScheme)}`}')) {
    violations.push({ file: relative(APP_FILE), reason: "App.tsx must apply backgrounds through the background class system." });
  }

  if (/style=\{getBackgroundStyle/.test(source)) {
    violations.push({ file: relative(APP_FILE), reason: "Inline background styles are forbidden in App.tsx." });
  }

  return violations;
}

function validateBackgroundAuthority(): Violation[] {
  const violations: Violation[] = [];
  const backgroundSource = read(BACKGROUNDS_FILE);
  const appFiles = walkFiles(APP_ROOT).filter((file) => /\.(ts|tsx|css)$/.test(file));

  if (!backgroundSource.includes("export function getScreenBackground")) {
    violations.push({ file: relative(BACKGROUNDS_FILE), reason: "Backgrounds must be resolved through getScreenBackground()." });
  }

  if (!backgroundSource.includes("export function getBackgroundClass")) {
    violations.push({ file: relative(BACKGROUNDS_FILE), reason: "Backgrounds must expose getBackgroundClass() for the app frame." });
  }

  if (!backgroundSource.includes('throw new Error(`No background rule for screen: ${screen}`)')) {
    violations.push({ file: relative(BACKGROUNDS_FILE), reason: "Background resolver must fail closed for unmapped screens." });
  }

  for (const scenario of SCREEN_BACKGROUND_SCENARIOS) {
    const requiredBlock = `${scenario.screen}: {`;
    const requiredDecorativeLine = `${requiredBlock}\n    decorative: ${scenario.decorative ? "true" : "false"},`;
    if (!backgroundSource.includes(requiredBlock)) {
      violations.push({ file: relative(BACKGROUNDS_FILE), reason: `Missing background rule for screen "${scenario.screen}".` });
      continue;
    }
    if (!backgroundSource.includes(requiredDecorativeLine)) {
      violations.push({ file: relative(BACKGROUNDS_FILE), reason: `Screen "${scenario.screen}" has the wrong decorative background rule.` });
    }
  }

  for (const file of appFiles) {
    if (file === BACKGROUNDS_FILE || file === GLOBAL_CSS_FILE || file.includes("/system/")) {
      continue;
    }
    const source = read(file);
    if (/url\(/.test(source) || /backgroundImage/.test(source) || /linear-gradient\(/.test(source) || /radial-gradient\(/.test(source)) {
      violations.push({ file: relative(file), reason: "Decorative background definitions are only allowed in theme/backgrounds.ts and approved global.css gradients." });
    }
  }

  if (/url\(/.test(read(GLOBAL_CSS_FILE))) {
    violations.push({ file: relative(GLOBAL_CSS_FILE), reason: "global.css must not define image backgrounds directly." });
  }

  return violations;
}

function validateCardAuthority(): Violation[] {
  const source = read(CARDS_FILE);
  const violations: Violation[] = [];

  if (/components\/Panel/.test(source)) {
    violations.push({ file: relative(CARDS_FILE), reason: "CardsScreen must not import Panel; card layout authority is local to CardsScreen." });
  }

  if (!source.includes("assertCardStructure(card);")) {
    violations.push({ file: relative(CARDS_FILE), reason: "CardsScreen must assert runtime card structure before render." });
  }

  for (const marker of REQUIRED_CARD_RUNTIME_MARKERS) {
    if (!source.includes(marker)) {
      violations.push({ file: relative(CARDS_FILE), reason: `CardsScreen is missing required card layout marker: ${marker}` });
    }
  }

  if (!source.includes("{!runtime && (") || !source.includes('<div className="practice-runtime-root">')) {
    violations.push({ file: relative(CARDS_FILE), reason: "CardsScreen must keep intro and runtime as mutually exclusive top-level branches." });
  }

  return violations;
}

function validateContentTypeMapping(): Violation[] {
  const cardsSource = read(CARDS_FILE);
  const serviceSource = read(CARDS_SERVICE_FILE);
  const invariantsSource = read(UI_INVARIANTS_FILE);
  const violations: Violation[] = [];

  if (cardsSource.includes("phrase_card")) {
    violations.push({ file: relative(CARDS_FILE), reason: 'Frontend must not invent backend content types. Use "sentence_card" for Phrases.' });
  }

  if (!invariantsSource.includes('phrases: "sentence_card"')) {
    violations.push({ file: relative(UI_INVARIANTS_FILE), reason: 'Phrases must map to the backend "sentence_card" contract.' });
  }

  if (!cardsSource.includes("resolvePracticeContentType")) {
    violations.push({ file: relative(CARDS_FILE), reason: "CardsScreen must resolve section content types through ui_invariants.ts." });
  }

  for (const contentType of UI_INVARIANTS.BACKEND_CONTENT_TYPES) {
    if (!invariantsSource.includes(contentType) && !cardsSource.includes(contentType) && !serviceSource.includes(contentType)) {
      violations.push({ file: relative(CARDS_FILE), reason: `Expected backend content type "${contentType}" is no longer referenced in the frontend contract.` });
    }
  }

  return violations;
}

function validateDimensionsAndSpacing(): Violation[] {
  const violations: Violation[] = [];
  const css = read(GLOBAL_CSS_FILE);

  if (/clamp\(/.test(css)) {
    violations.push({ file: relative(GLOBAL_CSS_FILE), reason: "clamp() is not allowed in the enforced UI sizing system." });
  }

  for (const rule of REQUIRED_GLOBAL_WIDTH_RULES) {
    if (!css.includes(rule)) {
      violations.push({ file: relative(GLOBAL_CSS_FILE), reason: `Missing required global width cap: ${rule}` });
    }
  }

  for (const rule of REQUIRED_MOBILE_RULES) {
    if (!css.includes(rule)) {
      violations.push({ file: relative(GLOBAL_CSS_FILE), reason: `Missing required mobile shell rule: ${rule}` });
    }
  }

  if ((!css.includes("padding: var(--space-3);") && !css.includes("padding: 24px;")) || (!css.includes("gap: var(--space-3);") && !css.includes("gap: 24px;"))) {
    violations.push({ file: relative(GLOBAL_CSS_FILE), reason: "Core shell spacing drifted from the locked spacing system." });
  }

  for (const rule of REQUIRED_SCAFFOLD_RULES) {
    if (!css.includes(rule)) {
      violations.push({ file: relative(GLOBAL_CSS_FILE), reason: `Missing required scaffold rule: ${rule}` });
    }
  }

  for (const pattern of FORBIDDEN_GLOBAL_PATTERNS) {
    if (css.includes(pattern)) {
      violations.push({ file: relative(GLOBAL_CSS_FILE), reason: `Forbidden global layout pattern detected: ${pattern}` });
    }
  }

  if (!/font-family:\s*"?Space Grotesk"?/.test(css)) {
    violations.push({ file: relative(GLOBAL_CSS_FILE), reason: "Heading typography must use the enforced title font." });
  }

  return violations;
}

function validateRegressionScenarios(): Violation[] {
  const css = read(GLOBAL_CSS_FILE);
  const dashboard = read(path.join(APP_ROOT, "screens", "DashboardScreen.tsx"));
  const cards = read(CARDS_FILE);
  const ykiExam = read(path.join(APP_ROOT, "screens", "YkiExamScreen.tsx"));
  const field = read(path.join(APP_ROOT, "components", "Field.tsx"));
  const statusBanner = read(path.join(APP_ROOT, "components", "StatusBanner.tsx"));
  const violations: Violation[] = [];

  if (!css.includes(".drawer-sidebar") || !css.includes(".drawer-sidebar.is-open")) {
    violations.push({ file: relative(GLOBAL_CSS_FILE), reason: "Mobile drawer behavior is no longer explicitly represented in CSS." });
  }

  if (!cards.includes("practice-runtime-root") || !cards.includes("practice-card-stage") || !cards.includes("practice-progress-stack")) {
    violations.push({ file: relative(CARDS_FILE), reason: "Card runtime no longer exposes the locked centered-card regression markers." });
  }

  if (!dashboard.includes('className="dashboard-surface"') || !dashboard.includes('className="dashboard-hero-block"')) {
    violations.push({ file: relative(path.join(APP_ROOT, "screens", "DashboardScreen.tsx")), reason: "Home screen must render through one bounded dashboard surface." });
  }

  if (!css.includes(".practice-runtime-root") || !css.includes(".practice-card-wrapper") || !css.includes("height: 680px;") || !css.includes(".dashboard-surface")) {
    violations.push({ file: relative(GLOBAL_CSS_FILE), reason: "Locked practice-card dimensions and bounded-home layout rules are missing." });
  }

  if (!ykiExam.includes(`className="${UI_INVARIANTS.EXAM_SCROLL_CONTAINER_CLASS}"`) || !ykiExam.includes('contentClassName="exam-content-zone"')) {
    violations.push({ file: relative(path.join(APP_ROOT, "screens", "YkiExamScreen.tsx")), reason: "YKI runtime must isolate scrolling inside the exam-content container." });
  }

  if (!field.includes("field-label") || !field.includes("lucide-react")) {
    violations.push({ file: relative(path.join(APP_ROOT, "components", "Field.tsx")), reason: "Inputs must expose the enforced icon-bearing field label structure." });
  }

  if (!statusBanner.includes("AlertCircle") || !statusBanner.includes("CheckCircle2") || !statusBanner.includes("Info")) {
    violations.push({ file: relative(path.join(APP_ROOT, "components", "StatusBanner.tsx")), reason: "Status banners must use the normalized icon system." });
  }

  return violations;
}

function main(): void {
  const violations = [
    ...validateSingleScreenRendering(),
    ...validateBackgroundAuthority(),
    ...validateCardAuthority(),
    ...validateContentTypeMapping(),
    ...validateDimensionsAndSpacing(),
    ...validateRegressionScenarios(),
  ];

  if (violations.length > 0) {
    const message = violations.map((violation) => `- ${violation.file}: ${violation.reason}`).join("\n");
    throw new Error(`UI invariant violations detected:\n${message}`);
  }
}

main();
