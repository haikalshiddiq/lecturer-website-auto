import fs from 'node:fs';
import { execSync } from 'node:child_process';
import matter from 'gray-matter';

const baseRef = process.env.DAILY_CONTENT_BASE_REF || 'origin/main';

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function tryRun(command) {
  try {
    return run(command);
  } catch {
    return '';
  }
}

function parseDiffOutput(output) {
  return output.split('\n').filter(Boolean).map((line) => {
    const parts = line.split('\t');
    const status = parts[0];

    if (status.startsWith('R') || status.startsWith('C')) {
      return { status, oldPath: parts[1], path: parts[2] };
    }

    return { status, path: parts[1] };
  });
}

function parseDiff() {
  const committedRangeDiff = tryRun(`git diff --name-status --find-renames ${baseRef}...HEAD`);
  if (committedRangeDiff) {
    return parseDiffOutput(committedRangeDiff);
  }

  const stagedWorkspaceDiff = tryRun(`git diff --cached --name-status --find-renames ${baseRef}`);
  if (stagedWorkspaceDiff) {
    return parseDiffOutput(stagedWorkspaceDiff);
  }

  throw new Error(`No committed or staged file changes detected against ${baseRef}.`);
}

function isQueueRootFile(filePath) {
  return filePath?.startsWith('automation/daily-content-queue/') && !filePath.startsWith('automation/daily-content-queue/published/');
}

function isPublishedArchive(filePath) {
  return filePath?.startsWith('automation/daily-content-queue/published/');
}

function isBlogFile(filePath) {
  return filePath?.startsWith('src/content/blog/') && filePath.endsWith('.md');
}

function normaliseDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || '').trim();
}

function toBranchSafeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'daily-content';
}

function writeOutputs(result, reviewBody) {
  if (!process.env.GITHUB_OUTPUT) return;

  const lines = [
    `title=${result.title}`,
    `published_at=${result.publishedAt}`,
    `branch_suffix=${toBranchSafeSlug(result.publishedAt)}`,
    `target_path=${result.targetPath}`,
    `archived_queue_path=${result.archivedQueuePath}`,
    `queue_source_path=${result.queueSourcePath}`,
    `summary=${result.summary}`,
    'review_body<<EOF',
    reviewBody,
    'EOF'
  ];

  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
}

const changes = parseDiff();
const blogFiles = changes.filter((entry) => isBlogFile(entry.path));
const archivedQueueFiles = changes.filter((entry) => isPublishedArchive(entry.path));
const queueSourceFiles = changes.filter((entry) => {
  if (entry.status.startsWith('R') || entry.status.startsWith('C')) {
    return isQueueRootFile(entry.oldPath);
  }

  return entry.status === 'D' && isQueueRootFile(entry.path);
});

const unexpected = changes.filter((entry) => {
  const paths = [entry.oldPath, entry.path].filter(Boolean);
  return paths.some((filePath) => !isBlogFile(filePath) && !isQueueRootFile(filePath) && !isPublishedArchive(filePath));
});

if (blogFiles.length !== 1) {
  throw new Error(`Expected exactly one published blog file, found ${blogFiles.length}.`);
}

if (archivedQueueFiles.length !== 1) {
  throw new Error(`Expected exactly one archived queue file, found ${archivedQueueFiles.length}.`);
}

if (queueSourceFiles.length !== 1) {
  throw new Error(`Expected exactly one source queue removal/rename, found ${queueSourceFiles.length}.`);
}

if (unexpected.length > 0) {
  throw new Error(`Unexpected changed files in daily content PR: ${unexpected.map((entry) => entry.path || entry.oldPath).join(', ')}`);
}

const blogPath = blogFiles[0].path;
const archivedQueuePath = archivedQueueFiles[0].path;
const queueSourcePath = queueSourceFiles[0].oldPath || queueSourceFiles[0].path;
const { data } = matter(fs.readFileSync(blogPath, 'utf8'));

const requiredFields = ['title', 'summary', 'topic', 'publishedAt'];
const missingFields = requiredFields.filter((field) => !String(data[field] || '').trim());
if (missingFields.length > 0) {
  throw new Error(`Published article is missing required frontmatter fields: ${missingFields.join(', ')}`);
}

const result = {
  title: String(data.title).trim(),
  summary: String(data.summary).trim(),
  topic: String(data.topic).trim(),
  publishedAt: normaliseDate(data.publishedAt),
  tags: Array.isArray(data.tags) ? data.tags : [],
  targetPath: blogPath,
  archivedQueuePath,
  queueSourcePath
};

const reviewBody = [
  `- **Title:** ${result.title}`,
  `- **Publish date:** ${result.publishedAt}`,
  `- **Topic:** ${result.topic}`,
  `- **Published file:** \`${result.targetPath}\``,
  `- **Archived queue entry:** \`${result.archivedQueuePath}\``,
  `- **Summary:** ${result.summary}`,
  result.tags.length ? `- **Tags:** ${result.tags.join(', ')}` : '- **Tags:** _(none)_'
].join('\n');

writeOutputs(result, reviewBody);
console.log(JSON.stringify({ ...result, reviewBody }, null, 2));
