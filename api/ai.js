const { LISTINGS } = require('./_data');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ text: 'POST only' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ text: 'AI is not configured yet.' });
  const q = String((req.body && req.body.q) || '').slice(0, 500).trim();
  if (!q) return res.status(400).json({ text: 'Empty question.' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5', max_tokens: 500,
        system: 'You are Marwan, Forsale\'s AI real-estate advisor. If asked who you are, say your name is Marwan. Answer in the user\'s language, briefly and warmly. Recommend only from the provided listings (prices are in Pi) and never invent listings or prices. These are sample listings.',
        messages: [{ role: 'user', content: `Listings: ${JSON.stringify(LISTINGS)}\n\nQuestion: ${q}` }]
      })
    });
    const d = await r.json();
    res.json({ text: (d.content || []).map(c => c.text || '').join('') || 'Could not answer right now.' });
  } catch (e) { res.status(500).json({ text: 'Server error.' }); }
};
