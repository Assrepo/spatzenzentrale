const express = require('express');
const router = express.Router();

// GET /example
router.get('/', (req, res) => {
  res.json({ message: 'Beispiel-Antwort vom Example-Plugin' });
});

module.exports = router;
