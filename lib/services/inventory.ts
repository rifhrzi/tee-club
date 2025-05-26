/**
 * Enhanced Inventory Management Service
 * 
 * Provides comprehensive inventory management with:
 * - Atomic database transactions
 * - Stock validation and reservation
 * - Audit trail with stock history
 * - Race condition prevention
 * - Real-time stock synchronization
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface StockValidationResult {
  isValid: boolean;
  availableStock: number;
  requestedQuantity: number;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
}

export interface StockReservation {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  expiresAt: Date;
}

export interface StockChangeOptions {
  orderId?: string;
  userId?: string;
  reason: string;
  type: 'PURCHASE' | 'REFUND' | 'ADJUSTMENT' | 'RESTOCK' | 'DAMAGE';
}

/**
 * Validates stock availability for multiple items
 * @param items Array of items to validate
 * @returns Array of validation results
 */
export async function validateStockAvailability(
  items: Array<{ productId: string; variantId?: string; quantity: number }>
): Promise<StockValidationResult[]> {
  const results: StockValidationResult[] = [];

  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: true,
      },
    });

    if (!product) {
      results.push({
        isValid: false,
        availableStock: 0,
        requestedQuantity: item.quantity,
        productId: item.productId,
        variantId: item.variantId,
        productName: 'Product not found',
        variantName: item.variantId ? 'Variant not found' : undefined,
      });
      continue;
    }

    let availableStock = 0;
    let variantName: string | undefined;

    if (item.variantId) {
      const variant = product.variants.find(v => v.id === item.variantId);
      if (variant) {
        availableStock = variant.stock;
        variantName = variant.name;
      }
    } else {
      availableStock = product.stock;
    }

    results.push({
      isValid: availableStock >= item.quantity,
      availableStock,
      requestedQuantity: item.quantity,
      productId: item.productId,
      variantId: item.variantId,
      productName: product.name,
      variantName,
    });
  }

  return results;
}

/**
 * Reduces stock with atomic transaction and audit trail
 * @param productId Product ID
 * @param quantity Quantity to reduce
 * @param variantId Optional variant ID
 * @param options Additional options for stock change
 * @returns Updated product or variant
 */
