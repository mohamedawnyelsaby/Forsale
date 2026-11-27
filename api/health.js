// /api/health            -> which keys are configured (true/false only)
// /api/health?test=1     -> also sends a tiny live request to each AI provider and reports the exact result
const { PROVIDERS, state } = require('./ai');
let lastTest = 0;
module.exports = async (req, res) => {
  const has = k => Boolean(process.env[k]);
  res.setHeader('Cache-Control', 'no-store');
  const out = {
    pi_server_key: has('PI_API_KEY'),
    ai: { gemini: has('GEMINI_API_KEY'), groq: has('GROQ_API_KEY'), anthropic: has('ANTHROPIC_API_KEY') },
    ai_ready: has('GEMINI_API_KEY') || has('GROQ_API_KEY') || has('ANTHROPIC_API_KEY'),
    ai_failover: [has('GEMINI_API_KEY'), has('GROQ_API_KEY'), has('ANTHROPIC_API_KEY')].filter(Boolean).length >= 2
  };
  if (req.query && req.query.test) {
    if (Date.now() - lastTest < 8000) return res.status(429).json({ ...out, test: 'Please wait a few seconds and retry.' });
    lastTest = Date.now();
    out.test = {};
    await Promise.all(Object.keys(PROVIDERS).filter(n => has(PROVIDERS[n][0])).map(async n => {
      const t0 = Date.now();
      try {
        const text = await PROVIDERS[n][1]('Reply language: English\nFocus property: null\nAll listings: []\n\nRequest: Reply with the single word OK.');
        out.test[n] = { ok: Boolean(text), ms: Date.now() - t0, sample: String(text || '').slice(0, 30) };
      } catch (e) {
        out.test[n] = { ok: false, ms: Date.now() - t0, code: e.code || e.name, error: String(e.message || e).slice(0, 200) };
      }
    }));
  }
  if (out.test) out.models = { gemini: state.gemini, groq: state.groq };
  res.json(out);
};
