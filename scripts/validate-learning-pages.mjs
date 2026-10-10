import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const collections = ['resources', 'blog'];
const requiredMarkers = ['data-learning-visual', 'data-lms-workspace', 'data-learning-progress'];
const failures = [];
let checked = 0;

for (const collection of collections) {
  const builtDir = path.join(root, 'dist', collection);
  const slugs = fs.readdirSync(builtDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (slugs.length === 0) failures.push(`${collection}: no built detail pages found`);

  for (const slug of slugs) {
    const builtPath = path.join(builtDir, slug, 'index.html');
    if (!fs.existsSync(builtPath)) {
      failures.push(`${collection}/${slug}: built page is missing`);
      continue;
    }

    const html = fs.readFileSync(builtPath, 'utf8');
    checked += 1;
    for (const marker of requiredMarkers) {
      if (!html.includes(marker)) failures.push(`${collection}/${slug}: missing ${marker}`);
    }
    if (collection === 'resources' && !html.includes('data-practice-workspace')) {
      failures.push(`${collection}/${slug}: interactive practice workspace is missing`);
    }
    if (!/data-visual-model="(system-map|protocol-flow|ai-lifecycle)"/.test(html)) {
      failures.push(`${collection}/${slug}: visual model is missing or invalid`);
    }
    if (!/<title[^>]*>[^<]+<\/title>/.test(html) || !/<desc[^>]*>[^<]+<\/desc>/.test(html)) {
      failures.push(`${collection}/${slug}: accessible SVG title or description is missing`);
    }
  }
}

if (failures.length) {
  console.error(`Learning presentation gate failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Learning presentation gate passed for ${checked} built resource and blog pages.`);
