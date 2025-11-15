const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Products route working',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Product not found'
  });
});

module.exports = router;
