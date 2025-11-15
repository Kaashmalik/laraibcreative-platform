const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Upload not implemented yet'
  });
});

module.exports = router;
