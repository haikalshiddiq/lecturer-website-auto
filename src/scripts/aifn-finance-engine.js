// All fits are local teaching models. No network, mutable global state, or age decision feature.
export const CLASS_FEATURES = ['duration', 'log1p(amount)', 'installmentRate', 'existingCredits'];
export const REG_FEATURES = ['duration', 'installmentRate', 'existingCredits'];
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const ratio = (a, b) => b ? a / b : null;
const dot = (a, b) => a.reduce((s, x, j) => s + x * b[j], 0);
const sigmoid = x => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, x))));
const vector = r => [r.duration, Math.log1p(r.amount), r.installmentRate, r.existingCredits];
const regVector = r => REG_FEATURES.map(f => r[f]);
function random(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
}
function shuffle(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function validateRecords(records) {
  if (!Array.isArray(records) || records.length < 10) throw new Error('At least 10 complete records required');
  const ids = new Set();
  for (const r of records) {
    if (!Number.isInteger(r.sourceRow) || r.sourceRow < 1 || ids.has(r.sourceRow)) throw new Error('Invalid/duplicate sourceRow');
    ids.add(r.sourceRow);
    for (const f of ['duration', 'amount', 'installmentRate', 'existingCredits', 'age']) {
      if (!Number.isFinite(r[f]) || r[f] <= 0) throw new Error(`Missing/invalid ${f}`);
    }
    if (![0, 1].includes(r.risk)) throw new Error('risk must be 0 or 1');
  }
}
export function splitRecords(records, seed = 2026) {
  const rng = random(seed), train = [], test = [];
  for (const label of [0, 1]) {
    const group = shuffle(records.filter(r => r.risk === label), rng);
    if (group.length < 2) throw new Error('Both classes need at least two records');
    const n = Math.max(1, Math.min(group.length - 1, Math.floor(group.length * .8)));
    train.push(...group.slice(0, n)); test.push(...group.slice(n));
  }
  return { train, test };
}
function scaler(vectors) {
  const means = vectors[0].map((_, j) => mean(vectors.map(v => v[j])));
  const scales = means.map((m, j) => Math.sqrt(mean(vectors.map(v => (v[j] - m) ** 2))) || 1);
  return { means, scales };
}
const normalize = (v, s) => v.map((x, j) => (x - s.means[j]) / s.scales[j]);
export function fitLogistic(train, options = {}) {
  const iterations = options.iterations ?? 600, learningRate = .15, l2 = .01;
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 3000) throw new Error('Invalid iterations');
  const normalization = scaler(train.map(vector));
  const x = train.map(r => [1, ...normalize(vector(r), normalization)]);
  const weights = [Math.log((train.filter(r => r.risk).length + .5) / (train.filter(r => !r.risk).length + .5)), 0, 0, 0, 0];
  for (let step = 0; step < iterations; step++) {
    const gradient = Array(5).fill(0);
    x.forEach((v, i) => { const error = sigmoid(dot(weights, v)) - train[i].risk; v.forEach((a, j) => { gradient[j] += error * a; }); });
    weights.forEach((w, j) => { weights[j] -= learningRate * (gradient[j] / train.length + (j ? l2 * w : 0)); });
  }
  const predict = row => sigmoid(dot(weights, [1, ...normalize(vector(row), normalization)]));
  const logLoss = -mean(train.map(r => r.risk * Math.log(predict(r)) + (1 - r.risk) * Math.log(1 - predict(r))));
  return { weights, normalization, predict, iterations, logLoss, features: [...CLASS_FEATURES] };
}
function solve(matrix, target) {
  const a = matrix.map((row, i) => [...row, target[i]]), n = target.length;
  for (let j = 0; j < n; j++) {
    let pivot = j;
    for (let i = j + 1; i < n; i++) if (Math.abs(a[i][j]) > Math.abs(a[pivot][j])) pivot = i;
    [a[j], a[pivot]] = [a[pivot], a[j]];
    if (Math.abs(a[j][j]) < 1e-14) throw new Error('Singular regression');
    const divisor = a[j][j];
    for (let k = j; k <= n; k++) a[j][k] /= divisor;
    for (let i = 0; i < n; i++) if (i !== j) {
      const factor = a[i][j];
      for (let k = j; k <= n; k++) a[i][k] -= factor * a[j][k];
    }
  }
  return a.map(row => row[n]);
}
export function fitRegression(train) {
  const normalization = scaler(train.map(regVector));
  const x = train.map(r => [1, ...normalize(regVector(r), normalization)]);
  const gram = Array.from({ length: 4 }, () => Array(4).fill(0)), rhs = Array(4).fill(0);
  x.forEach((v, i) => v.forEach((a, j) => { rhs[j] += a * train[i].amount; v.forEach((b, k) => { gram[j][k] += a * b; }); }));
  for (let j = 1; j < 4; j++) gram[j][j] += 1e-8;
  const weights = solve(gram, rhs);
  const coefficients = Object.fromEntries(REG_FEATURES.map((f, j) => [f, weights[j + 1] / normalization.scales[j]]));
  const intercept = weights[0] - REG_FEATURES.reduce((s, f, j) => s + coefficients[f] * normalization.means[j], 0);
  return { intercept, coefficients, normalization, predict: r => intercept + REG_FEATURES.reduce((s, f) => s + coefficients[f] * r[f], 0) };
}
function checkScores(scores) {
  if (!Array.isArray(scores) || scores.some(r => !Number.isFinite(r.score) || ![0, 1].includes(r.actual))) throw new Error('Invalid scores');
}
export function metricsAt(scores, threshold) {
  checkScores(scores);
  if (!Number.isFinite(threshold)) throw new Error('Invalid threshold');
  const m = { TP: 0, FP: 0, TN: 0, FN: 0 };
  for (const r of scores) m[r.score >= threshold ? (r.actual ? 'TP' : 'FP') : (r.actual ? 'FN' : 'TN')]++;
  return { ...m, accuracy: ratio(m.TP + m.TN, scores.length), precision: ratio(m.TP, m.TP + m.FP), recall: ratio(m.TP, m.TP + m.FN), fpr: ratio(m.FP, m.FP + m.TN) };
}
export function auc(scores) {
  checkScores(scores);
  const positive = scores.filter(r => r.actual), negative = scores.filter(r => !r.actual);
  if (!positive.length || !negative.length) return null;
  let wins = 0;
  for (const p of positive) for (const n of negative) wins += p.score > n.score ? 1 : p.score === n.score ? .5 : 0;
  return wins / (positive.length * negative.length);
}
export function auditAt(scores, threshold) {
  checkScores(scores);
  if (scores.some(r => !Number.isFinite(r.age) || r.age <= 0)) throw new Error('Audit requires age');
  const groups = [{ label: 'age < 25', predicate: r => r.age < 25 }, { label: 'age >= 25', predicate: r => r.age >= 25 }].map(g => {
    const rows = scores.filter(g.predicate), m = metricsAt(rows, threshold);
    return { label: g.label, count: rows.length, good: m.FP + m.TN, bad: m.TP + m.FN, predictedBad: m.TP + m.FP, fprDenominator: m.FP + m.TN, ...m };
  });
  return { groups, fprGap: groups.every(g => g.fpr !== null) ? Math.abs(groups[0].fpr - groups[1].fpr) : null, zeroHandling: 'null means undefined: denominator is zero; never interpret as 0%', ageCutoff: 25 };
}
export function kmeans(records, k = 3, seed = 2026, maxIterations = 100) {
  if (!Number.isInteger(k) || k < 1 || k > records.length) throw new Error('Invalid k');
  if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 1000) throw new Error('Invalid iteration bound');
  const normalization = scaler(records.map(r => [r.amount, r.duration]));
  const x = records.map(r => normalize([r.amount, r.duration], normalization));
  const distance = (a, b) => a.reduce((s, v, j) => s + (v - b[j]) ** 2, 0);
  let centers = [[...x[Math.floor(random(seed)() * x.length)]]];
  while (centers.length < k) {
    const distances = x.map(v => Math.min(...centers.map(c => distance(v, c))));
    centers.push([...x[distances.indexOf(Math.max(...distances))]]);
  }
  let assignments = [], iterations = 0, converged = false;
  const history = [];
  for (; iterations < maxIterations;) {
    iterations++;
    const next = x.map(v => centers.reduce((best, c, j) => distance(v, c) < distance(v, centers[best]) ? j : best, 0));
    if (next.every((a, i) => a === assignments[i])) { converged = true; break; }
    assignments = next;
    centers = centers.map((c, j) => {
      const members = x.filter((_, i) => assignments[i] === j);
      return members.length ? c.map((_, d) => mean(members.map(v => v[d]))) : c;
    });
    history.push(x.reduce((s, v, i) => s + distance(v, centers[assignments[i]]), 0));
  }
  return { points: records.map((r, i) => ({ amount: r.amount, duration: r.duration, cluster: assignments[i] })), centroids: centers.map((c, cluster) => ({ cluster, amount: c[0] * normalization.scales[0] + normalization.means[0], duration: c[1] * normalization.scales[1] + normalization.means[1], count: assignments.filter(a => a === cluster).length })), inertia: history.at(-1) ?? 0, iterations, converged, history, normalization };
}
export function analyzeFinance(records, options = {}) {
  validateRecords(records);
  const seed = options.seed ?? 2026;
  if (!Number.isInteger(seed)) throw new Error('seed must be integer');
  const { train, test } = splitRecords(records, seed);
  const logistic = fitLogistic(train), regression = fitRegression(train);
  const scores = test.map(r => ({ score: logistic.predict(r), actual: r.risk, age: r.age, amount: r.amount, duration: r.duration, sourceRow: r.sourceRow }));
  const regRows = test.map(r => ({ actual: r.amount, predicted: regression.predict(r), duration: r.duration }));
  const baseline = mean(train.map(r => r.amount));
  const prevalence = mean(train.map(r => r.risk));
  return {
    summary: { count: records.length, good: records.filter(r => !r.risk).length, bad: records.filter(r => r.risk).length, missing: 0 },
    split: { trainCount: train.length, testCount: test.length, seed, trainRows: train.map(r => r.sourceRow), testRows: test.map(r => r.sourceRow) },
    regression: { mae: mean(regRows.map(r => Math.abs(r.actual - r.predicted))), baselineMae: mean(regRows.map(r => Math.abs(r.actual - baseline))), intercept: regression.intercept, coefficients: regression.coefficients, rows: regRows, normalization: regression.normalization, baseline },
    classification: { auc: auc(scores), scores, weights: logistic.weights, features: logistic.features, normalization: logistic.normalization, iterations: logistic.iterations, trainLogLoss: logistic.logLoss, baselineLogLoss: -prevalence * Math.log(prevalence) - (1 - prevalence) * Math.log(1 - prevalence), metrics: metricsAt(scores, .5), roc: [1.000001, ...new Set(scores.map(r => r.score).sort((a, b) => b - a))].map(threshold => ({ threshold, ...metricsAt(scores, threshold) })) },
    clustering: kmeans(records, 3, seed),
    audit: auditAt(scores, .5),
  };
}
