// lib/checkout-session.ts
// Temporary storage for checkout sessions
// In production, use Redis or database storage

interface CheckoutSession {
  orderId: string;
  userId: string;
  items: Array<{ productId: string; quantity: number; variantId?: string }>;
  shippingDetails: any;
  paymentMethod: string;
  paymentToken: string;
  totalAmount: number;
  createdAt: string;
  expiresAt: string;
}

// In-memory storage (for development only)
const checkoutSessions = new Map<string, CheckoutSession>();

// Session expires after 1 hour
const SESSION_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Store checkout session data
 */
export function storeCheckoutSession(sessionData: Omit<CheckoutSession, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS).toISOString();
  
  const session: CheckoutSession = {
    ...sessionData,
    expiresAt
  };

  checkoutSessions.set(sessionData.orderId, session);
  
  console.log(`Stored checkout session for order ${sessionData.orderId}`);
  
  // Clean up expired sessions
  cleanupExpiredSessions();
  
  return session;
}

/**
 * Retrieve checkout session data
 */
export function getCheckoutSession(orderId: string): CheckoutSession | null {
  const session = checkoutSessions.get(orderId);
  
  if (!session) {
    console.log(`No checkout session found for order ${orderId}`);
    return null;
  }

  // Check if session has expired
  if (new Date(session.expiresAt) < new Date()) {
    console.log(`Checkout session expired for order ${orderId}`);
    checkoutSessions.delete(orderId);
    return null;
  }

  console.log(`Retrieved checkout session for order ${orderId}`);
  return session;
}

/**
 * Remove checkout session after successful order creation
 */
export function removeCheckoutSession(orderId: string): boolean {
  const deleted = checkoutSessions.delete(orderId);
  if (deleted) {
    console.log(`Removed checkout session for order ${orderId}`);
  }
  return deleted;
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const now = new Date();
  let cleanedCount = 0;

  for (const [orderId, session] of checkoutSessions.entries()) {
    if (new Date(session.expiresAt) < now) {
      checkoutSessions.delete(orderId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired checkout sessions`);
  }
}

/**
 * Get all active sessions (for debugging)
 */
export function getActiveSessionsCount(): number {
  cleanupExpiredSessions();
  return checkoutSessions.size;
}

/**
 * List all active sessions (for debugging)
 */
export function listActiveSessions(): Array<{ orderId: string; userId: string; createdAt: string; expiresAt: string }> {
  cleanupExpiredSessions();
  
  return Array.from(checkoutSessions.values()).map(session => ({
    orderId: session.orderId,
    userId: session.userId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt
  }));
}
