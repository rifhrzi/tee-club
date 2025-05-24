// Cart cleanup utility to remove stale/invalid product IDs
import { CartItem } from '@/store/types';

// Helper function to validate product ID format
export function isValidProductId(id: string): boolean {
  // UUID format: 8-4-4-4-12 characters (with hyphens)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // CUID format: starts with 'c' followed by 24 characters (these are invalid/old)
  const cuidRegex = /^c[a-z0-9]{24}$/i;
  
  return uuidRegex.test(id) && !cuidRegex.test(id); // Only allow UUID, reject CUID
}

// Clean cart items by removing invalid product IDs
export function cleanCartItems(cartItems: CartItem[]): CartItem[] {
  const validItems = cartItems.filter(item => {
    const isValid = isValidProductId(item.product.id.toString());
    if (!isValid) {
      console.warn(`Removing invalid product from cart: ${item.product.id} (${item.product.name})`);
    }
    return isValid;
  });

  if (validItems.length !== cartItems.length) {
    console.log(`Cart cleanup: Removed ${cartItems.length - validItems.length} invalid items`);
  }

  return validItems;
}

// Validate cart items against current database products
export async function validateCartAgainstDatabase(cartItems: CartItem[]): Promise<CartItem[]> {
  if (cartItems.length === 0) return cartItems;

  try {
    // First, clean items with invalid ID formats
    const cleanedItems = cleanCartItems(cartItems);
    
    if (cleanedItems.length === 0) return cleanedItems;

    // Get current products from API
    const response = await fetch('/api/products');
    if (!response.ok) {
      console.error('Failed to fetch products for cart validation');
      return cleanedItems; // Return cleaned items if API fails
    }

    const currentProducts = await response.json();
    const currentProductIds = currentProducts.map((p: any) => p.id);

    // Filter out items whose products no longer exist
    const validItems = cleanedItems.filter(item => {
      const exists = currentProductIds.includes(item.product.id);
      if (!exists) {
        console.warn(`Removing non-existent product from cart: ${item.product.id} (${item.product.name})`);
      }
      return exists;
    });

    if (validItems.length !== cleanedItems.length) {
      console.log(`Cart validation: Removed ${cleanedItems.length - validItems.length} non-existent products`);
    }

    return validItems;
  } catch (error) {
    console.error('Error validating cart against database:', error);
    // Return cleaned items if validation fails
    return cleanCartItems(cartItems);
  }
}

// Clear localStorage cart data completely
export function clearCartStorage(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('cart-storage');
      console.log('Cart storage cleared');
    }
  } catch (error) {
    console.error('Error clearing cart storage:', error);
  }
}

// Get cart data from localStorage for debugging
export function getCartStorageData(): any {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem('cart-storage');
      return data ? JSON.parse(data) : null;
    }
  } catch (error) {
    console.error('Error reading cart storage:', error);
  }
  return null;
}

// Debug function to analyze cart storage
export function debugCartStorage(): void {
  console.log('=== Cart Storage Debug ===');
  
  const data = getCartStorageData();
  if (!data) {
    console.log('No cart storage data found');
    return;
  }

  console.log('Raw storage data:', data);
  
  if (data.state && data.state.cart) {
    const cartItems = data.state.cart;
    console.log(`Found ${cartItems.length} items in cart storage`);
    
    cartItems.forEach((item: CartItem, index: number) => {
      const productId = item.product.id;
      const isValid = isValidProductId(productId.toString());
      console.log(`Item ${index + 1}: ${item.product.name} (ID: ${productId}) - ${isValid ? 'VALID' : 'INVALID'}`);
    });

    const invalidItems = cartItems.filter((item: CartItem) => !isValidProductId(item.product.id.toString()));
    if (invalidItems.length > 0) {
      console.warn(`Found ${invalidItems.length} invalid items that should be removed`);
    }
  }
  
  console.log('=========================');
}
