import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Konfigurasi admin dari environment variables
const adminConfig = {
  email: process.env.ADMIN_EMAIL || "admin@teelite.com",
  name: process.env.ADMIN_NAME || "Admin Teelite",
  password: process.env.ADMIN_PASSWORD || "changeme_in_production",
  role: "ADMIN" as any, // Use string literal and cast as any to satisfy Prisma type
};

async function main() {
  console.log("Starting admin user seeder...");

  // In production, require proper environment variables
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
  ) {
    console.warn("Warning: Using default admin credentials in production is not recommended.");
    console.warn("Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  }

  try {
    // Cek apakah admin sudah ada
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminConfig.email },
    });

    if (existingAdmin) {
      console.log(`Admin user with email ${adminConfig.email} already exists.`);
      return;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(adminConfig.password, 10);

    // Buat user admin
    const admin = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminConfig.email,
        name: adminConfig.name,
        password: hashedPassword,
        role: adminConfig.role as any, // Cast as any to satisfy Prisma type
      },
    });

    console.log(`Admin user created successfully: ${admin.email}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan seeder
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
