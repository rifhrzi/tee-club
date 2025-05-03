// Script sederhana untuk melihat daftar pengguna
// Menggunakan variabel lingkungan dari file .env
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Gunakan kredensial yang kita temukan di file .env
// DATABASE_URL="postgresql://postgres:Faturahman123_@localhost:5432/teelite?schema=public"
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Faturahman123_@localhost:5432/teelite?schema=public"
    }
  }
});

async function main() {
  console.log('Fetching users from database...');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');

  try {
    // Ambil semua pengguna
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log(`Found ${users.length} users:`);
    console.table(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan script
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
