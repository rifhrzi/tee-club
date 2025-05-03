// Script untuk melihat daftar pengguna
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching users from database...');

  try {
    // Ambil semua pengguna
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`Found ${users.length} users:`);
    
    // Tampilkan dalam format tabel
    console.table(users);
    
    // Tampilkan detail untuk setiap pengguna
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
    });
    
    // Hitung jumlah admin dan pengguna biasa
    const admins = users.filter(user => user.role === 'ADMIN');
    const regularUsers = users.filter(user => user.role !== 'ADMIN');
    
    console.log(`\nSummary:`);
    console.log(`Total users: ${users.length}`);
    console.log(`Admin users: ${admins.length}`);
    console.log(`Regular users: ${regularUsers.length}`);
    
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
