/**
 * Order Processing Service
 * 
 * Handles order lifecycle events including:
 * - Stock reduction on payment confirmation
 * - Stock restoration on refunds
 * - Order status transitions
 * - Inventory synchronization
 */

import { db } from '@/lib/db';
import { processOrderStockChanges, validateStockAvailability } from './inventory';

export interface OrderProcessingResult {
  success: boolean;
  orderId: string;
  message: string;
  stockChanges?: Array<{
    productId: string;
    variantId?: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Processes order payment confirmation and reduces stock
 * @param orderId Order ID to process
 * @returns Processing result
 */
export async function processOrderPayment(orderId: string): Promise<OrderProcessingResult> {
  try {
    console.log(`Processing payment for order ${orderId}`);

    // Get order with items
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, stock: true },
            },
            variant: {
              select: { id: true, name: true, stock: true },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        orderId,
        message: 'Order not found',
      };
    }

    // Check if order is already processed
    if (order.status !== 'PENDING') {
      return {
        success: false,
        orderId,
        message: `Order is already in ${order.status} status`,
      };
    }

    // Validate stock availability before processing
    const stockValidation = await validateStockAvailability(
      order.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      }))
    );

    const invalidItems = stockValidation.filter(result => !result.isValid);
    if (invalidItems.length > 0) {
      const errorMessages = invalidItems.map(item => 
        `${item.productName}${item.variantName ? ` (${item.variantName})` : ''}: requested ${item.requestedQuantity}, available ${item.availableStock}`
      );

      return {
        success: false,
        orderId,
        message: `Insufficient stock for items: ${errorMessages.join(', ')}`,
      };
    }

    // Process stock changes in a transaction
    const stockResult = await processOrderStockChanges(
      orderId,
      order.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      })),
      'PURCHASE',
      `Order payment confirmed - Order #${orderId.substring(0, 8)}`
    );

    if (!stockResult.success) {
      return {
        success: false,
        orderId,
        message: 'Failed to update stock levels',
        stockChanges: stockResult.results,
      };
    }

    // Update order status to PAID
    await db.order.update({
      where: { id: orderId },
      data: { 
        status: 'PAID',
        updatedAt: new Date(),
      },
    });

    console.log(`Order ${orderId} payment processed successfully`);

    return {
      success: true,
      orderId,
      message: 'Order payment processed and stock updated successfully',
      stockChanges: stockResult.results,
    };

  } catch (error) {
    console.error(`Error processing order payment ${orderId}:`, error);
    return {
      success: false,
      orderId,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Processes order refund and restores stock
 * @param orderId Order ID to refund
 * @returns Processing result
 */
export async function processOrderRefund(orderId: string): Promise<OrderProcessingResult> {
  try {
    console.log(`Processing refund for order ${orderId}`);

    // Get order with items
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, stock: true },
            },
            variant: {
              select: { id: true, name: true, stock: true },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        orderId,
        message: 'Order not found',
      };
    }

    // Check if order can be refunded
    const refundableStatuses = ['PAID', 'PROCESSING', 'REFUND_REQUESTED'];
    if (!refundableStatuses.includes(order.status)) {
      return {
        success: false,
        orderId,
        message: `Order cannot be refunded from ${order.status} status`,
      };
    }

    // Process stock restoration
    const stockResult = await processOrderStockChanges(
      orderId,
      order.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      })),
      'REFUND',
      `Order refund processed - Order #${orderId.substring(0, 8)}`
    );

    if (!stockResult.success) {
      return {
        success: false,
        orderId,
        message: 'Failed to restore stock levels',
        stockChanges: stockResult.results,
      };
    }

    // Update order status to REFUNDED
    await db.order.update({
      where: { id: orderId },
      data: { 
        status: 'REFUNDED',
        updatedAt: new Date(),
      },
    });

    console.log(`Order ${orderId} refund processed successfully`);

    return {
      success: true,
      orderId,
      message: 'Order refund processed and stock restored successfully',
      stockChanges: stockResult.results,
    };

  } catch (error) {
    console.error(`Error processing order refund ${orderId}:`, error);
    return {
      success: false,
      orderId,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Validates cart items against current stock before checkout
 * @param items Cart items to validate
 * @returns Validation result
 */
export async function validateCartStock(
  items: Array<{ productId: string; variantId?: string; quantity: number }>
): Promise<{
  isValid: boolean;
  invalidItems: Array<{
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    requestedQuantity: number;
    availableStock: number;
  }>;
}> {
  const stockValidation = await validateStockAvailability(items);
  const invalidItems = stockValidation
    .filter(result => !result.isValid)
    .map(result => ({
      productId: result.productId,
      variantId: result.variantId,
      productName: result.productName,
      variantName: result.variantName,
      requestedQuantity: result.requestedQuantity,
      availableStock: result.availableStock,
    }));

  return {
    isValid: invalidItems.length === 0,
    invalidItems,
  };
}

/**
 * Handles order status transitions with appropriate stock changes
 * @param orderId Order ID
 * @param newStatus New order status
 * @param userId User making the change (for admin changes)
 * @returns Processing result
 */
export async function handleOrderStatusChange(
  orderId: string,
  newStatus: string,
  userId?: string
): Promise<OrderProcessingResult> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return {
        success: false,
        orderId,
        message: 'Order not found',
      };
    }

    const currentStatus = order.status;

    // Handle stock changes based on status transitions
    if (currentStatus === 'PENDING' && newStatus === 'PAID') {
      return await processOrderPayment(orderId);
    } else if (
      ['PAID', 'PROCESSING', 'REFUND_REQUESTED'].includes(currentStatus) && 
      newStatus === 'REFUNDED'
    ) {
      return await processOrderRefund(orderId);
    } else {
      // Simple status update without stock changes
      await db.order.update({
        where: { id: orderId },
        data: { 
          status: newStatus as any,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        orderId,
        message: `Order status updated to ${newStatus}`,
      };
    }
  } catch (error) {
    console.error(`Error handling order status change ${orderId}:`, error);
    return {
      success: false,
      orderId,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
