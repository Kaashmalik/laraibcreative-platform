/**
 * CSV Generator Utility
 * Generates CSV files for data export
 */

/**
 * Generate CSV content for products
 * @param {Array} products - Array of product objects
 * @returns {string} CSV content
 */
const generateProductCSV = (products) => {
  if (!products || products.length === 0) {
    return 'No products to export\n';
  }

  // CSV Headers
  const headers = [
    'Title',
    'Design Code',
    'SKU',
    'Category',
    'Base Price',
    'Status',
    'Availability',
    'Product Type',
    'Is Active',
    'Is Featured',
    'Stock Quantity',
    'Created Date'
  ];

  // Build CSV rows
  const rows = products.map(product => {
    return [
      `"${(product.title || '').replace(/"/g, '""')}"`,
      product.designCode || '',
      product.inventory?.sku || '',
      product.category?.name || '',
      product.pricing?.basePrice || 0,
      product.availability?.status || '',
      product.availability?.status || '',
      product.productType || '',
      product.isActive ? 'Yes' : 'No',
      product.isFeatured ? 'Yes' : 'No',
      product.inventory?.stockQuantity || 0,
      product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : ''
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate CSV content for orders
 * @param {Array} orders - Array of order objects
 * @returns {string} CSV content
 */
const generateOrderCSV = (orders) => {
  if (!orders || orders.length === 0) {
    return 'No orders to export\n';
  }

  const headers = [
    'Order Number',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Total Amount',
    'Status',
    'Payment Method',
    'Payment Status',
    'Shipping City',
    'Shipping Province',
    'Items Count',
    'Created Date'
  ];

  const rows = orders.map(order => {
    return [
      order.orderNumber || '',
      `"${(order.customerInfo?.name || order.customer?.fullName || '').replace(/"/g, '""')}"`,
      order.customerInfo?.email || order.customer?.email || '',
      order.customerInfo?.phone || order.customer?.phone || '',
      order.pricing?.total || 0,
      order.status || '',
      order.payment?.method || '',
      order.payment?.status || '',
      order.shippingAddress?.city || '',
      order.shippingAddress?.province || '',
      order.items?.length || 0,
      order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : ''
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate CSV content for customers
 * @param {Array} customers - Array of customer objects
 * @returns {string} CSV content
 */
const generateCustomerCSV = (customers) => {
  if (!customers || customers.length === 0) {
    return 'No customers to export\n';
  }

  const headers = [
    'Name',
    'Email',
    'Phone',
    'Total Orders',
    'Total Spent',
    'Account Status',
    'Created Date'
  ];

  const rows = customers.map(customer => {
    return [
      `"${(customer.fullName || customer.name || '').replace(/"/g, '""')}"`,
      customer.email || '',
      customer.phone || '',
      customer.totalOrders || 0,
      customer.totalSpent || 0,
      customer.isActive ? 'Active' : 'Inactive',
      customer.createdAt ? new Date(customer.createdAt).toISOString().split('T')[0] : ''
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

module.exports = {
  generateProductCSV,
  generateOrderCSV,
  generateCustomerCSV
};

