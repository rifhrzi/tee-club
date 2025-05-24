import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function GET() {
  try {
    console.log('Testing Midtrans configuration...');
    
    // Check environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    
    if (!serverKey || !clientKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Midtrans configuration',
        details: {
          hasServerKey: !!serverKey,
          hasClientKey: !!clientKey,
          serverKeyPrefix: serverKey ? serverKey.substring(0, 10) + '...' : 'missing',
          clientKeyPrefix: clientKey ? clientKey.substring(0, 10) + '...' : 'missing'
        }
      });
    }

    // Test Midtrans Snap initialization
    try {
      const snap = new midtransClient.Snap({
        isProduction: process.env.NODE_ENV === 'production',
        serverKey: serverKey,
        clientKey: clientKey,
      });

      console.log('Midtrans Snap initialized successfully');

      // Test CoreApi initialization
      const core = new midtransClient.CoreApi({
        isProduction: process.env.NODE_ENV === 'production',
        serverKey: serverKey,
        clientKey: clientKey,
      });

      console.log('Midtrans CoreApi initialized successfully');

      // Try to create a test transaction (this will fail but we can see the error)
      try {
        const testTransaction = {
          transaction_details: {
            order_id: 'test-' + Date.now(),
            gross_amount: 10000,
          },
          customer_details: {
            first_name: 'Test',
            email: 'test@example.com',
            phone: '081234567890',
          },
          callbacks: {
            finish: 'http://localhost:3001/payment/success',
            error: 'http://localhost:3001/payment/failure',
            pending: 'http://localhost:3001/payment/pending',
          },
        };

        const transaction = await snap.createTransaction(testTransaction);
        
        return NextResponse.json({
          success: true,
          message: 'Midtrans is working correctly',
          testTransaction: {
            token: transaction.token ? 'Generated successfully' : 'Failed to generate',
            redirect_url: transaction.redirect_url ? 'Generated successfully' : 'Failed to generate'
          },
          config: {
            isProduction: process.env.NODE_ENV === 'production',
            serverKeyPrefix: serverKey.substring(0, 10) + '...',
            clientKeyPrefix: clientKey.substring(0, 10) + '...'
          }
        });

      } catch (transactionError) {
        console.error('Midtrans transaction test error:', transactionError);
        
        return NextResponse.json({
          success: false,
          error: 'Midtrans transaction creation failed',
          details: {
            message: transactionError instanceof Error ? transactionError.message : 'Unknown error',
            isProduction: process.env.NODE_ENV === 'production',
            serverKeyPrefix: serverKey.substring(0, 10) + '...',
            clientKeyPrefix: clientKey.substring(0, 10) + '...',
            possibleCauses: [
              'Invalid server key or client key',
              'Midtrans sandbox server issues',
              'Network connectivity problems',
              'Rate limiting from Midtrans',
              'Invalid transaction details format'
            ]
          }
        });
      }

    } catch (initError) {
      console.error('Midtrans initialization error:', initError);
      
      return NextResponse.json({
        success: false,
        error: 'Midtrans initialization failed',
        details: {
          message: initError instanceof Error ? initError.message : 'Unknown error',
          serverKeyPrefix: serverKey.substring(0, 10) + '...',
          clientKeyPrefix: clientKey.substring(0, 10) + '...'
        }
      });
    }

  } catch (error) {
    console.error('Midtrans debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
