import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { createPayment } from '@/lib/payment'
import { orderSchema } from '@/lib/validation'
import { db } from '@/lib/db'

async function calculateOrderTotal(items: { productId: string; quantity: number }[]) {
  const products = await db.product.findMany({
    where: {
      id: {
        in: items.map(item => item.productId)
      }
    },
    select: {
      id: true,
      price: true
    }
  });

  return items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    return total + (product.price * item.quantity);
  }, 0);
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await rateLimit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get user from auth header
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create payment
    const payment = await createPayment(validatedData, user)

    // Create order in database
    const order = await db.order.create({
      data: {
        userId: user.id,
        items: validatedData.items,
        total: await calculateOrderTotal(validatedData.items),
        status: 'pending',
        paymentStatus: 'pending',
        paymentId: payment.token,
        shippingDetails: validatedData.shippingDetails,
      }
    })

    return NextResponse.json({
      orderId: order.id,
      paymentToken: payment.token,
      redirectUrl: payment.redirect_url
    })

  } catch (error) {
    console.error('Checkout failed:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}




