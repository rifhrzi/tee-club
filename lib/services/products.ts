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