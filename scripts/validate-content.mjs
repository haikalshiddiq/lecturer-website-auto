import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const validationRoot = process.env.VALIDATE_CONTENT_ROOT
  ? path.resolve(process.env.VALIDATE_CONTENT_ROOT)
  : process.cwd();

const expectedTopics = [
  'Information System Management',
  'Communication Protocol',
  'Artificial Intelligence'
];

const collections = [
  {
    name: 'topic files',
    dir: 'src/content/topics',
    topicFromFrontmatter: (data) => data.title
  },
  {
    name: 'resources',
    dir: 'src/content/resources',
    topicFromFrontmatter: (data) => data.topic
  },
  {
    name: 'recent blog posts',
    dir: 'src/content/blog',
    topicFromFrontmatter: (data) => data.topic
  },
  {
    name: 'publication concepts',
    dir: 'src/content/publications',
    topicFromFrontmatter: (data) => data.topic
  }
];

const markdownExtension = /\.(md|mdx)$/;

function collectionPath(collection) {
  return path.resolve(validationRoot, collection.dir);
}

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && markdownExtension.test(entry.name))
    .map((entry) => path.join(dir, entry.name));
}

function countTopics(collection) {
  const counts = new Map(expectedTopics.map((topic) => [topic, 0]));

  for (const file of readMarkdownFiles(collectionPath(collection))) {
    const { data } = matter(fs.readFileSync(file, 'utf8'));
    const topic = collection.topicFromFrontmatter(data);

    if (counts.has(topic)) {
      counts.set(topic, counts.get(topic) + 1);
    }
  }

  return counts;
}

const failures = [];

for (const collection of collections) {
  const full = collectionPath(collection);

  if (!fs.existsSync(full) || readMarkdownFiles(full).length === 0) {
    failures.push(`${collection.dir} has no markdown content`);
    continue;
  }

  const counts = countTopics(collection);

  for (const topic of expectedTopics) {
    const count = counts.get(topic) || 0;

    if (count < 1) {
      failures.push(`${topic} has ${count} ${collection.name}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Content coverage validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Content coverage validation passed.');
