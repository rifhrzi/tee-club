const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
        variants: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 5
    });
    
    console.log('Products in database:');
    products.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id})`);
      console.log(`  Images: ${JSON.stringify(product.images)}`);
      console.log(`  Variants: ${product.variants.length}`);
      console.log('');
    });
    
    if (products.length === 0) {
      console.log('No products found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
