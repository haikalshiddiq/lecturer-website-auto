import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const queueDir = path.resolve(process.cwd(), 'automation/daily-content-queue');
const publishedDir = path.join(queueDir, 'published');
const today = process.env.DAILY_CONTENT_DATE || new Date().toISOString().slice(0, 10);
const dryRun = process.env.DAILY_CONTENT_DRY_RUN === '1';

function listQueueFiles() {
  if (!fs.existsSync(queueDir)) return [];

  return fs
    .readdirSync(queueDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(queueDir, entry.name))
    .sort();
}

function buildTargetFrontmatter(data) {
  if (data.targetCollection !== 'blog') {
    throw new Error(`Unsupported targetCollection: ${data.targetCollection}`);
  }

  const publishDate = data.publishOn instanceof Date
    ? data.publishOn.toISOString().slice(0, 10)
    : String(data.publishOn || today).trim();

  return {
    title: data.title,
    summary: data.summary,
    topic: data.topic,
    publishedAt: publishDate,
    featured: Boolean(data.featured),
    tags: Array.isArray(data.tags) ? data.tags : []
  };
}

function publishNextDueEntry() {
  const queueFiles = listQueueFiles();
  if (!queueFiles.length) {
    console.log('No queued content files found.');
    return { changed: false, reason: 'empty-queue' };
  }

  for (const file of queueFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const publishOn = data.publishOn instanceof Date
      ? data.publishOn.toISOString().slice(0, 10)
      : String(data.publishOn || '').trim();

    if (!publishOn) {
      throw new Error(`Missing publishOn in ${path.basename(file)}`);
    }

    if (publishOn > today) {
      continue;
    }

    if (!data.targetSlug || !data.targetCollection) {
      throw new Error(`Missing target metadata in ${path.basename(file)}`);
    }

    const targetPath = path.resolve(
      process.cwd(),
      'src/content',
      data.targetCollection,
      `${data.targetSlug}.md`
    );

    if (fs.existsSync(targetPath)) {
      throw new Error(`Target already exists: ${targetPath}`);
    }

    const frontmatter = buildTargetFrontmatter(data);
    const output = matter.stringify(`${content.trim()}\n`, frontmatter);

    if (dryRun) {
      console.log(`DRY_RUN would publish ${path.basename(file)} -> ${path.relative(process.cwd(), targetPath)}`);
      return { changed: false, reason: 'dry-run', targetPath };
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, output);
    fs.mkdirSync(publishedDir, { recursive: true });
    fs.renameSync(file, path.join(publishedDir, path.basename(file)));

    console.log(`Published ${path.basename(file)} -> ${path.relative(process.cwd(), targetPath)}`);
    return { changed: true, targetPath };
  }

  console.log(`No queued content is due on ${today}.`);
  return { changed: false, reason: 'nothing-due' };
}

publishNextDueEntry();
