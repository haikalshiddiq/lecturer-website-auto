import fs from 'node:fs';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const checked = [];
for (const key of ['iasd', 'aifn']) {
  const source = JSON.parse(fs.readFileSync(`src/data/${key}-course.json`, 'utf8'));
  const lessons = source.lessons || source.course?.lessons;
  assert(Array.isArray(lessons) && lessons.length === 16, `${key}: expected all 16 sessions`);
  const html = fs.readFileSync(`dist/${key}/studio/index.html`, 'utf8');
  assert(html.includes(`data-${key}-studio`), `${key}: missing native studio`);
  const embedded = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => {
    try { return [JSON.parse(match[1])]; } catch { return []; }
  });
  assert(embedded.some((data) => JSON.stringify(data) === JSON.stringify(source)), `${key}: built course data differs from source`);
  const overview = fs.readFileSync(`dist/${key}/index.html`, 'utf8');
  assert(overview.includes(`data-${key}-overview`), `${key}: missing course overview`);
  assert(overview.includes(`${key}/studio`), `${key}: student entry does not lead to studio`);
  assert(overview.includes('mode=teach'), `${key}: missing instructor entry`);
  assert(html.includes('https://hicall.web.id'), `${key}: missing canonical production domain`);
  checked.push({ course: key, sessions: lessons.length, embeddedSourceExact: true });
}
const home = fs.readFileSync('dist/index.html', 'utf8');
assert(home.includes('data-aifn-home') && home.includes('data-iasd-home'), 'Homepage must expose both active courses');
assert(home.includes('data-compact-home'), 'Compact homepage contract regressed');
console.log(JSON.stringify({ checked, totalSessions: checked.reduce((sum, row) => sum + row.sessions, 0), scope: 'Built course integrity and discoverability. Per-session rendered visual and control behavior require browser smoke.' }, null, 2));
