import React from "react";
import Link from "next/link";
import { PRODUCTS, formatPrice } from "../../constants";

export const NewArrivals = () => {
  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Produk Terbaru</h3>
        <Link
          href="/shop"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Lihat Semua →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTS.newArrivals.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/product/${product.id}`}>
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[300px] object-cover transform transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">
                    Lihat Detail
                  </span>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h4>
              <p className="text-gray-600">{formatPrice(product.price)}</p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
