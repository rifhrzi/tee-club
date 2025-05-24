import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('Cart Debug API - Received cart data:', JSON.stringify(body, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Cart data logged to console',
      receivedData: body
    });
  } catch (error) {
    console.error('Cart Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
