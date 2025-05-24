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
    const variant = product.variants.find((v: any) => v.id === variantId)
    return variant?.stock ?? 0
  }

  return product.stock
}

/**
 * Reduce product stock after successful payment with proper validation
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
    // Reduce variant stock with validation
    const variant = await db.variant.findUnique({
      where: { id: variantId }
    });

    if (!variant) {
      console.error(`Variant ${variantId} not found`);
      throw new Error(`Variant ${variantId} not found`);
    }

    // Critical stock validation
    if (variant.stock < quantity) {
      const errorMsg = `Insufficient stock for variant '${variant.name}'. Requested: ${quantity}, Available: ${variant.stock}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`Updating variant ${variantId} stock from ${variant.stock} to ${variant.stock - quantity}`);

    // Use atomic decrement for safety
    return db.variant.update({
      where: { id: variantId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
  } else {
    // Reduce product stock with validation
    const product = await db.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      console.error(`Product ${productId} not found`);
      throw new Error(`Product ${productId} not found`);
    }

    // Critical stock validation
    if (product.stock < quantity) {
      const errorMsg = `Insufficient stock for product '${product.name}'. Requested: ${quantity}, Available: ${product.stock}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`Updating product ${productId} stock from ${product.stock} to ${product.stock - quantity}`);

    // Use atomic decrement for safety
    return db.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
  }
}

/**
 * Create order from checkout session data after successful payment
 * @param checkoutData Checkout session data
 * @returns Created order with PAID status
 */
export async function createOrderFromCheckout(checkoutData: {
  orderId: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; variantId?: string }>;
  shippingDetails: any;
  paymentMethod: string;
  paymentToken: string;
  totalAmount: number;
}) {
  console.log(`Creating order from checkout session: ${checkoutData.orderId}`);

  try {
    const result = await db.$transaction(async (transactionDb) => {
      // 1. Validate stock for all items first
      console.log(`Validating stock for ${checkoutData.items.length} items`);

      for (const item of checkoutData.items) {
        if (item.variantId) {
          const variant = await transactionDb.variant.findUnique({
            where: { id: item.variantId }
          });

          if (!variant) {
            throw new Error(`Variant ${item.variantId} not found`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for variant '${variant.name}'. ` +
              `Requested: ${item.quantity}, Available: ${variant.stock}`
            );
          }
        } else {
          const product = await transactionDb.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product '${product.name}'. ` +
              `Requested: ${item.quantity}, Available: ${product.stock}`
            );
          }
        }
      }

      console.log('Stock validation passed, creating order...');

      // 2. Create the order with PAID status (since payment was successful)
      const order = await transactionDb.order.create({
        data: {
          id: checkoutData.orderId, // Use the same ID from checkout
          userId: checkoutData.userId,
          status: 'PAID', // Order starts as PAID since payment was successful
          totalAmount: checkoutData.totalAmount,
          paymentMethod: checkoutData.paymentMethod as any,
          paymentToken: checkoutData.paymentToken,
          items: {
            create: await Promise.all(
              checkoutData.items.map(async (item) => {
                const product = await transactionDb.product.findUnique({
                  where: { id: item.productId },
                  include: { variants: true },
                });

                if (!product) {
                  throw new Error(`Product ${item.productId} not found`);
                }

                let price = product.price;
                if (item.variantId) {
                  const variant = product.variants.find((v: any) => v.id === item.variantId);
                  if (variant) {
                    price = variant.price;
                  }
                }

                return {
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                  price: price,
                };
              })
            ),
          },
          shippingDetails: {
            create: checkoutData.shippingDetails,
          },
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          shippingDetails: true
        }
      });

      // 3. Reduce stock for each item
      console.log('Reducing stock for all items...');
      for (const item of checkoutData.items) {
        if (item.variantId) {
          await transactionDb.variant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
          console.log(`Reduced variant ${item.variantId} stock by ${item.quantity}`);
        } else {
          await transactionDb.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
          console.log(`Reduced product ${item.productId} stock by ${item.quantity}`);
        }
      }

      console.log(`Successfully created order ${order.id} with PAID status and reduced stock`);
      return order;
    });

    return { success: true, order: result };

  } catch (error) {
    console.error(`Failed to create order from checkout:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      needsRefund: true
    };
  }
}

/**
 * Comprehensive order fulfillment with database transaction
 * This function handles stock reduction for multiple items atomically
 * @param orderId Order ID to fulfill
 * @returns Success status and order details
 */
export async function fulfillOrderAndReduceStock(orderId: string) {
  console.log(`Starting order fulfillment for order ${orderId}`);

  try {
    const result = await db.$transaction(async (transactionDb) => {
      // 1. Get the order with all its items
      const order = await transactionDb.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          user: true,
          shippingDetails: true
        }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status === 'PAID') {
        console.log(`Order ${orderId} is already fulfilled`);
        return { success: true, order, message: 'Order already fulfilled' };
      }

      console.log(`Validating stock for ${order.items.length} items in order ${orderId}`);

      // 2. Validate stock for all items first (fail fast)
      for (const item of order.items) {
        if (item.variantId) {
          // Check variant stock
          const variant = await transactionDb.variant.findUnique({
            where: { id: item.variantId }
          });

          if (!variant) {
            throw new Error(`Variant ${item.variantId} not found for order ${orderId}`);
          }

          if (variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for variant '${variant.name}' in order ${orderId}. ` +
              `Requested: ${item.quantity}, Available: ${variant.stock}`
            );
          }
        } else {
          // Check product stock
          const product = await transactionDb.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            throw new Error(`Product ${item.productId} not found for order ${orderId}`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product '${product.name}' in order ${orderId}. ` +
              `Requested: ${item.quantity}, Available: ${product.stock}`
            );
          }
        }
      }

      console.log(`Stock validation passed for order ${orderId}. Proceeding with stock reduction.`);

      // 3. If all validations pass, reduce stock for each item
      for (const item of order.items) {
        if (item.variantId) {
          await transactionDb.variant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
          console.log(`Reduced variant ${item.variantId} stock by ${item.quantity}`);
        } else {
          await transactionDb.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
          console.log(`Reduced product ${item.productId} stock by ${item.quantity}`);
        }
      }

      // 4. Update order status to PAID
      const updatedOrder = await transactionDb.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          updatedAt: new Date()
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          user: true,
          shippingDetails: true
        }
      });

      console.log(`Successfully fulfilled order ${orderId} and updated status to PAID`);

      return { success: true, order: updatedOrder, message: 'Order fulfilled successfully' };
    });

    return result;

  } catch (error) {
    console.error(`Order fulfillment failed for order ${orderId}:`, error);

    // Determine error type for better handling
    let errorMessage = "Could not fulfill your order due to an unexpected issue.";
    if (error instanceof Error) {
      if (error.message.includes("Insufficient stock")) {
        errorMessage = error.message;
      } else if (error.message.includes("not found")) {
        errorMessage = "One or more items in your order could not be found.";
      }
    }

    return {
      success: false,
      error: errorMessage,
      order: null,
      needsRefund: true // Indicates that payment may need to be refunded
    };
  }
}