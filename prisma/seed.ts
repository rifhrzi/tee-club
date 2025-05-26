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

  console.log("ℹ️  Seed file configured for production - no sample data will be created");

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
