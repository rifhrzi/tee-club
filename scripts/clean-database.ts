import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log("🧹 Starting database cleanup...\n");

    // 1. Remove test/dummy data
    console.log("🗑️  Removing test/dummy data...");

    // Remove test orders and order items
    const testOrders = await prisma.order.findMany({
      where: {
        OR: [
          { user: { email: "admin@example.com" } },
          { items: { some: { product: { name: "kurt" } } } },
        ],
      },
      include: { items: true },
    });

    for (const order of testOrders) {
      console.log(`  - Removing test order: ${order.id}`);
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      await prisma.shippingDetails.deleteMany({ where: { orderId: order.id } });
      await prisma.paymentDetails.deleteMany({ where: { orderId: order.id } });
      await prisma.order.delete({ where: { id: order.id } });
    }

    // Remove test products and their variants
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: "kurt" },
          { price: { gte: 100000 } }, // Remove products with unrealistic prices
        ],
      },
    });

    for (const product of testProducts) {
      console.log(`  - Removing test product: ${product.name}`);
      await prisma.variant.deleteMany({ where: { productId: product.id } });
      await prisma.stockHistory.deleteMany({ where: { productId: product.id } });
      await prisma.product.delete({ where: { id: product.id } });
    }

    // 2. Clean up orphaned data
    console.log("\n🔧 Cleaning up orphaned data...");

    // Remove orphaned variants (variants without valid product references)
    const allVariants = await prisma.variant.findMany({
      include: { product: true },
    });
    const orphanedVariantIds = allVariants
      .filter((variant) => !variant.product)
      .map((variant) => variant.id);

    if (orphanedVariantIds.length > 0) {
      const orphanedVariants = await prisma.variant.deleteMany({
        where: { id: { in: orphanedVariantIds } },
      });
      console.log(`  - Removed ${orphanedVariants.count} orphaned variants`);
    } else {
      console.log(`  - No orphaned variants found`);
    }

    // Remove orphaned stock history (stock history without valid product references)
    const allStockHistory = await prisma.stockHistory.findMany({
      include: { product: true },
    });
    const orphanedStockHistoryIds = allStockHistory
      .filter((history) => !history.product)
      .map((history) => history.id);

    if (orphanedStockHistoryIds.length > 0) {
      const orphanedStockHistory = await prisma.stockHistory.deleteMany({
        where: { id: { in: orphanedStockHistoryIds } },
      });
      console.log(`  - Removed ${orphanedStockHistory.count} orphaned stock history records`);
    } else {
      console.log(`  - No orphaned stock history records found`);
    }

    // Note: RefreshToken model has been removed as part of NextAuth.js migration
    // No longer need to clean up refresh tokens

    // 3. Update admin user with production-ready data
    console.log("\n👤 Updating admin user...");
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@teelite.com" },
      update: {
        name: "System Administrator",
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        email: "admin@teelite.com",
        name: "System Administrator",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Remove old admin user if it exists
    await prisma.user.deleteMany({
      where: {
        email: "admin@example.com",
        id: { not: adminUser.id },
      },
    });

    console.log(`  - Admin user updated: ${adminUser.email}`);

    // 4. Verify final state
    console.log("\n📊 Final database state:");
    const finalStats = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.variant.count(),
      prisma.stockHistory.count(),
    ]);

    console.log(`  - Users: ${finalStats[0]}`);
    console.log(`  - Products: ${finalStats[1]}`);
    console.log(`  - Orders: ${finalStats[2]}`);
    console.log(`  - Variants: ${finalStats[3]}`);
    console.log(`  - Stock History: ${finalStats[4]}`);

    console.log("\n✅ Database cleanup completed successfully!");
    console.log("\n🔐 Admin credentials:");
    console.log("   Email: admin@teelite.com");
    console.log("   Password: Admin123!");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
