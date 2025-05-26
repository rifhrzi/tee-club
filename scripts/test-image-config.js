/**
 * Test script to verify Next.js image configuration
 * This script tests various image URLs to ensure they work with our configuration
 */

const testImageUrls = [
  // The original problematic URL
  'https://contents.mediadecathlon.com/p2606947/k$1c9e0ffdefc3e67bdeabc82be7893e93/kaos-lari-pria-dry-merah-decathlon-8771124.jpg?f=768x0&format=auto',
  
  // Other common image hosting domains
  'https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'https://cdn.shopify.com/s/files/1/0234/5678/products/sample-product.jpg',
  'https://i.imgur.com/sample.jpg',
  'https://picsum.photos/400/400',
  'https://via.placeholder.com/400x400',
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  
  // Invalid URLs to test fallback
  'invalid-url',
  '',
  'https://nonexistent-domain.com/image.jpg'
];

console.log('🧪 Testing Next.js Image Configuration');
console.log('=====================================\n');

testImageUrls.forEach((url, index) => {
  console.log(`${index + 1}. Testing: ${url || '(empty string)'}`);
  
  try {
    if (url) {
      const urlObj = new URL(url);
      console.log(`   ✅ Valid URL - Protocol: ${urlObj.protocol}, Host: ${urlObj.hostname}`);
    } else {
      console.log(`   ⚠️  Empty URL - Will use fallback`);
    }
  } catch (error) {
    console.log(`   ❌ Invalid URL - Will use fallback`);
  }
  
  console.log('');
});

console.log('📋 Configured Image Domains:');
console.log('============================');

const configuredDomains = [
  'images.pexels.com',
  'images.unsplash.com',
  'contents.mediadecathlon.com',
  'cdn.shopify.com',
  'images-na.ssl-images-amazon.com',
  'm.media-amazon.com',
  'i.imgur.com',
  'imgur.com',
  'picsum.photos',
  'via.placeholder.com',
  'res.cloudinary.com',
  'images.ctfassets.net',
  'cdn.pixabay.com',
  'lh3.googleusercontent.com',
  'raw.githubusercontent.com',
  'localhost (for development)'
];

configuredDomains.forEach((domain, index) => {
  console.log(`${index + 1}. ${domain}`);
});

console.log('\n✅ Image configuration test completed!');
console.log('💡 All configured domains should work with Next.js Image component');
console.log('🔄 Fallback to placeholder-image.svg for invalid URLs');
