// utils/stockValidation.ts

export interface StockError {
  error: string;
  message: string;
  code: string;
  item?: {
    productId: string;
    variantId?: string;
    requestedQuantity: number;
    availableStock: number;
    itemName: string;
  };
}

export interface StockValidationResult {
  isValid: boolean;
  errors: StockError[];
  hasStockIssues: boolean;
}

/**
 * Check if an error response is a stock validation error
 */
export function isStockError(error: any): error is StockError {
  return error && 
         error.code === 'INSUFFICIENT_STOCK' && 
         error.item && 
         typeof error.item.availableStock === 'number';
}

/**
 * Format stock error message for user display
 */
export function formatStockErrorMessage(error: StockError): string {
  if (!error.item) {
    return error.message || 'Stock validation failed';
  }

  const { itemName, requestedQuantity, availableStock } = error.item;
  
  if (availableStock === 0) {
    return `"${itemName}" is currently out of stock.`;
  }
  
  return `Only ${availableStock} unit${availableStock === 1 ? '' : 's'} of "${itemName}" available. You requested ${requestedQuantity}.`;
}

/**
 * Get stock status display information
 */
export function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      status: 'out-of-stock',
      text: 'Out of Stock',
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      available: false
    };
  } else if (stock <= 5) {
    return {
      status: 'low-stock',
      text: `Only ${stock} left`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      available: true
    };
  } else if (stock <= 10) {
    return {
      status: 'limited-stock',
      text: `${stock} in stock`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      available: true
    };
  } else {
    return {
      status: 'in-stock',
      text: `In Stock (${stock})`,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      available: true
    };
  }
}

/**
 * Validate cart items against available stock
 */
export async function validateCartStock(cartItems: any[]): Promise<StockValidationResult> {
  const errors: StockError[] = [];
  
  for (const item of cartItems) {
    try {
      // Get current stock for the item
      const response = await fetch(`/api/products/${item.product.id}/stock${item.product.variantId ? `?variantId=${item.product.variantId}` : ''}`);
      
      if (response.ok) {
        const { stock } = await response.json();
        
        if (stock < item.quantity) {
          errors.push({
            error: 'Insufficient stock',
            message: `Not enough stock for ${item.product.name}`,
            code: 'INSUFFICIENT_STOCK',
            item: {
              productId: item.product.id,
              variantId: item.product.variantId,
              requestedQuantity: item.quantity,
              availableStock: stock,
              itemName: item.product.name + (item.product.variant?.name ? ` (${item.product.variant.name})` : '')
            }
          });
        }
      }
    } catch (error) {
      console.error('Error validating stock for item:', item.product.id, error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    hasStockIssues: errors.length > 0
  };
}

/**
 * Create a stock validation API endpoint path
 */
export function getStockValidationEndpoint(productId: string, variantId?: string): string {
  const baseUrl = `/api/products/${productId}/stock`;
  return variantId ? `${baseUrl}?variantId=${variantId}` : baseUrl;
}
