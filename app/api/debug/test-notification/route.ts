import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Simulate a Midtrans payment notification
    const testNotification = {
      order_id: 'ORDER-1748046521656', // Use the order ID from your recent checkout
      transaction_status: 'settlement',
      fraud_status: 'accept',
      transaction_id: 'test-transaction-123',
      gross_amount: '299000',
      payment_type: 'credit_card',
      transaction_time: new Date().toISOString()
    };

    console.log('Test notification - Sending to Midtrans notification handler:', testNotification);

    // Send the test notification to our Midtrans notification handler
    const response = await fetch('http://localhost:3001/api/midtrans/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNotification),
    });

    const result = await response.json();
    
    console.log('Test notification - Response from handler:', result);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      testNotification,
      handlerResponse: result,
      handlerStatus: response.status
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
