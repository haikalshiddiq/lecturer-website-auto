import { EmailMessage } from 'cloudflare:email';

const JSON_HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
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

function sanitizeHeader(value) {
  return normalizeField(value).replace(/[\r\n]+/g, ' ').slice(0, 180);
}

function buildRfc822Message(payload, context, from, to) {
  const subject = sanitizeHeader(`${payload.subject} - ${payload.name}`);
  const replyTo = sanitizeHeader(payload.email);
  const text = buildTextBody(payload, context);

  return [
    `From: Lecturer Website <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text
  ].join('\r\n');
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
      subject: `${payload.subject} - ${payload.name}`,
      text: buildTextBody(payload, context)
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email forwarding failed with ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  return { skipped: false, channel: 'email', provider: 'resend' };
}

async function sendCloudflareEmailRouting(env, payload, context) {
  const to = getConfiguredRecipients(env);
  const from = normalizeField(env.MAIL_FROM_EMAIL || 'noreply@hicall.web.id');

  if (!env.CONTACT_EMAIL_ROUTING || to.length === 0 || !from || isPlaceholderEmail(from)) {
    return { skipped: true, channel: 'email', provider: 'cloudflare-email-routing', reason: 'missing-email-routing-binding' };
  }

  const recipient = to[0];
  const message = new EmailMessage(from, recipient, buildRfc822Message(payload, context, from, recipient));
  await env.CONTACT_EMAIL_ROUTING.send(message);
  return { skipped: false, channel: 'email', provider: 'cloudflare-email-routing' };
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
      subject: `${payload.subject} - ${payload.name}`,
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


const LAB_DATA = {
  ism: {
    id: 'ism',
    title: 'Information System Management Incident Dashboard Runtime',
    incidents: [
      { id: 'E01', service: 'Citizen portal', signal: 'Authentication latency above baseline', severity: 4, confidence: 0.88, owner: 'Identity team', action: 'Check identity dependency and session store' },
      { id: 'E02', service: 'Immigration', signal: 'Public report of service disruption', severity: 5, confidence: 0.63, owner: 'Immigration service owner', action: 'Verify internally before public statement' },
      { id: 'E03', service: 'Core infrastructure', signal: 'Backup restore estimate changed twice', severity: 5, confidence: 0.41, owner: 'Infrastructure recovery lead', action: 'Escalate uncertainty and request recovery evidence' }
    ]
  },
  protocol: {
    id: 'protocol',
    title: 'Communication Protocol IoT Runtime',
    events: [
      { topic: 'farm/soil/moisture', value: 27, qos: 0, critical: false, delivery: 'delivered', protocol: 'HTTP API -> MQTT-style telemetry' },
      { topic: 'farm/alert/critical', value: 'dry-soil', qos: 1, critical: true, delivery: 'acknowledged', protocol: 'HTTP API -> MQTT QoS 1 alert' }
    ]
  },
  ai: {
    id: 'ai',
    title: 'Responsible RAG Policy Assistant Runtime',
    policies: [
      { id: 'P01', area: 'Attendance', text: 'Students must satisfy minimum attendance requirements defined by the course policy.' },
      { id: 'P02', area: 'Assessment', text: 'Final grades combine assignments, midterm, final exam, and lecturer-approved participation.' },
      { id: 'P03', area: 'Appeal', text: 'Grade appeals require documented evidence and submission within the stated academic window.' },
      { id: 'P04', area: 'Privacy', text: 'Student academic data must not be exposed to unauthorized parties.' },
      { id: 'P05', area: 'Scope', text: 'The assistant cannot approve exceptions; it can only explain published policy and direct users to staff.' }
    ]
  }
};

function labRuntimeBase(request) {
  const url = new URL(request.url);
  return `${url.origin}/api/labs`;
}

function labHealth(request, lab) {
  return {
    ok: true,
    runtime: 'cloudflare-worker',
    note: 'Cloudflare Workers cannot execute CPython processes. This endpoint runs the browser-accessible Worker version of the same native Python lab API so students can test immediately online; downloadable Python remains available for local/native execution.',
    lab: lab.id,
    title: lab.title,
    startedAt: new Date().toISOString(),
    baseUrl: `${labRuntimeBase(request)}/${lab.id}`,
    suggestedTools: ['browser', 'Postman', 'n8n HTTP Request node', 'Wireshark for local Python/loopback capture']
  };
}

function calcIncidentKpis(incidents) {
  const high = incidents.filter((item) => item.severity >= 4);
  const weak = incidents.filter((item) => item.confidence < 0.6);
  return {
    totalSignals: incidents.length,
    highSeverity: high.length,
    weakEvidence: weak.length,
    averageConfidence: Number((incidents.reduce((sum, item) => sum + item.confidence, 0) / incidents.length).toFixed(2)),
    decisionNeeded: high.map((item) => item.action),
    generatedAt: new Date().toISOString()
  };
}

function tokenize(value) {
  return String(value || '').toLowerCase().match(/[a-z0-9]+/g) || [];
}

function retrievePolicies(question) {
  const q = new Set(tokenize(question));
  return LAB_DATA.ai.policies
    .map((policy) => ({
      score: tokenize(`${policy.area} ${policy.text}`).filter((token) => q.has(token)).length,
      policy
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.policy);
}

async function readJsonBody(request) {
  if (request.method === 'GET') return {};
  const raw = await request.text();
  if (!raw) return {};
  return JSON.parse(raw);
}

async function handleLabRuntime(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const labId = parts[2];
  const action = parts[3] || 'start';

  if (!['ism', 'protocol', 'ai'].includes(labId)) {
    return json({ ok: false, error: 'Unknown lab runtime. Use ism, protocol, or ai.' }, { status: 404 });
  }

  const lab = LAB_DATA[labId];

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  if (action === 'start' || action === 'health') {
    return json(labHealth(request, lab));
  }

  if (labId === 'ism') {
    if (request.method === 'GET' && action === 'incidents') return json({ incidents: lab.incidents });
    if (request.method === 'GET' && action === 'kpis') return json(calcIncidentKpis(lab.incidents));
    if (request.method === 'POST' && action === 'incidents') {
      const body = await readJsonBody(request);
      const created = {
        id: body.id || `EDGE-${Date.now()}`,
        service: body.service || 'Student submitted service',
        signal: body.signal || 'Manual signal from Worker lab runtime',
        severity: Number(body.severity || 3),
        confidence: Number(body.confidence || 0.5),
        owner: body.owner || 'Student triage team',
        action: body.action || 'Review signal and update dashboard decision'
      };
      return json({ created, persistence: 'stateless-worker-demo' }, { status: 201 });
    }
  }

  if (labId === 'protocol') {
    if (request.method === 'GET' && action === 'metrics') {
      return json({
        messages: lab.events.length,
        qos1Messages: lab.events.filter((event) => event.qos === 1).length,
        simulatedLoss: lab.events.filter((event) => event.delivery === 'lost').length,
        events: lab.events,
        wiresharkHint: 'For packet capture, run the downloadable native Python version locally and capture loopback traffic.'
      });
    }
    if (request.method === 'POST' && action === 'publish') {
      const body = await readJsonBody(request);
      const qos = Number(body.qos || 0);
      const critical = Boolean(body.critical);
      const event = {
        topic: body.topic || 'farm/soil/moisture',
        value: body.value ?? 27,
        qos,
        critical,
        delivery: qos > 0 || critical ? 'acknowledged' : 'delivered-or-loss-risk',
        protocol: 'Cloudflare Worker HTTP API simulating MQTT-style telemetry',
        ts: new Date().toISOString()
      };
      return json({ accepted: event, persistence: 'stateless-worker-demo' }, { status: 201 });
    }
  }

  if (labId === 'ai') {
    if (request.method === 'GET' && action === 'sources') return json({ policies: lab.policies });
    if (request.method === 'POST' && action === 'ask') {
      const body = await readJsonBody(request);
      const question = String(body.question || '');
      const hits = retrievePolicies(question);
      const risky = /approve|exception|change my grade|private data|password/i.test(question);
      if (risky || hits.length === 0) {
        return json({
          question,
          answer: 'I cannot answer or approve this from the provided policy sources. Please contact authorized academic staff.',
          sources: hits.map((item) => item.id),
          refusal: true,
          faithfulness: 'safe_refusal',
          evaluatedAt: new Date().toISOString()
        });
      }
      return json({
        question,
        answer: `${hits.map((item) => item.text).join(' ')} Sources: ${hits.map((item) => item.id).join(', ')}`,
        sources: hits.map((item) => item.id),
        refusal: false,
        faithfulness: 'grounded_in_retrieved_sources',
        evaluatedAt: new Date().toISOString()
      });
    }
  }

  return json({ ok: false, error: 'Unsupported lab action for this method.' }, { status: 404 });
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

    if (url.pathname.startsWith('/api/labs/')) {
      try {
        return await handleLabRuntime(request);
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Unable to process the lab runtime request.',
            detail: error instanceof Error ? error.message : String(error)
          },
          { status: 500 }
        );
      }
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

      for (const send of [sendWebhook, sendResendEmail, sendCloudflareEmailRouting, sendMailchannelsEmail]) {
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
