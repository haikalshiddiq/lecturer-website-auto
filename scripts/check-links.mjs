import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src');
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

if (missing.length) {
  console.error('Missing expected profile links:', missing.join(', '));
  process.exit(1);
}

console.log('Basic content link check passed.');
