import { getProducts } from "@/lib/services/products";
import ShopClient from "./ShopClient";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

export default async function ShopPage() {
  try {
    // Attempt to fetch products from the database
    const products = await getProducts();
    return <ShopClient products={products} />;
  } catch (error) {
    console.error("Error fetching products:", error);

    // Handle database connection errors
    if (error instanceof PrismaClientInitializationError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 border-l-4 border-red-500 bg-red-50 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    We're having trouble connecting to our database. Please try again later or
                    contact support if the issue persists.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Our Shop is Temporarily Unavailable</h2>
            <p className="mb-6">We're working to resolve this issue as quickly as possible.</p>
            <a
              href="/"
              className="inline-block rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Return to Home
            </a>
          </div>
        </div>
      );
    }

    // Handle other errors
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
          <p className="mb-6">
            We encountered an error while loading the shop. Please try again later.
          </p>
          <a
            href="/"
            className="inline-block rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }
}
