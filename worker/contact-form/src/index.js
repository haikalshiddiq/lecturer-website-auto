const JSON_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
};

const MIN_FORM_FILL_MS = 2500;
const MAX_MESSAGE_LENGTH = 3000;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_URL_COUNT = 3;
const SPAM_TERMS_PATTERN = /\b(?:viagra|casino|crypto giveaway|seo services)\b/i;

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

function isPlaceholderEmail(value) {
  return /example\.(com|org|net)$/i.test(normalizeField(value));
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
      source: normalizeField(body.source) || 'lecturer-materials-contact-page',
      website: normalizeField(body.website),
      formLoadedAt: normalizeField(body.formLoadedAt)
    };
  }

  const form = await request.formData();
  return {
    name: normalizeField(form.get('name')),
    email: normalizeField(form.get('email')),
    message: normalizeField(form.get('message')),
    subject: normalizeField(form.get('subject')) || 'Lecturer website inquiry',
    source: normalizeField(form.get('source')) || 'lecturer-materials-contact-page',
    website: normalizeField(form.get('website')),
    formLoadedAt: normalizeField(form.get('formLoadedAt'))
  };
}

function validatePayload(payload) {
  if (!payload.name || !payload.email || !payload.message) {
    return 'Missing required fields.';
  }

  if (!payload.email.includes('@')) {
    return 'Please provide a valid email address.';
  }

  if (payload.website) {
    return 'Submission blocked by anti-spam protection.';
  }

  if (payload.name.length < 2 || payload.name.length > MAX_NAME_LENGTH) {
    return 'Please provide a valid name.';
  }

  if (payload.email.length > MAX_EMAIL_LENGTH) {
    return 'Please provide a shorter email address.';
  }

  if (payload.message.length < 20 || payload.message.length > MAX_MESSAGE_LENGTH) {
    return 'Please provide a message between 20 and 3000 characters.';
  }

  const loadedAt = Number(payload.formLoadedAt || 0);
  if (!loadedAt || Number.isNaN(loadedAt)) {
    return 'Missing anti-spam timing token.';
  }

  if (Date.now() - loadedAt < MIN_FORM_FILL_MS) {
    return 'Please take a moment to complete the form before sending.';
  }

  const urlMatches = payload.message.match(/https?:\/\//gi) || [];
  if (urlMatches.length > MAX_URL_COUNT) {
    return 'Too many links were included in the message.';
  }

  const combinedText = `${payload.name}\n${payload.message}`;
  if (SPAM_TERMS_PATTERN.test(combinedText)) {
    return 'Submission blocked by anti-spam content screening.';
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

function getConfiguredRecipients(env) {
  return normalizeField(env.CONTACT_EMAIL)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => !isPlaceholderEmail(value));
}

async function sendWebhook(env, payload, context) {
  if (!env.CONTACT_WEBHOOK_URL) {
    return { skipped: true, channel: 'webhook', reason: 'missing-webhook-url' };
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
  const to = getConfiguredRecipients(env);

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || to.length === 0) {
    return { skipped: true, channel: 'email', provider: 'resend', reason: 'missing-resend-config' };
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

  return { skipped: false, channel: 'email', provider: 'resend' };
}

async function sendMailchannelsEmail(env, payload, context) {
  const to = getConfiguredRecipients(env);
  const from = normalizeField(env.MAIL_FROM_EMAIL || env.RESEND_FROM_EMAIL);

  if (to.length === 0 || !from || isPlaceholderEmail(from) || env.RESEND_API_KEY) {
    return { skipped: true, channel: 'email', provider: 'mailchannels', reason: 'missing-mailchannels-config' };
  }

  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: to.map((email) => ({ email }))
        }
      ],
      from: {
        email: from,
        name: 'Lecturer Website'
      },
      reply_to: {
        email: payload.email,
        name: payload.name
      },
      subject: `${payload.subject} — ${payload.name}`,
      content: [
        {
          type: 'text/plain',
          value: buildTextBody(payload, context)
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`MailChannels forwarding failed with ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  return { skipped: false, channel: 'email', provider: 'mailchannels' };
}

function buildUnconfiguredMessage(env) {
  const hasRealRecipient = getConfiguredRecipients(env).length > 0;

  if (!hasRealRecipient) {
    return 'Contact form received. Set a real CONTACT_EMAIL destination to activate forwarding.';
  }

  return 'Contact form received. Forwarding recipient is set, but automatic delivery still needs CONTACT_WEBHOOK_URL, RESEND_API_KEY, or a verified MAIL_FROM_EMAIL sender.';
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

      for (const send of [sendWebhook, sendResendEmail, sendMailchannelsEmail]) {
        try {
          const result = await send(env, payload, context);
          results.push(result);
        } catch (sendError) {
          failures.push(sendError.message);
        }
      }

      const deliveredChannels = results.filter((result) => !result.skipped).map((result) => {
        if (result.provider) return `${result.channel}:${result.provider}`;
        return result.channel;
      });

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
          message: buildUnconfiguredMessage(env),
          delivery: {
            channels: [],
            configured: false,
            recipientConfigured: getConfiguredRecipients(env).length > 0
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
