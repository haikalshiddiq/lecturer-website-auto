const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 lecturer-website-smoke-check/1.0';
const TIMEOUT_MS = 15000;
const RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const checks = [
  {
    name: 'Pages home content',
    url: 'https://lecturer-materials.pages.dev/',
    expectedStatus: 200,
    expectedText: 'Turn every visit into a guided learning journey'
  },
  {
    name: 'Pages resources content',
    url: 'https://lecturer-materials.pages.dev/resources/',
    expectedStatus: 200,
    expectedText: 'An interactive library for lecture materials, curated notes, and downloadable class assets'
  },
  {
    name: 'Pages blog content',
    url: 'https://lecturer-materials.pages.dev/blog/',
    expectedStatus: 200,
    expectedText: 'This blog is designed to feel active, useful, and academically credible.'
  },
  {
    name: 'Worker contact endpoint CORS preflight',
    url: 'https://lecturer-materials.hicall.workers.dev/api/contact',
    method: 'OPTIONS',
    expectedStatus: 204,
    validateHeaders(headers) {
      const allowedMethods = headers.get('access-control-allow-methods') || '';
      if (!allowedMethods.includes('POST') || !allowedMethods.includes('OPTIONS')) {
        return `expected access-control-allow-methods to include POST and OPTIONS, got ${JSON.stringify(allowedMethods)}`;
      }

      return null;
    }
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
        ...(options.headers || {})
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function runCheck(check) {
  const method = check.method || 'GET';
  const response = await fetchWithTimeout(check.url, { method });
  const body = method === 'HEAD' || response.status === 204 ? '' : await response.text();

  if (response.status !== check.expectedStatus) {
    return `expected HTTP ${check.expectedStatus}, got HTTP ${response.status}`;
  }

  if (check.expectedText && !body.includes(check.expectedText)) {
    return `expected response body to include ${JSON.stringify(check.expectedText)}`;
  }

  if (check.validateHeaders) {
    return check.validateHeaders(response.headers);
  }

  return null;
}

async function runCheckWithRetries(check) {
  let lastError = 'unknown failure';

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const error = await runCheck(check);
      if (!error) {
        return { ok: true, attempt };
      }
      lastError = error;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < RETRIES) {
      console.log(`  retrying after failure (${attempt}/${RETRIES}): ${lastError}`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  return { ok: false, error: lastError };
}

console.log('Live Cloudflare smoke check');
console.log('Checking live Pages/Worker responses for expected deployed content, not only HTTP reachability.');

const failures = [];

for (const check of checks) {
  console.log(`\n→ ${check.name}`);
  console.log(`  ${check.method || 'GET'} ${check.url}`);

  const result = await runCheckWithRetries(check);

  if (result.ok) {
    const retryNote = result.attempt > 1 ? ` after ${result.attempt} attempts` : '';
    console.log(`  PASS${retryNote}`);
  } else {
    console.error(`  FAIL: ${result.error}`);
    failures.push(`${check.name}: ${result.error}`);
  }
}

if (failures.length > 0) {
  console.error('\nSmoke check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nAll live smoke checks passed.');
}
