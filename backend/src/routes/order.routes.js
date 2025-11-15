const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orders route working',
    data: []
  });
});

module.exports = router;
