import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany(); // Clean existing users

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Classic White Tee",
        description:
          "Kaos putih klasik dengan bahan premium 100% katun yang nyaman dipakai sehari-hari.",
        price: 299000,
        stock: 50,
        images: [
          "https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        variants: {
          create: [
            {
              name: "S - White",
              price: 299000,
              stock: 15,
            },
            {
              name: "M - White",
              price: 299000,
              stock: 15,
            },
            {
              name: "L - White",
              price: 299000,
              stock: 10,
            },
            {
              name: "XL - White",
              price: 299000,
              stock: 10,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Urban Black Tee",
        description:
          "Kaos hitam urban dengan desain minimalis yang cocok untuk gaya kasual maupun semi-formal.",
        price: 349000,
        stock: 35,
        images: [
          "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        variants: {
          create: [
            {
              name: "M - Black",
              price: 349000,
              stock: 10,
            },
            {
              name: "L - Black",
              price: 349000,
              stock: 10,
            },
            {
              name: "XL - Black",
              price: 349000,
              stock: 10,
            },
            {
              name: "XXL - Black",
              price: 349000,
              stock: 5,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Vintage Print Tee",
        description: "Kaos dengan print vintage yang unik, memberikan tampilan retro yang stylish.",
        price: 399000,
        stock: 25,
        images: [
          "https://images.pexels.com/photos/1018911/pexels-photo-1018911.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        variants: {
          create: [
            {
              name: "S - Vintage",
              price: 399000,
              stock: 8,
            },
            {
              name: "M - Vintage",
              price: 399000,
              stock: 9,
            },
            {
              name: "L - Vintage",
              price: 399000,
              stock: 8,
            },
          ],
        },
      },
    }),
  ]);

  console.log("Seeded database with products:", products);

  // Add admin user creation with hashed password
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme_in_production";

  // In production, require proper environment variables
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD)
  ) {
    console.warn("Warning: Using default admin credentials in production is not recommended.");
    console.warn("Please set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables.");
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Admin user created:", adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
