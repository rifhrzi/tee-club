import midtransClient from 'midtrans-client'
import { OrderInput } from './validation'
import { db } from '@/lib/db'

// Initialize Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export async function createPayment(order: OrderInput, user: any) {
  // Generate a unique order ID
  const orderId = `ORDER-${Date.now()}`;

  // Base URL for redirects
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'
    : 'http://localhost:3003';

  const transactionDetails = {
    transaction_details: {
      order_id: orderId,
      gross_amount: await calculateTotal(order.items),
    },
    customer_details: {
      first_name: user.name,
      email: user.email,
      phone: order.shippingDetails.phone,
    },
    shipping_address: {
      first_name: order.shippingDetails.name,
      phone: order.shippingDetails.phone,
      address: order.shippingDetails.address,
      city: order.shippingDetails.city,
      postal_code: order.shippingDetails.postalCode,
    },
    callbacks: {
      finish: `${baseUrl}/payment/success?order_id=${orderId}`,
      error: `${baseUrl}/payment/failure?order_id=${orderId}`,
      pending: `${baseUrl}/payment/pending?order_id=${orderId}`,
    },
  }

  try {
    const transaction = await snap.createTransaction(transactionDetails)
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    }
  } catch (error) {
    console.error('Midtrans payment creation failed:', error)
    throw new Error('Payment creation failed')
  }
}

async function calculateTotal(items: OrderInput['items']): Promise<number> {
  // Fetch products from database to get prices
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



