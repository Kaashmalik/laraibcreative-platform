// backend/src/utils/pdfGenerator.js

const PDFDocument = require('pdfkit');
const logger = require('./logger');

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order object with populated customer and product details
 * @returns {Buffer} PDF buffer
 */
exports.generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice-${order.orderNumber}`,
          Author: 'LaraibCreative',
          Subject: 'Order Invoice'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors
      const primaryColor = '#D946A6';
      const textColor = '#111827';
      const lightGray = '#F3F4F6';

      // Header with Logo and Company Info
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text('LaraibCreative', 50, 50);

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('We turn your thoughts & emotions into reality', 50, 80)
        .text('Email: info@laraibcreative.com', 50, 95)
        .text('Phone: +92-XXX-XXXXXXX', 50, 110)
        .text('WhatsApp: +92-XXX-XXXXXXX', 50, 125);

      // Invoice Title and Number
      doc
        .fontSize(20)
        .fillColor(primaryColor)
        .text('INVOICE', 400, 50, { align: 'right' });

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(`Invoice #: ${order.orderNumber}`, 400, 80, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-PK')}`, 400, 95, { align: 'right' })
        .text(`Status: ${order.status.replace('-', ' ').toUpperCase()}`, 400, 110, { align: 'right' });

      // Line separator
      doc
        .strokeColor(primaryColor)
        .lineWidth(2)
        .moveTo(50, 150)
        .lineTo(545, 150)
        .stroke();

      // Customer Information
      let yPosition = 170;

      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('BILL TO:', 50, yPosition);

      yPosition += 20;

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(order.customerInfo.name, 50, yPosition)
        .text(order.customerInfo.email || 'N/A', 50, yPosition + 15)
        .text(order.customerInfo.phone, 50, yPosition + 30)
        .text(order.customerInfo.whatsapp ? `WhatsApp: ${order.customerInfo.whatsapp}` : '', 50, yPosition + 45);

      // Shipping Address
      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('SHIP TO:', 320, 170);

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(order.shippingAddress.fullAddress, 320, 190, { width: 225 })
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.province}`, 320, yPosition + 30)
        .text(order.shippingAddress.postalCode || '', 320, yPosition + 45);

      // Table Header
      yPosition = 290;

      // Background for header
      doc
        .rect(50, yPosition, 495, 25)
        .fill(lightGray);

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('Item', 60, yPosition + 8)
        .text('Type', 250, yPosition + 8)
        .text('Qty', 350, yPosition + 8)
        .text('Price', 410, yPosition + 8)
        .text('Total', 480, yPosition + 8);

      yPosition += 35;

      // Order Items
      order.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;

        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        // Alternate row background
        if (index % 2 === 0) {
          doc
            .rect(50, yPosition - 5, 495, 25)
            .fill('#FAFAFA');
        }

        doc
          .fontSize(9)
          .fillColor(textColor)
          .text(item.productSnapshot.title.substring(0, 30) + (item.productSnapshot.title.length > 30 ? '...' : ''), 60, yPosition, { width: 180 })
          .text(item.isCustom ? 'Custom' : 'Ready', 250, yPosition)
          .text(item.quantity.toString(), 350, yPosition)
          .text(`PKR ${item.price.toLocaleString()}`, 410, yPosition)
          .text(`PKR ${itemTotal.toLocaleString()}`, 480, yPosition);

        // Show measurements info for custom orders
        if (item.isCustom && item.measurements) {
          yPosition += 15;
          doc
            .fontSize(8)
            .fillColor('#6B7280')
            .text('Custom measurements provided', 60, yPosition);
        }

        // Show special instructions if any
        if (item.specialInstructions) {
          yPosition += 15;
          doc
            .fontSize(8)
            .fillColor('#6B7280')
            .text(`Note: ${item.specialInstructions.substring(0, 50)}...`, 60, yPosition, { width: 480 });
        }

        yPosition += 30;
      });

      // Line before totals
      yPosition += 10;
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, yPosition)
        .lineTo(545, yPosition)
        .stroke();

      // Totals Section
      yPosition += 20;

      const totalsX = 380;

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('Subtotal:', totalsX, yPosition)
        .text(`PKR ${order.pricing.subtotal.toLocaleString()}`, 480, yPosition);

      yPosition += 20;

      doc
        .text('Shipping:', totalsX, yPosition)
        .text(`PKR ${order.pricing.shippingCharges.toLocaleString()}`, 480, yPosition);

      if (order.pricing.discount > 0) {
        yPosition += 20;
        doc
          .text('Discount:', totalsX, yPosition)
          .text(`- PKR ${order.pricing.discount.toLocaleString()}`, 480, yPosition);
      }

      // Total with background
      yPosition += 25;
      doc
        .rect(370, yPosition - 5, 175, 25)
        .fill(primaryColor);

      doc
        .fontSize(12)
        .fillColor('white')
        .text('TOTAL:', totalsX, yPosition)
        .text(`PKR ${order.pricing.total.toLocaleString()}`, 480, yPosition);

      // Payment Information
      yPosition += 50;

      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('PAYMENT INFORMATION', 50, yPosition);

      yPosition += 20;

      const paymentMethod = order.payment.method.replace('-', ' ').toUpperCase();
      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(`Payment Method: ${paymentMethod}`, 50, yPosition)
        .text(`Payment Status: ${order.payment.status.toUpperCase()}`, 50, yPosition + 15);

      if (order.payment.transactionId) {
        doc.text(`Transaction ID: ${order.payment.transactionId}`, 50, yPosition + 30);
      }

      if (order.payment.method === 'cod') {
        yPosition += 50;
        doc
          .fontSize(9)
          .fillColor('#EF4444')
          .text(`⚠️ Advance Paid: PKR ${order.payment.advanceAmount.toLocaleString()}`, 50, yPosition)
          .text(`⚠️ Remaining (COD): PKR ${order.payment.remainingAmount.toLocaleString()}`, 50, yPosition + 15);
      }

      // Footer with Terms and Conditions
      const footerY = 720;

      doc
        .fontSize(8)
        .fillColor('#6B7280')
        .text('Terms & Conditions:', 50, footerY)
        .text('1. Custom orders are non-refundable once stitching has started.', 50, footerY + 12)
        .text('2. Ready-made products can be exchanged within 3 days of delivery.', 50, footerY + 22)
        .text('3. Measurements provided by customer are final; alterations may incur additional charges.', 50, footerY + 32)
        .text('4. Delivery times are estimates and may vary due to unforeseen circumstances.', 50, footerY + 42);

      // Thank you message
      doc
        .fontSize(10)
        .fillColor(primaryColor)
        .text('Thank you for choosing LaraibCreative!', 50, footerY + 65, { align: 'center', width: 495 });

      doc
        .fontSize(8)
        .fillColor(textColor)
        .text('For queries, contact us at info@laraibcreative.com or +92-XXX-XXXXXXX', 50, footerY + 80, { align: 'center', width: 495 });

      // Finalize PDF
      doc.end();

      logger.info(`Invoice PDF generated for order ${order.orderNumber}`);

    } catch (error) {
      logger.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

/**
 * Generate measurement sheet PDF
 * @param {Object} measurement - Measurement object
 * @param {Object} customer - Customer object
 * @returns {Buffer} PDF buffer
 */
exports.generateMeasurementSheet = async (measurement, customer) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      const primaryColor = '#D946A6';

      // Header
      doc
        .fontSize(20)
        .fillColor(primaryColor)
        .text('LaraibCreative', 50, 50)
        .fontSize(16)
        .text('Measurement Sheet', 50, 80);

      // Customer Info
      doc
        .fontSize(12)
        .fillColor('#111827')
        .text(`Customer: ${customer.fullName}`, 50, 120)
        .text(`Label: ${measurement.label || 'Default'}`, 50, 140)
        .text(`Date: ${new Date(measurement.createdAt).toLocaleDateString('en-PK')}`, 50, 160);

      // Measurements Table
      let yPos = 200;

      const measurements = measurement.measurements;
      const measurementLabels = {
        shirtLength: 'Shirt Length',
        shoulderWidth: 'Shoulder Width',
        sleeveLength: 'Sleeve Length',
        armHole: 'Arm Hole',
        bust: 'Bust/Chest',
        waist: 'Waist',
        hip: 'Hip',
        frontNeckDepth: 'Front Neck Depth',
        backNeckDepth: 'Back Neck Depth',
        wrist: 'Wrist',
        trouserLength: 'Trouser Length',
        trouserWaist: 'Trouser Waist',
        trouserHip: 'Trouser Hip',
        thigh: 'Thigh',
        bottom: 'Bottom',
        kneeLength: 'Knee Length',
        dupattaLength: 'Dupatta Length',
        dupattaWidth: 'Dupatta Width'
      };

      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .text('Upper Body', 50, yPos);

      yPos += 30;

      Object.entries(measurementLabels).slice(0, 10).forEach(([key, label]) => {
        if (measurements[key]) {
          doc
            .fontSize(11)
            .fillColor('#111827')
            .text(label, 60, yPos)
            .text(`${measurements[key]} inches`, 300, yPos);
          yPos += 20;
        }
      });

      yPos += 20;

      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .text('Lower Body', 50, yPos);

      yPos += 30;

      Object.entries(measurementLabels).slice(10, 16).forEach(([key, label]) => {
        if (measurements[key]) {
          doc
            .fontSize(11)
            .fillColor('#111827')
            .text(label, 60, yPos)
            .text(`${measurements[key]} inches`, 300, yPos);
          yPos += 20;
        }
      });

      // Footer
      doc
        .fontSize(9)
        .fillColor('#6B7280')
        .text('Keep this sheet for future reference when placing orders.', 50, 720, { align: 'center', width: 495 });

      doc.end();

      logger.info(`Measurement sheet PDF generated for ${customer.fullName}`);

    } catch (error) {
      logger.error('Error generating measurement sheet:', error);
      reject(error);
    }
  });
};

module.exports = exports;