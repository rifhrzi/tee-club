import { NextResponse } from 'next/server'
import midtransClient from 'midtrans-client'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // Get the notification body
    const body = await request.json()

    // Create notification instance
    const notification = new midtransClient.Notification({
      isProduction: process.env.NODE_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    })

    // Verify the notification
    const notificationJson = await notification.fromJson(body)

    // Extract order ID from the notification
    // Midtrans format: ORDER-timestamp
    const orderId = notificationJson.order_id

    // Extract transaction status
    const transactionStatus = notificationJson.transaction_status
    const fraudStatus = notificationJson.fraud_status

    let orderStatus = 'PENDING'

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        // Transaction is challenged as fraud
        orderStatus = 'PENDING'
      } else if (fraudStatus === 'accept') {
        // Transaction is not fraud
        orderStatus = 'PAID'
      }
    } else if (transactionStatus === 'settlement') {
      // Transaction is settled
      orderStatus = 'PAID'
    } else if (transactionStatus === 'cancel' ||
               transactionStatus === 'deny' ||
               transactionStatus === 'expire') {
      // Transaction is cancelled, denied, or expired
      orderStatus = 'CANCELLED'
    } else if (transactionStatus === 'pending') {
      // Transaction is pending
      orderStatus = 'PENDING'
    }

    // Find the order by payment token instead of ID
    // Since Midtrans order_id is not the same as our database order ID
    const order = await db.order.findFirst({
      where: {
        OR: [
          { paymentToken: notificationJson.transaction_id },
          // Also try to match by the order ID prefix
          { id: { startsWith: orderId.replace('ORDER-', '') } }
        ]
      }
    });

    if (order) {
      // Update order status in database
      await db.order.update({
        where: { id: order.id },
        data: { status: orderStatus }
      });
    } else {
      console.error(`Order not found for notification: ${orderId}`);
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Midtrans notification error:', error)
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500 }
    )
  }
}
