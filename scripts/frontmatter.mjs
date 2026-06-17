import yaml from 'js-yaml';

const fencePattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;

export function parseFrontmatter(raw) {
  const match = String(raw || '').match(fencePattern);
  if (!match) {
    return { data: {}, content: String(raw || '') };
  }

  const data = yaml.load(match[1]) || {};
  return {
    data: typeof data === 'object' && !Array.isArray(data) ? data : {},
    content: match[2] || ''
  };
}

export function stringifyFrontmatter(content, data) {
  const frontmatter = yaml.dump(data || {}, {
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false
  }).trimEnd();

  return `---\n${frontmatter}\n---\n\n${String(content || '').replace(/^\n+/, '')}`;
}
