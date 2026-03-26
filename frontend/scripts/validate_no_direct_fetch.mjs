import fs from "node:fs";
import path from "node:path";

const root = path.resolve("app");
const allowList = new Set([path.resolve("app/services/apiClient.ts")]);
const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }
    const source = fs.readFileSync(fullPath, "utf8");
    if (/\bfetch\s*\(/.test(source) && !allowList.has(fullPath)) {
      violations.push(path.relative(process.cwd(), fullPath));
    }
  }
}

walk(root);

if (violations.length > 0) {
  console.error("Direct fetch usage detected outside services/apiClient.ts:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("No direct fetch usage detected outside services/apiClient.ts.");
