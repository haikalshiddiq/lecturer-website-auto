import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');
const publicRoot = path.resolve(process.cwd(), 'public');
const patterns = ['linkedin.com/in/hicall', 'github.com/haikalshiddiq'];
const files = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (/\.(astro|md|mdx|ts|js)$/.test(item.name)) files.push(full);
  }
}

walk(root);
const content = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const missing = patterns.filter((pattern) => !content.includes(pattern));

const missingDownloads = [];
for (const file of files.filter((file) => /src\/content\/resources\/.*\.mdx?$/.test(file))) {
  const source = fs.readFileSync(file, 'utf8');
  const matches = source.matchAll(/^downloadUrl:\s+(.+)$/gm);
  for (const match of matches) {
    const downloadUrl = match[1].trim();
    if (!downloadUrl.startsWith('/')) continue;

    const publicPath = path.join(publicRoot, downloadUrl);
    if (!fs.existsSync(publicPath)) {
      missingDownloads.push(`${path.relative(process.cwd(), file)} -> ${downloadUrl}`);
    }
  }
}

if (missing.length) {
  console.error('Missing expected profile links:', missing.join(', '));
  process.exit(1);
}

if (missingDownloads.length) {
  console.error('Missing downloadable assets:');
  for (const item of missingDownloads) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Basic content link check passed.');
