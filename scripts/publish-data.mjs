#!/usr/bin/env node
// Usage: npm run publish-data -- /path/to/knowledge-graph.json
//
// Takes the JSON file you exported from Settings -> Export -> JSON and
// makes it the app's live data file (src/data/initial-data.json), after
// saving a timestamped copy of whatever was there before into
// src/data/backups/. Nothing needs to be copy-pasted by hand.

import { existsSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, '..', 'src', 'data', 'initial-data.json');
const backupsDir = join(__dirname, '..', 'src', 'data', 'backups');

const sourceArg = process.argv[2];

if (!sourceArg) {
  console.error('\nUsage: npm run publish-data -- /path/to/exported-file.json\n');
  process.exit(1);
}

const sourcePath = resolve(sourceArg);

if (!existsSync(sourcePath)) {
  console.error(`\nCould not find file: ${sourcePath}\n`);
  process.exit(1);
}

// Sanity-check: make sure it at least looks like an export from this app
// (has a nodes array) before we overwrite anything.
let parsed;
try {
  parsed = JSON.parse(readFileSync(sourcePath, 'utf-8'));
} catch {
  console.error(`\n"${sourcePath}" is not valid JSON.\n`);
  process.exit(1);
}
if (!Array.isArray(parsed.nodes)) {
  console.error(
    `\n"${sourcePath}" doesn't look like an exported knowledge graph file (no "nodes" array found).\n`
  );
  process.exit(1);
}

mkdirSync(backupsDir, { recursive: true });

if (existsSync(dataFile)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(backupsDir, `initial-data.${stamp}.json`);
  copyFileSync(dataFile, backupPath);
  console.log(`Backed up previous data -> src/data/backups/initial-data.${stamp}.json`);
}

copyFileSync(sourcePath, dataFile);
console.log(`Updated src/data/initial-data.json from ${sourcePath}`);
console.log('\nNext steps:');
console.log('  git add src/data/initial-data.json src/data/backups');
console.log('  git commit -m "Update progress"');
console.log('  git push\n');
