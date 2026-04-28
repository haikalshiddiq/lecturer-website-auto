import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const collections = ['blog', 'resources', 'publications'];
const contentSummary = Object.fromEntries(
  collections.map((name) => {
    const dir = path.join(root, 'src/content', name);
    const count = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((file) => file.endsWith('.md') || file.endsWith('.mdx')).length
      : 0;

    return [name, count];
  })
);

const queueDir = path.join(root, 'automation/daily-content-queue');
const queueCount = fs.existsSync(queueDir)
  ? fs
      .readdirSync(queueDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md')).length
  : 0;

const report = {
  generatedAt: new Date().toISOString(),
  focus: [
    'repository health',
    'CI/CD health',
    'daily content queue',
    'content quality and SEO checks'
  ],
  collections: contentSummary,
  dailyContentQueue: {
    pending: queueCount,
    workflow: '.github/workflows/daily-content-pipeline.yml'
  },
  deploymentFlow: [
    'Daily Content Pipeline publishes queued content to main',
    'CI validates the repository',
    'Deploy Cloudflare Pages runs after successful CI on main',
    'Deploy Cloudflare Worker runs after successful CI on main'
  ]
};

console.log(JSON.stringify(report, null, 2));
