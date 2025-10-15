// app/api/orders/check/[orderNumber]/route.js
import { NextResponse } from 'next/server';

/**
 * API Route: Check if Order Exists
 * GET /api/orders/check/[orderNumber]
 * 
 * Purpose: Validate order number exists before navigation
 * Used by: Track Order search page
 * Access: Public (no authentication required for tracking)
 */

/**
 * Check if order with given order number exists
 * @param {Request} request - Next.js request object
 * @param {Object} params - Route parameters containing orderNumber
 * @returns {Response} 200 if exists, 404 if not found
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

    // Check if order exists (replace with actual database query)
    // const orderExists = await ordersCollection.findOne(
    //   { orderNumber: orderNumber },
    //   { projection: { _id: 1 } }
    // );

    // MOCK DATA - Replace with actual database query
    const orderExists = true; // Simulate order exists

    if (!orderExists) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Order exists',
        exists: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error checking order:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}