import fs from 'node:fs';
import path from 'node:path';

const requiredDirs = [
  'src/content/topics',
  'src/content/resources',
  'src/content/publications'
];

for (const dir of requiredDirs) {
  const full = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(full) || fs.readdirSync(full).length === 0) {
    console.error(`Missing content in ${dir}`);
    process.exit(1);
  }
}

console.log('Content structure validation passed.');
