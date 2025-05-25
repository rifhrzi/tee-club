import midtransClient from "midtrans-client";
import { OrderInput } from "./validation";
import { db } from "@/lib/db";

// Initialize Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export async function createPayment(order: OrderInput, user: any, customBaseUrl?: string) {
  // Generate a unique order ID
  const orderId = `ORDER-${Date.now()}`;

  // Base URL for redirects
  // Get the base URL from the parameter, or use a default based on environment
  let baseUrl = customBaseUrl;

  // If not set, use a default based on environment
  if (!baseUrl) {
    baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://your-production-domain.com"
        : "http://localhost:3000";
  }

  console.log("Payment creation - Using base URL:", baseUrl);

  const transactionDetails = {
    transaction_details: {
      order_id: orderId,
      gross_amount: await calculateTotal(order.items),
    },
    customer_details: {
      first_name: user.name,
      email: user.email,
      phone: order.shippingDetails.phone,
    },
    shipping_address: {
      first_name: order.shippingDetails.name,
      phone: order.shippingDetails.phone,
      address: order.shippingDetails.address,
      city: order.shippingDetails.city,
      postal_code: order.shippingDetails.postalCode,
    },
    callbacks: {
      finish: `${baseUrl}/payment/success?order_id=${orderId}`,
      error: `${baseUrl}/payment/failure?order_id=${orderId}`,
      pending: `${baseUrl}/payment/pending?order_id=${orderId}`,
    },
  };

  try {
    const transaction = await snap.createTransaction(transactionDetails);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    };
  } catch (error) {
    console.error("Midtrans payment creation failed:", error);
    throw new Error("Payment creation failed");
  }
}

async function calculateTotal(items: OrderInput["items"]): Promise<number> {
  // Validate input
  if (!items || items.length === 0) {
    throw new Error("No items provided for calculation");
  }

  // Extract product IDs and validate format
  const productIds = items.map((item) => item.productId);
  const invalidIds = productIds.filter((id) => !isValidProductId(id));

  if (invalidIds.length > 0) {
    console.error("Invalid product IDs found:", invalidIds);
    throw new Error(
      `Invalid product IDs detected: ${invalidIds.join(
        ", "
      )}. Please refresh your cart and try again.`
    );
  }

  // Fetch products from database to get prices
  const products = await db.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      price: true,
      name: true,
    },
  });

  console.log(`Found ${products.length} products for ${items.length} cart items`);

  // Check for missing products
  const foundProductIds = products.map((p) => p.id);
  const missingProductIds = productIds.filter((id) => !foundProductIds.includes(id));

  if (missingProductIds.length > 0) {
    console.error("Products not found in database:", missingProductIds);
    throw new Error(
      `Products no longer available: ${missingProductIds.join(
        ", "
      )}. Please remove these items from your cart and try again.`
    );
  }

  // Calculate total with validation
  return items.reduce((total, item) => {
    const product = products.find((p: any) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found during calculation`);
    }

    // Validate quantity
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for product ${product.name}: ${item.quantity}`);
    }

    const itemTotal = product.price * item.quantity;
    console.log(`Product ${product.name}: ${product.price} x ${item.quantity} = ${itemTotal}`);

    return total + itemTotal;
  }, 0);
}

// Helper function to validate product ID format
function isValidProductId(id: string): boolean {
  // UUID format: 8-4-4-4-12 characters (with hyphens)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // CUID format: starts with 'c' followed by 24 characters
  const cuidRegex = /^c[a-z0-9]{24}$/i;

  return uuidRegex.test(id) && !cuidRegex.test(id); // Only allow UUID, reject CUID
}
