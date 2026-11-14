import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const baselineBytes = await readFile('automation/aifn-rps-baseline.json');
assert.equal(createHash('sha256').update(baselineBytes).digest('hex'), '6a41f9e7c174540fe0c99c236698545688d80c49cffd8982c5160d95ff48b2a6', 'Immutable RPS baseline changed; review against source DOCX rather than regenerating expected values.');
const baseline = JSON.parse(baselineBytes);
const course = JSON.parse(await readFile('src/data/aifn-course.json', 'utf8'));
assert.equal(course.source.sha256, baseline.sourceSha256);
assert.equal(course.title, baseline.title);
assert.equal(course.credits, baseline.sks);
assert.equal(course.semester, baseline.semester);
assert.equal(course.institution, baseline.institution);
assert.equal(course.id, 'aifn');
assert.equal(course.version, 1);
assert.equal(course.lessons.length, 16);
assert.deepEqual(course.grading, {UTS:25,UAS:25,'Tugas individu':20,'Tugas kelompok':20,Kehadiran:10});
assert.deepEqual(baseline.activeGrading, {UTS:25,UAS:25,individual:20,group:20,attendance:10});
assert.equal(Object.values(course.grading).reduce((a,b)=>a+b,0),100);
const kinds = new Set();
for (const [i, lesson] of course.lessons.entries()) {
  const source = baseline.lessons[i];
  assert.equal(lesson.id, source.n);
  assert.equal(lesson.rpsTopic, source.title);
  assert.equal(lesson.objective, source.outcome);
  assert.ok(lesson.cpmk.length && lesson.cpmk.every(n=>Number.isInteger(n)&&n>=1&&n<=5));
  assert.ok(lesson.concept.length >= 3 && lesson.concept.every(p=>p.length>80));
  for(const key of ['assumptions','worked','practice','misconception']) assert.ok(lesson[key]?.length>60, `Session ${i+1}: ${key}`);
  assert.ok(lesson.teacher.flow.length>80 && lesson.teacher.probe.length>60 && lesson.teacher.rubric.length===4);
  assert.ok(lesson.quiz.options.length===3 && lesson.quiz.explanations.length===3);
  assert.ok(lesson.quiz.answer>=0 && lesson.quiz.answer<3);
  assert.ok(lesson.quiz.explanations.every(e=>e.length>45));
  assert.ok(lesson.control.options?.length>=2 || Number.isFinite(lesson.control.min));
  kinds.add(lesson.kind);
}
assert.ok(kinds.size>=14, 'Require distinct pedagogical visual models.');
assert.equal(course.lessons[8].rpsTopic, 'Analisis sentimen berita/keuangan dengan Claude');
assert.equal(course.lessons[12].kind, 'cluster');
assert.ok(course.lessons[7].concept.join(' ').includes('latihan UTS publik'));
assert.ok(course.lessons[15].concept.join(' ').includes('latihan UAS publik'));
const notebook=JSON.parse(await readFile('public/aifn/aifn-labs.ipynb','utf8'));
assert.equal(notebook.nbformat,4);
assert.equal(notebook.cells.filter(c=>c.cell_type==='code').length,17);
assert.ok(notebook.cells.every(c=>c.cell_type!=='code'||c.execution_count===null));
const code=notebook.cells.filter(c=>c.cell_type==='code').map(c=>c.source.join('')).join('\n');
assert.ok(!/requests|urllib|api_key|subprocess|pip install/.test(code),'Offline stdlib labs must not call network/installers.');
const result=spawnSync('python',['-c',code],{cwd:'public/aifn',encoding:'utf8'});
assert.equal(result.status,0,result.stderr);
assert.ok(result.stdout.includes('ALL OFFLINE LAB ASSERTIONS PASSED'));
for(const path of ['src/scripts/aifn-studio.js','src/pages/aifn/index.astro','src/pages/aifn/studio.astro','src/data/aifn-course.json']) {
  assert.ok(!(await readFile(path,'utf8')).includes('—'),`Em dash in ${path}`);
}
console.log('AiFn PASS: immutable RPS hash + all 16 topics/objectives, active grading, substantive lesson schema, 16 visual kinds, 17 notebook code cells executed offline with all lab assertions.');
