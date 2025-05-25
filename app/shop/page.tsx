import { getProducts } from '@/lib/services/products'
import ShopClient from './ShopClient'

// Force dynamic rendering to avoid static generation errors
export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const products = await getProducts()

  return <ShopClient products={products} />
}
