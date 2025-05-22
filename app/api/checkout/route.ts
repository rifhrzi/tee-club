import { NextResponse } from 'next/server';
import { createPayment } from '@/lib/payment';
import { orderSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { ZodError } from 'zod';
import { Variant } from '@/store/types';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await rateLimit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Enforce authentication via x-user-id (set by middleware)
    const userId = request.headers.get('x-user-id');
    const authType = request.headers.get('x-auth-type') || 'unknown';
    const nextAuthUserId = request.headers.get('X-NextAuth-User-ID');

    // Log all headers for debugging
    console.log('Checkout API - Request headers:');
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('Checkout API - Authentication info:', {
      'x-user-id': userId,
      'x-auth-type': authType,
      'X-NextAuth-User-ID': nextAuthUserId
    });

    if (!userId) {
      console.log('Checkout API - No user ID, returning 401');
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
      where: { id: userId },
    });

    if (!user) {
      console.log('Checkout API - User not found for ID:', userId);
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

    console.log('Checkout API - Authenticated user:', user.email, 'using auth type:', authType);

    // Validate request body
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Get the origin from the request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    console.log('Checkout API - Request origin:', origin);

    // Create payment with the origin as the base URL
    const payment = await createPayment(validatedData, user, origin);

    // Create order in database
    const order = await db.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        items: {
          create: await Promise.all(
            validatedData.items.map(async (item) => {
              const product = await db.product.findUnique({
                where: { id: item.productId },
                include: { variants: true },
              });

              if (!product) {
                throw new Error(`Product ${item.productId} not found`);
              }

              let validVariant: Variant | null = null;
              let price = product.price;

              if (item.variantId) {
                validVariant = product.variants.find((v: Variant) => v.id === item.variantId) || null;
                if (validVariant) {
                  price = validVariant.price;
                }
              }

              const orderItem: any = {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
              };

              if (validVariant) {
                orderItem.variantId = item.variantId;
              }

              return orderItem;
            })
          ),
        },
        totalAmount: (
          await Promise.all(
            validatedData.items.map(async (item) => {
              const product = await db.product.findUnique({
                where: { id: item.productId },
                include: { variants: true },
              });
              if (!product) throw new Error(`Product ${item.productId} not found`);

              let validVariant: Variant | null = null;
              let price = product.price;

              if (item.variantId) {
                validVariant = product.variants.find((v: Variant) => v.id === item.variantId) || null;
                if (validVariant) {
                  price = validVariant.price;
                }
              }

              return price * item.quantity;
            })
          )
        ).reduce((sum, price) => sum + price, 0),
        shippingDetails: {
          create: validatedData.shippingDetails,
        },
        paymentMethod: validatedData.paymentMethod,
        paymentToken: payment.token,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      redirectUrl: payment.redirect_url,
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