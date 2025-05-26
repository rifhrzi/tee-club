# Next.js Image Configuration Guide

## Overview

This document explains the Next.js image configuration implemented to resolve external image hosting issues in the product management feature.

## Problem Solved

The original error was:
```
Error: Invalid src prop (https://contents.mediadecathlon.com/p2606947/k$1c9e0ffdefc3e67bdeabc82be7893e93/kaos-lari-pria-dry-merah-decathlon-8771124.jpg?f=768x0&format=auto) on `next/image`, hostname "contents.mediadecathlon.com" is not configured under images in your `next.config.js`
```

## Solution Implementation

### 1. Updated `next.config.js`

Added comprehensive `remotePatterns` configuration to allow external images from multiple domains:

```javascript
images: {
  remotePatterns: [
    // E-commerce and product image domains
    { protocol: "https", hostname: "contents.mediadecathlon.com", pathname: "/**" },
    { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    { protocol: "https", hostname: "images-na.ssl-images-amazon.com", pathname: "/**" },
    { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
    
    // Popular image hosting services
    { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
    { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
    
    // CDN services
    { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    { protocol: "https", hostname: "images.ctfassets.net", pathname: "/**" },
    { protocol: "https", hostname: "cdn.pixabay.com", pathname: "/**" },
    
    // Google services
    { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    
    // Development
    { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" }
  ],
  
  // Image optimization settings
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 2. Updated Content Security Policy (CSP)

Modified the CSP headers to include all configured image domains:

```javascript
"img-src 'self' data: https://images.pexels.com https://images.unsplash.com https://contents.mediadecathlon.com https://cdn.shopify.com https://images-na.ssl-images-amazon.com https://m.media-amazon.com https://i.imgur.com https://imgur.com https://picsum.photos https://via.placeholder.com https://res.cloudinary.com https://images.ctfassets.net https://cdn.pixabay.com https://lh3.googleusercontent.com https://raw.githubusercontent.com"
```

### 3. Created ProductImage Component

Developed a robust image component with fallback handling:

```typescript
// components/admin/ProductImage.tsx
- Validates URL format before rendering
- Handles image load errors gracefully
- Falls back to placeholder SVG for invalid/failed images
- Uses Next.js Image optimization
- Includes loading placeholder with blur effect
```

### 4. Created Placeholder Image

Added `/public/placeholder-image.svg` as a fallback for failed image loads.

## Configured Domains

The following domains are now supported for external images:

### E-commerce Platforms
- `contents.mediadecathlon.com` - Decathlon product images
- `cdn.shopify.com` - Shopify store images
- `images-na.ssl-images-amazon.com` - Amazon product images
- `m.media-amazon.com` - Amazon media images

### Image Hosting Services
- `images.pexels.com` - Pexels stock photos
- `images.unsplash.com` - Unsplash stock photos
- `i.imgur.com` - Imgur image hosting
- `imgur.com` - Imgur image hosting
- `picsum.photos` - Lorem Picsum placeholder images
- `via.placeholder.com` - Placeholder.com images

### CDN Services
- `res.cloudinary.com` - Cloudinary CDN
- `images.ctfassets.net` - Contentful CDN
- `cdn.pixabay.com` - Pixabay images

### Other Services
- `lh3.googleusercontent.com` - Google user content
- `raw.githubusercontent.com` - GitHub raw files
- `localhost:3000` - Local development images

## Benefits

1. **Security**: Only whitelisted domains are allowed
2. **Performance**: Next.js image optimization (WebP, AVIF formats)
3. **Responsive**: Automatic responsive image generation
4. **Fallback**: Graceful handling of failed image loads
5. **Accessibility**: Proper alt text and loading states

## Usage in Components

```typescript
import ProductImage from '@/components/admin/ProductImage';

<ProductImage
  src="https://contents.mediadecathlon.com/path/to/image.jpg"
  alt="Product name"
  width={48}
  height={48}
  className="rounded-lg"
/>
```

## Testing

Run the test script to verify configuration:

```bash
node scripts/test-image-config.js
```

## Adding New Domains

To add support for new image domains:

1. Add the domain to `remotePatterns` in `next.config.js`
2. Add the domain to the CSP `img-src` directive
3. Restart the development server
4. Test with the new domain

## Security Considerations

- Only add trusted domains to prevent security vulnerabilities
- Use HTTPS protocols for external domains
- Regularly review and audit configured domains
- Consider implementing rate limiting for image requests

## Troubleshooting

### Common Issues

1. **404 errors for placeholder**: Ensure `/public/placeholder-image.svg` exists
2. **CSP violations**: Check that domains are added to both `remotePatterns` and CSP headers
3. **Image not loading**: Verify the domain is in the whitelist and the URL is valid
4. **Server restart required**: Next.js config changes require server restart

### Debug Steps

1. Check browser console for CSP violations
2. Verify the image URL is accessible directly
3. Confirm the domain is in the `remotePatterns` configuration
4. Test with the provided test script
