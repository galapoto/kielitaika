const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..", "..");
const clientRoot = path.join(root, "apps", "client");
const uiRoot = path.join(root, "packages", "ui");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walk(dir, predicate = () => true) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (!predicate(fullPath, entry)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, predicate));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

assert(!fs.existsSync(path.join(uiRoot, "components")), "Legacy packages/ui/components layer still exists.");
assert(!fs.existsSync(path.join(clientRoot, "dist-web-prod")), "Committed web export dist-web-prod still exists.");

const sourceFiles = [
  ...walk(path.join(clientRoot, "app")),
  ...walk(path.join(clientRoot, "state")),
  ...walk(path.join(clientRoot, "features")),
  ...walk(path.join(uiRoot, "screens")),
  ...walk(path.join(uiRoot, "primitives")),
  ...walk(path.join(uiRoot, "tokens")),
  ...walk(path.join(uiRoot, "theme")),
  path.join(uiRoot, "index.ts"),
];

const cssFiles = sourceFiles.filter((filePath) => filePath.endsWith(".css"));
assert(cssFiles.length === 0, `CSS files are not allowed in the RN cutover: ${cssFiles.join(", ")}`);

const duplicateUiRefs = [];
const reactDomRefs = [];

for (const filePath of sourceFiles) {
  const content = readText(filePath);
  if (content.includes("@ui/components") || content.includes("packages/ui/components")) {
    duplicateUiRefs.push(path.relative(root, filePath));
  }
  if (content.includes("react-dom")) {
    reactDomRefs.push(path.relative(root, filePath));
  }
}

assert(
  duplicateUiRefs.length === 0,
  `Duplicate UI layer references remain: ${duplicateUiRefs.join(", ")}`,
);
assert(reactDomRefs.length === 0, `react-dom source references remain: ${reactDomRefs.join(", ")}`);

const requiredRoutes = [
  "auth.tsx",
  "daily-practice.tsx",
  "index.tsx",
  "learning.tsx",
  "professional-finnish.tsx",
  "speaking-practice.tsx",
  "yki-exam.tsx",
  "yki-practice.tsx",
];

for (const routeFile of requiredRoutes) {
  assert(fs.existsSync(path.join(clientRoot, "app", routeFile)), `Missing RN route ${routeFile}`);
}

const requiredScreens = [
  "ApplicationErrorScreen.tsx",
  "AuthScreen.tsx",
  "DailyPracticeScreen.tsx",
  "HomeScreen.tsx",
  "LearningScreen.tsx",
  "ProfessionalFinnishScreen.tsx",
  "SpeakingPracticeScreen.tsx",
  "YkiExamScreen.tsx",
  "YkiPracticeScreen.tsx",
];

for (const screenFile of requiredScreens) {
  assert(fs.existsSync(path.join(uiRoot, "screens", screenFile)), `Missing governed UI screen ${screenFile}`);
}

const requiredTokens = [
  "animation.ts",
  "colors.ts",
  "index.ts",
  "sizes.ts",
  "spacing.ts",
  "typography.ts",
];

for (const tokenFile of requiredTokens) {
  assert(fs.existsSync(path.join(uiRoot, "tokens", tokenFile)), `Missing governed UI token file ${tokenFile}`);
}

console.log("ui_cutover_enforcement: ok");
