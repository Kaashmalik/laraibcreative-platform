const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Analytics route working',
    data: {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0
    }
  });
});

module.exports = router;
