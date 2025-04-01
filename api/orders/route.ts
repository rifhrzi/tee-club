import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orderSchema } from '@/lib/validation'
import { createPayment } from '@/lib/payment'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const limiter = await rateLimit(request)
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Check stock availability
    const products = await db.product.findMany({
      where: {
        id: { in: validatedData.items.map(item => item.productId) }
      },
      include: { variants: true }
    })

    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        )
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId: request.headers.get('x-user-id')!,
        items: validatedData.items,
        total: calculateTotal(validatedData.items, products),
        status: 'pending',
        paymentStatus: 'pending',
        shippingDetails: validatedData.shippingDetails,
      }
    })

    // Create payment
    const payment = await createPayment(order)

    return NextResponse.json({ 
      orderId: order.id,
      paymentToken: payment.token,
      redirectUrl: payment.redirect_url
    })

  } catch (error) {
    console.error('Order creation failed:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
