#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
};

function register(extension) {
  require.extensions[extension] = function compile(module, filename) {
    const source = fs.readFileSync(filename, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions,
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
}

register(".ts");
register(".tsx");

const entry = process.argv[2];

if (!entry) {
  console.error("Missing TypeScript entry file.");
  process.exit(1);
}

require(path.resolve(process.cwd(), entry));

