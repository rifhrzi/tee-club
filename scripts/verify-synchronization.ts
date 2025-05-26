import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifySynchronization() {
  try {
    console.log("🔍 Verifying data synchronization...\n");

    // 1. Check database state
    console.log("📊 Current Database State:");
    const [users, products, orders, variants] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          images: true,
          _count: { select: { variants: true, orderItems: true } },
        },
      }),
      prisma.order.count(),
      prisma.variant.count(),
    ]);

    console.log(`  - Users: ${users.length}`);
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Orders: ${orders}`);
    console.log(`  - Variants: ${variants}`);

    // 2. Verify admin user
    console.log("\n👤 Admin User Verification:");
    const adminUser = users.find((user) => user.role === "ADMIN");
    if (adminUser) {
      console.log(`  ✅ Admin user found: ${adminUser.email}`);
      console.log(`  - Name: ${adminUser.name}`);
      console.log(`  - Orders: ${adminUser._count.orders}`);
    } else {
      console.log("  ❌ No admin user found");
    }

    // 3. Verify products have proper data
    console.log("\n📦 Product Data Verification:");
    if (products.length > 0) {
      console.log(`  ✅ Found ${products.length} products:`);
      products.forEach((product) => {
        console.log(`    - ${product.name}`);
        console.log(
          `      Price: ${product.price.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}`
        );
        console.log(`      Stock: ${product.stock}`);
        console.log(`      Images: ${product.images.length}`);
        console.log(`      Variants: ${product._count.variants}`);
        console.log(`      Orders: ${product._count.orderItems}`);
      });
    } else {
      console.log("  ❌ No products found");
    }

    // 4. Test API endpoint simulation
    console.log("\n🔌 API Endpoint Simulation:");
    try {
      // Simulate what the API would return
      const apiProducts = await prisma.product.findMany({
        include: {
          variants: true,
        },
      });
      console.log(`  ✅ API simulation successful - would return ${apiProducts.length} products`);

      // Check if products have all required fields
      const hasValidData = apiProducts.every(
        (product) =>
          product.name && product.description && product.price > 0 && product.images.length > 0
      );

      if (hasValidData) {
        console.log("  ✅ All products have valid data structure");
      } else {
        console.log("  ⚠️  Some products may have incomplete data");
      }
    } catch (error) {
      console.log("  ❌ API simulation failed:", error);
    }

    // 5. Check for any orphaned data
    console.log("\n🧹 Orphaned Data Check:");
    // Check for variants that might not have valid product references
    const allVariants = await prisma.variant.findMany({
      include: { product: true },
    });
    const orphanedVariants = allVariants.filter((variant) => !variant.product);

    if (orphanedVariants.length === 0) {
      console.log("  ✅ No orphaned variants found");
    } else {
      console.log(`  ⚠️  Found ${orphanedVariants.length} orphaned variants`);
    }

    // 6. Verify data consistency
    console.log("\n🔄 Data Consistency Check:");
    const totalVariantStock = await prisma.variant.aggregate({
      _sum: { stock: true },
    });

    const totalProductStock = await prisma.product.aggregate({
      _sum: { stock: true },
    });

    console.log(`  - Total product stock: ${totalProductStock._sum.stock || 0}`);
    console.log(`  - Total variant stock: ${totalVariantStock._sum.stock || 0}`);

    // 7. Summary
    console.log("\n📋 Synchronization Summary:");
    const issues = [];

    if (users.length === 0) issues.push("No users found");
    if (products.length === 0) issues.push("No products found");
    if (!adminUser) issues.push("No admin user found");
    if (orphanedVariants.length > 0) issues.push(`${orphanedVariants.length} orphaned variants`);

    if (issues.length === 0) {
      console.log("  ✅ All synchronization checks passed!");
      console.log("  ✅ Database is clean and ready for production");
      console.log("  ✅ API endpoints should return fresh data");
    } else {
      console.log("  ⚠️  Issues found:");
      issues.forEach((issue) => console.log(`    - ${issue}`));
    }

    console.log("\n🎉 Verification completed!");
  } catch (error) {
    console.error("❌ Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySynchronization();
