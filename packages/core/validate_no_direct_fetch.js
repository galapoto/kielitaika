const fs = require("fs");
const path = require("path");

const ROOTS = [
  path.join(process.cwd(), "apps"),
  path.join(process.cwd(), "packages"),
  path.join(process.cwd(), "backend"),
];

function scan(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (file === "node_modules" || file === ".git") {
        continue;
      }
      scan(full);
    } else {
      const content = fs.readFileSync(full, "utf8");

      if (
        content.includes("fetch(") &&
        !full.includes("apiClient") &&
        !full.includes("validate_no_direct_fetch")
      ) {
        console.error("Direct fetch found in:", full);
        process.exit(1);
      }
    }
  }
}

for (const dir of ROOTS) {
  scan(dir);
}

console.log("No direct fetch usage");
