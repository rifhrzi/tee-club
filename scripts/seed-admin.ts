import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs'; // Ganti bcrypt dengan bcryptjs
import { v4 as uuidv4 } from 'uuid';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

// Konfigurasi admin
const adminConfig = {
  email: 'admin@teelite.com',
  name: 'Admin Teelite',
  password: 'admin123', // Ganti dengan password yang lebih kuat
  role: 'ADMIN' // Role admin
};

async function main() {
  console.log('Starting admin user seeder...');

  try {
    // Cek apakah admin sudah ada
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminConfig.email }
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
        role: adminConfig.role,
      }
    });

    console.log(`Admin user created successfully: ${admin.email}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan seeder
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
