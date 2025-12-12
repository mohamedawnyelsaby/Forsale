// server.js - Forsale AI backend skeleton
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '2mb' }));
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  return res.json({ status: 'OK', piIntegration: !!process.env.PI_API_KEY });
});

// Create payment (simplified flow)
app.post('/api/payment/create', async (req, res) => {
  try {
    const { productId, amount_pi } = req.body;
    if (!productId || !amount_pi) return res.status(400).json({ ok:false, error: 'productId and amount_pi required' });

    // TODO: create order in DB and validate product

    const payload = {
      app_id: process.env.PI_APP_ID,
      product_id: productId,
      amount: amount_pi,
      currency: 'PI',
      callback_url: `${process.env.PI_CALLBACK_BASE}/complete`
    };

    // NOTE: Replace the URL below with Pi's official create-payment endpoint if different
    const piResp = await axios.post('https://api.minepi.com/v1/payments/create', payload, {
      headers: { 'Authorization': `Bearer ${process.env.PI_API_KEY}` }
    });

    return res.json({ ok: true, payment: piResp.data });
  } catch (err) {
    console.error('create payment err', err?.response?.data || err.message);
    return res.status(500).json({ ok: false, error: 'Failed to create payment' });
  }
});

// Pi webhook - payment complete/updated
app.post('/api/pi/complete', async (req, res) => {
  const signature = req.headers['x-pi-signature'] || req.headers['x-signature'] || '';
  const body = JSON.stringify(req.body);
  const secret = process.env.PI_APP_SECRET || '';
  // Basic HMAC verify (adapt to Pi spec)
  if (secret) {
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (signature && expected !== signature) {
      console.warn('Invalid signature for Pi webhook');
      return res.status(401).send('Invalid signature');
    }
  }
  const { paymentId, status, txid } = req.body;
  console.log('Pi webhook received', paymentId, status, txid);
  // TODO: update order in DB based on paymentId and status
  return res.json({ ok: true });
});

app.post('/api/payment/approve', async (req, res) => {
  const { paymentId, productId } = req.body;
  // TODO: implement approve logic and call Pi approve API if required
  return res.json({ ok: true, paymentId, productId });
});

app.listen(PORT, () => console.log(`Forsale API listening on ${PORT}`));
