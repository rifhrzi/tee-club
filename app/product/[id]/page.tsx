import { getProductById } from '@/lib/services/products';
import ProductClient from './ProductClient';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  return <ProductClient product={product} />;
}