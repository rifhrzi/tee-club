import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Parse the notification data
    const notification = await request.json();
    
    console.log('Received payment notification:', notification);
    
    // Extract order ID and transaction status
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Find the order in the database
    const order = await db.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Update order status based on transaction status
    let newStatus = order.status;
    
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      newStatus = 'PAID';
    } else if (transactionStatus === 'pending') {
      newStatus = 'PENDING';
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      newStatus = 'CANCELLED';
    }
    
    // Update the order in the database
    await db.order.update({
      where: { id: orderId },
      data: { 
        status: newStatus,
        paymentDetails: {
          upsert: {
            create: {
              provider: 'midtrans',
              transactionId: notification.transaction_id || '',
              status: transactionStatus,
              amount: parseFloat(notification.gross_amount || '0'),
              rawResponse: JSON.stringify(notification)
            },
            update: {
              status: transactionStatus,
              rawResponse: JSON.stringify(notification)
            }
          }
        }
      }
    });
    
    console.log(`Updated order ${orderId} status to ${newStatus}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment notification error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment notification' },
      { status: 500 }
    );
  }
}
