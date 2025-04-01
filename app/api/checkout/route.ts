import { NextResponse } from 'next/server'
import { createPayment } from '@/lib/payment'
import { orderSchema } from '@/lib/validation'
import { verifyToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const { success } = await rateLimit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Auth check
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const decoded = verifyToken(token)
    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Create payment
    const payment = await createPayment(validatedData, user)

    // Create order in database
    const order = await db.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        items: {
          create: await Promise.all(validatedData.items.map(async (item) => {
            const product = await db.product.findUnique({
              where: { id: item.productId },
              include: { variants: true }
            });

            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            // Check if the variant exists and is valid
            let validVariant = null;
            let price = product.price;

            if (item.variantId) {
              validVariant = product.variants.find(v => v.id === item.variantId);
              if (validVariant) {
                price = validVariant.price;
              }
            }

            // Create the order item with or without variantId
            const orderItem: any = {
              productId: item.productId,
              quantity: item.quantity,
              price: price
            };

            // Only add variantId if it's a valid variant
            if (validVariant) {
              orderItem.variantId = item.variantId;
            }

            return orderItem;
          }))
        },
        totalAmount: (await Promise.all(validatedData.items.map(async (item) => {
          const product = await db.product.findUnique({
            where: { id: item.productId },
            include: { variants: true }
          });
          if (!product) throw new Error(`Product ${item.productId} not found`);

          // Calculate price based on variant if it exists and is valid
          let price = product.price;
          if (item.variantId) {
            const validVariant = product.variants.find(v => v.id === item.variantId);
            if (validVariant) {
              price = validVariant.price;
            }
          }

          return price * item.quantity;
        }))).reduce((sum, price) => sum + price, 0),
        shippingDetails: {
          create: validatedData.shippingDetails
        },
        paymentMethod: validatedData.paymentMethod,
        paymentToken: payment.token
      }
    })

    return NextResponse.json({
      orderId: order.id,
      redirectUrl: payment.redirect_url
    })

  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}












