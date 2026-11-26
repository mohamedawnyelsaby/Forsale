const PI = 'https://api.minepi.com/v2';
const headers = () => ({ Authorization: `Key ${process.env.PI_API_KEY}`, 'Content-Type': 'application/json' });
const validId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{6,128}$/.test(id);
module.exports = { PI, headers, validId };
