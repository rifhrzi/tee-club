import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { useRouter } from 'next/navigation'
import QuickAddToCart from '@/components/QuickAddToCart'
import { 
  renderWithProviders, 
  mockAuthenticatedSession, 
  mockUnauthenticatedSession,
  mockLoadingSession,
  createMockProduct,
  screen,
  userEvent,
  waitFor
} from '../utils/test-utils'

// Mock the cart store
const mockAddToCart = jest.fn()
jest.mock('@/store/cartStore', () => ({
  __esModule: true,
  default: () => ({
    addToCart: mockAddToCart,
  }),
}))

// Mock the authRedirect utility
const mockRedirectToSignup = jest.fn()
jest.mock('@/utils/authRedirect', () => ({
  redirectToSignup: mockRedirectToSignup,
}))

describe('QuickAddToCart Component', () => {
  const mockPush = jest.fn()
  const mockProduct = createMockProduct()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    })
  })

  describe('Authenticated User', () => {
    test('should render add to cart and buy now buttons', () => {
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockAuthenticatedSession
      })

      expect(screen.getByText('Add to Cart')).toBeInTheDocument()
      expect(screen.getByText('Buy Now')).toBeInTheDocument()
    })

    test('should add product to cart when Add to Cart is clicked', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockAuthenticatedSession
      })

      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
        }),
        expect.objectContaining({
          skipAuthCheck: true
        })
      )
    })

    test('should add to cart and navigate when Buy Now is clicked', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockAuthenticatedSession
      })

      const buyNowButton = screen.getByText('Buy Now')
      await user.click(buyNowButton)

      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProduct.id,
        }),
        expect.objectContaining({
          currentPath: '/cart',
          skipAuthCheck: true
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/cart')
    })

    test('should not redirect when authenticated user clicks buttons', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockAuthenticatedSession
      })

      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockRedirectToSignup).not.toHaveBeenCalled()
    })
  })

  describe('Unauthenticated User', () => {
    test('should redirect to signup when Add to Cart is clicked', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockUnauthenticatedSession
      })

      const addToCartButton = screen.getByText('Add to Cart')
      await user.click(addToCartButton)

      expect(mockRedirectToSignup).toHaveBeenCalled()
      expect(mockAddToCart).not.toHaveBeenCalled()
    })

    test('should redirect to signup when Buy Now is clicked', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockUnauthenticatedSession
      })

      const buyNowButton = screen.getByText('Buy Now')
      await user.click(buyNowButton)

      expect(mockRedirectToSignup).toHaveBeenCalledWith('/cart')
      expect(mockAddToCart).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    test('should show loading text when session is loading', () => {
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockLoadingSession
      })

      expect(screen.getByText('Checking...')).toBeInTheDocument()
      expect(screen.getAllByText('Checking...')).toHaveLength(2) // Both buttons
    })

    test('should disable buttons when session is loading', () => {
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockLoadingSession
      })

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    test('should not process clicks when session is loading', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockLoadingSession
      })

      const addToCartButton = screen.getAllByRole('button')[0]
      await user.click(addToCartButton)

      expect(mockAddToCart).not.toHaveBeenCalled()
      expect(mockRedirectToSignup).not.toHaveBeenCalled()
    })
  })

  describe('Single Click Behavior', () => {
    test('should work with single click for authenticated users', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockAuthenticatedSession
      })

      const addToCartButton = screen.getByText('Add to Cart')
      
      // Single click should work
      await user.click(addToCartButton)
      
      expect(mockAddToCart).toHaveBeenCalledTimes(1)
    })

    test('should prevent action when session is loading', async () => {
      const user = userEvent.setup()
      
      renderWithProviders(<QuickAddToCart product={mockProduct} />, {
        sessionState: mockLoadingSession
      })

      const addToCartButton = screen.getAllByRole('button')[0]
      
      // Click should not work when loading
      await user.click(addToCartButton)
      
      expect(mockAddToCart).not.toHaveBeenCalled()
    })
  })
})
