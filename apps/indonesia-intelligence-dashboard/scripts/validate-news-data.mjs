#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(process.cwd(), 'public/data/news.json');
const data = JSON.parse(readFileSync(file, 'utf8'));
const errors = [];

if (!data.generatedAt || Number.isNaN(Date.parse(data.generatedAt))) errors.push('generatedAt must be a valid ISO timestamp');
if (!data.briefingTitle) errors.push('briefingTitle is required');
if (!Array.isArray(data.items) || data.items.length < 8 || data.items.length > 30) errors.push('items must contain 8-30 entries');

const ids = new Set();
const titles = new Set();
const allowedSentiment = new Set(['Positive', 'Neutral', 'Negative']);
for (const [i, item] of (data.items || []).entries()) {
  const prefix = `items[${i}]`;
  for (const key of ['id', 'date', 'topic', 'title', 'summary', 'sentiment', 'impact', 'source', 'sourceUrl']) {
    if (!item[key]) errors.push(`${prefix}.${key} is required`);
  }
  if (ids.has(item.id)) errors.push(`${prefix}.id is duplicated`);
  if (titles.has(item.title)) errors.push(`${prefix}.title is duplicated`);
  ids.add(item.id); titles.add(item.title);
  if (!allowedSentiment.has(item.sentiment)) errors.push(`${prefix}.sentiment is invalid`);
  if (typeof item.score !== 'number' || item.score < -1 || item.score > 1) errors.push(`${prefix}.score must be between -1 and 1`);
  if (typeof item.confidence !== 'number' || item.confidence < 0 || item.confidence > 1) errors.push(`${prefix}.confidence must be between 0 and 1`);
  try { new URL(item.sourceUrl); } catch { errors.push(`${prefix}.sourceUrl must be an absolute URL`); }
}

if (!data.marketInsights || !Array.isArray(data.marketInsights.forexComparison) || !Array.isArray(data.marketInsights.stockOpportunities)) {
  errors.push('marketInsights forexComparison and stockOpportunities are required arrays');
}

const ageHours = data.generatedAt ? (Date.now() - Date.parse(data.generatedAt)) / 3_600_000 : Infinity;
if (ageHours > 72) errors.push(`generatedAt is stale (${ageHours.toFixed(1)} hours old)`);
if (ageHours < -1) errors.push('generatedAt is unexpectedly in the future');

if (errors.length) {
  console.error(`Dashboard data validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Dashboard data valid: ${data.items.length} items, generatedAt=${data.generatedAt}`);
