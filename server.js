// Forsale backend: Pi payments (approve/complete) + AI assistant proxy
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PI = 'https://api.minepi.com/v2';
const piHeaders = { Authorization: `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' };

app.post('/api/pi/approve', async (req, res) => {
  try {
    const r = await fetch(`${PI}/payments/${req.body.paymentId}/approve`, { method: 'POST', headers: piHeaders });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pi/complete', async (req, res) => {
  try {
    const r = await fetch(`${PI}/payments/${req.body.paymentId}/complete`, {
      method: 'POST', headers: piHeaders, body: JSON.stringify({ txid: req.body.txid })
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai', async (req, res) => {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5', max_tokens: 600,
        system: 'You are Forsale AI, a global real-estate advisor. Reply in the user language, briefly. Use only the provided listings when recommending; never invent prices.',
        messages: [{ role: 'user', content: `Listings: ${JSON.stringify(req.body.listings)}\n\nQuestion: ${req.body.q}` }]
      })
    });
    const d = await r.json();
    res.json({ text: (d.content || []).map(c => c.text || '').join('') || 'تعذر الرد الآن.' });
  } catch (e) { res.status(500).json({ text: 'خطأ في الخادم' }); }
});

app.listen(process.env.PORT || 3000, () => console.log('Forsale running'));
