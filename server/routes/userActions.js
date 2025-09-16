const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Example route
router.get('/example', (req, res) => {
  res.send('Example route');
});

module.exports = router;