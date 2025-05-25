// Type definitions
export interface SiteConfig {
  readonly name: string;
  readonly description: string;
  readonly social: {
    readonly instagram: string;
    readonly twitter: string;
    readonly facebook: string;
  };
}

export interface NavigationItem {
  readonly name: string;
  readonly href: string;
}

export interface NavigationConfig {
  readonly main: ReadonlyArray<NavigationItem>;
  readonly footer: ReadonlyArray<NavigationItem>;
  readonly legal: ReadonlyArray<NavigationItem>;
}

export interface ProductVariant {
  readonly size: string;
  readonly color: string;
}

export interface Product {
  readonly id: string | number;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly images: ReadonlyArray<string>;
  readonly image?: string; // For backward compatibility
  readonly sizes?: ReadonlyArray<string>; // For backward compatibility
  readonly variant?: string | ProductVariant;
  readonly variantId?: string;
}

export interface ProductsConfig {
  readonly newArrivals: ReadonlyArray<Product>;
  readonly featured: {
    readonly main: string;
    readonly grid: ReadonlyArray<string>;
  };
}

// Constants with proper type annotations
export const SITE_CONFIG: SiteConfig = {
  name: "TEELITECLUB",
  description:
    "Premium quality t-shirts designed for style and comfort. Discover modern fashion that fits your lifestyle.",
  social: {
    instagram: "https://instagram.com/teeliteclub",
    twitter: "https://twitter.com/teeliteclub",
    facebook: "https://facebook.com/teeliteclub",
  },
};

export const NAVIGATION: NavigationConfig = {
  main: [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Cart", href: "/cart" },
  ],
  footer: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQs", href: "/faqs" },
    { name: "Size Guide", href: "/size-guide" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

// Utility function to format price in Rupiah
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const PRODUCTS: ProductsConfig = {
  newArrivals: [
    {
      id: 1,
      name: "Classic White Tee",
      price: 299000,
      image:
        "https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=800",
      images: [
        "https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      description:
        "Premium quality white t-shirt made from 100% organic cotton. Perfect for everyday wear with a comfortable, relaxed fit.",
      stock: 50,
      sizes: ["S", "M", "L", "XL"],
    },
    {
      id: 2,
      name: "Urban Black Tee",
      price: 349000,
      image:
        "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800",
      images: [
        "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      description:
        "Sleek black t-shirt with modern minimalist design. Made from premium cotton blend for superior comfort and durability.",
      stock: 35,
      sizes: ["M", "L", "XL", "XXL"],
    },
    {
      id: 3,
      name: "Vintage Print Tee",
      price: 399000,
      image:
        "https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg?auto=compress&cs=tinysrgb&w=800",
      images: [
        "https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      description:
        "Stylish vintage-inspired print tee with modern fit. Features unique graphic design and soft, breathable fabric.",
      stock: 25,
      sizes: ["S", "M", "L"],
    },
  ],
  featured: {
    main: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800",
    grid: [
      "https://images.pexels.com/photos/1484807/pexels-photo-1484807.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800",
    ],
  },
};
