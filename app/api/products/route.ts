import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force dynamic API route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        variants: true
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}