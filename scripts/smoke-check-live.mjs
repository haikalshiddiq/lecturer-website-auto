const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 lecturer-website-smoke-check/1.0';
const TIMEOUT_MS = 15000;
const RETRIES = 3;
const RETRY_DELAY_MS = 3000;
const CONTACT_ENDPOINT = 'https://lecturer-materials.hicall.workers.dev/api/contact';
const SMOKE_ORIGIN = 'https://lecturer-materials.pages.dev';

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
    url: CONTACT_ENDPOINT,
    method: 'OPTIONS',
    headers: {
      origin: SMOKE_ORIGIN,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type'
    },
    expectedStatus: 204,
    validateHeaders(headers) {
      return validateCorsHeaders(headers);
    }
  },
  {
    name: 'Worker contact endpoint validation failure',
    url: CONTACT_ENDPOINT,
    method: 'POST',
    headers: {
      origin: SMOKE_ORIGIN,
      'content-type': 'application/json'
    },
    body: JSON.stringify({}),
    expectedStatus: 400,
    expectedText: 'Missing required fields.',
    validateHeaders(headers) {
      const corsError = validateCorsHeaders(headers);
      if (corsError) return corsError;

      const contentType = headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return `expected content-type to include application/json, got ${JSON.stringify(contentType)}`;
      }

      return null;
    },
    validateBody(body) {
      try {
        const data = JSON.parse(body);
        if (data.ok !== false || typeof data.error !== 'string' || data.error.length === 0) {
          return `expected validation JSON with ok=false and an error string, got ${snippet(body)}`;
        }
      } catch (error) {
        return `expected validation JSON response, but parsing failed: ${error instanceof Error ? error.message : String(error)}; body: ${snippet(body)}`;
      }

      return null;
    }
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function snippet(body) {
  const compact = String(body || '').replace(/\s+/g, ' ').trim();
  if (!compact) return '<empty body>';
  return JSON.stringify(compact.length > 240 ? `${compact.slice(0, 240)}…` : compact);
}

function validateCorsHeaders(headers) {
  const allowedOrigin = headers.get('access-control-allow-origin') || '';
  if (allowedOrigin !== '*' && allowedOrigin !== SMOKE_ORIGIN) {
    return `expected access-control-allow-origin to be * or ${SMOKE_ORIGIN}, got ${JSON.stringify(allowedOrigin)}`;
  }

  const allowedMethods = headers.get('access-control-allow-methods') || '';
  if (!allowedMethods.includes('POST') || !allowedMethods.includes('OPTIONS')) {
    return `expected access-control-allow-methods to include POST and OPTIONS, got ${JSON.stringify(allowedMethods)}`;
  }

  const allowedHeaders = headers.get('access-control-allow-headers') || '';
  if (!allowedHeaders.toLowerCase().split(',').map((value) => value.trim()).includes('content-type')) {
    return `expected access-control-allow-headers to include content-type, got ${JSON.stringify(allowedHeaders)}`;
  }

  return null;
}

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
  const response = await fetchWithTimeout(check.url, {
    method,
    headers: check.headers,
    body: check.body
  });
  const body = method === 'HEAD' || response.status === 204 ? '' : await response.text();

  if (response.status !== check.expectedStatus) {
    return `expected HTTP ${check.expectedStatus}, got HTTP ${response.status}; body: ${snippet(body)}`;
  }

  if (check.expectedText && !body.includes(check.expectedText)) {
    return `expected response body to include ${JSON.stringify(check.expectedText)}; body: ${snippet(body)}`;
  }

  if (check.validateHeaders) {
    const error = check.validateHeaders(response.headers);
    if (error) return error;
  }

  if (check.validateBody) {
    return check.validateBody(body);
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
