import React from "react";
import Link from "next/link";
import { PRODUCTS, formatPrice } from "../../constants";

export const NewArrivals = () => {
  return (
    <section className="bg-grunge-charcoal/50 bg-noise mb-20 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center justify-between md:flex-row">
          <div className="mb-6 text-center md:mb-0 md:text-left">
            <h2 className="font-grunge text-band-white mb-3 text-4xl md:text-5xl">
              FRESH <span className="text-neon">DROPS</span>
            </h2>
            <p className="text-grunge-light font-metal text-lg">
              Latest underground merch that just hit the streets
            </p>
          </div>
          <Link href="/shop" className="btn-electric">
            <i className="fas fa-fire mr-2"></i>
            VIEW ALL MERCH
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PRODUCTS.newArrivals.map((product) => (
            <div key={product.id} className="product-card group">
              <Link href={`/product/${product.id}`}>
                <div className="relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="filter-vintage group-hover:filter-grunge h-[350px] w-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="from-grunge-dark/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <div className="card-grunge -translate-y-4 transform px-6 py-3 transition-transform duration-300 group-hover:translate-y-0">
                      <span className="text-accent-electric font-grunge flex items-center text-lg">
                        <i className="fas fa-eye mr-2"></i>
                        VIEW DETAILS
                      </span>
                    </div>
                  </div>

                  {/* Band-style corner badge */}
                  <div className="bg-accent-fire text-band-white font-grunge absolute right-4 top-4 rounded-full px-3 py-1 text-xs uppercase tracking-wider">
                    NEW
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-grunge text-band-white group-hover:text-neon mb-2 text-xl uppercase transition-colors duration-300">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-accent-electric font-metal text-lg font-semibold">
                      {formatPrice(product.price)}
                    </p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star text-accent-gold text-xs"></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-grunge-fog mt-2 line-clamp-2 text-sm">{product.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
