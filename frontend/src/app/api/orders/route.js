// app/api/orders/track/[orderNumber]/route.js
import { NextResponse } from 'next/server';

/**
 * API Route: Get Order Tracking Details
 * GET /api/orders/track/[orderNumber]
 * 
 * Purpose: Retrieve complete order information for tracking
 * Used by: Order tracking detail page
 * Access: Public (no authentication required)
 * 
 * Returns: Full order details including status, items, customer info
 */

/**
 * Mock order data generator
 * Replace this with actual database query in production
 */
const getMockOrderData = (orderNumber) => {
  return {
    _id: '67890abcdef12345',
    orderNumber: orderNumber,
    status: 'in-progress', // Current status
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    estimatedCompletion: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
    
    // Customer Information
    customerInfo: {
      name: 'Ayesha Khan',
      email: 'ayesha.khan@example.com',
      phone: '+92 300 1234567',
      whatsapp: '+92 300 1234567'
    },

    // Shipping Address
    shippingAddress: {
      fullAddress: '123 Model Town, Block A',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54000'
    },

    // Order Items
    items: [
      {
        productSnapshot: {
          _id: 'prod123',
          title: 'Royal Red Velvet Bridal Suit',
          images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
            'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400'
          ]
        },
        isCustom: true,
        quantity: 1,
        fabric: 'Premium Velvet with Silk Lining',
        price: 25000,
        measurements: {
          shirtLength: 42,
          shoulderWidth: 15,
          sleeveLength: 22,
          bust: 38,
          waist: 34
        },
        specialInstructions: 'Please add extra embroidery on sleeves. Make dupatta slightly longer.',
        referenceImages: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600'
        ]
      },
      {
        productSnapshot: {
          _id: 'prod456',
          title: 'Embroidered Chiffon Dupatta',
          images: [
            'https://images.unsplash.com/photo-1594992182550-0e5c0a0c9fbc?w=400'
          ]
        },
        isCustom: false,
        quantity: 1,
        fabric: 'Pure Chiffon',
        price: 5000
      }
    ],

    // Pricing Breakdown
    pricing: {
      subtotal: 30000,
      shippingCharges: 300,
      discount: 0,
      total: 30300
    },

    // Payment Information
    payment: {
      method: 'bank-transfer',
      status: 'verified',
      transactionId: 'TXN20250115ABC123',
      transactionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      receiptImage: 'https://example.com/receipts/receipt123.jpg',
      verifiedBy: 'admin001',
      verifiedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },

    // Status History with Timestamps
    statusHistory: [
      {
        status: 'order-received',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Order received successfully'
      },
      {
        status: 'payment-verified',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Payment verified via bank transfer'
      },
      {
        status: 'material-arranged',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Premium velvet fabric and accessories arranged'
      },
      {
        status: 'in-progress',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        note: 'Stitching started by our master tailor'
      }
    ],

    // Tracking Information (optional - if order is dispatched)
    tracking: {
      courierService: 'TCS Express',
      trackingNumber: 'TCS123456789',
      dispatchDate: null, // Will be filled when dispatched
      deliveryDate: null
    },

    // Assigned Tailor
    assignedTailor: 'Master Tailor - Asif Ahmed',

    // Admin Notes (internal only - not shown to customers)
    notes: [
      {
        text: 'Customer requested extra attention on embroidery',
        addedBy: 'admin001',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
};

/**
 * GET handler - Retrieve order tracking details
 */
export async function GET(request, { params }) {
  try {
    const { orderNumber } = params;

    // Validate order number format
    const orderNumberPattern = /^LC-\d{4}-\d{4}$/;
    if (!orderNumberPattern.test(orderNumber)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid order number format' 
        },
        { status: 400 }
      );
    }

    // Connect to database
    // const db = await connectToDatabase();
    // const ordersCollection = db.collection('orders');

    // Fetch order from database (replace with actual query)
    // const order = await ordersCollection.findOne(
    //   { orderNumber: orderNumber },
    //   {
    //     projection: {
    //       // Exclude sensitive admin-only fields
    //       'notes': 0,
    //       'payment.receiptImage': 0 // Only admin should see receipt
    //     }
    //   }
    // );

    // MOCK DATA - Replace with actual database query
    const order = getMockOrderData(orderNumber);

    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order not found' 
        },
        { status: 404 }
      );
    }

    // Remove sensitive admin-only data before sending to client
    delete order.notes;
    if (order.payment && order.payment.receiptImage) {
      delete order.payment.receiptImage;
    }

    // Return order data
    return NextResponse.json(
      { 
        success: true, 
        order: order,
        message: 'Order details retrieved successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Update order status (Admin only)
 * Used by admin to update order status
 * Requires authentication
 */
export async function POST(request, { params }) {
  try {
    const { orderNumber } = params;
    const body = await request.json();
    const { status, note } = body;

    // Verify admin authentication (implement your auth logic)
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Validate status value
    const validStatuses = [
      'order-received',
      'payment-verified',
      'in-progress',
      'quality-check',
      'ready-dispatch',
      'out-for-delivery',
      'delivered',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid status value' 
        },
        { status: 400 }
      );
    }

    // Connect to database
    // const db = await connectToDatabase();
    // const ordersCollection = db.collection('orders');

    // Update order status in database
    // const result = await ordersCollection.updateOne(
    //   { orderNumber: orderNumber },
    //   {
    //     $set: { status: status },
    //     $push: {
    //       statusHistory: {
    //         status: status,
    //         timestamp: new Date(),
    //         note: note || ''
    //       }
    //     }
    //   }
    // );

    // Send notifications to customer
    // await sendStatusUpdateEmail(orderNumber, status);
    // await sendWhatsAppNotification(orderNumber, status);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Order status updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update order status' 
      },
      { status: 500 }
    );
  }
}