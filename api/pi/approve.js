const { PI, headers, validId } = require('../_pi');
const { LISTINGS, LISTING_FEE, cfg } = require('../_data');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.PI_API_KEY) return res.status(503).json({ error: 'PI_API_KEY is not configured' });
  const { paymentId } = req.body || {};
  if (!validId(paymentId)) return res.status(400).json({ error: 'invalid paymentId' });
  try {
    // Never trust the client's amount: read the payment from Pi and compare with our own price.
    const pr = await fetch(`${PI}/payments/${paymentId}`, { headers: headers() });
    if (!pr.ok) return res.status(502).json({ error: 'could not read payment' });
    const pay = await pr.json();
    const m = pay.metadata || {};
    const expected = m.type === 'listing' ? LISTING_FEE
      : m.type === 'reserve' && LISTINGS.some(l => l.id === Number(m.listingId)) ? cfg().reserve_pi : undefined;
    if (expected === undefined || Number(pay.amount) !== expected) {
      return res.status(400).json({ error: 'amount does not match the expected Pi amount' });
    }
    const r = await fetch(`${PI}/payments/${paymentId}/approve`, { method: 'POST', headers: headers() });
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(500).json({ error: 'server error' }); }
};
