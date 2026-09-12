// This runs on Vercel's servers, NEVER in the browser — so it's the one safe
// place to keep your real Anthropic API key. The frontend (index.html) calls
// this endpoint instead of api.anthropic.com directly once it's deployed.
//
// Setup:
//   1. In your Vercel project settings, add an Environment Variable named
//      ANTHROPIC_API_KEY with your real key from console.anthropic.com
//   2. Deploy. Vercel automatically turns this file into a live endpoint at
//      https://yourapp.vercel.app/api/generate

export default async function handler(req, res) {
  // Basic CORS so the endpoint also works if you ever call it from another origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing ANTHROPIC_API_KEY. Add it in your hosting provider\'s environment variables.'
    });
  }

  const { prompt, max_tokens } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing "prompt" string in request body.' });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(Math.max(parseInt(max_tokens, 10) || 1000, 1), 8000),
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      return res.status(anthropicResponse.status).json({
        error: data.error?.message || 'Anthropic API request failed.',
      });
    }

    // Pass through the same shape the frontend already expects: { content: [...] }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error calling Anthropic API: ' + err.message });
  }
}
