import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        variants: true
      }
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        variants: product.variants.map(variant => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
          stock: variant.stock
        }))
      }))
    });
  } catch (error) {
    console.error('Debug products API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
