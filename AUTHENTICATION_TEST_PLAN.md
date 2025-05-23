# Authentication Test Plan

## Overview
This document outlines the steps to test the authentication fixes for the shop page cart functionality.

## Changes Made

### 1. Enhanced Debugging
- Added comprehensive console logging to track authentication state
- Added `AuthDebugger` component to visually inspect authentication status
- Added cookie debugging to understand NextAuth session state

### 2. Fixed Double Authentication Check
- Modified cart store to accept `skipAuthCheck` option
- Updated ProductClient to skip redundant authentication checks
- Improved cookie detection logic in cart store

### 3. Added Test Components
- `QuickAddToCart` component on shop page for direct testing
- Enhanced logging in all authentication-related functions

## Test Steps

### Step 1: Test Unauthenticated User Flow
1. Open browser in incognito/private mode
2. Navigate to http://localhost:3001/shop
3. Click "Debug Auth" button (bottom right)
4. Verify debug panel shows:
   - Status: "unauthenticated"
   - Authenticated: "No"
   - User: "None"
5. Try clicking "Add to Cart" on any product
6. Should redirect to login page
7. Try clicking "Buy Now" on any product
8. Should redirect to login page

### Step 2: Test Authentication Process
1. From login page, create account or login
2. After successful login, should redirect back to shop page
3. Click "Debug Auth" button again
4. Verify debug panel shows:
   - Status: "authenticated"
   - Authenticated: "Yes"
   - User: [your email]
   - NextAuth Cookies: [should show 1 or more]

### Step 3: Test Authenticated User Flow
1. While logged in, go to shop page
2. Click "Add to Cart" on any product
3. Check browser console for logs:
   - Should see "User is authenticated, adding to cart"
   - Should NOT see any redirect messages
   - Should see "Product added successfully"
4. Click "Buy Now" on any product
5. Should navigate to cart page without redirects

### Step 4: Test Individual Product Page
1. Click on any product to go to product detail page
2. Click "Debug Auth" button
3. Verify authentication status is correct
4. Try "Add to Cart" button
5. Try "Buy Now" button
6. Both should work without redirects

## Console Logs to Look For

### Successful Authentication:
```
ProductClient: Authentication state: {status: "authenticated", isAuthenticated: true, sessionExists: true, userEmail: "user@example.com"}
CartStore: Skipping authentication check as requested
ProductClient: User is authenticated, adding to cart
```

### Failed Authentication:
```
ProductClient: Authentication state: {status: "unauthenticated", isAuthenticated: false, sessionExists: false, userEmail: "none"}
ProductClient: User not authenticated, redirecting to signup
```

### Cart Store Debug (when skipAuthCheck is false):
```
CartStore: All cookies: [cookie string]
CartStore: NextAuth cookies found: ["next-auth.session-token"]
CartStore: NextAuth cookie check result: true
CartStore: User is authenticated, proceeding with adding to cart
```

## Troubleshooting

### If still getting redirected when authenticated:
1. Check browser console for authentication state logs
2. Verify NextAuth cookies are present in debug panel
3. Check if session status is "loading" (wait for it to resolve)
4. Clear browser cookies and re-login

### If authentication debug shows wrong status:
1. Check if NextAuth is properly configured
2. Verify database connection
3. Check if session cookies are being set correctly

### If cookies are missing:
1. Check NextAuth configuration in lib/auth.ts
2. Verify NEXTAUTH_SECRET is set in environment
3. Check if running on HTTPS in production

## Expected Behavior After Fixes

1. **Unauthenticated users**: Redirected to login when trying to add to cart
2. **Authenticated users**: Can add to cart and buy now without redirects
3. **Session loading**: Buttons show loading state during authentication check
4. **Debug info**: Clear visibility into authentication state
5. **Console logs**: Detailed logging for debugging authentication issues

## Files Modified

- `store/cartStore.tsx`: Enhanced authentication check with skipAuthCheck option
- `app/product/[id]/ProductClient.tsx`: Added debugging and skipAuthCheck usage
- `app/shop/ShopClient.tsx`: Added QuickAddToCart and AuthDebugger components
- `components/AuthDebugger.tsx`: New debugging component
- `components/QuickAddToCart.tsx`: New test component for shop page

## Next Steps

1. Test the authentication flow as outlined above
2. If issues persist, check the console logs and debug panel
3. Report any remaining authentication problems with console log details
4. Once confirmed working, the debug components can be removed or hidden in production
