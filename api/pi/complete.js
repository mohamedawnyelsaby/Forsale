const { PI, headers, validId } = require('../_pi');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.PI_API_KEY) return res.status(503).json({ error: 'PI_API_KEY is not configured' });
  const { paymentId, txid } = req.body || {};
  if (!validId(paymentId) || typeof txid !== 'string' || !txid) return res.status(400).json({ error: 'invalid input' });
  try {
    const r = await fetch(`${PI}/payments/${paymentId}/complete`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ txid })
    });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: 'server error' }); }
};
