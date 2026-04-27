export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/contact') {
      const form = await request.formData();
      const payload = {
        name: String(form.get('name') || '').trim(),
        email: String(form.get('email') || '').trim(),
        message: String(form.get('message') || '').trim(),
        receivedAt: new Date().toISOString()
      };

      if (!payload.name || !payload.email || !payload.message) {
        return new Response(JSON.stringify({ ok: false, error: 'Missing required fields.' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        });
      }

      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Contact form received. Connect your preferred email/webhook provider in the worker to forward messages.',
          payload
        }),
        {
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*'
          }
        }
      );
    }

    return new Response('Not found', { status: 404 });
  }
};
