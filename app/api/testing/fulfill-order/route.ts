import { NextResponse } from 'next/server';
import { fulfillOrderAndReduceStock } from '@/lib/services/products';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    console.log(`Testing: Attempting to fulfill order ${orderId}`);

    // First, let's check if the order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`Testing: Found order with ${order.items.length} items`);
    console.log(`Testing: Current order status: ${order.status}`);

    // Show current stock levels before fulfillment
    const stockBefore = [];
    for (const item of order.items) {
      if (item.variantId) {
        const variant = await db.variant.findUnique({ where: { id: item.variantId } });
        stockBefore.push({
          type: 'variant',
          id: item.variantId,
          name: variant?.name,
          stockBefore: variant?.stock,
          quantityToReduce: item.quantity
        });
      } else {
        const product = await db.product.findUnique({ where: { id: item.productId } });
        stockBefore.push({
          type: 'product',
          id: item.productId,
          name: product?.name,
          stockBefore: product?.stock,
          quantityToReduce: item.quantity
        });
      }
    }

    // Attempt to fulfill the order
    const result = await fulfillOrderAndReduceStock(orderId);

    // Show stock levels after fulfillment
    const stockAfter = [];
    for (const item of order.items) {
      if (item.variantId) {
        const variant = await db.variant.findUnique({ where: { id: item.variantId } });
        stockAfter.push({
          type: 'variant',
          id: item.variantId,
          name: variant?.name,
          stockAfter: variant?.stock
        });
      } else {
        const product = await db.product.findUnique({ where: { id: item.productId } });
        stockAfter.push({
          type: 'product',
          id: item.productId,
          name: product?.name,
          stockAfter: product?.stock
        });
      }
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Order fulfilled successfully' : result.error,
      orderId,
      stockBefore,
      stockAfter,
      fulfillmentResult: result
    });

  } catch (error) {
    console.error('Testing: Order fulfillment test failed:', error);
    return NextResponse.json({
      error: 'Failed to test order fulfillment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check order details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order,
      itemCount: order.items.length,
      status: order.status
    });

  } catch (error) {
    console.error('Testing: Failed to get order details:', error);
    return NextResponse.json({
      error: 'Failed to get order details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
