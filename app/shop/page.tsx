import { getProducts } from '@/lib/services/products'
import ShopClient from './ShopClient'

export default async function ShopPage() {
  const products = await getProducts()

  return <ShopClient products={products} />
}