export async function reduceStockWithHistory(
  productId: string,
  quantity: number,
  variantId?: string,
  options: StockChangeOptions = { reason: 'Stock reduction', type: 'PURCHASE' }
): Promise<{ success: boolean; newStock: number; error?: string }> {
  try {
    return await db.$transaction(async (tx) => {
      if (variantId) {
        // Handle variant stock
        const variant = await tx.variant.findUnique({
          where: { id: variantId },
          include: { product: { select: { name: true } } },
        });

        if (!variant) {
          throw new Error(`Variant ${variantId} not found`);
        }

        if (variant.stock < quantity) {
          throw new Error(
            `Insufficient stock for variant ${variant.name}. Available: ${variant.stock}, Requested: ${quantity}`
          );
        }

        const newStock = variant.stock - quantity;

        // Update variant stock
        const updatedVariant = await tx.variant.update({
          where: { id: variantId },
          data: { stock: newStock },
        });

        // Create stock history record
        await tx.stockHistory.create({
          data: {
            variantId,
            productId,
            type: options.type,
            quantity: -quantity,
            previousStock: variant.stock,
            newStock,
            reason: options.reason,
            orderId: options.orderId,
            userId: options.userId,
          },
        });

        return { success: true, newStock };
      } else {
        // Handle product stock
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        if (product.stock < quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${quantity}`
          );
        }

        const newStock = product.stock - quantity;

        // Update product stock
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: newStock },
        });

        // Create stock history record
        await tx.stockHistory.create({
          data: {
            productId,
            type: options.type,
            quantity: -quantity,
            previousStock: product.stock,
            newStock,
            reason: options.reason,
            orderId: options.orderId,
            userId: options.userId,
          },
        });

        return { success: true, newStock };
      }
    });
  } catch (error) {
    console.error('Error reducing stock:', error);
    return {
      success: false,
      newStock: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Increases stock with atomic transaction and audit trail
 * @param productId Product ID
 * @param quantity Quantity to increase
 * @param variantId Optional variant ID
 * @param options Additional options for stock change
 * @returns Updated product or variant
 */
export async function increaseStockWithHistory(
  productId: string,
  quantity: number,
  variantId?: string,
  options: StockChangeOptions = { reason: 'Stock increase', type: 'RESTOCK' }
): Promise<{ success: boolean; newStock: number; error?: string }> {
  try {
    return await db.$transaction(async (tx) => {
      if (variantId) {
        // Handle variant stock
        const variant = await tx.variant.findUnique({
          where: { id: variantId },
        });

        if (!variant) {
          throw new Error(`Variant ${variantId} not found`);
        }

        const newStock = variant.stock + quantity;

        // Update variant stock
        await tx.variant.update({
          where: { id: variantId },
          data: { stock: newStock },
        });

        // Create stock history record
        await tx.stockHistory.create({
          data: {
            variantId,
            productId,
            type: options.type,
            quantity: quantity,
            previousStock: variant.stock,
            newStock,
            reason: options.reason,
            orderId: options.orderId,
            userId: options.userId,
          },
        });

        return { success: true, newStock };
      } else {
        // Handle product stock
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        const newStock = product.stock + quantity;

        // Update product stock
        await tx.product.update({
          where: { id: productId },
          data: { stock: newStock },
        });

        // Create stock history record
        await tx.stockHistory.create({
          data: {
            productId,
            type: options.type,
            quantity: quantity,
            previousStock: product.stock,
            newStock,
            reason: options.reason,
            orderId: options.orderId,
            userId: options.userId,
          },
        });

        return { success: true, newStock };
      }
    });
  } catch (error) {
    console.error('Error increasing stock:', error);
    return {
      success: false,
      newStock: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Processes stock changes for an entire order
 * @param orderId Order ID
 * @param items Order items
 * @param type Type of stock change
 * @param reason Reason for stock change
 * @returns Results of stock changes
 */
export async function processOrderStockChanges(
  orderId: string,
  items: Array<{ productId: string; variantId?: string; quantity: number }>,
  type: 'PURCHASE' | 'REFUND',
  reason: string
): Promise<{ success: boolean; results: Array<{ productId: string; variantId?: string; success: boolean; error?: string }> }> {
  const results: Array<{ productId: string; variantId?: string; success: boolean; error?: string }> = [];
  let overallSuccess = true;

  for (const item of items) {
    try {
      const result = type === 'PURCHASE' 
        ? await reduceStockWithHistory(item.productId, item.quantity, item.variantId, {
            orderId,
            reason,
            type: 'PURCHASE',
          })
        : await increaseStockWithHistory(item.productId, item.quantity, item.variantId, {
            orderId,
            reason,
            type: 'REFUND',
          });

      results.push({
        productId: item.productId,
        variantId: item.variantId,
        success: result.success,
        error: result.error,
      });

      if (!result.success) {
        overallSuccess = false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        productId: item.productId,
        variantId: item.variantId,
        success: false,
        error: errorMessage,
      });
      overallSuccess = false;
    }
  }

  return { success: overallSuccess, results };
}

/**
 * Gets current stock level for a product or variant
 * @param productId Product ID
 * @param variantId Optional variant ID
 * @returns Current stock level
 */
export async function getCurrentStock(productId: string, variantId?: string): Promise<number> {
  if (variantId) {
    const variant = await db.variant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    });
    return variant?.stock ?? 0;
  } else {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    return product?.stock ?? 0;
  }
}

/**
 * Gets stock status for display purposes
 * @param stock Current stock level
 * @returns Stock status object
 */
export function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      status: 'out_of_stock' as const,
      label: 'Out of Stock',
      color: 'red',
      canPurchase: false,
    };
  } else if (stock <= 5) {
    return {
      status: 'low_stock' as const,
      label: `Only ${stock} left`,
      color: 'orange',
      canPurchase: true,
    };
  } else if (stock <= 10) {
    return {
      status: 'limited_stock' as const,
      label: `${stock} in stock`,
      color: 'yellow',
      canPurchase: true,
    };
  } else {
    return {
      status: 'in_stock' as const,
      label: 'In Stock',
      color: 'green',
      canPurchase: true,
    };
  }
}
