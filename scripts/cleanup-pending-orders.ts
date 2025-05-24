import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupPendingOrders() {
  try {
    console.log('🧹 Starting cleanup of PENDING orders...');

    // First, let's see what we have
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: {
        items: true,
        shippingDetails: true
      }
    });

    console.log(`Found ${pendingOrders.length} PENDING orders`);

    if (pendingOrders.length === 0) {
      console.log('✅ No PENDING orders to clean up');
      return;
    }

    // Show details of pending orders
    for (const order of pendingOrders) {
      console.log(`📋 Order ${order.id}:`);
      console.log(`   - Created: ${order.createdAt}`);
      console.log(`   - Items: ${order.items.length}`);
      console.log(`   - Total: ${order.totalAmount}`);
      console.log(`   - Payment Token: ${order.paymentToken || 'None'}`);
    }

    // Option 1: Delete all PENDING orders (recommended for cleanup)
    console.log('\n🗑️  Deleting all PENDING orders...');
    
    // Delete related records first (due to foreign key constraints)
    for (const order of pendingOrders) {
      // Delete shipping details
      if (order.shippingDetails) {
        await prisma.shippingDetails.delete({
          where: { orderId: order.id }
        });
      }

      // Delete order items
      await prisma.orderItem.deleteMany({
        where: { orderId: order.id }
      });

      // Delete payment details if any
      await prisma.paymentDetails.deleteMany({
        where: { orderId: order.id }
      });

      // Finally delete the order
      await prisma.order.delete({
        where: { id: order.id }
      });

      console.log(`   ✅ Deleted order ${order.id}`);
    }

    console.log(`\n🎉 Successfully cleaned up ${pendingOrders.length} PENDING orders`);
    console.log('✅ Database is now ready for the new order flow');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative function to convert PENDING to CANCELLED instead of deleting
async function convertPendingToCancelled() {
  try {
    console.log('🔄 Converting PENDING orders to CANCELLED...');

    const result = await prisma.order.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'CANCELLED' }
    });

    console.log(`✅ Converted ${result.count} PENDING orders to CANCELLED`);

  } catch (error) {
    console.error('❌ Error during conversion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupPendingOrders();

// If you prefer to keep the orders but mark them as cancelled, uncomment this instead:
// convertPendingToCancelled();
