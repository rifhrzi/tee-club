import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking current database state...\n');

    // Check Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    });
    console.log(`👥 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user._count.orders} orders`);
    });

    // Check Products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        createdAt: true,
        _count: {
          select: {
            variants: true,
            orderItems: true
          }
        }
      }
    });
    console.log(`\n📦 Products (${products.length}):`);
    products.forEach(product => {
      console.log(`  - ${product.name} - $${product.price} - Stock: ${product.stock} - Variants: ${product._count.variants} - Orders: ${product._count.orderItems}`);
    });

    // Check Orders
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });
    console.log(`\n🛒 Orders (${orders.length}):`);
    orders.forEach(order => {
      console.log(`  - ${order.id} - ${order.status} - $${order.totalAmount} - ${order.user.email} - ${order._count.items} items`);
    });

    // Check Variants
    const variants = await prisma.variant.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        product: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`\n🎯 Variants (${variants.length}):`);
    variants.forEach(variant => {
      console.log(`  - ${variant.name} (${variant.product.name}) - $${variant.price} - Stock: ${variant.stock}`);
    });

    // Check Refresh Tokens
    const refreshTokens = await prisma.refreshToken.count();
    console.log(`\n🔑 Refresh Tokens: ${refreshTokens}`);

    // Check Stock History
    const stockHistory = await prisma.stockHistory.count();
    console.log(`📊 Stock History Records: ${stockHistory}`);

    console.log('\n✅ Database state check completed!');

  } catch (error) {
    console.error('❌ Error checking database state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
