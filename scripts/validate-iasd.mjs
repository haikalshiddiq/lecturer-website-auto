import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

// Immutable content baseline from the user-supplied IASD HTML, not the unprovided RPS document.
const sourceHash = '57e2ae3ef483c078453d0f6d521dde30901db7b8f7d727c0741688e1246c8b67';
const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
};
const hash = value => crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const course = JSON.parse(fs.readFileSync('src/data/iasd-course.json', 'utf8'));
assert.equal(hash(course), sourceHash, 'IASD source content drifted from the supplied attachment; review any intentional content revision explicitly');
assert.equal(course.lessons.length, 16);
assert.equal(course.lessons.reduce((n, lesson) => n + lesson.quiz.length, 0), 48);
assert.equal(Object.keys(course.files).length, 13);
assert.equal(Object.keys(course.sources).length, 16);
for (const [index, lesson] of course.lessons.entries()) {
  assert.equal(lesson.n, index + 1);
  assert.equal(lesson.concepts.length, 3);
  assert.equal(lesson.steps.length, 8);
  assert.equal(lesson.prompts.length, 3);
  for (const quiz of lesson.quiz) assert.ok(Number.isInteger(quiz.answer) && quiz.options[quiz.answer], `Invalid quiz answer in session ${lesson.n}`);
  for (const ref of lesson.refs) assert.ok(course.sources[ref], `Missing source ${ref}`);
}
const overview = fs.readFileSync('dist/iasd/index.html', 'utf8');
const studio = fs.readFileSync('dist/iasd/studio/index.html', 'utf8');
assert.ok(overview.includes('data-iasd-overview') && overview.includes('data-iasd-teach'), 'IASD student or instructor entry missing');
assert.ok(studio.includes('data-iasd-studio') && !studio.includes('<iframe'), 'Native IASD studio missing');
const embedded = studio.match(/<script\b[^>]*id="course-data"[^>]*>([\s\S]*?)<\/script>/);
assert.ok(embedded, 'Built studio is missing its bundled course content');
assert.equal(hash(JSON.parse(embedded[1])), sourceHash, 'Built IASD content differs from attachment');
const supplements = JSON.parse(fs.readFileSync('src/data/iasd-supplements.json', 'utf8'));
const supplementEmbed = studio.match(/<script\b[^>]*id="supplement-data"[^>]*>([\s\S]*?)<\/script>/);
assert.ok(supplementEmbed, 'IASD supplement content is not bundled for rendering');
assert.deepEqual(JSON.parse(supplementEmbed[1]), supplements, 'Built supplements differ from source');
for (const [session, supplement] of Object.entries(supplements)) {
  assert.ok(course.lessons.some(lesson => String(lesson.n) === session), `Unknown supplement session ${session}`);
  for (const field of ['title', 'basis', 'inputs', 'result', 'misconception', 'transfer', 'artifact', 'rubric']) assert.ok(supplement[field]?.trim(), `Missing supplement ${session}: ${field}`);
  assert.ok(supplement.reasoning.length >= 3 && supplement.instructor.length >= 3, 'Worked reasoning or facilitation missing');
  assert.ok(!JSON.stringify(supplement).includes('\u2014'), 'Supplement contains an em dash');
}
assert.ok(overview.includes('data-iasd-supplement-entry'), 'Supplement entry missing from overview');
for (const route of ['dist/index.html', 'dist/resources/index.html']) assert.ok(fs.readFileSync(route, 'utf8').includes('/iasd'), `${route} lacks an IASD entry`);
console.log('IASD attachment gate passed: 16 sessions, 48 concepts, 128 practice steps, 48 quizzes, 48 reflections, 13 files and 16 sources preserved.');
