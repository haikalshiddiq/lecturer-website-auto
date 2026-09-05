#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(process.cwd(), 'public/data/weekly.json');
const report = JSON.parse(readFileSync(file, 'utf8'));
const errors = [];
const required = (condition, message) => { if (!condition) errors.push(message); };

required(report.generatedAt && !Number.isNaN(Date.parse(report.generatedAt)), 'generatedAt must be a valid ISO timestamp');
required(report.period?.start && report.period?.end && report.period?.label, 'period start, end, and label are required');
required(['monitor', 'prepare', 'act'].includes(report.status?.level), 'status.level must be monitor, prepare, or act');
required(['Pantau', 'Siapkan Opsi', 'Pertimbangkan Bertindak'].includes(report.status?.label), 'status.label is invalid');
required(Number.isInteger(report.status?.conditionIndex) && report.status.conditionIndex >= 0 && report.status.conditionIndex <= 100, 'status.conditionIndex must be an integer from 0 to 100');
required(['Low', 'Medium'].includes(report.status?.confidence), 'status.confidence must be Low or Medium');
required(['Insufficient', 'Sufficient'].includes(report.status?.dataSufficiency), 'status.dataSufficiency is invalid');
required(Boolean(report.status?.dataQualifier), 'status.dataQualifier is required');
required(Boolean(report.status?.caveat), 'status caveat is required');
required(report.metrics?.articles >= 18, 'metrics.articles must be at least 18');
required(report.metrics?.sources >= 5, 'metrics.sources must be at least 5');
required(report.metrics?.categoriesTracked >= 10, 'at least 10 fields must be tracked');
required(report.metrics?.categoriesCovered <= report.metrics?.categoriesTracked, 'covered categories cannot exceed tracked categories');
required(Array.isArray(report.dailyTrend) && report.dailyTrend.length === 7, 'dailyTrend must contain exactly 7 days');
required(Array.isArray(report.topicScores) && report.topicScores.length === report.metrics?.categoriesTracked, 'topicScores must include every tracked field');
required(Array.isArray(report.highlights) && report.highlights.length >= 8, 'at least 8 highlights are required');
required(Array.isArray(report.decisionTriggers) && report.decisionTriggers.length >= 4, 'at least 4 family decision triggers are required');
required(Array.isArray(report.relocationRadar) && report.relocationRadar.length === 3, 'relocationRadar must contain Malaysia, Taiwan, and Japan');
required(Boolean(report.methodology?.sentiment && report.methodology?.status && report.methodology?.limitations), 'methodology disclosure is incomplete');

const ids = new Set();
for (const [index, item] of (report.highlights || []).entries()) {
  for (const key of ['id', 'date', 'topic', 'title', 'source', 'sourceUrl', 'sentiment']) {
    required(Boolean(item[key]), `highlights[${index}].${key} is required`);
  }
  required(!ids.has(item.id), `highlights[${index}].id is duplicated`);
  ids.add(item.id);
  required(typeof item.score === 'number' && item.score >= -1 && item.score <= 1, `highlights[${index}].score must be between -1 and 1`);
  try { new URL(item.sourceUrl); } catch { errors.push(`highlights[${index}].sourceUrl must be absolute`); }
}

const countries = new Set((report.relocationRadar || []).map(item => item.country));
for (const country of ['Malaysia', 'Taiwan', 'Japan']) required(countries.has(country), `relocationRadar is missing ${country}`);
for (const [index, country] of (report.relocationRadar || []).entries()) {
  for (const key of ['careerSignal', 'familySignal', 'planningFocus', 'officialLabel']) {
    required(Boolean(country[key]), `relocationRadar[${index}].${key} is required`);
  }
  try { new URL(country.officialUrl); } catch { errors.push(`relocationRadar[${index}].officialUrl must be absolute`); }
}

const ageHours = report.generatedAt ? (Date.now() - Date.parse(report.generatedAt)) / 3_600_000 : Infinity;
required(ageHours <= 24 * 8, `weekly report is stale (${ageHours.toFixed(1)} hours old)`);
required(ageHours >= -1, 'weekly generatedAt is unexpectedly in the future');

if (errors.length) {
  console.error(`Weekly report validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Weekly report valid: ${report.metrics.articles} articles, ${report.metrics.sources} sources, ${report.metrics.categoriesCovered}/${report.metrics.categoriesTracked} fields, status=${report.status.label}`);
