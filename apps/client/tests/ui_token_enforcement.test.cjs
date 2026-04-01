const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("../node_modules/typescript");

const root = path.resolve(__dirname, "..", "..", "..");
const uiRoot = path.join(root, "packages", "ui");
const tokensRoot = path.join(uiRoot, "tokens");
const screensRoot = path.join(uiRoot, "screens");
const primitivesRoot = path.join(uiRoot, "primitives");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadTsModule(filePath) {
  const source = readText(filePath);
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filePath,
  });

  const module = { exports: {} };
  const wrapped = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    output.outputText,
  );

  wrapped(module.exports, require, module, filePath, path.dirname(filePath));
  return module.exports;
}

const spacingModule = loadTsModule(path.join(tokensRoot, "spacing.ts"));
const colorsModule = loadTsModule(path.join(tokensRoot, "colors.ts"));
const typographyModule = loadTsModule(path.join(tokensRoot, "typography.ts"));
const animationModule = loadTsModule(path.join(tokensRoot, "animation.ts"));
const sizesModule = loadTsModule(path.join(tokensRoot, "sizes.ts"));

assert.deepEqual(spacingModule.spacingValues, [4, 8, 16, 24, 32, 40, 48]);
assert.deepEqual(
  [...Object.values(spacingModule.spacing)].sort((left, right) => left - right),
  [4, 8, 16, 24, 32, 40, 48],
);

for (const colorKey of ["correct", "wrong", "neutral", "hover", "disabled"]) {
  assert.ok(colorsModule.colors[colorKey], `Missing governed color state ${colorKey}`);
}

for (const roleKey of ["title", "body", "label", "button"]) {
  assert.ok(typographyModule.typography.roles[roleKey], `Missing typography role ${roleKey}`);
}

assert.ok(animationModule.animation.duration.fast >= 100);
assert.ok(animationModule.animation.duration.fast <= 150);
assert.ok(animationModule.animation.duration.normal >= 200);
assert.ok(animationModule.animation.duration.normal <= 250);
assert.ok(animationModule.animation.duration.slow >= 300);
assert.ok(animationModule.animation.duration.slow <= 400);

for (const sizeKey of ["button", "card", "input", "micButton", "header"]) {
  assert.ok(sizesModule.componentSizes[sizeKey], `Missing size lock ${sizeKey}`);
}

const governedSourceFiles = [
  ...walk(screensRoot).filter((filePath) => filePath.endsWith(".tsx")),
  ...walk(primitivesRoot).filter((filePath) => filePath.endsWith(".tsx")),
  path.join(uiRoot, "index.ts"),
];

const screenFiles = walk(screensRoot).filter((filePath) => filePath.endsWith(".tsx"));
const spacingProperties =
  /\b(?:gap|padding(?:Top|Right|Bottom|Left|Horizontal|Vertical)?|margin(?:Top|Right|Bottom|Left|Horizontal|Vertical)?)\s*:\s*(\d+)\b/g;
const inlineColorPattern = /#[0-9a-fA-F]{3,8}/g;
const invalidSpacingValues = [];
const themeImportViolations = [];
const inlineStyleViolations = [];
const inlineColorViolations = [];
const layoutZoneViolations = [];

for (const filePath of governedSourceFiles) {
  const content = readText(filePath);

  if (content.includes("../theme/") || content.includes("./theme/")) {
    themeImportViolations.push(path.relative(root, filePath));
  }

  let match;
  while ((match = spacingProperties.exec(content))) {
    const value = Number(match[1]);
    if (!spacingModule.spacingValues.includes(value)) {
      invalidSpacingValues.push(`${path.relative(root, filePath)}:${match[0]}`);
    }
  }
}

for (const filePath of screenFiles) {
  const content = readText(filePath);

  if (content.includes("style={{")) {
    inlineStyleViolations.push(path.relative(root, filePath));
  }

  if (inlineColorPattern.test(content)) {
    inlineColorViolations.push(path.relative(root, filePath));
  }
  inlineColorPattern.lastIndex = 0;

  if (!content.includes("FeatureEntryScreen")) {
    const hasZones =
      content.includes("header={") && content.includes("content={") && content.includes("actions={");
    if (!hasZones) {
      layoutZoneViolations.push(path.relative(root, filePath));
    }
  }
}

assert.equal(
  themeImportViolations.length,
  0,
  `Governed UI still imports deprecated theme tokens: ${themeImportViolations.join(", ")}`,
);
assert.equal(
  inlineStyleViolations.length,
  0,
  `Inline styles remain in governed screens: ${inlineStyleViolations.join(", ")}`,
);
assert.equal(
  inlineColorViolations.length,
  0,
  `Inline colors remain in governed screens: ${inlineColorViolations.join(", ")}`,
);
assert.equal(
  invalidSpacingValues.length,
  0,
  `Invalid spacing values detected in governed UI: ${invalidSpacingValues.join(", ")}`,
);
assert.equal(
  layoutZoneViolations.length,
  0,
  `Screens missing deterministic header/content/action zones: ${layoutZoneViolations.join(", ")}`,
);

console.log("ui_token_enforcement: ok");
