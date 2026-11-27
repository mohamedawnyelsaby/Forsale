// Shows which keys are configured (true/false only, never the values).
module.exports = (req, res) => {
  const has = k => Boolean(process.env[k]);
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    pi_server_key: has('PI_API_KEY'),
    ai: { gemini: has('GEMINI_API_KEY'), groq: has('GROQ_API_KEY'), anthropic: has('ANTHROPIC_API_KEY') },
    ai_ready: has('GEMINI_API_KEY') || has('GROQ_API_KEY') || has('ANTHROPIC_API_KEY'),
    ai_failover: [has('GEMINI_API_KEY'), has('GROQ_API_KEY'), has('ANTHROPIC_API_KEY')].filter(Boolean).length >= 2
  });
};
