import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const i18nPath = path.join(root, "src/lib/i18n.ts");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function collectTsxFiles() {
  const output = execSync("rg --files src/app src/components | rg '\\.tsx$'", {
    cwd: root,
    encoding: "utf8",
  });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractEnKeys(i18nText) {
  const enMatch = i18nText.match(/en:\s*\{([\s\S]*?)\n\s*},\n\s*es:/);
  if (!enMatch) {
    throw new Error("Could not parse English dictionary block in src/lib/i18n.ts");
  }

  const keys = new Set();
  const keyRegex = /\n\s*(["'])((?:\\.|(?!\1).)*)\1\s*:/g;
  let match;
  while ((match = keyRegex.exec(enMatch[1]))) {
    keys.add(match[2].replace(/\\(['"`\\])/g, "$1"));
  }
  return keys;
}

function extractUsedTKeys(text) {
  const keys = [];
  const regex = /\bt\(\s*(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g;
  let match;
  while ((match = regex.exec(text))) {
    const raw = match[2];
    if (raw.includes("${")) continue;
    keys.push(raw.replace(/\\(['"`\\])/g, "$1"));
  }
  return keys;
}

function detectHardcodedJsxText(text) {
  const findings = [];
  const regex = />\s*([A-Za-z][^<{]{2,})\s*</g;
  let match;
  while ((match = regex.exec(text))) {
    const snippet = match[1].trim();
    if (!snippet) continue;
    if (/^(MIT|Harvard|Stanford|Caltech|Princeton|Berkeley)$/i.test(snippet)) continue;
    if (/^[A-Za-z0-9+\-./:()%&\s]+$/.test(snippet)) {
      findings.push(snippet);
    }
  }
  return findings;
}

const files = collectTsxFiles();
const i18nText = read(i18nPath);
const enKeys = extractEnKeys(i18nText);

let missingKeyErrors = [];
let hardcodedErrors = [];

for (const relativePath of files) {
  const fullPath = path.join(root, relativePath);
  const text = read(fullPath);

  const usedKeys = extractUsedTKeys(text);
  const missing = usedKeys.filter((key) => !enKeys.has(key));
  if (missing.length > 0) {
    missingKeyErrors.push({
      file: relativePath,
      keys: [...new Set(missing)].sort(),
    });
  }

  // Opt-out comment for specific file lines: // i18n-allow-hardcoded
  if (text.includes("i18n-allow-hardcoded")) continue;
  const hardcoded = detectHardcodedJsxText(text);
  if (hardcoded.length > 0) {
    hardcodedErrors.push({
      file: relativePath,
      count: hardcoded.length,
      sample: [...new Set(hardcoded)].slice(0, 5),
    });
  }
}

if (missingKeyErrors.length > 0) {
  console.error("i18n validation failed: missing translation keys in English dictionary.");
  for (const entry of missingKeyErrors) {
    console.error(`- ${entry.file}`);
    entry.keys.forEach((key) => console.error(`  • ${key}`));
  }
}

if (hardcodedErrors.length > 0) {
  console.error("i18n validation failed: hardcoded JSX text found.");
  for (const entry of hardcodedErrors) {
    console.error(`- ${entry.file} (${entry.count} hits)`);
    entry.sample.forEach((sample) => console.error(`  • ${sample}`));
  }
}

if (missingKeyErrors.length > 0 || hardcodedErrors.length > 0) {
  process.exit(1);
}

console.log("i18n validation passed.");
