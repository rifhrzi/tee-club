import { NextResponse } from 'next/server';
import { createPayment } from '@/lib/payment';
import { orderSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { getProductStock } from '@/lib/services/products';
import { storeCheckoutSession } from '@/lib/checkout-session';
import { ZodError } from 'zod';

// Helper function to calculate order total
async function calculateOrderTotal(items: any[]): Promise<number> {
  let total = 0;

  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: { variants: true },
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    let price = product.price;

    if (item.variantId) {
      const variant = product.variants.find((v: any) => v.id === item.variantId);
      if (variant) {
        price = variant.price;
      }
    }

    total += price * item.quantity;
  }

  return total;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await rateLimit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Log all headers for debugging
    console.log('Checkout API - Request headers:');
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    // Enforce authentication via NextAuth (set by middleware)
    const nextAuthUserId = request.headers.get('x-nextauth-user-id');
    const nextAuthUserEmail = request.headers.get('x-nextauth-user-email');

    console.log('Checkout API - Authentication info:', {
      'x-nextauth-user-id': nextAuthUserId,
      'x-nextauth-user-email': nextAuthUserEmail
    });

    // Check for cookies in the request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      console.log('Checkout API - Request cookies:');
      cookieHeader.split(';').forEach(cookie => {
        console.log(`  ${cookie.trim()}`);
      });
    }

    if (!nextAuthUserId) {
      console.log('Checkout API - No NextAuth user ID, returning 401');
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Authentication required. Please log in to continue with checkout.',
        code: 'AUTH_REQUIRED'
      }, {
        status: 401,
        headers: {
          'X-Auth-Required': 'true',
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: nextAuthUserId },
    });

    if (!user) {
      console.log('Checkout API - User not found for ID:', nextAuthUserId);
      return NextResponse.json({
        error: 'User not found',
        message: 'The user associated with this authentication could not be found',
        code: 'USER_NOT_FOUND'
      }, {
        status: 404,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    console.log('Checkout API - Authenticated user:', user.email);

    // Validate request body
    const body = await request.json();
    console.log('Checkout API - Raw request body:', JSON.stringify(body, null, 2));
    const validatedData = orderSchema.parse(body);

    // CRITICAL: Validate stock availability before creating order
    console.log('Checkout API - Validating stock for all items');
    console.log('Checkout API - Items received:', JSON.stringify(validatedData.items, null, 2));

    for (const item of validatedData.items) {
      console.log(`Checkout API - Checking stock for product ID: ${item.productId}, variant ID: ${item.variantId || 'none'}`);

      const availableStock = await getProductStock(item.productId, item.variantId);
      console.log(`Checkout API - Available stock for ${item.productId}: ${availableStock}`);

      if (availableStock < item.quantity) {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          include: { variants: true }
        });

        console.log(`Checkout API - Product lookup result:`, product ? {
          id: product.id,
          name: product.name,
          stock: product.stock,
          variantCount: product.variants.length
        } : 'Product not found');

        let itemName = product?.name || 'Unknown Product';
        if (item.variantId) {
          const variant = product?.variants.find(v => v.id === item.variantId);
          console.log(`Checkout API - Variant lookup result:`, variant ? {
            id: variant.id,
            name: variant.name,
            stock: variant.stock
          } : 'Variant not found');
          itemName += ` (${variant?.name || 'Unknown Variant'})`;
        }

        console.log(`Checkout API - Insufficient stock for ${itemName}: requested ${item.quantity}, available ${availableStock}`);

        return NextResponse.json({
          error: 'Insufficient stock',
          message: `Sorry, we only have ${availableStock} units of "${itemName}" available. Please adjust your quantity and try again.`,
          code: 'INSUFFICIENT_STOCK',
          item: {
            productId: item.productId,
            variantId: item.variantId,
            requestedQuantity: item.quantity,
            availableStock: availableStock,
            itemName: itemName
          }
        }, { status: 400 });
      }
    }
    console.log('Checkout API - Stock validation passed for all items');

    // Get the origin from the request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    console.log('Checkout API - Request origin:', origin);

    // Create payment with the origin as the base URL
    const payment = await createPayment(validatedData, user, origin);

    // Store checkout session data temporarily (no order created yet)
    const checkoutSession = {
      orderId: payment.orderId,
      userId: user.id,
      items: validatedData.items,
      shippingDetails: validatedData.shippingDetails,
      paymentMethod: validatedData.paymentMethod,
      paymentToken: payment.token,
      totalAmount: await calculateOrderTotal(validatedData.items),
      createdAt: new Date().toISOString()
    };

    console.log('Checkout API - Created checkout session:', {
      orderId: payment.orderId,
      itemCount: validatedData.items.length,
      totalAmount: checkoutSession.totalAmount
    });

    // Store the checkout session for later retrieval during payment success
    storeCheckoutSession(checkoutSession);

    return NextResponse.json({
      orderId: payment.orderId,
      redirectUrl: payment.redirect_url,
      message: 'Checkout session created successfully'
    });
  } catch (error) {
    console.error('Checkout API - Error:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Checkout failed', message: errorMessage }, { status: 500 });
  }
}