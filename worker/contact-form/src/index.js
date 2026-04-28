const JSON_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {})
    }
  });
}

function normalizeField(value) {
  return String(value || '').trim();
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    return {
      name: normalizeField(body.name),
      email: normalizeField(body.email),
      message: normalizeField(body.message),
      subject: normalizeField(body.subject) || 'Lecturer website inquiry',
      source: normalizeField(body.source) || 'lecturer-materials-contact-page'
    };
  }

  const form = await request.formData();
  return {
    name: normalizeField(form.get('name')),
    email: normalizeField(form.get('email')),
    message: normalizeField(form.get('message')),
    subject: normalizeField(form.get('subject')) || 'Lecturer website inquiry',
    source: normalizeField(form.get('source')) || 'lecturer-materials-contact-page'
  };
}

function validatePayload(payload) {
  if (!payload.name || !payload.email || !payload.message) {
    return 'Missing required fields.';
  }

  if (!payload.email.includes('@')) {
    return 'Please provide a valid email address.';
  }

  return null;
}

function buildContext(request, payload) {
  const url = new URL(request.url);

  return {
    receivedAt: new Date().toISOString(),
    worker: 'lecturer-materials',
    route: url.pathname,
    origin: request.headers.get('origin') || '',
    referer: request.headers.get('referer') || '',
    ip: request.headers.get('cf-connecting-ip') || '',
    country: request.headers.get('cf-ipcountry') || '',
    rayId: request.headers.get('cf-ray') || '',
    source: payload.source
  };
}

function buildTextBody(payload, context) {
  return [
    `New inquiry from ${payload.name}`,
    '',
    `Subject: ${payload.subject}`,
    `Email: ${payload.email}`,
    `Source: ${payload.source}`,
    `Received at: ${context.receivedAt}`,
    `Origin: ${context.origin || 'n/a'}`,
    `Referer: ${context.referer || 'n/a'}`,
    `Country: ${context.country || 'n/a'}`,
    '',
    'Message:',
    payload.message
  ].join('\n');
}

async function sendWebhook(env, payload, context) {
  if (!env.CONTACT_WEBHOOK_URL) {
    return { skipped: true, channel: 'webhook' };
  }

  const response = await fetch(env.CONTACT_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ payload, context })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Webhook forwarding failed with ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  return { skipped: false, channel: 'webhook' };
}

async function sendResendEmail(env, payload, context) {
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL || !env.RESEND_FROM_EMAIL) {
    return { skipped: true, channel: 'email' };
  }

  const to = String(env.CONTACT_EMAIL)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (to.length === 0) {
    return { skipped: true, channel: 'email' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to,
      reply_to: payload.email,
      subject: `${payload.subject} — ${payload.name}`,
      text: buildTextBody(payload, context)
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email forwarding failed with ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  return { skipped: false, channel: 'email' };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: JSON_HEADERS
      });
    }

    if (request.method !== 'POST' || url.pathname !== '/api/contact') {
      return new Response('Not found', { status: 404 });
    }

    try {
      const payload = await readPayload(request);
      const error = validatePayload(payload);

      if (error) {
        return json({ ok: false, error }, { status: 400 });
      }

      const context = buildContext(request, payload);
      const results = [];
      const failures = [];

      for (const send of [sendWebhook, sendResendEmail]) {
        try {
          const result = await send(env, payload, context);
          results.push(result);
        } catch (sendError) {
          failures.push(sendError.message);
        }
      }

      const deliveredChannels = results.filter((result) => !result.skipped).map((result) => result.channel);

      if (failures.length > 0 && deliveredChannels.length === 0) {
        return json(
          {
            ok: false,
            error: 'The inquiry was received, but forwarding failed for all configured channels.',
            details: failures
          },
          { status: 502 }
        );
      }

      if (deliveredChannels.length === 0) {
        return json({
          ok: true,
          message: 'Contact form received. Add CONTACT_WEBHOOK_URL and/or RESEND_API_KEY worker secrets to forward inquiries automatically.',
          delivery: {
            channels: [],
            configured: false
          }
        });
      }

      return json({
        ok: true,
        message: `Contact form forwarded successfully via ${deliveredChannels.join(' and ')}.`,
        delivery: {
          channels: deliveredChannels,
          configured: true,
          partialFailures: failures
        }
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: 'Unable to process the inquiry right now.',
          detail: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  }
};
