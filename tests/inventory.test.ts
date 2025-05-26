/**
 * Comprehensive Inventory Management System Tests
 * 
 * Tests the enhanced inventory management system including:
 * - Stock validation and reservation
 * - Atomic database transactions
 * - Order processing with stock changes
 * - Stock history tracking
 * - Admin stock adjustments
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { db } from '@/lib/db';
import {
  validateStockAvailability,
  reduceStockWithHistory,
  increaseStockWithHistory,
  processOrderStockChanges,
  getCurrentStock,
  getStockStatus,
} from '@/lib/services/inventory';
import {
  processOrderPayment,
  processOrderRefund,
  validateCartStock,
  handleOrderStatusChange,
} from '@/lib/services/orderProcessing';

// Test data setup
const testProduct = {
  name: 'Test Product',
  description: 'A test product for inventory testing',
  price: 100,
  stock: 50,
  images: ['test-image.jpg'],
};

const testVariant = {
  name: 'Test Variant',
  price: 120,
  stock: 30,
};

const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  role: 'ADMIN',
};

describe('Inventory Management System', () => {
  let productId: string;
  let variantId: string;
  let userId: string;

  beforeEach(async () => {
    // Clean up any existing test data
    await db.stockHistory.deleteMany({
      where: { reason: { contains: 'TEST' } },
    });
    await db.variant.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await db.product.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await db.user.deleteMany({
      where: { email: { contains: 'test@' } },
    });

    // Create test user
    const user = await db.user.create({
      data: testUser,
    });
    userId = user.id;

    // Create test product
    const product = await db.product.create({
      data: testProduct,
    });
    productId = product.id;

    // Create test variant
    const variant = await db.variant.create({
      data: {
        ...testVariant,
        productId,
      },
    });
    variantId = variant.id;
  });

  afterEach(async () => {
    // Clean up test data
    await db.stockHistory.deleteMany({
      where: { reason: { contains: 'TEST' } },
    });
    await db.variant.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await db.product.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await db.user.deleteMany({
      where: { email: { contains: 'test@' } },
    });
  });

  describe('Stock Validation', () => {
    it('should validate stock availability correctly', async () => {
      const items = [
        { productId, quantity: 10 },
        { productId, variantId, quantity: 5 },
      ];

      const results = await validateStockAvailability(items);

      expect(results).toHaveLength(2);
      expect(results[0].isValid).toBe(true);
      expect(results[0].availableStock).toBe(50);
      expect(results[1].isValid).toBe(true);
      expect(results[1].availableStock).toBe(30);
    });

    it('should detect insufficient stock', async () => {
      const items = [
        { productId, quantity: 100 }, // More than available
        { productId, variantId, quantity: 50 }, // More than available
      ];

      const results = await validateStockAvailability(items);

      expect(results[0].isValid).toBe(false);
      expect(results[1].isValid).toBe(false);
    });
  });

  describe('Stock Reduction with History', () => {
    it('should reduce stock and create history record', async () => {
      const result = await reduceStockWithHistory(
        productId,
        10,
        undefined,
        {
          reason: 'TEST: Stock reduction',
          type: 'PURCHASE',
          userId,
        }
      );

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(40);

      // Check stock history
      const history = await db.stockHistory.findFirst({
        where: { productId, reason: { contains: 'TEST' } },
      });

      expect(history).toBeTruthy();
      expect(history?.quantity).toBe(-10);
      expect(history?.previousStock).toBe(50);
      expect(history?.newStock).toBe(40);
      expect(history?.type).toBe('PURCHASE');
    });

    it('should prevent reducing stock below zero', async () => {
      const result = await reduceStockWithHistory(
        productId,
        100, // More than available
        undefined,
        {
          reason: 'TEST: Invalid reduction',
          type: 'PURCHASE',
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient stock');
    });
  });

  describe('Stock Increase with History', () => {
    it('should increase stock and create history record', async () => {
      const result = await increaseStockWithHistory(
        productId,
        20,
        undefined,
        {
          reason: 'TEST: Stock increase',
          type: 'RESTOCK',
          userId,
        }
      );

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(70);

      // Check stock history
      const history = await db.stockHistory.findFirst({
        where: { productId, reason: { contains: 'TEST' } },
      });

      expect(history).toBeTruthy();
      expect(history?.quantity).toBe(20);
      expect(history?.previousStock).toBe(50);
      expect(history?.newStock).toBe(70);
      expect(history?.type).toBe('RESTOCK');
    });
  });

  describe('Order Stock Processing', () => {
    it('should process order stock changes atomically', async () => {
      const items = [
        { productId, quantity: 5 },
        { productId, variantId, quantity: 3 },
      ];

      const result = await processOrderStockChanges(
        'test-order-id',
        items,
        'PURCHASE',
        'TEST: Order processing'
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);

      // Verify stock levels
      const productStock = await getCurrentStock(productId);
      const variantStock = await getCurrentStock(productId, variantId);

      expect(productStock).toBe(45);
      expect(variantStock).toBe(27);
    });
  });

  describe('Stock Status Helper', () => {
    it('should return correct stock status', () => {
      expect(getStockStatus(0)).toMatchObject({
        status: 'out_of_stock',
        canPurchase: false,
      });

      expect(getStockStatus(3)).toMatchObject({
        status: 'low_stock',
        canPurchase: true,
      });

      expect(getStockStatus(8)).toMatchObject({
        status: 'limited_stock',
        canPurchase: true,
      });

      expect(getStockStatus(20)).toMatchObject({
        status: 'in_stock',
        canPurchase: true,
      });
    });
  });

  describe('Cart Stock Validation', () => {
    it('should validate cart items against current stock', async () => {
      const items = [
        { productId, quantity: 10 },
        { productId, variantId, quantity: 5 },
      ];

      const result = await validateCartStock(items);

      expect(result.isValid).toBe(true);
      expect(result.invalidItems).toHaveLength(0);
    });

    it('should detect invalid cart items', async () => {
      const items = [
        { productId, quantity: 100 }, // Too much
      ];

      const result = await validateCartStock(items);

      expect(result.isValid).toBe(false);
      expect(result.invalidItems).toHaveLength(1);
      expect(result.invalidItems[0].requestedQuantity).toBe(100);
      expect(result.invalidItems[0].availableStock).toBe(50);
    });
  });

  describe('Order Processing Integration', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create a test order
      const order = await db.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount: 500,
          items: {
            create: [
              {
                productId,
                quantity: 5,
                price: 100,
              },
            ],
          },
        },
      });
      orderId = order.id;
    });

    it('should process order payment and reduce stock', async () => {
      const result = await processOrderPayment(orderId);

      expect(result.success).toBe(true);

      // Check order status
      const order = await db.order.findUnique({
        where: { id: orderId },
      });
      expect(order?.status).toBe('PAID');

      // Check stock reduction
      const productStock = await getCurrentStock(productId);
      expect(productStock).toBe(45);

      // Check stock history
      const history = await db.stockHistory.findFirst({
        where: { orderId },
      });
      expect(history).toBeTruthy();
      expect(history?.type).toBe('PURCHASE');
    });

    it('should process order refund and restore stock', async () => {
      // First process payment
      await processOrderPayment(orderId);

      // Then process refund
      const result = await processOrderRefund(orderId);

      expect(result.success).toBe(true);

      // Check order status
      const order = await db.order.findUnique({
        where: { id: orderId },
      });
      expect(order?.status).toBe('REFUNDED');

      // Check stock restoration
      const productStock = await getCurrentStock(productId);
      expect(productStock).toBe(50); // Back to original

      // Check stock history for refund
      const refundHistory = await db.stockHistory.findFirst({
        where: { orderId, type: 'REFUND' },
      });
      expect(refundHistory).toBeTruthy();
    });
  });
});
