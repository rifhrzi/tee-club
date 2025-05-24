import { NextResponse } from 'next/server';
import { getProductStock } from '@/lib/services/products';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');
    
    const stock = await getProductStock(params.id, variantId || undefined);
    
    return NextResponse.json({ 
      stock,
      productId: params.id,
      variantId: variantId || null
    });
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json(
      { error: 'Failed to get stock information' },
      { status: 500 }
    );
  }
}
