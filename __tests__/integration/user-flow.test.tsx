import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  renderWithProviders, 
  mockAuthenticatedSession, 
  mockUnauthenticatedSession,
  createMockProduct,
  screen,
  userEvent,
  waitFor
} from '../utils/test-utils'

// Mock components for integration testing
const MockShopPage = () => {
  const QuickAddToCart = require('@/components/QuickAddToCart').default
  const product = createMockProduct()
  
  return (
    <div>
      <h1>Shop</h1>
      <div data-testid="product-card">
        <h2>{product.name}</h2>
        <QuickAddToCart product={product} />
      </div>
    </div>
  )
}

const MockCartPage = () => {
  const DirectLoginLink = require('@/components/DirectLoginLink').default
  
  return (
    <div>
      <h1>Cart</h1>
      <DirectLoginLink href="/checkout">
        <button>Proceed to Checkout</button>
      </DirectLoginLink>
    </div>
  )
}

// Mock the cart store
const mockAddToCart = jest.fn()
const mockCart = []
jest.mock('@/store/cartStore', () => ({
  __esModule: true,
  default: () => ({
    addToCart: mockAddToCart,
    cart: mockCart,
  }),
}))

// Mock the authRedirect utility
const mockRedirectToSignup = jest.fn()
jest.mock('@/utils/authRedirect', () => ({
  redirectToSignup: mockRedirectToSignup,
}))

describe('User Flow Integration Tests', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    })
  })

  describe('Authenticated User Journey', () => {
    test('should complete full shopping flow: shop → add to cart → checkout', async () => {
      const user = userEvent.setup()

      // Step 1: User is on shop page and authenticated
      const { rerender } = renderWithProviders(<MockShopPage />, {
        sessionState: mockAuthenticatedSession
      })

      expect(screen.getByText('Shop')).toBeInTheDocument()
      expect(screen.getByText('Test Product')).toBeInTheDocument()

      // Step 2: User adds product to cart
      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
        }),
        expect.objectContaining({
          skipAuthCheck: true
        })
      )

      // Step 3: User uses "Buy Now" to go to cart
      const buyNowButton = screen.getByText('Buy Now')
      await user.click(buyNowButton)

      expect(mockPush).toHaveBeenCalledWith('/cart')

      // Step 4: User is now on cart page
      rerender(<MockCartPage />)
      expect(screen.getByText('Cart')).toBeInTheDocument()

      // Step 5: User proceeds to checkout
      const checkoutButton = screen.getByText('Proceed to Checkout')
      await user.click(checkoutButton)

      expect(mockPush).toHaveBeenCalledWith('/checkout')
    })

    test('should allow single-click operations throughout the flow', async () => {
      const user = userEvent.setup()

      renderWithProviders(<MockShopPage />, {
        sessionState: mockAuthenticatedSession
      })

      // Single click on Add to Cart should work
      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockAddToCart).toHaveBeenCalledTimes(1)

      // Single click on Buy Now should work
      const buyNowButton = screen.getByText('Buy Now')
      await user.click(buyNowButton)

      expect(mockPush).toHaveBeenCalledTimes(1)
    })
  })

  describe('Unauthenticated User Journey', () => {
    test('should redirect to login when trying to add to cart', async () => {
      const user = userEvent.setup()

      renderWithProviders(<MockShopPage />, {
        sessionState: mockUnauthenticatedSession
      })

      // User tries to add to cart
      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      // Should redirect to login instead of adding to cart
      expect(mockRedirectToSignup).toHaveBeenCalled()
      expect(mockAddToCart).not.toHaveBeenCalled()
    })

    test('should redirect to login when trying to checkout', async () => {
      const user = userEvent.setup()

      renderWithProviders(<MockCartPage />, {
        sessionState: mockUnauthenticatedSession
      })

      // User tries to checkout
      const checkoutButton = screen.getByText('Proceed to Checkout')
      await user.click(checkoutButton)

      // Should redirect to login with checkout redirect
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fcheckout')
    })

    test('should handle login → redirect flow', async () => {
      const user = userEvent.setup()

      // Start unauthenticated
      const { rerender } = renderWithProviders(<MockCartPage />, {
        sessionState: mockUnauthenticatedSession
      })

      // User tries to checkout
      const checkoutButton = screen.getByText('Proceed to Checkout')
      await user.click(checkoutButton)

      expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fcheckout')

      // Simulate user logging in (session becomes authenticated)
      rerender(<MockCartPage />)
      
      // Mock session change to authenticated
      ;(useSession as jest.Mock).mockReturnValue(mockAuthenticatedSession)

      // Now user should be able to proceed to checkout
      const newCheckoutButton = screen.getByText('Proceed to Checkout')
      await user.click(newCheckoutButton)

      expect(mockPush).toHaveBeenCalledWith('/checkout')
    })
  })

  describe('Loading State Handling', () => {
    test('should handle loading states gracefully', async () => {
      const user = userEvent.setup()

      renderWithProviders(<MockShopPage />, {
        sessionState: { data: null, status: 'loading' }
      })

      // Buttons should show loading state
      expect(screen.getByText('Checking...')).toBeInTheDocument()

      // Buttons should be disabled
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })

      // Clicks should not work during loading
      const addToCartButton = buttons.find(btn => btn.textContent?.includes('Checking'))
      if (addToCartButton) {
        await user.click(addToCartButton)
        expect(mockAddToCart).not.toHaveBeenCalled()
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle cart store errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock cart store to throw error
      mockAddToCart.mockImplementation(() => {
        throw new Error('Cart error')
      })

      renderWithProviders(<MockShopPage />, {
        sessionState: mockAuthenticatedSession
      })

      const addToCartButton = screen.getByText('Add to Cart')
      
      // Should not crash when cart operation fails
      await user.click(addToCartButton)
      
      expect(mockAddToCart).toHaveBeenCalled()
      // Component should still be rendered
      expect(screen.getByText('Shop')).toBeInTheDocument()
    })
  })

  describe('Session Synchronization', () => {
    test('should handle session state changes properly', async () => {
      const user = userEvent.setup()

      // Start with loading session
      const { rerender } = renderWithProviders(<MockShopPage />, {
        sessionState: { data: null, status: 'loading' }
      })

      // Should show loading state
      expect(screen.getByText('Checking...')).toBeInTheDocument()

      // Session becomes authenticated
      rerender(<MockShopPage />)
      ;(useSession as jest.Mock).mockReturnValue(mockAuthenticatedSession)

      // Should now show normal buttons
      await waitFor(() => {
        expect(screen.getByText('Add to Cart')).toBeInTheDocument()
      })

      // Should work normally
      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockAddToCart).toHaveBeenCalled()
    })
  })
})
