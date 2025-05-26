import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; // Add this import
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Only create admin user if it doesn't exist
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@teelite.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@teelite.com",
        password: hashedPassword,
        name: "System Administrator",
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created:", adminUser.email);
  } else {
    console.log("ℹ️  Admin user already exists:", existingAdmin.email);
  }

  // Create sample products only if database is empty
  const productCount = await prisma.product.count();

  if (productCount === 0) {
    console.log("📦 Creating sample products...");

    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Classic White Tee",
          description:
            "Premium quality white t-shirt made from 100% organic cotton. Perfect for everyday wear with a comfortable, relaxed fit.",
          price: 299000,
          stock: 50,
          images: [
            "https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=800",
          ],
          variants: {
            create: [
              { name: "S - White", price: 299000, stock: 15 },
              { name: "M - White", price: 299000, stock: 15 },
              { name: "L - White", price: 299000, stock: 10 },
              { name: "XL - White", price: 299000, stock: 10 },
            ],
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "Urban Black Tee",
          description:
            "Sleek black t-shirt with modern minimalist design. Made from premium cotton blend for superior comfort and durability.",
          price: 349000,
          stock: 35,
          images: [
            "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800",
          ],
          variants: {
            create: [
              { name: "M - Black", price: 349000, stock: 10 },
              { name: "L - Black", price: 349000, stock: 10 },
              { name: "XL - Black", price: 349000, stock: 10 },
              { name: "XXL - Black", price: 349000, stock: 5 },
            ],
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "Vintage Print Tee",
          description:
            "Stylish vintage-inspired print tee with modern fit. Features unique graphic design and soft, breathable fabric.",
          price: 399000,
          stock: 25,
          images: [
            "https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg?auto=compress&cs=tinysrgb&w=800",
          ],
          variants: {
            create: [
              { name: "S - Vintage", price: 399000, stock: 8 },
              { name: "M - Vintage", price: 399000, stock: 9 },
              { name: "L - Vintage", price: 399000, stock: 8 },
            ],
          },
        },
      }),
    ]);

    console.log(`✅ Created ${products.length} sample products`);
  } else {
    console.log(`ℹ️  Database already contains ${productCount} products`);
  }

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
