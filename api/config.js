const { cfg } = require('./_data');
module.exports = (req, res) => { res.setHeader('Cache-Control', 'public, max-age=60'); res.json(cfg()); };
