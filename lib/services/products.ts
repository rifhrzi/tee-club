import { db } from '@/lib/db'

export async function getProducts() {
  return db.product.findMany({
    include: {
      variants: true
    }
  })
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  })
}

export async function getProductStock(productId: string, variantId?: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      variants: true
    }
  })

  if (!product) return 0

  if (variantId) {
    const variant = product.variants.find(v => v.id === variantId)
    return variant?.stock ?? 0
  }

  return product.stock
}

/**
 * Reduce product stock after successful payment
 * @param productId Product ID
 * @param quantity Quantity to reduce
 * @param variantId Optional variant ID
 * @returns Updated product or variant
 */
export async function reduceProductStock(
  productId: string,
  quantity: number,
  variantId?: string
) {
  console.log(`Reducing stock for product ${productId}, variant ${variantId || 'none'}, quantity ${quantity}`);

  if (variantId) {
    // Reduce variant stock
    const variant = await db.variant.findUnique({
      where: { id: variantId }
    });

    if (!variant) {
      console.error(`Variant ${variantId} not found`);
      throw new Error(`Variant ${variantId} not found`);
    }

    const newStock = Math.max(0, variant.stock - quantity);
    console.log(`Updating variant ${variantId} stock from ${variant.stock} to ${newStock}`);

    return db.variant.update({
      where: { id: variantId },
      data: { stock: newStock }
    });
  } else {
    // Reduce product stock
    const product = await db.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      console.error(`Product ${productId} not found`);
      throw new Error(`Product ${productId} not found`);
    }

    const newStock = Math.max(0, product.stock - quantity);
    console.log(`Updating product ${productId} stock from ${product.stock} to ${newStock}`);

    return db.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });
  }
}